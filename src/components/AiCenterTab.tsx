import React, { useState, useEffect, useMemo } from "react";
import {
  Bot,
  Sliders,
  MessageSquare,
  Database,
  Megaphone,
  MessageCircle,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Send,
  Sparkles,
  AlertTriangle,
  Search,
  LogIn,
  LogOut,
  Power,
  Clock,
  HelpCircle,
} from "lucide-react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  ActivityItem,
  AiAdminRoleAssignment,
  AiConfig,
  AiConversation,
  AiKnowledgeCategory,
  AiKnowledgeItem,
  AiMarketingCampaign,
  AiMarketingCampaignStatus,
  AiMarketingChannel,
  AiMarketingObjective,
  AiRoleName,
  GamingEvent,
  Product,
  RepairService,
  ShopInfo,
  TeamMember,
  Tournament,
  VenuePhoto,
} from "../types";
import {
  AI_KNOWLEDGE_CATEGORIES,
  DEFAULT_AI_CONFIG,
  deleteAiCampaignCloud,
  deleteAiConversationCloud,
  deleteAiKnowledgeItemCloud,
  deleteAiRoleCloud,
  generateMarketingCampaignAi,
  getRolePermissions,
  getWhatsappStatus,
  refreshServerAiKnowledge,
  saveAiCampaignCloud,
  saveAiConfigCloud,
  saveAiConversationCloud,
  saveAiKnowledgeItemCloud,
  saveAiRoleCloud,
  sendWhatsappMessageOfficial,
  WhatsappCloudStatus,
} from "../services/aiService";

interface AiCenterTabProps {
  isAdmin: boolean;
  shopInfo: ShopInfo;
  aiConfig: AiConfig;
  knowledgeItems: AiKnowledgeItem[];
  conversations: AiConversation[];
  campaigns: AiMarketingCampaign[];
  roles: AiAdminRoleAssignment[];
  products: Product[];
  repairServices: RepairService[];
  events: GamingEvent[];
  tournaments: Tournament[];
  activities: ActivityItem[];
  venuePhotos: VenuePhoto[];
  teamMembers: TeamMember[];
}

type CenterSubTab = "overview" | "conversations" | "knowledge" | "marketing" | "whatsapp" | "roles";

const ROLE_LABELS: Record<AiRoleName, string> = {
  super_admin: "Super Admin",
  ai_editor: "Éditeur IA & FAQ",
  marketing_manager: "Responsable Marketing",
  viewer: "Lecteur (Lecture seule)",
};

const CHANNEL_LABELS: Record<AiMarketingChannel, string> = {
  whatsapp_group: "Groupe WhatsApp",
  facebook: "Facebook",
  tiktok: "TikTok",
  instagram: "Instagram",
};

const OBJECTIVE_LABELS: Record<AiMarketingObjective, string> = {
  promo: "Promotion / Offre",
  new_arrival: "Nouvel arrivage",
  esport_event: "Tournoi / Événement",
  general_brand: "Notoriété / Salle Gaming",
};

const CAMPAIGN_STATUS_META: Record<
  AiMarketingCampaignStatus,
  { label: string; badgeClass: string }
> = {
  draft: { label: "Brouillon", badgeClass: "bg-slate-700/60 text-slate-200 border-slate-500/40" },
  approved: { label: "Approuvée", badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  scheduled: { label: "Programmée", badgeClass: "bg-[#3E9BFF]/15 text-[#3E9BFF] border-[#3E9BFF]/40" },
  published: { label: "Publiée", badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/40" },
  rejected: { label: "Refusée", badgeClass: "bg-red-500/15 text-red-300 border-red-500/40" },
};

export const AiCenterTab: React.FC<AiCenterTabProps> = ({
  isAdmin,
  shopInfo,
  aiConfig,
  knowledgeItems,
  conversations,
  campaigns,
  roles,
  products,
  repairServices,
  events,
  tournaments,
  activities,
  venuePhotos,
  teamMembers,
}) => {
  const [subTab, setSubTab] = useState<CenterSubTab>("overview");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => auth.currentUser);
  const [simulatedPinRole, setSimulatedPinRole] = useState<AiRoleName>("super_admin");
  const [statusMessage, setStatusMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Backend status states
  const [serverHealth, setServerHealth] = useState<{
    aiEnabled: boolean;
    whatsappConfigured: boolean;
  } | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappCloudStatus | null>(null);
  const [isRefreshingIndex, setIsRefreshingIndex] = useState(false);
  const [indexCounts, setIndexCounts] = useState<Record<string, number> | null>(null);

  // Config draft
  const [configDraft, setConfigDraft] = useState<AiConfig>(aiConfig || DEFAULT_AI_CONFIG);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Conversations & FAQ state
  const [convFilter, setConvFilter] = useState<"all" | "unanswered" | "transferred" | "resolved" | "whatsapp">("all");
  const [convSearch, setConvSearch] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [convNotesDraft, setConvNotesDraft] = useState("");

  // Knowledge base CRUD state
  const [knowSearch, setKnowSearch] = useState("");
  const [knowCatFilter, setKnowCatFilter] = useState<string>("all");
  const [editingKnowId, setEditingKnowId] = useState<string | null>(null);
  const [knowTitle, setKnowTitle] = useState("");
  const [knowCategory, setKnowCategory] = useState<AiKnowledgeCategory>("faq");
  const [knowContent, setKnowContent] = useState("");
  const [knowTags, setKnowTags] = useState("");
  const [knowActive, setKnowActive] = useState(true);
  const [isSavingKnow, setIsSavingKnow] = useState(false);

  // Marketing studio state
  const [mktChannel, setMktChannel] = useState<AiMarketingChannel>("whatsapp_group");
  const [mktObjective, setMktObjective] = useState<AiMarketingObjective>("promo");
  const [mktTone, setMktTone] = useState("Dynamique & Gamer");
  const [mktBrief, setMktBrief] = useState("");
  const [pickedProductIds, setPickedProductIds] = useState<string[]>([]);
  const [pickedTournamentIds, setPickedTournamentIds] = useState<string[]>([]);
  const [pickedEventIds, setPickedEventIds] = useState<string[]>([]);
  const [isGeneratingMkt, setIsGeneratingMkt] = useState(false);
  const [mktFilter, setMktFilter] = useState<string>("all");
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [editingCampaignContent, setEditingCampaignContent] = useState("");
  const [editingCampaignSchedule, setEditingCampaignSchedule] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // WhatsApp 1-to-1 send form
  const [waRecipient, setWaRecipient] = useState("");
  const [waDirectMsg, setWaDirectMsg] = useState("");
  const [isSendingWa, setIsSendingWa] = useState(false);

  // Roles form
  const [roleEmail, setRoleEmail] = useState("");
  const [roleDisplayName, setRoleDisplayName] = useState("");
  const [roleLevel, setRoleLevel] = useState<AiRoleName>("ai_editor");
  const [isSavingRole, setIsSavingRole] = useState(false);

  useEffect(() => {
    setConfigDraft(aiConfig || DEFAULT_AI_CONFIG);
  }, [aiConfig]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setServerHealth({ aiEnabled: Boolean(d.aiEnabled), whatsappConfigured: Boolean(d.whatsappConfigured) }))
      .catch(() => {});

    getWhatsappStatus()
      .then((st) => setWhatsappStatus(st))
      .catch(() => {});
  }, []);

  const flash = (type: "ok" | "err", text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage((prev) => (prev?.text === text ? null : prev));
    }, 5500);
  };

  // Resolve active RBAC role
  const effectiveRole: AiRoleName = useMemo(() => {
    if (firebaseUser?.email) {
      const emailLower = firebaseUser.email.toLowerCase();
      if (emailLower === "payelle123@gmail.com") return "super_admin";
      const match = roles.find((r) => r.active && r.email.toLowerCase() === emailLower);
      if (match) return match.role;
      return "viewer";
    }
    if (isAdmin) {
      return simulatedPinRole;
    }
    return "viewer";
  }, [firebaseUser, roles, isAdmin, simulatedPinRole]);

  const permissions = useMemo(() => getRolePermissions(effectiveRole), [effectiveRole]);
  const operatorLabel = firebaseUser?.email || (isAdmin ? `Admin PIN (${ROLE_LABELS[effectiveRole]})` : "Visiteur");

  // Metrics
  const stats = useMemo(() => {
    const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || c.messageCount || 0), 0);
    const unansweredList: Array<{ convId: string; visitorLabel: string; question: string; updatedAt: number }> = [];
    for (const c of conversations) {
      for (const q of c.unansweredQuestions || []) {
        unansweredList.push({
          convId: c.id,
          visitorLabel: c.visitorLabel,
          question: q,
          updatedAt: c.updatedAt,
        });
      }
    }
    const transferredCount = conversations.filter((c) => c.status === "transferred").length;
    const approvedCampaigns = campaigns.filter((c) => c.status === "approved" || c.status === "scheduled" || c.status === "published").length;
    return {
      totalConversations: conversations.length,
      totalMessages,
      unansweredList,
      transferredCount,
      approvedCampaigns,
    };
  }, [conversations, campaigns]);

  const filteredConversations = useMemo(() => {
    const q = convSearch.trim().toLowerCase();
    return conversations.filter((c) => {
      if (convFilter === "unanswered" && !c.hasUnanswered) return false;
      if (convFilter === "transferred" && c.status !== "transferred") return false;
      if (convFilter === "resolved" && c.status !== "resolved") return false;
      if (convFilter === "whatsapp" && c.channel !== "whatsapp") return false;
      if (!q) return true;
      const inMessages = (c.messages || []).some((m) => m.text.toLowerCase().includes(q));
      return c.visitorLabel.toLowerCase().includes(q) || inMessages;
    });
  }, [conversations, convFilter, convSearch]);

  const selectedConversation = useMemo(() => {
    if (selectedConvId) {
      return conversations.find((c) => c.id === selectedConvId) || filteredConversations[0] || null;
    }
    return filteredConversations[0] || null;
  }, [conversations, filteredConversations, selectedConvId]);

  useEffect(() => {
    setConvNotesDraft(selectedConversation?.notes || "");
  }, [selectedConversation?.id]);

  const filteredKnowledge = useMemo(() => {
    const q = knowSearch.trim().toLowerCase();
    return knowledgeItems.filter((item) => {
      if (knowCatFilter !== "all" && item.category !== knowCatFilter) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [knowledgeItems, knowSearch, knowCatFilter]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => (mktFilter === "all" ? true : c.status === mktFilter));
  }, [campaigns, mktFilter]);

  const approvedWhatsappCampaigns = useMemo(() => {
    return campaigns.filter(
      (c) =>
        c.channel === "whatsapp_group" &&
        (c.status === "approved" || c.status === "scheduled" || c.status === "published")
    );
  }, [campaigns]);

  // Handlers
  const handleToggleMasterAi = async () => {
    if (!permissions.canToggleAi) {
      flash("err", "Action réservée au rôle Super Admin.");
      return;
    }
    const nextConfig: AiConfig = {
      ...configDraft,
      enabled: !configDraft.enabled,
      updatedAt: Date.now(),
      updatedBy: operatorLabel,
    };
    setConfigDraft(nextConfig);
    try {
      await saveAiConfigCloud(nextConfig);
      await refreshServerAiKnowledge().catch(() => {});
      flash("ok", nextConfig.enabled ? "HOUSE GAME AI activé sur le site." : "HOUSE GAME AI mis en pause.");
    } catch (err: any) {
      flash("err", err?.message || "Erreur sauvegarde configuration.");
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canEditConfig) {
      flash("err", "Permission insuffisante pour modifier la configuration.");
      return;
    }
    setIsSavingConfig(true);
    try {
      await saveAiConfigCloud({
        ...configDraft,
        updatedAt: Date.now(),
        updatedBy: operatorLabel,
      });
      await refreshServerAiKnowledge().catch(() => {});
      flash("ok", "Configuration de HOUSE GAME AI enregistrée et synchronisée.");
    } catch (err: any) {
      flash("err", err?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleRefreshIndex = async () => {
    setIsRefreshingIndex(true);
    try {
      const res = await refreshServerAiKnowledge();
      setIndexCounts(res.counts);
      flash("ok", "Index temps réel Firestore actualisé côté serveur.");
    } catch (err: any) {
      flash("err", err?.message || "Impossible d'actualiser l'index serveur.");
    } finally {
      setIsRefreshingIndex(false);
    }
  };

  const handleSaveKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canEditKnowledge) {
      flash("err", "Permission insuffisante pour éditer la base de connaissances.");
      return;
    }
    if (!knowTitle.trim() || !knowContent.trim()) {
      flash("err", "Titre et contenu requis.");
      return;
    }
    setIsSavingKnow(true);
    try {
      const existing = editingKnowId ? knowledgeItems.find((k) => k.id === editingKnowId) : undefined;
      const item: AiKnowledgeItem = {
        id: existing ? existing.id : `know_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: knowTitle.trim(),
        category: knowCategory,
        content: knowContent.trim(),
        tags: knowTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isActive: knowActive,
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
        updatedBy: operatorLabel,
      };
      await saveAiKnowledgeItemCloud(item);
      await refreshServerAiKnowledge().catch(() => {});
      setEditingKnowId(null);
      setKnowTitle("");
      setKnowContent("");
      setKnowTags("");
      setKnowActive(true);
      flash("ok", "Connaissance enregistrée et injectée dans HOUSE GAME AI.");
    } catch (err: any) {
      flash("err", err?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setIsSavingKnow(false);
    }
  };

  const handleEditKnowledge = (item: AiKnowledgeItem) => {
    setEditingKnowId(item.id);
    setKnowTitle(item.title);
    setKnowCategory(item.category);
    setKnowContent(item.content);
    setKnowTags((item.tags || []).join(", "));
    setKnowActive(item.isActive !== false);
    setSubTab("knowledge");
  };

  const handlePromoteUnansweredToFaq = (question: string) => {
    setEditingKnowId(null);
    setKnowCategory("faq");
    setKnowTitle(question.slice(0, 140));
    setKnowContent("");
    setKnowTags("faq");
    setKnowActive(true);
    setSubTab("knowledge");
    flash("ok", "Question pré-remplie dans l'éditeur de connaissances. Saisissez la réponse officielle.");
  };

  const handleSaveConvStatus = async (conv: AiConversation, status: AiConversation["status"]) => {
    if (!permissions.canResolveConversations) {
      flash("err", "Permission insuffisante.");
      return;
    }
    try {
      await saveAiConversationCloud({
        ...conv,
        status,
        hasUnanswered: status === "resolved" ? false : conv.hasUnanswered,
        notes: convNotesDraft,
      });
      flash("ok", `Conversation marquée comme « ${status} ».`);
    } catch (err: any) {
      flash("err", err?.message || "Erreur mise à jour conversation.");
    }
  };

  const handleGenerateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canGenerateMarketing) {
      flash("err", "Permission réservée aux rôles Super Admin ou Marketing Manager.");
      return;
    }
    setIsGeneratingMkt(true);
    try {
      const generated = await generateMarketingCampaignAi({
        channel: mktChannel,
        objective: mktObjective,
        tone: mktTone,
        customBrief: mktBrief,
        selectedProductIds: pickedProductIds,
        selectedTournamentIds: pickedTournamentIds,
        selectedEventIds: pickedEventIds,
      });

      const newCampaign: AiMarketingCampaign = {
        id: `camp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: generated.title,
        channel: mktChannel,
        objective: mktObjective,
        tone: mktTone,
        content: generated.content,
        hashtags: generated.hashtags,
        linkedEntityLabel: generated.linkedEntityLabel,
        status: "draft",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdBy: operatorLabel,
      };
      await saveAiCampaignCloud(newCampaign);
      flash("ok", "Campagne générée en brouillon à partir des données réelles. Vérifiez et validez-la avant diffusion.");
    } catch (err: any) {
      flash("err", err?.message || "Erreur lors de la génération IA.");
    } finally {
      setIsGeneratingMkt(false);
    }
  };

  const handleUpdateCampaignStatus = async (
    camp: AiMarketingCampaign,
    status: AiMarketingCampaignStatus,
    extra?: { content?: string; scheduledFor?: string }
  ) => {
    if (!permissions.canApproveMarketing) {
      flash("err", "Permission insuffisante pour valider/refuser une campagne.");
      return;
    }
    try {
      await saveAiCampaignCloud({
        ...camp,
        status,
        content: extra?.content ?? camp.content,
        scheduledFor: extra?.scheduledFor ?? camp.scheduledFor,
        publishedAt: status === "published" ? Date.now() : camp.publishedAt,
        approvedBy: status === "approved" || status === "scheduled" ? operatorLabel : camp.approvedBy,
      });
      setEditingCampaignId(null);
      flash("ok", `Campagne mise à jour : ${CAMPAIGN_STATUS_META[status].label}.`);
    } catch (err: any) {
      flash("err", err?.message || "Erreur mise à jour campagne.");
    }
  };

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {}
  };

  const handleSendOfficialWhatsapp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canSendWhatsapp) {
      flash("err", "Permission insuffisante.");
      return;
    }
    setIsSendingWa(true);
    try {
      await sendWhatsappMessageOfficial({
        recipientPhone: waRecipient,
        message: waDirectMsg,
      });
      setWaDirectMsg("");
      flash("ok", "Message envoyé via Meta WhatsApp Business Cloud API.");
    } catch (err: any) {
      flash("err", err?.message || "Échec d'envoi WhatsApp Cloud API.");
    } finally {
      setIsSendingWa(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      flash("ok", "Connexion Firebase Google réussie.");
    } catch (err: any) {
      flash("err", err?.message || "Connexion Google annulée ou bloquée.");
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissions.canManageRoles) {
      flash("err", "Action réservée au Super Admin.");
      return;
    }
    if (!roleEmail.trim() || !roleDisplayName.trim()) {
      flash("err", "Email et nom requis.");
      return;
    }
    setIsSavingRole(true);
    try {
      const newRole: AiAdminRoleAssignment = {
        id: `role_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        email: roleEmail.trim().toLowerCase(),
        displayName: roleDisplayName.trim(),
        role: roleLevel,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveAiRoleCloud(newRole);
      setRoleEmail("");
      setRoleDisplayName("");
      flash("ok", "Opérateur ajouté avec ses permissions.");
    } catch (err: any) {
      flash("err", err?.message || "Erreur sauvegarde rôle.");
    } finally {
      setIsSavingRole(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-[#12151E] p-8 text-center">
        <Shield className="mx-auto h-10 w-10 text-[#FF4438] mb-3" />
        <h2 className="font-['Orbitron'] text-lg font-bold text-white">ACCÈS RESTREINT</h2>
        <p className="mt-2 font-['Chakra_Petch'] text-sm text-[#7C8798]">
          Connectez-vous à l'Espace Pro Administrateur pour accéder à HOUSE GAME AI CENTER.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* TOP BAR */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#12151E] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Bot className="h-6 w-6 text-[#3E9BFF]" />
            <h1 className="font-['Orbitron'] text-lg font-black tracking-wide text-white sm:text-xl">
              HOUSE GAME AI CENTER
            </h1>
            <span
              className={`rounded-md border px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold ${
                configDraft.enabled
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/15 text-amber-300"
              }`}
            >
              {configDraft.enabled ? "ACTIF" : "EN PAUSE"}
            </span>
          </div>
          <p className="mt-1 font-['Chakra_Petch'] text-xs text-[#7C8798]">
            Pilotage de l'assistant virtuel, base de connaissances temps réel, studio marketing et WhatsApp Business.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Indicator */}
          <div className="rounded-xl border border-white/10 bg-[#0A0D14] px-3 py-1.5 text-xs font-['JetBrains_Mono']">
            <span className="text-[#7C8798]">Rôle actif : </span>
            <strong className="text-[#3E9BFF]">{ROLE_LABELS[effectiveRole]}</strong>
          </div>

          <button
            onClick={handleToggleMasterAi}
            disabled={!permissions.canToggleAi}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold transition disabled:opacity-40 ${
              configDraft.enabled
                ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
            }`}
          >
            <Power className="h-3.5 w-3.5" />
            <span>{configDraft.enabled ? "Désactiver l'IA" : "Activer l'IA"}</span>
          </button>
        </div>
      </div>

      {/* STATUS FEEDBACK BANNER */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-['Chakra_Petch'] ${
            statusMessage.type === "ok"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-white/70 hover:text-white">
            Fermer
          </button>
        </div>
      )}

      {/* SUB-TAB NAVIGATION */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "overview", label: "Pilotage & Config", icon: Sliders },
          {
            id: "conversations",
            label: `Conversations & FAQ (${stats.unansweredList.length})`,
            icon: MessageSquare,
          },
          { id: "knowledge", label: `Base Connaissances (${knowledgeItems.length})`, icon: Database },
          { id: "marketing", label: `Studio Marketing (${campaigns.length})`, icon: Megaphone },
          { id: "whatsapp", label: "WhatsApp Business", icon: MessageCircle },
          { id: "roles", label: "Rôles & Permissions", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as CenterSubTab)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold transition ${
                active
                  ? "border-[#3E9BFF] bg-[#3E9BFF]/15 text-white"
                  : "border-white/10 bg-[#12151E] text-[#7C8798] hover:border-white/25 hover:text-white"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${active ? "text-[#3E9BFF]" : ""}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== 1. OVERVIEW & CONFIG ==================== */}
      {subTab === "overview" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            {[
              { label: "Conversations", value: stats.totalConversations, accent: "text-white" },
              { label: "Messages traités", value: stats.totalMessages, accent: "text-[#3E9BFF]" },
              { label: "Questions sans réponse", value: stats.unansweredList.length, accent: "text-amber-400" },
              { label: "Transferts WhatsApp", value: stats.transferredCount, accent: "text-emerald-400" },
              { label: "Fiches personnalisées", value: knowledgeItems.length, accent: "text-purple-400" },
              { label: "Campagnes validées", value: stats.approvedCampaigns, accent: "text-[#FF4438]" },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-white/10 bg-[#12151E] p-4"
              >
                <div className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-wider text-[#7C8798]">
                  {kpi.label}
                </div>
                <div className={`mt-2 font-['Orbitron'] text-2xl font-black tabular-nums ${kpi.accent}`}>
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>

          {/* Real Engine & WhatsApp Health Checks */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#12151E] p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-['JetBrains_Mono'] text-xs font-bold text-white">
                  Moteur IA Serveur (Gemini)
                </div>
                <p className="mt-1 font-['Chakra_Petch'] text-xs text-[#7C8798]">
                  {serverHealth?.aiEnabled
                    ? "Clé API Gemini serveur détectée et opérationnelle."
                    : "GEMINI_API_KEY manquante dans l'environnement serveur. Le chat IA retournera une erreur transparente."}
                </p>
              </div>
              {serverHealth?.aiEnabled ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400" />
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#12151E] p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-['JetBrains_Mono'] text-xs font-bold text-white">
                  Meta WhatsApp Business Cloud API
                </div>
                <p className="mt-1 font-['Chakra_Petch'] text-xs text-[#7C8798]">
                  {whatsappStatus?.connected
                    ? "Webhook & Graph API prêts pour les réponses 1-to-1."
                    : "Identifiants Cloud API non configurés. Mode lien WhatsApp & copie groupe actif."}
                </p>
              </div>
              {whatsappStatus?.connected ? (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              ) : (
                <XCircle className="h-6 w-6 shrink-0 text-slate-500" />
              )}
            </div>
          </div>

          {/* Configuration Form */}
          <form
            onSubmit={handleSaveConfig}
            className="rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="font-['Orbitron'] text-sm font-bold text-white">
                PARAMÈTRES DE L'ASSISTANT
              </h2>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
                Mis à jour : {new Date(configDraft.updatedAt || Date.now()).toLocaleString("fr-FR")}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1.5">
                  Nom public de l'assistant
                </label>
                <input
                  type="text"
                  value={configDraft.assistantName}
                  onChange={(e) => setConfigDraft({ ...configDraft, assistantName: e.target.value })}
                  disabled={!permissions.canEditConfig}
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1.5">
                  Personnalité & Ton commercial
                </label>
                <select
                  value={configDraft.personalityTone}
                  onChange={(e) =>
                    setConfigDraft({
                      ...configDraft,
                      personalityTone: e.target.value as AiConfig["personalityTone"],
                    })
                  }
                  disabled={!permissions.canEditConfig}
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none disabled:opacity-50"
                >
                  <option value="dynamique_pro">Dynamique, accueillant & pro gaming</option>
                  <option value="expert_gaming">Expert gaming & technicien e-sport</option>
                  <option value="conseiller_commercial">Conseiller commercial & prise de commande</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1.5">
                Message d'accueil automatique des nouveaux visiteurs
              </label>
              <textarea
                rows={3}
                value={configDraft.welcomeMessage}
                onChange={(e) => setConfigDraft({ ...configDraft, welcomeMessage: e.target.value })}
                disabled={!permissions.canEditConfig}
                className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1.5">
                  Message quand une information manque en base
                </label>
                <textarea
                  rows={2}
                  value={configDraft.fallbackWhatsappMessage}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, fallbackWhatsappMessage: e.target.value })
                  }
                  disabled={!permissions.canEditConfig}
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1.5">
                  Lien d'invitation du Groupe WhatsApp officiel (optionnel)
                </label>
                <input
                  type="url"
                  placeholder="https://chat.whatsapp.com/..."
                  value={configDraft.whatsappGroupInviteUrl || ""}
                  onChange={(e) =>
                    setConfigDraft({ ...configDraft, whatsappGroupInviteUrl: e.target.value })
                  }
                  disabled={!permissions.canEditConfig}
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {permissions.canEditConfig && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="rounded-xl bg-[#3E9BFF] px-5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white transition hover:bg-[#5aaaff] disabled:opacity-50"
                >
                  {isSavingConfig ? "Enregistrement..." : "Enregistrer la configuration"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ==================== 2. CONVERSATIONS & FAQ ==================== */}
      {subTab === "conversations" && (
        <div className="space-y-6">
          {/* Unanswered Questions Actionable Queue */}
          <div className="rounded-2xl border border-amber-500/30 bg-[#12151E] p-5">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-amber-400" />
                <h3 className="font-['Orbitron'] text-xs font-bold text-white">
                  QUESTIONS SANS RÉPONSE DÉTECTÉES ({stats.unansweredList.length})
                </h3>
              </div>
              <span className="font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
                Transformez-les en fiches officielles en 1 clic
              </span>
            </div>

            {stats.unansweredList.length === 0 ? (
              <p className="font-['Chakra_Petch'] text-xs text-[#7C8798]">
                Aucune question sans réponse en attente.
              </p>
            ) : (
              <div className="grid gap-2 md:grid-cols-2">
                {stats.unansweredList.slice(0, 8).map((u, i) => (
                  <div
                    key={`${u.convId}_${i}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0A0D14] p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-['Chakra_Petch'] text-xs font-semibold text-white">
                        « {u.question} »
                      </p>
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
                        {u.visitorLabel} • {new Date(u.updatedAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    {permissions.canEditKnowledge && (
                      <button
                        onClick={() => handlePromoteUnansweredToFaq(u.question)}
                        className="shrink-0 rounded-lg border border-[#3E9BFF]/40 bg-[#3E9BFF]/15 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-[#3E9BFF] hover:bg-[#3E9BFF] hover:text-white"
                      >
                        + Ajouter FAQ
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversations Split Pane */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* List */}
            <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#12151E] p-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#07090E] px-3 py-1.5">
                <Search className="h-3.5 w-3.5 text-[#7C8798]" />
                <input
                  type="text"
                  value={convSearch}
                  onChange={(e) => setConvSearch(e.target.value)}
                  placeholder="Rechercher un visiteur ou mot-clé..."
                  className="w-full bg-transparent text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "Toutes" },
                  { id: "unanswered", label: "Sans réponse" },
                  { id: "transferred", label: "WhatsApp Handoff" },
                  { id: "whatsapp", label: "Canal WhatsApp" },
                  { id: "resolved", label: "Résolues" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setConvFilter(f.id as any)}
                    className={`rounded-lg border px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold ${
                      convFilter === f.id
                        ? "border-[#3E9BFF] bg-[#3E9BFF]/15 text-[#3E9BFF]"
                        : "border-white/10 bg-white/[0.02] text-[#7C8798]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
                {filteredConversations.length === 0 ? (
                  <p className="py-8 text-center font-['Chakra_Petch'] text-xs text-[#7C8798]">
                    Aucune conversation enregistrée pour ce filtre.
                  </p>
                ) : (
                  filteredConversations.map((c) => {
                    const selected = selectedConversation?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedConvId(c.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          selected
                            ? "border-[#3E9BFF] bg-[#3E9BFF]/10"
                            : "border-white/10 bg-[#0A0D14] hover:border-white/25"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-['JetBrains_Mono'] text-xs font-bold text-white truncate">
                            {c.visitorLabel}
                          </span>
                          <span className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[9px] uppercase text-[#A0AEC0]">
                            {c.channel}
                          </span>
                        </div>
                        <p className="mt-1 truncate font-['Chakra_Petch'] text-xs text-[#7C8798]">
                          {c.messages?.[c.messages.length - 1]?.text || "Aucun message"}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-['JetBrains_Mono']">
                          <span className="text-slate-500">
                            {c.messages?.length || 0} msg • {new Date(c.updatedAt).toLocaleString("fr-FR")}
                          </span>
                          {c.hasUnanswered && <span className="text-amber-400">Sans réponse</span>}
                          {c.status === "transferred" && <span className="text-emerald-400">Transféré WA</span>}
                          {c.status === "resolved" && <span className="text-[#3E9BFF]">Résolu</span>}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Thread Inspector */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#12151E] p-4 flex flex-col">
              {!selectedConversation ? (
                <div className="flex flex-1 items-center justify-center py-16 text-xs text-[#7C8798]">
                  Sélectionnez une conversation pour consulter les échanges.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                        {selectedConversation.visitorLabel}
                      </h3>
                      <span className="font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
                        Canal : {selectedConversation.channel.toUpperCase()} • Statut : {selectedConversation.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {permissions.canResolveConversations && (
                        <>
                          <button
                            onClick={() => handleSaveConvStatus(selectedConversation, "resolved")}
                            className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/25"
                          >
                            Marquer résolue
                          </button>
                          <button
                            onClick={() => deleteAiConversationCloud(selectedConversation.id)}
                            className="rounded-lg border border-red-500/40 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                            title="Supprimer cette conversation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="my-3 max-h-[340px] flex-1 space-y-2.5 overflow-y-auto pr-1">
                    {(selectedConversation.messages || []).map((m) => (
                      <div
                        key={m.id}
                        className={`rounded-xl border p-3 text-xs ${
                          m.sender === "user"
                            ? "border-[#FF4438]/30 bg-[#FF4438]/10 text-white"
                            : "border-white/10 bg-[#0A0D14] text-[#D6DCE6]"
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
                          <span>{m.sender === "user" ? "Visiteur" : configDraft.assistantName}</span>
                          <span>{new Date(m.timestamp).toLocaleTimeString("fr-FR")}</span>
                        </div>
                        <p className="whitespace-pre-wrap font-['Chakra_Petch']">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  {permissions.canResolveConversations && (
                    <div className="border-t border-white/10 pt-3 flex gap-2">
                      <input
                        type="text"
                        value={convNotesDraft}
                        onChange={(e) => setConvNotesDraft(e.target.value)}
                        placeholder="Note interne équipe..."
                        className="flex-1 rounded-xl border border-white/10 bg-[#07090E] px-3 py-1.5 text-xs text-white focus:border-[#3E9BFF] focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveConvStatus(selectedConversation, selectedConversation.status)}
                        className="rounded-xl bg-white/10 px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-white hover:bg-white/20"
                      >
                        Sauver note
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. KNOWLEDGE BASE & LIVE SYNC ==================== */}
      {subTab === "knowledge" && (
        <div className="space-y-6">
          {/* Live Firestore Auto-Sync Panel */}
          <div className="rounded-2xl border border-[#3E9BFF]/30 bg-[#12151E] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-['Orbitron'] text-sm font-bold text-white">
                  SYNCHRONISATION TEMPS RÉEL FIRESTORE → IA
                </h2>
                <p className="mt-1 font-['Chakra_Petch'] text-xs text-[#7C8798]">
                  L'assistant lit automatiquement les données réelles ci-dessous à chaque modification du site :
                </p>
              </div>
              <button
                onClick={handleRefreshIndex}
                disabled={isRefreshingIndex}
                className="flex items-center gap-2 rounded-xl border border-[#3E9BFF]/50 bg-[#3E9BFF]/15 px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] transition hover:bg-[#3E9BFF] hover:text-white disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshingIndex ? "animate-spin" : ""}`} />
                <span>Actualiser l'index IA</span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
              {[
                { label: "Produits", count: indexCounts?.products ?? products.length },
                { label: "Réparations", count: indexCounts?.repairServices ?? repairServices.length },
                { label: "Activités", count: indexCounts?.activities ?? activities.length },
                { label: "Tournois", count: indexCounts?.tournaments ?? tournaments.length },
                { label: "Événements", count: indexCounts?.events ?? events.length },
                { label: "Salle (Photos)", count: indexCounts?.venuePhotos ?? venuePhotos.length },
                { label: "Équipe", count: indexCounts?.teamMembers ?? teamMembers.length },
                { label: "Fiches IA", count: indexCounts?.customKnowledge ?? knowledgeItems.length },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-[#0A0D14] p-2.5 text-center">
                  <div className="font-['Orbitron'] text-base font-black text-white tabular-nums">{s.count}</div>
                  <div className="font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Form */}
            <form
              onSubmit={handleSaveKnowledge}
              className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-3.5 h-fit"
            >
              <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                {editingKnowId ? "MODIFIER LA FICHE CONNAISSANCE" : "AJOUTER UNE CONNAISSANCE OFFICIELLE"}
              </h3>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Catégorie
                </label>
                <select
                  value={knowCategory}
                  onChange={(e) => setKnowCategory(e.target.value as AiKnowledgeCategory)}
                  disabled={!permissions.canEditKnowledge}
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none"
                >
                  {AI_KNOWLEDGE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Titre / Question fréquente
                </label>
                <input
                  type="text"
                  value={knowTitle}
                  onChange={(e) => setKnowTitle(e.target.value)}
                  disabled={!permissions.canEditKnowledge}
                  placeholder="Ex: Conditions d'inscription aux tournois FC 27"
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Information factuelle exacte
                </label>
                <textarea
                  rows={5}
                  value={knowContent}
                  onChange={(e) => setKnowContent(e.target.value)}
                  disabled={!permissions.canEditKnowledge}
                  placeholder="Rédigez la réponse officielle exacte que l'IA doit fournir..."
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Mots-clés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={knowTags}
                  onChange={(e) => setKnowTags(e.target.value)}
                  disabled={!permissions.canEditKnowledge}
                  placeholder="ps5, garantie, paiement, livraison"
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-[#D6DCE6] cursor-pointer">
                <input
                  type="checkbox"
                  checked={knowActive}
                  onChange={(e) => setKnowActive(e.target.checked)}
                  disabled={!permissions.canEditKnowledge}
                />
                <span>Fiche active dans les réponses IA</span>
              </label>

              {permissions.canEditKnowledge && (
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingKnow}
                    className="flex-1 rounded-xl bg-[#FF4438] px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white transition hover:bg-[#ff5a4f] disabled:opacity-50"
                  >
                    {isSavingKnow ? "Sauvegarde..." : editingKnowId ? "Mettre à jour" : "Ajouter à la base"}
                  </button>
                  {editingKnowId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKnowId(null);
                        setKnowTitle("");
                        setKnowContent("");
                        setKnowTags("");
                      }}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs text-[#A0AEC0] hover:text-white"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* Knowledge List */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={knowSearch}
                  onChange={(e) => setKnowSearch(e.target.value)}
                  placeholder="Filtrer les fiches..."
                  className="flex-1 rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none"
                />
                <select
                  value={knowCatFilter}
                  onChange={(e) => setKnowCatFilter(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none"
                >
                  <option value="all">Toutes catégories</option>
                  {AI_KNOWLEDGE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
                {filteredKnowledge.length === 0 ? (
                  <p className="py-10 text-center font-['Chakra_Petch'] text-xs text-[#7C8798]">
                    Aucune fiche personnalisée trouvée. Les données catalogue/tournois/réparations du site restent déjà indexées automatiquement.
                  </p>
                ) : (
                  filteredKnowledge.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-[#0A0D14] p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block rounded border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold text-[#3E9BFF]">
                            {AI_KNOWLEDGE_CATEGORIES.find((c) => c.id === item.category)?.label || item.category}
                          </span>
                          <h4 className="mt-1.5 font-['Orbitron'] text-xs font-bold text-white">
                            {item.title}
                          </h4>
                        </div>
                        {permissions.canEditKnowledge && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditKnowledge(item)}
                              className="rounded-lg border border-white/10 p-1.5 text-[#A0AEC0] hover:text-white"
                              title="Modifier"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => deleteAiKnowledgeItemCloud(item.id)}
                              className="rounded-lg border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/15"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap font-['Chakra_Petch'] text-xs text-[#A0AEC0]">
                        {item.content}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-slate-500">
                        <span>{item.isActive ? "Active" : "Désactivée"}</span>
                        <span>MàJ : {new Date(item.updatedAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. MARKETING STUDIO AI ==================== */}
      {subTab === "marketing" && (
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Generator */}
          <form
            onSubmit={handleGenerateCampaign}
            className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-4 h-fit"
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="h-4 w-4 text-[#FF4438]" />
              <h2 className="font-['Orbitron'] text-sm font-bold text-white">
                STUDIO PUBLICITAIRE IA
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Canal cible
                </label>
                <select
                  value={mktChannel}
                  onChange={(e) => setMktChannel(e.target.value as AiMarketingChannel)}
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-2.5 py-2 text-xs text-white"
                >
                  {Object.entries(CHANNEL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Objectif
                </label>
                <select
                  value={mktObjective}
                  onChange={(e) => setMktObjective(e.target.value as AiMarketingObjective)}
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-2.5 py-2 text-xs text-white"
                >
                  {Object.entries(OBJECTIVE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                Ton de communication
              </label>
              <select
                value={mktTone}
                onChange={(e) => setMktTone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
              >
                <option value="Dynamique & Gamer">Dynamique & Gamer</option>
                <option value="Professionnel & Commercial">Professionnel & Commercial</option>
                <option value="Offre Limitée & Impactant">Offre Limitée & Impactant</option>
                <option value="Compétitif E-Sport">Compétitif E-Sport</option>
              </select>
            </div>

            {/* Real Products / Tournaments / Events selector */}
            <div className="space-y-2 rounded-xl border border-white/10 bg-[#0A0D14] p-3">
              <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#7C8798]">
                Lier des données réelles (optionnel)
              </p>

              {products.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !pickedProductIds.includes(e.target.value)) {
                      setPickedProductIds([...pickedProductIds, e.target.value]);
                    }
                  }}
                  className="w-full rounded-lg border border-white/10 bg-[#07090E] px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="">+ Mettre en avant un produit réel...</option>
                  {products.slice(0, 40).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.price} {shopInfo.currency})
                    </option>
                  ))}
                </select>
              )}

              {tournaments.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !pickedTournamentIds.includes(e.target.value)) {
                      setPickedTournamentIds([...pickedTournamentIds, e.target.value]);
                    }
                  }}
                  className="w-full rounded-lg border border-white/10 bg-[#07090E] px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="">+ Mettre en avant un tournoi réel...</option>
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.game} - {t.cashPrize})
                    </option>
                  ))}
                </select>
              )}

              {(pickedProductIds.length > 0 || pickedTournamentIds.length > 0 || pickedEventIds.length > 0) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {pickedProductIds.map((pid) => {
                    const p = products.find((x) => x.id === pid);
                    return (
                      <button
                        type="button"
                        key={pid}
                        onClick={() => setPickedProductIds(pickedProductIds.filter((x) => x !== pid))}
                        className="rounded-md bg-[#3E9BFF]/20 px-2 py-0.5 text-[10px] text-[#3E9BFF]"
                      >
                        {p?.name || pid} ×
                      </button>
                    );
                  })}
                  {pickedTournamentIds.map((tid) => {
                    const t = tournaments.find((x) => x.id === tid);
                    return (
                      <button
                        type="button"
                        key={tid}
                        onClick={() =>
                          setPickedTournamentIds(pickedTournamentIds.filter((x) => x !== tid))
                        }
                        className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300"
                      >
                        {t?.title || tid} ×
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                Consigne spécifique (optionnel)
              </label>
              <textarea
                rows={3}
                value={mktBrief}
                onChange={(e) => setMktBrief(e.target.value)}
                placeholder="Ex: Mettre l'accent sur la disponibilité immédiate à Total Jouvence et la garantie..."
                className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white focus:border-[#3E9BFF] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!permissions.canGenerateMarketing || isGeneratingMkt}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF4438] to-[#3E9BFF] px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white transition hover:opacity-95 disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isGeneratingMkt ? "Génération IA en cours..." : "Générer la publication IA"}</span>
            </button>
          </form>

          {/* Campaigns Moderation & Schedule List */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                VALIDATION & PROGRAMMATION DES CAMPAGNES
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {["all", "draft", "approved", "scheduled", "published", "rejected"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setMktFilter(st)}
                    className={`rounded-lg border px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold ${
                      mktFilter === st
                        ? "border-[#3E9BFF] bg-[#3E9BFF]/15 text-[#3E9BFF]"
                        : "border-white/10 text-[#7C8798]"
                    }`}
                  >
                    {st === "all" ? "Toutes" : CAMPAIGN_STATUS_META[st as AiMarketingCampaignStatus].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredCampaigns.length === 0 ? (
                <p className="py-12 text-center font-['Chakra_Petch'] text-xs text-[#7C8798]">
                  Aucune campagne pour le moment. Utilisez le générateur à gauche pour créer un post.
                </p>
              ) : (
                filteredCampaigns.map((camp) => {
                  const meta = CAMPAIGN_STATUS_META[camp.status] || CAMPAIGN_STATUS_META.draft;
                  const isEditing = editingCampaignId === camp.id;
                  const fullCopyText = `${camp.content}${
                    camp.hashtags?.length ? `\n\n${camp.hashtags.join(" ")}` : ""
                  }`;

                  return (
                    <div
                      key={camp.id}
                      className="rounded-xl border border-white/10 bg-[#0A0D14] p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded border border-white/15 bg-white/5 px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold text-white">
                              {CHANNEL_LABELS[camp.channel]}
                            </span>
                            <span className={`rounded border px-2 py-0.5 font-['JetBrains_Mono'] text-[10px] font-bold ${meta.badgeClass}`}>
                              {meta.label}
                            </span>
                            {camp.scheduledFor && (
                              <span className="flex items-center gap-1 font-['JetBrains_Mono'] text-[10px] text-[#3E9BFF]">
                                <Clock className="h-3 w-3" /> {camp.scheduledFor}
                              </span>
                            )}
                          </div>
                          <h4 className="mt-1.5 font-['Orbitron'] text-xs font-bold text-white">
                            {camp.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyText(camp.id, fullCopyText)}
                            className="rounded-lg border border-white/10 px-2 py-1 font-['JetBrains_Mono'] text-[10px] text-[#D6DCE6] hover:border-[#3E9BFF]"
                          >
                            {copiedId === camp.id ? (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Check className="h-3 w-3" /> Copié
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="h-3 w-3" /> Copier
                              </span>
                            )}
                          </button>
                          {permissions.canApproveMarketing && (
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingCampaignId(null);
                                } else {
                                  setEditingCampaignId(camp.id);
                                  setEditingCampaignContent(camp.content);
                                  setEditingCampaignSchedule(camp.scheduledFor || "");
                                }
                              }}
                              className="rounded-lg border border-white/10 p-1.5 text-[#A0AEC0] hover:text-white"
                              title="Modifier / Programmer"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {permissions.canApproveMarketing && (
                            <button
                              onClick={() => deleteAiCampaignCloud(camp.id)}
                              className="rounded-lg border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/15"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2.5">
                          <textarea
                            rows={5}
                            value={editingCampaignContent}
                            onChange={(e) => setEditingCampaignContent(e.target.value)}
                            className="w-full rounded-xl border border-[#3E9BFF]/40 bg-[#07090E] p-3 text-xs text-white focus:outline-none"
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-[#3E9BFF]" />
                              <input
                                type="datetime-local"
                                value={editingCampaignSchedule}
                                onChange={(e) => setEditingCampaignSchedule(e.target.value)}
                                className="rounded-lg border border-white/10 bg-[#07090E] px-2.5 py-1 text-xs text-white"
                              />
                            </div>
                            <button
                              onClick={() =>
                                handleUpdateCampaignStatus(
                                  camp,
                                  editingCampaignSchedule ? "scheduled" : "approved",
                                  {
                                    content: editingCampaignContent,
                                    scheduledFor: editingCampaignSchedule || undefined,
                                  }
                                )
                              }
                              className="rounded-lg bg-[#3E9BFF] px-3 py-1.5 font-['JetBrains_Mono'] text-[10px] font-bold text-white"
                            >
                              {editingCampaignSchedule ? "Enregistrer & Programmer" : "Enregistrer & Approuver"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap font-['Chakra_Petch'] text-xs leading-relaxed text-[#D6DCE6]">
                            {camp.content}
                          </p>
                          {camp.hashtags && camp.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {camp.hashtags.map((tag, i) => (
                                <span key={i} className="font-['JetBrains_Mono'] text-[10px] text-[#3E9BFF]">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {permissions.canApproveMarketing && !isEditing && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5">
                          <button
                            onClick={() => handleUpdateCampaignStatus(camp, "approved")}
                            className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/25"
                          >
                            Approuver
                          </button>
                          <button
                            onClick={() => handleUpdateCampaignStatus(camp, "published")}
                            className="rounded-lg border border-purple-500/40 bg-purple-500/15 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-purple-300 hover:bg-purple-500/25"
                          >
                            Marquer publiée
                          </button>
                          <button
                            onClick={() => handleUpdateCampaignStatus(camp, "rejected")}
                            className="rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-red-300 hover:bg-red-500/20"
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. WHATSAPP BUSINESS ==================== */}
      {subTab === "whatsapp" && (
        <div className="space-y-6">
          {/* Cloud API Truthful Config Panel */}
          <div className="rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-['Orbitron'] text-sm font-bold text-white">
                  INTÉGRATION OFFICIELLE META WHATSAPP BUSINESS CLOUD API
                </h2>
                <p className="mt-1 font-['Chakra_Petch'] text-xs text-[#7C8798]">
                  Les réponses automatiques 1-to-1 utilisent l'API Cloud officielle Meta. Pour les groupes WhatsApp (où les bots automatisés sont interdits par Meta), diffusez en 1 clic les messages validés ci-dessous.
                </p>
              </div>
              <span
                className={`shrink-0 rounded-lg border px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold ${
                  whatsappStatus?.connected
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-amber-500/40 bg-amber-500/15 text-amber-300"
                }`}
              >
                {whatsappStatus?.connected ? "CLOUD API CONNECTÉE" : "IDENTIFIANTS NON CONFIGURÉS"}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3 text-xs font-['JetBrains_Mono']">
              <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-3 flex items-center justify-between">
                <span>WHATSAPP_ACCESS_TOKEN</span>
                <span className={whatsappStatus?.hasAccessToken ? "text-emerald-400" : "text-amber-400"}>
                  {whatsappStatus?.hasAccessToken ? "OK" : "Manquant"}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-3 flex items-center justify-between">
                <span>WHATSAPP_PHONE_NUMBER_ID</span>
                <span className={whatsappStatus?.hasPhoneNumberId ? "text-emerald-400" : "text-amber-400"}>
                  {whatsappStatus?.hasPhoneNumberId ? "OK" : "Manquant"}
                </span>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-3 flex items-center justify-between">
                <span>WHATSAPP_WEBHOOK_VERIFY_TOKEN</span>
                <span className={whatsappStatus?.hasVerifyToken ? "text-emerald-400" : "text-amber-400"}>
                  {whatsappStatus?.hasVerifyToken ? "OK" : "Manquant"}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#07090E] p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-['JetBrains_Mono'] text-[#7C8798]">URL Webhook Meta à configurer : </span>
                <code className="font-['JetBrains_Mono'] text-[#3E9BFF]">
                  {typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : "/api/whatsapp/webhook"}
                </code>
              </div>
              <button
                onClick={() =>
                  handleCopyText(
                    "webhook-url",
                    typeof window !== "undefined" ? `${window.location.origin}/api/whatsapp/webhook` : "/api/whatsapp/webhook"
                  )
                }
                className="rounded-lg border border-white/10 px-2.5 py-1 font-['JetBrains_Mono'] text-[11px] text-white hover:border-[#3E9BFF]"
              >
                {copiedId === "webhook-url" ? "Copié !" : "Copier l'URL"}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Approved Group Broadcast Queue */}
            <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                  DIFFUSION GROUPE WHATSAPP ({approvedWhatsappCampaigns.length})
                </h3>
                {configDraft.whatsappGroupInviteUrl && (
                  <a
                    href={configDraft.whatsappGroupInviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 font-['JetBrains_Mono'] text-[11px] font-bold text-emerald-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Ouvrir le Groupe</span>
                  </a>
                )}
              </div>

              {approvedWhatsappCampaigns.length === 0 ? (
                <p className="py-8 text-center font-['Chakra_Petch'] text-xs text-[#7C8798]">
                  Aucune campagne « Groupe WhatsApp » approuvée pour l'instant. Créez et validez-en une dans le Studio Marketing.
                </p>
              ) : (
                <div className="space-y-3">
                  {approvedWhatsappCampaigns.map((camp) => {
                    const shareText = `${camp.content}${
                      camp.hashtags?.length ? `\n\n${camp.hashtags.join(" ")}` : ""
                    }`;
                    return (
                      <div key={camp.id} className="rounded-xl border border-white/10 bg-[#0A0D14] p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-['Orbitron'] text-xs font-bold text-white">{camp.title}</h4>
                          <span className="font-['JetBrains_Mono'] text-[10px] text-emerald-400">
                            {CAMPAIGN_STATUS_META[camp.status].label}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap font-['Chakra_Petch'] text-xs text-[#D6DCE6]">
                          {camp.content}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCopyText(`wa_${camp.id}`, shareText)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-white hover:bg-emerald-500"
                          >
                            {copiedId === `wa_${camp.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedId === `wa_${camp.id}` ? "Copié !" : "Copier pour Groupe WhatsApp"}</span>
                          </button>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-white hover:border-emerald-400"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>Partager sur WhatsApp</span>
                          </a>
                          {permissions.canApproveMarketing && camp.status !== "published" && (
                            <button
                              onClick={() => handleUpdateCampaignStatus(camp, "published")}
                              className="rounded-lg border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-purple-300"
                            >
                              Marquer diffusée
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct 1-to-1 Cloud API Sender */}
            <form
              onSubmit={handleSendOfficialWhatsapp}
              className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-3.5 h-fit"
            >
              <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                ENVOI DIRECT 1-TO-1 (CLOUD API)
              </h3>
              <p className="font-['Chakra_Petch'] text-xs text-[#7C8798]">
                Envoie un message officiel individuel via Meta Graph API lorsque les identifiants serveur sont configurés.
              </p>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Numéro WhatsApp client (avec indicatif)
                </label>
                <input
                  type="text"
                  value={waRecipient}
                  onChange={(e) => setWaRecipient(e.target.value)}
                  placeholder="237658413269"
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={waDirectMsg}
                  onChange={(e) => setWaDirectMsg(e.target.value)}
                  placeholder="Bonjour ! Suite à votre demande sur HOUSE GAME..."
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!permissions.canSendWhatsapp || isSendingWa || !whatsappStatus?.connected}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                <span>
                  {!whatsappStatus?.connected
                    ? "Configurer Cloud API Meta pour envoyer"
                    : isSendingWa
                    ? "Envoi..."
                    : "Envoyer via Cloud API"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 6. ROLES & PERMISSIONS ==================== */}
      {subTab === "roles" && (
        <div className="space-y-6">
          {/* Firebase Google Auth & PIN Operator Card */}
          <div className="rounded-2xl border border-white/10 bg-[#12151E] p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-['Orbitron'] text-sm font-bold text-white">
                SESSION OPÉRATEUR & AUTHENTIFICATION GOOGLE
              </h2>
              <p className="mt-1 font-['Chakra_Petch'] text-xs text-[#7C8798]">
                {firebaseUser
                  ? `Connecté avec Google : ${firebaseUser.email} — Rôle attribué : ${ROLE_LABELS[effectiveRole]}`
                  : "Session actuelle déverrouillée par Code PIN Admin. Vous pouvez associer un compte Google pour l'attribution nominative des rôles."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {!firebaseUser ? (
                <>
                  <select
                    value={simulatedPinRole}
                    onChange={(e) => setSimulatedPinRole(e.target.value as AiRoleName)}
                    className="rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 font-['JetBrains_Mono'] text-xs text-white"
                    title="Tester les permissions d'un rôle en session PIN"
                  >
                    {Object.entries(ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        Vue PIN : {v}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-black hover:bg-slate-200"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Connexion Google</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white hover:bg-white/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Déconnexion Google</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Add Role Form */}
            <form
              onSubmit={handleAddRole}
              className="lg:col-span-5 rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-3.5 h-fit"
            >
              <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                ATTRIBUER UN RÔLE ÉQUIPE
              </h3>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Email Google de l'opérateur
                </label>
                <input
                  type="email"
                  value={roleEmail}
                  onChange={(e) => setRoleEmail(e.target.value)}
                  disabled={!permissions.canManageRoles}
                  placeholder="membre@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={roleDisplayName}
                  onChange={(e) => setRoleDisplayName(e.target.value)}
                  disabled={!permissions.canManageRoles}
                  placeholder="Ex: Gaëtan M."
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block font-['JetBrains_Mono'] text-[11px] text-[#A0AEC0] mb-1">
                  Niveau d'accès
                </label>
                <select
                  value={roleLevel}
                  onChange={(e) => setRoleLevel(e.target.value as AiRoleName)}
                  disabled={!permissions.canManageRoles}
                  className="w-full rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 text-xs text-white"
                >
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={!permissions.canManageRoles || isSavingRole}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3E9BFF] px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-white disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{isSavingRole ? "Ajout..." : "Ajouter l'opérateur"}</span>
              </button>
            </form>

            {/* Roles List & Matrix */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-[#12151E] p-5 space-y-3">
                <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                  OPÉRATEURS AUTORISÉS ({roles.length})
                </h3>
                {roles.length === 0 ? (
                  <p className="font-['Chakra_Petch'] text-xs text-[#7C8798]">
                    Aucun opérateur enregistré dans ai_roles. Ajoutez vos collaborateurs ci-contre.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {roles.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0A0D14] p-3"
                      >
                        <div>
                          <div className="font-['Orbitron'] text-xs font-bold text-white">
                            {r.displayName}
                          </div>
                          <div className="font-['JetBrains_Mono'] text-[11px] text-[#7C8798]">
                            {r.email} • <span className="text-[#3E9BFF]">{ROLE_LABELS[r.role]}</span>
                          </div>
                        </div>
                        {permissions.canManageRoles && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveAiRoleCloud({ ...r, active: !r.active })}
                              className={`rounded-lg border px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold ${
                                r.active
                                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                                  : "border-slate-600 text-slate-400"
                              }`}
                            >
                              {r.active ? "Actif" : "Désactivé"}
                            </button>
                            <button
                              onClick={() => deleteAiRoleCloud(r.id)}
                              className="rounded-lg border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/15"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#12151E] p-5">
                <h4 className="font-['Orbitron'] text-xs font-bold text-white mb-2.5">
                  MATRICE DES PERMISSIONS
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 text-xs font-['Chakra_Petch'] text-[#A0AEC0]">
                  <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-3">
                    <strong className="text-white">Super Admin :</strong> Contrôle total (Activation IA, Config, Rôles, Base, Marketing, WhatsApp).
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-3">
                    <strong className="text-white">Éditeur IA & FAQ :</strong> Édition base de connaissances, gestion conversations & questions sans réponse.
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-3">
                    <strong className="text-white">Responsable Marketing :</strong> Génération, validation, programmation et diffusion des campagnes.
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0A0D14] p-3">
                    <strong className="text-white">Lecteur :</strong> Consultation en lecture seule des statistiques, conversations et campagnes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
