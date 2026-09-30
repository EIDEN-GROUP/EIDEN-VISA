// Éléments graphiques de la maquette : logo, drapeau UE, tampon « vérifié ».
// Les tampons Schengen sont des images (public/images/tampon-schengen-*.webp).
import { useId } from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span lang="fr" className={`flex flex-col items-center leading-none text-ink ${className}`}>
      <span className="font-logo text-[30px] tracking-[0.02em] sm:text-[34px]">EIDEN</span>
      <span className="mt-1.5 pl-[0.55em] text-[9.5px] font-bold tracking-[0.55em] sm:text-[10.5px]">
        VISA
      </span>
    </span>
  );
}

/** Drapeau de l'Union européenne (12 étoiles d'or sur fond bleu), ombré comme un tissu. */
export function EUFlag({ className = "", label }: { className?: string; label: string }) {
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
    <svg viewBox="0 0 810 540" role="img" aria-label={label} className={className}>
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

/** Tampon rouge (« VISA FRANCE » + « Vérifié ✓ » traduit) posé sur la pièce contrôlée. */
export function VerifiedStamp({
  className = "",
  lignes,
}: {
  className?: string;
  lignes: string[];
}) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-[6px] border-[2.5px] border-brand/90 bg-white/35 px-4 py-2 text-center text-brand/90 mix-blend-multiply ${className}`}
    >
      <p lang="fr" className="text-[14px] font-bold tracking-[0.14em]">
        {lignes[0]}
      </p>
      <p className="font-script text-[21px] leading-[1.1]">{lignes[1]}</p>
    </div>
  );
}
