import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { users } from "@/backend/db/schema";
import { getAuthSession } from "@/backend/auth";

export const login = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = await db.query.users.findFirst({ where: eq(users.email, data.email.toLowerCase()) });
    if (!user) throw new Error("Identifiants incorrects.");
    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) throw new Error("Identifiants incorrects.");

    const session = await getAuthSession();
    await session.update({ userId: user.id });
    return { id: user.id, nom: user.nom, email: user.email };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAuthSession();
  await session.clear();
});

export const currentUser = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuthSession();
  const userId = session.data.userId;
  if (!userId) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;
  return { id: user.id, nom: user.nom, email: user.email, role: user.role };
});

/** Échoue fermé : sans session valide, aucune mutation métier ne doit s'exécuter.
 * Le garde de route sur /_app (voir _app.tsx) empêche déjà d'atteindre ce point sans
 * être connecté — ceci est la deuxième ligne de défense, côté serveur. */
export const requireUserId = createServerOnlyFn(async () => {
  const session = await getAuthSession();
  const userId = session.data.userId;
  if (!userId) throw new Error("Non authentifié — veuillez vous reconnecter.");
  return userId;
});

/** Réservé aux actions d'administration (comptes, rôles) : vérifie le rôle du VRAI
 * utilisateur connecté, pas une identité choisie côté client.
 * `createServerOnlyFn` est indispensable ici, comme pour `logActivity` dans ops.ts :
 * une fonction plain qui touche `db` et est importée (même indirectement) depuis une
 * page client (login.tsx importe `currentUser` de ce même fichier) entraîne tout le
 * module — bcrypt/postgres compris — dans le bundle navigateur (incident déjà vu). */
export const requireCeo = createServerOnlyFn(async () => {
  const userId = await requireUserId();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || user.role !== "ceo") throw new Error("Accès réservé au CEO.");
  return user;
});
