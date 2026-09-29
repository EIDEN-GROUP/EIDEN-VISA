import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useRdvWatches } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pause, Play } from "lucide-react";

export const Route = createFileRoute("/_app/rdv-watch")({
  component: RdvWatch,
});

function RdvWatch() {
  const { watches, isLoading, creer, basculer, supprimer } = useRdvWatches();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!label.trim() || !url.trim()) return;
    setSubmitting(true);
    try {
      await creer({ label: label.trim(), url: url.trim() });
      setLabel("");
      setUrl("");
    } catch {
      setError("URL invalide ou erreur d'enregistrement — vérifiez le lien collé.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Surveillance RDV</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Collez ici l'URL de la page de disponibilité que vous consultez à la main (TLScontact,
          BLS, tout site public). Le script de surveillance relit cette liste toutes seules minutes
          et prévient l'équipe (notification dans l'app) dès qu'un changement est détecté — il ne
          réserve jamais de créneau à votre place, il vous fait juste gagner le temps de rafraîchir
          la page vous-même.
        </p>
      </div>

      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-lg">Ajouter une surveillance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                Libellé (ex. « TLScontact Agadir — France »)
              </label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Libellé"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                URL de la page de disponibilité
              </label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            {error && <p className="sm:col-span-2 text-xs text-[var(--stop)]">{error}</p>}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={submitting || !label.trim() || !url.trim()}>
                {submitting ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-lg">URLs surveillées ({watches.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
          {!isLoading && watches.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune surveillance pour l'instant. Ajoutez une URL ci-dessus.
            </p>
          )}
          {watches.map((w) => (
            <div
              key={w.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  {w.label}
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-medium " +
                      (w.actif
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {w.actif ? "Active" : "En pause"}
                  </span>
                </div>
                <div className="truncate text-xs text-muted-foreground">{w.url}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {w.lastCheckedAt
                    ? `Dernière vérification : ${new Date(w.lastCheckedAt).toLocaleString("fr-FR")}${
                        w.lastStatus ? ` · ${w.lastStatus}` : ""
                      }`
                    : "Pas encore vérifiée — le script externe doit tourner."}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => basculer(w.id, !w.actif)}
                  title={w.actif ? "Mettre en pause" : "Réactiver"}
                >
                  {w.actif ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => supprimer(w.id)} title="Supprimer">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
