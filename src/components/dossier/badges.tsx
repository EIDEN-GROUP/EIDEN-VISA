import { cn } from "@/lib/utils";
import type { Level } from "@/lib/visa-rules";
import { LEVEL_LABEL } from "@/lib/visa-rules";
import { ETAPES, DECISION_LABEL, type Decision } from "@/lib/dossier-model";

export function NiveauBadge({ level }: { level: Level }) {
  const colors: Record<Level, string> = {
    standard: "bg-[var(--ok)]",
    attention: "bg-[var(--warn)]",
    complexe: "bg-[var(--stop)]",
  };
  const text: Record<Level, string> = {
    standard: "text-muted-foreground",
    attention: "text-[var(--warn)]",
    complexe: "text-[var(--stop)]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", text[level])}>
      <span className={cn("dot", colors[level])} />
      {LEVEL_LABEL[level]}
    </span>
  );
}

export function EtapeBadge({ etape }: { etape: number }) {
  const e = ETAPES.find((x) => x.n === etape);
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <span className="ref">Étape {etape}</span>
      {e?.label}
    </span>
  );
}

/** Étape 7 atteinte : le cycle Eiden Visa pour ce dossier est terminé (dépôt au centre). */
export function ClotureBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ok)]">
      <span className="dot bg-[var(--ok)]" />
      Dossier clôturé
    </span>
  );
}

/** Le "après l'étape 7" : ce que le consulat a décidé, hors du contrôle d'Eiden. */
export function DecisionBadge({ decision }: { decision: Decision }) {
  const colors: Record<Decision, string> = {
    en_attente: "bg-[var(--warn)]",
    approuve: "bg-[var(--ok)]",
    refuse: "bg-[var(--stop)]",
  };
  const text: Record<Decision, string> = {
    en_attente: "text-[var(--warn)]",
    approuve: "text-[var(--ok)]",
    refuse: "text-[var(--stop)]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", text[decision])}>
      <span className={cn("dot", colors[decision])} />
      {DECISION_LABEL[decision]}
    </span>
  );
}

/** Le service peut-il téléverser des documents sur ce dossier ? (autorisé par CEO/Réception) */
export function AutorisationBadge({ autorise }: { autorise: boolean }) {
  return autorise ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ok)]">
      <span className="dot bg-[var(--ok)]" />
      Upload autorisé
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--warn)]">
      <span className="dot bg-[var(--warn)]" />
      Upload bloqué
    </span>
  );
}
