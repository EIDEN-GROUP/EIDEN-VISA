import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useDashboardStats,
  useAlertesDossiers,
  useDossiersRecents,
  type DateRange,
} from "@/lib/store";
import { alertes, completion } from "@/lib/dossier-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NiveauBadge } from "@/components/dossier/badges";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { AlertTriangle, ArrowRight, ShieldAlert, Wallet2, FolderOpen } from "lucide-react";
import stampAlerte from "@/assets/decorations/stamp-alerte.png";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

function Dashboard() {
  const [range, setRange] = useState<DateRange>({});
  const { stats } = useDashboardStats(range);
  // Bornée aux dossiers actifs les plus récents : les alertes sont une logique métier
  // en JS, pas une agrégation SQL — à l'échelle réelle on la lit sur un lot récent,
  // pas sur la table entière. Le filtre de date ne s'applique pas à ce lot borné.
  const { dossiers: actifsRecents } = useAlertesDossiers();
  const { dossiers: recents } = useDossiersRecents();

  const alertesParDossier = actifsRecents
    .map((d) => ({ d, a: alertes(d) }))
    .filter((x) => x.a.length > 0);
  const aAutoriser = actifsRecents.filter((d) => !d.uploadAutorise);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue d'ensemble des dossiers Eiden Visa, agence Agadir.
          </p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={FolderOpen}
          label="Dossiers actifs"
          value={stats?.actifs ?? "—"}
          sub={`${stats?.total ?? "—"} au total`}
          from="#FDBA74"
          to="#F97316"
        />
        <Kpi
          icon={ShieldAlert}
          label="À autoriser"
          value={stats?.aAutoriser ?? "—"}
          sub="Upload bloqué"
          from="#34D399"
          to="#0D9488"
        />
        <Kpi
          icon={AlertTriangle}
          label="Alertes actives"
          value={alertesParDossier.length}
          sub="Dossiers actifs récents"
          from="#FB7185"
          to="#E11D48"
        />
        <Kpi
          icon={Wallet2}
          label="Encaissé"
          value={`${(stats?.totalEncaisse ?? 0).toLocaleString("fr-FR")} MAD`}
          sub="Tous dossiers"
          from="#22D3EE"
          to="#0284C7"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="panel lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            {alertesParDossier.length > 0 && <img src={stampAlerte} alt="" className="h-8 w-8" />}
            <CardTitle className="text-base">Alertes système</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {alertesParDossier.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">
                Aucun blocage détecté pour l'instant.
              </p>
            )}
            {alertesParDossier.map(({ d, a }) => (
              <Link
                key={d.id}
                to="/dossiers/$id"
                params={{ id: d.id }}
                className="block px-5 py-3.5 hover:bg-accent/40"
              >
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
            <CardTitle className="text-base">Dossiers à autoriser ({aAutoriser.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {aAutoriser.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">
                Tous les dossiers actifs sont autorisés.
              </p>
            )}
            {aAutoriser.slice(0, 8).map((d) => (
              <Link
                key={d.id}
                to="/dossiers/$id"
                params={{ id: d.id }}
                className="flex items-center justify-between px-5 py-3 text-sm hover:bg-accent/40"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{d.client.nom}</div>
                  <div className="ref text-muted-foreground">
                    {d.id} · étape {d.etape}
                  </div>
                </div>
                <span className="ref shrink-0 text-[var(--warn)]">Upload bloqué</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dossiers récents</CardTitle>
          <Link
            to="/dossiers"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
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
                  {!d.uploadAutorise && (
                    <span className="ref text-[var(--warn)]">Non autorisé</span>
                  )}
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
  from,
  to,
}: {
  icon: typeof FolderOpen;
  label: string;
  value: string | number;
  sub: string;
  from: string;
  to: string;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl text-white shadow-md"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="flex items-start justify-between p-5">
        <div>
          <div className="num-display text-3xl font-bold leading-none">{value}</div>
          <div className="mt-1.5 text-sm font-medium text-white/90">{label}</div>
        </div>
        <Icon className="h-8 w-8 shrink-0 text-white/70" strokeWidth={1.5} />
      </div>
      <div className="border-t border-white/20 bg-black/10 px-5 py-2 text-xs font-medium text-white/85">
        {sub}
      </div>
    </div>
  );
}
