// Lightweight responsive hook. Returns a flag for the current breakpoint
// based on the Tailwind defaults (sm 640, md 768, lg 1024, xl 1280).
// SSR-safe: defaults to false on the server.
import { useEffect, useState } from 'react';

const QUERIES = {
  isMobile:   '(max-width: 767px)',
  isTablet:   '(min-width: 768px) and (max-width: 1023px)',
  isDesktop:  '(min-width: 1024px)',
  isLarge:    '(min-width: 1280px)',
  isSmUp:     '(min-width: 640px)',
  isMdUp:     '(min-width: 768px)',
  isLgUp:     '(min-width: 1024px)',
};

function getInitial() {
  if (typeof window === 'undefined') return { isMobile: true, isTablet: false, isDesktop: false, isLarge: false, isSmUp: false, isMdUp: false, isLgUp: false };
  const w = window.innerWidth;
  return {
    isMobile: w < 768,
    isTablet: w >= 768 && w < 1024,
    isDesktop: w >= 1024,
    isLarge: w >= 1280,
    isSmUp: w >= 640,
    isMdUp: w >= 768,
    isLgUp: w >= 1024,
  };
}

export function useResponsive() {
  const [state, setState] = useState(getInitial);
  useEffect(() => {
    const queries = Object.entries(QUERIES).map(([key, q]) => {
      const mq = window.matchMedia(q);
      const handler = () => setState((s) => ({ ...s, [key]: mq.matches }));
      mq.addEventListener?.('change', handler);
      return { mq, handler };
    });
    return () => queries.forEach(({ mq, handler }) => mq.removeEventListener?.('change', handler));
  }, []);
  return state;
}
