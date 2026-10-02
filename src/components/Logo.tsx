import React from "react";
import { HouseGameLogo } from "./HouseGameLogo";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  slogan?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  className = "",
  showText = true,
  slogan = "La qualité n'a pas de prix",
}) => {
  const pixelSizes = {
    sm: 44,
    md: 58,
    lg: 84,
    xl: 120,
  };

  return (
    <div className={`group flex items-center gap-3 cursor-pointer select-none ${className}`}>
      {/* High-visibility framed emblem badge for House Game Logo with gaming aura */}
      <div className="relative flex items-center justify-center">
        {/* Ambient neon pulse behind emblem */}
        <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#FF4438] via-purple-500 to-[#3E9BFF] opacity-30 blur-md transition duration-500 group-hover:opacity-80 group-hover:scale-110" />
        
        <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/95 p-1 shadow-[0_0_20px_rgba(255,68,56,0.3)] transition-transform duration-300 group-hover:scale-105">
          <HouseGameLogo size={pixelSizes[size]} showSlogan={false} className="shrink-0" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-['Orbitron'] text-base font-extrabold tracking-wider text-white sm:text-xl leading-tight transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(62,155,255,0.6)]">
            HOUSE <span className="text-[#FF4438] drop-shadow-[0_0_12px_rgba(255,68,56,0.7)] group-hover:text-[#ff5e54]">GAME</span>
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] tracking-tight text-[#3E9BFF] sm:text-xs font-semibold transition-colors duration-300 group-hover:text-emerald-400">
            // {slogan}
          </span>
        </div>
      )}
    </div>
  );
};
