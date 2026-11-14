import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "./firebaseService";
import {
  AiAdminRoleAssignment,
  AiConfig,
  AiConversation,
  AiKnowledgeCategory,
  AiKnowledgeItem,
  AiMarketingCampaign,
  AiMarketingChannel,
  AiMarketingObjective,
  AiRoleName,
  NavTabId,
} from "../types";

// ==================== DEFAULTS & CONSTANTS ====================
export const DEFAULT_AI_CONFIG: AiConfig = {
  id: "main",
  enabled: true,
  assistantName: "HOUSE GAME AI",
  welcomeMessage:
    "Bienvenue sur le site officiel de **HOUSE GAME** ! Je suis **HOUSE GAME AI**, votre assistant virtuel dédié.\n\nVoici tout ce que vous pouvez découvrir sur notre plateforme :\n• **Boutique** : Consoles, manettes, jeux vidéo et accessoires gaming avec commande rapide WhatsApp\n• **HG Service** : Atelier de réparation express et maintenance consoles & manettes\n• **Nos Activités & HG Event** : Salles gaming next-gen, VR, soirées et événements officiels\n• **Arène E-Sport** : Tournois, inscriptions en ligne et classements automatiques\n• **HG Campus & Qui sommes-nous** : Formations numériques, nos espaces et notre équipe\n\nPosez-moi votre question ou cliquez sur une suggestion ci-dessous !",
  personalityTone: "dynamique_pro",
  fallbackWhatsappMessage:
    "Cette information précise n'est pas encore renseignée dans notre base officielle. Tu peux contacter directement notre équipe sur WhatsApp pour une réponse immédiate !",
  whatsappGroupInviteUrl: "",
  updatedAt: Date.now(),
  updatedBy: "system",
};

export const AI_KNOWLEDGE_CATEGORIES: Array<{ id: AiKnowledgeCategory; label: string }> = [
  { id: "presentation", label: "Présentation HOUSE GAME" },
  { id: "produits", label: "Produits & Tarifs" },
  { id: "consoles", label: "Consoles & Accessoires" },
  { id: "jeux", label: "Jeux Vidéo" },
  { id: "abonnements", label: "Abonnements Numériques" },
  { id: "reparations", label: "Maintenance & Réparation" },
  { id: "localisation", label: "Localisation & Accès" },
  { id: "horaires", label: "Horaires d'ouverture" },
  { id: "evenements", label: "Événements & HG Event" },
  { id: "esport", label: "Compétitions & E-Sport" },
  { id: "promotions", label: "Offres Promotionnelles" },
  { id: "contacts", label: "Contacts & Équipe" },
  { id: "faq", label: "FAQ / Réponse rapide" },
];

export interface RolePermissions {
  canToggleAi: boolean;
  canEditConfig: boolean;
  canManageRoles: boolean;
  canEditKnowledge: boolean;
  canResolveConversations: boolean;
  canGenerateMarketing: boolean;
  canApproveMarketing: boolean;
  canSendWhatsapp: boolean;
}

export const ROLE_PERMISSIONS_MAP: Record<AiRoleName, RolePermissions> = {
  super_admin: {
    canToggleAi: true,
    canEditConfig: true,
    canManageRoles: true,
    canEditKnowledge: true,
    canResolveConversations: true,
    canGenerateMarketing: true,
    canApproveMarketing: true,
    canSendWhatsapp: true,
  },
  ai_editor: {
    canToggleAi: false,
    canEditConfig: false,
    canManageRoles: false,
    canEditKnowledge: true,
    canResolveConversations: true,
    canGenerateMarketing: false,
    canApproveMarketing: false,
    canSendWhatsapp: false,
  },
  marketing_manager: {
    canToggleAi: false,
    canEditConfig: false,
    canManageRoles: false,
    canEditKnowledge: false,
    canResolveConversations: false,
    canGenerateMarketing: true,
    canApproveMarketing: true,
    canSendWhatsapp: true,
  },
  viewer: {
    canToggleAi: false,
    canEditConfig: false,
    canManageRoles: false,
    canEditKnowledge: false,
    canResolveConversations: false,
    canGenerateMarketing: false,
    canApproveMarketing: false,
    canSendWhatsapp: false,
  },
};

export function getRolePermissions(role: AiRoleName): RolePermissions {
  return ROLE_PERMISSIONS_MAP[role] || ROLE_PERMISSIONS_MAP.viewer;
}

function sanitizeId(raw: string, fallbackPrefix = "ai"): string {
  const cleaned = String(raw || "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 128);
  return cleaned || `${fallbackPrefix}_${Date.now()}`;
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out as T;
}

// ==================== FIRESTORE SUBSCRIPTIONS & CRUD ====================

export function subscribeToAiConfig(
  onUpdate: (config: AiConfig) => void,
  onError?: (err: unknown) => void
) {
  const ref = doc(db, "ai_config", "main");
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<AiConfig>;
        onUpdate({
          ...DEFAULT_AI_CONFIG,
          ...data,
          id: "main",
        });
      } else {
        onUpdate(DEFAULT_AI_CONFIG);
      }
    },
    (err) => {
      console.warn("ai_config snapshot err:", err);
      onError?.(err);
    }
  );
}

export async function saveAiConfigCloud(config: AiConfig): Promise<void> {
  const path = "ai_config/main";
  const payload = stripUndefined({
    id: "main",
    enabled: Boolean(config.enabled),
    assistantName: String(config.assistantName || "HOUSE GAME AI").slice(0, 80),
    welcomeMessage: String(config.welcomeMessage || DEFAULT_AI_CONFIG.welcomeMessage).slice(0, 1000),
    personalityTone: config.personalityTone || "dynamique_pro",
    fallbackWhatsappMessage: String(config.fallbackWhatsappMessage || "").slice(0, 800),
    whatsappGroupInviteUrl: String(config.whatsappGroupInviteUrl || "").slice(0, 500),
    updatedAt: Date.now(),
    updatedBy: String(config.updatedBy || "admin").slice(0, 120),
  });
  try {
    await setDoc(doc(db, "ai_config", "main"), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

export function subscribeToAiKnowledge(
  onUpdate: (items: AiKnowledgeItem[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, "ai_knowledge"),
    (snap) => {
      const items = snap.docs
        .map((d) => ({ ...(d.data() as AiKnowledgeItem), id: d.id }))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onUpdate(items);
    },
    (err) => {
      console.warn("ai_knowledge snapshot err:", err);
      onError?.(err);
    }
  );
}

export async function saveAiKnowledgeItemCloud(item: AiKnowledgeItem): Promise<void> {
  const id = sanitizeId(item.id, "know");
  const path = `ai_knowledge/${id}`;
  const now = Date.now();
  const payload = stripUndefined({
    id,
    title: String(item.title || "Information").slice(0, 160),
    category: String(item.category || "faq").slice(0, 50) as AiKnowledgeCategory,
    content: String(item.content || "").slice(0, 4000),
    tags: Array.isArray(item.tags) ? item.tags.slice(0, 12).map((t) => String(t).slice(0, 40)) : [],
    isActive: item.isActive !== false,
    createdAt: item.createdAt || now,
    updatedAt: now,
    updatedBy: item.updatedBy ? String(item.updatedBy).slice(0, 120) : "admin",
  });
  try {
    await setDoc(doc(db, "ai_knowledge", id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

export async function deleteAiKnowledgeItemCloud(itemId: string): Promise<void> {
  const id = sanitizeId(itemId, "know");
  const path = `ai_knowledge/${id}`;
  try {
    await deleteDoc(doc(db, "ai_knowledge", id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
}

export function subscribeToAiConversations(
  onUpdate: (conversations: AiConversation[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, "ai_conversations"),
    (snap) => {
      const list = snap.docs
        .map((d) => ({ ...(d.data() as AiConversation), id: d.id }))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn("ai_conversations snapshot err:", err);
      onError?.(err);
    }
  );
}

export async function saveAiConversationCloud(conv: AiConversation): Promise<void> {
  const id = sanitizeId(conv.id, "conv");
  const path = `ai_conversations/${id}`;
  const messages = (Array.isArray(conv.messages) ? conv.messages : []).slice(-180).map((m) =>
    stripUndefined({
      id: String(m.id || `m_${Date.now()}`),
      sender: m.sender === "user" ? "user" : "ai",
      text: String(m.text || "").slice(0, 3500),
      timestamp: Number(m.timestamp) || Date.now(),
      suggestedTab: m.suggestedTab ?? null,
      unanswered: Boolean(m.unanswered),
      needsWhatsappHandoff: Boolean(m.needsWhatsappHandoff),
      source: m.source || "gemini",
    })
  );

  const payload = stripUndefined({
    id,
    visitorLabel: String(conv.visitorLabel || "Visiteur Web").slice(0, 120),
    channel: conv.channel === "whatsapp" ? "whatsapp" : "web",
    status:
      conv.status === "transferred" || conv.status === "resolved" ? conv.status : "active",
    startedAt: Number(conv.startedAt) || Date.now(),
    updatedAt: Date.now(),
    messageCount: messages.length,
    hasUnanswered: Boolean(conv.hasUnanswered),
    unansweredQuestions: (Array.isArray(conv.unansweredQuestions) ? conv.unansweredQuestions : [])
      .slice(-40)
      .map((q) => String(q).slice(0, 300)),
    transferredToWhatsappAt: conv.transferredToWhatsappAt,
    messages,
    notes: conv.notes ? String(conv.notes).slice(0, 1000) : undefined,
  });

  try {
    await setDoc(doc(db, "ai_conversations", id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

export async function deleteAiConversationCloud(convId: string): Promise<void> {
  const id = sanitizeId(convId, "conv");
  const path = `ai_conversations/${id}`;
  try {
    await deleteDoc(doc(db, "ai_conversations", id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
}

export function subscribeToAiCampaigns(
  onUpdate: (campaigns: AiMarketingCampaign[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, "ai_marketing_campaigns"),
    (snap) => {
      const list = snap.docs
        .map((d) => ({ ...(d.data() as AiMarketingCampaign), id: d.id }))
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn("ai_marketing_campaigns snapshot err:", err);
      onError?.(err);
    }
  );
}

export async function saveAiCampaignCloud(campaign: AiMarketingCampaign): Promise<void> {
  const id = sanitizeId(campaign.id, "camp");
  const path = `ai_marketing_campaigns/${id}`;
  const now = Date.now();
  const payload = stripUndefined({
    id,
    title: String(campaign.title || "Campagne HOUSE GAME").slice(0, 180),
    channel: campaign.channel || "whatsapp_group",
    objective: campaign.objective || "promo",
    tone: String(campaign.tone || "Dynamique & Gamer").slice(0, 100),
    content: String(campaign.content || "").slice(0, 5000),
    hashtags: Array.isArray(campaign.hashtags)
      ? campaign.hashtags.slice(0, 12).map((h) => String(h).slice(0, 50))
      : [],
    linkedEntityLabel: campaign.linkedEntityLabel
      ? String(campaign.linkedEntityLabel).slice(0, 160)
      : undefined,
    status: campaign.status || "draft",
    scheduledFor: campaign.scheduledFor ? String(campaign.scheduledFor).slice(0, 80) : undefined,
    publishedAt: campaign.publishedAt,
    createdAt: campaign.createdAt || now,
    updatedAt: now,
    createdBy: campaign.createdBy ? String(campaign.createdBy).slice(0, 120) : undefined,
    approvedBy: campaign.approvedBy ? String(campaign.approvedBy).slice(0, 120) : undefined,
  });
  try {
    await setDoc(doc(db, "ai_marketing_campaigns", id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

export async function deleteAiCampaignCloud(campaignId: string): Promise<void> {
  const id = sanitizeId(campaignId, "camp");
  const path = `ai_marketing_campaigns/${id}`;
  try {
    await deleteDoc(doc(db, "ai_marketing_campaigns", id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
}

export function subscribeToAiRoles(
  onUpdate: (roles: AiAdminRoleAssignment[]) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    collection(db, "ai_roles"),
    (snap) => {
      const list = snap.docs
        .map((d) => ({ ...(d.data() as AiAdminRoleAssignment), id: d.id }))
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      onUpdate(list);
    },
    (err) => {
      console.warn("ai_roles snapshot err:", err);
      onError?.(err);
    }
  );
}

export async function saveAiRoleCloud(roleItem: AiAdminRoleAssignment): Promise<void> {
  const id = sanitizeId(roleItem.id, "role");
  const path = `ai_roles/${id}`;
  const now = Date.now();
  const payload = stripUndefined({
    id,
    email: String(roleItem.email || "").trim().toLowerCase().slice(0, 180),
    displayName: String(roleItem.displayName || "Opérateur").slice(0, 120),
    role: roleItem.role || "viewer",
    active: roleItem.active !== false,
    createdAt: roleItem.createdAt || now,
    updatedAt: now,
  });
  try {
    await setDoc(doc(db, "ai_roles", id), payload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    throw err;
  }
}

export async function deleteAiRoleCloud(roleId: string): Promise<void> {
  const id = sanitizeId(roleId, "role");
  const path = `ai_roles/${id}`;
  try {
    await deleteDoc(doc(db, "ai_roles", id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
    throw err;
  }
}

// ==================== BACKEND API CLIENTS ====================

export interface AiChatApiResponse {
  reply: string;
  suggestedTab?: NavTabId | null;
  unanswered?: boolean;
  needsWhatsappHandoff?: boolean;
  disabled?: boolean;
  source?: "gemini" | "config";
  error?: string;
  code?: string;
}

async function parseApiJsonResponse(res: Response, fallbackPrefix: string): Promise<any> {
  const rawText = await res.text().catch(() => "");
  let parsed: any = {};
  if (rawText) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {};
    }
  }
  if (!res.ok) {
    const serverMsg =
      parsed?.error ||
      (res.status === 504 || res.status === 502
        ? "Le serveur IA a mis trop de temps à répondre. Réessayez dans un instant."
        : res.status === 404
        ? "Service IA introuvable sur le serveur (/api/ai/chat)."
        : `${fallbackPrefix} (${res.status})`);
    const err = new Error(serverMsg) as Error & {
      code?: string;
      status?: number;
    };
    err.code = parsed?.code;
    err.status = res.status;
    throw err;
  }
  return parsed;
}

export async function sendChatToAi(params: {
  message: string;
  history: Array<{ sender: "user" | "ai"; text: string }>;
  currentTab: NavTabId;
}): Promise<AiChatApiResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 32000);
  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    return (await parseApiJsonResponse(res, "Erreur serveur IA")) as AiChatApiResponse;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("La réponse de l'assistant IA prend plus de temps que prévu. Veuillez réessayer.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateMarketingCampaignAi(params: {
  channel: AiMarketingChannel;
  objective: AiMarketingObjective;
  tone: string;
  customBrief?: string;
  selectedProductIds?: string[];
  selectedTournamentIds?: string[];
  selectedEventIds?: string[];
}): Promise<{
  title: string;
  content: string;
  hashtags: string[];
  linkedEntityLabel: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 32000);
  try {
    const res = await fetch("/api/ai/marketing/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal: controller.signal,
    });
    return await parseApiJsonResponse(res, "Erreur génération marketing");
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new Error("Délai dépassé lors de la génération marketing. Veuillez réessayer.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function refreshServerAiKnowledge(): Promise<{
  ok: boolean;
  refreshedAt: number;
  counts: Record<string, number>;
}> {
  const res = await fetch("/api/ai/knowledge/refresh", { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Erreur d'actualisation de l'index IA");
  }
  return data;
}

export interface WhatsappCloudStatus {
  connected: boolean;
  hasAccessToken: boolean;
  hasPhoneNumberId: boolean;
  hasVerifyToken: boolean;
  webhookPath: string;
  graphApiVersion: string;
}

export async function getWhatsappStatus(): Promise<WhatsappCloudStatus> {
  const res = await fetch("/api/whatsapp/status");
  if (!res.ok) {
    throw new Error("Impossible de vérifier le statut WhatsApp Cloud API");
  }
  return res.json();
}

export async function sendWhatsappMessageOfficial(params: {
  recipientPhone: string;
  message: string;
}): Promise<{ ok: boolean; data?: unknown }> {
  const res = await fetch("/api/whatsapp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Erreur WhatsApp Cloud API (${res.status})`);
  }
  return data;
}
