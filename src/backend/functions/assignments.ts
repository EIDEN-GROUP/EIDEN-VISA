import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { users, dossiers, notifications } from "@/backend/db/schema";
import { requireUserId } from "@/backend/functions/auth";
import { logActivity } from "@/backend/functions/ops";

/** Liste légère (id, nom, rôle) pour le sélecteur d'assignation — accessible à tout le personnel. */
export const listAssignableUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireUserId();
  return db
    .select({ id: users.id, nom: users.nom, role: users.role })
    .from(users)
    .orderBy(users.nom);
});

export const assignDossier = createServerFn({ method: "POST" })
  .validator(
    z.object({
      dossierId: z.string(),
      assigneeUserId: z.string(),
      note: z.string().max(280).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const actorId = await requireUserId();
    const [actor, assignee, dossier] = await Promise.all([
      db.query.users.findFirst({ where: eq(users.id, actorId) }),
      db.query.users.findFirst({ where: eq(users.id, data.assigneeUserId) }),
      db.query.dossiers.findFirst({ where: eq(dossiers.id, data.dossierId) }),
    ]);
    if (!assignee) throw new Error("Utilisateur assigné introuvable.");
    if (!dossier) throw new Error("Dossier introuvable.");

    await db
      .update(dossiers)
      .set({ assigneeUserId: data.assigneeUserId })
      .where(eq(dossiers.id, data.dossierId));

    // Pas de notification pour une auto-assignation.
    if (data.assigneeUserId !== actorId) {
      const base = `Le dossier ${dossier.id} (${dossier.clientNom}) vous a été assigné`;
      await db.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: data.assigneeUserId,
        type: "assignation",
        message: data.note ? `${base} : ${data.note}` : `${base}.`,
        dossierId: dossier.id,
        acteurNom: actor?.nom ?? null,
      });
    }

    await logActivity(
      "dossier.assignation",
      `Dossier ${dossier.id} assigné à ${assignee.nom}${data.note ? ` — ${data.note}` : ""}`,
      dossier.id,
    );
  });

export const unassignDossier = createServerFn({ method: "POST" })
  .validator(z.object({ dossierId: z.string() }))
  .handler(async ({ data }) => {
    await requireUserId();
    const dossier = await db.query.dossiers.findFirst({ where: eq(dossiers.id, data.dossierId) });
    if (!dossier) throw new Error("Dossier introuvable.");
    await db.update(dossiers).set({ assigneeUserId: null }).where(eq(dossiers.id, data.dossierId));
    await logActivity("dossier.desassignation", `Dossier ${dossier.id} désassigné`, dossier.id);
  });

/** Notifications de l'utilisateur connecté + compteur non-lus. */
export const listMyNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  const [items, [count]] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(30),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt))),
  ]);
  return {
    items: items.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      dossierId: n.dossierId,
      url: n.url,
      acteurNom: n.acteurNom,
      read: n.readAt !== null,
      createdAt: n.createdAt,
    })),
    unread: Number(count?.n ?? 0),
  };
});

export const markNotificationsRead = createServerFn({ method: "POST" })
  .validator(z.object({ ids: z.array(z.string()).optional() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const where =
      data.ids && data.ids.length
        ? and(eq(notifications.userId, userId), inArray(notifications.id, data.ids))
        : and(eq(notifications.userId, userId), isNull(notifications.readAt));
    await db.update(notifications).set({ readAt: new Date() }).where(where);
  });
