import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env['DATABASE_URL']) {
  throw new Error("DATABASE_URL manquant : copie .env.example vers .env et démarre `docker compose up -d`.");
}

const queryClient = postgres(process.env['DATABASE_URL']);
export const db = drizzle(queryClient, { schema });
