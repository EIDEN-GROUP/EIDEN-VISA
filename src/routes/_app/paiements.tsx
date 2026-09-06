import { createFileRoute, Link } from "@tanstack/react-router";
import { usePaiementsStats, usePackCounts, useDossiersAvecImpaye, useDossiersAvecEncaissement } from "@/lib/store";
import { PACKS, type PackKey } from "@/lib/dossier-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import stampEncaissement from "@/assets/decorations/stamp-encaissement.png";
import stampPassport from "@/assets/decorations/stamp-passport.png";
import stampBoardingPass from "@/assets/decorations/stamp-boarding-pass.png";
import stampSuitcase from "@/assets/decorations/stamp-date.png";

const PACK_ICON: Record<PackKey, string> = {
  base: stampPassport,
  voyage: stampBoardingPass,
  global: stampSuitcase,
};

export const Route = createFileRoute("/_app/paiements")({
  component: Paiements,
});

function Paiements() {
  const { stats } = usePaiementsStats();
  const { counts } = usePackCounts();
  // Bornées côté serveur (300 / 100 dossiers les plus récents concernés) : à l'échelle
  // réelle on ne charge jamais tous les dossiers pour en dériver des paiements en JS.
  const { dossiers: dossiersImpaye, encaisser } = useDossiersAvecImpaye();
  const { dossiers: dossiersEncaisses } = useDossiersAvecEncaissement();

  const enAttente = dossiersImpaye.flatMap((d) =>
    d.paiements.map((p, i) => ({ dossier: d, paiement: p, index: i })).filter((l) => !l.paiement.encaisse),
  );
  const encaisses = dossiersEncaisses.flatMap((d) =>
    d.paiements.map((p, i) => ({ dossier: d, paiement: p, index: i })).filter((l) => l.paiement.encaisse),
  );
  const totalEncaisse = stats?.totalEncaisse ?? 0;
  const totalAttente = stats?.totalAttente ?? 0;
  const nbPaiements = (stats?.nEncaisse ?? 0) + (stats?.nAttente ?? 0);

  const countByPack = new Map(counts.map((c) => [c.pack, c.n]));
  const parPack = (Object.keys(PACKS) as PackKey[]).map((k) => ({
    key: k,
    ...PACKS[k],
    count: countByPack.get(k) ?? 0,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <img src={stampEncaissement} alt="" className="h-12 w-12" />
        <div>
          <h1 className="page-title">Paiements</h1>
          <p className="mt-1 text-sm text-muted-foreground">Encaissements et soldes, tous dossiers confondus.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border rounded-xl border border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Total encaissé</div>
          <div className="num-display mt-1 text-3xl text-[var(--ok)]">
            {totalEncaisse.toLocaleString("fr-FR")} MAD
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">En attente d'encaissement</div>
          <div className="num-display mt-1 text-3xl text-[var(--warn)]">
            {totalAttente.toLocaleString("fr-FR")} MAD
          </div>
        </div>
        <div className="p-5">
          <div className="text-xs font-medium text-muted-foreground">Paiements enregistrés</div>
          <div className="num-display mt-1 text-3xl text-foreground">{nbPaiements}</div>
        </div>
      </div>

      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-base">Paliers de pack</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {parPack.map((p) => (
            <div key={p.key} className="rounded-xl border border-border p-4">
              <img src={PACK_ICON[p.key]} alt="" className="mb-2 h-9 w-9" />
              <div className="text-sm font-semibold text-foreground">{p.label}</div>
              <div className="ref mt-1 text-muted-foreground">
                {p.prix} MAD · marge nette {p.margeNette !== null ? `${p.margeNette} MAD` : "à confirmer (courtier assurance)"}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{p.contenu}</p>
              <div className="mt-3 text-xs font-medium text-foreground">{p.count} dossier(s)</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-base">Encaissements en attente ({stats?.nAttente ?? enAttente.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {enAttente.length === 0 && <p className="p-5 text-sm text-muted-foreground">Rien en attente.</p>}
          {enAttente.map(({ dossier, paiement, index }) => (
            <div key={`${dossier.id}-${index}`} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <Link to="/dossiers/$id" params={{ id: dossier.id }} className="text-sm font-medium text-foreground hover:underline">
                  {dossier.client.nom}
                </Link>
                <div className="ref text-muted-foreground">
                  {dossier.id} · {paiement.libelle}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="ref text-foreground">{paiement.montant} MAD</span>
                <Button size="sm" variant="outline" onClick={() => encaisser(dossier.id, index)}>
                  Encaisser
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-base">Historique des encaissements récents ({encaisses.length})</CardTitle>
          <p className="text-xs text-muted-foreground">
            Les {encaisses.length} encaissements les plus récents — {stats?.nEncaisse ?? 0} au total.
          </p>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {encaisses.map(({ dossier, paiement, index }) => (
            <div key={`${dossier.id}-${index}`} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <Link to="/dossiers/$id" params={{ id: dossier.id }} className="font-medium text-foreground hover:underline">
                  {dossier.client.nom}
                </Link>
                <span className="ml-2 text-xs text-muted-foreground">{paiement.libelle}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{paiement.date}</span>
                <span className="ref text-foreground">{paiement.montant} MAD</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
