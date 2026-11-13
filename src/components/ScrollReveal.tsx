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

    const current = domRef.current;

    const checkVisibleNow = () => {
      if (!current) return false;
      const rect = current.getBoundingClientRect();
      if (rect.top < window.innerHeight + 120 && rect.bottom > -120) {
        setIsVisible(true);
        return true;
      }
      return false;
    };

    if (checkVisibleNow()) {
      return;
    }

    // Failsafe guarantee: no card can stay stuck invisible in iframes or fast tab switches
    const failsafeTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, Math.min(delay, 300) + 450);

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return () => window.clearTimeout(failsafeTimer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            window.clearTimeout(failsafeTimer);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold: Math.min(threshold, 0.01),
        rootMargin: "120px 0px 120px 0px",
      }
    );

    if (current) {
      observer.observe(current);
    }

    const rafId = window.requestAnimationFrame(() => {
      checkVisibleNow();
    });

    return () => {
      window.clearTimeout(failsafeTimer);
      window.cancelAnimationFrame(rafId);
      if (current) observer.unobserve(current);
    };
  }, [threshold, delay]);

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
