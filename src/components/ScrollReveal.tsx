import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  direction?: "up" | "down" | "left" | "right" | "zoom" | "none";
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = "",
  delay = 0,
  duration = 550,
  direction = "up",
  threshold = 0.08,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    const current = domRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [threshold]);

  const getTransformStyle = () => {
    if (isVisible) return "translate-x-0 translate-y-0 opacity-100 scale-100";

    switch (direction) {
      case "up":
        return "translate-y-6 opacity-0";
      case "down":
        return "-translate-y-6 opacity-0";
      case "left":
        return "-translate-x-6 opacity-0";
      case "right":
        return "translate-x-6 opacity-0";
      case "zoom":
        return "scale-95 opacity-0";
      case "none":
        return "opacity-0";
      default:
        return "translate-y-6 opacity-0";
    }
  };

  return (
    <div
      ref={domRef}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${delay}ms`,
        willChange: isVisible ? "auto" : "transform, opacity",
      }}
      className={`transition-all ${getTransformStyle()} ${className}`}
    >
      {children}
    </div>
  );
};
