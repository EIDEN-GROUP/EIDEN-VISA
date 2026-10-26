import { ArticleLayout } from "./ArticleLayout";
import bodyHtml from "./articles/rendez-vous-tlscontact-bls-agadir-2026.html?raw";

export function ArticleRendezVousTlscontactBlsAgadir2026() {
  return (
    <ArticleLayout
      slug="/blog/rendez-vous-tlscontact-bls-agadir-2026/"
      title="Visa Espagne à Agadir : consignes officielles et préparation"
      lead="Vérifiez les consignes consulaires et la procédure officielle de rendez-vous avant de préparer votre dépôt."
      category="Rendez-vous"
      readingTime="8 min"
      updated="26 octobre 2026"
      banner="/images/blog-rendez-vous-tlscontact-bls-agadir-2026.webp"
      bannerAlt="Guide EIDEN Visa sur la préparation d'une demande de visa Espagne à Agadir"
      bodyHtml={bodyHtml}
      related={[
      { slug: "/blog/dossier-visa-schengen-maroc-releve-bancaire/", title: "Visa Schengen depuis le Maroc : dossier, ressources et justificatifs" },
      { slug: "/blog/refus-visa-schengen-maroc-motifs-recours/", title: "Refus visa Schengen depuis le Maroc" },
      ]}
    />
  );
}
