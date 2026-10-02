import React from "react";

export const GamingParticles: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 opacity-40">
      {/* Ambient gradient meshes */}
      <div className="absolute top-0 left-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-[#FF4438]/20 to-transparent blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-tl from-[#3E9BFF]/20 to-transparent blur-3xl animate-pulse"
        style={{ animationDuration: "4s", animationDelay: "1s" }}
      />

      {/* Floating Micro Cyber Dots */}
      <div
        className="absolute top-1/5 left-10 h-1.5 w-1.5 rounded-full bg-[#FF4438] blur-[0.5px]"
        style={{
          animation: "particleFloat 6s ease-in-out infinite",
          animationDelay: "0s",
        }}
      />
      <div
        className="absolute top-1/3 left-1/3 h-1 w-1 rounded-full bg-[#3E9BFF] blur-[0.5px]"
        style={{
          animation: "particleFloat 7s ease-in-out infinite",
          animationDelay: "1.5s",
        }}
      />
      <div
        className="absolute top-2/3 left-1/5 h-2 w-2 rounded-full bg-[#FF4438]/60 blur-[1px]"
        style={{
          animation: "particleFloat 8s ease-in-out infinite",
          animationDelay: "2s",
        }}
      />
      <div
        className="absolute top-1/4 right-1/4 h-1.5 w-1.5 rounded-full bg-[#3E9BFF] blur-[0.5px]"
        style={{
          animation: "particleFloat 5.5s ease-in-out infinite",
          animationDelay: "0.8s",
        }}
      />
      <div
        className="absolute top-1/2 right-12 h-2 w-2 rounded-full bg-amber-400/70 blur-[1px]"
        style={{
          animation: "particleFloat 6.5s ease-in-out infinite",
          animationDelay: "3s",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 h-1 w-1 rounded-full bg-[#3E9BFF] blur-[0.5px]"
        style={{
          animation: "particleFloat 7.5s ease-in-out infinite",
          animationDelay: "1s",
        }}
      />
    </div>
  );
};
