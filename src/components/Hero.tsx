import React from "react";
import { Search, X, Shield, Truck, Zap, ShoppingBag } from "lucide-react";
import { ShopInfo } from "../types";
import { GamingParticles } from "./GamingParticles";
import { AnimatedCounter } from "./AnimatedCounter";

interface HeroProps {
  shopInfo: ShopInfo;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalProductsCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  shopInfo,
  searchQuery,
  onSearchChange,
  totalProductsCount,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0C0F17] p-6 sm:p-8 shadow-2xl hud-box group">
      {/* Background cyber grid & ambient particles */}
      <div className="pointer-events-none absolute inset-0 cyber-grid-pattern opacity-25" />
      <GamingParticles />

      {/* Background radial glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#FF4438]/15 blur-3xl animate-pulse" />
      <div
        className="pointer-events-none absolute top-10 -right-24 h-72 w-72 rounded-full bg-[#3E9BFF]/15 blur-3xl animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center space-y-4">
        {/* Eyebrow badge with glowing pulse */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF4438]/40 bg-[#FF4438]/10 px-4 py-1.5 font-['JetBrains_Mono'] text-xs font-semibold text-[#FF4438] shadow-[0_0_15px_rgba(255,68,56,0.2)]">
          <ShoppingBag size={13} className="text-[#FF4438] animate-bounce" style={{ animationDuration: "2s" }} />
          <span>BOUTIQUE OFFICIELLE HOUSE GAME</span>
        </div>

        {/* Hero Title with subtle cyber hover glitch */}
        <h1 className="font-['Orbitron'] text-2xl sm:text-4xl font-extrabold text-white leading-tight hover-glitch transition-all cursor-default">
          Sélectionnez vos articles et passez commande directement
        </h1>

        <p className="font-['Chakra_Petch'] text-sm text-[#A0AEC0] max-w-2xl mx-auto leading-relaxed">
          Consoles de jeux, accessoires d'origine, jeux vidéo, high-tech, packs de Noël et créations customisées exclusives par Vicky.
        </p>

        {/* Live Search Bar with gaming neon border focus */}
        <div className="relative mx-auto max-w-xl pt-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7C8798] z-10">
            <Search size={18} className="transition-colors group-focus-within:text-[#3E9BFF]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher console, manette, jeu, câble, custom Vicky..."
            className="w-full rounded-xl border border-white/15 bg-[#12151E]/90 py-3.5 pr-11 pl-11 font-['Chakra_Petch'] text-sm text-white placeholder-[#7C8798] shadow-inner backdrop-blur-sm transition-all duration-300 focus:border-[#3E9BFF] focus:bg-[#181C28] focus:outline-none focus:ring-2 focus:ring-[#3E9BFF]/30 focus:shadow-[0_0_20px_rgba(62,155,255,0.25)]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#7C8798] transition hover:text-[#FF4438] active:scale-90"
              aria-label="Effacer la recherche"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Highlights Pills with micro-hover lift */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 font-['JetBrains_Mono'] text-xs text-[#7C8798]">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm transition-all duration-200 hover:border-[#FF4438]/50 hover:bg-[#FF4438]/10 hover:text-white hover:-translate-y-0.5">
            <Zap size={13} className="text-[#FF4438] animate-pulse" />
            <span>
              <AnimatedCounter value={`${totalProductsCount}`} className="font-bold text-white mr-1" />
              Articles disponibles
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm transition-all duration-200 hover:border-[#3E9BFF]/50 hover:bg-[#3E9BFF]/10 hover:text-white hover:-translate-y-0.5">
            <Shield size={13} className="text-[#3E9BFF]" />
            <span>Produits 100% Originaux avec Garantie</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm transition-all duration-200 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white hover:-translate-y-0.5">
            <Truck size={13} className="text-emerald-400" />
            <span>Paiement & Commande WhatsApp Directe</span>
          </div>
        </div>
      </div>
    </section>
  );
};
