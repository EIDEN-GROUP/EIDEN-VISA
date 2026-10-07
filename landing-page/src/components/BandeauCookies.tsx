// Bandeau de consentement cookies : affiché tant que le visiteur ne s'est pas
// prononcé (`eiden-consentement-v1` absent). « Tout accepter » charge les traceurs
// configurés (GTM/GA4/Clarity/Bing, voir `src/lib/suivi.ts`), « Tout refuser »
// n'en charge aucun. Détails : page publique `/cookies.html`.
import { useEffect, useState } from "react";
import { useLangue } from "../i18n";
import {
  choisirConsentement,
  EVENEMENT_CONSENTEMENT,
  lirePreferences,
  ouvrirPreferences,
} from "../lib/suivi";

export function BandeauCookies() {
  const { t } = useLangue();
  const [visible, setVisible] = useState(() => lirePreferences() === null);
  // Choix exprimé dans la modale « Personnaliser » : le bandeau se ferme aussi
  // (les deux ne doivent jamais rester affichés ensemble).
  useEffect(() => {
    const fermer = () => {
      if (lirePreferences() !== null) setVisible(false);
    };
    window.addEventListener(EVENEMENT_CONSENTEMENT, fermer);
    return () => window.removeEventListener(EVENEMENT_CONSENTEMENT, fermer);
  }, []);
  if (!visible) return null;
  const B = t.bandeauCookies;

  const choisir = (choix: "accepte" | "refuse") => {
    choisirConsentement(choix);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={B.titre}
      className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:bottom-6 sm:end-6 sm:max-w-[420px]"
    >
      <div className="rounded-2xl bg-ink p-5 text-white shadow-[0_24px_60px_-20px_rgb(11_26_48/0.7)] ring-1 ring-white/10">
        <p className="font-serif text-[17px] leading-snug">{B.titre}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
          {B.texte}{" "}
          <a
            href="/cookies.html"
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            {B.enSavoirPlus}
          </a>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choisir("accepte")}
            className="h-10 flex-1 rounded-xl bg-white px-4 text-[14px] font-bold whitespace-nowrap text-ink transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {B.accepter}
          </button>
          <button
            type="button"
            onClick={ouvrirPreferences}
            className="h-10 flex-1 rounded-xl px-4 text-[14px] font-bold whitespace-nowrap text-white ring-1 ring-white/25 transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {B.personnaliser}
          </button>
          <button
            type="button"
            onClick={() => choisir("refuse")}
            className="h-10 flex-1 rounded-xl px-4 text-[14px] font-bold whitespace-nowrap text-white/85 ring-1 ring-white/25 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {B.refuser}
          </button>
        </div>
      </div>
    </div>
  );
}
