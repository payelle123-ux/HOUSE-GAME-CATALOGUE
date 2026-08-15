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
    <div className={`flex items-center gap-3 ${className}`}>
      {/* High-visibility framed emblem badge for House Game Logo */}
      <div className="relative group flex items-center justify-center">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#FF4438] to-[#3E9BFF] opacity-35 blur-sm transition duration-300 group-hover:opacity-75" />
        <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/95 p-1 shadow-[0_0_20px_rgba(255,68,56,0.25)] transition-transform duration-300 group-hover:scale-105">
          <HouseGameLogo size={pixelSizes[size]} showSlogan={false} className="shrink-0" />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-['Orbitron'] text-base font-extrabold tracking-wider text-white sm:text-xl leading-tight">
            HOUSE <span className="text-[#FF4438] drop-shadow-[0_0_12px_rgba(255,68,56,0.6)]">GAME</span>
          </span>
          <span className="font-['JetBrains_Mono'] text-[10px] tracking-tight text-[#3E9BFF] sm:text-xs font-semibold">
            // {slogan}
          </span>
        </div>
      )}
    </div>
  );
};

