import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setScrollProgress(progress);
      setIsVisible(scrollTop > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <button
        onClick={scrollToTop}
        id="btn-scroll-to-top"
        aria-label="Retour en haut de la page"
        title="Retour en haut"
        className="group relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-[#0E121B]/90 backdrop-blur-md text-white shadow-[0_0_20px_rgba(62,155,255,0.25)] transition-all hover:scale-110 hover:border-[#3E9BFF] hover:bg-[#121828] active:scale-95"
      >
        {/* Subtle circular SVG progress ring */}
        <svg className="absolute inset-0 h-full w-full -rotate-90 p-0.5" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#3E9BFF"
            strokeWidth="2"
            strokeDasharray="100"
            strokeDashoffset={100 - scrollProgress}
            strokeLinecap="round"
            className="transition-all duration-150"
          />
        </svg>

        {/* Arrow Icon */}
        <ArrowUp
          size={18}
          className="text-[#D6DCE6] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:text-[#3E9BFF]"
        />

        {/* Cyber corner accents */}
        <span className="pointer-events-none absolute -top-0.5 -left-0.5 h-1.5 w-1.5 border-t border-l border-[#FF4438]" />
        <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 border-b border-r border-[#3E9BFF]" />
      </button>
    </div>
  );
};
