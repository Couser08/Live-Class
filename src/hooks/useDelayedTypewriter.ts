import { useState, useEffect, useRef } from 'react';

interface UseDelayedTypewriterOptions {
  targetText: string;
  delayMs?: number;      // Initial delay before friend starts seeing changes (default 1000ms)
  typingSpeedMs?: number; // Speed per character (default 18ms)
  enabled?: boolean;
}

export function useDelayedTypewriter({
  targetText,
  delayMs = 1000,
  typingSpeedMs = 15,
  enabled = true,
}: UseDelayedTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState(targetText);
  const [isTyping, setIsTyping] = useState(false);
  const delayTimerRef = useRef<number | null>(null);
  const typeIntervalRef = useRef<number | null>(null);
  const currentTargetRef = useRef(targetText);

  useEffect(() => {
    currentTargetRef.current = targetText;

    if (!enabled) {
      setDisplayedText(targetText);
      setIsTyping(false);
      return;
    }

    // Clear previous delay timeout
    if (delayTimerRef.current) {
      window.clearTimeout(delayTimerRef.current);
    }
    if (typeIntervalRef.current) {
      window.clearInterval(typeIntervalRef.current);
    }

    // Start delay buffer
    delayTimerRef.current = window.setTimeout(() => {
      setIsTyping(true);
      const target = currentTargetRef.current;

      typeIntervalRef.current = window.setInterval(() => {
        setDisplayedText((prev) => {
          if (prev === target) {
            if (typeIntervalRef.current) window.clearInterval(typeIntervalRef.current);
            setIsTyping(false);
            return prev;
          }

          // If target is longer, add next characters (or jump in chunks for faster typing)
          if (target.startsWith(prev)) {
            const nextChunkLength = Math.min(3, target.length - prev.length);
            return target.slice(0, prev.length + nextChunkLength);
          }

          // If text was modified or deleted, smoothly sync to target
          const nextLength = target.length > prev.length ? prev.length + 1 : prev.length - 1;
          return target.slice(0, Math.max(0, nextLength));
        });
      }, typingSpeedMs);
    }, delayMs);

    return () => {
      if (delayTimerRef.current) window.clearTimeout(delayTimerRef.current);
      if (typeIntervalRef.current) window.clearInterval(typeIntervalRef.current);
    };
  }, [targetText, delayMs, typingSpeedMs, enabled]);

  return {
    displayedText,
    isTyping,
    forceSync: () => {
      if (delayTimerRef.current) window.clearTimeout(delayTimerRef.current);
      if (typeIntervalRef.current) window.clearInterval(typeIntervalRef.current);
      setDisplayedText(currentTargetRef.current);
      setIsTyping(false);
    },
  };
}
