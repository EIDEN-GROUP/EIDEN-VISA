import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { definirSeo } from "../lib/seo";

interface ArticleLayoutProps {
  slug: string;
  title: string;
  description: string;
  lead: string;
  category: string;
  readingTime: string;
  updated: string;
  banner: string;
  bannerAlt: string;
  bodyHtml: string;
  related?: { slug: string; title: string }[];
}

export function ArticleLayout(props: ArticleLayoutProps) {
  const {
    slug,
    title,
    description,
    lead,
    category,
    readingTime,
    updated,
    banner,
    bannerAlt,
    bodyHtml,
    related,
  } = props;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    definirSeo({ titre: title + " | EIDEN Visa", description, url: slug });
    const url = "https://visa.eiden-group.com" + banner;
    const og = document.querySelector('meta[property="og:image"]');
    if (og) og.setAttribute("content", url);
    const tw = document.querySelector('meta[name="twitter:image"]');
    if (tw) tw.setAttribute("content", url);

    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [title, description, slug, banner]);

  return (
    <div className="bg-cream font-sans text-ink">
      {/* Reading progress bar */}
      <div
        className="fixed inset-x-0 top-0 z-[60] h-1 w-full bg-transparent"
        role="progressbar"
        aria-label="Progression de lecture"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="h-full bg-brand transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main id="contenu" className="relative overflow-x-clip">
        <section className="relative isolate overflow-hidden bg-[#0d0c0e] text-white">
          <img
            src={banner}
            alt={bannerAlt}
            width={1800}
            height={1004}
            className="absolute inset-0 w-full h-full object-cover -z-10 opacity-50"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c0e] via-[#0d0c0e]/70 to-[#0d0c0e]/30 -z-9" />
          <div className="container-page relative flex min-h-[360px] flex-col justify-end pt-44 pb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[780px]"
            >
              <nav
                aria-label="Fil d'Ariane"
                className="mb-5 flex flex-wrap items-center gap-1.5 text-[13px] text-white/60"
              >
                <Link to="/" className="transition hover:text-white">
                  EIDEN Visa
                </Link>
                <span className="text-white/30">/</span>
                <Link to="/blog" className="transition hover:text-white">
                  Blog
                </Link>
                <span className="text-white/30">/</span>
                <span className="text-white/90">{category}</span>
              </nav>
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">
                {category}
              </span>
              <h1 className="mt-4 font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.01em]">
                {title}
              </h1>
              <p className="mt-5 max-w-[64ch] text-[17px] leading-[1.7] text-white/85">{lead}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-white/55">
                <span>{readingTime} de lecture</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Mis à jour le {updated}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Par EIDEN Visa</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container-page py-16">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="article-prose mx-auto max-w-[720px]"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {related && related.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-20 max-w-[720px]"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <p className="eyebrow text-muted">À lire aussi</p>
                <span className="h-px flex-1 bg-line" />
              </div>
              <ul className="space-y-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to={r.slug}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-card px-6 py-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-float"
                    >
                      <span className="font-serif text-[1.1rem] leading-snug text-ink transition-colors group-hover:text-brand">
                        {r.title}
                      </span>
                      <span className="shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-16 max-w-[720px] overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-float sm:p-10"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow text-white/60">Accompagnement</p>
                <h3 className="mt-2 font-serif text-2xl leading-tight">
                  Besoin d’aide pour votre dossier ?
                </h3>
                <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-white/75">
                  EIDEN Visa peut vous aider à préparer votre dossier. Le diagnostic initial est
                  gratuit ; l’accompagnement ne garantit pas la délivrance d’un visa.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[14px] font-bold text-ink transition hover:bg-cream"
              >
                Nous contacter
              </Link>
            </div>
          </motion.div>

          <div className="mx-auto mt-12 max-w-[720px] text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-muted transition hover:text-brand"
            >
              ← Retour au blog
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
