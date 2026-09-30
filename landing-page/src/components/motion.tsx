// Briques d'animation de la landing.
// - Framer Motion : entrée et sortie des blocs (Reveal), dans les deux sens de scroll.
// - GSAP : textes (SplitReveal, ScriptReveal, CountUp), joués à l'entrée, inversés à la sortie.
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
import { useIntroPrete } from "../lib/intro";

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
  /** Seuil d'entrée : par défaut l'élément doit dépasser 10 % du bas de l'écran. */
  immediat?: boolean;
};

/** Sortie : départ doux puis accélération, plus courte que l'entrée. */
const EASE_IN = [0.55, 0, 0.75, 0.2] as const;

/**
 * Entrée et sortie au scroll (Framer Motion). L'élément apparaît en entrant dans
 * l'écran (par le bas en descendant, par le haut en remontant) et disparaît de façon
 * visible en le quittant : il file vers le haut sous l'en-tête, ou vers le bas.
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
  immediat = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  // Zone active : un peu sous l'en-tête en haut, 10 % au-dessus du bas de l'écran.
  const actif = useInView(ref, { margin: immediat ? "0px" : "-7% 0px -10% 0px" });
  const pret = useIntroPrete();
  const [side, setSide] = useState<"shown" | "above" | "below">("below");

  useEffect(() => {
    if (actif && pret) setSide("shown");
    else if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setSide(r.top + r.height / 2 < window.innerHeight / 2 ? "above" : "below");
    }
  }, [actif, pret]);

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
          : {
              opacity: 0,
              y: y * dir,
              x: x * dir,
              scale,
              transition: { duration: Math.min(duration, 0.6), ease: EASE_IN },
            }
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

      // Arabe (droite à gauche) : aucune découpe. Découper casse la liaison des lettres
      // arabes et l'ordre des mots latins (« EIDEN Visa » devenait « Visa EIDEN ») ;
      // le bloc entier se dévoile donc dans le sens de lecture, de droite à gauche.
      if (getComputedStyle(el).direction === "rtl") {
        gsap.set(el, { visibility: "visible" });
        const balayage = gsap.fromTo(
          el,
          { clipPath: "inset(-25% -4% -25% 100%)", y: mode === "chars" ? 8 : 26, opacity: 0 },
          {
            clipPath: "inset(-25% -4% -25% -4%)",
            y: 0,
            opacity: 1,
            duration: mode === "chars" ? 0.8 : 1.15,
            ease: "power3.out",
            delay,
            paused: true,
          },
        );
        replayOnScroll(el, balayage, { start });
        return;
      }
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

  return createElement(
    as,
    { ref, id, className, "data-split": "" },
    typeof children === "string" ? insecable(children) : children,
  );
}

/**
 * Typographie française : SplitText remplace l'espace insécable avant « ? » / « ! »
 * par une espace normale ; on garde donc le dernier mot et la ponctuation ensemble.
 */
function insecable(texte: string): ReactNode {
  const m = /^(.*\s)(\S+)[\s ]([?!:;])$/.exec(texte);
  if (!m) return texte;
  return (
    <>
      {m[1]}
      <span className="whitespace-nowrap">{`${m[2]} ${m[3]}`}</span>
    </>
  );
}

/**
 * Écriture manuscrite : chaque ligne se dévoile dans le sens de lecture (gauche → droite
 * en français, droite → gauche en arabe), l'une après l'autre. `tilt` : inclinaison en
 * degrés, inversée automatiquement en arabe.
 */
export function ScriptReveal({
  lines,
  className,
  lineClassName = "",
  delay = 0,
  tilt = -11,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  tilt?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const rtl = getComputedStyle(el).direction === "rtl";
      const cache = rtl ? "inset(-30% -5% -30% 100%)" : "inset(-30% 100% -30% -5%)";
      const anim = gsap.fromTo(
        el.querySelectorAll("[data-line]"),
        { clipPath: cache },
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
    <span
      ref={ref}
      className={`tilt ${className ?? ""}`}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      aria-label={lines.join(" ")}
    >
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
      replayOnScroll(el, anim, { start: "top bottom", end: "bottom top" });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {formatFr(value)}
    </span>
  );
}
