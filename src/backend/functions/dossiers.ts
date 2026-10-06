import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc, and, or, ilike, gte, lte, sql, count as sqlCount, type SQL } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { dossiers as dossiersTable, users } from "@/backend/db/schema";
import {
  requireUserId,
  requireCeo,
  requireCeoOrReception,
  requireRoles,
} from "@/backend/functions/auth";
import { logActivity } from "@/backend/functions/ops";
import {
  PACKS,
  reglerEcheancier,
  MODALITE_LABEL,
  type Dossier,
  type PackKey,
  type Modalite,
} from "@/lib/dossier-model";
import { TREE_FIELDS, type Profile } from "@/lib/visa-rules";

/** Filtre de date partagé : "dossiers ouverts entre le X et le Y", sur la vraie colonne
 * `created_at` (timestamp) — pas sur `ouvert_le`, un texte français non fiable à trier/filtrer.
 * Refuse les dates non analysables (400) au lieu de laisser `Invalid Date` exploser en SQL. */
const dateInput = z
  .string()
  .max(32)
  .refine((s) => !Number.isNaN(Date.parse(s)), "Date invalide.");
const dateRangeInput = z.object({
  dateFrom: dateInput.optional(),
  dateTo: dateInput.optional(),
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
      voyageDebut: row.clientVoyageDebut,
      voyageFin: row.clientVoyageFin,
      passeportNumero: row.clientPasseportNumero,
      passeportDelivrance: row.clientPasseportDelivrance,
      passeportExpiration: row.clientPasseportExpiration,
      passeportLieu: row.clientPasseportLieu,
    },
    agent: row.agent,
    agentUserId: row.agentUserId,
    assigneeUserId: row.assigneeUserId,
    ouvertLe: row.ouvertLe,
    caseKey: row.caseKey,
    profile: row.profile,
    qualification: row.qualification,
    titre: row.titre,
    categorie: row.categorie,
    niveau: row.niveau,
    pack: row.pack,
    modalitePaiement: row.modalitePaiement,
    etape: row.etape,
    centre: row.centre,
    uploadAutorise: row.uploadAutorise,
    pieces: row.pieces,
    paiements: row.paiements,
    notes: row.notes,
    notesAgent: row.notesAgent,
    decision: row.decision,
    decisionDate: row.decisionDate,
    decisionMotif: row.decisionMotif,
    recuRemis: row.recuRemis,
    recuLe: row.recuLe,
    franceVisasFait: row.franceVisasFait,
    franceVisasRef: row.franceVisasRef,
    franceVisasLe: row.franceVisasLe,
    rdvPris: row.rdvPris,
    rdvDate: row.rdvDate,
    rdvLe: row.rdvLe,
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
      search: z.string().max(120).optional(),
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
    if (data.pays === "espagne") conditions.push(ilike(dossiersTable.centre, "%BLS%"));
    if (data.pays === "france") conditions.push(sql`${dossiersTable.centre} not ilike '%BLS%'`);
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
    .where(sql`${dossiersTable.etape} < 5`)
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
    const [[totalRow], [actifsRow], [aAutoriserRow], encaisseResult] = await Promise.all([
      db.select({ n: sqlCount() }).from(dossiersTable).where(rangeWhere),
      db
        .select({ n: sqlCount() })
        .from(dossiersTable)
        .where(and(sql`${dossiersTable.etape} < 5`, ...range)),
      db
        .select({ n: sqlCount() })
        .from(dossiersTable)
        .where(
          and(sql`${dossiersTable.etape} < 5`, eq(dossiersTable.uploadAutorise, false), ...range),
        ),
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
      aAutoriser: Number(aAutoriserRow?.n ?? 0),
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
  .validator(z.object({ id: z.string().min(1).max(32) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    return row ? rowToDossier(row) : null;
  });

/** Champs d'identité bornés : le client ne doit pouvoir ni vider ni gonfler la fiche. */
const clientInput = z.object({
  nom: z.string().min(1).max(120),
  telephone: z.string().min(1).max(120),
  ville: z.string().min(1).max(120),
  naissance: z.string().max(120),
  voyageDebut: z.string().max(32).nullable().default(null),
  voyageFin: z.string().max(32).nullable().default(null),
  passeportNumero: z.string().max(64).nullable().default(null),
  passeportDelivrance: z.string().max(64).nullable().default(null),
  passeportExpiration: z.string().max(64).nullable().default(null),
  passeportLieu: z.string().max(120).nullable().default(null),
});

const dossierInput = z.object({
  id: z.string().min(1).max(32),
  client: clientInput,
  agent: z.string().min(1).max(120),
  assigneeUserId: z.string().max(64).nullable().default(null),
  ouvertLe: z.string().min(1).max(32),
  caseKey: z.string().min(1).max(32),
  profile: z.object({
    base: z
      .enum([
        "tourisme",
        "visite_generale",
        "visite_enfant_parent",
        "famille_ue",
        "visite_familiale_membre",
        "enfant_parent_francais",
        "en_vue_mariage",
      ])
      .optional(),
    dependent: z.boolean().optional(),
    minor: z.boolean().optional(),
    married: z.boolean().optional(),
    spouseNoJob: z.boolean().optional(),
    visaHist: z.boolean().optional(),
    grandchildNote: z.boolean().optional(),
    prof: z
      .enum([
        "salarie",
        "fonctionnaire",
        "commercant",
        "avocat_medical",
        "agriculteur",
        "retraite",
        "etudiant",
        "entrepreneur",
        "sans",
      ])
      .optional(),
    duree: z.enum(["court", "long"]).optional(),
    hebergement: z.enum(["hotel", "personne", "autre"]).optional(),
    transport: z.enum(["avion", "autobus", "bateau"]).optional(),
    financePar: z.enum(["soi_meme", "garant"]).optional(),
    situationFamiliale: z.enum(["celibataire", "marie", "divorce", "veuf", "autre"]).optional(),
    visaAnterieur: z.boolean().optional(),
    refusVisa: z.boolean().optional(),
    ueEeeFamily: z.boolean().optional(),
    bansCertificat: z.boolean().optional(),
    futurConjointFrancais: z.boolean().optional(),
    // Long séjour (Visa D) — sinon zod retire ces réponses en silence à l'enregistrement.
    lsType: z.enum(["retour", "famille", "visiteur", "travail"]).optional(),
    lsRetour: z.enum(["perte_titre", "perte_passeport", "recepisse", "mineur"]).optional(),
    lsFamille: z.enum(["asc_charge", "asc_non_charge", "conjoint", "parent_mineur"]).optional(),
    lsVisiteur: z.enum(["majeur", "mineur"]).optional(),
    lsTravail: z.enum(["embauche", "ict", "entrepreneur", "liberale"]).optional(),
    lsActeMariage: z.boolean().optional(),
    lsAnciennete: z.boolean().optional(),
    lsAttestations: z.boolean().optional(),
    lsAutorisation: z.enum(["oui", "non", "encours"]).optional(),
    lsAutreParent: z.boolean().optional(),
    lsAutreParentAutorise: z.boolean().optional(),
    lsCadre: z.boolean().optional(),
    lsCommunaute: z.boolean().optional(),
    lsConjointFrancais: z.boolean().optional(),
    lsContratTravail: z.boolean().optional(),
    lsContribue: z.boolean().optional(),
    lsContribue2ans: z.boolean().optional(),
    lsCopieTitre: z.boolean().optional(),
    lsDcemTir: z.boolean().optional(),
    lsDecisionGarde: z.boolean().optional(),
    lsDeclarationPerte: z.boolean().optional(),
    lsDescFrancais: z.boolean().optional(),
    lsDescMarie: z.enum(["oui", "non", "na"]).optional(),
    lsDiplomes: z.boolean().optional(),
    lsEmployeur: z.enum(["france", "detachement"]).optional(),
    lsEnfantFrancais: z.boolean().optional(),
    lsEnfantMineur: z.boolean().optional(),
    lsEnfantReside: z.boolean().optional(),
    lsFiliation: z.boolean().optional(),
    lsFinanceMineur: z.enum(["pere", "mere", "parents", "organisme", "proche", "autre"]).optional(),
    lsFinanceSejour: z.enum(["soi", "famille", "autre"]).optional(),
    lsFonds: z.boolean().optional(),
    lsGarde: z.enum(["pere", "mere", "autre"]).optional(),
    lsGardeAutorise: z.boolean().optional(),
    lsHebergMineur: z.enum(["parents", "proche", "residence", "autre"]).optional(),
    lsLettreMission: z.boolean().optional(),
    lsLien: z.enum(["parent", "grand_parent", "autre"]).optional(),
    lsLogement: z.enum(["propriete", "location", "personne", "autre"]).optional(),
    lsMaintien: z.boolean().optional(),
    lsMarie: z.boolean().optional(),
    lsMemeGroupe: z.boolean().optional(),
    lsMineur: z.boolean().optional(),
    lsParentFrancais: z.boolean().optional(),
    lsParentsSepares: z.boolean().optional(),
    lsPolygamie: z.boolean().optional(),
    lsPriseEnCharge: z.boolean().optional(),
    lsPriseRegulier: z.boolean().optional(),
    lsProfReglementee: z.boolean().optional(),
    lsProjet: z.enum(["creation", "existante"]).optional(),
    lsRecepisse: z.boolean().optional(),
    lsRecepisseValide: z.boolean().optional(),
    lsReferencesTitre: z.boolean().optional(),
    lsRessortissant: z.boolean().optional(),
    lsRessourcesPerso: z.boolean().optional(),
    lsRessourcesPropres: z.boolean().optional(),
    lsRessourcesSmic: z.boolean().optional(),
    lsScolarise: z.boolean().optional(),
    lsStatutExistant: z.enum(["salarie", "non_salarie"]).optional(),
    lsStatutIct: z.enum(["salarie", "stagiaire"]).optional(),
    lsStructure: z.boolean().optional(),
    lsTranscrit: z.enum(["oui", "non", "na"]).optional(),
    lsViabilite: z.boolean().optional(),
    origine: z.enum(["site", "direct"]).optional(),
    details: z
      .record(z.string(), z.string().max(500))
      .refine((v) => Object.keys(v).length <= 100, "Trop de détails.")
      .optional(),
  }),
  titre: z.string().min(1).max(160),
  categorie: z.string().min(1).max(160),
  niveau: z.enum(["standard", "attention", "complexe"]),
  pack: z.enum(["base", "voyage", "global"]),
  modalitePaiement: z.enum(["comptant", "acompte"]).default("comptant"),
  etape: z.number().int().min(1).max(5),
  centre: z.enum(["TLScontact Agadir", "BLS Espagne Agadir"]),
  pieces: z
    .array(
      z.object({
        label: z.string().min(1).max(200),
        source: z.enum(["officiel", "eiden"]),
        fourni: z.boolean(),
      }),
    )
    .max(200),
  paiements: z
    .array(
      z.object({
        libelle: z.string().min(1).max(160),
        montant: z.number().int().min(0).max(10_000_000),
        date: z.string().max(32).nullable(),
        encaisse: z.boolean(),
        echeance: z.enum(["acompte", "solde", "option"]).optional(),
      }),
    )
    .max(50),
  notes: z.array(z.string().max(2000)).max(200),
  qualification: z
    .array(z.object({ question: z.string().max(2000), reponse: z.string().max(2000) }))
    .max(200)
    .default([]),
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
      clientVoyageDebut: data.client.voyageDebut,
      clientVoyageFin: data.client.voyageFin,
      clientPasseportNumero: data.client.passeportNumero,
      clientPasseportDelivrance: data.client.passeportDelivrance,
      clientPasseportExpiration: data.client.passeportExpiration,
      clientPasseportLieu: data.client.passeportLieu,
      agent: data.agent,
      agentUserId,
      assigneeUserId: data.assigneeUserId,
      ouvertLe: data.ouvertLe,
      caseKey: data.caseKey,
      profile: data.profile as Profile,
      qualification: data.qualification,
      titre: data.titre,
      categorie: data.categorie,
      niveau: data.niveau,
      pack: data.pack as PackKey,
      modalitePaiement: data.modalitePaiement as Modalite,
      etape: data.etape,
      centre: data.centre as Dossier["centre"],
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
  .validator(z.object({ id: z.string().min(1).max(32), index: z.number().int().min(0) }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.transaction(async (tx) => {
      const row = await tx.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
      if (!row) throw new Error("Dossier introuvable.");
      const pieces = row.pieces.map((p, i) => (i === data.index ? { ...p, fourni: !p.fourni } : p));
      await tx.update(dossiersTable).set({ pieces }).where(eq(dossiersTable.id, data.id));
    });
  });

export const avancerEtape = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(32), direction: z.enum(["avancer", "reculer"]) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const { etape, avant } = await db.transaction(async (tx) => {
      const row = await tx.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
      if (!row) throw new Error("Dossier introuvable.");
      const etape =
        data.direction === "avancer" ? Math.min(5, row.etape + 1) : Math.max(1, row.etape - 1);
      await tx.update(dossiersTable).set({ etape }).where(eq(dossiersTable.id, data.id));
      return { etape, avant: row.etape };
    });
    if (etape === 5 && avant !== 5)
      await logActivity("dossier.cloture", `Dossier ${data.id} clôturé (dépôt).`, data.id);
  });

export const setEtape = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(32), etape: z.number().min(1).max(5) }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.update(dossiersTable).set({ etape: data.etape }).where(eq(dossiersTable.id, data.id));
    if (data.etape === 5)
      await logActivity("dossier.cloture", `Dossier ${data.id} clôturé (dépôt).`, data.id);
  });

/** Le centre de dépôt visé par le client (Eiden ne prend pas le rendez-vous). */
export const changerCentre = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1).max(32),
      centre: z.enum(["TLScontact Agadir", "BLS Espagne Agadir"]),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    await db
      .update(dossiersTable)
      .set({ centre: data.centre })
      .where(eq(dossiersTable.id, data.id));
  });

/** Autorise (ou bloque) le téléversement de documents sur un dossier — CEO ou Réception. */
export const setUploadAutorisation = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(32), autorise: z.boolean() }))
  .handler(async ({ data }) => {
    await requireCeoOrReception();
    await db
      .update(dossiersTable)
      .set({ uploadAutorise: data.autorise })
      .where(eq(dossiersTable.id, data.id));
    await logActivity(
      "dossier.autorisation",
      data.autorise ? "Téléversement de documents autorisé." : "Téléversement de documents bloqué.",
      data.id,
    );
  });

/** L'argent ne transite que par les rôles qui encaissent : CEO, Réception, Back office. */
export const encaisser = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(32), index: z.number().int().min(0) }))
  .handler(async ({ data }) => {
    await requireRoles("ceo", "reception", "back_office");
    const ligne = await db.transaction(async (tx) => {
      const row = await tx.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
      if (!row) throw new Error("Dossier introuvable.");
      const paiements = row.paiements.map((p, i) =>
        i === data.index ? { ...p, encaisse: true, date: p.date ?? "aujourd'hui" } : p,
      );
      await tx.update(dossiersTable).set({ paiements }).where(eq(dossiersTable.id, data.id));
      return row.paiements[data.index] ?? null;
    });
    if (ligne)
      await logActivity(
        "paiement.encaissement",
        `${ligne.montant} MAD encaissés (${ligne.libelle})`,
        data.id,
      );
  });

export const changerPack = createServerFn({ method: "POST" })
  .validator(
    z.object({ id: z.string().min(1).max(32), pack: z.enum(["base", "voyage", "global"]) }),
  )
  .handler(async ({ data }) => {
    await requireRoles("ceo", "reception", "back_office");
    await db.transaction(async (tx) => {
      const row = await tx.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
      if (!row) throw new Error("Dossier introuvable.");
      // On régénère l'échéancier (acompte + solde, ou solde comptant) selon le nouveau pack
      // et la modalité en cours : les lignes déjà encaissées et les options à la carte sont
      // conservées telles quelles, seules les lignes dues sont recalculées.
      const paiements = reglerEcheancier(row.paiements, data.pack, row.modalitePaiement);
      await tx
        .update(dossiersTable)
        .set({ pack: data.pack, paiements })
        .where(eq(dossiersTable.id, data.id));
    });
    await logActivity("paiement.pack", `Pack changé -> ${PACKS[data.pack].label}`, data.id);
  });

/** Le client choisit de régler comptant ou par acompte de 50 % — régénère l'échéancier dû. */
export const setModalitePaiement = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(32), modalite: z.enum(["comptant", "acompte"]) }))
  .handler(async ({ data }) => {
    await requireRoles("ceo", "reception", "back_office");
    await db.transaction(async (tx) => {
      const row = await tx.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
      if (!row) throw new Error("Dossier introuvable.");
      const paiements = reglerEcheancier(row.paiements, row.pack, data.modalite);
      await tx
        .update(dossiersTable)
        .set({ modalitePaiement: data.modalite, paiements })
        .where(eq(dossiersTable.id, data.id));
    });
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
      where d.etape >= 4
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
  .validator(
    z.object({
      id: z.string().min(1).max(32),
      decision: z.enum(["en_attente", "approuve", "refuse"]),
      motif: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireRoles("ceo", "back_office");
    const decisionDate =
      data.decision === "en_attente" ? null : new Date().toLocaleDateString("fr-FR");
    // Le motif n'a de sens que sur un refus : on le purge dans les autres cas plutôt que
    // de laisser traîner le motif d'un refus précédent sur un dossier redevenu approuvé.
    const decisionMotif = data.decision === "refuse" ? data.motif?.trim() || null : null;
    await db
      .update(dossiersTable)
      .set({ decision: data.decision, decisionDate, decisionMotif })
      .where(eq(dossiersTable.id, data.id));
    if (data.decision !== "en_attente") {
      await logActivity(
        "dossier.decision",
        data.decision === "approuve"
          ? "Visa approuvé par le consulat."
          : `Visa refusé par le consulat.${decisionMotif ? ` Motif : ${decisionMotif}` : ""}`,
        data.id,
      );
    }
  });

/**
 * Déclare (ou annule) un jalon fait hors de l'application. La date de déclaration est
 * posée par le serveur : c'est une trace, pas une saisie que l'on peut antidater.
 */
export const setJalon = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1).max(32),
      jalon: z.enum(["recu", "france_visas", "rdv"]),
      fait: z.boolean(),
      reference: z.string().max(120).optional(),
      date: z.string().max(32).optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    // Date brute refusée si elle n'est pas un ISO jour : la colonne rdv_date pilote
    // l'affichage et ne doit pas accueillir de texte libre.
    const rdvDate =
      data.fait && data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : null;
    const horodatage = data.fait ? new Date().toLocaleDateString("fr-FR") : null;

    if (data.jalon === "recu") {
      await db
        .update(dossiersTable)
        .set({ recuRemis: data.fait, recuLe: horodatage })
        .where(eq(dossiersTable.id, data.id));
      await logActivity(
        "dossier.recu",
        data.fait ? "Reçu remis au client" : "Remise du reçu annulée",
        data.id,
      );
      return;
    }

    if (data.jalon === "france_visas") {
      await db
        .update(dossiersTable)
        .set({
          franceVisasFait: data.fait,
          franceVisasRef: data.fait ? data.reference?.trim() || null : null,
          franceVisasLe: horodatage,
        })
        .where(eq(dossiersTable.id, data.id));
      await logActivity(
        "dossier.france_visas",
        data.fait
          ? `Dossier créé sur France-Visas${data.reference?.trim() ? ` (réf. ${data.reference.trim()})` : ""}`
          : "Création France-Visas annulée",
        data.id,
      );
      return;
    }

    await db
      .update(dossiersTable)
      .set({
        rdvPris: data.fait,
        rdvDate,
        rdvLe: horodatage,
      })
      .where(eq(dossiersTable.id, data.id));
    await logActivity(
      "dossier.rdv",
      data.fait
        ? `Rendez-vous pris au centre${data.date ? ` pour le ${new Date(data.date).toLocaleDateString("fr-FR")}` : ""}`
        : "Prise de rendez-vous annulée",
      data.id,
    );
  });

/**
 * Ajoute une note d'équipe. L'auteur et la date viennent du serveur : une note dont on
 * pourrait changer la signature ou l'horodatage ne vaudrait rien comme trace.
 */
export const ajouterNote = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), texte: z.string().min(1).max(2000) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const [row, auteur] = await Promise.all([
      db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) }),
      db.query.users.findFirst({ where: eq(users.id, userId) }),
    ]);
    if (!row) throw new Error("Dossier introuvable.");
    const note = {
      texte: data.texte.trim(),
      auteur: auteur?.nom ?? "Agent",
      date: new Date().toLocaleString("fr-FR"),
    };
    // Les plus récentes en tête : c'est ce qu'on veut lire en ouvrant le dossier.
    await db.transaction(async (tx) => {
      const frais = await tx.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
      if (!frais) throw new Error("Dossier introuvable.");
      await tx
        .update(dossiersTable)
        .set({ notesAgent: [note, ...frais.notesAgent] })
        .where(eq(dossiersTable.id, data.id));
    });
    await logActivity("dossier.note", `Note ajoutée : ${note.texte.slice(0, 120)}`, data.id);
  });

export const supprimerNote = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(32), index: z.number().int().min(0) }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.transaction(async (tx) => {
      const row = await tx.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
      if (!row) throw new Error("Dossier introuvable.");
      const restantes = row.notesAgent.filter((_, i) => i !== data.index);
      await tx
        .update(dossiersTable)
        .set({ notesAgent: restantes })
        .where(eq(dossiersTable.id, data.id));
    });
    await logActivity("dossier.note_suppression", "Note d'équipe supprimée", data.id);
  });

export const updateClient = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1).max(32),
      client: clientInput,
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
        clientVoyageDebut: data.client.voyageDebut,
        clientVoyageFin: data.client.voyageFin,
        clientPasseportNumero: data.client.passeportNumero,
        clientPasseportDelivrance: data.client.passeportDelivrance,
        clientPasseportExpiration: data.client.passeportExpiration,
        clientPasseportLieu: data.client.passeportLieu,
      })
      .where(eq(dossiersTable.id, data.id));
  });

/** Corrige l'origine du client (site / direct) — p.ex. une case cochée par erreur à la création. */
export const updateOrigine = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(32), origine: z.enum(["site", "direct"]) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    if (row.profile.origine === data.origine) return;
    await db
      .update(dossiersTable)
      .set({ profile: { ...row.profile, origine: data.origine } })
      .where(eq(dossiersTable.id, data.id));
    await logActivity(
      "dossier.origine",
      `Origine du client corrigée : ${data.origine === "site" ? "site (landing)" : "directement chez nous"} (${data.id})`,
      data.id,
    );
  });

/** Corrige les réponses saisies pendant la qualification (nom de l'hôtel, etc.). Seules les
 * clés connues de l'arbre sont acceptées : on ne laisse pas écrire n'importe quoi dans le profil. */
export const updateDetails = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1).max(32),
      details: z
        .record(z.string(), z.string().max(500))
        .refine((v) => Object.keys(v).length <= 100, "Trop de détails."),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    const inconnues = Object.keys(data.details).filter((k) => !(k in TREE_FIELDS));
    if (inconnues.length) throw new Error("Champ inconnu dans les informations du dossier.");
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    const avant = row.profile.details ?? {};
    const modifies = Object.keys(data.details).filter(
      (k) => (data.details[k] ?? "").trim() !== (avant[k] ?? "").trim(),
    );
    if (!modifies.length) return;
    const details = { ...avant };
    for (const k of modifies) details[k] = (data.details[k] ?? "").trim();
    await db
      .update(dossiersTable)
      .set({ profile: { ...row.profile, details } })
      .where(eq(dossiersTable.id, data.id));
    await logActivity(
      "dossier.details",
      `Informations de qualification corrigées (${modifies.length} champ${modifies.length > 1 ? "s" : ""}) (${data.id})`,
      data.id,
    );
  });

export const deleteDossier = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(32) }))
  .handler(async ({ data }) => {
    // Destruction + cascade documents : CEO uniquement, avec trace.
    await requireCeo();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    await db.delete(dossiersTable).where(eq(dossiersTable.id, data.id));
    await logActivity(
      "dossier.suppression",
      `Dossier supprimé : ${row.clientNom} (${data.id})`,
      data.id,
    );
  });
