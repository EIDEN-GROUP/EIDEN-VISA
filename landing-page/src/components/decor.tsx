// Éléments graphiques de la maquette : logo, drapeau UE, tampons, croquis décoratif.
import { motion, type MotionValue } from "framer-motion";
import { Plane } from "lucide-react";
import { useId } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-col items-center leading-none text-ink ${className}`}>
      <span className="font-logo text-[30px] tracking-[0.02em] sm:text-[34px]">EIDEN</span>
      <span className="mt-1.5 pl-[0.55em] text-[9.5px] font-bold tracking-[0.55em] sm:text-[10.5px]">
        VISA
      </span>
    </span>
  );
}

/** Drapeau de l'Union européenne (12 étoiles d'or sur fond bleu), ombré comme un tissu. */
export function EUFlag({ className = "" }: { className?: string }) {
  const id = `u${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const star = (cx: number, cy: number, R = 30) =>
    Array.from({ length: 10 }, (_, k) => {
      const r = k % 2 === 0 ? R : R * 0.382;
      const a = ((-90 + k * 36) * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  const stars = Array.from({ length: 12 }, (_, i) => {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    return [405 + 180 * Math.cos(a), 270 + 180 * Math.sin(a)] as const;
  });

  return (
    <svg
      viewBox="0 0 810 540"
      role="img"
      aria-label="Drapeau de l'Union européenne"
      className={className}
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect width="810" height="540" rx="46" />
        </clipPath>
        <linearGradient id={`${id}-wave`} x1="0" x2="1" y1="0" y2="0.25">
          <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="0.28" stopColor="#000" stopOpacity="0.12" />
          <stop offset="0.52" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.78" stopColor="#000" stopOpacity="0.14" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="810" height="540" fill="var(--color-eu)" />
        {stars.map(([x, y]) => (
          <polygon key={`${x}-${y}`} points={star(x, y)} fill="var(--color-eu-star)" />
        ))}
        <rect width="810" height="540" fill={`url(#${id}-wave)`} />
      </g>
    </svg>
  );
}

/** Tampon rond « PARIS · FRANCE » posé sur la photo du hero, avec ses ondulations postales. */
export function HeroStamp({
  className = "",
  rotate,
}: {
  className?: string;
  /** Rotation pilotée par le scroll (Framer Motion). */
  rotate?: MotionValue<number>;
}) {
  const id = `u${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      viewBox="0 0 250 150"
      fill="none"
      aria-hidden="true"
      className={`overflow-visible text-white ${className}`}
    >
      <motion.g style={{ rotate }}>
        <circle cx="75" cy="75" r="69" stroke="currentColor" strokeWidth="3.2" />
        <circle cx="75" cy="75" r="46" stroke="currentColor" strokeWidth="1.6" />
        <path id={id} d="M75,75 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" />
        <text
          fill="currentColor"
          fontSize="14"
          fontWeight="700"
          fontFamily="DM Sans, sans-serif"
          letterSpacing="2"
        >
          <textPath href={`#${id}`} textLength="360" lengthAdjust="spacing">
            PARIS ★ FRANCE ★ PARIS ★ FRANCE ★
          </textPath>
        </text>
        <Plane x={52} y={52} width={46} height={46} fill="currentColor" strokeWidth={1.2} />
      </motion.g>
      {[46, 60, 74, 88].map((y) => (
        <path
          key={y}
          d={`M152 ${y} q8 -7 16 0 t16 0 t16 0 t16 0 t16 0 t16 0`}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.85"
        />
      ))}
    </svg>
  );
}

/** Tampon postal rectangulaire, délavé, à cheval sur la photo de la carte destination. */
export function PostalStamp({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-[10px] border-2 border-dashed border-current p-[5px] ${className}`}
    >
      <div className="flex h-full flex-col items-center justify-between rounded-[6px] border-[1.5px] border-current px-3 py-2">
        <span className="text-[12px] font-bold tracking-[0.3em]">PARIS</span>
        <Plane className="size-8 -rotate-12 fill-current" strokeWidth={1} />
        <span className="font-script text-[15px] leading-none">France</span>
      </div>
    </div>
  );
}

/** Tampon rouge « VISA FRANCE, Vérifié ✓ » posé sur la pièce contrôlée. */
export function VerifiedStamp({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-[6px] border-[2.5px] border-brand/90 bg-white/35 px-4 py-2 text-center text-brand/90 mix-blend-multiply ${className}`}
    >
      <p className="text-[14px] font-bold tracking-[0.14em]">VISA FRANCE</p>
      <p className="font-script text-[21px] leading-[1.1]">Vérifié ✓</p>
    </div>
  );
}

/** Croquis au trait (tour Eiffel + toits), très pâle, en fond de section. */
export function EiffelSketch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 260"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M110 8v18M104 26h12M103 26l-6 60M117 26l6 60M92 86h36M90 92h40M97 86c-8 40-20 90-44 150M123 86c8 40 20 90 44 150" />
      <path d="M70 160h80M66 168h88M76 168c10-16 22-22 34-22s24 6 34 22M53 236h28M139 236h28" />
      <path d="M100 40l14 20M114 40l-14 20M99 62l18 22M117 62l-18 22M88 100l30 30M118 100l-30 30M80 130l52 28M132 130l-52 28M72 176l28 40M148 176l-28 40" />
      <path d="M0 246h220M8 246v-40h26v40M34 214h30v32M12 206l9-12 9 12M150 246v-34h34v34M184 222h30v24M156 212l11-14 11 14" />
      <path d="M14 222h4M24 222h4M14 232h4M24 232h4M160 222h5M172 222h5M160 234h5M172 234h5M40 224h5M52 224h5M190 230h5M202 230h5" />
    </svg>
  );
}
