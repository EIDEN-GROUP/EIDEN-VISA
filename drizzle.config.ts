import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL manquant : copie .env.example vers .env et renseigne-le.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/backend/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
