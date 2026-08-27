import React from "react";
import {
  ShieldCheck,
  Wrench,
  Trophy,
  MessageCircle,
  ShoppingBag,
  Calendar,
  Sparkles,
  Edit3,
  MapPin,
  Clock,
  Phone,
  ArrowRight,
  Gamepad2,
  Cpu,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { HomeContent, ShopInfo, NavTabId } from "../types";

interface HomeTabProps {
  homeContent: HomeContent;
  shopInfo: ShopInfo;
  isAdmin: boolean;
  onOpenEditHome: () => void;
  onNavigateTab: (tabId: NavTabId) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  homeContent,
  shopInfo,
  isAdmin,
  onOpenEditHome,
  onNavigateTab,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldCheck":
        return ShieldCheck;
      case "Wrench":
        return Wrench;
      case "Trophy":
        return Trophy;
      case "MessageCircle":
        return MessageCircle;
      case "Gamepad2":
        return Gamepad2;
      case "Cpu":
        return Cpu;
      case "Flame":
        return Flame;
      default:
        return Sparkles;
    }
  };

  const cleanPhone = shopInfo.whatsapp.replace(/[^0-9]/g, "");

  return (
    <div id="home-tab-view" className="space-y-10 pb-12 animate-fadeIn">
      {/* Admin Action Ribbon */}
      {isAdmin && (
        <div
          id="admin-home-banner"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-['JetBrains_Mono'] font-bold">
              ESPACE PRO ACTIF : Vous pouvez personnaliser tous les textes, statistiques et sections de l'accueil.
            </span>
          </div>
          <button
            onClick={onOpenEditHome}
            id="admin-edit-home-btn"
            className="flex items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/20 px-3.5 py-1.5 font-['JetBrains_Mono'] font-bold text-amber-300 hover:bg-amber-500/30 transition shadow-[0_0_10px_rgba(245,158,11,0.2)]"
          >
            <Edit3 size={14} />
            <span>Modifier la présentation & stats</span>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090E] via-[#07090E]/90 to-transparent z-10" />
        <img
          src={
            homeContent.bannerImage ||
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80"
          }
          alt="House Game Universe"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40 mix-blend-luminosity filter saturate-150"
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
              "Vente de consoles & accessoires neufs, atelier de réparation haute précision et organisation de tournois majeurs."}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigateTab("shop")}
              id="cta-shop-btn"
              className="flex items-center gap-2 rounded-xl border border-[#FF4438]/60 bg-[#FF4438] px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_20px_rgba(255,68,56,0.4)] transition hover:bg-[#ff6459] active:scale-95"
            >
              <ShoppingBag size={16} />
              <span>Explorer la Boutique</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => onNavigateTab("repair")}
              id="cta-repair-btn"
              className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-amber-300 transition hover:bg-amber-500/20 active:scale-95"
            >
              <Wrench size={16} />
              <span>Devis Réparation Express</span>
            </button>

            <button
              onClick={() => onNavigateTab("esport")}
              id="cta-esport-btn"
              className="flex items-center gap-2 rounded-xl border border-[#3E9BFF]/40 bg-[#3E9BFF]/10 px-5 py-3 font-['JetBrains_Mono'] text-xs font-bold text-[#3E9BFF] transition hover:bg-[#3E9BFF]/20 active:scale-95"
            >
              <Trophy size={16} />
              <span>Tournois & Cash Prizes</span>
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

      {/* Company Presentation Box */}
      <section className="rounded-2xl border border-white/10 bg-[#0E121B] p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#3E9BFF] font-bold">
              <span className="h-2 w-2 rounded-full bg-[#3E9BFF]" />
              <span>À PROPOS DE HOUSE GAME</span>
            </div>
            <h2 className="font-['Orbitron'] text-xl sm:text-2xl font-bold text-white">
              Une passion pour le jeu, une exigence de professionnel
            </h2>
            <p className="font-['Chakra_Petch'] text-sm text-[#A0AEC0] leading-relaxed">
              {homeContent.presentationText}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-[#D6DCE6]">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Matériel 100% garanti avec facture</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#D6DCE6]">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Atelier micro-soudure sur place</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#D6DCE6]">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Tournois réguliers et cash prizes</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#D6DCE6]">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Livraison et assistance WhatsApp 7j/7</span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Store Details */}
          <div className="lg:col-span-5 rounded-xl border border-white/10 bg-[#141824] p-5 space-y-4">
            <h3 className="font-['Orbitron'] text-sm font-bold text-white flex items-center gap-2">
              <MapPin size={16} className="text-[#FF4438]" />
              <span>NOS COORDONNÉES & HORAIRES</span>
            </h3>
            
            <div className="space-y-3 font-['JetBrains_Mono'] text-xs text-[#A0AEC0]">
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#7C8798] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-bold">{shopInfo.name}</div>
                  <div>{shopInfo.address}, {shopInfo.city}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock size={14} className="text-[#7C8798] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-bold">Heures d'ouverture</div>
                  <div>{shopInfo.openingHours}</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone size={14} className="text-[#7C8798] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-bold">Contact Direct & WhatsApp</div>
                  <div>{shopInfo.phone} / {shopInfo.whatsapp}</div>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                "Bonjour House Game ! Je souhaite obtenir des informations sur vos services et produits."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 font-['JetBrains_Mono'] text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition active:scale-95"
            >
              <MessageCircle size={15} />
              <span>Discuter avec l'équipe sur WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 4 Pillars of Excellence */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-['Orbitron'] text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#3E9BFF]" />
            <span>LES PILIERS HOUSE GAME</span>
          </h2>
          <span className="font-['JetBrains_Mono'] text-xs text-[#7C8798]">
            Engagement & Qualité
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {homeContent.values?.map((val, i) => {
            const Icon = getIcon(val.iconName);
            return (
              <div
                key={i}
                className="group rounded-xl border border-white/10 bg-[#0E121B] p-5 transition hover:border-[#FF4438]/50 hover:bg-[#121723]"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#FF4438] group-hover:bg-[#FF4438]/10 group-hover:text-white transition">
                  <Icon size={20} />
                </div>
                <h3 className="font-['Orbitron'] text-sm font-bold text-white">
                  {val.title}
                </h3>
                <p className="mt-1.5 font-['Chakra_Petch'] text-xs text-[#7C8798] leading-relaxed">
                  {val.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
