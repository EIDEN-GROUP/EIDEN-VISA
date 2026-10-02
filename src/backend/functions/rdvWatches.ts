import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { desc, eq, count as sqlCount } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { dossiers as dossiersTable, rdvWatches } from "@/backend/db/schema";
import { requireCeo, requireUserId } from "@/backend/functions/auth";
import { logActivity } from "@/backend/functions/ops";

/**
 * CRUD pour la surveillance de disponibilité RDV (TLScontact/BLS...). Une URL ajoutée ici
 * est reprise dynamiquement par le script externe scripts/rdv_watcher.py — rien n'est codé
 * en dur côté script, tout part de cette table. Le script ne fait que LIRE la page publique
 * et écrire son propre résultat (hash, statut) ; il ne réserve jamais rien à la place du client.
 */

export const listWatches = createServerFn({ method: "GET" }).handler(async () => {
  await requireUserId();
  return db.select().from(rdvWatches).orderBy(desc(rdvWatches.createdAt));
});

/** L'URL est relue côté serveur par scripts/rdv_watcher.py : on refuse tout ce qui
 * ressemble à de l'intranet (SSRF) — le démon revérifie après résolution DNS
 * (rebinding), mais la première barrière est ici. */
function urlSurveillance(val: string): boolean {
  let h: string;
  try {
    const u = new URL(val);
    if (u.protocol !== "https:") return false;
    h = u.hostname.toLowerCase();
  } catch {
    return false;
  }
  if (h === "localhost" || h === "metadata.google.internal") return false;
  if (
    /^127\./.test(h) ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^169\.254\./.test(h) ||
    h === "::1" ||
    h.startsWith("[::")
  )
    return false;
  const prive172 = h.match(/^172\.(\d+)\./);
  if (prive172 && +prive172[1]! >= 16 && +prive172[1]! <= 31) return false;
  // Pas de TLD = intranet ou service local (.local, .internal, nom court...).
  if (!h.includes(".")) return false;
  if (h.endsWith(".local") || h.endsWith(".internal") || h.endsWith(".lan")) return false;
  return true;
}

/** Quota anti-abus : le démon relit chaque surveillance active, N lignes = N requêtes. */
const MAX_WATCHES_PAR_UTILISATEUR = 20;

export const createWatch = createServerFn({ method: "POST" })
  .validator(
    z.object({
      label: z.string().min(1).max(140),
      url: z
        .string()
        .url()
        .max(2000)
        .refine(urlSurveillance, "URL non autorisée (HTTPS public uniquement)."),
      dossierId: z.string().max(64).optional(),
      intervalSeconds: z.number().int().min(60).max(3600).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    if (data.dossierId) {
      const dossier = await db.query.dossiers.findFirst({
        where: eq(dossiersTable.id, data.dossierId),
      });
      if (!dossier) throw new Error("Dossier introuvable.");
    }
    const lignes = await db
      .select({ n: sqlCount() })
      .from(rdvWatches)
      .where(eq(rdvWatches.createdByUserId, userId));
    if (Number(lignes[0]?.n ?? 0) >= MAX_WATCHES_PAR_UTILISATEUR)
      throw new Error("Quota de surveillances atteint (20).");
    const id = crypto.randomUUID();
    await db.insert(rdvWatches).values({
      id,
      label: data.label,
      url: data.url,
      dossierId: data.dossierId ?? null,
      intervalSeconds: data.intervalSeconds ?? 300,
      createdByUserId: userId,
    });
    await logActivity("rdv_watch.creation", `Surveillance RDV créée : ${data.label} (${data.url})`);
    return { id };
  });

export const toggleWatch = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(64), actif: z.boolean() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const watch = await db.query.rdvWatches.findFirst({ where: eq(rdvWatches.id, data.id) });
    if (!watch) throw new Error("Surveillance introuvable.");
    // Propriétaire ou CEO : on ne coupe pas la surveillance d'un collègue.
    if (watch.createdByUserId !== userId) await requireCeo();
    await db.update(rdvWatches).set({ actif: data.actif }).where(eq(rdvWatches.id, data.id));
  });

export const deleteWatch = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const watch = await db.query.rdvWatches.findFirst({ where: eq(rdvWatches.id, data.id) });
    if (!watch) throw new Error("Surveillance introuvable.");
    if (watch.createdByUserId !== userId) await requireCeo();
    await db.delete(rdvWatches).where(eq(rdvWatches.id, data.id));
    await logActivity("rdv_watch.suppression", `Surveillance RDV supprimée : ${data.id}`);
  });
