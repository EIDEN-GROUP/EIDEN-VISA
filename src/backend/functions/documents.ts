import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { db } from "@/backend/db/client";
import { documents as documentsTable } from "@/backend/db/schema";
import { requireUserId } from "@/backend/functions/auth";

const documentType = z.enum(["france_tls", "espagne_bls"]);

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
      filename: z.string().min(1),
      mimeType: z.string().min(1),
      dataBase64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    await requireUserId();
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
