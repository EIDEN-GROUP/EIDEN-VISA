import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { users, type Role } from "@/backend/db/schema";
import { getAuthSession } from "@/backend/auth";

/** Comparaison bidon à coût constant quand l'email n'existe pas : sans elle, un
 * attaquant distingue « email inconnu » (réponse immédiate) de « mot de passe
 * incorrect » (bcrypt ~250 ms) et énumère les comptes. */
const DUMMY_HASH = "$2b$12$lamUuQ5DBDZkDTe3msVlROPsQ/zGmhs8RiQJ8ur5zHo6u28QMx96.";

/** Frein anti-bourrinage en mémoire (par email) : 5 échecs / 10 min → blocage 5 min.
 * Best-effort sur hébergement serverless (instances éphémères) : ne remplace pas un
 * limiteur persistant, mais casse les sprays basiques sur instance longue. */
const MAX_ECHECS = 5;
const FENETRE_MS = 10 * 60_000;
const BLOCAGE_MS = 5 * 60_000;
const echecs = new Map<string, { count: number; premier: number; bloqueJusqua: number }>();

function echecLogin(email: string): void {
  const cle = email.toLowerCase();
  const maintenant = Date.now();
  // Balayage anti-fuite mémoire : au-delà de 2000 entrées, on purge les expirées.
  if (echecs.size > 2000) {
    for (const [k, v] of echecs) {
      if (maintenant - v.premier > FENETRE_MS && maintenant > v.bloqueJusqua) echecs.delete(k);
    }
  }
  const e = echecs.get(cle);
  if (!e || maintenant - e.premier > FENETRE_MS) {
    echecs.set(cle, { count: 1, premier: maintenant, bloqueJusqua: 0 });
    return;
  }
  e.count += 1;
  if (e.count >= MAX_ECHECS) e.bloqueJusqua = maintenant + BLOCAGE_MS;
}

export const login = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email().max(160), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const bloque = echecs.get(data.email.toLowerCase());
    if (bloque && Date.now() < bloque.bloqueJusqua)
      throw new Error("Trop de tentatives — réessayez dans quelques minutes.");
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email.toLowerCase()),
    });
    // Même coût bcrypt que le cas réel pour ne pas révéler l'existence du compte.
    const valid = user
      ? await bcrypt.compare(data.password, user.passwordHash)
      : await bcrypt.compare(data.password, DUMMY_HASH).then(() => false);
    if (!user || !valid) {
      echecLogin(data.email);
      throw new Error("Identifiants incorrects.");
    }
    echecs.delete(data.email.toLowerCase());

    const session = await getAuthSession();
    await session.update({ userId: user.id, v: user.sessionVersion });
    return { id: user.id, nom: user.nom, email: user.email, role: user.role };
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
  // Session révoquée (mot de passe changé ailleurs) → traité comme déconnecté.
  if (typeof session.data.v === "number" && user.sessionVersion !== session.data.v) return null;
  return { id: user.id, nom: user.nom, email: user.email, role: user.role };
});

/** Échoue fermé : sans session valide, aucune mutation métier ne doit s'exécuter.
 * Le garde de route sur /_app (voir _app.tsx) empêche déjà d'atteindre ce point sans
 * être connecté — ceci est la deuxième ligne de défense, côté serveur.
 * Vérifie aussi la version de session : un changement de mot de passe incrémente
 * `sessionVersion` et invalide les cookies volés (voir changeMyPassword/resetUserPassword). */
export const requireUserId = createServerOnlyFn(async () => {
  const session = await getAuthSession();
  const userId = session.data.userId;
  if (!userId) throw new Error("Non authentifié — veuillez vous reconnecter.");
  if (typeof session.data.v === "number") {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || user.sessionVersion !== session.data.v)
      throw new Error("Session révoquée — veuillez vous reconnecter.");
  }
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

/** Autorisations « front » : CEO ou Réception. Sert p.ex. à autoriser l'upload d'un dossier. */
export const requireCeoOrReception = createServerOnlyFn(async () => {
  const userId = await requireUserId();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || (user.role !== "ceo" && user.role !== "reception"))
    throw new Error("Action réservée au CEO ou à la Réception.");
  return user;
});

/** Matrice des rôles : les mutations sensibles exigent l'un des rôles listés.
 * Tout le personnel connecté partage le quotidien (étapes, pièces, jalons, notes) ;
 * l'argent, la décision et la destruction sont réservées (voir README §7). */
export function requireRoles(...roles: Role[]) {
  return createServerOnlyFn(async () => {
    const userId = await requireUserId();
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!user || !roles.includes(user.role)) throw new Error("Action réservée à un autre rôle.");
    return user;
  })();
}
