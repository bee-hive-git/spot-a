"use client";
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatNumber?: (num: number) => string;
  trigger?: boolean;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  from,
  to,
  duration = 2000,
  prefix = "",
  suffix = "",
  formatNumber,
  trigger = false,
  className = "",
}) => {
  const [count, setCount] = useState(from);
  const animationRef = useRef<number | undefined>(undefined);
  const triggerRef = useRef(trigger);

  useEffect(() => {
    // Detecta mudança no trigger
    const triggerChanged = triggerRef.current !== trigger;
    triggerRef.current = trigger;

    // Reset quando trigger se torna false
    if (!trigger) {
      setCount(from);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Só anima se o trigger mudou de false para true
    if (!triggerChanged) return;

    const startTime = Date.now();
    const startValue = from;
    const endValue = to;
    const totalChange = endValue - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + totalChange * easeOut;

      setCount(Math.floor(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, from, to, duration]);

  const formatValue = (value: number): string => {
    if (formatNumber) {
      return formatNumber(value);
    }
    return value.toString();
  };

  return (
    <span className={className}>
      {prefix}{formatValue(count)}{suffix}
    </span>
  );
};

export default AnimatedCounter;