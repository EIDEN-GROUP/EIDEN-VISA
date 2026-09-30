// Défilement fluide Lenis, synchronisé avec GSAP ScrollTrigger (même horloge).
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "../lib/gsap";

function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update);
  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const [reduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (reduced) return;
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(update);
  }, [reduced]);

  // Mouvement réduit demandé par le système : défilement natif, sans inertie.
  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, lerp: 0.12, wheelMultiplier: 1, anchors: true }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
