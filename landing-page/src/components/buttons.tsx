// Boutons animés avec GSAP : apparition au scroll (dans les deux sens), effet
// magnétique au survol, remplissage qui monte et flèche qui boucle.
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef, type MouseEventHandler, type ReactNode, type RefObject } from "react";
import { canHover, gsap, prefersReducedMotion, replayOnScroll, useGSAP } from "../lib/gsap";

/** Remplissage caché sous le bouton tant qu'on ne le survole pas. */
const HIDDEN_FILL = { transform: "translateY(101%)" };

type Variant = "primary" | "light" | "sand" | "outline";
type Size = "md" | "lg" | "auto";

const VARIANTS: Record<Variant, { base: string; fill: string }> = {
  primary: {
    base: "bg-brand text-white shadow-[0_10px_30px_-12px_rgb(0_0_0/0.35)]",
    fill: "bg-brand-dark",
  },
  light: { base: "bg-white text-ink shadow-[var(--shadow-soft)]", fill: "bg-sand" },
  sand: { base: "bg-sand text-ink", fill: "bg-[#eadfd3]" },
  outline: { base: "border border-white/75 text-white", fill: "bg-white/15" },
};

const SIZES: Record<Size, string> = {
  md: "h-12 px-7 text-[14.5px]",
  lg: "h-[58px] px-9 text-[15.5px]",
  auto: "h-12 px-7 text-[14.5px] sm:h-[58px] sm:px-9 sm:text-[15.5px]",
};

/** Branche l'apparition + le survol GSAP sur un couple (wrapper, bouton). */
function useButtonMotion(
  wrap: RefObject<HTMLElement | null>,
  btn: RefObject<HTMLElement | null>,
  { magnet = 0.25, entrance = true } = {},
) {
  useGSAP(
    () => {
      const w = wrap.current;
      const el = btn.current;
      if (!w || !el || prefersReducedMotion()) return;

      if (entrance) {
        const intro = gsap.from(w, {
          y: 22,
          opacity: 0,
          scale: 0.92,
          duration: 0.85,
          ease: "back.out(1.7)",
          paused: true,
        });
        replayOnScroll(w, intro, { start: "top 96%", end: "bottom 4%" });
      }

      if (!canHover()) return;
      const fill = el.querySelector<HTMLElement>("[data-fill]");
      const arrow = el.querySelector<HTMLElement>("[data-arrow]");
      if (fill) gsap.set(fill, { y: 0, yPercent: 101 });
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * magnet);
        yTo((e.clientY - r.top - r.height / 2) * magnet * 1.4);
      };
      const onEnter = () => {
        if (fill)
          gsap.fromTo(fill, { yPercent: 101 }, { yPercent: 0, duration: 0.5, ease: "power3.out" });
        if (arrow) {
          // Sens de lecture : en arabe, « avancer » va vers la gauche.
          const recule = arrow.dataset.dir === "left";
          const rtl = getComputedStyle(arrow).direction === "rtl";
          const d = recule !== rtl ? -14 : 14;
          gsap
            .timeline()
            .to(arrow, { x: d, opacity: 0, duration: 0.18, ease: "power2.in" })
            .set(arrow, { x: -d })
            .to(arrow, { x: 0, opacity: 1, duration: 0.32, ease: "power3.out" });
        }
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
        if (fill) gsap.to(fill, { yPercent: -101, duration: 0.5, ease: "power3.out" });
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: wrap },
  );
}

type ButtonProps = {
  /** Lien ; sans `href`, rend un <button> (ex. ouverture de la demande rapide). */
  href?: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  leading?: ReactNode;
  full?: boolean;
  /** Pleine largeur sur mobile uniquement. */
  fullMobile?: boolean;
  entrance?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /** Le clic ouvre une fenêtre (aria-haspopup="dialog"). */
  popup?: boolean;
};

export function AnimatedButton({
  href,
  children,
  variant = "primary",
  size = "lg",
  arrow = true,
  leading,
  full = false,
  fullMobile = false,
  entrance = true,
  className = "",
  onClick,
  popup = false,
}: ButtonProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLElement>(null);
  useButtonMotion(wrap, btn, { entrance, magnet: full ? 0.08 : 0.22 });
  const v = VARIANTS[variant];
  const classes = `relative isolate inline-flex cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full font-semibold whitespace-nowrap will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${SIZES[size]} ${v.base} ${full ? "w-full" : fullMobile ? "w-full sm:w-auto" : ""}`;
  const contenu = (
    <>
      <span
        data-fill
        aria-hidden="true"
        style={HIDDEN_FILL}
        className={`absolute inset-0 -z-10 rounded-full ${v.fill}`}
      />
      {leading}
      <span>{children}</span>
      {arrow && (
        <span data-arrow aria-hidden="true" className="inline-flex">
          <ArrowRight className="size-[18px] rtl:-scale-x-100" />
        </span>
      )}
    </>
  );

  return (
    <span
      ref={wrap}
      className={`${full ? "flex w-full" : fullMobile ? "flex w-full sm:inline-flex sm:w-auto" : "inline-flex"} ${className}`}
    >
      {href ? (
        <a
          ref={btn as RefObject<HTMLAnchorElement>}
          href={href}
          onClick={onClick}
          className={classes}
        >
          {contenu}
        </a>
      ) : (
        <button
          ref={btn as RefObject<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          aria-haspopup={popup ? "dialog" : undefined}
          className={classes}
        >
          {contenu}
        </button>
      )}
    </span>
  );
}

type IconButtonProps = {
  direction?: "left" | "right";
  label: string;
  tone?: "outline-brand" | "white";
  size?: "md" | "lg";
  href?: string;
  onClick?: () => void;
  className?: string;
};

/** Bouton rond à flèche (carte destination, carrousel des témoignages). */
export function IconButton({
  direction = "right",
  label,
  tone = "white",
  size = "md",
  href,
  onClick,
  className = "",
}: IconButtonProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLElement>(null);
  useButtonMotion(wrap, btn, { magnet: 0.35 });
  const Icon = direction === "left" ? ArrowLeft : ArrowRight;
  const tones = {
    "outline-brand": { base: "border-[1.5px] border-brand text-brand", fill: "bg-brand" },
    white: { base: "bg-white text-ink shadow-[var(--shadow-soft)]", fill: "bg-sand" },
  }[tone];
  const cls = `group relative isolate grid place-items-center overflow-hidden rounded-full transition-colors duration-300 will-change-transform focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand ${size === "lg" ? "size-14" : "size-12"} ${tones.base} ${tone === "outline-brand" ? "hover:text-white" : ""}`;
  const inner = (
    <>
      <span
        data-fill
        aria-hidden="true"
        style={HIDDEN_FILL}
        className={`absolute inset-0 -z-10 ${tones.fill}`}
      />
      <span data-arrow data-dir={direction} aria-hidden="true" className="inline-flex">
        <Icon className="size-5 rtl:-scale-x-100" />
      </span>
    </>
  );

  return (
    <span ref={wrap} className={`inline-flex ${className}`}>
      {href ? (
        <a ref={btn as RefObject<HTMLAnchorElement>} href={href} aria-label={label} className={cls}>
          {inner}
        </a>
      ) : (
        <button
          ref={btn as RefObject<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          aria-label={label}
          className={cls}
        >
          {inner}
        </button>
      )}
    </span>
  );
}

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/** Lien texte rouge souligné (« Comparer les packs », « Voir toutes les questions »). */
export function ArrowLink({ href, children, className = "", onClick }: ArrowLinkProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const btn = useRef<HTMLAnchorElement>(null);
  useButtonMotion(wrap, btn, { magnet: 0.12 });

  return (
    <span ref={wrap} className={`inline-flex ${className}`}>
      <a
        ref={btn}
        href={href}
        onClick={onClick}
        className="group inline-flex items-center gap-3 text-[15.5px] font-semibold text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
      >
        <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:100%_1.5px] bg-bottom-left bg-no-repeat pb-0.5 transition-[background-size] duration-500 group-hover:bg-[length:0%_1.5px] group-hover:bg-bottom-right">
          {children}
        </span>
        <span data-arrow aria-hidden="true" className="inline-flex">
          <ArrowRight className="size-[18px] rtl:-scale-x-100" />
        </span>
      </a>
    </span>
  );
}
