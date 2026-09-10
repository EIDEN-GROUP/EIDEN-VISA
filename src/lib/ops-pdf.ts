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

  pdfFooters(doc);
  doc.save(opts.filename);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function pdfFooters(doc: any) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text("Eiden Visa · document interne", 18, pageH - 8);
    doc.text(`${p} / ${pages}`, pageW - 18, pageH - 8, { align: "right" });
  }
}

/** Bandeau de titre en haut d'une page, renvoie le y sous le filet terracotta. */
function pdfHeader(doc: any, title: string): number {
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 12;
  const y = 16;
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...FOREST);
  doc.text("Eiden Visa", marginX, y);
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(title.toUpperCase(), pageW - marginX, y - 3, { align: "right" });
  doc.text(`Édité le ${new Date().toLocaleString("fr-FR")}`, pageW - marginX, y + 1.5, {
    align: "right",
  });
  doc.setDrawColor(...TERRACOTTA);
  doc.setLineWidth(0.5);
  doc.line(marginX, y + 5, pageW - marginX, y + 5);
  return y + 11;
}

/**
 * Équivalents sRGB des tokens de thème (thème clair, styles.css), pré-calculés depuis
 * les valeurs oklch. Sert de repli : certains navigateurs (Firefox) sérialisent encore
 * `getComputedStyle().color` en `oklch(...)`, que html2canvas 1.4.1 ne sait pas parser.
 */
const TOKEN_HEX: Record<string, string> = {
  "--background": "#f3f0e6",
  "--foreground": "#1d271d",
  "--card": "#fefdfb",
  "--card-foreground": "#1d271d",
  "--popover": "#fefdfb",
  "--popover-foreground": "#1d271d",
  "--primary": "#86442e",
  "--primary-foreground": "#faf8f2",
  "--secondary": "#eae6da",
  "--secondary-foreground": "#2b362b",
  "--muted": "#eae6da",
  "--muted-foreground": "#676f60",
  "--accent": "#f5dcd1",
  "--accent-foreground": "#6b3725",
  "--destructive": "#86442e",
  "--destructive-foreground": "#faf8f2",
  "--border": "#ded9cc",
  "--input": "#ded9cc",
  "--ring": "#86442e",
  "--rail": "#202e24",
  "--rail-foreground": "#f3f0e7",
  "--rail-muted": "#919c8e",
  "--rail-active": "#334335",
  "--ok": "#346b45",
  "--ok-soft": "#dbeede",
  "--warn": "#946c25",
  "--warn-soft": "#f9eaca",
  "--stop": "#86442e",
  "--stop-soft": "#fee1d6",
  "--info": "#33636e",
  "--info-soft": "#d7edf1",
};
const THEME_TOKENS = Object.keys(TOKEN_HEX);

const COLOR_PROPS = [
  "color",
  "background-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "column-rule-color",
  "caret-color",
  "fill",
  "stroke",
] as const;

/** Fonctions couleur modernes que html2canvas 1.4.1 ne sait pas parser. */
const EXOTIC = /oklch|oklab|\blab\(|\blch\(|color\(|color-mix|light-dark/i;

/** Convertit n'importe quelle couleur CSS en `rgb()/rgba()` via le canvas ; null si impossible. */
function toRgb(input: string, ctx: CanvasRenderingContext2D): string | null {
  const s = input.trim();
  if (!s || s === "none" || s === "transparent") return null;
  try {
    // Deux sentinelles différentes : si l'entrée n'est pas prise, les deux lectures diffèrent.
    ctx.fillStyle = "#010203";
    ctx.fillStyle = s;
    const a = ctx.fillStyle;
    ctx.fillStyle = "#040506";
    ctx.fillStyle = s;
    const b = ctx.fillStyle;
    if (a !== b) return null;
    return EXOTIC.test(a) ? null : a;
  } catch {
    return null;
  }
}

/**
 * Rend un élément du DOM tel quel dans un PDF A4 (capture pixel — le PDF est la copie
 * conforme de ce qui est à l'écran). Utilisé pour le rapport analytique : graphiques inclus.
 *
 * html2canvas 1.4.1 plante sur `oklch()` (tout le thème est en tokens oklch). On corrige
 * en trois temps sur le clone que html2canvas dessine :
 *   1. on réécrit les tokens `:root` en hex ;
 *   2. on repasse chaque élément pour neutraliser toute couleur oklch résiduelle ;
 *   3. on fige les couleurs des SVG (recharts) en attributs inline — sinon le `var()`
 *      ne se résout pas quand html2canvas rastérise le SVG isolément.
 */
export async function exportElementPdf(
  el: HTMLElement,
  opts: { title: string; filename: string },
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const measureCtx = document.createElement("canvas").getContext("2d");
  const rootStyle = getComputedStyle(document.documentElement);
  const tokenValue: Record<string, string> = {};
  for (const token of THEME_TOKENS) {
    const authored = rootStyle.getPropertyValue(token);
    tokenValue[token] = (measureCtx && toRgb(authored, measureCtx)) || TOKEN_HEX[token]!;
  }
  const inkFallback = tokenValue["--foreground"] ?? "#1d271d";

  const canvas = await html2canvas(el, {
    backgroundColor: tokenValue["--background"] ?? "#ffffff",
    scale: 2,
    logging: false,
    onclone: (clonedDoc: Document) => {
      const style = clonedDoc.createElement("style");
      style.textContent =
        ":root{" +
        Object.entries(tokenValue)
          .map(([k, v]) => `${k}:${v};`)
          .join("") +
        "}[data-pdf-hide]{display:none!important}";
      clonedDoc.head.appendChild(style);

      const win = clonedDoc.defaultView;
      const ctx = measureCtx;
      if (!win || !ctx) return;
      try {
        const nodes: Element[] = [clonedDoc.documentElement, ...clonedDoc.querySelectorAll("*")];
        for (const node of nodes) {
          const el = node as HTMLElement;
          const cs = win.getComputedStyle(el);
          const isSvg = node.namespaceURI === "http://www.w3.org/2000/svg";

          for (const prop of COLOR_PROPS) {
            if (!isSvg && (prop === "fill" || prop === "stroke")) continue;
            const raw = cs.getPropertyValue(prop);
            if (!raw || raw === "none") continue;
            // Toujours réécrire fill/stroke des SVG (le var() ne survit pas à la rastérisation).
            // Sinon, ne toucher que les couleurs exotiques que html2canvas ne sait pas lire.
            if (!isSvg && !EXOTIC.test(raw)) continue;
            const rgb = toRgb(raw, ctx);
            if (rgb) {
              el.style.setProperty(prop, rgb, "important");
            } else if (EXOTIC.test(raw)) {
              el.style.setProperty(
                prop,
                prop === "background-color" || prop.endsWith("-color")
                  ? "transparent"
                  : inkFallback,
                "important",
              );
            }
          }

          // box-shadow / text-shadow peuvent contenir une fonction couleur exotique.
          for (const prop of ["box-shadow", "text-shadow"] as const) {
            if (EXOTIC.test(cs.getPropertyValue(prop)))
              el.style.setProperty(prop, "none", "important");
          }
        }
      } catch {
        /* best-effort : mieux vaut un PDF aux couleurs approximatives qu'aucun PDF */
      }
    },
  });

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 12;
  const marginBottom = 12;
  const imgW = pageW - marginX * 2;
  const pxPerMm = canvas.width / imgW;

  const firstTop = pdfHeader(doc, opts.title);
  let sy = 0;
  let page = 0;
  while (sy < canvas.height - 1) {
    const top = page === 0 ? firstTop : 12;
    const availMm = pageH - marginBottom - top;
    const sliceH = Math.min(canvas.height - sy, Math.floor(availMm * pxPerMm));
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceH;
    slice
      .getContext("2d")!
      .drawImage(canvas, 0, sy, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    if (page > 0) doc.addPage();
    doc.addImage(slice, "PNG", marginX, top, imgW, sliceH / pxPerMm);
    sy += sliceH;
    page += 1;
  }

  pdfFooters(doc);
  doc.save(opts.filename);
}
