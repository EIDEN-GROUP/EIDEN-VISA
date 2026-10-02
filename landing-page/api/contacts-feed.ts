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

function header(req: Req, name: string): string {
  const v = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const expected = process.env.CONTACTS_FEED_API_KEY;
  if (!expected) {
    res.status(500).json({ error: "contacts feed not configured" });
    return;
  }
  if (header(req, "x-api-key") !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: "contacts feed not configured" });
    return;
  }

  const rawLimit = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const limit = Math.min(1000, Math.max(1, Number.parseInt(rawLimit ?? "", 10) || 500));

  try {
    const upstream = await fetch(
      `${supabaseUrl}/rest/v1/landing_contacts?select=*&order=created_at.desc&limit=${limit}`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
    );
    if (!upstream.ok) {
      res.status(502).json({ error: `Supabase error ${upstream.status}` });
      return;
    }
    const rows = (await upstream.json()) as unknown[];
    // Tableau nu : le proxy BMS accepte un tableau, { data } ou { results }.
    res.status(200).json(Array.isArray(rows) ? rows : []);
  } catch {
    res.status(502).json({ error: "Upstream fetch failed" });
  }
}
