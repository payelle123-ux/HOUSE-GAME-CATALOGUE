import React, { useState, useRef } from "react";
import {
  ShoppingBag,
  Wrench,
  Trophy,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  ExternalLink,
  Edit3,
  Maximize2,
  Upload,
  X,
  RotateCcw,
  Database,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { HomeContent, ShopInfo, NavTabId } from "../types";
import { OFFICIAL_BANNER_SRC } from "../data/logo";
import { compressImage } from "../services/storage";
import { AnimatedCounter } from "./AnimatedCounter";
import { GamingParticles } from "./GamingParticles";
import { ScrollReveal } from "./ScrollReveal";
import { sfx } from "../services/soundEffects";

interface HomeTabProps {
  homeContent: HomeContent;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenEditHome: () => void;
  onNavigateTab: (tabId: NavTabId) => void;
  onUpdateBannerImage?: (newUrl: string) => Promise<void> | void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  homeContent,
  shopInfo,
  isAdmin,
  onOpenEditHome,
  onNavigateTab,
  onUpdateBannerImage,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [customBannerUrl, setCustomBannerUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bannerTilt, setBannerTilt] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setBannerTilt({ x: x * 4, y: -y * 4 });
  };

  const handleBannerMouseLeave = () => {
    setBannerTilt({ x: 0, y: 0 });
  };

  // Active banner image (falls back to the official House Game banner)
  const currentBanner = homeContent.bannerImage || OFFICIAL_BANNER_SRC;

  const processAndSaveImage = async (imageUrl: string) => {
    if (!onUpdateBannerImage) return;
    try {
      setIsSavingCloud(true);
      setSyncError(null);
      await onUpdateBannerImage(imageUrl);
      setSyncSuccess(true);
      setTimeout(() => {
        setSyncSuccess(false);
        setIsBannerModalOpen(false);
      }, 1400);
    } catch (err) {
      console.error("Erreur de synchronisation Firestore :", err);
      setSyncError("Erreur lors de la synchronisation avec la base de données. Vérifiez votre connexion.");
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setSyncError("Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).");
      return;
    }
    try {
      setIsUploading(true);
      setSyncError(null);
      // Compress to optimal resolution to fit effortlessly within Firestore 1MB document quota
      const compressed = await compressImage(file, 1300, 0.78);
      await processAndSaveImage(compressed);
    } catch (err) {
      console.error("Error processing banner file:", err);
      setSyncError("Erreur lors de la compression de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await handleFileProcess(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileProcess(file);
    }
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBannerUrl.trim()) return;
    await processAndSaveImage(customBannerUrl.trim());
    setCustomBannerUrl("");
  };

  const handleResetDefaultBanner = async () => {
    await processAndSaveImage(OFFICIAL_BANNER_SRC);
  };

  return (
    <div id="home-tab-view" className="space-y-8 pb-10 animate-fadeIn">
      {/* Admin Action Ribbon */}
      {isAdmin && (
        <div
          id="admin-home-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-['JetBrains_Mono'] font-bold">
              ESPACE PRO ACTIF : Vous pouvez personnaliser les textes, statistiques et partenaires de l'accueil.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBannerModalOpen(true)}
              id="admin-change-banner-ribbon-btn"
              className="flex items-center gap-1.5 rounded-lg border border-[#3E9BFF]/50 bg-[#3E9BFF]/20 px-3 py-1.5 font-['JetBrains_Mono'] font-bold text-[#3E9BFF] hover:bg-[#3E9BFF]/30 transition"
            >
              <Upload size={13} />
              <span>Changer la bannière</span>
            </button>
            <button
              onClick={onOpenEditHome}
              id="admin-edit-home-btn"
              className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <Edit3 size={14} />
              <span>Modifier l'accueil</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ESPACE BANNIÈRE OFFICIELLE GRAND FORMAT (IMAGE SEULE) */}
      {/* ========================================================= */}
      <section
        id="official-banner-showcase"
        onMouseMove={handleBannerMouseMove}
        onMouseLeave={handleBannerMouseLeave}
        style={{
          transform: `perspective(1000px) rotateY(${bannerTilt.x}deg) rotateX(${bannerTilt.y}deg)`,
          transition: "transform 0.15s ease-out, border-color 0.3s ease",
        }}
        className="group relative overflow-hidden rounded-2xl border border-white/15 bg-[#0A0D14] shadow-[0_0_35px_rgba(62,155,255,0.12)] transition-all hover:border-[#3E9BFF]/60 hover:shadow-[0_0_50px_rgba(62,155,255,0.25)] hud-box"
      >
        {/* Banner Media Container */}
        <div className="relative w-full overflow-hidden bg-black/90 flex items-center justify-center">
          <img
            src={currentBanner}
            alt="House Game - Entreprise de Divertissement, Loisirs, Éducation par le jeu vidéo"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain cursor-pointer transition-transform duration-500 group-hover:scale-[1.01]"
            onClick={() => setIsLightboxOpen(true)}
            title="Cliquer pour afficher la bannière en haute définition"
          />

          {/* Quick Floating Actions over Banner */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            <button
              onClick={() => setIsLightboxOpen(true)}
              id="btn-zoom-banner"
              className="gaming-btn flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/70 backdrop-blur-md px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-lg hover:bg-[#3E9BFF] hover:border-[#3E9BFF] transition-all cursor-pointer"
              title="Agrandir en plein écran"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">Plein écran</span>
            </button>

            <button
              onClick={() => {
                setSyncSuccess(false);
                setSyncError(null);
                setIsBannerModalOpen(true);
              }}
              id="btn-change-banner"
              className="gaming-btn flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-black/80 backdrop-blur-md px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 shadow-lg hover:bg-amber-500 hover:text-black hover:border-amber-400 transition-all cursor-pointer"
              title="Changer la bannière et synchroniser avec la base de données Firestore"
            >
              <Database size={13} className="text-emerald-400" />
              <span>Changer la bannière</span>
            </button>
          </div>
        </div>
      </section>

      {/* Hero Section — Court & Impactant */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] shadow-2xl hud-box group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-0 cyber-grid-pattern opacity-25 z-10" />
        <GamingParticles />

        <img
          src={
            homeContent.bannerImage ||
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80"
          }
          alt="House Game Universe"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30 mix-blend-luminosity filter saturate-150 transition-transform duration-700 group-hover:scale-105"
        />

        <div className="relative z-20 max-w-3xl p-6 sm:p-10 lg:p-12 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4438]/40 bg-[#FF4438]/10 px-3.5 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-[#FF4438] shadow-[0_0_15px_rgba(255,68,56,0.25)]">
            <span className="h-2 w-2 rounded-full bg-[#FF4438] animate-pulse" />
            <span>HOUSE GAME • HUB GAMING OFFICIEL</span>
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight hover-glitch transition-all cursor-default">
            {homeContent.heroTitle || "L'UNIVERS ULTIME DU GAMING & DE L'ESPORT"}
          </h1>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-[#A0AEC0] leading-relaxed max-w-2xl">
            {homeContent.heroSubtitle ||
              "Vente de consoles & accessoires neufs et certifiés, atelier de réparation haute précision, et tournois Esport d'envergure."}
          </p>

          {/* Action CTAs vers les onglets principaux */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => {
                sfx.playClick();
                onNavigateTab("shop");
              }}
              onMouseEnter={() => sfx.playHover()}
              id="cta-shop-btn"
              className="gaming-btn flex items-center gap-2 rounded-xl border border-[#FF4438]/60 bg-[#FF4438] px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_20px_rgba(255,68,56,0.4)] transition hover:bg-[#ff6459] hover:shadow-[0_0_30px_rgba(255,68,56,0.6)] active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={16} />
              <span>BOUTIQUE</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                onNavigateTab("events");
              }}
              onMouseEnter={() => sfx.playHover()}
              id="cta-events-btn"
              className="gaming-btn flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-purple-300 transition hover:bg-purple-500/25 hover:border-purple-400 active:scale-95 cursor-pointer"
            >
              <Trophy size={16} />
              <span>HG EVENT</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                onNavigateTab("service");
              }}
              onMouseEnter={() => sfx.playHover()}
              id="cta-service-btn"
              className="gaming-btn flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-400 active:scale-95 cursor-pointer"
            >
              <Wrench size={16} />
              <span>HG SERVICE</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                onNavigateTab("campus");
              }}
              onMouseEnter={() => sfx.playHover()}
              id="cta-campus-btn"
              className="gaming-btn flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 hover:border-emerald-400 active:scale-95 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>HG CAMPUS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar with AnimatedCounter & ScrollReveal */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {homeContent.stats?.map((stat, idx) => (
          <ScrollReveal key={idx} delay={idx * 80} direction="up">
            <div
              onMouseEnter={() => sfx.playHover()}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0E121B] p-4 sm:p-5 transition-all duration-300 hover:border-[#3E9BFF]/60 hover:bg-[#121723] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(62,155,255,0.2)] hud-box h-full flex flex-col justify-between"
            >
              <div className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white group-hover:text-[#3E9BFF] transition-colors">
                <AnimatedCounter value={stat.value} />
              </div>
              <div className="font-['JetBrains_Mono'] text-xs font-bold text-[#FF4438] mt-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-[#7C8798] mt-0.5 font-['Chakra_Petch']">
                {stat.desc}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </section>

      {/* Section : Qui sommes nous * Nos partenaires */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Qui sommes nous */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-8 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#3E9BFF] font-bold">
              <Users size={16} />
              <span>QUI SOMMES NOUS</span>
            </div>

            <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white leading-tight">
              L'écosystème de référence gaming & esport
            </h2>

            <p className="font-['Chakra_Petch'] text-sm text-[#A0AEC0] leading-relaxed">
              {homeContent.aboutText ||
                "House Game est né d'une vision ambitieuse : offrir aux joueurs et passionnés un écosystème 100% dédié au jeu vidéo, fondé sur l'authenticité certifiée, la performance technique et le rassemblement communautaire. Que vous cherchiez la dernière console next-gen scellée d'origine, un accessoire introuvable, une réparation électronique haute précision sous microscope ou une arène pour mesurer vos talents esportifs, l'équipe House Game met son expertise et sa passion au service de votre expérience."}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab("activities")}
              className="inline-flex items-center gap-2 text-xs font-bold font-['JetBrains_Mono'] text-[#3E9BFF] hover:text-white transition-colors"
            >
              <span>Découvrir toutes nos activités</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Nos partenaires */}
        <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-amber-400 font-bold mb-3">
              <Award size={16} />
              <span>NOS PARTENAIRES</span>
            </div>

            <h3 className="font-['Orbitron'] text-xl font-bold text-white mb-2">
              Des alliances avec les leaders de l'industrie
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] mb-4">
              Garantie d'authenticité matérielle, connectivité satellite ultra-rapide et collaborations exclusives.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {homeContent.partners?.map((partner, pIdx) => (
              <div
                key={pIdx}
                className="p-3 rounded-xl border border-white/5 bg-[#141824] hover:border-white/20 transition-all flex flex-col items-center text-center group"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="w-10 h-10 rounded-lg object-cover mb-2 border border-white/10 group-hover:scale-105 transition-transform"
                />
                <span className="font-['Orbitron'] text-xs font-bold text-white line-clamp-1">
                  {partner.name}
                </span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#7C8798] line-clamp-1 mt-0.5">
                  {partner.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODAL 1 : LIGHTBOX PLEIN ÉCRAN POUR L'AFFICHE / BANNIÈRE */}
      {/* ========================================================= */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[95vh] overflow-hidden rounded-2xl border border-white/20 bg-[#0B0E17] p-2 sm:p-4 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 px-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#3E9BFF] animate-pulse" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                  AFFICHE OFFICIELLE HOUSE GAME
                </h3>
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Image Full HD */}
            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/60 rounded-xl p-2">
              <img
                src={currentBanner}
                alt="House Game Panoramic Banner"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Footer with actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 px-2 text-xs">
              <div className="text-slate-400 font-['Chakra_Petch']">
                House Game • Hub Gaming & Esport Officiel
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentBanner}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 font-['JetBrains_Mono'] text-white hover:bg-white/10 transition"
                >
                  <ExternalLink size={13} />
                  <span>Ouvrir dans un onglet</span>
                </a>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="rounded-lg bg-[#3E9BFF] px-4 py-1.5 font-['JetBrains_Mono'] font-bold text-white hover:bg-[#3282db] transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2 : CHANGER LA BANNIÈRE & SYNCHRONISATION BDD */}
      {/* ========================================================= */}
      {isBannerModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            if (!isSavingCloud && !isUploading) setIsBannerModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/40 bg-[#12151E] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-amber-400 font-bold font-['Orbitron'] text-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Database size={16} />
                </div>
                <div>
                  <span className="block text-white font-bold">MODIFIER LA BANNIÈRE</span>
                  <span className="text-[10px] text-amber-300/80 font-['JetBrains_Mono'] tracking-normal">
                    SYNCHRONISATION EN TEMPS RÉEL SUR LA BASE DE DONNÉES
                  </span>
                </div>
              </div>
              <button
                disabled={isSavingCloud || isUploading}
                onClick={() => setIsBannerModalOpen(false)}
                className="text-slate-400 hover:text-white disabled:opacity-40 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 font-['JetBrains_Mono'] text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-[11px]">Base de données Firestore connectée</span>
              </div>
              <span className="rounded bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                ai-studio-housegame...
              </span>
            </div>

            {/* Notification Messages */}
            {syncSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-3 text-xs text-emerald-200 font-['JetBrains_Mono'] animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Bannière enregistrée et synchronisée avec succès dans la base de données Firestore !</span>
              </div>
            )}

            {syncError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/20 p-3 text-xs text-red-200 font-['JetBrains_Mono'] animate-fadeIn">
                <X size={16} className="text-red-400 flex-shrink-0" />
                <span>{syncError}</span>
              </div>
            )}

            {/* Current Banner Preview */}
            <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs">
              <label className="block text-slate-300 font-bold text-[11px]">
                Aperçu de la bannière actuelle :
              </label>
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/60 aspect-[21/9] flex items-center justify-center">
                <img
                  src={currentBanner}
                  alt="Aperçu Bannière"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
                {isSavingCloud && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10 text-white font-['JetBrains_Mono'] text-xs">
                    <Loader2 size={24} className="animate-spin text-amber-400" />
                    <span>Synchronisation avec la base de données...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 font-['JetBrains_Mono'] text-xs">
              {/* Option A: Upload file with Drag & Drop */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`rounded-xl border transition-all p-4 space-y-3 ${
                  isDragging
                    ? "border-[#3E9BFF] bg-[#3E9BFF]/15 ring-2 ring-[#3E9BFF]/30"
                    : "border-white/10 bg-[#0E1119]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold flex items-center gap-2">
                    <ImageIcon size={14} className="text-[#3E9BFF]" />
                    <span>OPTION 1 : Importer depuis votre appareil</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Glisser-déposer ou clic</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  disabled={isUploading || isSavingCloud}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#3E9BFF]/40 bg-[#3E9BFF]/10 py-5 px-4 text-[#3E9BFF] hover:bg-[#3E9BFF]/20 hover:border-[#3E9BFF] transition cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={22} className="animate-spin text-[#3E9BFF]" />
                      <span className="font-bold">Optimisation & compression de l'image...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={22} className="text-[#3E9BFF]" />
                      <span className="font-bold text-white">
                        Glissez une image ici ou cliquez pour sélectionner
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Format recommandé : 16:9 ou 21:9 (JPG, PNG, WEBP) • Compression automatique pour Firestore
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Option B: Enter URL */}
              <form onSubmit={handleSaveUrl} className="rounded-xl border border-white/10 bg-[#0E1119] p-4 space-y-3">
                <label className="block text-slate-300 font-bold">
                  OPTION 2 : Ou renseigner une adresse URL directe
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customBannerUrl}
                    onChange={(e) => setCustomBannerUrl(e.target.value)}
                    placeholder="https://example.com/ma-nouvelle-banniere.jpg"
                    disabled={isSavingCloud || isUploading}
                    className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#3E9BFF] focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!customBannerUrl.trim() || isSavingCloud || isUploading}
                    className="rounded-lg bg-[#3E9BFF] px-4 py-2 font-bold text-white hover:bg-[#3282db] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    {isSavingCloud ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>Appliquer</span>
                  </button>
                </div>
              </form>

              {/* Reset Option */}
              <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <button
                  type="button"
                  disabled={isSavingCloud || isUploading}
                  onClick={handleResetDefaultBanner}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition cursor-pointer disabled:opacity-40"
                >
                  <RotateCcw size={13} />
                  <span>Rétablir l'affiche officielle House Game</span>
                </button>

                <button
                  type="button"
                  disabled={isSavingCloud || isUploading}
                  onClick={() => setIsBannerModalOpen(false)}
                  className="rounded-lg border border-white/15 px-4 py-1.5 text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
