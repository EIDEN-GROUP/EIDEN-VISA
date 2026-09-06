// Sert les PDF (TLScontact/BLS) directement en binaire, en dehors du protocole RPC
// des server functions — celui-ci sérialise en JSON et ne convient pas à des fichiers.
// Interceptée dans src/server.ts, avant le routeur TanStack Start.

const DOCUMENT_PATH = /^\/documents\/([a-f0-9-]{36})$/;

export async function serveDocument(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const match = DOCUMENT_PATH.exec(url.pathname);
  if (!match || request.method !== "GET") return null;

  const id = match[1]!;
  const { db } = await import("@/backend/db/client");
  const { documents } = await import("@/backend/db/schema");
  const { eq } = await import("drizzle-orm");

  const row = await db.query.documents.findFirst({ where: eq(documents.id, id) });
  if (!row) return new Response("Document introuvable.", { status: 404 });

  const bytes = Buffer.from(row.dataBase64, "base64");
  return new Response(bytes, {
    headers: {
      "content-type": row.mimeType,
      "content-disposition": `inline; filename="${row.filename.replace(/"/g, "")}"`,
      "content-length": String(bytes.length),
      "cache-control": "private, no-store",
    },
  });
}
