import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { dossiers as dossiersTable } from "@/backend/db/schema";
import { requireUserId } from "@/backend/functions/auth";
import { logActivity } from "@/backend/functions/ops";
import { PACKS, type Dossier, type PackKey } from "@/lib/dossier-model";
import type { Profile } from "@/lib/visa-rules";

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
    ouvertLe: row.ouvertLe,
    caseKey: row.caseKey,
    profile: row.profile,
    titre: row.titre,
    categorie: row.categorie,
    niveau: row.niveau,
    pack: row.pack,
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
  };
}

export const listDossiers = createServerFn({ method: "GET" }).handler(async () => {
  await requireUserId();
  const rows = await db.select().from(dossiersTable).orderBy(desc(dossiersTable.createdAt));
  return rows.map(rowToDossier);
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
  client: z.object({ nom: z.string(), telephone: z.string(), ville: z.string(), naissance: z.string() }),
  agent: z.string(),
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
    prof: z.enum(["salarie", "commercant", "agriculteur", "retraite", "etudiant", "sans"]).optional(),
  }),
  titre: z.string(),
  categorie: z.string(),
  niveau: z.enum(["standard", "attention", "complexe"]),
  pack: z.enum(["base", "voyage", "global"]),
  etape: z.number(),
  rdv: z.object({
    centre: z.string(),
    date: z.string().nullable(),
    heure: z.string().nullable(),
    statut: z.enum(["recherche", "confirme", "depose"]),
  }),
  pieces: z.array(z.object({ label: z.string(), source: z.enum(["officiel", "eiden"]), fourni: z.boolean() })),
  paiements: z.array(
    z.object({ libelle: z.string(), montant: z.number(), date: z.string().nullable(), encaisse: z.boolean() }),
  ),
  notes: z.array(z.string()),
});

export const createDossier = createServerFn({ method: "POST" })
  .validator(dossierInput)
  .handler(async ({ data }) => {
    await requireUserId();
    await db.insert(dossiersTable).values({
      id: data.id,
      clientNom: data.client.nom,
      clientTelephone: data.client.telephone,
      clientVille: data.client.ville,
      clientNaissance: data.client.naissance,
      agent: data.agent,
      ouvertLe: data.ouvertLe,
      caseKey: data.caseKey,
      profile: data.profile as Profile,
      titre: data.titre,
      categorie: data.categorie,
      niveau: data.niveau,
      pack: data.pack as PackKey,
      etape: data.etape,
      rdvCentre: data.rdv.centre,
      rdvDate: data.rdv.date,
      rdvHeure: data.rdv.heure,
      rdvStatut: data.rdv.statut,
      pieces: data.pieces,
      paiements: data.paiements,
      notes: data.notes,
    });
    await logActivity("dossier.creation", `Dossier créé pour ${data.client.nom} (${data.titre})`, data.id);
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
    if (etape === 7 && row.etape !== 7) await logActivity("dossier.cloture", `Dossier ${data.id} clôturé (dépôt).`, data.id);
  });

export const setEtape = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), etape: z.number().min(1).max(7) }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.update(dossiersTable).set({ etape: data.etape }).where(eq(dossiersTable.id, data.id));
    if (data.etape === 7) await logActivity("dossier.cloture", `Dossier ${data.id} clôturé (dépôt).`, data.id);
  });

export const changerCentre = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), centre: z.enum(["TLScontact Agadir", "TLScontact Casablanca", "BLS Espagne Agadir"]) }))
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
    if (p) await logActivity("paiement.encaissement", `${p.montant} MAD encaissés (${p.libelle})`, data.id);
  });

export const changerPack = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), pack: z.enum(["base", "voyage", "global"]) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.dossiers.findFirst({ where: eq(dossiersTable.id, data.id) });
    if (!row) throw new Error("Dossier introuvable.");
    const packInfo = PACKS[data.pack];
    // Le paiement du solde suit le pack choisi tant qu'il n'a pas déjà été encaissé —
    // sinon changer de pack laisse un montant dû qui ne correspond plus au pack affiché.
    // Si le dossier n'a encore aucun paiement (créé avant cette règle, ou vidé manuellement),
    // on en crée un plutôt que de laisser le dossier invisible sur l'écran Paiements.
    const paiements =
      row.paiements.length === 0
        ? [{ libelle: packInfo.label, montant: packInfo.prix, date: null, encaisse: false }]
        : row.paiements.map((p, i) =>
            i === 0 && !p.encaisse ? { ...p, libelle: packInfo.label, montant: packInfo.prix } : p,
          );
    await db.update(dossiersTable).set({ pack: data.pack, paiements }).where(eq(dossiersTable.id, data.id));
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
    await logActivity("dossier.suppression", `Dossier supprimé : ${row.clientNom} (${data.id})`, data.id);
  });
