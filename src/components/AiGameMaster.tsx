import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  RotateCcw,
  Gamepad2,
  Zap,
  HelpCircle,
  Wrench,
  Trophy,
  Glasses,
  MessageCircle,
  Compass,
  ArrowRight,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";
import { sfx } from "../services/soundEffects";
import { NavTabId, ShopInfo } from "../types";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  suggestedTab?: NavTabId | null;
  showConfetti?: boolean;
}

interface AiGameMasterProps {
  currentTab: NavTabId;
  onNavigateTab: (tabId: NavTabId) => void;
  shopInfo: ShopInfo;
}

const QUICK_PROMPTS = [
  {
    icon: Trophy,
    label: "Tournois & Cash Prizes",
    query: "Quels sont les prochains tournois et compétitions esport chez House Game ?",
  },
  {
    icon: Glasses,
    label: "Tester la VR",
    query: "Comment se passent les sessions de Réalité Virtuelle (VR) et que proposez-vous ?",
  },
  {
    icon: Wrench,
    label: "Réparation Manettes",
    query: "Ma manette drift et fait des faux contacts, combien coûte la réparation ?",
  },
  {
    icon: Gamepad2,
    label: "Conseil de Jeu",
    query: "Quel jeu me conseilles-tu pour une session entre potes chez House Game ?",
  },
  {
    icon: Compass,
    label: "Localisation & Accès",
    query: "Où se trouve précisément House Game à Yaoundé et comment venir ?",
  },
];

const MINI_QUIZ_QUESTIONS = [
  {
    q: "Dans quel type d'expérience gaming te sens-tu le plus fort ?",
    options: [
      { text: "⚽ Esport pur (FC 25, Tekken, Mortal Kombat)", profile: "Pro Esport Fighter", tab: "tournaments" as NavTabId },
      { text: "🥽 Immersion futuriste totale à 360°", profile: "Pionnier Réalité Virtuelle", tab: "activities" as NavTabId },
      { text: "🕺 Rythme, musique et danse entre amis", profile: "Star Just Dance", tab: "activities" as NavTabId },
      { text: "🕹️ Bornes d'arcade & pépites rétro", profile: "Légende Rétro Gamer", tab: "activities" as NavTabId },
    ],
  },
  {
    q: "Quelle est ta plateforme de prédilection chez House Game ?",
    options: [
      { text: "🎮 PS5 avec manette DualSense", profile: "Next-Gen Sony", tab: "shop" as NavTabId },
      { text: "🟢 Xbox Series X & Game Pass", profile: "Xbox Master", tab: "shop" as NavTabId },
      { text: "💻 Setup PC Fibre ultra haut débit", profile: "Gamer Coworking Fibre", tab: "activities" as NavTabId },
      { text: "🕶️ Casque VR autonome", profile: "Explorateur Virtuel", tab: "activities" as NavTabId },
    ],
  },
];

export const AiGameMaster: React.FC<AiGameMasterProps> = ({
  currentTab,
  onNavigateTab,
  shopInfo,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [teaserTipIndex, setTeaserTipIndex] = useState(0);
  const [showTeaser, setShowTeaser] = useState(() => {
    try {
      return sessionStorage.getItem("hg_ai_teaser_dismissed") !== "true";
    } catch {
      return false;
    }
  });
  const [quizStep, setQuizStep] = useState<number | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Yo champion ! 🔥 Je suis **HG-BOT**, l'IA et Game Master officiel de **HOUSE GAME Yaoundé**.\n\nJe suis là pour faire vibrer ton expérience sur le site : t'orienter vers les meilleurs tournois, te conseiller des jeux, t'expliquer nos casques VR, nos réparations ou nos tarifs.\n\nQue veux-tu explorer aujourd'hui ?",
      time: "Maintenant",
      suggestedTab: "activities",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const teaserTips = [
    "🎮 Besoin d'un conseil pour choisir ta manette ?",
    "🏆 Découvre les tournois Esport avec Cash Prizes !",
    "🥽 Envie de tester la Réalité Virtuelle (VR) ?",
    "🛠️ Atelier express : réparation manettes & consoles",
    "📍 Nous sommes situés derrière Total Jouvence !",
  ];

  // Auto-dismiss teaser after 8s so it never blocks forms or buttons
  useEffect(() => {
    if (!showTeaser) return;
    const hideTimer = setTimeout(() => {
      setShowTeaser(false);
    }, 8000);
    return () => clearTimeout(hideTimer);
  }, [showTeaser]);

  // Hide teaser on esport tab to avoid overlaying admin forms
  useEffect(() => {
    if (currentTab === "esport") {
      setShowTeaser(false);
    }
  }, [currentTab]);

  // Listen for global open event
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

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen, isMinimized]);

  // Optional voice synthesis
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Remove markdown chars
      const clean = text.replace(/[*_#`[\]()]/g, " ").slice(0, 200);
      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = "fr-FR";
      utter.rate = 1.05;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {
      // Speech may fail if restricted
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8, x: 0.85 },
        colors: ["#00F0FF", "#FF4438", "#FFD700", "#10B981"],
      });
      sfx.playSuccess();
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    sfx.playClick();
    setInputText("");

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
          currentTab,
        }),
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      const aiReply = data.reply || "HG-BOT est en ligne ! Pose-moi ta question champion !";
      const suggestedTab = data.suggestedTab as NavTabId | null;

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedTab: suggestedTab || undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
      sfx.playTabSwitch();
      speakText(aiReply);

      // Trigger confetti on congratulations or victories
      if (
        aiReply.toLowerCase().includes("bravo") ||
        aiReply.toLowerCase().includes("félicitations") ||
        aiReply.toLowerCase().includes("champion")
      ) {
        triggerCelebration();
      }
    } catch {
      // Fallback response if offline or server loading
      const fallbackReply =
        "🎮 Bien reçu ! Pour une réponse instantanée ou pour réserver une console ou une session VR, notre équipe House Game est directement disponible sur WhatsApp au **+237 658 413 269** !";
      const fallbackMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: fallbackReply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedTab: "shop",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakText(fallbackReply);
    } finally {
      setIsThinking(false);
    }
  };

  const handleStartQuiz = () => {
    sfx.playClick();
    setQuizStep(0);
    const quizMsg: Message = {
      id: `quiz-start-${Date.now()}`,
      sender: "ai",
      text: "🎯 **MINI-TEST GAMING EXPRESS** !\nRéponds à ces 2 questions pour découvrir l'expérience House Game sur-mesure faite pour toi :",
      time: "Maintenant",
    };
    setMessages((prev) => [...prev, quizMsg]);
  };

  const handleQuizAnswer = (profile: string, targetTab: NavTabId) => {
    sfx.playSuccess();
    triggerCelebration();
    const resultMsg: Message = {
      id: `quiz-ans-${Date.now()}`,
      sender: "ai",
      text: `🏆 **RÉSULTAT DU SCAN GAMER :**\nTu as le profil **"${profile}"** ! House Game a exactement ce qu'il te faut dans l'arène. Viens tester ton niveau ou découvrir le matériel adapté !`,
      time: "Maintenant",
      suggestedTab: targetTab,
      showConfetti: true,
    };
    setMessages((prev) => [...prev, resultMsg]);
    setQuizStep(null);
    speakText(`Résultat : Tu as le profil ${profile} !`);
  };

  const resetChat = () => {
    sfx.playClick();
    setQuizStep(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: "⚡ **Système réinitialisé !**\nHG-BOT est paré. Que veux-tu explorer ou réserver aujourd'hui ?",
        time: "Maintenant",
      },
    ]);
  };

  const formatText = (text: string) => {
    // Basic formatting for bold and bullets
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return (
        <span
          key={i}
          className="block"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <>
      {/* =========================================================================
          1. FLOATING CYBER ORB BUTTON (when closed or minimized)
         ========================================================================= */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
        {/* Animated Speech Bubble / Teaser Tip */}
        {!isOpen && showTeaser && (
          <div className="group relative mb-3 max-w-[280px] animate-bounce duration-1000 sm:max-w-[340px]">
            <div className="relative flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-[#0E121D]/95 px-3.5 py-2.5 shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-md">
              <span className="flex h-2 w-2 shrink-0 animate-ping rounded-full bg-cyan-400" />
              <p className="font-['Chakra_Petch'] text-xs font-semibold text-cyan-200">
                {teaserTips[teaserTipIndex]}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeaser(false);
                }}
                className="ml-1 text-slate-400 hover:text-white"
                title="Fermer l'indice"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            {/* Arrow tail */}
            <div className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45 border-b border-r border-cyan-500/40 bg-[#0E121D]" />
          </div>
        )}

        {/* Floating Trigger Button */}
        {!isOpen && (
          <button
            onClick={() => {
              sfx.playClick();
              setIsOpen(true);
              setIsMinimized(false);
            }}
            onMouseEnter={() => sfx.playHover()}
            id="hg-ai-trigger-btn"
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-cyan-400/80 bg-gradient-to-br from-[#121828] via-[#0A0D15] to-[#1F1020] shadow-[0_0_25px_rgba(0,240,255,0.5)] transition-all duration-300 hover:scale-105 hover:border-red-500 hover:shadow-[0_0_35px_rgba(255,68,56,0.6)] focus:outline-none"
            aria-label="Ouvrir HG-BOT l'IA Game Master"
          >
            {/* Rotating Cyber Rings */}
            <div className="absolute inset-0 -m-1 rounded-2xl border border-cyan-400/30 opacity-75 animate-pulse" />
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_#FF4438]" />
            </div>

            {/* Glowing Bot Icon */}
            <div className="relative flex items-center justify-center">
              <Bot className="h-7 w-7 text-cyan-300 transition-colors duration-300 group-hover:text-red-400" />
              <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
            </div>

            {/* Micro Badge for mobile */}
            <span className="absolute -bottom-2 rounded-full border border-cyan-400/40 bg-[#07090E] px-1.5 py-0.2 text-[9px] font-['JetBrains_Mono'] font-bold text-cyan-300 shadow">
              IA
            </span>
          </button>
        )}
      </div>

      {/* =========================================================================
          2. EXPANDED HOLOGRAPHIC CHAT MODAL / HUD
         ========================================================================= */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-cyan-500/50 bg-[#0B0F19]/95 shadow-[0_0_40px_rgba(0,240,255,0.3)] backdrop-blur-xl transition-all duration-300 ${
            isMinimized
              ? "h-14 w-80 sm:w-96"
              : "h-[85vh] max-h-[640px] w-[95vw] sm:w-[420px]"
          }`}
        >
          {/* Scanlines Overlay for Authentic Retro/Sci-Fi HUD */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-red-950/10" />

          {/* HUD Header */}
          <div className="relative flex items-center justify-between border-b border-cyan-500/30 bg-gradient-to-r from-[#121828] via-[#0E1322] to-[#1A0F1E] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/60 bg-cyan-950/40 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                <Bot className="h-5 w-5 text-cyan-300" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Orbitron'] text-xs font-black tracking-wider text-white">
                    HG-BOT <span className="text-cyan-400">IA</span>
                  </h3>
                  <span className="rounded bg-red-500/20 px-1.5 py-0.5 font-['JetBrains_Mono'] text-[9px] font-bold text-red-300 border border-red-500/30">
                    GAME MASTER
                  </span>
                </div>
                <p className="font-['Chakra_Petch'] text-[10px] text-cyan-300/80">
                  Guide officiel House Game Yaoundé
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5">
              {/* Voice toggle */}
              <button
                onClick={() => {
                  sfx.playClick();
                  setSpeechEnabled(!speechEnabled);
                }}
                className={`rounded-lg p-1.5 transition-colors ${
                  speechEnabled
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white"
                }`}
                title={speechEnabled ? "Voix activée (cliquer pour couper)" : "Activer la synthèse vocale"}
              >
                {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Reset chat */}
              <button
                onClick={resetChat}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Réinitialiser la conversation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Minimize / Maximize */}
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsMinimized(!isMinimized);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title={isMinimized ? "Agrandir" : "Réduire"}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </button>

              {/* Close */}
              <button
                onClick={() => {
                  sfx.playClick();
                  setIsOpen(false);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* HUD Body (if not minimized) */}
          {!isMinimized && (
            <div className="relative flex flex-1 flex-col overflow-hidden bg-[#07090E]/80">
              {/* Quick Actions Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-b border-cyan-500/20 bg-[#0E1322]/60 px-3 py-2 scrollbar-none">
                <button
                  onClick={handleStartQuiz}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-['JetBrains_Mono'] text-[11px] font-bold text-amber-300 transition-all hover:bg-amber-500/20 hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                >
                  <Flame className="h-3 w-3 text-amber-400 animate-pulse" />
                  Quiz Gamer Express
                </button>

                {QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.query)}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/60 px-2.5 py-1 font-['Chakra_Petch'] text-[11px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:bg-cyan-950/30 hover:text-cyan-200"
                    >
                      <Icon className="h-3 w-3 text-cyan-400" />
                      {prompt.label}
                    </button>
                  );
                })}
              </div>

              {/* Messages Container */}
              <div className="flex-1 space-y-3.5 overflow-y-auto p-4 text-xs scrollbar-thin scrollbar-thumb-slate-700">
                {messages.map((msg) => {
                  const isAi = msg.sender === "ai";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAi ? "items-start" : "items-end"} space-y-1.5`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-['JetBrains_Mono']">
                        {isAi ? (
                          <span className="flex items-center gap-1 text-cyan-400 font-bold">
                            <Zap className="h-3 w-3 text-cyan-400" /> HG-BOT
                          </span>
                        ) : (
                          <span className="text-slate-400">Toi</span>
                        )}
                        <span>•</span>
                        <span>{msg.time}</span>
                      </div>

                      <div
                        className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed font-['Chakra_Petch'] shadow-md ${
                          isAi
                            ? "border border-cyan-500/30 bg-gradient-to-br from-[#121828] to-[#0E121E] text-[#D6DCE6] shadow-[0_0_15px_rgba(0,240,255,0.05)]"
                            : "border border-red-500/40 bg-gradient-to-r from-red-600 to-rose-700 text-white font-medium"
                        }`}
                      >
                        {formatText(msg.text)}

                        {/* Interactive In-Message Navigation CTA */}
                        {msg.suggestedTab && (
                          <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                sfx.playClick();
                                onNavigateTab(msg.suggestedTab!);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-500/20 px-3 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-cyan-200 transition-all hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                            >
                              <span>Explorer cette section</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            <a
                              href={`https://wa.me/${shopInfo.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                "Bonjour House Game ! J'ai discuté avec votre IA HG-BOT et j'aimerais plus d'informations."
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 font-['JetBrains_Mono'] text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/20"
                            >
                              <MessageCircle className="h-3 w-3" />
                              WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Interactive Mini-Quiz Options if active */}
                {quizStep !== null && MINI_QUIZ_QUESTIONS[quizStep] && (
                  <div className="rounded-xl border border-amber-500/40 bg-[#161B29] p-3 space-y-2 animate-fadeIn">
                    <p className="font-['Orbitron'] text-xs font-bold text-amber-300">
                      Question {quizStep + 1}/2 :
                    </p>
                    <p className="font-['Chakra_Petch'] text-xs text-white">
                      {MINI_QUIZ_QUESTIONS[quizStep].q}
                    </p>
                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {MINI_QUIZ_QUESTIONS[quizStep].options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => handleQuizAnswer(opt.profile, opt.tab)}
                          className="text-left rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-['Chakra_Petch'] text-slate-200 transition-all hover:border-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-200"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Thinking indicator */}
                {isThinking && (
                  <div className="flex items-center gap-2 text-cyan-400 font-['JetBrains_Mono'] text-xs">
                    <span className="flex h-2 w-2 animate-ping rounded-full bg-cyan-400" />
                    <span>HG-BOT analyse ta requête gaming...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions Grid */}
              <div className="border-t border-slate-800/80 bg-[#0A0D16] p-2.5">
                <p className="mb-1.5 font-['JetBrains_Mono'] text-[10px] text-slate-400 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-cyan-400" /> Questions rapides :
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.slice(2).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.query)}
                      className="rounded-md border border-slate-700/80 bg-slate-800/50 px-2 py-1 font-['Chakra_Petch'] text-[10px] text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200 transition-colors"
                    >
                      {prompt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="border-t border-cyan-500/30 bg-[#0E1322] p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Pose ta question gaming ou demande un conseil..."
                    className="flex-1 rounded-xl border border-slate-700 bg-[#07090E] px-3.5 py-2.5 font-['Chakra_Petch'] text-xs text-white placeholder-slate-500 transition-all focus:border-cyan-400 focus:bg-[#0B0F19] focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isThinking}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_12px_rgba(255,68,56,0.4)] transition-all hover:from-red-500 hover:to-rose-500 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                    title="Envoyer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
