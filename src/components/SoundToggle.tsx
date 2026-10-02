import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sfx } from "../services/soundEffects";

export const SoundToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sfx.isMuted());
  }, []);

  const handleToggle = () => {
    const newState = sfx.toggleMute();
    setIsMuted(newState);
  };

  return (
    <button
      onClick={handleToggle}
      onMouseEnter={() => sfx.playHover()}
      title={isMuted ? "Activer les effets sonores gaming (SFX)" : "Désactiver les effets sonores (SFX)"}
      aria-label="Effets sonores gaming"
      className={`group relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-['JetBrains_Mono'] text-xs transition-all duration-200 active:scale-95 ${
        isMuted
          ? "border-white/10 bg-white/5 text-[#7C8798] hover:border-white/20 hover:text-white"
          : "border-[#3E9BFF]/40 bg-[#3E9BFF]/10 text-[#3E9BFF] shadow-[0_0_12px_rgba(62,155,255,0.2)] hover:border-[#3E9BFF] hover:bg-[#3E9BFF]/20"
      } ${className}`}
    >
      {isMuted ? (
        <VolumeX size={14} className="text-[#7C8798] group-hover:text-white transition-colors" />
      ) : (
        <Volume2 size={14} className="text-[#3E9BFF] animate-pulse" />
      )}
      <span className="hidden lg:inline text-[11px] font-semibold tracking-wider">
        {isMuted ? "SFX OFF" : "SFX ON"}
      </span>
      {/* Equalizer indicator when active */}
      {!isMuted && (
        <div className="hidden sm:flex items-end gap-[2px] h-3 ml-0.5">
          <span className="w-[2px] h-full bg-[#3E9BFF] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
          <span className="w-[2px] h-2/3 bg-[#3E9BFF] rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.2s]" />
          <span className="w-[2px] h-4/5 bg-[#3E9BFF] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.4s]" />
        </div>
      )}
    </button>
  );
};
