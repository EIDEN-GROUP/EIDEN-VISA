import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";
import { DemandeRapide } from "./components/DemandeRapide";
import { Loader } from "./components/Loader";
import { SmoothScroll } from "./components/SmoothScroll";
import { useLangue } from "./i18n";
import { prefersReducedMotion, ScrollTrigger } from "./lib/gsap";
import { lancerIntro } from "./lib/intro";
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
  const { langue } = useLangue();
  // attente : loader seul · vol : landing montée sous le rideau, l'avion passe · fini.
  const [intro, setIntro] = useState<"attente" | "vol" | "fini">(() => {
    if (!prefersReducedMotion()) return "attente";
    lancerIntro();
    return "fini";
  });

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
            <Header />
            {/* Remonté à chaque changement de langue : SplitText redécoupe les nouveaux textes. */}
            <main key={langue} className="filigrane-rond relative overflow-x-clip">
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
      </SmoothScroll>
    </MotionConfig>
  );
}
