import React, { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = "",
  duration = 1400,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Extract digits and formatting
    // e.g. "15 000+" => prefix: "", num: 15000, suffix: "+", hasSpace: true
    // e.g. "100%" => prefix: "", num: 100, suffix: "%"
    const match = value.match(/^([^0-9]*)([\d\s.,]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1];
    const rawNumberStr = match[2].replace(/\s/g, "").replace(/,/g, ".");
    const targetNumber = parseFloat(rawNumberStr);
    const suffix = match[3];
    const isFormattedWithSpaces = match[2].includes(" ");

    if (isNaN(targetNumber)) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();

          const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic curve: 1 - Math.pow(1 - progress, 3)
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentNum = Math.floor(easeProgress * targetNumber);

            let formatted = currentNum.toString();
            if (isFormattedWithSpaces) {
              formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            }

            setDisplayValue(`${prefix}${formatted}${suffix}`);

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(updateCounter);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [value, duration]);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  );
};
