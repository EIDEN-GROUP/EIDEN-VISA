import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { rdvWatches } from "@/backend/db/schema";
import { requireUserId } from "@/backend/functions/auth";
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

export const createWatch = createServerFn({ method: "POST" })
  .validator(
    z.object({
      label: z.string().min(1).max(140),
      url: z.string().url(),
      dossierId: z.string().optional(),
      intervalSeconds: z.number().int().min(60).max(3600).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const userId = await requireUserId();
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
  .validator(z.object({ id: z.string(), actif: z.boolean() }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.update(rdvWatches).set({ actif: data.actif }).where(eq(rdvWatches.id, data.id));
  });

export const deleteWatch = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.delete(rdvWatches).where(eq(rdvWatches.id, data.id));
    await logActivity("rdv_watch.suppression", `Surveillance RDV supprimée : ${data.id}`);
  });
