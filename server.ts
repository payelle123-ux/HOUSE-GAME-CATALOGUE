import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp as initializeFirebaseApp, getApps as getFirebaseApps } from "firebase/app";
import {
  getFirestore as getClientFirestore,
  collection as fsCollection,
  doc as fsDoc,
  getDocs as fsGetDocs,
  getDoc as fsGetDoc,
  setDoc as fsSetDoc,
  limit as fsLimit,
  query as fsQuery,
  Firestore,
} from "firebase/firestore";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "2mb" }));

// ==================== SERVER-SIDE GEMINI CLIENT ====================
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// ==================== FIREBASE CONFIG & FIRESTORE REST ====================
interface FirebaseClientConfig {
  projectId: string;
  apiKey: string;
  firestoreDatabaseId?: string;
}

let firebaseConfig: FirebaseClientConfig | null = null;
try {
  const cfgPath = path.resolve(__dirname, "firebase-applet-config.json");
  if (fs.existsSync(cfgPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(cfgPath, "utf8")) as FirebaseClientConfig;
  }
} catch (err) {
  console.warn("[HOUSE GAME AI] Impossible de lire firebase-applet-config.json :", err);
}

let serverDb: Firestore | null = null;
function getServerFirestore(): Firestore | null {
  if (serverDb) return serverDb;
  if (!firebaseConfig?.projectId || !firebaseConfig?.apiKey) return null;
  try {
    const fbApp = getFirebaseApps().length === 0 ? initializeFirebaseApp(firebaseConfig) : getFirebaseApps()[0];
    serverDb =
      firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
        ? getClientFirestore(fbApp, firebaseConfig.firestoreDatabaseId)
        : getClientFirestore(fbApp);
    return serverDb;
  } catch (err) {
    console.warn("[HOUSE GAME AI] Impossible d'initialiser Firestore SDK :", err);
    return null;
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, fallbackValue: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallbackValue), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchFirestoreCollection(collectionName: string, pageSize = 150): Promise<any[]> {
  const db = getServerFirestore();
  if (!db) return [];
  try {
    const q = fsQuery(fsCollection(db, collectionName), fsLimit(pageSize));
    const snap = await withTimeout(fsGetDocs(q), 4500, null as any);
    if (!snap) {
      console.warn(`[HOUSE GAME AI] Timeout lecture collection ${collectionName}`);
      return [];
    }
    const items: any[] = [];
    snap.forEach((docSnap: any) => {
      const data = docSnap.data();
      items.push({ id: docSnap.id, ...data });
    });
    return items;
  } catch (err) {
    console.warn(`[HOUSE GAME AI] Erreur lecture collection ${collectionName}:`, err);
    return [];
  }
}

async function fetchFirestoreDoc(collectionName: string, docId: string): Promise<Record<string, any> | null> {
  const db = getServerFirestore();
  if (!db) return null;
  try {
    const snap = await withTimeout(fsGetDoc(fsDoc(db, collectionName, docId)), 4500, null as any);
    if (!snap || !snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.warn(`[HOUSE GAME AI] Erreur lecture document ${collectionName}/${docId}:`, err);
    return null;
  }
}

async function upsertFirestoreDoc(collectionName: string, docId: string, payload: Record<string, any>): Promise<boolean> {
  const db = getServerFirestore();
  if (!db) return false;
  try {
    const cleanId = docId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128);
    const sanitized = JSON.parse(JSON.stringify(payload));
    await fsSetDoc(fsDoc(db, collectionName, cleanId), sanitized, { merge: true });
    return true;
  } catch (err) {
    console.warn(`[HOUSE GAME AI] Erreur écriture ${collectionName}/${docId}:`, err);
    return false;
  }
}

// ==================== LIVE KNOWLEDGE BASE ASSEMBLY ====================
interface KnowledgeSnapshot {
  builtAt: number;
  aiConfig: {
    enabled: boolean;
    assistantName: string;
    welcomeMessage: string;
    personalityTone: string;
    fallbackWhatsappMessage: string;
    whatsappGroupInviteUrl?: string;
  };
  shopInfo: Record<string, any>;
  products: any[];
  repairServices: any[];
  events: any[];
  hgEventsOfficial: any[];
  tournaments: any[];
  rankings: any[];
  activities: any[];
  venuePhotos: any[];
  teamMembers: any[];
  customKnowledge: any[];
  contextText: string;
}

const KNOWLEDGE_CACHE_TTL_MS = 60_000;
const KNOWLEDGE_STALE_TTL_MS = 300_000;
let cachedKnowledge: KnowledgeSnapshot | null = null;
let knowledgeRefreshInFlight: Promise<KnowledgeSnapshot> | null = null;

async function refreshLiveKnowledgeNow(): Promise<KnowledgeSnapshot> {
  if (knowledgeRefreshInFlight) return knowledgeRefreshInFlight;
  knowledgeRefreshInFlight = (async () => {
    const now = Date.now();
    const [
      aiConfigDoc,
      shopInfoDoc,
      homeOverviewDoc,
      hgEventsDoc,
      products,
      repairServices,
      events,
      tournaments,
      rankings,
      activities,
      venuePhotos,
      teamMembers,
      customKnowledge,
    ] = await Promise.all([
      fetchFirestoreDoc("ai_config", "main"),
      fetchFirestoreDoc("settings", "housegame_info"),
      fetchFirestoreDoc("home_content", "overview"),
      fetchFirestoreDoc("home_content", "hg_events_official"),
      fetchFirestoreCollection("products", 150),
      fetchFirestoreCollection("repair_services", 80),
      fetchFirestoreCollection("events", 80),
      fetchFirestoreCollection("tournaments", 80),
      fetchFirestoreCollection("rankings", 80),
      fetchFirestoreCollection("activities", 50),
      fetchFirestoreCollection("venue_photos", 50),
      fetchFirestoreCollection("team_members", 50),
      fetchFirestoreCollection("ai_knowledge", 150),
    ]);

    const aiConfig = {
      enabled: aiConfigDoc?.enabled !== false,
      assistantName: aiConfigDoc?.assistantName || "HOUSE GAME AI",
      welcomeMessage:
        aiConfigDoc?.welcomeMessage ||
        "Bienvenue chez **HOUSE GAME** ! Je suis **HOUSE GAME AI**, votre assistant virtuel officiel. Découvrez notre Boutique, notre Atelier de réparation, nos Activités, nos Événements et l'Arène E-Sport !",
      personalityTone: aiConfigDoc?.personalityTone || "dynamique_pro",
      fallbackWhatsappMessage:
        aiConfigDoc?.fallbackWhatsappMessage ||
        "Cette information précise n'est pas encore renseignée dans notre base officielle. Tu peux contacter directement notre équipe sur WhatsApp pour obtenir une réponse immédiate !",
      whatsappGroupInviteUrl: aiConfigDoc?.whatsappGroupInviteUrl || "",
    };

  const shopInfo = {
    name: shopInfoDoc?.name || "HOUSE GAME",
    slogan: shopInfoDoc?.slogan || "La qualité n'a pas de prix",
    phone: shopInfoDoc?.phone || "+237 658 413 269",
    whatsapp: shopInfoDoc?.whatsapp || "+237 658 413 269",
    email: shopInfoDoc?.email || "mankolo1974@gmail.com",
    address: shopInfoDoc?.address || "Derrière Total Jouvence",
    city: shopInfoDoc?.city || "Yaoundé - Cameroun",
    openingHours: shopInfoDoc?.openingHours || "Lundi - Samedi : 08h30 - 20h00",
    currency: shopInfoDoc?.currency || "FCFA",
    phonePayelle: shopInfoDoc?.phonePayelle || "",
    phoneGaetan: shopInfoDoc?.phoneGaetan || "",
    phoneFlorence: shopInfoDoc?.phoneFlorence || "",
    note: shopInfoDoc?.note || "",
  };

  const hgEventsOfficial = Array.isArray(hgEventsDoc?.items) ? hgEventsDoc.items : [];
  const activeCustomKnowledge = customKnowledge.filter((item) => item.isActive !== false);

  const lines: string[] = [];
  lines.push("=== 1. IDENTITÉ & COORDONNÉES OFFICIELLES HOUSE GAME ===");
  lines.push(`Nom : ${shopInfo.name} | Slogan : ${shopInfo.slogan}`);
  lines.push(`Adresse : ${shopInfo.address}, ${shopInfo.city}`);
  lines.push(`Horaires d'ouverture : ${shopInfo.openingHours}`);
  lines.push(`Téléphone / WhatsApp officiel : ${shopInfo.whatsapp}`);
  if (shopInfo.email) lines.push(`Email : ${shopInfo.email}`);
  if (shopInfo.phonePayelle || shopInfo.phoneGaetan || shopInfo.phoneFlorence) {
    lines.push(
      `Contacts équipe commerciale : ${[
        shopInfo.phonePayelle ? `Payelle (${shopInfo.phonePayelle})` : "",
        shopInfo.phoneGaetan ? `Gaëtan (${shopInfo.phoneGaetan})` : "",
        shopInfo.phoneFlorence ? `Florence (${shopInfo.phoneFlorence})` : "",
      ]
        .filter(Boolean)
        .join(", ")}`
    );
  }
  if (shopInfo.note) lines.push(`Note boutique : ${shopInfo.note}`);
  if (homeOverviewDoc?.aboutText) lines.push(`Présentation Qui sommes-nous : ${homeOverviewDoc.aboutText}`);
  if (homeOverviewDoc?.socialLinks) {
    const s = homeOverviewDoc.socialLinks;
    lines.push(
      `Réseaux sociaux : Facebook=${s.facebook || "non renseigné"}, Instagram=${s.instagram || "non renseigné"}, TikTok=${s.tiktok || "non renseigné"}`
    );
  }

  lines.push("\n=== 2. RUBRIQUES DU SITE WEB HOUSE GAME ===");
  lines.push(
    "- home (ACCUEIL) : Présentation générale, partenaires, réseaux sociaux.\n" +
      "- about (QUI SOMMES-NOUS) : Histoire, photos de la salle et équipe.\n" +
      "- shop (BOUTIQUE) : Catalogue consoles, manettes, jeux vidéo, accessoires, promo, panier et commande WhatsApp.\n" +
      "- activities (NOS ACTIVITES) : Expériences sur place (VR, consoles next-gen, rétro gaming, Just Dance, coworking fibre).\n" +
      "- events (HG EVENT) : Événements officiels HOUSE GAME (Apéro Gaming, House Game Day, HG Challenge, Afro-Respawn, etc.).\n" +
      "- campus (HG CAMPUS) : Formations gaming, développement, design & ateliers numériques.\n" +
      "- service (HG SERVICE) : Réparation atelier, maintenance, services numériques, abonnements.\n" +
      "- esport (ESPORT) : Tournois officiels, inscriptions en ligne, licences joueurs et classements automatiques."
  );

  lines.push(`\n=== 3. BOUTIQUE & CATALOGUE PRODUITS (${products.length} articles) ===`);
  if (products.length === 0) {
    lines.push("Aucun article répertorié actuellement dans la base Firestore.");
  } else {
    for (const p of products.slice(0, 80)) {
      const stockLabel = p.inStock === false ? "Rupture de stock" : "En stock";
      const promoLabel = p.originalPrice ? ` (Prix barré : ${p.originalPrice} ${shopInfo.currency})` : "";
      const badgeLabel = p.badge ? ` [${p.badge}]` : "";
      const specsLabel = Array.isArray(p.specs) && p.specs.length > 0 ? ` | Specs: ${p.specs.join(", ")}` : "";
      lines.push(
        `- [ID:${p.id}] ${p.name}${badgeLabel} | Catégorie: ${p.category} | Prix: ${p.price} ${shopInfo.currency}${promoLabel} | Statut: ${stockLabel}${specsLabel} | Desc: ${String(p.description || "").slice(0, 180)}`
      );
    }
  }

  lines.push(`\n=== 4. ATELIER RÉPARATION & SERVICES (${repairServices.length} forfaits) ===`);
  if (repairServices.length === 0) {
    lines.push("Aucun forfait de réparation enregistré actuellement.");
  } else {
    for (const r of repairServices) {
      lines.push(
        `- ${r.title} (${r.category || "Atelier"}) | Prix: ${r.price} | Délai: ${r.delay} | ${String(r.description || "").slice(0, 160)}`
      );
    }
  }

  lines.push(`\n=== 5. ACTIVITÉS SUR PLACE (${activities.length}) ===`);
  for (const act of activities) {
    const priceText = act.price?.amount ? ` | Tarif: ${act.price.label || ""} ${act.price.amount} ${act.price.period || ""}` : "";
    lines.push(`- ${act.title} (${act.category})${priceText} : ${String(act.description || "").slice(0, 180)}`);
  }

  lines.push(`\n=== 6. COMPÉTITIONS & TOURNOIS ESPORT (${tournaments.length}) ===`);
  if (tournaments.length === 0) {
    lines.push("Aucun tournoi programmé actuellement.");
  } else {
    for (const t of tournaments) {
      lines.push(
        `- [ID:${t.id}] ${t.title} | Jeu: ${t.game} | Cash Prize: ${t.cashPrize} | Frais d'entrée: ${t.entryFee} | Date: ${t.date} à ${t.time} | Lieu: ${t.location} | Places: ${t.currentSlots || 0}/${t.maxSlots || "?"} | Plateforme: ${t.platform} | Statut: ${t.status}`
      );
    }
  }

  lines.push(`\n=== 7. CLASSEMENTS ESPORT PUBLIÉS (${rankings.filter((r) => r.isPublished).length}) ===`);
  for (const rk of rankings.filter((r) => r.isPublished)) {
    const top3 = Array.isArray(rk.entries)
      ? rk.entries
          .slice(0, 5)
          .map((e: any) => `#${e.position} ${e.gamerTag} (${e.points ?? 0} pts, ${e.wins ?? 0}V-${e.losses ?? 0}D)`)
          .join(" ; ")
      : "";
    lines.push(`- ${rk.tournamentTitle} (${rk.game}) : Top classement -> ${top3 || "Classement en attente"}`);
  }

  lines.push(`\n=== 8. ÉVÉNEMENTS & HG EVENT (${events.length + hgEventsOfficial.length}) ===`);
  for (const ev of events) {
    lines.push(`- ${ev.title} | Date: ${ev.date} ${ev.time} | Lieu: ${ev.location} | Entrée: ${ev.entry} | Statut: ${ev.status}`);
  }
  for (const hgEv of hgEventsOfficial) {
    const nextInfo =
      hgEv.hasScheduledEvent && hgEv.nextEdition
        ? ` | PROCHAINE ÉDITION: ${hgEv.nextEdition.title} le ${hgEv.nextEdition.date} à ${hgEv.nextEdition.time} (${hgEv.nextEdition.location}) - Entrée: ${hgEv.nextEdition.entryFee || "À confirmer"}`
        : "";
    lines.push(`- Concept HG Event : ${hgEv.title} — ${String(hgEv.definition || "").slice(0, 150)}${nextInfo}`);
  }

  if (teamMembers.length > 0) {
    lines.push(`\n=== 9. ÉQUIPE HOUSE GAME (${teamMembers.length} membres) ===`);
    for (const m of teamMembers) {
      lines.push(`- ${m.name} : ${m.role}${m.department ? ` (${m.department})` : ""}`);
    }
  }

  if (venuePhotos.length > 0) {
    lines.push(`\n=== 10. ESPACES & GALERIE SALLE (${venuePhotos.length} photos) ===`);
    for (const vp of venuePhotos.slice(0, 12)) {
      lines.push(`- ${vp.title}${vp.subtitle ? ` : ${vp.subtitle}` : ""}`);
    }
  }

  if (activeCustomKnowledge.length > 0) {
    lines.push(`\n=== 11. BASE DE CONNAISSANCES PERSONNALISÉE ADMIN (${activeCustomKnowledge.length} entrées) ===`);
    for (const item of activeCustomKnowledge) {
      lines.push(`- [${String(item.category || "faq").toUpperCase()}] ${item.title} : ${item.content}`);
    }
  }

    const snapshot: KnowledgeSnapshot = {
      builtAt: now,
      aiConfig,
      shopInfo,
      products,
      repairServices,
      events,
      hgEventsOfficial,
      tournaments,
      rankings,
      activities,
      venuePhotos,
      teamMembers,
      customKnowledge: activeCustomKnowledge,
      contextText: lines.join("\n"),
    };

    cachedKnowledge = snapshot;
    return snapshot;
  })().finally(() => {
    knowledgeRefreshInFlight = null;
  });

  return knowledgeRefreshInFlight;
}

async function buildLiveKnowledgeContext(forceRefresh = false): Promise<KnowledgeSnapshot> {
  const now = Date.now();
  if (!forceRefresh && cachedKnowledge) {
    const age = now - cachedKnowledge.builtAt;
    if (age < KNOWLEDGE_CACHE_TTL_MS) {
      return cachedKnowledge;
    }
    if (age < KNOWLEDGE_STALE_TTL_MS) {
      // Stale-while-revalidate: serve immediately and refresh in background
      void refreshLiveKnowledgeNow().catch((err) =>
        console.warn("[HOUSE GAME AI] Background knowledge refresh error:", err)
      );
      return cachedKnowledge;
    }
  }
  return refreshLiveKnowledgeNow();
}

function getToneInstruction(tone: string): string {
  if (tone === "expert_gaming") {
    return "Adopte un ton d'expert gaming & e-sport passionné, précis sur le matériel et les compétitions, tout en restant courtois et professionnel.";
  }
  if (tone === "conseiller_commercial") {
    return "Adopte un ton de conseiller commercial chaleureux, orienté service client, clarté des prix, et accompagnement à la commande.";
  }
  return "Adopte un ton accueillant, dynamique, professionnel et passionné par l'univers gaming.";
}

function sanitizeChatContents(
  history: Array<{ sender: string; text: string }> | undefined,
  currentMessage: string,
  currentTab: string
): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  const rawTurns: Array<{ role: "user" | "model"; text: string }> = [];

  if (Array.isArray(history)) {
    const recent = history.slice(-10);
    for (const item of recent) {
      const text = String(item?.text || "").trim();
      if (!text) continue;
      rawTurns.push({
        role: item?.sender === "user" ? "user" : "model",
        text: text.slice(0, 1500),
      });
    }
  }

  // Avoid duplicating the current message if the client included it at the end of history
  const normalizedCurrent = currentMessage.trim();
  while (
    rawTurns.length > 0 &&
    rawTurns[rawTurns.length - 1].role === "user" &&
    rawTurns[rawTurns.length - 1].text.trim() === normalizedCurrent
  ) {
    rawTurns.pop();
  }

  // Gemini requires contents to start with a "user" turn
  while (rawTurns.length > 0 && rawTurns[0].role === "model") {
    rawTurns.shift();
  }

  // Append current user turn with active tab context
  rawTurns.push({
    role: "user",
    text: `[Onglet actuel du visiteur : "${currentTab || "home"}"]\nMessage : ${normalizedCurrent}`,
  });

  // Merge consecutive turns of the same role so user/model alternate strictly
  const alternating: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  for (const turn of rawTurns) {
    const prev = alternating[alternating.length - 1];
    if (prev && prev.role === turn.role) {
      prev.parts[0].text = `${prev.parts[0].text}\n\n${turn.text}`;
    } else {
      alternating.push({
        role: turn.role,
        parts: [{ text: turn.text }],
      });
    }
  }

  return alternating;
}

function classifyGeminiError(err: any): { status: number; code: string; message: string; retryable: boolean } {
  const rawStatus = Number(err?.status || err?.statusCode || err?.code || 0);
  const rawMsg = String(err?.message || "");
  const lower = rawMsg.toLowerCase();

  if (rawStatus === 400 || lower.includes("api_key_invalid") || lower.includes("invalid argument")) {
    if (lower.includes("api key") || lower.includes("api_key_invalid")) {
      return {
        status: 400,
        code: "API_KEY_INVALID",
        message: "Clé API Gemini invalide. Vérifiez GEMINI_API_KEY dans Settings > Secrets.",
        retryable: false,
      };
    }
    return {
      status: 400,
      code: "BAD_REQUEST",
      message: `Requête IA refusée : ${rawMsg.slice(0, 180)}`,
      retryable: false,
    };
  }
  if (rawStatus === 403 || lower.includes("permission_denied")) {
    return {
      status: 403,
      code: "PERMISSION_DENIED",
      message: "Accès Gemini refusé (403). Vérifiez la clé API dans Settings > Secrets.",
      retryable: false,
    };
  }
  if (rawStatus === 404 || lower.includes("not_found")) {
    return {
      status: 404,
      code: "MODEL_NOT_FOUND",
      message: "Modèle Gemini introuvable (404).",
      retryable: false,
    };
  }
  if (rawStatus === 429 || lower.includes("resource_exhausted") || lower.includes("quota")) {
    return {
      status: 429,
      code: "RESOURCE_EXHAUSTED",
      message: "Limite de requêtes IA temporairement atteinte. Réessayez dans quelques secondes ou contactez-nous sur WhatsApp.",
      retryable: true,
    };
  }
  return {
    status: 502,
    code: "GEMINI_UPSTREAM_ERROR",
    message: "Le service IA met du temps à répondre ou est momentanément perturbé. Réessayez dans un instant.",
    retryable: true,
  };
}

async function generateChatWithRetry(params: {
  systemInstruction: string;
  contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>;
}) {
  if (!ai) throw new Error("Gemini client not initialized");

  const runModel = async (modelName: string, useLowThinking: boolean) => {
    const config: Record<string, any> = {
      systemInstruction: params.systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: {
            type: Type.STRING,
            description: "Réponse naturelle, concise et professionnelle en français (Markdown léger autorisé avec **gras** et puces •).",
          },
          suggestedTab: {
            type: Type.STRING,
            enum: ["home", "about", "shop", "activities", "events", "campus", "service", "esport", "none"],
            description: "ID d'onglet recommandé parmi home, about, shop, activities, events, campus, service, esport, ou 'none' si aucun.",
          },
          unanswered: {
            type: Type.BOOLEAN,
            description: "true si la réponse réelle manque dans la base de connaissances officielle.",
          },
          needsWhatsappHandoff: {
            type: Type.BOOLEAN,
            description: "true si une assistance humaine via WhatsApp est recommandée.",
          },
        },
        required: ["reply", "suggestedTab", "unanswered", "needsWhatsappHandoff"],
      },
    };
    if (useLowThinking) {
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
    }

    return ai.models.generateContent({
      model: modelName,
      contents: params.contents,
      config,
    });
  };

  try {
    return await runModel("gemini-4-hydrogen", true);
  } catch (firstErr: any) {
    const classified = classifyGeminiError(firstErr);
    console.warn(`[HOUSE GAME AI] Premier essai gemini-4-hydrogen échoué (${classified.code}):`, firstErr?.message);
    if (!classified.retryable) throw firstErr;
    await new Promise((r) => setTimeout(r, 500));
    try {
      return await runModel("gemini-3.1-flash-lite", false);
    } catch (secondErr) {
      console.warn("[HOUSE GAME AI] Second essai gemini-3.1-flash-lite échoué:", secondErr);
      throw firstErr;
    }
  }
}

async function runHouseGameAiChat(params: {
  message: string;
  history?: Array<{ sender: string; text: string }>;
  currentTab?: string;
}) {
  const snapshot = await buildLiveKnowledgeContext(false);

  if (!snapshot.aiConfig.enabled) {
    return {
      status: 200,
      body: {
        disabled: true,
        reply: `L'assistant **${snapshot.aiConfig.assistantName}** est temporairement désactivé par l'administration. Pour toute demande immédiate, contacte notre équipe directement sur WhatsApp au **${snapshot.shopInfo.whatsapp}**.`,
        suggestedTab: null,
        unanswered: false,
        needsWhatsappHandoff: true,
        source: "config",
      },
    };
  }

  if (!ai) {
    return {
      status: 503,
      body: {
        error: "Service IA indisponible : la variable d'environnement GEMINI_API_KEY n'est pas configurée côté serveur.",
        code: "MISSING_GEMINI_API_KEY",
      },
    };
  }

  const systemInstruction = `Tu es ${snapshot.aiConfig.assistantName}, l'assistant virtuel officiel et autonome de l'entreprise HOUSE GAME.
${getToneInstruction(snapshot.aiConfig.personalityTone)}

MISSION :
- Accueillir les visiteurs avec bienveillance et professionnalisme.
- Répondre aux questions en langage naturel en français (comprendre les abréviations, le langage gamer et les fautes d'orthographe).
- Orienter efficacement vers les rubriques du site : home (ACCUEIL), about (QUI SOMMES-NOUS), shop (BOUTIQUE), activities (NOS ACTIVITES), events (HG EVENT), campus (HG CAMPUS), service (HG SERVICE), esport (ESPORT).
- Présenter les produits, services, horaires, adresses, événements et tournois e-sport réels.
- Accompagner dans le processus de commande (ajout au panier en Boutique et finalisation sur WhatsApp ${snapshot.shopInfo.whatsapp}).
- Rediriger vers WhatsApp humain lorsqu'une assistance humaine, négociation, vérification de disponibilité en temps réel ou prise en charge spécifique est nécessaire.

RÈGLES STRICTES ANTI-HALLUCINATION (OBLIGATOIRES) :
1. Utilise EXCLUSIVEMENT les données factuelles ci-dessous issues de la base officielle HOUSE GAME en temps réel.
2. N'INVENTE JAMAIS de prix, de produit, de stock, d'horaire, de promotion, de tournoi, de date ou de téléphone absent du contexte.
3. Si une information précise demandée par l'utilisateur n'est PAS dans la base ci-dessous, indique honnêtement qu'elle n'est pas encore renseignée sur le site, mets "unanswered": true et "needsWhatsappHandoff": true, et invite chaleureusement à contacter l'équipe sur WhatsApp (${snapshot.shopInfo.whatsapp}).
4. Sois concis, structuré (puces courtes si utile), sans blabla inutile, et propose la rubrique la plus pertinente dans "suggestedTab" (ou "none" si aucune).

BASE DE CONNAISSANCES OFFICIELLE EN TEMPS RÉEL :
${snapshot.contextText}`;

  const contents = sanitizeChatContents(params.history, params.message, params.currentTab || "home");

  const response = await generateChatWithRetry({
    systemInstruction,
    contents,
  });

  const rawText = (response.text || "{}").trim();
  let parsed: {
    reply?: string;
    suggestedTab?: string | null;
    unanswered?: boolean;
    needsWhatsappHandoff?: boolean;
  } = {};

  try {
    parsed = JSON.parse(rawText);
  } catch {
    const cleaned = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        reply: rawText,
        suggestedTab: null,
        unanswered: false,
        needsWhatsappHandoff: false,
      };
    }
  }

  const validTabs = new Set(["home", "about", "shop", "activities", "events", "campus", "service", "esport"]);
  const suggestedTab = parsed.suggestedTab && validTabs.has(parsed.suggestedTab) ? parsed.suggestedTab : null;

  return {
    status: 200,
    body: {
      reply: parsed.reply || snapshot.aiConfig.fallbackWhatsappMessage,
      suggestedTab,
      unanswered: Boolean(parsed.unanswered),
      needsWhatsappHandoff: Boolean(parsed.needsWhatsappHandoff),
      source: "gemini",
      assistantName: snapshot.aiConfig.assistantName,
    },
  };
}

// ==================== HEALTH & KNOWLEDGE ENDPOINTS ====================
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    aiEnabled: Boolean(ai),
    whatsappConfigured: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
    whatsappVerifyConfigured: Boolean(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN),
    serverTime: new Date().toISOString(),
  });
});

app.post("/api/ai/knowledge/refresh", async (_req: Request, res: Response) => {
  try {
    const snapshot = await buildLiveKnowledgeContext(true);
    return res.json({
      ok: true,
      refreshedAt: snapshot.builtAt,
      counts: {
        products: snapshot.products.length,
        repairServices: snapshot.repairServices.length,
        events: snapshot.events.length + snapshot.hgEventsOfficial.length,
        tournaments: snapshot.tournaments.length,
        rankings: snapshot.rankings.length,
        activities: snapshot.activities.length,
        venuePhotos: snapshot.venuePhotos.length,
        teamMembers: snapshot.teamMembers.length,
        customKnowledge: snapshot.customKnowledge.length,
      },
    });
  } catch (err: any) {
    console.error("[HOUSE GAME AI] Refresh knowledge error:", err);
    return res.status(500).json({ error: "Impossible d'actualiser l'index IA", details: err?.message });
  }
});

// ==================== CHAT AI ENDPOINT ====================
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [], currentTab = "home" } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Message manquant" });
    }

    const result = await runHouseGameAiChat({
      message: message.trim().slice(0, 2000),
      history,
      currentTab,
    });

    return res.status(result.status).json(result.body);
  } catch (error: any) {
    const classified = classifyGeminiError(error);
    console.error("[HOUSE GAME AI] Chat error:", error);
    return res.status(classified.status).json({
      error: classified.message,
      code: classified.code,
      details: error?.message || "Erreur inconnue",
    });
  }
});

// ==================== MARKETING STUDIO AI ENDPOINT ====================
app.post("/api/ai/marketing/generate", async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: "Service IA indisponible : GEMINI_API_KEY non configurée sur le serveur.",
        code: "MISSING_GEMINI_API_KEY",
      });
    }

    const {
      channel = "whatsapp_group",
      objective = "promo",
      tone = "Dynamique & Gamer",
      customBrief = "",
      selectedProductIds = [],
      selectedTournamentIds = [],
      selectedEventIds = [],
    } = req.body || {};

    const snapshot = await buildLiveKnowledgeContext(false);

    const pickedProducts = snapshot.products.filter((p) => Array.isArray(selectedProductIds) && selectedProductIds.includes(p.id));
    const pickedTournaments = snapshot.tournaments.filter((t) => Array.isArray(selectedTournamentIds) && selectedTournamentIds.includes(t.id));
    const pickedEvents = snapshot.events.filter((e) => Array.isArray(selectedEventIds) && selectedEventIds.includes(e.id));

    const focusBlock = [
      pickedProducts.length > 0
        ? `PRODUITS SÉLECTIONNÉS:\n${pickedProducts
            .map((p) => `- ${p.name} : ${p.price} ${snapshot.shopInfo.currency}${p.originalPrice ? ` (au lieu de ${p.originalPrice})` : ""} | ${p.description}`)
            .join("\n")}`
        : "",
      pickedTournaments.length > 0
        ? `TOURNOIS SÉLECTIONNÉS:\n${pickedTournaments
            .map((t) => `- ${t.title} (${t.game}) | Cash Prize: ${t.cashPrize} | Entrée: ${t.entryFee} | Date: ${t.date} ${t.time} | Lieu: ${t.location}`)
            .join("\n")}`
        : "",
      pickedEvents.length > 0
        ? `ÉVÉNEMENTS SÉLECTIONNÉS:\n${pickedEvents
            .map((e) => `- ${e.title} | Date: ${e.date} ${e.time} | Lieu: ${e.location} | Entrée: ${e.entry}`)
            .join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const channelRules: Record<string, string> = {
      whatsapp_group:
        "Format Message Groupe WhatsApp : percutant, aéré avec puces et gras WhatsApp (*texte*), appel à l'action clair vers l'adresse et le WhatsApp officiel.",
      facebook:
        "Format Post Facebook : storytelling engageant de 8 à 12 lignes max, clair sur les avantages, coordonnées et CTA commande/inscription.",
      tiktok:
        "Format Script & Légende TikTok : hook vidéo des 3 premières secondes + script court dynamique + légende virale avec hashtags gaming.",
      instagram:
        "Format Post/Reel Instagram : accroche visuelle forte, texte concis rythmé, appel à l'action en bio/DM/WhatsApp et hashtags ciblés.",
    };

    const prompt = `Rédige une publication marketing officielle pour HOUSE GAME (${snapshot.shopInfo.address}, ${snapshot.shopInfo.city}).
Canal ciblé : ${channel} (${channelRules[channel] || channelRules.whatsapp_group})
Objectif : ${objective}
Ton souhaité : ${tone}
Consigne complémentaire de l'administrateur : ${customBrief || "Aucune consigne supplémentaire."}

${focusBlock ? `ÉLÉMENTS PRIORITAIRES CHOISIS PAR L'ADMIN:\n${focusBlock}\n` : ""}
CONTEXTE OFFICIEL COMPLET HOUSE GAME (utilise uniquement ces vrais chiffres, prix, dates, contacts) :
${snapshot.contextText}

RÈGLE ABSOLUE : N'invente aucun prix, aucune réduction chiffrée, aucune date ni aucun produit qui ne figurent pas dans les données ci-dessus. Inclue le contact WhatsApp officiel (${snapshot.shopInfo.whatsapp}) et l'adresse (${snapshot.shopInfo.address}).`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Titre interne court de la campagne (max 100 caractères)." },
            content: { type: Type.STRING, description: "Texte complet prêt à être publié ou copié." },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Liste de 3 à 6 hashtags pertinents sans espaces.",
            },
            linkedEntityLabel: {
              type: Type.STRING,
              description: "Nom court du produit, tournoi ou événement mis en avant.",
            },
          },
          required: ["title", "content", "hashtags", "linkedEntityLabel"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      title: String(parsed.title || "Campagne HOUSE GAME").slice(0, 180),
      content: String(parsed.content || "").slice(0, 5000),
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, 10) : ["#HouseGame", "#GamingCameroun"],
      linkedEntityLabel: String(parsed.linkedEntityLabel || "HOUSE GAME"),
    });
  } catch (error: any) {
    console.error("[HOUSE GAME AI] Marketing generation error:", error);
    return res.status(500).json({
      error: "Erreur lors de la génération marketing IA",
      details: error?.message || "Erreur inconnue",
    });
  }
});

// ==================== WHATSAPP BUSINESS CLOUD API ====================
const GRAPH_API_VERSION = "v21.0";

function getWhatsappCredentials() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "";
  return {
    accessToken,
    phoneNumberId,
    verifyToken,
    configured: Boolean(accessToken && phoneNumberId),
  };
}

async function sendOfficialWhatsappText(toPhone: string, bodyText: string) {
  const creds = getWhatsappCredentials();
  if (!creds.configured) {
    return {
      ok: false,
      status: 503,
      error: "Identifiants Meta WhatsApp Business Cloud API non configurés (WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID requis).",
    };
  }

  const normalizedTo = toPhone.replace(/[^0-9]/g, "");
  if (!normalizedTo || normalizedTo.length < 8) {
    return {
      ok: false,
      status: 400,
      error: "Numéro destinataire WhatsApp invalide (format international requis, ex: 237658413269).",
    };
  }

  const endpoint = `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(creds.phoneNumberId)}/messages`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizedTo,
      type: "text",
      text: {
        preview_url: false,
        body: bodyText.slice(0, 4096),
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data?.error?.message || "Échec de l'envoi via Meta Graph API",
      details: data,
    };
  }

  return { ok: true, status: 200, data };
}

app.get("/api/whatsapp/status", (_req: Request, res: Response) => {
  const creds = getWhatsappCredentials();
  res.json({
    connected: creds.configured,
    hasAccessToken: Boolean(creds.accessToken),
    hasPhoneNumberId: Boolean(creds.phoneNumberId),
    hasVerifyToken: Boolean(creds.verifyToken),
    webhookPath: "/api/whatsapp/webhook",
    graphApiVersion: GRAPH_API_VERSION,
  });
});

// Meta Webhook Verification
app.get("/api/whatsapp/webhook", (req: Request, res: Response) => {
  const creds = getWhatsappCredentials();
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (!creds.verifyToken) {
    return res.status(503).send("WHATSAPP_WEBHOOK_VERIFY_TOKEN non configuré");
  }

  if (mode === "subscribe" && token === creds.verifyToken) {
    return res.status(200).send(String(challenge || ""));
  }

  return res.sendStatus(403);
});

// Meta Webhook Incoming 1-to-1 Messages
app.post("/api/whatsapp/webhook", async (req: Request, res: Response) => {
  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messageObj = value?.messages?.[0];
    const contactObj = value?.contacts?.[0];

    if (!messageObj || messageObj.type !== "text") {
      return res.sendStatus(200);
    }

    const fromPhone = String(messageObj.from || "").replace(/[^0-9]/g, "");
    const incomingText = String(messageObj.text?.body || "").trim();
    const senderName = String(contactObj?.profile?.name || `WhatsApp +${fromPhone}`).slice(0, 110);

    if (!fromPhone || !incomingText) {
      return res.sendStatus(200);
    }

    const convId = `wa_${fromPhone}`.slice(0, 120);
    const existingConv = await fetchFirestoreDoc("ai_conversations", convId);
    const existingMessages = Array.isArray(existingConv?.messages) ? existingConv.messages : [];

    const aiResult = await runHouseGameAiChat({
      message: incomingText,
      history: existingMessages.slice(-6).map((m: any) => ({ sender: m.sender, text: m.text })),
      currentTab: "whatsapp",
    });

    const now = Date.now();
    const userMsg = {
      id: `wa_u_${now}`,
      sender: "user",
      text: incomingText.slice(0, 2000),
      timestamp: now,
    };

    const replyText =
      aiResult.status === 200 && aiResult.body?.reply
        ? String(aiResult.body.reply)
        : "Merci pour votre message chez HOUSE GAME ! Notre assistant IA est momentanément indisponible, un conseiller va vous répondre très vite.";

    const aiMsg = {
      id: `wa_a_${now + 1}`,
      sender: "ai",
      text: replyText.slice(0, 3000),
      timestamp: now + 1,
      unanswered: Boolean(aiResult.body?.unanswered),
      needsWhatsappHandoff: Boolean(aiResult.body?.needsWhatsappHandoff),
      source: "gemini",
    };

    const updatedMessages = [...existingMessages, userMsg, aiMsg].slice(-150);
    const prevUnanswered = Array.isArray(existingConv?.unansweredQuestions) ? existingConv.unansweredQuestions : [];
    const unansweredQuestions = aiResult.body?.unanswered
      ? [...prevUnanswered, incomingText.slice(0, 240)].slice(-30)
      : prevUnanswered;

    await upsertFirestoreDoc("ai_conversations", convId, {
      id: convId,
      visitorLabel: senderName,
      channel: "whatsapp",
      status: aiResult.body?.needsWhatsappHandoff ? "transferred" : "active",
      startedAt: existingConv?.startedAt || now,
      updatedAt: now,
      messageCount: updatedMessages.length,
      hasUnanswered: unansweredQuestions.length > 0,
      unansweredQuestions,
      messages: updatedMessages,
    });

    // Send 1-to-1 reply via official Cloud API if credentials configured
    await sendOfficialWhatsappText(fromPhone, replyText.replace(/\*\*/g, "*"));

    return res.sendStatus(200);
  } catch (err) {
    console.error("[HOUSE GAME AI] WhatsApp webhook error:", err);
    return res.sendStatus(200);
  }
});

// Admin 1-to-1 Official Cloud API Send Endpoint
app.post("/api/whatsapp/send", async (req: Request, res: Response) => {
  try {
    const { recipientPhone, message } = req.body || {};
    if (!recipientPhone || !message) {
      return res.status(400).json({ error: "Numéro destinataire et message requis." });
    }

    const result = await sendOfficialWhatsappText(String(recipientPhone), String(message));
    if (!result.ok) {
      return res.status(result.status).json({ error: result.error, details: result.details });
    }
    return res.json({ ok: true, data: result.data });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Erreur WhatsApp Cloud API" });
  }
});

// ==================== VITE DEV / PROD STATIC SERVER ====================
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, "dist");
    app.use(
      express.static(distDir, {
        setHeaders: (res, filePath) => {
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
          }
        },
      })
    );
    app.get("*", (_req: Request, res: Response) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.resolve(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HOUSE GAME] Serveur Full-Stack opérationnel sur http://0.0.0.0:${PORT}`);
    // Pre-warm live knowledge cache on boot so first visitor chat is instant
    setTimeout(() => {
      buildLiveKnowledgeContext(true).catch((err) =>
        console.warn("[HOUSE GAME AI] Initial warmup warning:", err)
      );
    }, 200);
  });
}

startServer();
