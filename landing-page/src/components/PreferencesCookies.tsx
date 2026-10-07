// Modale de préférences cookies : choix catégorie par catégorie.
// Ouverte par le bouton « Personnaliser » du bandeau, le bouton
// « Gérer mes cookies » du pied de page, ou l'événement `eiden:preferences-cookies`.
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLangue } from "../i18n";
import {
  choisirConsentement,
  choisirPreferences,
  EVENEMENT_PREFERENCES,
  lirePreferences,
  type Preferences,
} from "../lib/suivi";
import { EASE_OUT } from "./motion";

const CATEGORIES = ["statistiques", "experience", "marketing"] as const;
type Categorie = (typeof CATEGORIES)[number];

function Interrupteur({
  actif,
  verrouille,
  etiquette,
  onChange,
}: {
  actif: boolean;
  verrouille?: boolean;
  etiquette: string;
  onChange?: (actif: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={verrouille ? true : actif}
      aria-label={etiquette}
      disabled={verrouille}
      onClick={() => onChange?.(!actif)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        verrouille
          ? "cursor-not-allowed bg-ink/70"
          : actif
            ? "bg-brand"
            : "bg-ink/15 hover:bg-ink/25"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 size-5 rounded-full bg-white shadow-[0_2px_6px_-1px_rgb(11_26_48/0.35)] transition-all duration-300 ${
          verrouille || actif ? "start-6" : "start-1"
        }`}
      />
    </button>
  );
}

export function PreferencesCookies() {
  const { t } = useLangue();
  const P = t.preferencesCookies;
  const [ouvert, setOuvert] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({
    statistiques: false,
    experience: false,
    marketing: false,
  });
  const fermerRef = useRef<HTMLButtonElement>(null);

  const ouvrir = useCallback(() => {
    setPrefs(lirePreferences() ?? { statistiques: false, experience: false, marketing: false });
    setOuvert(true);
  }, []);

  useEffect(() => {
    window.addEventListener(EVENEMENT_PREFERENCES, ouvrir);
    return () => window.removeEventListener(EVENEMENT_PREFERENCES, ouvrir);
  }, [ouvrir]);

  useEffect(() => {
    if (!ouvert) return;
    fermerRef.current?.focus();
    const echap = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", echap);
    return () => window.removeEventListener("keydown", echap);
  }, [ouvert]);

  if (!ouvert) return null;

  const lignes: { cle: Categorie; titre: string; texte: string }[] = [
    { cle: "statistiques", titre: P.statistiques, texte: P.statistiquesDesc },
    { cle: "experience", titre: P.experience, texte: P.experienceDesc },
    { cle: "marketing", titre: P.marketing, texte: P.marketingDesc },
  ];

  const terminer = (choix: Preferences) => {
    choisirPreferences(choix);
    setOuvert(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        aria-hidden="true"
        onClick={() => setOuvert(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-cookies-titre"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="demande-carte relative isolate flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-[0_30px_80px_-30px_rgb(11_26_48/0.6)] sm:max-h-[min(92svh,780px)] sm:max-w-[600px] sm:rounded-[28px]"
      >
        <span
          aria-hidden="true"
          className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden"
        />
        <header className="shrink-0 px-5 pt-4 sm:px-8 sm:pt-7">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="preferences-cookies-titre"
              className="pt-1 font-serif text-[clamp(1.55rem,4.6vw,2.15rem)] leading-[1.08] text-ink"
            >
              {P.titre}
            </h2>
            <button
              ref={fermerRef}
              type="button"
              onClick={() => setOuvert(false)}
              aria-label={P.fermer}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-ink shadow-[var(--shadow-soft)] transition-transform duration-300 hover:rotate-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>
          <p className="mt-2 max-w-[440px] text-[14px] leading-[1.55] text-muted">{P.intro}</p>
        </header>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-1 sm:px-8"
        >
          <ul className="divide-y divide-line border-t border-line">
            <li className="flex items-center justify-between gap-5 py-4">
              <div>
                <p className="font-serif text-[18px] leading-[1.2] font-medium text-ink">
                  {P.necessaires}
                </p>
                <p className="mt-1 text-[13.5px] leading-[1.55] text-muted">{P.necessairesDesc}</p>
                <p className="mt-2 text-[11px] font-bold tracking-[0.14em] text-brand uppercase">
                  {P.toujoursActif}
                </p>
              </div>
              <Interrupteur actif verrouille etiquette={P.necessaires} />
            </li>
            {lignes.map(({ cle, titre, texte }) => (
              <li key={cle} className="flex items-center justify-between gap-5 py-4">
                <div>
                  <p className="font-serif text-[18px] leading-[1.2] font-medium text-ink">
                    {titre}
                  </p>
                  <p className="mt-1 text-[13.5px] leading-[1.55] text-muted">{texte}</p>
                </div>
                <Interrupteur
                  actif={prefs[cle]}
                  etiquette={titre}
                  onChange={(actif) => setPrefs((p) => ({ ...p, [cle]: actif }))}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 border-t border-line/80 bg-cream/85 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:flex-row sm:px-8">
          <button
            type="button"
            onClick={() => {
              choisirConsentement("accepte");
              setOuvert(false);
            }}
            className="h-12 shrink-0 rounded-full bg-ink px-5 text-[14.5px] font-semibold whitespace-nowrap text-white transition-colors duration-300 hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-1"
          >
            {P.toutAccepter}
          </button>
          <button
            type="button"
            onClick={() => terminer(prefs)}
            className="h-12 shrink-0 rounded-full bg-brand px-5 text-[14.5px] font-semibold whitespace-nowrap text-white shadow-[0_10px_30px_-12px_rgb(174_10_26/0.6)] transition-colors duration-300 hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-1"
          >
            {P.enregistrer}
          </button>
          <button
            type="button"
            onClick={() => {
              choisirConsentement("refuse");
              setOuvert(false);
            }}
            className="h-12 shrink-0 rounded-full px-5 text-[14.5px] font-semibold whitespace-nowrap text-ink-soft ring-1 ring-line transition-colors duration-300 hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-1"
          >
            {P.toutRefuser}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
