import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/backend/db/client";
import {
  dossiers as dossiersTable,
  recuBrouillons as brouillonsTable,
  users,
} from "@/backend/db/schema";
import { requireUserId, requireCeo, requireRoles } from "@/backend/functions/auth";
import { logActivity } from "@/backend/functions/ops";
import { rowToDossier } from "@/backend/functions/dossiers";
import { recuEcartLedger, type RecuDonnees } from "@/lib/dossier-model";

const recuLigneSchema = z.object({
  libelle: z.string().min(1).max(160),
  montant: z.number().int().min(0).max(10_000_000),
  date: z.string().max(32).nullable(),
  encaisse: z.boolean(),
});

const recuPieceSchema = z.object({
  label: z.string().min(1).max(200),
  source: z.enum(["officiel", "eiden"]),
  fourni: z.boolean(),
  masque: z.boolean().optional(),
});

/** Bornes alignées sur l'éditeur : jamais un montant ou un texte client brut. */
export const recuDonneesSchema = z.object({
  mode: z.enum(["avant", "apres"]),
  clientNom: z.string().min(1).max(120),
  clientTelephone: z.string().min(1).max(120),
  clientVille: z.string().min(1).max(120),
  dossierTitre: z.string().min(1).max(160),
  pays: z.string().min(1).max(80),
  afficherPieces: z.boolean(),
  pieces: recuPieceSchema.array().max(200),
  lignes: recuLigneSchema.array().max(50),
  afficherReste: z.boolean(),
  signature: z.string().min(1).max(120),
  mentionAccord: z.string().min(1).max(300),
  note: z.string().min(1).max(2000),
  emisLe: z.string().min(1).max(32),
});

export interface BrouillonRecu {
  id: string;
  dossierId: string;
  nom: string;
  donnees: RecuDonnees;
  ecartLedger: boolean;
  auteur: string | null;
  createdAt: Date;
}

function toBrouillon(
  row: typeof brouillonsTable.$inferSelect,
  auteur: string | null,
): BrouillonRecu {
  return {
    id: row.id,
    dossierId: row.dossierId,
    nom: row.nom,
    donnees: row.donnees,
    ecartLedger: row.ecartLedger,
    auteur,
    createdAt: row.createdAt,
  };
}

/** Brouillons enregistrés d'un dossier, plus récents en tête (lecture : tout rôle connecté). */
export const listBrouillons = createServerFn({ method: "GET" })
  .validator(z.object({ dossierId: z.string().min(1).max(32) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const rows = await db
      .select({ brouillon: brouillonsTable, auteurNom: users.nom })
      .from(brouillonsTable)
      .leftJoin(users, eq(brouillonsTable.createdByUserId, users.id))
      .where(eq(brouillonsTable.dossierId, data.dossierId))
      .orderBy(desc(brouillonsTable.createdAt));
    return rows.map((r) => toBrouillon(r.brouillon, r.auteurNom));
  });

export const getBrouillon = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    await requireUserId();
    const row = await db.query.recuBrouillons.findFirst({
      where: eq(brouillonsTable.id, data.id),
    });
    if (!row) return null;
    const auteur = row.createdByUserId
      ? ((await db.query.users.findFirst({ where: eq(users.id, row.createdByUserId) }))?.nom ??
        null)
      : null;
    return toBrouillon(row, auteur);
  });

/**
 * Enregistre un instantané de brouillon. Les totaux sont recalculés à
 * l'affichage ; l'écart au grand livre est tranché ici, côté serveur, et stocké
 * avec le snapshot (le client ne peut pas le masquer).
 * Rôles qui encaissent : CEO, Réception, Back office (même matrice que `encaisser`).
 */
export const saveBrouillon = createServerFn({ method: "POST" })
  .validator(
    z.object({
      dossierId: z.string().min(1).max(32),
      nom: z.string().min(1).max(80),
      donnees: recuDonneesSchema,
    }),
  )
  .handler(async ({ data }) => {
    const auteur = await requireRoles("ceo", "reception", "back_office");
    const dossierRow = await db.query.dossiers.findFirst({
      where: eq(dossiersTable.id, data.dossierId),
    });
    if (!dossierRow) throw new Error("Dossier introuvable.");
    const ecartLedger = recuEcartLedger(rowToDossier(dossierRow), data.donnees);
    const id = crypto.randomUUID();
    await db.insert(brouillonsTable).values({
      id,
      dossierId: data.dossierId,
      nom: data.nom.trim(),
      donnees: data.donnees,
      ecartLedger,
      createdByUserId: auteur.id,
    });
    await logActivity(
      "recu.brouillon_enregistre",
      `Brouillon de reçu « ${data.nom.trim()} » enregistré${ecartLedger ? " (montants modifiés)" : ""}.`,
      data.dossierId,
    );
    return { id };
  });

/** Destruction d'un brouillon : CEO uniquement, avec trace (comme les documents). */
export const deleteBrouillon = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    await requireCeo();
    const row = await db.query.recuBrouillons.findFirst({
      where: eq(brouillonsTable.id, data.id),
    });
    if (!row) throw new Error("Brouillon introuvable.");
    await db.delete(brouillonsTable).where(eq(brouillonsTable.id, data.id));
    await logActivity(
      "recu.brouillon_suppression",
      `Brouillon de reçu « ${row.nom} » supprimé.`,
      row.dossierId,
    );
  });
