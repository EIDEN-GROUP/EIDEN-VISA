import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { users } from "@/backend/db/schema";
import { requireUserId } from "@/backend/functions/auth";
import { fetchUserProfile, logActivity } from "@/backend/functions/ops";
import { getAuthSession } from "@/backend/auth";

const MAX_PHOTO_BYTES = 1_500_000;

/** Avatars acceptés : JPEG/PNG/WebP uniquement. Le SVG embarque du contenu actif
 * (`<script>`, `<foreignObject>`) et n'a rien à faire en photo de profil. */
const PHOTO_MIME = /^data:image\/(jpeg|png|webp);base64,/;

/** Le profil de l'utilisateur connecté — sa propre fiche, accessible depuis le rail. */
export const getMyProfile = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  const u = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!u) throw new Error("Compte introuvable.");
  const profil = await fetchUserProfile(userId);
  return {
    user: {
      id: u.id,
      nom: u.nom,
      email: u.email,
      role: u.role,
      photoBase64: u.photoBase64,
      createdAt: u.createdAt,
    },
    ...profil,
  };
});

export const updateMyName = createServerFn({ method: "POST" })
  .validator(z.object({ nom: z.string().min(1).max(120) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await db.update(users).set({ nom: data.nom }).where(eq(users.id, userId));
    await logActivity("profil.nom", `Nom mis à jour : ${data.nom}`);
  });

export const setMyPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ photoBase64: z.string().nullable() }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    if (data.photoBase64) {
      if (!PHOTO_MIME.test(data.photoBase64))
        throw new Error("Seules les images JPEG, PNG ou WebP sont acceptées.");
      if (data.photoBase64.length > MAX_PHOTO_BYTES)
        throw new Error("Image trop lourde (max ~1 Mo).");
    }
    await db.update(users).set({ photoBase64: data.photoBase64 }).where(eq(users.id, userId));
    await logActivity(
      "profil.photo",
      data.photoBase64 ? "Photo de profil mise à jour." : "Photo retirée.",
    );
  });

/** Changement de mot de passe en libre-service : l'ancien mot de passe doit être fourni.
 * Invalide les autres sessions (vol de cookie) via sessionVersion. */
export const changeMyPassword = createServerFn({ method: "POST" })
  .validator(z.object({ actuel: z.string().min(1).max(200), nouveau: z.string().min(12).max(200) }))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const u = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!u) throw new Error("Compte introuvable.");
    const ok = await bcrypt.compare(data.actuel, u.passwordHash);
    if (!ok) throw new Error("Mot de passe actuel incorrect.");
    const passwordHash = await bcrypt.hash(data.nouveau, 12);
    await db
      .update(users)
      .set({ passwordHash, sessionVersion: u.sessionVersion + 1 })
      .where(eq(users.id, userId));
    // Cet appareil reste connecté (les autres sessions sont révoquées).
    const session = await getAuthSession();
    await session.update({ userId, v: u.sessionVersion + 1 });
    await logActivity("profil.motdepasse", "Mot de passe changé par l'utilisateur.");
  });
