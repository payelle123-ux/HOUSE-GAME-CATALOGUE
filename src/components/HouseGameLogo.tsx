import React from "react";

interface HouseGameLogoProps {
  className?: string;
  size?: number | string;
  showSlogan?: boolean;
}

export const HOUSE_GAME_LOGO_SRC = "/assets/aistudio/hg_logo__1__a3208585.png";

export const HouseGameLogo: React.FC<HouseGameLogoProps> = ({
  className = "",
  size = 64,
}) => {
  const heightStyle = typeof size === "number" ? `${size}px` : size;
  const widthStyle =
    typeof size === "number" ? `${Math.round(size * (1890 / 1417))}px` : "auto";

  return (
    <img
      src={HOUSE_GAME_LOGO_SRC}
      alt="Logo HOUSE GAME"
      draggable={false}
      className={`object-contain select-none ${className}`}
      style={{
        height: heightStyle,
        width: widthStyle,
      }}
    />
  );
};
