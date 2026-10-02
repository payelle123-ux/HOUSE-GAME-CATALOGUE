import React, { useRef, useState } from "react";
import { sfx } from "../services/soundEffects";

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "blue" | "red" | "purple" | "emerald";
  enableTilt?: boolean;
  onClick?: () => void;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
  enableTilt = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });
    setOpacity(1);

    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      // Max 4 degrees rotation for elegant, non-disorienting feel
      const rx = ((y - centerY) / centerY) * -3;
      const ry = ((x - centerX) / centerX) * 3;
      setTilt({ rx, ry });
    }
  };

  const handleMouseEnter = () => {
    setOpacity(1);
    sfx.playHover();
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    setTilt({ rx: 0, ry: 0 });
  };

  const getGlowGradient = () => {
    switch (glowColor) {
      case "red":
        return `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(255, 68, 56, 0.18), transparent 80%)`;
      case "purple":
        return `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(168, 85, 247, 0.18), transparent 80%)`;
      case "emerald":
        return `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(16, 185, 129, 0.18), transparent 80%)`;
      case "blue":
      default:
        return `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(62, 155, 255, 0.18), transparent 80%)`;
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: enableTilt
          ? `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
          : undefined,
        transition: "transform 0.15s ease-out, box-shadow 0.2s ease",
      }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Dynamic Specular Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity,
          background: getGlowGradient(),
        }}
      />
      {children}
    </div>
  );
};
