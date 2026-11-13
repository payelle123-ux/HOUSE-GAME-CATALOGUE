import React, { useState, useRef } from "react";
import {
  ShoppingBag,
  Wrench,
  Trophy,
  ArrowRight,
  Sparkles,
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
  Bot,
  Plus,
  Trash2,
  Globe,
  Share2,
  Link as LinkIcon,
} from "lucide-react";
import {
  HomeContent,
  HomePartner,
  ShopInfo,
  NavTabId,
  SocialPlatforms,
} from "../types";
import { OFFICIAL_BANNER_SRC } from "../data/logo";
import { compressImage } from "../services/storage";
import { compressLogoPreservingAlpha } from "../services/esportService";
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
  onSaveHomeContent?: (updated: HomeContent) => Promise<void> | void;
}

const normalizeExternalUrl = (url?: string): string => {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const FacebookIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export const HomeTab: React.FC<HomeTabProps> = ({
  homeContent,
  isAdmin,
  onOpenEditHome,
  onNavigateTab,
  onUpdateBannerImage,
  onSaveHomeContent,
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

  // Partner Modal State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartnerIdx, setEditingPartnerIdx] = useState<number | null>(null);
  const [partnerForm, setPartnerForm] = useState<HomePartner>({
    name: "",
    category: "",
    logo: "",
    tagline: "",
    websiteUrl: "",
  });
  const [partnerSaving, setPartnerSaving] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);
  const [partnerToDeleteIdx, setPartnerToDeleteIdx] = useState<number | null>(null);
  const partnerLogoInputRef = useRef<HTMLInputElement>(null);

  // Social Links Modal State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialForm, setSocialForm] = useState<SocialPlatforms>({
    facebook: "",
    instagram: "",
    tiktok: "",
  });
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialSavedMsg, setSocialSavedMsg] = useState(false);

  const handleBannerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setBannerTilt({ x: x * 4, y: -y * 4 });
  };

  const handleBannerMouseLeave = () => {
    setBannerTilt({ x: 0, y: 0 });
  };

  const currentBanner = homeContent.bannerImage || OFFICIAL_BANNER_SRC;
  const partners = Array.isArray(homeContent.partners) ? homeContent.partners : [];
  const socialLinks = homeContent.socialLinks || {};

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

  // ==================== PARTNER HANDLERS ====================
  const openAddPartnerModal = () => {
    setEditingPartnerIdx(null);
    setPartnerForm({
      id: "part_" + Date.now(),
      name: "",
      category: "",
      logo: "",
      tagline: "",
      websiteUrl: "",
    });
    setPartnerError(null);
    setIsPartnerModalOpen(true);
  };

  const openEditPartnerModal = (partner: HomePartner, idx: number) => {
    setEditingPartnerIdx(idx);
    setPartnerForm({
      id: partner.id || `part_${idx}_${Date.now()}`,
      name: partner.name || "",
      category: partner.category || "",
      logo: partner.logo || "",
      tagline: partner.tagline || "",
      websiteUrl: partner.websiteUrl || "",
    });
    setPartnerError(null);
    setIsPartnerModalOpen(true);
  };

  const handlePartnerLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPartnerError("Veuillez sélectionner une image valide (PNG, SVG, JPG, WEBP).");
      return;
    }
    try {
      setPartnerError(null);
      const compressed = await compressLogoPreservingAlpha(file, 450);
      setPartnerForm((prev) => ({ ...prev, logo: compressed }));
    } catch {
      setPartnerError("Impossible de charger ce logo. Essayez un autre fichier.");
    } finally {
      if (partnerLogoInputRef.current) partnerLogoInputRef.current.value = "";
    }
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.name.trim()) {
      setPartnerError("Veuillez saisir le nom du partenaire.");
      return;
    }
    if (!partnerForm.logo.trim()) {
      setPartnerError("Veuillez importer un logo ou coller son URL.");
      return;
    }
    if (!onSaveHomeContent) return;

    setPartnerSaving(true);
    setPartnerError(null);
    try {
      const cleaned: HomePartner = {
        id: partnerForm.id || "part_" + Date.now(),
        name: partnerForm.name.trim(),
        category: partnerForm.category?.trim() || "Partenaire Officiel",
        logo: partnerForm.logo.trim(),
        tagline: partnerForm.tagline?.trim() || "",
        websiteUrl: partnerForm.websiteUrl?.trim() || "",
      };

      const updatedPartners =
        editingPartnerIdx !== null
          ? partners.map((p, i) => (i === editingPartnerIdx ? cleaned : p))
          : [...partners, cleaned];

      await onSaveHomeContent({
        ...homeContent,
        partners: updatedPartners,
      });
      setIsPartnerModalOpen(false);
    } catch {
      setPartnerError("Erreur lors de l'enregistrement du partenaire.");
    } finally {
      setPartnerSaving(false);
    }
  };

  const handleConfirmDeletePartner = async () => {
    if (partnerToDeleteIdx === null || !onSaveHomeContent) return;
    const updatedPartners = partners.filter((_, i) => i !== partnerToDeleteIdx);
    await onSaveHomeContent({
      ...homeContent,
      partners: updatedPartners,
    });
    setPartnerToDeleteIdx(null);
  };

  // ==================== SOCIAL LINKS HANDLERS ====================
  const openSocialLinksModal = () => {
    setSocialForm({
      facebook: socialLinks.facebook || "",
      instagram: socialLinks.instagram || "",
      tiktok: socialLinks.tiktok || "",
    });
    setSocialSavedMsg(false);
    setIsSocialModalOpen(true);
  };

  const handleSaveSocialLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveHomeContent) return;
    setSocialSaving(true);
    try {
      await onSaveHomeContent({
        ...homeContent,
        socialLinks: {
          facebook: (socialForm.facebook || "").trim(),
          instagram: (socialForm.instagram || "").trim(),
          tiktok: (socialForm.tiktok || "").trim(),
        },
      });
      setSocialSavedMsg(true);
      setTimeout(() => {
        setSocialSavedMsg(false);
        setIsSocialModalOpen(false);
      }, 900);
    } finally {
      setSocialSaving(false);
    }
  };

  const platformCards = [
    {
      id: "facebook" as const,
      name: "Facebook",
      handle: "Page Officielle HOUSE GAME",
      desc: "Actualités, directs, nouveautés boutique et albums événements.",
      url: normalizeExternalUrl(socialLinks.facebook),
      icon: FacebookIcon,
      accentBorder: "border-[#1877F2]/40 hover:border-[#1877F2]",
      accentBg: "from-[#1877F2]/20 via-[#1877F2]/5 to-transparent",
      iconWrap: "bg-[#1877F2]/15 text-[#4A9EFF] border-[#1877F2]/40",
      badgeText: "text-[#4A9EFF]",
      ctaLabel: "Suivre sur Facebook",
    },
    {
      id: "instagram" as const,
      name: "Instagram",
      handle: "@housegame_officiel",
      desc: "Reels gaming, setups VIP, arrivages consoles & stories arène.",
      url: normalizeExternalUrl(socialLinks.instagram),
      icon: InstagramIcon,
      accentBorder: "border-pink-500/40 hover:border-pink-400",
      accentBg: "from-pink-500/20 via-amber-500/5 to-transparent",
      iconWrap: "bg-gradient-to-br from-pink-500/20 to-amber-500/20 text-pink-400 border-pink-500/40",
      badgeText: "text-pink-400",
      ctaLabel: "Suivre sur Instagram",
    },
    {
      id: "tiktok" as const,
      name: "TikTok",
      handle: "@housegame.tv",
      desc: "Clips tournois, moments forts e-sport et défis de la communauté.",
      url: normalizeExternalUrl(socialLinks.tiktok),
      icon: TikTokIcon,
      accentBorder: "border-cyan-400/40 hover:border-cyan-300",
      accentBg: "from-cyan-400/20 via-rose-500/5 to-transparent",
      iconWrap: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40",
      badgeText: "text-cyan-300",
      ctaLabel: "Suivre sur TikTok",
    },
  ];

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
              ESPACE PRO ACTIF : Personnalisez la bannière, les partenaires et nos liens sociaux depuis l'accueil.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsBannerModalOpen(true)}
              id="admin-change-banner-ribbon-btn"
              className="flex items-center gap-1.5 rounded-lg border border-[#3E9BFF]/50 bg-[#3E9BFF]/20 px-3 py-1.5 font-['JetBrains_Mono'] font-bold text-[#3E9BFF] hover:bg-[#3E9BFF]/30 transition cursor-pointer"
            >
              <Upload size={13} />
              <span>Changer la bannière</span>
            </button>
            <button
              onClick={openAddPartnerModal}
              id="admin-add-partner-ribbon-btn"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-3 py-1.5 font-['JetBrains_Mono'] font-bold text-emerald-300 hover:bg-emerald-500/30 transition cursor-pointer"
            >
              <Plus size={13} />
              <span>+ Partenaire</span>
            </button>
            <button
              onClick={openSocialLinksModal}
              id="admin-edit-socials-ribbon-btn"
              className="flex items-center gap-1.5 rounded-lg border border-pink-400/50 bg-pink-500/20 px-3 py-1.5 font-['JetBrains_Mono'] font-bold text-pink-300 hover:bg-pink-500/30 transition cursor-pointer"
            >
              <Share2 size={13} />
              <span>Nos Plateformes</span>
            </button>
            <button
              onClick={onOpenEditHome}
              id="admin-edit-home-btn"
              className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
            >
              <Edit3 size={14} />
              <span>Modifier l'accueil</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ESPACE BANNIÈRE OFFICIELLE GRAND FORMAT */}
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
        <div className="relative w-full overflow-hidden bg-black/90 flex items-center justify-center">
          <img
            src={currentBanner}
            alt="House Game - Entreprise de Divertissement, Loisirs, Éducation par le jeu vidéo"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain cursor-pointer transition-transform duration-500 group-hover:scale-[1.01]"
            onClick={() => setIsLightboxOpen(true)}
            title="Cliquer pour afficher la bannière en haute définition"
          />

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

            {isAdmin && (
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
            )}
          </div>
        </div>
      </section>

      {/* Hero Section — Court & Impactant */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] shadow-2xl hud-box group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-0 cyber-grid-pattern opacity-25 z-10" />
        <GamingParticles />

        <img
          src={homeContent.bannerImage || OFFICIAL_BANNER_SRC}
          alt="House Game Universe"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-25 mix-blend-luminosity filter saturate-150 transition-transform duration-700 group-hover:scale-105"
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

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => {
                sfx.playClick();
                onNavigateTab("shop");
              }}
              onMouseEnter={() => sfx.playHover()}
              id="cta-shop-btn"
              className="gaming-btn btn-tap btn-sheen flex items-center gap-2 rounded-xl border border-[#FF4438]/60 bg-[#FF4438] px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_20px_rgba(255,68,56,0.4)] transition hover:bg-[#ff6459] hover:shadow-[0_0_30px_rgba(255,68,56,0.6)] active:scale-95 cursor-pointer"
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
              className="gaming-btn btn-tap flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-purple-300 transition hover:bg-purple-500/25 hover:border-purple-400 active:scale-95 cursor-pointer"
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
              className="gaming-btn btn-tap flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 hover:border-cyan-400 active:scale-95 cursor-pointer"
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
              className="gaming-btn btn-tap flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/20 hover:border-emerald-400 active:scale-95 cursor-pointer"
            >
              <Sparkles size={16} />
              <span>HG CAMPUS</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                window.dispatchEvent(new CustomEvent("open-hg-ai"));
              }}
              onMouseEnter={() => sfx.playHover()}
              id="cta-ai-master-btn"
              className="gaming-btn btn-tap btn-sheen flex items-center gap-2 rounded-xl border border-cyan-400/60 bg-cyan-500/15 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/25 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 cursor-pointer"
            >
              <Bot size={16} className="text-cyan-400 animate-pulse" />
              <span>IA GAME MASTER</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
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

      {/* ========================================================= */}
      {/* SECTION : NOS PARTENAIRES (LOGOS & NOMS ADMINISTRABLES)   */}
      {/* ========================================================= */}
      <section id="home-partners-section">
        <ScrollReveal direction="up" delay={60}>
          <div className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-8 space-y-6 hud-box">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-amber-400 font-bold">
                  <Award size={16} />
                  <span>NOS PARTENAIRES</span>
                </div>
                <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white">
                  Des alliances avec les leaders de l'industrie
                </h2>
                <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-[#7C8798]">
                  Équipementiers officiels, sponsors e-sport et partenaires stratégiques qui soutiennent l'écosystème HOUSE GAME.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={openAddPartnerModal}
                  id="home-add-partner-btn"
                  className="gaming-btn flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-500/15 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                  <span>Ajouter un partenaire</span>
                </button>
              )}
            </div>

            {partners.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/15 bg-[#12151E]/60 p-8 text-center space-y-3">
                <Award size={30} className="mx-auto text-amber-400/70" />
                <p className="font-['Orbitron'] text-sm font-bold text-white">
                  Aucun partenaire enregistré pour le moment
                </p>
                <p className="font-['Chakra_Petch'] text-xs text-[#7C8798] max-w-md mx-auto">
                  Les logos et noms des partenaires officiels s'afficheront ici dès leur ajout.
                </p>
                {isAdmin && (
                  <button
                    onClick={openAddPartnerModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-['JetBrains_Mono'] text-xs font-bold text-black hover:bg-amber-400 transition cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Ajouter le premier partenaire</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {partners.map((partner, pIdx) => {
                  const partnerUrl = normalizeExternalUrl(partner.websiteUrl);
                  return (
                    <div
                      key={partner.id || `${partner.name}-${pIdx}`}
                      className="relative p-4 rounded-xl border border-white/10 bg-[#141824] hover:border-amber-400/50 transition-all flex flex-col items-center text-center group card-gaming-interactive"
                    >
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-90 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => openEditPartnerModal(partner, pIdx)}
                            title="Modifier ce partenaire"
                            className="p-1.5 rounded-lg bg-[#0B0E17]/90 border border-white/15 text-[#3E9BFF] hover:bg-[#3E9BFF] hover:text-white transition cursor-pointer"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPartnerToDeleteIdx(pIdx)}
                            title="Supprimer ce partenaire"
                            className="p-1.5 rounded-lg bg-[#0B0E17]/90 border border-white/15 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}

                      <div className="w-20 h-20 rounded-xl bg-white/95 p-2 mb-3 border border-white/15 shadow-inner flex items-center justify-center overflow-hidden">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <Award size={28} className="text-slate-400" />
                        )}
                      </div>

                      <span className="font-['Orbitron'] text-xs sm:text-sm font-bold text-white line-clamp-1">
                        {partner.name}
                      </span>

                      {partner.category && (
                        <span className="text-[10px] font-['JetBrains_Mono'] text-amber-300/90 line-clamp-1 mt-1">
                          {partner.category}
                        </span>
                      )}

                      {partner.tagline && (
                        <span className="text-[11px] font-['Chakra_Petch'] text-[#7C8798] line-clamp-2 mt-1">
                          {partner.tagline}
                        </span>
                      )}

                      {partnerUrl && (
                        <a
                          href={partnerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2.5 inline-flex items-center gap-1 text-[10px] font-['JetBrains_Mono'] text-[#3E9BFF] hover:text-white transition"
                        >
                          <Globe size={11} />
                          <span>Visiter</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollReveal>
      </section>

      {/* ========================================================= */}
      {/* SECTION : NOS PLATEFORMES (FACEBOOK • INSTAGRAM • TIKTOK) */}
      {/* ========================================================= */}
      <section id="home-platforms-section">
        <ScrollReveal direction="up" delay={100}>
          <div className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-8 space-y-6 hud-box">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#3E9BFF] font-bold">
                  <Share2 size={16} />
                  <span>NOS PLATEFORMES</span>
                </div>
                <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white">
                  Rejoignez la communauté HOUSE GAME en ligne
                </h2>
                <p className="font-['Chakra_Petch'] text-xs sm:text-sm text-[#7C8798]">
                  Suivez nos lives, arrivages consoles, temps forts e-sport et contenus exclusifs sur nos réseaux officiels.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={openSocialLinksModal}
                  id="home-edit-socials-btn"
                  className="gaming-btn flex items-center gap-2 rounded-xl border border-[#3E9BFF]/50 bg-[#3E9BFF]/15 px-4 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] hover:bg-[#3E9BFF] hover:text-white transition cursor-pointer shrink-0"
                >
                  <LinkIcon size={14} />
                  <span>Configurer nos plateformes</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platformCards.map((plat) => {
                const Icon = plat.icon;
                const hasLink = Boolean(plat.url);

                const cardInner = (
                  <div
                    className={`relative h-full overflow-hidden rounded-xl border ${plat.accentBorder} bg-gradient-to-br ${plat.accentBg} bg-[#141824] p-5 flex flex-col justify-between gap-4 transition-all duration-300 ${
                      hasLink ? "hover:-translate-y-1 hover:shadow-xl cursor-pointer" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${plat.iconWrap}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {hasLink ? (
                        <span className={`inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold ${plat.badgeText}`}>
                          <span>Actif</span>
                          <ExternalLink size={11} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] text-[#7C8798]">
                          À configurer
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-['Orbitron'] text-base font-bold text-white">
                        {plat.name}
                      </h3>
                      <p className={`font-['JetBrains_Mono'] text-[11px] font-bold ${plat.badgeText}`}>
                        {plat.handle}
                      </p>
                      <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0] leading-relaxed pt-1">
                        {plat.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between font-['JetBrains_Mono'] text-xs font-bold">
                      {hasLink ? (
                        <>
                          <span className="text-white">{plat.ctaLabel}</span>
                          <ArrowRight size={14} className={plat.badgeText} />
                        </>
                      ) : isAdmin ? (
                        <button
                          type="button"
                          onClick={openSocialLinksModal}
                          className="w-full flex items-center justify-between text-amber-300 hover:text-amber-200 transition cursor-pointer"
                        >
                          <span>Ajouter le lien {plat.name}</span>
                          <Plus size={14} />
                        </button>
                      ) : (
                        <span className="text-[#7C8798] font-normal text-[11px]">
                          Lien officiel bientôt disponible
                        </span>
                      )}
                    </div>
                  </div>
                );

                return hasLink ? (
                  <a
                    key={plat.id}
                    href={plat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`home-social-link-${plat.id}`}
                    className="block h-full"
                  >
                    {cardInner}
                  </a>
                ) : (
                  <div key={plat.id} id={`home-social-card-${plat.id}`} className="h-full">
                    {cardInner}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
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

            <div className="flex-1 overflow-auto flex items-center justify-center bg-black/60 rounded-xl p-2">
              <img
                src={currentBanner}
                alt="House Game Panoramic Banner"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

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

            {syncSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-3 text-xs text-emerald-200 font-['JetBrains_Mono'] animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Bannière enregistrée et synchronisée avec succès !</span>
              </div>
            )}

            {syncError && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/20 p-3 text-xs text-red-200 font-['JetBrains_Mono'] animate-fadeIn">
                <X size={16} className="text-red-400 flex-shrink-0" />
                <span>{syncError}</span>
              </div>
            )}

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
                    <span>Synchronisation en cours...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 font-['JetBrains_Mono'] text-xs">
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
                    </>
                  )}
                </button>
              </div>

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

      {/* ========================================================= */}
      {/* MODAL 3 : AJOUTER / MODIFIER UN PARTENAIRE */}
      {/* ========================================================= */}
      {isPartnerModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            if (!partnerSaving) setIsPartnerModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/40 bg-[#12151E] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                  {editingPartnerIdx !== null ? "MODIFIER LE PARTENAIRE" : "AJOUTER UN PARTENAIRE"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {partnerError && (
              <div className="rounded-lg border border-red-500/40 bg-red-500/15 p-3 font-['JetBrains_Mono'] text-xs text-red-200">
                {partnerError}
              </div>
            )}

            <form onSubmit={handleSavePartner} className="space-y-4 font-['JetBrains_Mono'] text-xs">
              <div>
                <label className="block text-[#A0AEC0] mb-1">Nom du partenaire * :</label>
                <input
                  type="text"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Sony PlayStation, Red Bull, MTN Cameroon..."
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A0AEC0] mb-1">Logo du partenaire * :</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-white/95 border border-white/20 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                    {partnerForm.logo ? (
                      <img
                        src={partnerForm.logo}
                        alt="Aperçu logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon size={22} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      ref={partnerLogoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handlePartnerLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => partnerLogoInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-amber-400/50 bg-amber-500/15 px-3 py-2 text-amber-300 font-bold hover:bg-amber-500/25 transition cursor-pointer"
                    >
                      <Upload size={14} />
                      <span>Importer le logo (PNG / SVG / JPG)</span>
                    </button>
                    <input
                      type="text"
                      value={partnerForm.logo}
                      onChange={(e) => setPartnerForm((p) => ({ ...p, logo: e.target.value }))}
                      placeholder="Ou coller l'URL du logo..."
                      className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A0AEC0] mb-1">Catégorie (optionnel) :</label>
                  <input
                    type="text"
                    value={partnerForm.category || ""}
                    onChange={(e) => setPartnerForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Ex: Sponsor Officiel"
                    className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#A0AEC0] mb-1">Lien site web (optionnel) :</label>
                  <input
                    type="text"
                    value={partnerForm.websiteUrl || ""}
                    onChange={(e) => setPartnerForm((p) => ({ ...p, websiteUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A0AEC0] mb-1">Description courte (optionnel) :</label>
                <input
                  type="text"
                  value={partnerForm.tagline || ""}
                  onChange={(e) => setPartnerForm((p) => ({ ...p, tagline: e.target.value }))}
                  placeholder="Ex: Fournisseur officiel de consoles et périphériques"
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={partnerSaving}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 font-bold text-black hover:bg-amber-400 transition disabled:opacity-50 cursor-pointer"
                >
                  {partnerSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>{editingPartnerIdx !== null ? "Mettre à jour" : "Ajouter"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4 : CONFIRMATION SUPPRESSION PARTENAIRE */}
      {/* ========================================================= */}
      {partnerToDeleteIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPartnerToDeleteIdx(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-red-500/30 bg-[#12151E] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-['Orbitron'] text-base font-bold text-white">
              SUPPRIMER CE PARTENAIRE ?
            </h3>
            <p className="font-['Chakra_Petch'] text-xs text-[#A0AEC0]">
              Retirer <strong className="text-white">"{partners[partnerToDeleteIdx]?.name}"</strong> de la liste des partenaires sur la page d'accueil ?
            </p>
            <div className="flex justify-end gap-3 font-['JetBrains_Mono'] text-xs font-bold">
              <button
                type="button"
                onClick={() => setPartnerToDeleteIdx(null)}
                className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePartner}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-500 transition cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5 : CONFIGURER NOS PLATEFORMES SOCIALES */}
      {/* ========================================================= */}
      {isSocialModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn"
          onClick={() => {
            if (!socialSaving) setIsSocialModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[#3E9BFF]/40 bg-[#12151E] p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Share2 size={18} className="text-[#3E9BFF]" />
                <h3 className="font-['Orbitron'] text-sm sm:text-base font-bold text-white">
                  CONFIGURER NOS PLATEFORMES
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSocialModalOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {socialSavedMsg && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/20 p-3 font-['JetBrains_Mono'] text-xs text-emerald-200">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Liens enregistrés et publiés avec succès !</span>
              </div>
            )}

            <form onSubmit={handleSaveSocialLinks} className="space-y-4 font-['JetBrains_Mono'] text-xs">
              <div>
                <label className="flex items-center gap-2 text-[#4A9EFF] font-bold mb-1.5">
                  <FacebookIcon className="w-4 h-4" />
                  <span>Lien Facebook :</span>
                </label>
                <input
                  type="text"
                  value={socialForm.facebook || ""}
                  onChange={(e) => setSocialForm((s) => ({ ...s, facebook: e.target.value }))}
                  placeholder="https://www.facebook.com/votrepage"
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-[#3E9BFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-pink-400 font-bold mb-1.5">
                  <InstagramIcon className="w-4 h-4" />
                  <span>Lien Instagram :</span>
                </label>
                <input
                  type="text"
                  value={socialForm.instagram || ""}
                  onChange={(e) => setSocialForm((s) => ({ ...s, instagram: e.target.value }))}
                  placeholder="https://www.instagram.com/votrecompte"
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-pink-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-cyan-300 font-bold mb-1.5">
                  <TikTokIcon className="w-4 h-4" />
                  <span>Lien TikTok :</span>
                </label>
                <input
                  type="text"
                  value={socialForm.tiktok || ""}
                  onChange={(e) => setSocialForm((s) => ({ ...s, tiktok: e.target.value }))}
                  placeholder="https://www.tiktok.com/@votrecompte"
                  className="w-full rounded-lg border border-white/15 bg-[#141824] px-3 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-[#7C8798] hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={socialSaving}
                  className="flex items-center gap-2 rounded-lg bg-[#3E9BFF] px-5 py-2.5 font-bold text-white hover:bg-[#3282db] transition disabled:opacity-50 cursor-pointer"
                >
                  {socialSaving && <Loader2 size={14} className="animate-spin" />}
                  <span>Enregistrer les liens</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
