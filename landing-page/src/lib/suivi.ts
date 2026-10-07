// Suivi consenti de la landing : GTM + GA4 + Clarity (paquet npm) + Bing UET.
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
// Taxonomie des événements (vérifiée contre la doc GA4 au 2026-10-07 :
// snake_case, ≤ 40 caractères, aucun nom réservé — `download` est libre,
// `file_download` étant le nom réservé ; `page_view`, `scroll` et
// `select_content` sont standard et réutilisés avec nos paramètres) :
//   page_view                              { page_path, langue }   (chargement + changement de langue)
//   scroll                                 { profondeur: 25/50/75/90_pourcent }   (une fois chacun)
//   click_phone / click_whatsapp / click_email   { section }       (clic tel / WhatsApp / e-mail)
//   contact_form_start                     {}                      (première saisie dans la demande)
//   contact_form_error                     { champ }               (validation refusée)
//   contact_form_submit                    { destination, pack }   (demande envoyée)
//   appointment_request                    {}                      (bouton WhatsApp de l'écran de succès)
//   download                               { file_name, link_url } (prêt pour les futurs fichiers)
//   select_content                         { content_type: "cta"|"lien"|"bouton"|"faq"|"langue", item_id, section }
//   consentement                           { choix: "accepte"|"partiel"|"refuse", detail }
// Note GTM : ne PAS créer de balises Event pour `page_view` / `scroll` (déjà couverts
// par le Google tag + Enhanced measurement — doublons garantis). Créer des balises
// « GA4 Event » déclenchées sur l'événement personnalisé de même nom pour les autres,
// puis déclarer leurs paramètres en dimensions personnalisées (Admin > Custom
// definitions) : `destination`, `pack`, `profondeur`, `section`, `champ`.
// Les balises de vérification moteurs (Search Console, Bing) sont injectées depuis
// l'environnement (`installerBalisesVerification`) : ce ne sont pas des traceurs.

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

/**
 * Émis à chaque choix enregistré : le bandeau cookies l'écoute pour se fermer
 * (choix via la modale « Personnaliser » alors que le bandeau est affiché).
 */
export const EVENEMENT_CONSENTEMENT = "eiden:consentement";
function annoncerConsentement(): void {
  window.dispatchEvent(new CustomEvent(EVENEMENT_CONSENTEMENT));
}

function variable(nom: string): string {
  const valeur = (import.meta.env[nom] as string | undefined)?.trim();
  return valeur ?? "";
}

/**
 * Identifiant validé : un `VITE_GTM_ID` qui contient en réalité un ID GA4
 * (`G-...`) chargeait `gtm.js?id=G-...` → 404 silencieux, zéro donnée, et le
 * GA4 direct restait coupé (blocage « No Google tags found »). On ignore la
 * valeur mal préfixée avec un avertissement explicite plutôt que d'échouer.
 */
function variableId(nom: string, prefixe: string): string {
  const valeur = variable(nom);
  if (!valeur) return "";
  if (!valeur.startsWith(prefixe)) {
    console.warn(`[suivi] ${nom} ignoré : la valeur doit commencer par « ${prefixe} ».`);
    return "";
  }
  return valeur;
}

const IDS = {
  // Lus une fois au chargement du module : le choix se fait au build/Vercel.
  gtm: variableId("VITE_GTM_ID", "GTM-"), // ex. GTM-XXXXXX (jamais un ID G-...)
  ga4: variableId("VITE_GA4_ID", "G-"), // ex. G-XXXXXXXXXX
  clarity: variable("VITE_CLARITY_ID"), // ex. abc123def4
  bing: variable("VITE_BING_UET_ID"), // ex. 12345678
};

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown> | unknown[]>;
    gtag?: (...args: unknown[]) => void;
    clarity?: unknown;
    uetq?: unknown;
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
  // Pas de page vue auto : `suivrePageVue()` l'envoie (une seule fois, même nom).
  fileCommandes()("config", id, { page_path: window.location.pathname, send_page_view: false });
}

/**
 * Charge Microsoft Clarity via le paquet officiel `@microsoft/clarity`
 * (import dynamique : zéro octet tant que la catégorie « expérience » n'est pas
 * acceptée — chunk séparé). `consent()` explicite : couvre aussi les projets
 * Clarity configurés en « consentement requis », sinon rien n'est collecté.
 */
type ModuleClarity = typeof import("@microsoft/clarity").default;
let instanceClarity: ModuleClarity | null = null;

async function chargerClarity(id: string): Promise<void> {
  try {
    const { default: Clarity } = await import("@microsoft/clarity");
    Clarity.init(id);
    // Catégorie déjà acceptée (fonction appelée uniquement dans ce cas).
    Clarity.consent();
    instanceClarity = Clarity;
  } catch {
    // Réseau bloqué (anti-pisteurs…) : la mesure reste silencieuse.
  }
}

/** Relaye les conversions vers Clarity en « smart events » (visibles dans les filtres). */
function relayerClarity(nom: string): void {
  if (!instanceClarity) return;
  if (nom !== "contact_form_submit" && nom !== "appointment_request") return;
  try {
    instanceClarity.event(nom);
  } catch {
    // Jamais bloquant pour le suivi principal.
  }
}

/**
 * Charge le tag universel Bing (UET, catégorie « marketing »).
 * Extrait officiel : l'objet UET est initialisé avec l'identifiant puis `pageLoad`.
 */
function chargerBing(id: string): void {
  if (document.getElementById("eiden-bing")) return;
  const demarrer = () => {
    const file = window.uetq;
    if (!Array.isArray(file)) return; // Déjà initialisé.
    type ConstructeurUet = new (o: unknown) => { push: (...a: string[]) => void };
    const UET = (window as unknown as { UET?: ConstructeurUet }).UET;
    if (typeof UET !== "function") return;
    const instance = new UET({ ti: id, enableAutoSpaTracking: true });
    (window as unknown as { uetq: unknown }).uetq = instance;
    instance.push("pageLoad");
  };
  const script = document.createElement("script");
  script.id = "eiden-bing";
  script.async = true;
  script.src = "https://bat.bing.com/bat.js";
  script.onload = demarrer;
  document.head.appendChild(script);
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

/** Scripts déjà injectés (un visiteur peut accepter une catégorie plus tard). */
const scriptsCharges = new Set<string>();

/** Pousse l'état du consentement (Consent Mode v2, consommé par GTM/GA4). */
function pousserConsentement(prefs: Preferences): void {
  fileCommandes()("consent", "update", etatConsentement(prefs));
}

/**
 * Injecte les scripts des catégories acceptées (une seule fois chacun) puis
 * pousse TOUJOURS l'état du consentement — même si tout est déjà chargé, car
 * l'utilisateur a pu retirer une catégorie (sinon le traceur continuait).
 */
function chargerTraceurs(prefs: Preferences): void {
  if (!scriptsCharges.has("base")) {
    scriptsCharges.add("base");
    // Refus par défaut, levé juste après selon les catégories acceptées.
    fileCommandes()(
      "consent",
      "default",
      etatConsentement({ statistiques: false, experience: false, marketing: false }),
    );
  }
  const accepteUn = prefs.statistiques || prefs.experience || prefs.marketing;
  if (IDS.gtm && accepteUn && !scriptsCharges.has("gtm")) {
    scriptsCharges.add("gtm");
    chargerGtm(IDS.gtm);
  }
  // Directs uniquement sans GTM (sinon double comptage : tout vit dans le conteneur).
  if (!IDS.gtm) {
    if (IDS.ga4 && prefs.statistiques && !scriptsCharges.has("ga4")) {
      scriptsCharges.add("ga4");
      chargerGa4(IDS.ga4);
    }
    if (IDS.clarity && prefs.experience && !scriptsCharges.has("clarity")) {
      scriptsCharges.add("clarity");
      void chargerClarity(IDS.clarity);
    }
    if (IDS.bing && prefs.marketing && !scriptsCharges.has("bing")) {
      scriptsCharges.add("bing");
      chargerBing(IDS.bing);
    }
  }
  pousserConsentement(prefs);
}

/**
 * Balises de vérification des moteurs (Search Console, Bing Webmaster) lues dans
 * l'environnement puis injectées dans le `<head>`. SECOURS uniquement : le cas
 * normal est l'écriture au build (`vite.config.ts`), car les vérificateurs lisent
 * le HTML brut sans exécuter le JS. Ce ne sont PAS des traceurs : posées au
 * démarrage, sans attendre le consentement. Vide = rien n'est injecté.
 */
export function installerBalisesVerification(): void {
  const balises: [string, string][] = [
    ["google-site-verification", extraireJeton(variable("VITE_GOOGLE_SITE_VERIFICATION"))],
    ["msvalidate.01", extraireJeton(variable("VITE_BING_SITE_VERIFICATION"))],
  ];
  for (const [nom, contenu] of balises) {
    if (!contenu) continue;
    if (document.querySelector(`meta[name="${nom}"]`)) continue;
    const meta = document.createElement("meta");
    meta.name = nom;
    meta.content = contenu;
    document.head.appendChild(meta);
  }
}

/** Tolère la balise entière collée au lieu du jeton seul. */
function extraireJeton(valeur: string): string {
  const brut = valeur.trim();
  if (!brut) return "";
  return (brut.match(/content\s*=\s*"([^"]+)"/)?.[1] ?? brut).trim();
}

/**
 * À appeler une fois au démarrage : si le visiteur s'est déjà prononcé, charge
 * uniquement les traceurs acceptés et installe l'écoute des clics. Sinon, ne fait
 * rien (le bandeau cookies recueillera le choix).
 */
export function initialiserSuivi(): void {
  installerBalisesVerification();
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
  relayerClarity(nom);
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

/** Demande rapide : première saisie (une fois par ouverture). */
export function suivreDebutFormulaire(): void {
  suivreEvenement("contact_form_start");
}

/** Demande rapide refusée par la validation (champ fautif en cause). */
export function suivreErreurFormulaire(champ: string): void {
  suivreEvenement("contact_form_error", { champ });
}

/** Demande rapide envoyée (WhatsApp + Supabase). Marquer comme événement clé dans GA4. */
export function suivreEnvoiDemande(destination: string, pack: string): void {
  suivreEvenement("contact_form_submit", {
    destination: destination || "inconnue",
    pack: pack || "indecis",
  });
}

/** Écran de succès : le visiteur poursuit sur WhatsApp pour caler son rendez-vous. */
export function suivreDemandeRendezVous(): void {
  suivreEvenement("appointment_request");
}

/** Clic téléphone / WhatsApp / e-mail (noms d'événements imposés par le pilotage). */
export function suivreClicContact(moyen: "whatsapp" | "telephone" | "email"): void {
  suivreEvenement(`click_${moyen}`);
}

/** Téléchargement de fichier (aucun sur le site à ce jour : prêt à l'emploi). */
export function suivreTelechargement(nomFichier: string, url: string): void {
  suivreEvenement("download", { file_name: nomFichier, link_url: url });
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
 * La profondeur de scroll est suivie par paliers (25/50/75/90 %, une fois chacun).
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
      if (href.includes("wa.me")) return void suivreClicContact("whatsapp");
      if (href.startsWith("tel:")) return void suivreClicContact("telephone");
      if (href.startsWith("mailto:")) return void suivreClicContact("email");
      const telechargement =
        el.getAttribute("download") ??
        (/\.(pdf|docx?|xlsx?)$/.test(href) ? href.split("/").pop() : undefined);
      if (telechargement) {
        suivreTelechargement(telechargement, el.getAttribute("href") ?? "");
        return;
      }
      return void suivreContenu("lien", libelle, section);
    }
    suivreContenu("bouton", libelle, section);
  });
  const paliers = [25, 50, 75, 90];
  const atteints = new Set<number>();
  const scruter = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    if (total <= 0) return;
    const pct = Math.round((window.scrollY / total) * 100);
    for (const palier of paliers) {
      if (pct >= palier && !atteints.has(palier)) {
        atteints.add(palier);
        suivreEvenement("scroll", { profondeur: `${palier}_pourcent` });
      }
    }
    if (atteints.size === paliers.length) window.removeEventListener("scroll", scruter);
  };
  window.addEventListener("scroll", scruter, { passive: true });
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
  annoncerConsentement();
}

/** Raccourcis du bandeau : tout accepter / tout refuser. */
export function choisirConsentement(choix: "accepte" | "refuse"): void {
  enregistrerPreferences(choix === "accepte" ? { ...TOUT_ACCEPTE } : { ...TOUT_REFUSE });
}

/** Choix catégorie par catégorie depuis la modale de préférences. */
export function choisirPreferences(prefs: Preferences): void {
  enregistrerPreferences({ ...prefs });
}
