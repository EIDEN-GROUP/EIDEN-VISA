import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import type { Piece, Paiement, RendezVous, PackKey } from "@/lib/dossier-model";
import type { Level, Profile } from "@/lib/visa-rules";

export type Role = "ceo" | "reception" | "preparation" | "back_office";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nom: text("nom").notNull(),
  role: text("role").$type<Role>().notNull().default("reception"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Journal d'activité — qui a fait quoi, pour l'écran /ops du CEO. */
export const activityLog = pgTable("activity_log", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  detail: text("detail").notNull(),
  dossierId: text("dossier_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dossiers = pgTable("dossiers", {
  id: text("id").primaryKey(),
  clientNom: text("client_nom").notNull(),
  clientTelephone: text("client_telephone").notNull(),
  clientVille: text("client_ville").notNull(),
  clientNaissance: text("client_naissance").notNull(),
  agent: text("agent").notNull(),
  ouvertLe: text("ouvert_le").notNull(),
  caseKey: text("case_key").notNull(),
  profile: jsonb("profile").$type<Profile>().notNull().default({}),
  titre: text("titre").notNull(),
  categorie: text("categorie").notNull(),
  niveau: text("niveau").$type<Level>().notNull(),
  pack: text("pack").$type<PackKey>().notNull().default("base"),
  etape: integer("etape").notNull().default(1),
  rdvCentre: text("rdv_centre").notNull(),
  rdvDate: text("rdv_date"),
  rdvHeure: text("rdv_heure"),
  rdvStatut: text("rdv_statut").$type<RendezVous["statut"]>().notNull().default("recherche"),
  pieces: jsonb("pieces").$type<Piece[]>().notNull().default([]),
  paiements: jsonb("paiements").$type<Paiement[]>().notNull().default([]),
  notes: jsonb("notes").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/** Type de dossier consulaire suivant le centre de dépôt : France/TLScontact ou Espagne/BLS. */
export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  dossierId: text("dossier_id")
    .notNull()
    .references(() => dossiers.id, { onDelete: "cascade" }),
  type: text("type").$type<"france_tls" | "espagne_bls">().notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  // Stocké en base64 : volumes modestes (PDF de dossier), évite de gérer un type bytea dédié.
  dataBase64: text("data_base64").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Veille des créneaux TLS/BLS — saisie manuelle par le back-office, pas une donnée automatique. */
export const creneaux = pgTable("creneaux", {
  id: text("id").primaryKey(),
  centre: text("centre").notNull(),
  date: text("date").notNull(),
  places: integer("places").notNull().default(0),
  statut: text("statut").$type<"libre" | "reserve" | "ferme">().notNull().default("libre"),
  dossierId: text("dossier_id").references(() => dossiers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
