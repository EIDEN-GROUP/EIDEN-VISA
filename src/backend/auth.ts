import { createServerOnlyFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

export interface AuthSessionData {
  userId: string;
  /** Version de session au moment de la connexion (voir users.sessionVersion). */
  v?: number;
}

export const getAuthSession = createServerOnlyFn(() => {
  const secret = process.env["SESSION_PASSWORD"];
  if (!secret) {
    throw new Error("SESSION_PASSWORD manquant : copie .env.example vers .env.");
  }
  // Un secret court se devine ou se casse : le cookie chiffré ne vaut que son secret.
  if (secret.length < 32) {
    throw new Error("SESSION_PASSWORD trop court (≥ 32 caractères) : régénère-le.");
  }
  return useSession<AuthSessionData>({
    password: secret,
    name: "eidenvisa_session",
    maxAge: 60 * 60 * 24 * 7, // 7 jours : assez long pour la semaine de travail, assez court pour borner un vol
    // Pas de TLS tant que l'app n'est pas déployée derrière HTTPS : un cookie Secure
    // sur du HTTP simple est silencieusement rejeté par le navigateur (hors localhost),
    // ce qui bloquait la connexion. À repasser à `true` une fois derrière HTTPS.
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env["NODE_ENV"] === "production",
      path: "/",
    },
  });
});
