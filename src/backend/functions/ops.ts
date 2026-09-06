import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq, desc } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { users, activityLog } from "@/backend/db/schema";
import { getAuthSession } from "@/backend/auth";

const roleEnum = z.enum(["ceo", "reception", "preparation", "back_office"]);

/**
 * Écrit une ligne d'activité — appelé depuis les mutations métier (dossiers, paiements...).
 * `createServerOnlyFn` est indispensable ici : cette fonction n'est PAS un createServerFn
 * (pas d'appel RPC direct depuis le client), donc sans ce garde le compilateur ne sait pas
 * qu'il faut l'exclure du bundle client — elle entraînerait bcrypt/postgres avec elle
 * (cf. l'incident dotenv/config : même catégorie de fuite serveur -> client).
 */
export const logActivity = createServerOnlyFn(async (action: string, detail: string, dossierId?: string) => {
  const session = await getAuthSession();
  await db.insert(activityLog).values({
    id: crypto.randomUUID(),
    userId: session.data.userId ?? null,
    action,
    detail,
    dossierId: dossierId ?? null,
  });
});

export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  return db
    .select({ id: users.id, email: users.email, nom: users.nom, role: users.role, createdAt: users.createdAt })
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
    await db.update(users).set({ role: data.role }).where(eq(users.id, data.id));
    await logActivity("utilisateur.role", `Rôle changé -> ${data.role} pour l'utilisateur ${data.id}`);
  });

export const deleteUser = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await db.delete(users).where(eq(users.id, data.id));
    await logActivity("utilisateur.suppression", `Compte supprimé : ${data.id}`);
  });

export const listActivity = createServerFn({ method: "GET" }).handler(async () => {
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

/** Pas un vrai login : juste "qui es-tu" pour attribuer les actions, le login réel est désactivé. */
export const setActingUser = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const session = await getAuthSession();
    await session.update({ userId: data.userId });
  });

export const getActingUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  const userId = session.data.userId;
  if (!userId) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;
  return { id: user.id, nom: user.nom, role: user.role };
});
