import { Suspense, lazy, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { Routes, Route } from "react-router-dom";
import { BandeauCookies } from "./components/BandeauCookies";
import { DemandeRapide } from "./components/DemandeRapide";
import { Loader } from "./components/Loader";
import { PreferencesCookies } from "./components/PreferencesCookies";
import { SmoothScroll } from "./components/SmoothScroll";
import { SuiviSections } from "./components/SuiviSections";
import { useLangue } from "./i18n";
import { prefersReducedMotion, ScrollTrigger } from "./lib/gsap";
import { lancerIntro } from "./lib/intro";
import { initialiserSuivi } from "./lib/suivi";
import { Cta } from "./sections/Cta";
import { Destination } from "./sections/Destination";
import { Faq } from "./sections/Faq";
import { Footer } from "./sections/Footer";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { Methode } from "./sections/Methode";
import { Packs } from "./sections/Packs";
import { Pourquoi } from "./sections/Pourquoi";
import { Temoignages } from "./sections/Temoignages";

const BlogPage = lazy(() => import("./pages/BlogPage").then((m) => ({ default: m.BlogPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const ConditionsPage = lazy(() => import("./pages/ConditionsPage").then((m) => ({ default: m.ConditionsPage })));
const ConfidentialitePage = lazy(() => import("./pages/ConfidentialitePage").then((m) => ({ default: m.ConfidentialitePage })));
const CookiesPage = lazy(() => import("./pages/CookiesPage").then((m) => ({ default: m.CookiesPage })));
const SecuritePage = lazy(() => import("./pages/SecuritePage").then((m) => ({ default: m.SecuritePage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));
const ServerErrorPage = lazy(() => import("./pages/ServerErrorPage").then((m) => ({ default: m.ServerErrorPage })));
const ArticleDossierVisaSchengenMarocReleveBancaire = lazy(() => import("./pages/ArticleDossierVisaSchengenMarocReleveBancaire").then((m) => ({ default: m.ArticleDossierVisaSchengenMarocReleveBancaire })));
const ArticleRefusVisaSchengenMarocMotifsRecours = lazy(() => import("./pages/ArticleRefusVisaSchengenMarocMotifsRecours").then((m) => ({ default: m.ArticleRefusVisaSchengenMarocMotifsRecours })));
const ArticleRecruterSalarieMarocainAutorisationTravail = lazy(() => import("./pages/ArticleRecruterSalarieMarocainAutorisationTravail").then((m) => ({ default: m.ArticleRecruterSalarieMarocainAutorisationTravail })));
const ArticleRendezVousTlscontactBlsAgadir2026 = lazy(() => import("./pages/ArticleRendezVousTlscontactBlsAgadir2026").then((m) => ({ default: m.ArticleRendezVousTlscontactBlsAgadir2026 })));

export function App() {
  const { langue, t } = useLangue();
  const [intro, setIntro] = useState<"attente" | "vol" | "fini">(() => {
    if (!prefersReducedMotion()) return "attente";
    lancerIntro();
    return "fini";
  });

  useEffect(() => {
    if (intro === "fini") document.getElementById("eiden-seo")?.remove();
  }, [intro]);

  useEffect(() => {
    const classe = "intro-en-cours";
    if (intro === "fini") document.documentElement.classList.remove(classe);
    else document.documentElement.classList.add(classe);
    return () => document.documentElement.classList.remove(classe);
  }, [intro]);

  useEffect(() => {
    initialiserSuivi();
  }, []);

  const [montrerScrollTop, setMontrerScrollTop] = useState(false);
  useEffect(() => {
    const montrer = () => setMontrerScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", montrer);
    montrer();
    return () => window.removeEventListener("scroll", montrer);
  }, [intro]);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        {intro !== "fini" && (
          <Loader onReady={() => setIntro("vol")} onDone={() => setIntro("fini")} />
        )}
        <DemandeRapide>
          <a
            href="#contenu"
            className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-ink focus:px-4 focus:text-[14px] focus:font-bold focus:text-white"
          >
            {t.allerContenu}
          </a>
          <Header />
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <Routes>
              <Route
                path="/"
                element={
                  <main key={langue} id="contenu" className="filigrane-rond relative overflow-x-clip">
                    <SuiviSections />
                    <Hero />
                    <Destination />
                    <Methode />
                    <Pourquoi />
                    <Packs />
                    <Temoignages />
                    <Faq />
                    <Cta />
                  </main>
                }
              />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/dossier-visa-schengen-maroc-releve-bancaire" element={<ArticleDossierVisaSchengenMarocReleveBancaire />} />
              <Route path="/blog/dossier-visa-schengen-maroc-releve-bancaire/" element={<ArticleDossierVisaSchengenMarocReleveBancaire />} />
              <Route path="/blog/refus-visa-schengen-maroc-motifs-recours" element={<ArticleRefusVisaSchengenMarocMotifsRecours />} />
              <Route path="/blog/refus-visa-schengen-maroc-motifs-recours/" element={<ArticleRefusVisaSchengenMarocMotifsRecours />} />
              <Route path="/blog/recruter-salarie-marocain-autorisation-travail" element={<ArticleRecruterSalarieMarocainAutorisationTravail />} />
              <Route path="/blog/recruter-salarie-marocain-autorisation-travail/" element={<ArticleRecruterSalarieMarocainAutorisationTravail />} />
              <Route path="/blog/rendez-vous-tlscontact-bls-agadir-2026" element={<ArticleRendezVousTlscontactBlsAgadir2026 />} />
              <Route path="/blog/rendez-vous-tlscontact-bls-agadir-2026/" element={<ArticleRendezVousTlscontactBlsAgadir2026 />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/conditions" element={<ConditionsPage />} />
              <Route path="/confidentialite" element={<ConfidentialitePage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/securite" element={<SecuritePage />} />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Footer />
        </DemandeRapide>
        {intro === "fini" && <BandeauCookies />}
        <PreferencesCookies />
      </SmoothScroll>
    </MotionConfig>
  );
}