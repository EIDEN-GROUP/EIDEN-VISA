// Traduction de la landing : français (par défaut) et arabe (droite à gauche).
import { createContext, useContext, useState, type ReactNode } from "react";
import { suivreContenu, suivrePageVue } from "../lib/suivi";
import { ar } from "./ar";
import { fr, type Dictionnaire } from "./fr";

export type Langue = "fr" | "ar";

export const LANGUES: { code: Langue; nom: string; dir: "ltr" | "rtl" }[] = [
  { code: "fr", nom: "Français", dir: "ltr" },
  { code: "ar", nom: "العربية", dir: "rtl" },
];

const DICTIONNAIRES: Record<Langue, Dictionnaire> = { fr, ar };
const CLE_STOCKAGE = "eiden-langue";

function langueEnregistree(): Langue {
  try {
    const valeur = localStorage.getItem(CLE_STOCKAGE);
    if (valeur === "fr" || valeur === "ar") return valeur;
  } catch {
    // Stockage indisponible (navigation privée…) : langue par défaut.
  }
  return "fr";
}

/**
 * Applique la langue au document avant le rendu des sections : les découpes GSAP
 * et les positions des animations doivent déjà voir le bon sens d'écriture.
 */
function appliquerAuDocument(langue: Langue) {
  const html = document.documentElement;
  html.lang = langue;
  html.dir = langue === "ar" ? "rtl" : "ltr";
  document.title = DICTIONNAIRES[langue].meta.title;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", DICTIONNAIRES[langue].meta.description);
}

type ContexteLangue = {
  langue: Langue;
  dir: "ltr" | "rtl";
  t: Dictionnaire;
  changerLangue: (langue: Langue) => void;
};

const Contexte = createContext<ContexteLangue | null>(null);

export function LangueProvider({ children }: { children: ReactNode }) {
  const [langue, setLangue] = useState<Langue>(() => {
    const initiale = langueEnregistree();
    appliquerAuDocument(initiale);
    return initiale;
  });

  const changerLangue = (suivante: Langue) => {
    appliquerAuDocument(suivante);
    try {
      localStorage.setItem(CLE_STOCKAGE, suivante);
    } catch {
      // Préférence non mémorisée, sans conséquence.
    }
    suivreContenu("langue", suivante);
    suivrePageVue(); // La page change de langue : nouvelle page vue GA4.
    setLangue(suivante);
  };

  return (
    <Contexte.Provider
      value={{
        langue,
        dir: langue === "ar" ? "rtl" : "ltr",
        t: DICTIONNAIRES[langue],
        changerLangue,
      }}
    >
      {children}
    </Contexte.Provider>
  );
}

export function useLangue() {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error("useLangue doit être utilisé dans <LangueProvider>");
  return ctx;
}
