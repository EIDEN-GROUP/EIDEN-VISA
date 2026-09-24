import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarRange } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/store";

export type { DateRange };

const PRESETS: { label: string; days: number | null }[] = [
  { label: "Tout", days: null },
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
  { label: "90 jours", days: 90 },
];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/** Filtre de date partagé — s'applique sur la date d'ouverture réelle du dossier
 * (created_at), pas sur un texte affiché. Réutilisé sur chaque écran qui liste des dossiers. */
export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
}) {
  const activePreset = PRESETS.find((p) => {
    if (p.days === null) return !value.from && !value.to;
    return value.from === isoDaysAgo(p.days) && !value.to;
  });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <CalendarRange className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      <div className="flex items-center gap-1 rounded-full border border-border p-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() =>
              onChange(p.days === null ? {} : { from: isoDaysAgo(p.days), to: undefined })
            }
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              activePreset?.label === p.label
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Input
        type="date"
        value={value.from ?? ""}
        onChange={(e) => onChange({ ...value, from: e.target.value || undefined })}
        className="h-8 w-36 text-xs"
        aria-label="Depuis le"
      />
      <span className="text-xs text-muted-foreground">→</span>
      <Input
        type="date"
        value={value.to ?? ""}
        onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
        className="h-8 w-36 text-xs"
        aria-label="Jusqu'au"
      />
      {(value.from || value.to) && (
        <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onChange({})}>
          Réinitialiser
        </Button>
      )}
    </div>
  );
}
