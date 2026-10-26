import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLangue } from "../i18n";

export function NotFoundPage() {
  const { langue } = useLangue();
  const estArabe = langue === "ar";

  useEffect(() => {
    const ancienTitre = document.title;
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const ancienRobots = robots?.content;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const ancienneDescription = description?.content;
    document.title = estArabe ? "الصفحة غير موجودة | EIDEN Visa" : "Page introuvable | EIDEN Visa";
    robots?.setAttribute("content", "noindex, follow");
    description?.setAttribute(
      "content",
      estArabe
        ? "هذه الصفحة غير موجودة. عد إلى الصفحة الرئيسية أو استكشف خدمات EIDEN Visa في أكادير."
        : "Cette page est introuvable. Retournez à l’accueil ou découvrez les services EIDEN Visa à Agadir.",
    );
    return () => {
      document.title = ancienTitre;
      if (ancienRobots !== undefined) robots?.setAttribute("content", ancienRobots);
      if (ancienneDescription !== undefined)
        description?.setAttribute("content", ancienneDescription);
    };
  }, [estArabe]);

  return (
    <main id="contenu" className="notfound-app relative isolate flex min-h-[calc(100svh-7rem)] flex-col items-center justify-center overflow-hidden bg-cream px-5 py-14 text-center text-ink sm:px-8">
      <div aria-hidden="true" className="notfound-clouds pointer-events-none absolute inset-x-0 top-[10%] -z-10 h-[42%]" />
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-brand"
      >
        EIDEN VISA · AGADIR
      </motion.p>
      <motion.p
        aria-hidden="true"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="notfound-number select-none bg-gradient-to-b from-brand via-brand-dark to-[#e8bfc2] bg-clip-text font-sans text-[clamp(9rem,35vw,20rem)] font-bold leading-[0.82] tracking-[-0.09em] text-transparent"
      >
        404
      </motion.p>
      <motion.section
        lang={langue}
        dir={estArabe ? "rtl" : "ltr"}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="mt-8 max-w-[40rem]"
      >
        <h1 className="font-sans text-[clamp(1.55rem,4vw,2.2rem)] font-semibold leading-tight tracking-[-0.04em] text-ink">
          {estArabe ? "عذراً، هذه الصفحة غير موجودة." : "Désolé, cette page est introuvable."}
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted sm:text-[15px]">
          {estArabe
            ? "ربما تغيّر الرابط أو أن العنوان غير متاح. يمكنك العودة إلى الصفحة الرئيسية أو استكشاف خدماتنا."
            : "Le lien a peut-être changé ou l’adresse n’existe plus. Retournez à l’accueil ou découvrez nos services."}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-dark"
          >
            {estArabe ? "العودة إلى الرئيسية" : "Retour à l’accueil"}
          </Link>
          <Link
            to="/services/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-line bg-card px-6 py-3 text-[14px] font-bold text-ink transition-colors hover:border-brand hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-dark"
          >
            {estArabe ? "اكتشف خدماتنا" : "Découvrir nos services"}
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
