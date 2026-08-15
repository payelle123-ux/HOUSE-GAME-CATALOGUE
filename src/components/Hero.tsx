import React from "react";
import { Search, X, Sparkles, Shield, Truck, Zap, Gamepad2 } from "lucide-react";
import { ShopInfo } from "../types";

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
    <section className="relative overflow-hidden border-b border-white/10 bg-[#07090E] px-4 pt-12 pb-10 sm:px-6 sm:pt-16 sm:pb-14">
      {/* Background radial glows & cyber grid */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#FF4438]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-10 -right-24 h-96 w-96 rounded-full bg-[#3E9BFF]/15 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Eyebrow badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#3E9BFF]/30 bg-[#3E9BFF]/10 px-3.5 py-1 font-['JetBrains_Mono'] text-xs font-medium text-[#3E9BFF] shadow-[0_0_12px_rgba(62,155,255,0.15)]">
          <Gamepad2 size={13} className="animate-pulse text-[#FF4438]" />
          <span>CATALOGUE OFFICIEL & DISPONIBILITÉS EN DIRECT</span>
        </div>

        {/* Hero Title */}
        <h1 className="mb-4 font-['Orbitron'] text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          L'UNIVERS GAMING <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#FF4438] via-[#ff685e] to-[#3E9BFF] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,68,56,0.3)]">
            HOUSE GAME
          </span>
        </h1>

        {/* Terminal Note */}
        <div className="mx-auto mb-8 max-w-2xl rounded border border-white/10 bg-[#12151E]/90 p-3 font-['JetBrains_Mono'] text-xs text-[#7C8798] shadow-lg sm:text-sm">
          <span className="text-[#FF4438] font-bold mr-2">$</span>
          <span className="text-[#D6DCE6]">{shopInfo.note}</span>
          <span className="inline-block animate-ping text-[#3E9BFF] ml-1">_</span>
        </div>

        {/* Live Search Bar */}
        <div className="relative mx-auto max-w-xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#7C8798]">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher une manette, console PS5, jeu, accessoire..."
            className="w-full rounded-lg border border-white/15 bg-[#12151E] py-3.5 pr-11 pl-11 font-['Chakra_Petch'] text-sm text-white placeholder-[#7C8798] shadow-inner transition focus:border-[#3E9BFF] focus:bg-[#181C28] focus:outline-none focus:ring-2 focus:ring-[#3E9BFF]/30"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#7C8798] transition hover:text-white"
              aria-label="Effacer la recherche"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Highlights Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-['JetBrains_Mono'] text-xs text-[#7C8798]">
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Zap size={13} className="text-[#FF4438]" />
            <span>{totalProductsCount} Articles au catalogue</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Shield size={13} className="text-[#3E9BFF]" />
            <span>Produits 100% Originaux</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
            <Truck size={13} className="text-emerald-400" />
            <span>Livraison Rapide</span>
          </div>
        </div>
      </div>
    </section>
  );
};
