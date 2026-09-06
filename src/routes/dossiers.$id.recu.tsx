import { createFileRoute, Link } from "@tanstack/react-router";
import { useDossier } from "@/lib/store";
import { encaisse } from "@/lib/dossier-model";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dossiers/$id/recu")({
  component: Recu,
});

function Recu() {
  const { id } = Route.useParams();
  const { dossier: d, isLoading } = useDossier(id);

  if (!d) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Chargement…" : "Dossier introuvable."}
        </p>
      </div>
    );
  }

  const paye = d.paiements.filter((p) => p.encaisse);
  const total = paye.reduce((s, p) => s + p.montant, 0);
  const emisLe = new Date().toLocaleDateString("fr-FR");

  return (
    <div className="min-h-screen bg-background px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between print:hidden">
        <Link to="/dossiers/$id" params={{ id: d.id }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Retour au dossier
        </Link>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Imprimer / Enregistrer en PDF
        </Button>
      </div>

      <div className="mx-auto max-w-2xl border border-border bg-card p-10 print:border-0 print:p-0">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <div className="page-title text-2xl">Eiden Visa</div>
            <p className="mt-1 text-xs text-muted-foreground">EIDEN Group · Agadir, Maroc</p>
          </div>
          <div className="text-right">
            <div className="ref text-muted-foreground">Reçu de paiement</div>
            <div className="ref mt-1 text-foreground">{d.id}</div>
            <div className="ref mt-1 text-muted-foreground">Émis le {emisLe}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-b border-border py-6 text-sm">
          <div>
            <div className="ref text-muted-foreground">Client</div>
            <div className="mt-1 font-medium text-foreground">{d.client.nom}</div>
            <div className="mt-0.5 text-muted-foreground">{d.client.telephone}</div>
            <div className="text-muted-foreground">{d.client.ville}</div>
          </div>
          <div>
            <div className="ref text-muted-foreground">Dossier</div>
            <div className="mt-1 font-medium text-foreground">{d.titre}</div>
            <div className="mt-0.5 text-muted-foreground">
              {d.rdv.centre.includes("BLS") ? "Espagne · BLS" : "France · TLScontact"}
            </div>
            <div className="text-muted-foreground">Centre : {d.rdv.centre}</div>
          </div>
        </div>

        <div className="py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="ref border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Libellé</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 text-right font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {paye.map((p, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-2.5 text-foreground">{p.libelle}</td>
                  <td className="py-2.5 text-muted-foreground">{p.date}</td>
                  <td className="py-2.5 text-right font-medium text-foreground">{p.montant} MAD</td>
                </tr>
              ))}
              {paye.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-muted-foreground">
                    Aucun paiement encaissé à ce jour.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm font-semibold">
            <span className="text-foreground">Total encaissé</span>
            <span className="num-display text-lg text-foreground">{total} MAD</span>
          </div>
        </div>

        <p className="border-t border-border pt-6 text-xs text-muted-foreground">
          Ce reçu atteste des sommes effectivement encaissées par Eiden Visa au titre de l'accompagnement de ce dossier.
          Les frais de rendez-vous et droits de visa réglés directement à TLScontact ou BLS International n'apparaissent
          ici que s'ils ont transité par Eiden Visa.
        </p>
      </div>
    </div>
  );
}
