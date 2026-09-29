import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { users, activityLog, dossiers } from "@/backend/db/schema";
import { getAuthSession } from "@/backend/auth";
import { requireCeo } from "@/backend/functions/auth";

const roleEnum = z.enum(["ceo", "reception", "preparation", "back_office"]);

/**
 * Écrit une ligne d'activité — appelé depuis les mutations métier (dossiers, paiements...).
 * `createServerOnlyFn` est indispensable ici : cette fonction n'est PAS un createServerFn
 * (pas d'appel RPC direct depuis le client), donc sans ce garde le compilateur ne sait pas
 * qu'il faut l'exclure du bundle client — elle entraînerait bcrypt/postgres avec elle
 * (cf. l'incident dotenv/config : même catégorie de fuite serveur -> client).
 */
export const logActivity = createServerOnlyFn(
  async (action: string, detail: string, dossierId?: string) => {
    const session = await getAuthSession();
    await db.insert(activityLog).values({
      id: crypto.randomUUID(),
      userId: session.data.userId ?? null,
      action,
      detail,
      dossierId: dossierId ?? null,
    });
  },
);

// Tout ce qui suit gère des comptes et des rôles : réservé au CEO, vérifié côté serveur
// via requireCeo() (le rôle du VRAI utilisateur connecté), pas une case cochée côté client.

export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireCeo();
  return db
    .select({
      id: users.id,
      email: users.email,
      nom: users.nom,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
});

export const createUser = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      nom: z.string().min(1),
      role: roleEnum,
    }),
  )
  .handler(async ({ data }) => {
    await requireCeo();
    const passwordHash = await bcrypt.hash(data.password, 12);
    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      email: data.email.toLowerCase(),
      passwordHash,
      nom: data.nom,
      role: data.role,
    });
    await logActivity("utilisateur.creation", `Compte créé : ${data.nom} (${data.role})`);
    return { id };
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), role: roleEnum }))
  .handler(async ({ data }) => {
    await requireCeo();
    await db.update(users).set({ role: data.role }).where(eq(users.id, data.id));
    await logActivity(
      "utilisateur.role",
      `Rôle changé -> ${data.role} pour l'utilisateur ${data.id}`,
    );
  });

export const deleteUser = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const ceo = await requireCeo();
    if (data.id === ceo.id) throw new Error("Impossible de supprimer votre propre compte CEO.");
    await db.delete(users).where(eq(users.id, data.id));
    await logActivity("utilisateur.suppression", `Compte supprimé : ${data.id}`);
  });

export const listActivity = createServerFn({ method: "GET" }).handler(async () => {
  await requireCeo();
  const rows = await db
    .select({
      id: activityLog.id,
      action: activityLog.action,
      detail: activityLog.detail,
      dossierId: activityLog.dossierId,
      createdAt: activityLog.createdAt,
      userNom: users.nom,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.userId, users.id))
    .orderBy(desc(activityLog.createdAt))
    .limit(200);
  return rows;
});

/**
 * Tableau analytique complet pour /ops (CEO uniquement) : tout l'état de l'agence
 * en une lecture — répartitions, tendances, et production par rôle et par agent.
 *
 * TOUT tient en UNE seule requête (CTEs + json_agg) : la base passe par le pooler
 * Supabase en mode transaction, et éclater ce panneau en 13 requêtes parallèles saturait
 * le pool (l'écran restait bloqué sur « Chargement… »). Un seul aller-retour, agrégé côté SQL.
 */
type CountRow = { k: string; n: number };
type RoleRow = { role: string; agents: number; dossiers: number; actifs: number };
type AgentRow = { nom: string; role: string; dossiers: number; actifs: number };
interface AnalyticsResult {
  kpi: { total: number; actifs: number; approuve: number; refuse: number } | null;
  enc: { total: number; payes: number } | null;
  pipeline: CountRow[] | null;
  parNiveau: CountRow[] | null;
  parPack: CountRow[] | null;
  parCentre: CountRow[] | null;
  parDecision: CountRow[] | null;
  parModalite: CountRow[] | null;
  ouvertures: CountRow[] | null;
  encaissements: CountRow[] | null;
  parRole: RoleRow[] | null;
  parAgent: AgentRow[] | null;
  activiteParAction: CountRow[] | null;
}

export const getAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  await requireCeo();
  const rows = await db.execute(sql`
    with
      pipe as (select json_agg(json_build_object('k', etape::text, 'n', c) order by etape) v
               from (select etape, count(*)::int c from dossiers group by etape) t),
      niv as (select json_agg(json_build_object('k', niveau, 'n', c)) v
              from (select niveau, count(*)::int c from dossiers group by niveau) t),
      pk as (select json_agg(json_build_object('k', pack, 'n', c)) v
             from (select pack, count(*)::int c from dossiers group by pack) t),
      ctr as (select json_agg(json_build_object('k', rdv_centre, 'n', c)) v
              from (select rdv_centre, count(*)::int c from dossiers group by rdv_centre) t),
      dec as (select json_agg(json_build_object('k', decision, 'n', c)) v
              from (select decision, count(*)::int c from dossiers group by decision) t),
      modl as (select json_agg(json_build_object('k', modalite_paiement, 'n', c)) v
               from (select modalite_paiement, count(*)::int c from dossiers group by modalite_paiement) t),
      ouv as (select json_agg(json_build_object('k', k, 'n', c) order by k) v
              from (select to_char(date_trunc('week', created_at), 'YYYY-MM-DD') k, count(*)::int c
                    from dossiers where created_at >= now() - interval '10 weeks' group by 1) t),
      encw as (select json_agg(json_build_object('k', k, 'n', c) order by k) v
               from (select to_char(date_trunc('week', created_at), 'YYYY-MM-DD') k,
                            coalesce(sum(substring(detail from '^([0-9]+)')::numeric), 0)::int c
                     from activity_log
                     where action = 'paiement.encaissement' and created_at >= now() - interval '10 weeks'
                     group by 1) t),
      rol as (select json_agg(json_build_object('role', role, 'agents', a, 'dossiers', d, 'actifs', ac)) v
              from (select coalesce(u.role, 'non_attribue') role, count(distinct u.id)::int a,
                           count(dd.id)::int d, (count(dd.id) filter (where dd.etape < 6))::int ac
                    from dossiers dd left join users u on u.id = dd.agent_user_id group by 1) t),
      agt as (select json_agg(json_build_object('nom', nom, 'role', role, 'dossiers', d, 'actifs', ac) order by d desc) v
              from (select coalesce(u.nom, 'Non attribué') nom, coalesce(u.role, 'non_attribue') role,
                           count(dd.id)::int d, (count(dd.id) filter (where dd.etape < 6))::int ac
                    from dossiers dd left join users u on u.id = dd.agent_user_id
                    group by 1, 2 order by 3 desc limit 12) t),
      act as (select json_agg(json_build_object('k', action, 'n', c) order by c desc) v
              from (select action, count(*)::int c from activity_log
                    where created_at >= now() - interval '30 days' group by 1) t),
      kp as (select (count(*))::int total, (count(*) filter (where etape < 6))::int actifs,
                    (count(*) filter (where decision = 'approuve'))::int approuve,
                    (count(*) filter (where decision = 'refuse'))::int refuse
             from dossiers),
      en as (select coalesce(sum((pp->>'montant')::numeric) filter (where (pp->>'encaisse')::boolean), 0)::int total,
                    (count(distinct d.id) filter (where (pp->>'encaisse')::boolean))::int payes
             from dossiers d, jsonb_array_elements(d.paiements) pp)
    select json_build_object(
      'pipeline', (select v from pipe), 'parNiveau', (select v from niv), 'parPack', (select v from pk),
      'parCentre', (select v from ctr), 'parDecision', (select v from dec), 'parModalite', (select v from modl),
      'ouvertures', (select v from ouv), 'encaissements', (select v from encw), 'parRole', (select v from rol),
      'parAgent', (select v from agt), 'activiteParAction', (select v from act),
      'kpi', (select row_to_json(kp) from kp), 'enc', (select row_to_json(en) from en)
    ) result
  `);
  const r = ((rows as unknown as { result: AnalyticsResult }[])[0]?.result ??
    {}) as Partial<AnalyticsResult>;

  const totalEncaisse = r.enc?.total ?? 0;
  const payes = r.enc?.payes ?? 0;
  const approuve = r.kpi?.approuve ?? 0;
  const refuse = r.kpi?.refuse ?? 0;

  return {
    kpis: {
      total: r.kpi?.total ?? 0,
      actifs: r.kpi?.actifs ?? 0,
      totalEncaisse,
      ticketMoyen: payes ? Math.round(totalEncaisse / payes) : 0,
      tauxApprobation:
        approuve + refuse ? Math.round((approuve / (approuve + refuse)) * 100) : null,
      approuve,
      refuse,
    },
    pipeline: r.pipeline ?? [],
    parNiveau: r.parNiveau ?? [],
    parPack: r.parPack ?? [],
    parCentre: r.parCentre ?? [],
    parDecision: r.parDecision ?? [],
    parModalite: r.parModalite ?? [],
    ouverturesParSemaine: r.ouvertures ?? [],
    encaissementsParSemaine: r.encaissements ?? [],
    parRole: r.parRole ?? [],
    parAgent: r.parAgent ?? [],
    activiteParAction: r.activiteParAction ?? [],
  };
});

/* ============ Fiche agent (profil d'un utilisateur) ============ */

const MAX_PHOTO_BYTES = 1_500_000; // ~1,5 Mo de data URL — largement assez pour un avatar.

export const getUser = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireCeo();
    const u = await db.query.users.findFirst({ where: eq(users.id, data.id) });
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      nom: u.nom,
      role: u.role,
      photoBase64: u.photoBase64,
      createdAt: u.createdAt,
    };
  });

export const updateUser = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), nom: z.string().min(1), email: z.string().email() }))
  .handler(async ({ data }) => {
    await requireCeo();
    const email = data.email.toLowerCase();
    const clash = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (clash && clash.id !== data.id)
      throw new Error("Cet email est déjà utilisé par un autre compte.");
    await db.update(users).set({ nom: data.nom, email }).where(eq(users.id, data.id));
    await logActivity("utilisateur.modification", `Fiche modifiée : ${data.nom} (${email})`);
  });

export const setUserPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), photoBase64: z.string().nullable() }))
  .handler(async ({ data }) => {
    await requireCeo();
    if (data.photoBase64) {
      if (!data.photoBase64.startsWith("data:image/"))
        throw new Error("Le fichier n'est pas une image.");
      if (data.photoBase64.length > MAX_PHOTO_BYTES)
        throw new Error("Image trop lourde (max ~1 Mo).");
    }
    await db.update(users).set({ photoBase64: data.photoBase64 }).where(eq(users.id, data.id));
    await logActivity(
      "utilisateur.photo",
      data.photoBase64 ? "Photo de profil mise à jour." : "Photo de profil retirée.",
    );
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), password: z.string().min(6) }))
  .handler(async ({ data }) => {
    await requireCeo();
    const passwordHash = await bcrypt.hash(data.password, 12);
    await db.update(users).set({ passwordHash }).where(eq(users.id, data.id));
    await logActivity(
      "utilisateur.motdepasse",
      `Mot de passe réinitialisé pour l'utilisateur ${data.id}`,
    );
  });

/**
 * Profil complet d'un agent : ses dossiers, les pièces rassemblées, ses encaissements,
 * son activité, et l'analytique le concernant — le tout en une requête (leçon du pooler).
 *
 * `createServerOnlyFn` (pas un RPC) : réutilisé côté serveur par `getUserProfile` (CEO) et
 * par `getMyProfile` (l'agent lui-même, dans profile.ts). Le contrôle d'accès est à l'appelant.
 */
export const fetchUserProfile = createServerOnlyFn(async (id: string) => {
  const rows = await db.execute(sql`
      with
        mine as (select * from dossiers where agent_user_id = ${id}),
        kp as (select
                 (count(*))::int dossiers,
                 (count(*) filter (where etape < 6))::int actifs,
                 (count(*) filter (where decision = 'approuve'))::int approuve,
                 (count(*) filter (where decision = 'refuse'))::int refuse
               from mine),
        docs_count as (select (count(*))::int c from documents d join mine on mine.id = d.dossier_id),
        enc as (select coalesce(sum(substring(detail from '^([0-9]+)')::numeric), 0)::int total,
                       (count(*))::int n
                from activity_log where user_id = ${id} and action = 'paiement.encaissement'),
        par_etape as (select json_agg(json_build_object('k', etape::text, 'n', c) order by etape) v
                      from (select etape, count(*)::int c from mine group by etape) t),
        par_niveau as (select json_agg(json_build_object('k', niveau, 'n', c)) v
                       from (select niveau, count(*)::int c from mine group by niveau) t),
        dossiers_list as (select json_agg(json_build_object(
                            'id', id, 'nom', client_nom, 'titre', titre, 'niveau', niveau,
                            'etape', etape, 'decision', decision, 'ouvertLe', ouvert_le
                          ) order by created_at desc) v
                          from (select * from mine order by created_at desc limit 60) t),
        docs_list as (select json_agg(json_build_object(
                        'id', id, 'dossierId', dossier_id, 'clientNom', client_nom,
                        'filename', filename, 'type', type, 'uploadedAt', uploaded_at
                      ) order by uploaded_at desc) v
                      from (select d.id, d.dossier_id, mine.client_nom, d.filename, d.type, d.uploaded_at
                            from documents d join mine on mine.id = d.dossier_id
                            order by d.uploaded_at desc limit 80) t),
        enc_list as (select json_agg(json_build_object(
                       'id', id, 'detail', detail, 'dossierId', dossier_id, 'createdAt', created_at
                     ) order by created_at desc) v
                     from (select * from activity_log
                           where user_id = ${id} and action = 'paiement.encaissement'
                           order by created_at desc limit 40) t),
        act_list as (select json_agg(json_build_object(
                       'id', id, 'action', action, 'detail', detail, 'dossierId', dossier_id, 'createdAt', created_at
                     ) order by created_at desc) v
                     from (select * from activity_log where user_id = ${id}
                           order by created_at desc limit 40) t)
      select json_build_object(
        'kpi', (select row_to_json(kp) from kp),
        'documents', (select c from docs_count),
        'encaisse', (select total from enc),
        'nEncaissements', (select n from enc),
        'parEtape', (select v from par_etape),
        'parNiveau', (select v from par_niveau),
        'dossiers', (select v from dossiers_list),
        'docs', (select v from docs_list),
        'encaissements', (select v from enc_list),
        'activite', (select v from act_list)
      ) result
    `);
  type Prof = {
    kpi: { dossiers: number; actifs: number; approuve: number; refuse: number } | null;
    documents: number | null;
    encaisse: number | null;
    nEncaissements: number | null;
    parEtape: { k: string; n: number }[] | null;
    parNiveau: { k: string; n: number }[] | null;
    dossiers:
      | {
          id: string;
          nom: string;
          titre: string;
          niveau: string;
          etape: number;
          decision: string;
          ouvertLe: string;
        }[]
      | null;
    docs:
      | {
          id: string;
          dossierId: string;
          clientNom: string;
          filename: string;
          type: string;
          uploadedAt: string;
        }[]
      | null;
    encaissements:
      { id: string; detail: string; dossierId: string | null; createdAt: string }[] | null;
    activite:
      | {
          id: string;
          action: string;
          detail: string;
          dossierId: string | null;
          createdAt: string;
        }[]
      | null;
  };
  const p = ((rows as unknown as { result: Prof }[])[0]?.result ?? {}) as Partial<Prof>;
  const approuve = p.kpi?.approuve ?? 0;
  const refuse = p.kpi?.refuse ?? 0;
  return {
    kpis: {
      dossiers: p.kpi?.dossiers ?? 0,
      actifs: p.kpi?.actifs ?? 0,
      approuve,
      refuse,
      tauxApprobation:
        approuve + refuse ? Math.round((approuve / (approuve + refuse)) * 100) : null,
      documents: p.documents ?? 0,
      encaisse: p.encaisse ?? 0,
      nEncaissements: p.nEncaissements ?? 0,
    },
    parEtape: p.parEtape ?? [],
    parNiveau: p.parNiveau ?? [],
    dossiers: p.dossiers ?? [],
    documents: p.docs ?? [],
    encaissements: p.encaissements ?? [],
    activite: p.activite ?? [],
  };
});

export const getUserProfile = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireCeo();
    return fetchUserProfile(data.id);
  });
