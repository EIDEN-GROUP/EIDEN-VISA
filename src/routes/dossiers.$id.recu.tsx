import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useBrouillons, useDossier } from "@/lib/store";
import { defaultRecuDonnees, recuTotaux, type RecuDonnees } from "@/lib/dossier-model";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Pencil } from "lucide-react";
import logoEidenVisa from "@/assets/decorations/logo-eiden-visa.webp";
// jsPDF ne lit pas le WebP : même logo en PNG pour le PDF.
import logoEidenVisaPng from "@/assets/decorations/logo-eiden-visa.png";
import { ApercuRecu, EditeurBrouillon, ListeBrouillons } from "@/components/dossier/recu-brouillon";

/** Logo officiel (900 × 264 px) : ratio largeur / hauteur. */
const LOGO_RATIO = 900 / 264;

function chargerDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        }),
    );
}

export const Route = createFileRoute("/dossiers/$id/recu")({
  component: Recu,
});

/** Le reçu « avant paiement » est identique, sans la section des paiements. */
export type ModeRecu = "apres" | "avant";

/** Filigrane diagonal sur chaque page : un brouillon modifié n'atteste rien. */
function filigraneBrouillon(
  doc: {
    getNumberOfPages: () => number;
    setPage: (n: number) => void;
    setFont: (f: string, s: string) => void;
    setFontSize: (n: number) => void;
    setTextColor: (r: number, g: number, b: number) => void;
    text: (t: string, x: number, y: number, o?: object) => void;
    internal: { pageSize: { getWidth: () => number } };
  },
  ecart: boolean,
) {
  if (!ecart) return;
  const pageW = doc.internal.pageSize.getWidth();
  const pages = doc.getNumberOfPages();
  doc.setFont("helvetica", "bold");
  doc.setTextColor(205, 195, 180);
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(44);
    doc.text("BROUILLON", pageW / 2, 150, { align: "center", angle: 45 });
    doc.setFontSize(13);
    doc.text("sans valeur comptable", pageW / 2, 168, { align: "center", angle: 45 });
  }
}

/**
 * Génère le PDF d'un reçu résolu (`RecuDonnees`) : officiel comme brouillon,
 * l'écran (`ApercuRecu`) et le PDF partent des mêmes données.
 */
export function buildReceiptPdf(id: string, r: RecuDonnees, ecart: boolean) {
  return Promise.all([import("jspdf"), chargerDataUrl(logoEidenVisaPng)]).then(
    ([{ jsPDF }, logo]) => {
      const { paye, du, total, reste } = recuTotaux(r);
      const mode = r.mode;

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const marginX = 20;
      const contentW = pageW - marginX * 2;

      // Encre marine = --primary du système (oklch(0.24 0.03 280) → RVB 28, 30, 45),
      // forest pour la structure.
      const marine: [number, number, number] = [28, 30, 45];
      const forest: [number, number, number] = [42, 51, 41];
      const gray: [number, number, number] = [110, 110, 105];

      let y = 22;
      const logoH = 14;
      doc.addImage(logo, "PNG", marginX, y - 11, logoH * LOGO_RATIO, logoH);

      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...gray);
      doc.text("REÇU DE PAIEMENT", pageW - marginX, y - 3, { align: "right" });
      doc.setTextColor(...forest);
      doc.text(id, pageW - marginX, y + 2, { align: "right" });
      doc.setTextColor(...gray);
      doc.text(`Émis le ${r.emisLe}`, pageW - marginX, y + 7, { align: "right" });

      y += 16;
      doc.setDrawColor(...marine);
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
      doc.text(r.clientNom, marginX, y);
      // Le titre peut tenir sur plusieurs lignes : le pays se place juste dessous.
      const titreLignes: string[] = doc.splitTextToSize(r.dossierTitre, contentW / 2 - 4);
      doc.text(titreLignes, marginX + contentW / 2, y);
      const yPays = y + titreLignes.length * 5;

      doc.setFontSize(9);
      doc.setTextColor(...gray);
      doc.text(r.clientTelephone, marginX, y + 5.5);
      doc.text(r.clientVille, marginX, y + 10.5);
      doc.text(r.pays, marginX + contentW / 2, yPays);

      y = Math.max(y + 10.5, yPays);

      y += 12;
      doc.setDrawColor(220, 214, 200);
      doc.setLineWidth(0.3);
      doc.line(marginX, y, pageW - marginX, y);

      const visibles = r.pieces.filter((p) => !p.masque);
      if (r.afficherPieces) {
        // Checklist des pièces - même contenu que l'onglet Documents du dossier, pour que le
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
        for (const p of visibles) {
          // Une pièce dont le libellé tient sur plusieurs lignes doit pousser la suivante
          // d'autant de lignes, sinon le texte suivant se superpose (bug observé en prod).
          const lines = doc.splitTextToSize(p.label, contentW - pieceIndent) as string[];
          ensureSpace(lines.length * pieceLineHeight + 2);
          doc.setDrawColor(...gray);
          doc.setLineWidth(0.35);
          doc.rect(marginX, y - 3, 3, 3);
          if (p.fourni) {
            doc.setFillColor(...marine);
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
        if (visibles.length === 0) {
          doc.setTextColor(...gray);
          doc.text("Aucune pièce listée pour ce dossier.", marginX, y);
          y += 6;
        }
      }

      const ensureSpace = (needed: number) => {
        if (y + needed > 280) {
          doc.addPage();
          y = 20;
        }
      };

      if (mode === "apres") {
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
            doc.text(p.date ?? "-", marginX + contentW * 0.55, y);
            doc.setTextColor(...forest);
            doc.text(`${p.montant} MAD`, pageW - marginX, y, { align: "right" });
            y += 7;
            doc.setDrawColor(238, 232, 220);
            doc.setLineWidth(0.2);
            doc.line(marginX, y - 3, pageW - marginX, y - 3);
          }
        }

        y += 3;
        doc.setDrawColor(...marine);
        doc.setLineWidth(0.5);
        doc.line(marginX, y, pageW - marginX, y);
        y += 8;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...forest);
        doc.text("Total encaissé", marginX, y);
        doc.setFontSize(13);
        doc.text(`${total} MAD`, pageW - marginX, y, { align: "right" });

        if (r.afficherReste) {
          // Ce qu'il reste à régler, ligne par ligne : le client sait quoi apporter et pour quoi.
          y += 6;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          for (const p of du) {
            ensureSpace(6);
            y += 5.5;
            doc.setTextColor(...gray);
            doc.text(p.libelle, marginX, y, { maxWidth: contentW * 0.7 });
            doc.text(`${p.montant} MAD`, pageW - marginX, y, { align: "right" });
          }
          ensureSpace(10);
          y += 8;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(...forest);
          doc.text(reste > 0 ? "Reste à payer" : "Reste à payer - dossier soldé", marginX, y);
          doc.setFontSize(13);
          doc.text(`${reste} MAD`, pageW - marginX, y, { align: "right" });
        }
      }

      // Signature du client seule : bon pour accord sur les montants.
      // Bornée à la page courante : jamais forcée à une position fixe qui déborderait sur une
      // nouvelle page si la checklist des pièces a déjà poussé le contenu plus bas.
      ensureSpace(40);
      const sigY = y + 20;
      const colW = contentW / 2 - 6;
      doc.setDrawColor(...gray);
      doc.setLineWidth(0.3);
      doc.line(marginX, sigY, marginX + colW, sigY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...gray);
      doc.text(r.signature, marginX, sigY + 5);
      doc.text(r.mentionAccord, marginX, sigY + 9.5);

      y = sigY + 22;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...gray);
      doc.text(r.note, marginX, y, { maxWidth: contentW, lineHeightFactor: 1.4 });

      filigraneBrouillon(doc, ecart);
      doc.save(`Recu-${id}${ecart ? "-brouillon" : ""}.pdf`);
    },
  );
}

function Recu() {
  const { id } = Route.useParams();
  const { dossier: d, isLoading } = useDossier(id);
  const { sauver } = useBrouillons(id);
  // Avant paiement : même reçu, sans la section des paiements.
  const [mode, setMode] = useState<ModeRecu>("apres");
  // Brouillon en cours d'édition : temporaire, rien n'est enregistré ni modifié
  // dans le dossier tant que l'agent ne télécharge pas ou n'enregistre pas.
  const [edition, setEdition] = useState<RecuDonnees | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // Remonte l'éditeur à chaque nouveau point de départ (officiel ou reprise) :
  // `initial` n'est lu qu'au montage, la clé force le remontage.
  const [cleEdition, setCleEdition] = useState(0);
  const demarrerEdition = (donnees: RecuDonnees) => {
    setEdition(donnees);
    setMessage(null);
    setCleEdition((c) => c + 1);
  };

  if (!d) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Chargement…" : "Dossier introuvable."}
        </p>
      </div>
    );
  }

  const officiel = defaultRecuDonnees(d);
  officiel.mode = mode;

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
        <Button size="sm" onClick={() => buildReceiptPdf(d.id, officiel, false)}>
          <Download className="h-3.5 w-3.5" /> Télécharger le reçu (PDF)
        </Button>
      </div>

      <div className="mx-auto mb-6 flex max-w-2xl items-center gap-2">
        <label htmlFor="mode-recu" className="text-sm text-muted-foreground">
          Type de reçu
        </label>
        <select
          id="mode-recu"
          value={mode}
          onChange={(e) => setMode(e.target.value as ModeRecu)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="apres">Après paiement</option>
          <option value="avant">Avant paiement</option>
        </select>
      </div>

      {/* Reçu unique : officiel en lecture seule, ou brouillon éditable en place.
          Rien d'autre sur la page ne duplique le reçu. */}
      <div className="mx-auto mb-10 max-w-2xl space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {edition ? (
              <>
                Brouillon temporaire{" "}
                <span className="font-normal text-muted-foreground">- non enregistré</span>
              </>
            ) : (
              <>
                Reçu officiel{" "}
                <span className="font-normal text-muted-foreground">- celui du dossier</span>
              </>
            )}
          </h2>
          {!edition && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => demarrerEdition(defaultRecuDonnees(d))}
            >
              <Pencil className="h-3.5 w-3.5" /> Modifier
            </Button>
          )}
        </div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        {edition ? (
          <EditeurBrouillon
            key={cleEdition}
            dossier={d}
            initial={edition}
            onAbandon={() => setEdition(null)}
            onEnregistre={async (nom, donnees) => {
              await sauver(nom, donnees);
              setEdition(null);
              setMessage(`Brouillon « ${nom} » enregistré.`);
            }}
          />
        ) : (
          <ApercuRecu r={officiel} ecart={false} />
        )}
      </div>

      {/* Brouillons enregistrés : instantanés nommés, à part du reçu officiel. */}
      <div className="mx-auto mb-10 max-w-2xl space-y-2">
        <h2 className="text-sm font-semibold text-foreground">
          Brouillons enregistrés{" "}
          <span className="font-normal text-muted-foreground">- versions de travail</span>
        </h2>
        <ListeBrouillons
          dossier={d}
          onReprendre={(donnees) => {
            demarrerEdition(donnees);
            window.scrollTo({ top: 0 });
          }}
        />
      </div>
    </div>
  );
}
