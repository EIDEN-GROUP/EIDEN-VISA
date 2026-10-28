import { ArticleLayout } from "./ArticleLayout";
import bodyHtml from "./articles/refus-visa-schengen-maroc-motifs-recours.html?raw";

export function ArticleRefusVisaSchengenMarocMotifsRecours() {
  return (
    <ArticleLayout
      slug="/blog/refus-visa-schengen-maroc-motifs-recours/"
      title="Refus visa Schengen : motifs et recours"
      description="Après un refus de visa Schengen au Maroc, lisez la motivation, vérifiez le délai de recours et corrigez les pièces avant une nouvelle demande."
      lead="Lisez la décision, vérifiez le délai de recours applicable et choisissez entre contester et déposer un dossier corrigé."
      category="Refus"
      readingTime="6 min"
      updated="28 octobre 2026"
      banner="/images/optimized/blog-refus-visa-schengen-maroc-motifs-recours.webp"
      bannerAlt="Blog EIDEN Visa - refus visa Schengen Maroc"
      bodyHtml={bodyHtml}
      related={[
        {
          slug: "/blog/dossier-visa-schengen-maroc-releve-bancaire/",
          title: "Visa Schengen depuis le Maroc : dossier, ressources et justificatifs",
        },
        {
          slug: "/blog/rendez-vous-tlscontact-bls-agadir-2026/",
          title: "Rendez-vous visa Espagne à Agadir : BLS et TLScontact",
        },
      ]}
    />
  );
}
