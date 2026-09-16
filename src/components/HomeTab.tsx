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
} from "lucide-react";
import { HomeContent, ShopInfo, NavTabId } from "../types";
import { OFFICIAL_BANNER_SRC } from "../data/logo";
import { compressImage } from "../services/storage";

interface HomeTabProps {
  homeContent: HomeContent;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenEditHome: () => void;
  onNavigateTab: (tabId: NavTabId) => void;
  onUpdateBannerImage?: (newUrl: string) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active banner image (falls back to the official House Game banner)
  const currentBanner = homeContent.bannerImage || OFFICIAL_BANNER_SRC;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const compressed = await compressImage(file, 1600, 0.85);
      if (onUpdateBannerImage) {
        onUpdateBannerImage(compressed);
      }
      setIsBannerModalOpen(false);
    } catch (err) {
      console.error("Error uploading banner image:", err);
      alert("Erreur lors du traitement de l'image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customBannerUrl.trim() && onUpdateBannerImage) {
      onUpdateBannerImage(customBannerUrl.trim());
      setIsBannerModalOpen(false);
      setCustomBannerUrl("");
    }
  };

  const handleResetDefaultBanner = () => {
    if (onUpdateBannerImage) {
      onUpdateBannerImage(OFFICIAL_BANNER_SRC);
      setIsBannerModalOpen(false);
    }
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
        className="group relative overflow-hidden rounded-2xl border border-white/15 bg-[#0A0D14] shadow-[0_0_35px_rgba(62,155,255,0.12)] transition-all hover:border-[#3E9BFF]/40"
      >
        {/* Banner Media Container */}
        <div className="relative w-full overflow-hidden bg-black/90 flex items-center justify-center">
          <img
            src={currentBanner}
            alt="House Game - Entreprise de Divertissement, Loisirs, Éducation par le jeu vidéo"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain cursor-pointer transition-transform duration-500 group-hover:scale-[1.008]"
            onClick={() => setIsLightboxOpen(true)}
            title="Cliquer pour afficher la bannière en haute définition"
          />

          {/* Quick Floating Actions over Banner */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            <button
              onClick={() => setIsLightboxOpen(true)}
              id="btn-zoom-banner"
              className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/70 backdrop-blur-md px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-lg hover:bg-[#3E9BFF] hover:border-[#3E9BFF] transition-all"
              title="Agrandir en plein écran"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">Plein écran</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsBannerModalOpen(true)}
                id="btn-admin-edit-banner"
                className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-black/80 backdrop-blur-md px-3 py-1.5 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 shadow-lg hover:bg-amber-500 hover:text-black transition-all"
                title="Modifier l'image de cette bannière"
              >
                <Upload size={13} />
                <span className="hidden sm:inline">Changer l'image</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Hero Section — Court & Impactant */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/90 to-transparent z-10" />
        <img
          src={
            homeContent.bannerImage ||
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80"
          }
          alt="House Game Universe"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30 mix-blend-luminosity filter saturate-150"
        />

        <div className="relative z-20 max-w-3xl p-6 sm:p-10 lg:p-12 space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4438]/40 bg-[#FF4438]/10 px-3 py-1 font-['JetBrains_Mono'] text-xs font-bold text-[#FF4438]">
            <span className="h-2 w-2 rounded-full bg-[#FF4438] animate-pulse" />
            <span>HOUSE GAME • HUB GAMING OFFICIEL</span>
          </div>

          <h1 className="font-['Orbitron'] text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            {homeContent.heroTitle || "L'UNIVERS ULTIME DU GAMING & DE L'ESPORT"}
          </h1>

          <p className="font-['Chakra_Petch'] text-sm sm:text-base text-[#A0AEC0] leading-relaxed max-w-2xl">
            {homeContent.heroSubtitle ||
              "Vente de consoles & accessoires neufs et certifiés, atelier de réparation haute précision, et tournois Esport d'envergure."}
          </p>

          {/* Action CTAs vers les onglets principaux */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigateTab("shop")}
              id="cta-shop-btn"
              className="flex items-center gap-2 rounded-xl border border-[#FF4438]/60 bg-[#FF4438] px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_20px_rgba(255,68,56,0.4)] transition hover:bg-[#ff6459] active:scale-95"
            >
              <ShoppingBag size={16} />
              <span>BOUTIQUE</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => onNavigateTab("events")}
              id="cta-events-btn"
              className="flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-purple-300 transition hover:bg-purple-500/25 active:scale-95"
            >
              <Trophy size={16} />
              <span>HG EVENT</span>
            </button>

            <button
              onClick={() => onNavigateTab("service")}
              id="cta-service-btn"
              className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 active:scale-95"
            >
              <Wrench size={16} />
              <span>HG SERVICE</span>
            </button>

            <button
              onClick={() => onNavigateTab("campus")}
              id="cta-campus-btn"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 active:scale-95"
            >
              <Sparkles size={16} />
              <span>HG CAMPUS</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {homeContent.stats?.map((stat, idx) => (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#0E121B] p-4 sm:p-5 transition hover:border-[#3E9BFF]/40 hover:bg-[#121723]"
          >
            <div className="font-['Orbitron'] text-2xl sm:text-3xl font-black text-white group-hover:text-[#3E9BFF] transition-colors">
              {stat.value}
            </div>
            <div className="font-['JetBrains_Mono'] text-xs font-bold text-[#FF4438] mt-1">
              {stat.label}
            </div>
            <div className="text-[11px] text-[#7C8798] mt-0.5 font-['Chakra_Petch']">
              {stat.desc}
            </div>
          </div>
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
      {/* MODAL 2 : ADMIN CHANGER L'IMAGE DE LA BANNIÈRE */}
      {/* ========================================================= */}
      {isBannerModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsBannerModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-amber-500/40 bg-[#12151E] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold font-['Orbitron']">
                <Upload size={18} />
                <span>MODIFIER LA BANNIÈRE D'ACCUEIL</span>
              </div>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 font-['JetBrains_Mono'] text-xs">
              {/* Option A: Upload file from computer/device */}
              <div className="rounded-xl border border-white/10 bg-[#0E1119] p-4 space-y-3">
                <label className="block text-slate-300 font-bold">
                  OPTION 1 : Importer une image depuis votre appareil
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#3E9BFF]/50 bg-[#3E9BFF]/10 py-4 text-[#3E9BFF] hover:bg-[#3E9BFF]/20 transition"
                >
                  <Upload size={16} />
                  <span>
                    {isUploading ? "Compression & import..." : "Sélectionner une image (JPG, PNG)"}
                  </span>
                </button>
                <p className="text-[10px] text-slate-400">
                  Recommandé : image horizontale (ratio 16:9 ou 21:9) pour un affichage optimal.
                </p>
              </div>

              {/* Option B: Enter URL */}
              <form onSubmit={handleSaveUrl} className="rounded-xl border border-white/10 bg-[#0E1119] p-4 space-y-3">
                <label className="block text-slate-300 font-bold">
                  OPTION 2 : Ou renseigner une adresse URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customBannerUrl}
                    onChange={(e) => setCustomBannerUrl(e.target.value)}
                    placeholder="https://example.com/banniere.jpg"
                    className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white placeholder-slate-500 focus:border-[#3E9BFF] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-[#3E9BFF] px-4 py-2 font-bold text-white hover:bg-[#3282db] transition"
                  >
                    Valider
                  </button>
                </div>
              </form>

              {/* Reset Option */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  type="button"
                  onClick={handleResetDefaultBanner}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition"
                >
                  <RotateCcw size={13} />
                  <span>Rétablir l'affiche officielle House Game</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-1.5 text-slate-300 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
