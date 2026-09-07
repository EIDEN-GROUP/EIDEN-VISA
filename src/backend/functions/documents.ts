import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { documents as documentsTable } from "@/backend/db/schema";
import { requireUserId } from "@/backend/functions/auth";

const documentType = z.enum(["france_tls", "espagne_bls", "autre"]);

/** Borne serveur alignée sur le panneau d'upload (10 Mo) — ne jamais faire confiance au file.type du client. */
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

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
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("Le fichier n'est pas un PDF valide.");
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
      dossierId: z.string(),
      type: documentType,
      // Nom/nom proposé, la validation réelle du contenu se fait dans le handler.
      filename: z.string().min(1),
      mimeType: z.string().min(1),
      dataBase64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
    // Garde serveur : le panneau client n'est pas une sécurité. Les deux emplacements
    // consulaires (France/TLS, Espagne/BLS) exigent un vrai PDF ; "autre" accepte n'importe
    // quel type de fichier, seule la taille est vérifiée.
    if (data.type === "autre") {
      validateAnyUpload(data.dataBase64);
    } else {
      if (data.mimeType !== "application/pdf") throw new Error("Seuls les fichiers PDF sont acceptés ici.");
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
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    await requireUserId();
    await db.delete(documentsTable).where(eq(documentsTable.id, data.id));
  });
