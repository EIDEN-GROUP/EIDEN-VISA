// Suivi consenti de la landing : GTM + GA4 + Clarity + Bing UET.
// Règle de confidentialité : AUCUN traceur tiers n'est chargé tant que le visiteur
// n'a pas cliqué « Tout accepter » dans le bandeau cookies (`BandeauCookies`).
// Sans identifiants (`VITE_*` vides), tout est dormant : les événements partent
// dans `window.dataLayer` (file d'attente que GTM lira le jour où il est branché).
//
// Taxonomie des événements (noms recommandés GA4) :
//   page_view                              { page_path, langue }
//   select_content                         { content_type: "cta"|"lien"|"bouton"|"faq"|"langue", item_id, section }
//   generate_lead                          { destination, pack }              (demande rapide envoyée)
//   contact                                { moyen: "whatsapp"|"telephone"|"email" }
//   consentement                           { choix: "accepte"|"refuse" }

export const CLE_CONSENTEMENT = "eiden-consentement-v1";

export type ChoixConsentement = "accepte" | "refuse";

type ConsentementStocke = { choix: ChoixConsentement; date: string };

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
    dataLayer: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    clarifions?: unknown;
    uetq?: unknown[];
  }
}

function fileAttente(): Array<Record<string, unknown>> {
  if (!Array.isArray(window.dataLayer)) window.dataLayer = [];
  return window.dataLayer;
}

/** Dernier choix enregistré, ou `null` si le visiteur ne s'est pas prononcé. */
export function lireConsentement(): ChoixConsentement | null {
  try {
    const brut = localStorage.getItem(CLE_CONSENTEMENT);
    if (!brut) return null;
    const stocke = JSON.parse(brut) as ConsentementStocke;
    return stocke.choix === "accepte" || stocke.choix === "refuse" ? stocke.choix : null;
  } catch {
    return null; // Stockage indisponible : on considère qu'il n'y a pas de choix.
  }
}

/** Oublie le choix (bouton « Gérer mes cookies » du pied de page). */
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
  window.gtag = window.gtag ?? ((...args: unknown[]) => fileAttente().push({ gtag: args }));
  chargerScript(
    `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`,
    "eiden-ga4",
  );
  // Consent Mode v2 : refus par défaut, levé à l'acceptation (voir `choisirConsentement`).
  window.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", id, { page_path: window.location.pathname });
}

/** Charge Microsoft Clarity (heatmaps + replays, après acceptation uniquement). */
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

/** Charge le tag universel Bing (UET), avec page_view automatique. */
function chargerBing(id: string): void {
  window.uetq = window.uetq ?? [];
  chargerScript(`https://bat.bing.com/bat.js`, "eiden-bing");
  window.uetq.push("event", "", { ti: id });
}

let charge = false;

/**
 * À appeler une fois au démarrage : si le visiteur a déjà accepté, charge les
 * traceurs configurés et installe l'écoute des clics. Sinon, ne fait rien
 * (le bandeau cookies appellera `choisirConsentement`).
 */
export function initialiserSuivi(): void {
  if (lireConsentement() !== "accepte") return;
  chargerTraceurs();
  suivrePageVue();
  installerEcouteClics();
}

function chargerTraceurs(): void {
  if (charge) return;
  charge = true;
  if (IDS.gtm) chargerGtm(IDS.gtm);
  // GA4 direct uniquement sans GTM (sinon double comptage : GA4 vit dans le conteneur).
  if (IDS.ga4 && !IDS.gtm) chargerGa4(IDS.ga4);
  if (IDS.clarity) chargerClarity(IDS.clarity);
  if (IDS.bing) chargerBing(IDS.bing);
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

/**
 * Choix du visiteur depuis le bandeau : mémorisé 12 mois, les traceurs ne
 * sont chargés qu'en cas d'acceptation. Recharge la page en cas de refus
 * tardif ? Non : le refus ne charge rien, il n'y a rien à décharger.
 */
export function choisirConsentement(choix: ChoixConsentement): void {
  try {
    // Durée de vie documentée dans `cookies.html` : 12 mois.
    localStorage.setItem(
      CLE_CONSENTEMENT,
      JSON.stringify({ choix, date: new Date().toISOString() }),
    );
  } catch {
    // Stockage indisponible : le choix vaut pour la visite en cours.
  }
  if (choix === "accepte") {
    chargerTraceurs();
    installerEcouteClics();
    if (IDS.ga4 && !IDS.gtm && window.gtag) {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        analytics_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    }
  }
  suivreEvenement("consentement", { choix });
}
