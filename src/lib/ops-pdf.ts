/**
 * Générateur de PDF pour les exports de l'espace /ops (journal des encaissements,
 * comptes, rapport analytique). Même identité visuelle que le reçu client :
 * en-tête « Eiden Visa », filet terracotta, tables sobres.
 *
 * jsPDF est chargé dynamiquement — il ne pèse dans le bundle que si un export est déclenché.
 */

export interface PdfColumn {
  header: string;
  /** Poids relatif de la colonne (les largeurs sont normalisées). */
  w: number;
  align?: "right";
}

export interface PdfSection {
  heading: string;
  columns: PdfColumn[];
  rows: string[][];
  /** Affiché à la place du tableau quand `rows` est vide. */
  empty?: string;
}

export interface OpsPdfOptions {
  title: string;
  filename: string;
  intro?: string;
  kpis?: { label: string; value: string }[];
  sections: PdfSection[];
}

const TERRACOTTA: [number, number, number] = [138, 74, 41];
const FOREST: [number, number, number] = [42, 51, 41];
const GRAY: [number, number, number] = [110, 110, 105];
const HAIRLINE: [number, number, number] = [232, 226, 214];

export async function exportOpsPdf(opts: OpsPdfOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 18;
  const contentW = pageW - marginX * 2;
  let y = 20;

  const ensure = (need: number) => {
    if (y + need > pageH - 16) {
      doc.addPage();
      y = 20;
    }
  };

  // ---- En-tête ----
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...FOREST);
  doc.text("Eiden Visa", marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text("EIDEN Group · Agadir, Maroc", marginX, y + 4.5);

  doc.setFont("courier", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(opts.title.toUpperCase(), pageW - marginX, y - 2, { align: "right" });
  doc.text(`Édité le ${new Date().toLocaleString("fr-FR")}`, pageW - marginX, y + 3, {
    align: "right",
  });

  y += 11;
  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.6);
  doc.line(marginX, y, pageW - marginX, y);
  y += 10;

  // ---- Intro ----
  if (opts.intro) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    const lines = doc.splitTextToSize(opts.intro, contentW) as string[];
    ensure(lines.length * 4.5 + 4);
    doc.text(lines, marginX, y);
    y += lines.length * 4.5 + 6;
  }

  // ---- KPIs ----
  if (opts.kpis?.length) {
    const perRow = 3;
    const cw = contentW / perRow;
    opts.kpis.forEach((it, i) => {
      const col = i % perRow;
      if (col === 0) ensure(15);
      const x = marginX + col * cw;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(it.label.toUpperCase(), x, y);
      doc.setFont("times", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...FOREST);
      doc.text(it.value, x, y + 6);
      if (col === perRow - 1 || i === opts.kpis!.length - 1) y += 15;
    });
    y += 3;
  }

  // ---- Sections ----
  for (const section of opts.sections) {
    ensure(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...FOREST);
    doc.text(section.heading, marginX, y);
    y += 5.5;

    if (section.rows.length === 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text(section.empty ?? "Aucune donnée.", marginX, y);
      y += 9;
      continue;
    }

    const totalW = section.columns.reduce((s, c) => s + c.w, 0);
    const colX: number[] = [];
    const colW: number[] = [];
    let acc = marginX;
    for (const c of section.columns) {
      const w = (c.w / totalW) * contentW;
      colX.push(acc);
      colW.push(w);
      acc += w;
    }
    const cellX = (i: number) =>
      section.columns[i]!.align === "right" ? colX[i]! + colW[i]! - 1 : colX[i]!;
    const cellOpts = (i: number) =>
      section.columns[i]!.align === "right" ? { align: "right" as const } : undefined;

    // Ligne d'en-tête
    ensure(9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    section.columns.forEach((c, i) => doc.text(c.header.toUpperCase(), cellX(i), y, cellOpts(i)));
    y += 2.5;
    doc.setDrawColor(...FOREST);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageW - marginX, y);
    y += 4.5;

    // Lignes
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const row of section.rows) {
      const wrapped = row.map(
        (cell, i) => doc.splitTextToSize(cell ?? "", colW[i]! - 3) as string[],
      );
      const h = Math.max(1, ...wrapped.map((w) => w.length)) * 4.3 + 2.6;
      ensure(h);
      wrapped.forEach((w, i) => {
        const isFirst = i === 0;
        doc.setTextColor(
          isFirst ? FOREST[0] : GRAY[0],
          isFirst ? FOREST[1] : GRAY[1],
          isFirst ? FOREST[2] : GRAY[2],
        );
        doc.text(w, cellX(i), y, cellOpts(i));
      });
      y += h;
      doc.setDrawColor(...HAIRLINE);
      doc.setLineWidth(0.2);
      doc.line(marginX, y - 2.6, pageW - marginX, y - 2.6);
    }
    y += 5;
  }

  // ---- Pied de page : pagination ----
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text(`Eiden Visa · document interne`, marginX, pageH - 8);
    doc.text(`${p} / ${pages}`, pageW - marginX, pageH - 8, { align: "right" });
  }

  doc.save(opts.filename);
}
