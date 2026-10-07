// Modale de préférences cookies : choix catégorie par catégorie.
// Ouverte par le bouton « Personnaliser » du bandeau, le bouton
// « Gérer mes cookies » du pied de page, ou l'événement `eiden:preferences-cookies`.
import { useCallback, useEffect, useRef, useState } from "react";
import { useLangue } from "../i18n";
import {
  choisirConsentement,
  choisirPreferences,
  EVENEMENT_PREFERENCES,
  lirePreferences,
  type Preferences,
} from "../lib/suivi";

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
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        verrouille ? "cursor-not-allowed bg-ink/25" : actif ? "bg-brand" : "bg-ink/25"
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all duration-200 ${
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
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        onClick={() => setOuvert(false)}
        className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-cookies-titre"
        className="relative max-h-[92svh] w-full max-w-[560px] overflow-y-auto rounded-[24px] bg-cream p-5 shadow-[0_30px_80px_-30px_rgb(11_26_48/0.6)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="preferences-cookies-titre"
              className="font-serif text-[1.5rem] leading-tight text-ink"
            >
              {P.titre}
            </h2>
            <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{P.intro}</p>
          </div>
          <button
            ref={fermerRef}
            type="button"
            onClick={() => setOuvert(false)}
            aria-label={P.fermer}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-ink shadow-[var(--shadow-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <ul className="mt-4 flex flex-col gap-2.5">
          <li className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 ring-1 ring-line">
            <div>
              <p className="text-[14.5px] font-bold text-ink">{P.necessaires}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{P.necessairesDesc}</p>
              <p className="mt-1 text-[12px] font-bold text-brand">{P.toujoursActif}</p>
            </div>
            <Interrupteur actif verrouille etiquette={P.necessaires} />
          </li>
          {lignes.map(({ cle, titre, texte }) => (
            <li
              key={cle}
              className="flex items-center justify-between gap-4 rounded-2xl bg-card p-4 ring-1 ring-line"
            >
              <div>
                <p className="text-[14.5px] font-bold text-ink">{titre}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{texte}</p>
              </div>
              <Interrupteur
                actif={prefs[cle]}
                etiquette={titre}
                onChange={(actif) => setPrefs((p) => ({ ...p, [cle]: actif }))}
              />
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              choisirConsentement("accepte");
              setOuvert(false);
            }}
            className="h-11 flex-1 rounded-xl bg-ink px-4 text-[14px] font-bold text-white transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {P.toutAccepter}
          </button>
          <button
            type="button"
            onClick={() => terminer(prefs)}
            className="h-11 flex-1 rounded-xl bg-brand px-4 text-[14px] font-bold text-white transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {P.enregistrer}
          </button>
          <button
            type="button"
            onClick={() => {
              choisirConsentement("refuse");
              setOuvert(false);
            }}
            className="h-11 flex-1 rounded-xl bg-card px-4 text-[14px] font-bold text-ink ring-1 ring-line transition-colors duration-200 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {P.toutRefuser}
          </button>
        </div>
      </div>
    </div>
  );
}
