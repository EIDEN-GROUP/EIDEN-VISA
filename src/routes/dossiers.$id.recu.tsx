import { createFileRoute, Link } from "@tanstack/react-router";
import { useDossier } from "@/lib/store";
import type { Dossier } from "@/lib/dossier-model";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Check } from "lucide-react";

export const Route = createFileRoute("/dossiers/$id/recu")({
  component: Recu,
});

function buildReceiptPdf(d: Dossier) {
  return import("jspdf").then(({ jsPDF }) => {
    const paye = d.paiements.filter((p) => p.encaisse);
    const total = paye.reduce((s, p) => s + p.montant, 0);
    const emisLe = new Date().toLocaleDateString("fr-FR");

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 20;
    const contentW = pageW - marginX * 2;

    // Ink terracotta (matches the app's --primary token), forest ink for structure.
    const terracotta: [number, number, number] = [138, 74, 41];
    const forest: [number, number, number] = [42, 51, 41];
    const gray: [number, number, number] = [110, 110, 105];

    let y = 22;
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...forest);
    doc.text("Eiden Visa", marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text("EIDEN Group · Agadir, Maroc", marginX, y + 5);

    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text("REÇU DE PAIEMENT", pageW - marginX, y - 3, { align: "right" });
    doc.setTextColor(...forest);
    doc.text(d.id, pageW - marginX, y + 2, { align: "right" });
    doc.setTextColor(...gray);
    doc.text(`Émis le ${emisLe}`, pageW - marginX, y + 7, { align: "right" });

    y += 16;
    doc.setDrawColor(...terracotta);
    doc.setLineWidth(0.6);
    doc.line(marginX, y, pageW - marginX, y);

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("CLIENT", marginX, y);
    doc.text("DOSSIER", marginX + contentW / 2, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...forest);
    doc.text(d.client.nom, marginX, y);
    doc.text(d.titre, marginX + contentW / 2, y, { maxWidth: contentW / 2 - 4 });

    y += 5.5;
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(d.client.telephone, marginX, y);
    doc.text(
      d.centre.includes("BLS") ? "Espagne · BLS" : "France · TLScontact",
      marginX + contentW / 2,
      y,
    );

    y += 5;
    doc.text(d.client.ville, marginX, y);

    y += 12;
    doc.setDrawColor(220, 214, 200);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageW - marginX, y);

    // Checklist des pièces — même contenu que l'onglet Documents du dossier, pour que le
    // client reparte avec la liste exacte de ce qui a déjà été fourni ou reste à apporter.
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("PIÈCES DU DOSSIER", marginX, y);

    const ensureSpace = (needed: number) => {
      if (y + needed > 280) {
        doc.addPage();
        y = 20;
      }
    };

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    const pieceLineHeight = 4.6;
    const pieceIndent = 6.5;
    for (const p of d.pieces) {
      // Une pièce dont le libellé tient sur plusieurs lignes doit pousser la suivante
      // d'autant de lignes, sinon le texte suivant se superpose (bug observé en prod).
      const lines = doc.splitTextToSize(p.label, contentW - pieceIndent) as string[];
      ensureSpace(lines.length * pieceLineHeight + 2);
      doc.setDrawColor(...gray);
      doc.setLineWidth(0.35);
      doc.rect(marginX, y - 3, 3, 3);
      if (p.fourni) {
        doc.setFillColor(...terracotta);
        doc.rect(marginX, y - 3, 3, 3, "F");
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(0.5);
        doc.line(marginX + 0.5, y - 1.6, marginX + 1.3, y - 0.7);
        doc.line(marginX + 1.3, y - 0.7, marginX + 2.6, y - 2.7);
      }
      doc.setTextColor(
        p.fourni ? forest[0] : gray[0],
        p.fourni ? forest[1] : gray[1],
        p.fourni ? forest[2] : gray[2],
      );
      doc.text(lines, marginX + pieceIndent, y);
      y += lines.length * pieceLineHeight + 2;
    }
    if (d.pieces.length === 0) {
      doc.setTextColor(...gray);
      doc.text("Aucune pièce listée pour ce dossier.", marginX, y);
      y += 6;
    }

    y += 4;
    ensureSpace(16);
    doc.setDrawColor(220, 214, 200);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageW - marginX, y);

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...gray);
    doc.text("LIBELLÉ", marginX, y);
    doc.text("DATE", marginX + contentW * 0.55, y);
    doc.text("MONTANT", pageW - marginX, y, { align: "right" });

    y += 3;
    doc.setDrawColor(...forest);
    doc.line(marginX, y, pageW - marginX, y);

    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...forest);
    if (paye.length === 0) {
      doc.setTextColor(...gray);
      doc.text("Aucun paiement encaissé à ce jour.", marginX, y);
      y += 6;
    } else {
      for (const p of paye) {
        ensureSpace(7);
        doc.setTextColor(...forest);
        doc.text(p.libelle, marginX, y, { maxWidth: contentW * 0.5 });
        doc.setTextColor(...gray);
        doc.text(p.date ?? "—", marginX + contentW * 0.55, y);
        doc.setTextColor(...forest);
        doc.text(`${p.montant} MAD`, pageW - marginX, y, { align: "right" });
        y += 7;
        doc.setDrawColor(238, 232, 220);
        doc.setLineWidth(0.2);
        doc.line(marginX, y - 3, pageW - marginX, y - 3);
      }
    }

    y += 3;
    doc.setDrawColor(...terracotta);
    doc.setLineWidth(0.5);
    doc.line(marginX, y, pageW - marginX, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...forest);
    doc.text("Total encaissé", marginX, y);
    doc.setFontSize(13);
    doc.text(`${total} MAD`, pageW - marginX, y, { align: "right" });

    // Signature block — client acknowledgment and the Eiden Visa agent's countersignature.
    // Bornée à la page courante : jamais forcée à une position fixe qui déborderait sur une
    // nouvelle page si la checklist des pièces a déjà poussé le contenu plus bas.
    ensureSpace(40);
    const sigY = y + 20;
    const colW = contentW / 2 - 6;
    doc.setDrawColor(...gray);
    doc.setLineWidth(0.3);
    doc.line(marginX, sigY, marginX + colW, sigY);
    doc.line(marginX + contentW - colW, sigY, pageW - marginX, sigY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    doc.text("Signature du client", marginX, sigY + 5);
    doc.text("Bon pour accord sur les montants ci-dessus.", marginX, sigY + 9.5);

    doc.text("Pour Eiden Visa", marginX + contentW - colW, sigY + 5);
    doc.text(d.agent, marginX + contentW - colW, sigY + 9.5);

    y = sigY + 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...gray);
    const note =
      "Ce reçu atteste des sommes effectivement encaissées par Eiden Visa au titre de l'accompagnement de ce dossier. " +
      "Les droits de visa réglés directement au centre de dépôt (TLScontact ou BLS) n'apparaissent " +
      "ici que s'ils ont transité par Eiden Visa.";
    doc.text(note, marginX, y, { maxWidth: contentW, lineHeightFactor: 1.4 });

    doc.save(`Recu-${d.id}.pdf`);
  });
}

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

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between">
        <Link
          to="/dossiers/$id"
          params={{ id: d.id }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour au dossier
        </Link>
        <Button size="sm" onClick={() => buildReceiptPdf(d)}>
          <Download className="h-3.5 w-3.5" /> Télécharger le reçu (PDF)
        </Button>
      </div>

      <div className="mx-auto max-w-2xl border border-border bg-card p-10">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <div className="page-title text-2xl">Eiden Visa</div>
            <p className="mt-1 text-xs text-muted-foreground">EIDEN Group · Agadir, Maroc</p>
          </div>
          <div className="text-right">
            <div className="ref text-muted-foreground">Reçu de paiement</div>
            <div className="ref mt-1 text-foreground">{d.id}</div>
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
              {d.centre.includes("BLS") ? "Espagne · BLS" : "France · TLScontact"}
            </div>
          </div>
        </div>

        <div className="border-b border-border py-6">
          <div className="ref mb-3 text-muted-foreground">Pièces du dossier</div>
          <ul className="space-y-1.5">
            {d.pieces.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span
                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
                    p.fourni ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {p.fourni && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className={p.fourni ? "text-foreground" : "text-muted-foreground"}>
                  {p.label}
                </span>
              </li>
            ))}
            {d.pieces.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Aucune pièce listée pour ce dossier.
              </li>
            )}
          </ul>
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

        <div className="mt-4 grid grid-cols-2 gap-6 border-t border-border pt-6 text-xs text-muted-foreground">
          <div>
            <div className="h-10 border-b border-border" />
            <div className="mt-1.5 font-medium text-foreground">Signature du client</div>
            <div className="mt-0.5">Bon pour accord sur les montants ci-dessus.</div>
          </div>
          <div>
            <div className="h-10 border-b border-border" />
            <div className="mt-1.5 font-medium text-foreground">Pour Eiden Visa</div>
            <div className="mt-0.5">{d.agent}</div>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Ce reçu atteste des sommes effectivement encaissées par Eiden Visa au titre de
          l'accompagnement de ce dossier. Les droits de visa réglés directement au centre de dépôt
          (TLScontact ou BLS) n'apparaissent ici que s'ils ont transité par Eiden Visa.
        </p>
      </div>
    </div>
  );
}
