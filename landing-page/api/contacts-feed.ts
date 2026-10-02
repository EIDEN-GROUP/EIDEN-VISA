// GET /api/contacts-feed — flux de lecture des demandes pour le BMS.
// Fonction serverless Vercel hébergée par la landing page (dossier api/).
// Le BMS la consomme via son proxy Website Contacts (GET + header X-API-Key),
// exactement comme les autres sources CONTACT_SOURCE_* : aucune modification
// de code côté BMS, uniquement des variables d'environnement :
//   CONTACT_SOURCE_N_NAME=Eiden Visa Landing
//   CONTACT_SOURCE_N_ENDPOINT=https://<domaine-landing>/api/contacts-feed
//   CONTACT_SOURCE_N_API_KEY=<même valeur que CONTACTS_FEED_API_KEY>
//
// Sécurité : la clé service_role Supabase et CONTACTS_FEED_API_KEY sont des
// variables serveur (sans préfixe VITE_) — jamais exposées au navigateur.
// Durcissement : comparaison à temps constant, clé ≥ 32 caractères, frein
// anti-bourrinage par IP (best-effort en serverless), colonnes minimales,
// erreurs génériques (aucun oracle de configuration).
// Typage structurel volontaire : aucune dépendance @vercel/node requise.
declare const process: { env: Record<string, string | undefined> };

type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
};

type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

/** Colonnes exposées au BMS : identité + demande uniquement. `page_url` et
 * `user_agent` restent en base (diagnostic) mais ne sortent jamais. */
const COLONNES =
  "id,created_at,nom,prenom,email,telephone,type_visa,depart,retour,destination,pack,ville,demandeurs,langue,message";

const LIMITE_DEFAUT = 50;
const LIMITE_MAX = 100;

/** Frein anti-bourrinage en mémoire (par IP) : best-effort en serverless
 * (instances éphémères), efficace sur instance longue. */
const PLAFOND_MINUTE = 60;
const PLAFOND_CLE_FAUSSE = 10;
const seaux = new Map<string, { fenetre: number; total: number; echecs: number }>();

function ip(req: Req): string {
  const fwd = header(req, "x-forwarded-for").split(",")[0]?.trim();
  return fwd || header(req, "x-real-ip") || "inconnue";
}

function depasse(ipClient: string, echecCle: boolean): boolean {
  const minute = Math.floor(Date.now() / 60_000);
  let s = seaux.get(ipClient);
  if (!s || s.fenetre !== minute) {
    s = { fenetre: minute, total: 0, echecs: 0 };
    seaux.set(ipClient, s);
    if (seaux.size > 5000) {
      const vieux = minute - 1;
      for (const [k, v] of seaux) if (v.fenetre < vieux) seaux.delete(k);
    }
  }
  s.total += 1;
  if (echecCle) s.echecs += 1;
  return s.total > PLAFOND_MINUTE || s.echecs > PLAFOND_CLE_FAUSSE;
}

function header(req: Req, name: string): string {
  const v = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparaison à temps constant (via SHA-256) : `!==` fuirait octet par octet. */
async function cleValide(fournie: string, attendue: string): Promise<boolean> {
  if (!fournie || !attendue) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(fournie)).then(hex),
    crypto.subtle.digest("SHA-256", enc.encode(attendue)).then(hex),
  ]);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const attendue = process.env.CONTACTS_FEED_API_KEY;
  // Clé absente ou trop courte = mal configuré : fermé, sans le dire.
  if (!attendue || attendue.length < 32) {
    res.status(503).json({ error: "Service unavailable" });
    return;
  }
  const ok = await cleValide(header(req, "x-api-key"), attendue);
  if (depasse(ip(req), !ok)) {
    res.status(429).json({ error: "Too many requests" });
    return;
  }
  if (!ok) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(503).json({ error: "Service unavailable" });
    return;
  }

  const brut = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const limite = Math.min(
    LIMITE_MAX,
    Math.max(1, Number.parseInt(brut ?? "", 10) || LIMITE_DEFAUT),
  );

  try {
    const upstream = await fetch(
      `${supabaseUrl}/rest/v1/landing_contacts?select=${COLONNES}&order=created_at.desc&limit=${limite}`,
      {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!upstream.ok) {
      res.status(502).json({ error: "Bad Gateway" });
      return;
    }
    const rows = (await upstream.json()) as unknown[];
    // Tableau nu : le proxy BMS accepte un tableau, { data } ou { results }.
    res.status(200).json(Array.isArray(rows) ? rows : []);
  } catch {
    res.status(502).json({ error: "Bad Gateway" });
  }
}
