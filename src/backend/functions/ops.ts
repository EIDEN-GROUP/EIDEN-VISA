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
                           count(dd.id)::int d, (count(dd.id) filter (where dd.etape < 7))::int ac
                    from dossiers dd left join users u on u.id = dd.agent_user_id group by 1) t),
      agt as (select json_agg(json_build_object('nom', nom, 'role', role, 'dossiers', d, 'actifs', ac) order by d desc) v
              from (select coalesce(u.nom, 'Non attribué') nom, coalesce(u.role, 'non_attribue') role,
                           count(dd.id)::int d, (count(dd.id) filter (where dd.etape < 7))::int ac
                    from dossiers dd left join users u on u.id = dd.agent_user_id
                    group by 1, 2 order by 3 desc limit 12) t),
      act as (select json_agg(json_build_object('k', action, 'n', c) order by c desc) v
              from (select action, count(*)::int c from activity_log
                    where created_at >= now() - interval '30 days' group by 1) t),
      kp as (select (count(*))::int total, (count(*) filter (where etape < 7))::int actifs,
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
