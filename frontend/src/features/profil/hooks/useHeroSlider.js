import { useState, useRef, useCallback, useEffect } from "react";

export function useHeroSlider(images = [], interval = 5000) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const len = images.length;

  // Reset to first slide if current index is out of bounds
  useEffect(() => {
    if (current >= len && len > 0) {
      setCurrent(0);
    }
  }, [len, current]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (len > 1) {
      timerRef.current = setInterval(() => setCurrent((p) => (p + 1) % len), interval);
    }
  }, [len, interval]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const next = useCallback(() => {
    if (len <= 1) return;
    setCurrent((p) => (p + 1) % len);
    resetTimer();
  }, [len, resetTimer]);

  const prev = useCallback(() => {
    if (len <= 1) return;
    setCurrent((p) => (p - 1 + len) % len);
    resetTimer();
  }, [len, resetTimer]);

  const goTo = useCallback((i) => {
    setCurrent(i);
    resetTimer();
  }, [resetTimer]);

  return { current, next, prev, goTo };
}

export default useHeroSlider;
