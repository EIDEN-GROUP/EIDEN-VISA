// Popup de conversion après « Notre méthode » : état de session partagé entre la
// popup (`PopupConversion.tsx`) et le formulaire (`DemandeRapide.tsx`).
// `sessionStorage` = une seule apparition par session de navigation ; silencieux si
// le stockage est indisponible (navigation privée…), la popup se comporte alors
// comme si rien n'avait été vu - jamais bloquante.

const CLE_VUE = "eiden-popup-conversion-vue";
const CLE_ACTION = "eiden-popup-conversion-action";
const CLE_ENVOYEE = "eiden-demande-envoyee";

function lire(cle: string): boolean {
  try {
    return window.sessionStorage.getItem(cle) === "1";
  } catch {
    return false;
  }
}

function ecrire(cle: string): void {
  try {
    window.sessionStorage.setItem(cle, "1");
  } catch {
    /* stockage indisponible : la popup reste non bloquante */
  }
}

/** La popup a déjà été affichée ou explicitement traitée cette session. */
export function popupDejaVue(): boolean {
  return lire(CLE_VUE) || lire(CLE_ACTION);
}

/** Marque la popup comme affichée (ne plus la rouvrir au scroll). */
export function marquerPopupVue(): void {
  ecrire(CLE_VUE);
}

/** Le visiteur a cliqué une action de la popup (demande ouverte ou WhatsApp). */
export function marquerPopupAction(): void {
  ecrire(CLE_ACTION);
}

/** Une demande rapide a été envoyée avec succès cette session. */
export function demandeEnvoyee(): boolean {
  return lire(CLE_ENVOYEE);
}

/** À appeler à l'envoi réussi du formulaire, à côté d'`effacerBrouillon()`. */
export function marquerDemandeEnvoyee(): void {
  ecrire(CLE_ENVOYEE);
}
