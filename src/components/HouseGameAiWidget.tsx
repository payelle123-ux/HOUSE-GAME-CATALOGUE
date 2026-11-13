import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  RotateCcw,
  ShoppingBag,
  Wrench,
  Trophy,
  Compass,
  MessageCircle,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import aiAvatarUrl from "../assets/images/housegame_ai_avatar_1794584767963.jpg";
import { sfx } from "../services/soundEffects";
import {
  AiChatMessage,
  AiConfig,
  AiConversation,
  NavTabId,
  ShopInfo,
} from "../types";
import {
  DEFAULT_AI_CONFIG,
  saveAiConversationCloud,
  sendChatToAi,
} from "../services/aiService";

interface HouseGameAiWidgetProps {
  currentTab: NavTabId;
  onNavigateTab: (tabId: NavTabId) => void;
  shopInfo: ShopInfo;
  aiConfig: AiConfig;
  conversations: AiConversation[];
  isAdmin: boolean;
}

const TAB_LABELS: Record<string, string> = {
  home: "Accueil",
  about: "Qui sommes-nous",
  shop: "Boutique",
  activities: "Nos Activités",
  events: "HG Event",
  campus: "HG Campus",
  service: "HG Service & Réparation",
  esport: "Arène E-Sport",
};

const QUICK_PROMPTS = [
  {
    icon: ShoppingBag,
    label: "Boutique & Prix",
    query: "Quels produits, consoles ou accessoires avez-vous en boutique et à quels prix ?",
  },
  {
    icon: Trophy,
    label: "Tournois & Classements",
    query: "Quels sont les prochains tournois e-sport et comment s'inscrire ?",
  },
  {
    icon: Wrench,
    label: "Réparation Atelier",
    query: "Quels services de réparation proposez-vous pour manettes et consoles ?",
  },
  {
    icon: Compass,
    label: "Horaires & Localisation",
    query: "Où êtes-vous situés et quels sont vos horaires d'ouverture ?",
  },
  {
    icon: MessageCircle,
    label: "Commander / Aide",
    query: "Comment passer une commande ou contacter un conseiller humain ?",
  },
];

const CONV_STORAGE_KEY = "hg_ai_session_conv_id";
const VISITOR_LABEL_KEY = "hg_ai_visitor_label";

function createNewConversationId() {
  return `web_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function getOrCreateConversationId(): string {
  try {
    const existing = localStorage.getItem(CONV_STORAGE_KEY);
    if (existing && /^[a-zA-Z0-9_-]{3,120}$/.test(existing)) return existing;
    const fresh = createNewConversationId();
    localStorage.setItem(CONV_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return createNewConversationId();
  }
}

function getVisitorLabel(): string {
  try {
    const existing = localStorage.getItem(VISITOR_LABEL_KEY);
    if (existing) return existing;
    const label = `Visiteur #${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(VISITOR_LABEL_KEY, label);
    return label;
  } catch {
    return "Visiteur Web";
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSafeFormattedLines(text: string) {
  return text.split("\n").map((line, i) => {
    const escaped = escapeHtml(line);
    const formatted = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    return (
      <span
        key={i}
        className={line.trim() === "" ? "block h-2" : "block"}
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}

export const HouseGameAiWidget: React.FC<HouseGameAiWidgetProps> = ({
  currentTab,
  onNavigateTab,
  shopInfo,
  aiConfig,
  conversations,
  isAdmin,
}) => {
  const effectiveConfig = aiConfig || DEFAULT_AI_CONFIG;
  const assistantName = effectiveConfig.assistantName || "HOUSE GAME AI";

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [apiErrorBanner, setApiErrorBanner] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string>(() => getOrCreateConversationId());
  const [visitorLabel] = useState<string>(() => getVisitorLabel());

  const [showTeaser, setShowTeaser] = useState(() => {
    try {
      return effectiveConfig.enabled && sessionStorage.getItem("hg_ai_teaser_dismissed") !== "true";
    } catch {
      return false;
    }
  });

  const buildWelcomeMsg = (): AiChatMessage => ({
    id: "welcome-init",
    sender: "ai",
    text: effectiveConfig.welcomeMessage || DEFAULT_AI_CONFIG.welcomeMessage,
    timestamp: Date.now(),
    suggestedTab: null,
  });

  const [messages, setMessages] = useState<AiChatMessage[]>(() => [buildWelcomeMsg()]);
  const hydratedConvRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hydrate persistent conversation history from Firestore once loaded
  useEffect(() => {
    if (hydratedConvRef.current === conversationId) return;
    const match = conversations.find((c) => c.id === conversationId);
    if (match && Array.isArray(match.messages) && match.messages.length > 0) {
      hydratedConvRef.current = conversationId;
      setMessages(match.messages);
    }
  }, [conversations, conversationId]);

  // Update welcome message if chat hasn't started yet and config welcomeMessage changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id.startsWith("welcome")) {
        return [{ ...prev[0], text: effectiveConfig.welcomeMessage || DEFAULT_AI_CONFIG.welcomeMessage }];
      }
      return prev;
    });
  }, [effectiveConfig.welcomeMessage]);

  // Auto-dismiss teaser after 9s and never overlay E-sport registration forms
  useEffect(() => {
    if (!showTeaser || !effectiveConfig.enabled) return;
    const t = setTimeout(() => {
      setShowTeaser(false);
      try {
        sessionStorage.setItem("hg_ai_teaser_dismissed", "true");
      } catch {}
    }, 9000);
    return () => clearTimeout(t);
  }, [showTeaser, effectiveConfig.enabled]);

  useEffect(() => {
    if (currentTab === "esport" || currentTab === "ai-center") {
      setShowTeaser(false);
    }
  }, [currentTab]);

  // Global event listener ("open-hg-ai" from Header button)
  useEffect(() => {
    const handleGlobalOpen = () => {
      sfx.playClick();
      setIsOpen(true);
      setIsMinimized(false);
      setShowTeaser(false);
    };
    window.addEventListener("open-hg-ai", handleGlobalOpen);
    return () => window.removeEventListener("open-hg-ai", handleGlobalOpen);
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen, isMinimized]);

  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*_#`[\]()]/g, " ").slice(0, 260);
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = "fr-FR";
      utter.rate = 1.04;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  const persistConversation = async (
    nextMessages: AiChatMessage[],
    options?: { status?: "active" | "transferred" | "resolved"; extraUnansweredQuestion?: string }
  ) => {
    const existing = conversations.find((c) => c.id === conversationId);
    const prevUnanswered = existing?.unansweredQuestions || [];
    const unansweredQuestions = options?.extraUnansweredQuestion
      ? Array.from(new Set([...prevUnanswered, options.extraUnansweredQuestion])).slice(-30)
      : prevUnanswered;

    const conv: AiConversation = {
      id: conversationId,
      visitorLabel: existing?.visitorLabel || visitorLabel,
      channel: "web",
      status: options?.status || existing?.status || "active",
      startedAt: existing?.startedAt || nextMessages[0]?.timestamp || Date.now(),
      updatedAt: Date.now(),
      messageCount: nextMessages.length,
      hasUnanswered: unansweredQuestions.length > 0,
      unansweredQuestions,
      transferredToWhatsappAt:
        options?.status === "transferred" ? Date.now() : existing?.transferredToWhatsappAt,
      messages: nextMessages,
      notes: existing?.notes,
    };

    try {
      await saveAiConversationCloud(conv);
    } catch (err) {
      console.warn("Impossible de sauvegarder la conversation IA dans Firestore:", err);
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const query = (textOverride ?? inputText).trim();
    if (!query || isThinking) return;

    sfx.playClick();
    setInputText("");
    setApiErrorBanner(null);

    const userMsg: AiChatMessage = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: Date.now(),
    };

    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setIsThinking(true);

    try {
      const result = await sendChatToAi({
        message: query,
        history: withUser.slice(-8).map((m) => ({ sender: m.sender, text: m.text })),
        currentTab,
      });

      const aiMsg: AiChatMessage = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: result.reply,
        timestamp: Date.now(),
        suggestedTab: result.suggestedTab || null,
        unanswered: Boolean(result.unanswered),
        needsWhatsappHandoff: Boolean(result.needsWhatsappHandoff),
        source: "gemini",
      };

      const nextMessages = [...withUser, aiMsg];
      setMessages(nextMessages);
      sfx.playTabSwitch();
      speakText(result.reply);

      await persistConversation(nextMessages, {
        extraUnansweredQuestion: result.unanswered ? query : undefined,
      });
    } catch (err: any) {
      const errorMsgText =
        err?.message ||
        "L'assistant IA est momentanément indisponible. Vous pouvez contacter notre équipe directement sur WhatsApp.";
      setApiErrorBanner(errorMsgText);
      await persistConversation(withUser, { extraUnansweredQuestion: query });
    } finally {
      setIsThinking(false);
    }
  };

  const handleWhatsappHandoff = async (contextQuery?: string) => {
    sfx.playClick();
    const lastUserMessage =
      contextQuery ||
      [...messages].reverse().find((m) => m.sender === "user")?.text ||
      "Demande d'information";
    const waText = `Bonjour HOUSE GAME ! Je viens du chat ${assistantName} concernant : "${lastUserMessage}"`;
    const cleanPhone = (shopInfo.whatsapp || "+237658413269").replace(/[^0-9]/g, "");
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    await persistConversation(messages, { status: "transferred" });
  };

  const handleResetChat = () => {
    sfx.playClick();
    const freshId = createNewConversationId();
    try {
      localStorage.setItem(CONV_STORAGE_KEY, freshId);
    } catch {}
    hydratedConvRef.current = freshId;
    setConversationId(freshId);
    setApiErrorBanner(null);
    setMessages([buildWelcomeMsg()]);
  };

  // Hide floating orb if AI disabled by admin (unless admin or modal already opened)
  if (!effectiveConfig.enabled && !isOpen && !isAdmin) {
    return null;
  }

  const cleanWhatsappPhone = (shopInfo.whatsapp || "+237658413269").replace(/[^0-9]/g, "");

  return (
    <>
      {/* 1. FLOATING LAUNCHER */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {!isOpen && showTeaser && effectiveConfig.enabled && (
          <div className="relative mb-3 max-w-[270px] sm:max-w-[320px] animate-fadeIn">
            <div className="flex items-center gap-2.5 rounded-2xl border border-[#3E9BFF]/40 bg-[#0B101B]/95 px-3.5 py-2.5 shadow-[0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-md">
              <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
              <p className="font-['Chakra_Petch'] text-xs text-[#D6DCE6]">
                Besoin d'aide ? <strong className="text-white">{assistantName}</strong> est en ligne.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeaser(false);
                  try {
                    sessionStorage.setItem("hg_ai_teaser_dismissed", "true");
                  } catch {}
                }}
                className="ml-1 text-slate-400 hover:text-white"
                aria-label="Fermer l'info-bulle"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {!isOpen && (
          <button
            id="hg-ai-trigger-btn"
            onClick={() => {
              sfx.playClick();
              setIsOpen(true);
              setIsMinimized(false);
              setShowTeaser(false);
            }}
            onMouseEnter={() => sfx.playHover()}
            aria-label={`Ouvrir ${assistantName}`}
            className={`group relative flex items-center gap-2.5 rounded-2xl border p-1.5 pr-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.65)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
              effectiveConfig.enabled
                ? "border-[#3E9BFF]/50 bg-[#0D1322]/95 hover:border-[#FF4438]"
                : "border-amber-500/40 bg-[#181410]/95"
            }`}
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/15 bg-[#07090E] shrink-0">
              {!avatarBroken ? (
                <img
                  src={aiAvatarUrl}
                  alt={assistantName}
                  onError={() => setAvatarBroken(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#3E9BFF]">
                  <Bot className="h-5 w-5" />
                </div>
              )}
              <span
                className={`absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border border-[#07090E] ${
                  effectiveConfig.enabled ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
            </div>
            <div className="text-left">
              <div className="font-['Orbitron'] text-[11px] font-bold tracking-wider text-white">
                {assistantName}
              </div>
              <div className="font-['JetBrains_Mono'] text-[10px] text-[#7C8798] flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-[#3E9BFF]" />
                <span>{effectiveConfig.enabled ? "Assistant IA" : "Désactivé"}</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* 2. EXPANDED CHAT INTERFACE */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-[#3E9BFF]/40 bg-[#0B0F19]/98 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-200 ${
            isMinimized
              ? "h-14 w-80 sm:w-96"
              : "h-[84vh] max-h-[640px] w-[94vw] sm:w-[420px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#0F1524] px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-[#3E9BFF]/50 bg-[#07090E]">
                {!avatarBroken ? (
                  <img
                    src={aiAvatarUrl}
                    alt={assistantName}
                    onError={() => setAvatarBroken(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#3E9BFF]">
                    <Bot className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-['Orbitron'] text-xs font-bold tracking-wide text-white">
                    {assistantName}
                  </h3>
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      effectiveConfig.enabled ? "bg-emerald-400" : "bg-amber-400"
                    }`}
                  />
                </div>
                <p className="truncate font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
                  {effectiveConfig.enabled
                    ? "Conseiller officiel HOUSE GAME"
                    : "Assistant en pause (Admin)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => {
                  sfx.playClick();
                  setSpeechEnabled((v) => !v);
                }}
                className={`rounded-lg p-1.5 transition ${
                  speechEnabled
                    ? "bg-[#3E9BFF]/20 text-[#3E9BFF]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
                title={speechEnabled ? "Couper la lecture vocale" : "Activer la lecture vocale"}
              >
                {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={handleResetChat}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                title="Nouvelle conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsMinimized((v) => !v)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                title={isMinimized ? "Agrandir" : "Réduire"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsOpen(false);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400"
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <div className="flex flex-1 flex-col overflow-hidden bg-[#07090E]">
              {/* Disabled Notice */}
              {!effectiveConfig.enabled && (
                <div className="border-b border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200 flex items-center justify-between gap-2">
                  <span>L'assistant est actuellement désactivé pour le public.</span>
                  <a
                    href={`https://wa.me/${cleanWhatsappPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 font-['JetBrains_Mono'] text-[11px] font-bold text-white"
                  >
                    WhatsApp
                  </a>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 space-y-3.5 overflow-y-auto p-3.5 text-xs">
                {messages.map((msg) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAi ? "items-start" : "items-end"} gap-1`}
                    >
                      <span className="font-['JetBrains_Mono'] text-[10px] text-slate-500">
                        {isAi ? assistantName : "Vous"} •{" "}
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 font-['Chakra_Petch'] leading-relaxed ${
                          isAi
                            ? "border border-white/10 bg-[#121725] text-[#D6DCE6]"
                            : "border border-[#FF4438]/40 bg-[#FF4438]/90 text-white"
                        }`}
                      >
                        <div className="space-y-0.5 text-[13px]">
                          {renderSafeFormattedLines(msg.text)}
                        </div>

                        {(msg.suggestedTab || msg.needsWhatsappHandoff || msg.unanswered) && (
                          <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5">
                            {msg.suggestedTab && (
                              <button
                                onClick={() => {
                                  sfx.playClick();
                                  onNavigateTab(msg.suggestedTab!);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#3E9BFF]/50 bg-[#3E9BFF]/15 px-2.5 py-1 font-['JetBrains_Mono'] text-[11px] font-bold text-[#3E9BFF] transition hover:bg-[#3E9BFF] hover:text-white"
                              >
                                <span>
                                  Aller à {TAB_LABELS[String(msg.suggestedTab)] || msg.suggestedTab}
                                </span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}

                            {(msg.needsWhatsappHandoff || msg.unanswered) && (
                              <button
                                onClick={() => handleWhatsappHandoff()}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 font-['JetBrains_Mono'] text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-600 hover:text-white"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>Parler à un conseiller WhatsApp</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {isThinking && (
                  <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] text-[#3E9BFF]">
                    <span className="h-2 w-2 rounded-full bg-[#3E9BFF] animate-ping" />
                    <span>{assistantName} consulte la base HOUSE GAME...</span>
                  </div>
                )}

                {apiErrorBanner && (
                  <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3 text-xs text-red-200 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <p>{apiErrorBanner}</p>
                    </div>
                    <button
                      onClick={() => handleWhatsappHandoff()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-white hover:bg-emerald-500"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Contacter l'équipe sur WhatsApp</span>
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestions */}
              <div className="border-t border-white/10 bg-[#0B0F19] px-3 py-2">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                  {QUICK_PROMPTS.map((q, idx) => {
                    const Icon = q.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q.query)}
                        disabled={!effectiveConfig.enabled || isThinking}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 font-['Chakra_Petch'] text-[11px] text-[#A0AEC0] transition hover:border-[#3E9BFF]/50 hover:text-white disabled:opacity-40"
                      >
                        <Icon className="h-3 w-3 text-[#3E9BFF]" />
                        <span>{q.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct WhatsApp Assistance Footer Strip */}
              <div className="flex items-center justify-between border-t border-white/5 bg-[#0A0D16] px-3.5 py-1.5 text-[10px] font-['JetBrains_Mono'] text-[#7C8798]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Données catalogue en direct
                </span>
                <button
                  onClick={() => handleWhatsappHandoff()}
                  className="text-emerald-400 hover:text-emerald-300 underline"
                >
                  Assistance WhatsApp
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2 border-t border-white/10 bg-[#0F1524] p-2.5"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={!effectiveConfig.enabled}
                  placeholder={
                    effectiveConfig.enabled
                      ? "Posez votre question (produits, tournois, atelier...)"
                      : "Assistant désactivé par l'administrateur"
                  }
                  className="flex-1 rounded-xl border border-white/10 bg-[#07090E] px-3 py-2 font-['Chakra_Petch'] text-xs text-white placeholder-slate-500 focus:border-[#3E9BFF] focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!effectiveConfig.enabled || !inputText.trim() || isThinking}
                  aria-label="Envoyer le message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF4438] text-white transition hover:bg-[#ff5c52] disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </>
  );
};
