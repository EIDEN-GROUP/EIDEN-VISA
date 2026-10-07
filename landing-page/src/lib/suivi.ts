// Suivi consenti de la landing : GTM + GA4 + Clarity + Bing UET.
// Règle de confidentialité : AUCUN traceur tiers n'est chargé sans acceptation
// explicite (`BandeauCookies` : tout accepter / tout refuser / personnaliser par
// catégorie). Sans identifiants (`VITE_*` vides), tout est dormant : les événements
// partent dans `window.dataLayer` (file d'attente que GTM lira le jour où il est branché).
//
// Catégories (voir `PreferencesCookies` + page `/cookies.html`) :
//   statistiques → analytics_storage → GA4 (via GTM si configuré, sinon direct)
//   experience   → functionality_storage → Microsoft Clarity (heatmaps + replays)
//   marketing    → ad_storage + ad_user_data + ad_personalization → Bing UET
// Dans GTM : activer le mode de consentement et lier chaque balise au type
// correspondant — le conteneur fait alors respecter les refus tout seul.
//
// Taxonomie des événements (noms recommandés GA4) :
//   page_view                              { page_path, langue }
//   select_content                         { content_type: "cta"|"lien"|"bouton"|"faq"|"langue", item_id, section }
//   generate_lead                          { destination, pack }              (demande rapide envoyée)
//   contact                                { moyen: "whatsapp"|"telephone"|"email" }
//   consentement                           { choix: "accepte"|"partiel"|"refuse", detail }

export const CLE_CONSENTEMENT = "eiden-consentement-v1";

/** Choix par catégorie. `necessaires` n'existe pas ici : toujours actif, non tracké. */
export type Preferences = {
  statistiques: boolean;
  experience: boolean;
  marketing: boolean;
};

export const TOUT_ACCEPTE: Preferences = { statistiques: true, experience: true, marketing: true };
export const TOUT_REFUSE: Preferences = {
  statistiques: false,
  experience: false,
  marketing: false,
};

/** Événement pour ouvrir la modale de préférences depuis n'importe où. */
export const EVENEMENT_PREFERENCES = "eiden:preferences-cookies";
export function ouvrirPreferences(): void {
  window.dispatchEvent(new CustomEvent(EVENEMENT_PREFERENCES));
}

function variable(nom: string): string {
  const valeur = (import.meta.env[nom] as string | undefined)?.trim();
  return valeur ?? "";
}

const IDS = {
  // Lus une fois au chargement du module : le choix se fait au build/Vercel.
  gtm: variable("VITE_GTM_ID"), // ex. GTM-XXXXXX
  ga4: variable("VITE_GA4_ID"), // ex. G-XXXXXXXXXX
  clarity: variable("VITE_CLARITY_ID"), // ex. abc123def4
  bing: variable("VITE_BING_UET_ID"), // ex. 12345678
};

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown> | unknown[]>;
    gtag?: (...args: unknown[]) => void;
    clarifions?: unknown;
    uetq?: unknown[];
  }
}

function fileAttente(): Array<Record<string, unknown> | unknown[]> {
  if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
  return window.dataLayer;
}

/** File de commandes (`gtag`) : GTM et GA4 la consomment, sinon elle reste inerte. */
function fileCommandes(): (...args: unknown[]) => void {
  if (!window.gtag) window.gtag = (...args: unknown[]) => fileAttente().push(args);
  return window.gtag;
}

type ConsentementStocke =
  | ({ version: 2 } & Preferences & { date: string })
  // Format historique (bandeau accepter/refuser uniquement) : migré à la lecture.
  | { choix: "accepte" | "refuse"; date: string };

/** Préférences enregistrées, ou `null` si le visiteur ne s'est pas prononcé. */
export function lirePreferences(): Preferences | null {
  try {
    const brut = localStorage.getItem(CLE_CONSENTEMENT);
    if (!brut) return null;
    const stocke = JSON.parse(brut) as ConsentementStocke;
    if ("choix" in stocke)
      return stocke.choix === "accepte" ? { ...TOUT_ACCEPTE } : { ...TOUT_REFUSE };
    return {
      statistiques: stocke.statistiques === true,
      experience: stocke.experience === true,
      marketing: stocke.marketing === true,
    };
  } catch {
    return null; // Stockage indisponible : on considère qu'il n'y a pas de choix.
  }
}

/** Compatibilité : `true` si au moins un refus/accept a été exprimé. */
export function lireConsentement(): "accepte" | "partiel" | "refuse" | null {
  const prefs = lirePreferences();
  if (!prefs) return null;
  const valeurs = [prefs.statistiques, prefs.experience, prefs.marketing];
  if (valeurs.every(Boolean)) return "accepte";
  if (valeurs.every((v) => !v)) return "refuse";
  return "partiel";
}

/** Oublie le choix (bouton « Gérer mes cookies » → rouvre les préférences). */
export function oublierConsentement(): void {
  try {
    localStorage.removeItem(CLE_CONSENTEMENT);
  } catch {
    // Sans stockage, il n'y a rien à oublier.
  }
}

function chargerScript(src: string, id: string): void {
  if (document.getElementById(id)) return; // Déjà chargé (double montage StrictMode…).
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/** Charge GTM (recommandé : GA4 + Clarity + Bing se configurent DANS le conteneur). */
function chargerGtm(id: string): void {
  fileAttente().push({ "gtm.start": Date.now(), event: "gtm.js" });
  chargerScript(
    `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`,
    "eiden-gtm",
  );
}

/** Charge GA4 en direct (secours si aucun conteneur GTM n'est configuré). */
function chargerGa4(id: string): void {
  chargerScript(
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
    "eiden-ga4",
  );
  fileCommandes()("js", new Date());
  fileCommandes()("config", id, { page_path: window.location.pathname });
}

/** Charge Microsoft Clarity (heatmaps + replays, catégorie « expérience »). */
function chargerClarity(id: string): void {
  // Extrait officiel Clarity, `i` = identifiant du projet.
  (function (c: Window, l: Document, a: string, r: string, i: string) {
    const w = c as unknown as Record<string, unknown>;
    w[a] =
      w[a] ||
      function (...args: unknown[]) {
        (w[a] as unknown as { q: unknown[] }).q = (w[a] as unknown as { q: unknown[] }).q || [];
        (w[a] as unknown as { q: unknown[] }).q.push(args);
      };
    const t = l.createElement(r) as HTMLScriptElement;
    t.id = "eiden-clarity";
    t.async = true;
    t.src = `https://www.clarity.ms/tag/${encodeURIComponent(i)}`;
    const y = l.getElementsByTagName(r)[0];
    if (!y?.parentNode) return;
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarifions", "script", id);
}

/** Charge le tag universel Bing (UET, catégorie « marketing »), avec page_view auto. */
function chargerBing(id: string): void {
  window.uetq = window.uetq ?? [];
  chargerScript(`https://bat.bing.com/bat.js`, "eiden-bing");
  window.uetq.push("event", "", { ti: id });
}

function etatConsentement(prefs: Preferences): Record<string, "granted" | "denied"> {
  const ouiNon = (accepte: boolean): "granted" | "denied" => (accepte ? "granted" : "denied");
  return {
    analytics_storage: ouiNon(prefs.statistiques),
    functionality_storage: ouiNon(prefs.experience),
    ad_storage: ouiNon(prefs.marketing),
    ad_user_data: ouiNon(prefs.marketing),
    ad_personalization: ouiNon(prefs.marketing),
  };
}

let charge = false;

/** Pousse l'état du consentement (Consent Mode v2, consommé par GTM/GA4). */
function pousserConsentement(prefs: Preferences): void {
  fileCommandes()("consent", "update", etatConsentement(prefs));
}

function chargerTraceurs(prefs: Preferences): void {
  if (charge) return;
  charge = true;
  // Refus par défaut, levé juste après selon les catégories acceptées.
  fileCommandes()(
    "consent",
    "default",
    etatConsentement({ statistiques: false, experience: false, marketing: false }),
  );
  const accepteUn = prefs.statistiques || prefs.experience || prefs.marketing;
  if (IDS.gtm && accepteUn) chargerGtm(IDS.gtm);
  // Directs uniquement sans GTM (sinon double comptage : tout vit dans le conteneur).
  if (!IDS.gtm) {
    if (IDS.ga4 && prefs.statistiques) chargerGa4(IDS.ga4);
    if (IDS.clarity && prefs.experience) chargerClarity(IDS.clarity);
    if (IDS.bing && prefs.marketing) chargerBing(IDS.bing);
  }
  pousserConsentement(prefs);
}

/**
 * À appeler une fois au démarrage : si le visiteur s'est déjà prononcé, charge
 * uniquement les traceurs acceptés et installe l'écoute des clics. Sinon, ne fait
 * rien (le bandeau cookies recueillera le choix).
 */
export function initialiserSuivi(): void {
  const prefs = lirePreferences();
  if (!prefs) return;
  chargerTraceurs(prefs);
  suivrePageVue();
  installerEcouteClics();
}

/** Pousse un événement vers la file GTM/GA4 (inerte si aucun conteneur). */
export function suivreEvenement(nom: string, parametres: Record<string, unknown> = {}): void {
  fileAttente().push({
    event: nom,
    consentement: lireConsentement() ?? "inconnu",
    langue: document.documentElement.lang || "fr",
    ...parametres,
  });
}

export function suivrePageVue(): void {
  suivreEvenement("page_view", { page_path: window.location.pathname });
}

/** CTA, lien, bouton, FAQ, changement de langue. */
export function suivreContenu(
  type: "cta" | "lien" | "bouton" | "faq" | "langue",
  libelle: string,
  section?: string,
): void {
  suivreEvenement("select_content", { content_type: type, item_id: libelle, section });
}

/** Demande rapide envoyée (WhatsApp + Supabase). */
export function suivreProspect(destination: string, pack: string): void {
  suivreEvenement("generate_lead", {
    destination: destination || "inconnue",
    pack: pack || "indecis",
  });
}

/** Clic WhatsApp / téléphone / e-mail. */
export function suivreContact(moyen: "whatsapp" | "telephone" | "email"): void {
  suivreEvenement("contact", { moyen });
}

function libelleElement(el: HTMLElement): string {
  const explicite = el.getAttribute("data-suivi") ?? el.getAttribute("aria-label");
  if (explicite?.trim()) return explicite.trim().slice(0, 80);
  return (el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80) || "sans-libelle";
}

let ecouteInstallee = false;

/**
 * Écoute déléguée : chaque clic sur un lien ou un bouton est tracké, avec
 * inférence du moyen de contact. Les accordéons FAQ (`aria-expanded`) sont
 * exclus : `Faq.tsx` les suit déjà avec la question en libellé.
 */
function installerEcouteClics(): void {
  if (ecouteInstallee) return;
  ecouteInstallee = true;
  document.addEventListener("click", (e) => {
    const cible = e.target as HTMLElement | null;
    const el = cible?.closest?.("a, button") as HTMLElement | null;
    if (!el || el.hasAttribute("data-sans-suivi") || el.hasAttribute("aria-expanded")) return;
    const section =
      el.closest("section[id]")?.id ?? el.closest("header, footer")?.tagName.toLowerCase();
    const libelle = libelleElement(el);
    if (el.tagName === "A") {
      const href = (el.getAttribute("href") ?? "").toLowerCase();
      if (href.includes("wa.me")) return void suivreContact("whatsapp");
      if (href.startsWith("tel:")) return void suivreContact("telephone");
      if (href.startsWith("mailto:")) return void suivreContact("email");
      return void suivreContenu("lien", libelle, section);
    }
    suivreContenu("bouton", libelle, section);
  });
}

function enregistrerPreferences(prefs: Preferences): void {
  try {
    // Durée de vie documentée dans `cookies.html` : 12 mois.
    localStorage.setItem(
      CLE_CONSENTEMENT,
      JSON.stringify({ version: 2, ...prefs, date: new Date().toISOString() }),
    );
  } catch {
    // Stockage indisponible : le choix vaut pour la visite en cours.
  }
  chargerTraceurs(prefs);
  installerEcouteClics();
  const valeurs = [prefs.statistiques, prefs.experience, prefs.marketing];
  const choix = valeurs.every(Boolean)
    ? "accepte"
    : valeurs.every((v) => !v)
      ? "refuse"
      : "partiel";
  suivreEvenement("consentement", { choix, detail: prefs });
}

/** Raccourcis du bandeau : tout accepter / tout refuser. */
export function choisirConsentement(choix: "accepte" | "refuse"): void {
  enregistrerPreferences(choix === "accepte" ? { ...TOUT_ACCEPTE } : { ...TOUT_REFUSE });
}

/** Choix catégorie par catégorie depuis la modale de préférences. */
export function choisirPreferences(prefs: Preferences): void {
  enregistrerPreferences({ ...prefs });
}
