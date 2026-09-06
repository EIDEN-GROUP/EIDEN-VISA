import { createFileRoute, Link } from "@tanstack/react-router";
import { useDossiers, useCreneaux } from "@/lib/store";
import { alertes, completion, encaisse } from "@/lib/dossier-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NiveauBadge, RdvBadge } from "@/components/dossier/badges";
import { AlertTriangle, ArrowRight, CalendarClock, Wallet2, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import stampAlerte from "@/assets/decorations/stamp-alerte.png";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

function Dashboard() {
  const { dossiers } = useDossiers();
  const { creneaux } = useCreneaux();

  const actifs = dossiers.filter((d) => d.etape < 7);
  const enAttenteCreneau = dossiers.filter((d) => d.rdv.statut === "recherche");
  const alertesParDossier = dossiers
    .map((d) => ({ d, a: alertes(d) }))
    .filter((x) => x.a.length > 0);
  const totalEncaisse = dossiers.reduce((s, d) => s + encaisse(d), 0);
  const recents = [...dossiers].slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Tableau de bord</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vue d'ensemble des dossiers Eiden Visa, agence Agadir.
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border border border-border rounded-xl sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        <Kpi icon={FolderOpen} label="Dossiers actifs" value={actifs.length} sub={`${dossiers.length} au total`} />
        <Kpi
          icon={CalendarClock}
          label="En attente de créneau"
          value={enAttenteCreneau.length}
          sub="TLScontact / BLS"
        />
        <Kpi
          icon={AlertTriangle}
          label="Alertes actives"
          value={alertesParDossier.length}
          sub="Dossiers à traiter"
          tone={alertesParDossier.length ? "stop" : "ok"}
        />
        <Kpi icon={Wallet2} label="Encaissé" value={`${totalEncaisse.toLocaleString("fr-FR")} MAD`} sub="Tous dossiers" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="panel lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            {alertesParDossier.length > 0 && <img src={stampAlerte} alt="" className="h-8 w-8" />}
            <CardTitle className="text-base">Alertes système</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {alertesParDossier.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">Aucun blocage détecté pour l'instant.</p>
            )}
            {alertesParDossier.map(({ d, a }) => (
              <Link key={d.id} to="/dossiers/$id" params={{ id: d.id }} className="block px-5 py-3.5 hover:bg-accent/40">
                <div className="flex items-center justify-between">
                  <span className="ref text-muted-foreground">{d.id}</span>
                  <span className="text-sm font-medium text-foreground">{d.client.nom}</span>
                </div>
                <ul className="mt-1.5 space-y-1">
                  {a.map((msg, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--stop)]">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.5} />
                      {msg}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="panel">
          <CardHeader>
            <CardTitle className="text-base">Veille créneaux</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {creneaux.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">Aucun créneau suivi pour l'instant.</p>
            )}
            {creneaux.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <div className="font-medium text-foreground">{c.centre}</div>
                  <div className="ref text-muted-foreground">{c.date}</div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-xs font-medium",
                    c.statut === "libre"
                      ? "text-[var(--ok)]"
                      : c.statut === "reserve"
                        ? "text-[var(--info)]"
                        : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "dot",
                      c.statut === "libre" ? "bg-[var(--ok)]" : c.statut === "reserve" ? "bg-[var(--info)]" : "bg-muted-foreground",
                    )}
                  />
                  {c.statut === "libre" ? `${c.places} places` : c.statut === "reserve" ? "Réservé" : "Fermé"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dossiers récents</CardTitle>
          <Link to="/dossiers" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Voir tous les dossiers <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {recents.map((d) => {
            const c = completion(d);
            return (
              <Link
                key={d.id}
                to="/dossiers/$id"
                params={{ id: d.id }}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/40"
              >
                <div className="flex items-center gap-4">
                  <span className="ref w-32 text-muted-foreground">{d.id}</span>
                  <div>
                    <div className="text-sm font-medium text-foreground">{d.client.nom}</div>
                    <div className="text-xs text-muted-foreground">{d.titre}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {c.ok}/{c.total} pièces
                  </span>
                  <RdvBadge statut={d.rdv.statut} />
                  <NiveauBadge level={d.niveau} />
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: typeof FolderOpen;
  label: string;
  value: string | number;
  sub: string;
  tone?: "default" | "ok" | "stop";
}) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon
          className={
            tone === "stop"
              ? "h-4 w-4 shrink-0 text-[var(--stop)]"
              : tone === "ok"
                ? "h-4 w-4 shrink-0 text-[var(--ok)]"
                : "h-4 w-4 shrink-0 text-muted-foreground"
          }
          strokeWidth={1.5}
        />
      </div>
      <div className="num-display mt-3 text-3xl text-foreground">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
