/**
 * Calcul de durée entre deux dates — reproduit exactement la méthode de
 * calculconversion.com/calculateur-date.html (référence validée par l'équipe) :
 * le jour de fin est EXCLU du calcul. Exemple donné par l'outil source :
 * 21 mars → 25 mars = 4 jours, pas 5.
 */
export function joursEntre(debut: string, fin: string): number {
  const start = new Date(debut);
  const end = new Date(fin);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/**
 * Mois (arrondi à 2 décimales) — formule exacte de calculconversion.com :
 * Nombre de jours * 12 mois / 365 jours = Nombre de mois.
 * Approximation (année de 365 jours fixe), pas un calcul calendaire mois par mois —
 * reprise telle quelle de l'outil de référence, à ne pas confondre avec un décompte
 * calendaire exact.
 */
export function moisEntre(debut: string, fin: string): number {
  const jours = joursEntre(debut, fin);
  return Math.round(((jours * 12) / 365) * 100) / 100;
}

/**
 * Expiration par défaut d'un passeport marocain : 5 ans après la délivrance.
 * Sert uniquement à pré-remplir la saisie — la date reste modifiable, car la durée
 * diffère selon les cas (mineurs, passeports d'une autre nationalité).
 * Renvoie une date ISO `AAAA-MM-JJ`, ou `null` si l'entrée est inexploitable.
 */
export function expirationParDefaut(delivrance: string, annees = 5): string | null {
  if (!delivrance) return null;
  const d = new Date(delivrance);
  if (Number.isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + annees);
  return d.toISOString().slice(0, 10);
}

/**
 * Nombre de mois révolus entre une date passée et aujourd'hui, en mois CALENDAIRES
 * (pas l'approximation jours×12/365 de `moisEntre`, faite pour des durées de séjour) :
 * la règle des 59 mois se compte en mois réels. `null` si la date est inexploitable.
 */
export function moisDepuis(dateISO: string, reference: Date = new Date()): number | null {
  if (!dateISO) return null;
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return null;
  let mois =
    (reference.getFullYear() - d.getFullYear()) * 12 + (reference.getMonth() - d.getMonth());
  // Le mois en cours n'est pas révolu tant que le jour du mois n'est pas atteint.
  if (reference.getDate() < d.getDate()) mois -= 1;
  return mois;
}

/** Seuil Schengen : un visa obtenu il y a moins de 59 mois doit être joint au dossier. */
export const SEUIL_VISA_MOIS = 59;
