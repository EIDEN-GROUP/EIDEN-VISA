import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ETAPES, checklistEtape, type Dossier } from "@/lib/dossier-model";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle } from "lucide-react";

/**
 * Sur une carte, ce qui compte n'est pas une étiquette figée à l'ouverture du dossier
 * mais ce qu'il reste à faire ICI, à cette étape — et le prochain geste concret.
 */
function AvancementEtape({ dossier }: { dossier: Dossier }) {
  const points = checklistEtape(dossier);
  if (points.length === 0) return null;
  const restants = points.filter((pt) => !pt.fait);
  const prochain = restants[0];

  if (!prochain) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--ok)]">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        Étape complète
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Circle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        {points.length - restants.length}/{points.length} fait
        {points.length - restants.length > 1 ? "s" : ""}
      </div>
      <div className="mt-1 line-clamp-2 text-xs text-foreground">{prochain.label}</div>
    </div>
  );
}

export function DossiersKanban({
  dossiers,
  onMove,
}: {
  dossiers: Dossier[];
  onMove: (id: string, etape: number) => void;
}) {
  const [dragOverEtape, setDragOverEtape] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid grid-flow-col auto-cols-[240px] gap-4">
        {ETAPES.map((e) => {
          const colDossiers = dossiers.filter((d) => d.etape === e.n);
          const isDragOver = dragOverEtape === e.n;
          return (
            <div
              key={e.n}
              data-kanban-column={e.n}
              onDragOver={(ev) => {
                ev.preventDefault();
                setDragOverEtape(e.n);
              }}
              onDragLeave={() => setDragOverEtape((cur) => (cur === e.n ? null : cur))}
              onDrop={(ev) => {
                ev.preventDefault();
                setDragOverEtape(null);
                const id = ev.dataTransfer.getData("text/plain");
                if (id) onMove(id, e.n);
              }}
              className={cn(
                "flex min-h-[200px] flex-col rounded-xl border p-2 transition-colors",
                isDragOver ? "border-primary bg-accent/40" : "border-border bg-muted/20",
              )}
            >
              <div className="px-2 py-1.5">
                <div className="ref text-muted-foreground">Étape {e.n}</div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{e.label}</span>
                  <span className="text-xs text-muted-foreground">{colDossiers.length}</span>
                </div>
              </div>
              <div className="mt-1 flex flex-1 flex-col gap-2">
                {colDossiers.map((d) => (
                  <div
                    key={d.id}
                    draggable
                    onDragStart={(ev) => {
                      ev.dataTransfer.setData("text/plain", d.id);
                      ev.dataTransfer.effectAllowed = "move";
                      setDraggingId(d.id);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className={cn(
                      "cursor-grab rounded-lg border border-border bg-card p-2.5 shadow-sm active:cursor-grabbing",
                      draggingId === d.id && "opacity-40",
                    )}
                  >
                    <Link to="/dossiers/$id" params={{ id: d.id }} className="block">
                      <div className="text-sm font-medium text-foreground">{d.client.nom}</div>
                      <div className="ref mt-0.5 text-muted-foreground">{d.id}</div>
                      <div className="mt-2 border-t border-border pt-2">
                        <AvancementEtape dossier={d} />
                      </div>
                    </Link>
                    {/* Équivalent clavier au glisser-déposer : déplacer une carte à la souris
                        seulement exclut tout utilisateur clavier de l'action principale du kanban. */}
                    <div className="mt-2 flex items-center justify-between gap-1 border-t border-border pt-2">
                      <button
                        type="button"
                        aria-label={`Reculer ${d.client.nom} à l'étape précédente`}
                        disabled={e.n <= 1}
                        onClick={() => onMove(d.id, e.n - 1)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Avancer ${d.client.nom} à l'étape suivante`}
                        disabled={e.n >= ETAPES.length}
                        onClick={() => onMove(d.id, e.n + 1)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                      >
                        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
                {colDossiers.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    Aucun dossier
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
