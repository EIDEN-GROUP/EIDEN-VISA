import { pgTable, text, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import type {
  Piece,
  Paiement,
  Centre,
  PackKey,
  Modalite,
  QualificationReponse,
} from "@/lib/dossier-model";
import type { Level, Profile } from "@/lib/visa-rules";

export type Role = "ceo" | "reception" | "preparation" | "back_office";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nom: text("nom").notNull(),
  role: text("role").$type<Role>().notNull().default("reception"),
  /** Photo de profil, image encodée en data URL base64 (comme les documents). Nullable. */
  photoBase64: text("photo_base64"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Notifications personnelles — surtout les assignations de dossier. Lues/non lues. */
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<"assignation" | "info">().notNull().default("assignation"),
  message: text("message").notNull(),
  dossierId: text("dossier_id"),
  /** Lien externe optionnel (ex. la page TLScontact/BLS surveillée) — bouton « Voir » dans la cloche. */
  url: text("url"),
  /** Qui a déclenché la notification (affichage : « par X »). */
  acteurNom: text("acteur_nom"),
  readAt: timestamp("read_at", { withTimezone: true }),
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
  // Dates de séjour envisagées, saisies à la qualification (ISO AAAA-MM-JJ). Nullables :
  // le client ne les connaît pas toujours au moment de l'ouverture du dossier.
  clientVoyageDebut: text("client_voyage_debut"),
  clientVoyageFin: text("client_voyage_fin"),
  // Passeport — saisi quand la pièce passe entre les mains de l'agence, d'où le nullable.
  clientPasseportNumero: text("client_passeport_numero"),
  clientPasseportDelivrance: text("client_passeport_delivrance"),
  clientPasseportExpiration: text("client_passeport_expiration"),
  clientPasseportLieu: text("client_passeport_lieu"),
  agent: text("agent").notNull(),
  // Le compte réel qui a ouvert le dossier — permet un filtre "Mes dossiers" fiable,
  // contrairement à `agent` qui n'est qu'un texte d'affichage (nom + rôle au moment de la création).
  agentUserId: text("agent_user_id").references(() => users.id, { onDelete: "set null" }),
  // À qui le dossier est actuellement confié (peut différer de celui qui l'a ouvert).
  // Nul = non assigné. Toute (ré)assignation notifie la personne concernée.
  assigneeUserId: text("assignee_user_id").references(() => users.id, { onDelete: "set null" }),
  ouvertLe: text("ouvert_le").notNull(),
  caseKey: text("case_key").notNull(),
  profile: jsonb("profile").$type<Profile>().notNull().default({}),
  // Le fil questions/réponses de la Boussole, figé au moment de l'ouverture du dossier :
  // c'est la trace de ce qui a été demandé À CE client, indépendante de l'arbre actuel
  // (qui, lui, évolue). Vide pour les dossiers antérieurs.
  qualification: jsonb("qualification").$type<QualificationReponse[]>().notNull().default([]),
  titre: text("titre").notNull(),
  categorie: text("categorie").notNull(),
  niveau: text("niveau").$type<Level>().notNull(),
  pack: text("pack").$type<PackKey>().notNull().default("base"),
  modalitePaiement: text("modalite_paiement").$type<Modalite>().notNull().default("comptant"),
  etape: integer("etape").notNull().default(1),
  // Centre de dépôt visé par le client (France/TLScontact ou Espagne/BLS). Eiden ne prend
  // pas le rendez-vous : c'est juste l'orientation du dossier. Colonne DB : `rdv_centre` (historique).
  centre: text("rdv_centre").$type<Centre>().notNull(),
  // Le service ne peut téléverser des documents qu'une fois le dossier autorisé (CEO/Réception).
  uploadAutorise: boolean("upload_autorise").notNull().default(false),
  pieces: jsonb("pieces").$type<Piece[]>().notNull().default([]),
  paiements: jsonb("paiements").$type<Paiement[]>().notNull().default([]),
  notes: jsonb("notes").$type<string[]>().notNull().default([]),
  // Étape 6 du parcours : la décision du consulat, hors du contrôle
  // d'Eiden mais à suivre — c'est le vrai "après" du cycle, pas juste un dossier gelé.
  decision: text("decision")
    .$type<"en_attente" | "approuve" | "refuse">()
    .notNull()
    .default("en_attente"),
  decisionDate: text("decision_date"),
  // Jalons faits hors de l'app (portail France-Visas, centre de dépôt) : l'agent les déclare,
  // la référence saisie tient lieu de preuve.
  franceVisasFait: boolean("france_visas_fait").notNull().default(false),
  franceVisasRef: text("france_visas_ref"),
  franceVisasLe: text("france_visas_le"),
  rdvPris: boolean("rdv_pris").notNull().default(false),
  rdvDate: text("rdv_date"),
  rdvLe: text("rdv_le"),
  /** Motif du refus communiqué par le consulat — null si approuvé ou en attente. */
  decisionMotif: text("decision_motif"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Surveillance de disponibilité RDV (TLScontact/BLS ou tout autre site public) —
 * ajoutée dynamiquement depuis l'écran dédié, jamais codée en dur. Un script externe
 * (Python) relit cette table, va vérifier chaque `url`, et compare au `lastSnapshotHash`
 * pour détecter un changement (créneau apparu) sans jamais automatiser la réservation
 * elle-même — voir scripts/rdv_watcher.py.
 */
export const rdvWatches = pgTable("rdv_watches", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  url: text("url").notNull(),
  dossierId: text("dossier_id").references(() => dossiers.id, { onDelete: "set null" }),
  actif: boolean("actif").notNull().default(true),
  intervalSeconds: integer("interval_seconds").notNull().default(300),
  lastSnapshotHash: text("last_snapshot_hash"),
  lastStatus: text("last_status"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdByUserId: text("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/** Pièces jointes d'un dossier — PDF France/TLScontact, Espagne/BLS, ou tout autre fichier. */
export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  dossierId: text("dossier_id")
    .notNull()
    .references(() => dossiers.id, { onDelete: "cascade" }),
  type: text("type").$type<"france_tls" | "espagne_bls" | "autre">().notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  // Stocké en base64 : volumes modestes (PDF de dossier), évite de gérer un type bytea dédié.
  dataBase64: text("data_base64").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});
