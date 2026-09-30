// Point d'entrée GSAP unique : plugins enregistrés une seule fois pour toute la landing.
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { introOuverte, introPrete } from "./intro";

gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin, useGSAP);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const canHover = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Entrée **et** sortie visibles au scroll : `anim` (créée en pause) joue quand l'élément
 * entre dans la zone [start, end], et se rejoue à l'envers (un peu plus vite) quand il en
 * sort, par le haut comme par le bas. Remise à zéro de sécurité une fois l'élément
 * totalement hors écran.
 */
export function replayOnScroll(
  trigger: Element,
  anim: gsap.core.Animation,
  { start = "top 90%", end = "bottom 10%", instant = false } = {},
) {
  // Première entrée différée jusqu'au passage de l'avion du loader (voir lib/intro.ts).
  let dedans = false;
  const entrer = () => {
    dedans = true;
    void introPrete.then(() => {
      if (dedans) anim.timeScale(1).play();
    });
  };
  const sortir = () => {
    dedans = false;
    anim.timeScale(1.6).reverse();
  };
  const play = ScrollTrigger.create({
    trigger,
    start,
    end,
    onEnter: entrer,
    onEnterBack: entrer,
    onLeave: sortir,
    onLeaveBack: sortir,
  });
  const reset = ScrollTrigger.create({
    trigger,
    start: "top bottom",
    end: "bottom top",
    onLeave: () => anim.pause(0),
    onLeaveBack: () => anim.pause(0),
  });
  // Re-découpe (resize, police chargée) alors que l'élément est déjà visible : pas de rejeu.
  // Avant le passage de l'avion, elle attend l'intro comme une entrée normale.
  if (instant && play.isActive) {
    if (introOuverte()) anim.progress(1).pause();
    else entrer();
  }
  return [play, reset];
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
