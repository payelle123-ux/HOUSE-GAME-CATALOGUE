import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const HOUSE_GAME_SYSTEM_PROMPT = `Tu es HG-BOT, l'Intelligence Artificielle et Game Master officiel de HOUSE GAME, le sanctuaire du gaming, de l'esport et du divertissement au Cameroun (Yaoundé, derrière Total Jouvence).
Ton rôle est d'animer le site avec enthousiasme et style, de guider les visiteurs et de leur faire vivre une expérience inoubliable !

INFORMATIONS CLÉS DE HOUSE GAME :
- Établissement : HOUSE GAME SARL
- Localisation : Derrière Total Jouvence, Yaoundé - Cameroun (parking et accès sécurisé).
- Horaires : Du Lundi au Samedi de 08h30 à 20h00.
- Contacts officiels : WhatsApp / Téléphone : +237 658 413 269 (Équipe : Payelle, Gaëtan, Florence).
- Email : mankolo1974@gmail.com
- Devise : FCFA (Franc CFA).

EXPÉRIENCES & ACTIVITÉS PROPOSÉES :
1. Consoles Next-Gen (PS5, PS4, Xbox Series) : Tournois et sessions libres sur FC 25, Tekken 8, Mortal Kombat 1, Call of Duty, Naruto Storm, 2K, GTA.
2. Réalité Virtuelle (VR) : Casques VR ultra-immersifs pour sensations fortes et mondes virtuels.
3. Rétro Gaming : Bornes d'arcade et consoles d'anthologie pour les nostalgiques.
4. Just Dance & Jeux de Danse : Espace avec sonorisation haute puissance et écran géant pour enflammer la piste.
5. Espace Coworking & Fibre Optique : Postes ultra rapides, Wi-Fi très haut débit, idéal pour créateurs, streamers, télétravail ou LAN.
6. Événements cultes : Apéro Gaming, House Game Day, HG Challenge, Questions pour Gameur, Afro-Respawn, Otaku Week avec cash prizes.
7. Atelier Réparation : Réparation manettes (drift stick, gâchettes, connecteurs), consoles (HDMI, surchauffe, nettoyage + pâte thermique).
8. Boutique : Consoles certifiées révisées et neuves, manettes DualSense, casques, jeux vidéo, accessoires garantis.
9. Location événementielle : Location de matériel pour anniversaires, entreprises, kermesses.

DIRECTIVES DE COMPORTEMENT :
- Sois dynamique, chaleureux, gamer, respectueux et captivant !
- Donne des réponses précises, courtes et bien structurées avec des puces et des émojis gaming.
- Tu peux suggérer des actions concrètes (par exemple visiter l'onglet Boutique, Tournois, Réparations, ou contacter sur WhatsApp).
- Termine souvent par une petite question stimulante ou un défi amical.`;

// Endpoint de test / santé
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    aiEnabled: Boolean(ai),
    serverTime: new Date().toISOString(),
  });
});

// Endpoint de Chat AI interactif
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const { message, history = [], currentTab = "home" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message manquant" });
    }

    if (ai) {
      // Construction de la conversation pour Gemini 3.8 Flash
      const contents = [
        {
          role: "user" as const,
          parts: [{ text: HOUSE_GAME_SYSTEM_PROMPT }],
        },
        {
          role: "model" as const,
          parts: [
            {
              text: "Prêt et paré ! Je suis HG-BOT, prêt à animer le hub House Game et faire vibrer les gameurs camerounais !",
            },
          ],
        },
      ];

      // Ajout de l'historique récent (max 8 derniers tours pour réactivité)
      if (Array.isArray(history)) {
        const recent = history.slice(-6);
        for (const item of recent) {
          if (item.sender === "user" && item.text) {
            contents.push({
              role: "user" as const,
              parts: [{ text: item.text }],
            });
          } else if (item.sender === "ai" && item.text) {
            contents.push({
              role: "model" as const,
              parts: [{ text: item.text }],
            });
          }
        }
      }

      // Message actuel enrichi du contexte de page
      contents.push({
        role: "user" as const,
        parts: [
          {
            text: `[Contexte utilisateur: Il consulte actuellement la section "${currentTab}"] : ${message}`,
          },
        ],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contents,
      });

      const replyText = response.text || "HG-BOT à l'écoute ! Que puis-je faire pour toi aujourd'hui champion ?";

      // Détection automatique d'action suggérée
      let suggestedTab: string | null = null;
      const lowerReply = replyText.toLowerCase() + " " + message.toLowerCase();
      if (lowerReply.includes("boutique") || lowerReply.includes("acheter") || lowerReply.includes("manette") || lowerReply.includes("prix")) {
        suggestedTab = "shop";
      } else if (lowerReply.includes("tournoi") || lowerReply.includes("cash prize") || lowerReply.includes("compétition")) {
        suggestedTab = "tournaments";
      } else if (lowerReply.includes("répar") || lowerReply.includes("panne") || lowerReply.includes("drift") || lowerReply.includes("devis")) {
        suggestedTab = "repairs";
      } else if (lowerReply.includes("vr") || lowerReply.includes("réalité virtuelle") || lowerReply.includes("just dance") || lowerReply.includes("rétro") || lowerReply.includes("coworking")) {
        suggestedTab = "activities";
      } else if (lowerReply.includes("event") || lowerReply.includes("afro-respawn") || lowerReply.includes("soirée") || lowerReply.includes("apéro")) {
        suggestedTab = "hgevents";
      }

      return res.json({
        reply: replyText,
        source: "gemini",
        suggestedTab,
      });
    } else {
      // Mode autonome intelligent si GEMINI_API_KEY non fournie ou fallback
      const lower = message.toLowerCase();
      let reply = "";
      let suggestedTab: string | null = null;

      if (lower.includes("bonjour") || lower.includes("salut") || lower.includes("hello") || lower.includes("coucou")) {
        reply = "🎮 **Yo Champion ! Bienvenue chez HOUSE GAME !**\n\nJe suis **HG-BOT**, ton Game Master et guide interactif. Que veux-tu explorer aujourd'hui ?\n• Découvrir nos tournois et nos cash prizes\n• Tester nos casques VR ou Just Dance\n• Trouver une manette ou une console garantie\n• Réparer ton matériel en atelier express\n\nDis-moi ce qui te ferait vibrer ! 🔥";
      } else if (lower.includes("où") || lower.includes("adresse") || lower.includes("localisation") || lower.includes("situe") || lower.includes("venir")) {
        reply = "📍 **Où nous trouver :**\nHOUSE GAME est situé à **Yaoundé**, juste **Derrière Total Jouvence** (Cameroun).\nFacile d'accès avec un espace sécurisé et parking disponible ! Nous t'accueillons du Lundi au Samedi de 08h30 à 20h00.";
      } else if (lower.includes("prix") || lower.includes("tarif") || lower.includes("coûte") || lower.includes("combien")) {
        reply = "💰 **Des tarifs gaming accessibles à tous :**\n• Sessions consoles & VR sur place avec formules flexibles\n• Matériel et jeux au meilleur rapport qualité-prix en FCFA\n• Devis réparation gratuit avant toute intervention !\n\nVeux-tu jeter un œil à notre boutique ou à nos activités ?";
        suggestedTab = "shop";
      } else if (lower.includes("vr") || lower.includes("virtuelle") || lower.includes("casque")) {
        reply = "🥽 **Immersion Totale Réalité Virtuelle (VR) :**\nPlonge dans des mondes à 360° avec nos casques VR ultra-récents ! Sensations fortes garanties sur Beat Saber, simulations de montagnes russes et aventures épiques.";
        suggestedTab = "activities";
      } else if (lower.includes("tournoi") || lower.includes("esport") || lower.includes("challenge") || lower.includes("competition")) {
        reply = "🏆 **Arène Esport & Compétitions :**\nNous organisons régulièrement des tournois sur EA Sports FC, Tekken, Mortal Kombat avec de vrais **Cash Prizes** et une ambiance de folie ! Prépare ta manette !";
        suggestedTab = "tournaments";
      } else if (lower.includes("repar") || lower.includes("drift") || lower.includes("panne") || lower.includes("bouton") || lower.includes("hdmi")) {
        reply = "🛠️ **Atelier Réparation Express House Game :**\nManette qui drift ? Console qui chauffe ou port HDMI abîmé ? Nos techniciens certifiés redonnent vie à ton matériel avec garantie et pièces de qualité.";
        suggestedTab = "repairs";
      } else if (lower.includes("contact") || lower.includes("whatsapp") || lower.includes("numéro") || lower.includes("téléphone") || lower.includes("reserver")) {
        reply = "📱 **Ligne directe House Game :**\nTu peux discuter directement avec l'équipe sur WhatsApp au **+237 658 413 269** pour réserver ta session ou poser tes questions en direct !";
      } else {
        reply = "🔥 **House Game, le sanctuaire des gamers !**\nIci, la qualité n'a pas de prix. Nous proposons du gaming consoles next-gen (PS5, Xbox), de la VR immersive, du rétro gaming, du Just Dance, un espace coworking fibre et la vente de matériel certifié.\n\nQuelle expérience veux-tu tenter ?";
      }

      return res.json({
        reply,
        source: "local-engine",
        suggestedTab,
      });
    }
  } catch (error: any) {
    console.error("AI chat error:", error);
    return res.status(500).json({
      error: "Erreur lors du traitement de la requête IA",
      details: error?.message || "Unknown error",
    });
  }
});

// Montage de Vite en dev ou static en prod
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HOUSE GAME] Serveur Full-Stack opérationnel sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
