import React, { useEffect, useState } from "react";
import { HouseGameLogo } from "./HouseGameLogo";

interface PageLoaderProps {
  onComplete?: () => void;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);
  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if shown in this session already
    const hasLoaded = sessionStorage.getItem("hg_boot_shown");
    if (hasLoaded) {
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 25) + 15;
        return Math.min(prev + step, 100);
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress === 100 && !isDone) {
      sessionStorage.setItem("hg_boot_shown", "true");
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
        const doneTimer = setTimeout(() => {
          setIsDone(true);
          if (onComplete) onComplete();
        }, 300);
        return () => clearTimeout(doneTimer);
      }, 150);

      return () => clearTimeout(fadeTimer);
    }
  }, [progress, isDone, onComplete]);

  if (isDone) return null;

  return (
    <div
      onClick={() => {
        setIsDone(true);
        sessionStorage.setItem("hg_boot_shown", "true");
        if (onComplete) onComplete();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090E] transition-opacity duration-300 cursor-pointer ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background cyber grid */}
      <div className="pointer-events-none absolute inset-0 cyber-grid-pattern opacity-30" />

      {/* Center Gaming Container */}
      <div className="relative z-10 flex flex-col items-center space-y-6 max-w-sm px-6 text-center">
        {/* Glowing Logo Frame */}
        <div className="relative flex items-center justify-center p-3 rounded-2xl bg-white/95 border border-white/20 shadow-[0_0_30px_rgba(255,68,56,0.35)] animate-pulse">
          <HouseGameLogo size={68} showSlogan={false} />
        </div>

        {/* Brand & Loading Label */}
        <div className="space-y-1">
          <h2 className="font-['Orbitron'] text-sm tracking-widest text-white font-extrabold uppercase">
            HOUSE <span className="text-[#FF4438]">GAME</span>
          </h2>
          <p className="font-['JetBrains_Mono'] text-[11px] text-[#3E9BFF] tracking-tight">
            // SYSTÈME DE JEU • CHARGEMENT... {progress}%
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden border border-white/10 p-[1px]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF4438] via-[#3E9BFF] to-emerald-400 transition-all duration-100 shadow-[0_0_10px_#3E9BFF]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="font-['JetBrains_Mono'] text-[10px] text-[#7C8798] opacity-60">
          [ Cliquer pour passer ]
        </span>
      </div>
    </div>
  );
};
