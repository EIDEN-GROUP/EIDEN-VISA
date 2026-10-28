import { ArticleLayout } from "./ArticleLayout";
import bodyHtml from "./articles/recruter-salarie-marocain-autorisation-travail.html?raw";

export function ArticleRecruterSalarieMarocainAutorisationTravail() {
  return (
    <ArticleLayout
      slug="/blog/recruter-salarie-marocain-autorisation-travail/"
      title="Embaucher un salarié marocain en France"
      description="Employeurs : vérifiez l’autorisation de travail requise, les justificatifs et les démarches officielles avant de recruter un salarié marocain."
      lead="Repères pour l’employeur : vérifier le titre requis, déposer une demande si nécessaire et préparer un dossier de recrutement cohérent."
      category="Recrutement"
      readingTime="7 min"
      updated="28 octobre 2026"
      banner="/images/optimized/blog-recruter-salarie-marocain-autorisation-travail.webp"
      bannerAlt="Blog EIDEN Visa - recrutement salarie marocain"
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
