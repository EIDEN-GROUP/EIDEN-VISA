import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env["DATABASE_URL"]) {
  throw new Error(
    "DATABASE_URL manquant : copie .env.example vers .env et démarre `docker compose up -d`.",
  );
}

// `prepare: false` : la base passe par le pooler Supabase en mode transaction (port 6543),
// qui ne garde pas les prepared statements nommés d'une requête à l'autre. Sans ça, dès
// qu'un écran lance plusieurs requêtes en parallèle (ex. l'analytique /ops), certaines
// échouent avec « prepared statement already exists / does not exist ».
const queryClient = postgres(process.env["DATABASE_URL"], { prepare: false });
export const db = drizzle(queryClient, { schema });
