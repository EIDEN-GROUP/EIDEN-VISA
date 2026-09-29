// Briques d'animation de la landing.
// - Framer Motion : apparition des blocs (Reveal), dans les deux sens de scroll.
// - GSAP : textes (SplitReveal, ScriptReveal, CountUp), rejoués à chaque passage.
import { motion, useInView } from "framer-motion";
import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap, prefersReducedMotion, replayOnScroll, SplitText, useGSAP } from "../lib/gsap";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const TAGS = {
  div: motion.div,
  span: motion.span,
  li: motion.li,
  article: motion.article,
  figure: motion.figure,
};

type RevealProps = {
  children?: ReactNode;
  as?: keyof typeof TAGS;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  duration?: number;
  /** Décalage vertical de départ (px). Inversé quand l'élément revient par le haut. */
  y?: number;
  x?: number;
  scale?: number;
};

/**
 * Apparition au scroll (Framer Motion). Rejoue à chaque entrée dans l'écran :
 * par le bas en descendant, par le haut en remontant. Remise à zéro seulement
 * quand l'élément est totalement hors écran, donc jamais visible.
 */
export function Reveal({
  children,
  as = "div",
  className,
  style,
  delay = 0,
  duration = 0.9,
  y = 44,
  x = 0,
  scale = 1,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const entered = useInView(ref, { margin: "0px 0px -10% 0px" });
  const visible = useInView(ref);
  const [side, setSide] = useState<"shown" | "above" | "below">("below");

  useEffect(() => {
    if (entered) setSide("shown");
    else if (!visible && ref.current) {
      setSide(ref.current.getBoundingClientRect().top < 0 ? "above" : "below");
    }
  }, [entered, visible]);

  const Tag = TAGS[as];
  const dir = side === "above" ? -1 : 1;
  return (
    <Tag
      ref={ref as never}
      className={className}
      style={style}
      initial={{ opacity: 0, y, x, scale }}
      animate={
        side === "shown"
          ? { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration, delay, ease: EASE_OUT } }
          : { opacity: 0, y: y * dir, x: x * dir, scale, transition: { duration: 0 } }
      }
    >
      {children}
    </Tag>
  );
}

type SplitRevealProps = {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  /** words : mots qui montent dans leur ligne · lines : lignes entières · chars : lettres. */
  mode?: "words" | "lines" | "chars";
  className?: string;
  id?: string;
  delay?: number;
  stagger?: number;
  start?: string;
};

/** Texte découpé avec GSAP SplitText puis révélé au scroll (descente et remontée). */
export function SplitReveal({
  children,
  as = "p",
  mode = "words",
  className,
  id,
  delay = 0,
  stagger,
  start,
}: SplitRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { visibility: "visible" });
        return;
      }
      let anim: gsap.core.Animation | undefined;
      let triggers: ReturnType<typeof replayOnScroll> = [];
      let first = true;

      SplitText.create(el, {
        type: mode === "chars" ? "words,chars" : mode === "words" ? "lines,words" : "lines",
        mask: mode === "chars" ? undefined : "lines",
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        tag: "span",
        autoSplit: true,
        onSplit(self) {
          anim?.kill();
          triggers.forEach((t) => t.kill());
          gsap.set(el, { visibility: "visible" });

          if (mode === "chars") {
            anim = gsap.from(self.chars, {
              opacity: 0,
              y: 10,
              duration: 0.55,
              stagger: stagger ?? 0.022,
              ease: "power2.out",
              delay,
              paused: true,
            });
          } else {
            anim = gsap.from(mode === "words" ? self.words : self.lines, {
              yPercent: 118,
              rotate: mode === "words" ? 3 : 0,
              duration: 1.05,
              stagger: stagger ?? (mode === "words" ? 0.045 : 0.1),
              ease: "power4.out",
              delay,
              paused: true,
            });
          }
          triggers = replayOnScroll(el, anim, { start, instant: !first });
          first = false;
        },
      });
    },
    { scope: ref },
  );

  return createElement(as, { ref, id, className, "data-split": "" }, children);
}

/** Écriture manuscrite : chaque ligne se dévoile de gauche à droite, l'une après l'autre. */
export function ScriptReveal({
  lines,
  className,
  lineClassName = "",
  delay = 0,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const anim = gsap.fromTo(
        el.querySelectorAll("[data-line]"),
        { clipPath: "inset(-30% 100% -30% -5%)" },
        {
          clipPath: "inset(-30% -5% -30% -5%)",
          duration: 1.1,
          stagger: 0.75,
          ease: "power2.inOut",
          delay,
          paused: true,
        },
      );
      replayOnScroll(el, anim, { start: "top 95%", end: "bottom 5%" });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className} aria-label={lines.join(" ")}>
      {lines.map((line) => (
        <span key={line} data-line aria-hidden="true" className={`block ${lineClassName}`}>
          {line}
        </span>
      ))}
    </span>
  );
}

/** « 1 500 » avec espace insécable (Intl fr-FR ne groupe pas les nombres à 4 chiffres). */
const formatFr = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

/** Montant qui défile jusqu'à sa valeur à chaque passage à l'écran. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const counter = { v: 0 };
      el.textContent = formatFr(0);
      const anim = gsap.to(counter, {
        v: value,
        duration: 1.6,
        ease: "power3.out",
        paused: true,
        onUpdate: () => {
          el.textContent = formatFr(Math.round(counter.v / 10) * 10);
        },
      });
      replayOnScroll(el, anim, { start: "top 95%", end: "bottom 5%" });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {formatFr(value)}
    </span>
  );
}
