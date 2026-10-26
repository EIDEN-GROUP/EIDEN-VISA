import { useEffect } from "react";
import { useLangue } from "../i18n";

interface BlogCardData {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  readingTime: string;
}

const cards: BlogCardData[] = [
  {
    slug: "/blog/dossier-visa-schengen-maroc-releve-bancaire",
    title: "Visa Schengen depuis le Maroc : dossier, ressources et justificatifs",
    excerpt: "Un relevé bancaire ne suffit pas à lui seul. Comprenez comment présenter vos ressources, votre situation au Maroc et le motif du voyage dans un dossier cohérent.",
    category: "Dossier",
    image: "/images/optimized/blog-dossier-visa-schengen-maroc-releve-bancaire.webp",
    readingTime: "5 min",
  },
  {
    slug: "/blog/refus-visa-schengen-maroc-motifs-recours",
    title: "Refus de visa Schengen au Maroc : motifs, recours et nouvelle demande",
    excerpt: "Lisez la décision, vérifiez le délai de recours applicable et choisissez entre contester et déposer un dossier corrigé.",
    category: "Refus",
    image: "/images/optimized/blog-refus-visa-schengen-maroc-motifs-recours.webp",
    readingTime: "6 min",
  },
  {
    slug: "/blog/recruter-salarie-marocain-autorisation-travail",
    title: "Recruter un salarié marocain en France : autorisation de travail et étapes",
    excerpt: "Repères pour l’employeur : vérifier le titre requis, déposer une demande si nécessaire et préparer un dossier de recrutement cohérent.",
    category: "Recrutement",
    image: "/images/optimized/blog-recruter-salarie-marocain-autorisation-travail.webp",
    readingTime: "7 min",
  },
  {
    slug: "/blog/rendez-vous-tlscontact-bls-agadir-2026",
    title: "Visa Espagne à Agadir : consignes officielles et préparation",
    excerpt: "Où vérifier les consignes officielles, comment préparer votre demande et quoi faire si aucun créneau n’est proposé. Les disponibilités et procédures peuvent évoluer.",
    category: "Rendez-vous",
    image: "/images/blog-rendez-vous-tlscontact-bls-agadir-2026.webp",
    readingTime: "8 min",
  },
];

export function BlogPage() {
  const { langue } = useLangue();
  const estArabe = langue === "ar";

  useEffect(() => {
    const url = "https://visa.eiden-group.com/images/optimized/blog-banniere-eiden-visa.webp";
    document.title = "Blog EIDEN Visa | Visa Schengen Maroc";
    const og = document.querySelector('meta[property="og:image"]');
    if (og) og.setAttribute("content", url);
    const tw = document.querySelector('meta[name="twitter:image"]');
    if (tw) tw.setAttribute("content", url);
  }, []);

  return (
    <div className="bg-cream font-sans text-ink">
      <main id="contenu" className="relative overflow-x-clip">
        <section className="relative isolate overflow-hidden bg-[#0d0c0e] text-white">
          <img
            src="/images/optimized/blog-banniere-eiden-visa.webp"
            alt="Blog EIDEN Visa : guides visa Schengen depuis le Maroc"
            className="absolute inset-0 w-full h-full object-cover -z-10 opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[#0d0c0e]/55 -z-9" />
          <div className="container-page relative flex min-h-[280px] items-end pt-40 pb-12">
            <div className="max-w-[720px]">
              <p className="eyebrow text-white/90">EIDEN Visa - Blog</p>
              <h1 className="mt-3 font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] leading-tight">
                {estArabe ? "المدونة" : "Blog "}
              </h1>
              <p className="mt-4 max-w-[60ch] text-[15px] leading-relaxed text-white/85">
                Des guides pratiques pour préparer votre dossier, comprendre un refus de visa et organiser un rendez-vous depuis le Maroc. Nos articles expliquent les démarches et leurs limites : seule l’autorité consulaire décide de délivrer un visa.
              </p>
            </div>
          </div>
        </section>

        <section className="container-page py-14">
          <ul className="blog-grid">
            {cards.map((card) => (
              <li key={card.slug}>
                <a href={card.slug.endsWith("/") ? card.slug : `${card.slug}/`} className="blog-card">
                  <div className="blog-card-image-wrap">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="blog-card-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="blog-card-body">
                    <div className="blog-card-meta">
                      <span className="blog-card-category">{card.category}</span>
                      <span className="blog-card-reading">{card.readingTime}</span>
                    </div>
                    <h3 className="blog-card-title">{card.title}</h3>
                    <p className="blog-card-excerpt">{card.excerpt}</p>
                    <span className="blog-card-cta">Lire le guide →</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
