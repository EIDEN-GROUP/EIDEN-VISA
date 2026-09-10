import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc, and, or, ilike, gte, lte, sql, count as sqlCount, type SQL } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { dossiers as dossiersTable } from "@/backend/db/schema";
import { requireUserId, requireCeo } from "@/backend/functions/auth";
import { logActivity } from "@/backend/functions/ops";
import {
  PACKS,
  reglerEcheancier,
  MODALITE_LABEL,
  type Dossier,
  type PackKey,
  type Modalite,
} from "@/lib/dossier-model";
import type { Profile } from "@/lib/visa-rules";

/** Filtre de date partagé : "dossiers ouverts entre le X et le Y", sur la vraie colonne
 * `created_at` (timestamp) — pas sur `ouvert_le`, un texte français non fiable à trier/filtrer. */
const dateRangeInput = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
function dateRangeConditions(data: {
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
}): SQL[] {
  const conditions: SQL[] = [];
  if (data.dateFrom) conditions.push(gte(dossiersTable.createdAt, new Date(data.dateFrom)));
  if (data.dateTo) {
    // Borne haute inclusive jusqu'à la fin du jour choisi.
    const end = new Date(data.dateTo);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(dossiersTable.createdAt, end));
  }
  return conditions;
}

type DossierRow = typeof dossiersTable.$inferSelect;

function rowToDossier(row: DossierRow): Dossier {
  return {
    id: row.id,
    client: {
      nom: row.clientNom,
      telephone: row.clientTelephone,
      ville: row.clientVille,
      naissance: row.clientNaissance,
    },
    agent: row.agent,
    agentUserId: row.agentUserId,
    assigneeUserId: row.assigneeUserId,
    ouvertLe: row.ouvertLe,
    caseKey: row.caseKey,
    profile: row.profile,
    titre: row.titre,
    categorie: row.categorie,
    niveau: row.niveau,
    pack: row.pack,
    modalitePaiement: row.modalitePaiement,
    etape: row.etape,
    rdv: {
      centre: row.rdvCentre as Dossier["rdv"]["centre"],
      date: row.rdvDate,
      heure: row.rdvHeure,
      statut: row.rdvStatut,
    },
    pieces: row.pieces,
    paiements: row.paiements,
    notes: row.notes,
    decision: row.decision,
    decisionDate: row.decisionDate,
  };
}

export const listDossiers = createServerFn({ method: "GET" }).handler(async () => {
  await requireUserId();
  const rows = await db.select().from(dossiersTable).orderBy(desc(dossiersTable.createdAt));
  return rows.map(rowToDossier);
});

/**
 * Liste paginée, filtrée côté SQL — pense échelle réelle (potentiellement des millions
 * de dossiers) : jamais de SELECT * suivi d'un filtrage en JS.
 */
export const listDossiersPage = createServerFn({ method: "GET" })
  .validator(
    z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(200).default(50),
      search: z.string().optional(),
      niveau: z.enum(["tous", "standard", "attention", "complexe"]).default("tous"),
      pays: z.enum(["tous", "france", "espagne"]).default("tous"),
      mine: z.boolean().default(false),
      ...dateRangeInput.shape,
    }),
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const term = data.search?.trim();
    const conditions: SQL[] = [...dateRangeConditions(data)];
    // « Mes dossiers » = ceux que j'ai ouverts OU ceux qui me sont assignés.
    if (data.mine) {
      const mineCond = or(
        eq(dossiersTable.agentUserId, userId),
        eq(dossiersTable.assigneeUserId, userId),
      );
      if (mineCond) conditions.push(mineCond);
    }
    if (term) {
      const like = `%${term}%`;
      const digits = term.replace(/\D/g, "");
      const searchCondition = or(
        ilike(dossiersTable.clientNom, like),
        ilike(dossiersTable.clientVille, like),
        ilike(dossiersTable.id, like),
        digits.length > 0
          ? sql`regexp_replace(${dossiersTable.clientTelephone}, '\\D', '', 'g') ilike ${`%${digits}%`}`
          : ilike(dossiersTable.clientTelephone, like),
      );
      if (searchCondition) conditions.push(searchCondition);
    }
    if (data.niveau !== "tous") conditions.push(eq(dossiersTable.niveau, data.niveau));
    if (data.pays === "espagne") conditions.push(ilike(dossiersTable.rdvCentre, "%BLS%"));
    if (data.pays === "france") conditions.push(sql`${dossiersTable.rdvCentre} not ilike '%BLS%'`);
    const where = conditions.length > 0 ? and(...conditions) : sql`true`;

    const [rows, totalRows] = await Promise.all([
      db
        .select()
        .from(dossiersTable)
        .where(where)
        .orderBy(desc(dossiersTable.createdAt))
        .limit(data.pageSize)
        .offset((data.page - 1) * data.pageSize),
      db.select({ n: sqlCount() }).from(dossiersTable).where(where),
    ]);
    return { rows: rows.map(rowToDossier), total: Number(totalRows[0]?.n ?? 0) };
  });

/** Bornée à un lot récent, jamais la table entière : les alertes se lisent sur les dossiers actifs. */
export const listAlertesDossiers = createServerFn({ method: "GET" }).handler(async () => {
  await requireUserId();
  const rows = await db
    .select()
    .from(dossiersTable)
    .where(sql`${dossiersTable.etape} < 7`)
    .orderBy(desc(dossiersTable.createdAt))
    .limit(300);
  return rows.map(rowToDossier);
});

export const listDossiersRecents = createServerFn({ method: "GET" }).handler(async () => {
  await requireUserId();
  const rows = await db
    .select()
    .from(dossiersTable)
    .orderBy(desc(dossiersTable.createdAt))
    .limit(6);
  return rows.map(rowToDossier);
});

export const listDossiersByRdvStatut = createServerFn({ method: "GET" })
  .validator(
    z.object({ statut: z.enum(["recherche", "confirme", "depose"]), ...dateRangeInput.shape }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    const where = and(eq(dossiersTable.rdvStatut, data.statut), ...dateRangeConditions(data));
    const rows = await db
      .select()
      .from(dossiersTable)
      .where(where)
      .orderBy(desc(dossiersTable.createdAt))
      .limit(300);
    return rows.map(rowToDossier);
  });

/** Dossiers ayant au moins un paiement en attente — pour l'écran Paiements, sans charger la table entière. */
export const listDossiersAvecImpaye = createServerFn({ method: "GET" })
  .validator(dateRangeInput)
  .handler(async ({ data }) => {
    await requireUserId();
    const where = and(
      sql`exists (select 1 from jsonb_array_elements(${dossiersTable.paiements}) p where (p->>'encaisse')::boolean = false)`,
      ...dateRangeConditions(data),
    );
    const rows = await db
      .select()
      .from(dossiersTable)
      .where(where)
      .orderBy(desc(dossiersTable.createdAt))
      .limit(300);
    return rows.map(rowToDossier);
  });

/** Historique des encaissements — borné aux dossiers les plus récents ayant un encaissement. */
export const listDossiersAvecEncaissement = createServerFn({ method: "GET" })
  .validator(dateRangeInput)
  .handler(async ({ data }) => {
    await requireUserId();
    const where = and(
      sql`exists (select 1 from jsonb_array_elements(${dossiersTable.paiements}) p where (p->>'encaisse')::boolean = true)`,
      ...dateRangeConditions(data),
    );
    const rows = await db
      .select()
      .from(dossiersTable)
      .where(where)
      .orderBy(desc(dossiersTable.createdAt))
      .limit(100);
    return rows.map(rowToDossier);
  });

/** Statistiques agrégées côté SQL — jamais un reduce() en JS sur la table entière. */
export const getDashboardStats = createServerFn({ method: "GET" })
  .validator(dateRangeInput)
  .handler(async ({ data }) => {
    await requireUserId();
    const range = dateRangeConditions(data);
    const rangeWhere = range.length > 0 ? and(...range) : undefined;
    const [[totalRow], [actifsRow], [creneauRow], encaisseResult] = await Promise.all([
      db.select({ n: sqlCount() }).from(dossiersTable).where(rangeWhere),
      db
        .select({ n: sqlCount() })
        .from(dossiersTable)
        .where(and(sql`${dossiersTable.etape} < 7`, ...range)),
      db
        .select({ n: sqlCount() })
        .from(dossiersTable)
        .where(and(eq(dossiersTable.rdvStatut, "recherche"), ...range)),
      db.execute(sql`
        select coalesce(sum((p->>'montant')::numeric), 0) as total
        from ${dossiersTable} d, jsonb_array_elements(d.paiements) p
        where (p->>'encaisse')::boolean = true
        ${data.dateFrom ? sql`and d.created_at >= ${new Date(data.dateFrom)}` : sql``}
        ${
          data.dateTo
            ? sql`and d.created_at <= ${(() => {
                const e = new Date(data.dateTo);
                e.setHours(23, 59, 59, 999);
                return e;
              })()}`
            : sql``
        }
      `),
    ]);
    const totalEncaisse = Number((encaisseResult as unknown as { total: string }[])[0]?.total ?? 0);
    return {
      total: Number(totalRow?.n ?? 0),
      actifs: Number(actifsRow?.n ?? 0),
      enAttenteCreneau: Number(creneauRow?.n ?? 0),
      totalEncaisse,
    };
  });

/** Statistiques de paiements agrégées côté SQL, pour l'écran Paiements. */
export const getPaiementsStats = createServerFn({ method: "GET" })
  .validator(dateRangeInput)
  .handler(async ({ data }) => {
    await requireUserId();
    const result = await db.execute(sql`
      select
        coalesce(sum((p->>'montant')::numeric) filter (where (p->>'encaisse')::boolean = true), 0) as encaisse,
        coalesce(sum((p->>'montant')::numeric) filter (where (p->>'encaisse')::boolean = false), 0) as attente,
        count(*) filter (where (p->>'encaisse')::boolean = true) as n_encaisse,
        count(*) filter (where (p->>'encaisse')::boolean = false) as n_attente
      from ${dossiersTable} d, jsonb_array_elements(d.paiements) p
      where true
      ${data.dateFrom ? sql`and d.created_at >= ${new Date(data.dateFrom)}` : sql``}
      ${
        data.dateTo
          ? sql`and d.created_at <= ${(() => {
              const e = new Date(data.dateTo);
              e.setHours(23, 59, 59, 999);
              return e;
            })()}`
          : sql``
      }
    `);
    const row = (
      result as unknown as {
        encaisse: string;
        attente: string;
        n_encaisse: string;
        n_attente: string;
      }[]
    )[0];
    return {
      totalEncaisse: Number(row?.encaisse ?? 0),
      totalAttente: Number(row?.attente ?? 0),
      nEncaisse: Number(row?.n_encaisse ?? 0),
      nAttente: Number(row?.n_attente ?? 0),
    };
  });

export const getPackCounts = createServerFn({ method: "GET" })
  .validator(dateRangeInput)
  .handler(async ({ data }) => {
    await requireUserId();
    const range = dateRangeConditions(data);
    const rows = await db
      .select({ pack: dossiersTable.pack, n: sqlCount() })
      .from(dossiersTable)
      .where(range.length > 0 ? and(...range) : undefined)
      .groupBy(dossiersTable.pack);
    return rows as { pack: PackKey; n: number }[];
  });

export const getDossier = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    return row ? rowToDossier(row) : null;
  });

const dossierInput = z.object({
  id: z.string(),
  client: z.object({
    nom: z.string(),
    telephone: z.string(),
    ville: z.string(),
    naissance: z.string(),
  }),
  agent: z.string(),
  assigneeUserId: z.string().nullable().default(null),
  ouvertLe: z.string(),
  caseKey: z.string(),
  profile: z.object({
    base: z.enum(["tourisme", "visite_generale", "visite_enfant_parent", "famille_ue"]).optional(),
    dependent: z.boolean().optional(),
    minor: z.boolean().optional(),
    married: z.boolean().optional(),
    spouseNoJob: z.boolean().optional(),
    visaHist: z.boolean().optional(),
    grandchildNote: z.boolean().optional(),
    prof: z
      .enum(["salarie", "commercant", "agriculteur", "retraite", "etudiant", "sans"])
      .optional(),
  }),
  titre: z.string(),
  categorie: z.string(),
  niveau: z.enum(["standard", "attention", "complexe"]),
  pack: z.enum(["base", "voyage", "global"]),
  modalitePaiement: z.enum(["comptant", "acompte"]).default("comptant"),
  etape: z.number(),
  rdv: z.object({
    centre: z.string(),
    date: z.string().nullable(),
    heure: z.string().nullable(),
    statut: z.enum(["recherche", "confirme", "depose"]),
  }),
  pieces: z.array(
    z.object({ label: z.string(), source: z.enum(["officiel", "eiden"]), fourni: z.boolean() }),
  ),
  paiements: z.array(
    z.object({
      libelle: z.string(),
      montant: z.number(),
      date: z.string().nullable(),
      encaisse: z.boolean(),
      echeance: z.enum(["acompte", "solde", "option"]).optional(),
    }),
  ),
  notes: z.array(z.string()),
});

export const createDossier = createServerFn({ method: "POST" })
  .validator(dossierInput)
  .handler(async ({ data }) => {
    // Le compte réel qui crée le dossier vient de la session, jamais du client — sinon
    // n'importe qui pourrait attribuer un dossier à quelqu'un d'autre en modifiant la requête.
    const agentUserId = await requireUserId();
    await db.insert(dossiersTable).values({
      id: data.id,
      clientNom: data.client.nom,
      clientTelephone: data.client.telephone,
      clientVille: data.client.ville,
      clientNaissance: data.client.naissance,
      agent: data.agent,
      agentUserId,
      assigneeUserId: data.assigneeUserId,
      ouvertLe: data.ouvertLe,
      caseKey: data.caseKey,
      profile: data.profile as Profile,
      titre: data.titre,
      categorie: data.categorie,
      niveau: data.niveau,
      pack: data.pack as PackKey,
      modalitePaiement: data.modalitePaiement as Modalite,
      etape: data.etape,
      rdvCentre: data.rdv.centre,
      rdvDate: data.rdv.date,
      rdvHeure: data.rdv.heure,
      rdvStatut: data.rdv.statut,
      pieces: data.pieces,
      paiements: data.paiements,
      notes: data.notes,
    });
    await logActivity(
      "dossier.creation",
      `Dossier créé pour ${data.client.nom} (${data.titre})`,
      data.id,
    );
    return { id: data.id };
  });

export const togglePiece = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), index: z.number() }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    const pieces = row.pieces.map((p, i) => (i === data.index ? { ...p, fourni: !p.fourni } : p));
    await db.update(dossiersTable).set({ pieces }).where(eq(dossiersTable.id, data.id));
  });

export const avancerEtape = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), direction: z.enum(["avancer", "reculer"]) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    const etape =
      data.direction === "avancer" ? Math.min(7, row.etape + 1) : Math.max(1, row.etape - 1);
    await db.update(dossiersTable).set({ etape }).where(eq(dossiersTable.id, data.id));
    if (etape === 7 && row.etape !== 7)
      await logActivity("dossier.cloture", `Dossier ${data.id} clôturé (dépôt).`, data.id);
  });

export const setEtape = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), etape: z.number().min(1).max(7) }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.update(dossiersTable).set({ etape: data.etape }).where(eq(dossiersTable.id, data.id));
    if (data.etape === 7)
      await logActivity("dossier.cloture", `Dossier ${data.id} clôturé (dépôt).`, data.id);
  });

export const changerCentre = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      centre: z.enum(["TLScontact Agadir", "TLScontact Casablanca", "BLS Espagne Agadir"]),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    // Un rendez-vous confirmé pour un centre n'a plus de sens pour un autre :
    // changer de centre remet la recherche de créneau à zéro.
    const centreChanged = row.rdvCentre !== data.centre;
    await db
      .update(dossiersTable)
      .set({
        rdvCentre: data.centre,
        ...(centreChanged && row.rdvStatut !== "recherche"
          ? { rdvDate: null, rdvHeure: null, rdvStatut: "recherche" as const }
          : {}),
      })
      .where(eq(dossiersTable.id, data.id));
  });

export const confirmerRdv = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), date: z.string(), heure: z.string() }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    await db
      .update(dossiersTable)
      .set({
        rdvDate: data.date,
        rdvHeure: data.heure,
        rdvStatut: "confirme",
        etape: Math.max(row.etape, 3),
      })
      .where(eq(dossiersTable.id, data.id));
  });

export const encaisser = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), index: z.number() }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    const paiements = row.paiements.map((p, i) =>
      i === data.index ? { ...p, encaisse: true, date: p.date ?? "aujourd'hui" } : p,
    );
    await db.update(dossiersTable).set({ paiements }).where(eq(dossiersTable.id, data.id));
    const p = row.paiements[data.index];
    if (p)
      await logActivity(
        "paiement.encaissement",
        `${p.montant} MAD encaissés (${p.libelle})`,
        data.id,
      );
  });

export const changerPack = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), pack: z.enum(["base", "voyage", "global"]) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    // On régénère l'échéancier (acompte + solde, ou solde comptant) selon le nouveau pack
    // et la modalité en cours : les lignes déjà encaissées et les options à la carte sont
    // conservées telles quelles, seules les lignes dues sont recalculées.
    const paiements = reglerEcheancier(row.paiements, data.pack, row.modalitePaiement);
    await db
      .update(dossiersTable)
      .set({ pack: data.pack, paiements })
      .where(eq(dossiersTable.id, data.id));
    await logActivity("paiement.pack", `Pack changé -> ${PACKS[data.pack].label}`, data.id);
  });

/** Le client choisit de régler comptant ou par acompte de 20 % — régénère l'échéancier dû. */
export const setModalitePaiement = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), modalite: z.enum(["comptant", "acompte"]) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    const paiements = reglerEcheancier(row.paiements, row.pack, data.modalite);
    await db
      .update(dossiersTable)
      .set({ modalitePaiement: data.modalite, paiements })
      .where(eq(dossiersTable.id, data.id));
    await logActivity(
      "paiement.modalite",
      `Modalité de paiement -> ${MODALITE_LABEL[data.modalite]}`,
      data.id,
    );
  });

/**
 * Suivi complet des encaissements pour l'écran /ops (CEO uniquement).
 * Tout est agrégé côté SQL — jamais un reduce() en JS sur la table entière.
 */
export const getPaiementsSuivi = createServerFn({ method: "GET" }).handler(async () => {
  await requireCeo();
  const [totaux, parModalite, soldesDus, acomptesEnRetard, journal] = await Promise.all([
    db.execute(sql`
      select
        coalesce(sum((p->>'montant')::numeric) filter (where (p->>'encaisse')::boolean), 0) as encaisse,
        coalesce(sum((p->>'montant')::numeric) filter (where not (p->>'encaisse')::boolean), 0) as attente,
        coalesce(sum((p->>'montant')::numeric) filter (where not (p->>'encaisse')::boolean and p->>'echeance' = 'acompte'), 0) as acompte_du,
        coalesce(sum((p->>'montant')::numeric) filter (where not (p->>'encaisse')::boolean and coalesce(p->>'echeance', 'solde') = 'solde'), 0) as solde_du
      from ${dossiersTable} d, jsonb_array_elements(d.paiements) p
    `),
    db
      .select({ modalite: dossiersTable.modalitePaiement, n: sqlCount() })
      .from(dossiersTable)
      .groupBy(dossiersTable.modalitePaiement),
    db.execute(sql`
      select d.id, d.client_nom as nom, d.etape,
        coalesce(sum((p->>'montant')::numeric) filter (where not (p->>'encaisse')::boolean and coalesce(p->>'echeance', 'solde') = 'solde'), 0) as montant
      from ${dossiersTable} d, jsonb_array_elements(d.paiements) p
      where d.etape >= 6
      group by d.id, d.client_nom, d.etape
      having coalesce(sum((p->>'montant')::numeric) filter (where not (p->>'encaisse')::boolean and coalesce(p->>'echeance', 'solde') = 'solde'), 0) > 0
      order by d.etape desc
      limit 100
    `),
    db.execute(sql`
      select d.id, d.client_nom as nom, d.etape,
        coalesce(sum((p->>'montant')::numeric) filter (where not (p->>'encaisse')::boolean and p->>'echeance' = 'acompte'), 0) as montant
      from ${dossiersTable} d, jsonb_array_elements(d.paiements) p
      where d.modalite_paiement = 'acompte' and d.etape >= 2
      group by d.id, d.client_nom, d.etape
      having coalesce(sum((p->>'montant')::numeric) filter (where not (p->>'encaisse')::boolean and p->>'echeance' = 'acompte'), 0) > 0
      order by d.etape desc
      limit 100
    `),
    db.execute(sql`
      select a.id, a.detail, a.dossier_id as "dossierId", a.created_at as "createdAt", u.nom as "userNom"
      from activity_log a left join users u on u.id = a.user_id
      where a.action like 'paiement.%'
      order by a.created_at desc
      limit 40
    `),
  ]);
  const t = (
    totaux as unknown as {
      encaisse: string;
      attente: string;
      acompte_du: string;
      solde_du: string;
    }[]
  )[0];
  const mod = parModalite as { modalite: Modalite; n: number }[];
  const toRows = (r: unknown) =>
    (r as { id: string; nom: string; etape: number; montant: string }[]).map((x) => ({
      id: x.id,
      nom: x.nom,
      etape: Number(x.etape),
      montant: Number(x.montant),
    }));
  return {
    totaux: {
      encaisse: Number(t?.encaisse ?? 0),
      attente: Number(t?.attente ?? 0),
      acompteDu: Number(t?.acompte_du ?? 0),
      soldeDu: Number(t?.solde_du ?? 0),
    },
    parModalite: {
      comptant: Number(mod.find((m) => m.modalite === "comptant")?.n ?? 0),
      acompte: Number(mod.find((m) => m.modalite === "acompte")?.n ?? 0),
    },
    soldesDus: toRows(soldesDus),
    acomptesEnRetard: toRows(acomptesEnRetard),
    journal: journal as unknown as {
      id: string;
      detail: string;
      dossierId: string | null;
      createdAt: string;
      userNom: string | null;
    }[],
  };
});

export const setDecision = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), decision: z.enum(["en_attente", "approuve", "refuse"]) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const decisionDate =
      data.decision === "en_attente" ? null : new Date().toLocaleDateString("fr-FR");
    await db
      .update(dossiersTable)
      .set({ decision: data.decision, decisionDate })
      .where(eq(dossiersTable.id, data.id));
    if (data.decision !== "en_attente") {
      await logActivity(
        "dossier.decision",
        data.decision === "approuve"
          ? "Visa approuvé par le consulat."
          : "Visa refusé par le consulat.",
        data.id,
      );
    }
  });

export const updateClient = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      client: z.object({
        nom: z.string().min(1),
        telephone: z.string().min(1),
        ville: z.string().min(1),
        naissance: z.string(),
      }),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    await db
      .update(dossiersTable)
      .set({
        clientNom: data.client.nom,
        clientTelephone: data.client.telephone,
        clientVille: data.client.ville,
        clientNaissance: data.client.naissance,
      })
      .where(eq(dossiersTable.id, data.id));
  });

export const deleteDossier = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    await db.delete(dossiersTable).where(eq(dossiersTable.id, data.id));
    await logActivity(
      "dossier.suppression",
      `Dossier supprimé : ${row.clientNom} (${data.id})`,
      data.id,
    );
  });
