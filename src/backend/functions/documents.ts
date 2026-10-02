import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { documents as documentsTable, dossiers as dossiersTable } from "@/backend/db/schema";
import { requireUserId, requireRoles } from "@/backend/functions/auth";

const documentType = z.enum(["france_tls", "espagne_bls", "autre"]);

/** Borne serveur alignée sur le panneau d'upload (10 Mo) — ne jamais faire confiance au file.type du client. */
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
/** Base64 ≈ +33 % : borne d'entrée pour refuser les corps absurdes avant décodage. */
const MAX_BASE64_CHARS = 15_000_000;

/** Types actifs (HTML/SVG/JS/XML) : jamais stockés — ils s'exécuteraient à l'ouverture. */
const ACTIVE_MIME =
  /^(text\/html|application\/xhtml\+xml|image\/svg\+xml|.*javascript.*|.*ecmascript.*|text\/xml|application\/xsl\+xml)$/i;

function decodeBase64(dataBase64: string): Buffer {
  if (!/^[\w+/=]+$/.test(dataBase64)) throw new Error("Fichier invalide (encodage base64).");
  try {
    return Buffer.from(dataBase64, "base64");
  } catch {
    throw new Error("Fichier invalide (encodage base64).");
  }
}

function validatePdfUpload(dataBase64: string): void {
  const bytes = decodeBase64(dataBase64);
  if (bytes.length === 0) throw new Error("Fichier vide.");
  if (bytes.length > MAX_SIZE_BYTES) throw new Error("Fichier trop volumineux (max 10 Mo).");
  // Un vrai PDF commence par l'en-tête ASCII "%PDF-". On vérifie le contenu, pas seulement
  // l'extension : un fichier renommé en .pdf mais qui n'est pas un PDF est refusé.
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-")
    throw new Error("Le fichier n'est pas un PDF valide.");
}

/** "Autres documents" : n'importe quel type de fichier (photo, scan, tableur...) — seule la
 * taille est contrôlée, pas le contenu, puisqu'il n'y a pas de format attendu unique. */
function validateAnyUpload(dataBase64: string): void {
  const bytes = decodeBase64(dataBase64);
  if (bytes.length === 0) throw new Error("Fichier vide.");
  if (bytes.length > MAX_SIZE_BYTES) throw new Error("Fichier trop volumineux (max 10 Mo).");
}

export const listDocuments = createServerFn({ method: "GET" })
  .validator(z.object({ dossierId: z.string() }))
  .handler(async ({ data }) => {
    await requireUserId();
    const rows = await db
      .select({
        id: documentsTable.id,
        type: documentsTable.type,
        filename: documentsTable.filename,
        mimeType: documentsTable.mimeType,
        uploadedAt: documentsTable.uploadedAt,
      })
      .from(documentsTable)
      .where(eq(documentsTable.dossierId, data.dossierId))
      .orderBy(desc(documentsTable.uploadedAt));
    return rows;
  });

export const uploadDocument = createServerFn({ method: "POST" })
  .validator(
    z.object({
      dossierId: z.string().min(1).max(64),
      type: documentType,
      // Nom/nom proposé, la validation réelle du contenu se fait dans le handler.
      filename: z.string().min(1).max(120),
      mimeType: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[-+\w.]+\/[-+\w.]+$/, "Type MIME invalide."),
      dataBase64: z.string().min(1).max(MAX_BASE64_CHARS),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();

    // Garde d'autorisation : le service ne peut téléverser que sur un dossier autorisé
    // (CEO ou Réception le débloque). Le bouton désactivé côté client n'est pas une sécurité.
    const dossier = await db.query.dossiers.findFirst({
      where: eq(dossiersTable.id, data.dossierId),
    });
    if (!dossier) throw new Error("Dossier introuvable.");
    if (!dossier.uploadAutorise)
      throw new Error(
        "Ce dossier n'est pas autorisé au téléversement de documents — un responsable doit d'abord l'autoriser.",
      );

    // Garde de contenu : les deux emplacements consulaires (France/TLS, Espagne/BLS) exigent
    // un vrai PDF ; "autre" accepte tout type de fichier SAUF le contenu actif (HTML/SVG/JS),
    // qui s'exécuterait dans le navigateur à l'ouverture (XSS stocké, voir serve-document.ts).
    if (ACTIVE_MIME.test(data.mimeType))
      throw new Error("Ce type de fichier n'est pas accepté (contenu actif).");
    if (data.type === "autre") {
      validateAnyUpload(data.dataBase64);
    } else {
      if (data.mimeType !== "application/pdf")
        throw new Error("Seuls les fichiers PDF sont acceptés ici.");
      validatePdfUpload(data.dataBase64);
    }

    const id = crypto.randomUUID();
    await db.insert(documentsTable).values({
      id,
      dossierId: data.dossierId,
      type: data.type,
      filename: data.filename,
      mimeType: data.mimeType,
      dataBase64: data.dataBase64,
    });
    return { id };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1).max(64) }))
  .handler(async ({ data }) => {
    // Destruction : CEO ou Réception, sur un dossier existant (pas d'id orphelin).
    await requireRoles("ceo", "reception");
    const doc = await db.query.documents.findFirst({
      where: eq(documentsTable.id, data.id),
    });
    if (!doc) throw new Error("Document introuvable.");
    const dossier = await db.query.dossiers.findFirst({
      where: eq(dossiersTable.id, doc.dossierId),
    });
    if (!dossier) throw new Error("Dossier introuvable.");
    await db.delete(documentsTable).where(eq(documentsTable.id, data.id));
  });
