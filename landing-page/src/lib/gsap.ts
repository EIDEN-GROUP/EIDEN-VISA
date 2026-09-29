// Point d'entrée GSAP unique : plugins enregistrés une seule fois pour toute la landing.
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const canHover = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Rejoue `anim` (créée en pause) à chaque entrée dans l'écran, que l'on scrolle vers le
 * bas ou vers le haut, et la remet à zéro une fois l'élément complètement sorti de l'écran
 * (remise à zéro invisible pour l'utilisateur).
 */
export function replayOnScroll(
  trigger: Element,
  anim: gsap.core.Animation,
  { start = "top 90%", end = "bottom 10%", instant = false } = {},
) {
  const play = ScrollTrigger.create({
    trigger,
    start,
    end,
    onEnter: () => anim.play(),
    onEnterBack: () => anim.play(),
  });
  const reset = ScrollTrigger.create({
    trigger,
    start: "top bottom",
    end: "bottom top",
    onLeave: () => anim.pause(0),
    onLeaveBack: () => anim.pause(0),
  });
  // Re-découpe (resize, police chargée) alors que l'élément est déjà visible : pas de rejeu.
  if (instant && play.isActive) anim.progress(1).pause();
  return [play, reset];
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
