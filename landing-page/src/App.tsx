import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
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
export function App() {
  const { langue, t } = useLangue();
  // attente : loader seul · vol : landing montée sous le rideau, l'avion passe · fini.
  const [intro, setIntro] = useState<"attente" | "vol" | "fini">(() => {
    if (!prefersReducedMotion()) return "attente";
    lancerIntro();
    return "fini";
  });

  // Suivi consenti (GTM/GA4/Clarity/Bing) : dormant sans acceptation cookies.
  useEffect(() => {
    initialiserSuivi();
  }, []);

  // Nouvelle langue (ou fin du loader) = nouvelles hauteurs : on recale les déclencheurs GSAP.
  useEffect(() => {
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [langue, intro]);

  // Barre de défilement de la page : masquée (styles.css) jusqu'au premier défilement
  // après le loader.
  useEffect(() => {
    if (intro !== "fini") return;
    const montrer = () => document.documentElement.classList.add("scroll-vu");
    window.addEventListener("scroll", montrer, { once: true, passive: true });
    return () => window.removeEventListener("scroll", montrer);
  }, [intro]);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        {intro !== "fini" && (
          <Loader onReady={() => setIntro("vol")} onDone={() => setIntro("fini")} />
        )}
        {/* Demande rapide : badges + popup, ouverte par les CTA ; hors de <main>, son état
            survit au changement de langue. */}
        {intro !== "attente" && (
          <DemandeRapide>
            <a
              href="#contenu"
              className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-[14px] focus:font-bold focus:text-white"
            >
              {t.allerContenu}
            </a>
            <Header />
            {/* Remonté à chaque changement de langue : SplitText redécoupe les nouveaux textes. */}
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
            <Footer />
          </DemandeRapide>
        )}
        {/* Bandeau cookies après le loader pour ne pas le recouvrir. */}
        {intro === "fini" && <BandeauCookies />}
        {/* Modale de préférences : ouverte depuis le bandeau ou le pied de page. */}
        <PreferencesCookies />
      </SmoothScroll>
    </MotionConfig>
  );
}
