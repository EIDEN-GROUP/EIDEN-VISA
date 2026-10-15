// Quelles sections sont réellement vues (une fois chacune, relancé au changement
// de langue car `<main key={langue}>` remonte). Envoie `section_vue`, ventilable
// FR vs AR comme tout événement via le paramètre `langue` automatique.
import { useEffect } from "react";
import { suivreSectionVue } from "../lib/suivi";

const SECTIONS = ["methode", "packs", "temoignages", "faq", "cta"] as const;

export function SuiviSections() {
  useEffect(() => {
    const vues = new Set<string>();
    const observer = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          const id = (entree.target as HTMLElement).id;
          if (entree.isIntersecting && id && !vues.has(id)) {
            vues.add(id);
            suivreSectionVue(id);
          }
        }
      },
      { threshold: 0.25 },
    );
    for (const id of SECTIONS) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);
  return null;
}
