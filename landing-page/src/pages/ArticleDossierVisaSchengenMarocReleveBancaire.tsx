import { ArticleLayout } from "./ArticleLayout";
import bodyHtml from "./articles/dossier-visa-schengen-maroc-releve-bancaire.html?raw";

export function ArticleDossierVisaSchengenMarocReleveBancaire() {
  return (
    <ArticleLayout
      slug="/blog/dossier-visa-schengen-maroc-releve-bancaire/"
      title="Visa Schengen depuis le Maroc : dossier, ressources et justificatifs"
      lead="Un relevé bancaire ne suffit pas à lui seul. Découvrez comment présenter vos ressources, votre situation au Maroc et le motif du voyage dans un dossier cohérent."
      category="Dossier"
      readingTime="5 min"
      updated="26 octobre 2026"
      banner="/images/optimized/blog-dossier-visa-schengen-maroc-releve-bancaire.webp"
      bannerAlt="Blog EIDEN Visa - dossier visa Schengen Maroc"
      bodyHtml={bodyHtml}
      related={[
      { slug: "/blog/refus-visa-schengen-maroc-motifs-recours/", title: "Refus de visa Schengen au Maroc : motifs, recours et nouvelle demande" },
      { slug: "/blog/rendez-vous-tlscontact-bls-agadir-2026/", title: "Rendez-vous visa Espagne à Agadir : BLS et TLScontact" },
      ]}
    />
  );
}
