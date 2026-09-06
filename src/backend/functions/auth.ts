import { createServerFn } from "@tanstack/react-start";
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
  return { id: user.id, nom: user.nom, email: user.email };
});

// Vérification désactivée en même temps que le guard sur /_app (voir _app.tsx) :
// tant que le login n'est pas remis en service, on laisse passer sans session.
export async function requireUserId() {
  const session = await getAuthSession();
  return session.data.userId ?? "user-accueil";
}
