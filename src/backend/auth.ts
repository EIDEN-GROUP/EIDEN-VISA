import { createServerOnlyFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";

export interface AuthSessionData {
  userId: string;
}

export const getAuthSession = createServerOnlyFn(() => {
  if (!process.env["SESSION_PASSWORD"]) {
    throw new Error("SESSION_PASSWORD manquant : copie .env.example vers .env.");
  }
  return useSession<AuthSessionData>({
    password: process.env["SESSION_PASSWORD"],
    name: "eidenvisa_session",
    maxAge: 60 * 60 * 24 * 30, // 30 jours : poste de travail partagé, pas de reconnexion quotidienne
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
