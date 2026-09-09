import "dotenv/config";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/backend/db/schema";
import { buildSeed } from "../src/lib/seed";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL manquant.");
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD manquants dans .env.");
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client, { schema });

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await db
    .insert(schema.users)
    .values({
      id: "user-accueil",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      nom: "Accueil Eiden Visa",
    })
    .onConflictDoNothing({ target: schema.users.email });

  const existing = await db.select({ id: schema.dossiers.id }).from(schema.dossiers);
  if (existing.length === 0) {
    const seedDossiers = buildSeed();
    for (const d of seedDossiers) {
      await db.insert(schema.dossiers).values({
        id: d.id,
        clientNom: d.client.nom,
        clientTelephone: d.client.telephone,
        clientVille: d.client.ville,
        clientNaissance: d.client.naissance,
        agent: d.agent,
        ouvertLe: d.ouvertLe,
        caseKey: d.caseKey,
        profile: d.profile,
        titre: d.titre,
        categorie: d.categorie,
        niveau: d.niveau,
        pack: d.pack,
        modalitePaiement: d.modalitePaiement,
        etape: d.etape,
        rdvCentre: d.rdv.centre,
        rdvDate: d.rdv.date,
        rdvHeure: d.rdv.heure,
        rdvStatut: d.rdv.statut,
        pieces: d.pieces,
        paiements: d.paiements,
        notes: d.notes,
      });
    }
    console.log(`${seedDossiers.length} dossier(s) de démonstration insérés.`);
  } else {
    console.log(`${existing.length} dossier(s) déjà en base, seed des dossiers ignoré.`);
  }

  console.log(`Utilisateur back-office : ${process.env.ADMIN_EMAIL}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
