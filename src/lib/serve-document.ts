// Sert les PDF (TLScontact/BLS) directement en binaire, en dehors du protocole RPC
// des server functions — celui-ci sérialise en JSON et ne convient pas à des fichiers.
// Interceptée dans src/server.ts, avant le routeur TanStack Start.
//
// SECURITÉ : ces documents contiennent des données personnelles sensibles. Le téléchargement
// est donc réservé aux utilisateurs connectés, comme le reste du back-office.

import { requestHandler } from "@tanstack/react-start/server";
import { getAuthSession } from "@/backend/auth";

const DOCUMENT_PATH = /^\/documents\/([a-f0-9-]{36})$/;

// getAuthSession()/useSession lisent un contexte de requête que TanStack Start ne remplit
// qu'à l'intérieur de son propre handler (`@tanstack/react-start/server-entry`). serveDocument
// est appelé dans src/server.ts AVANT ce handler : on enveloppe donc le corps authentifié dans
// requestHandler() pour obtenir ce contexte, puis on refuse en 401 tout appel sans session.
// Sans ce garde, n'importe qui connaissant l'UUID d'un document pourrait télécharger le PDF.
const serveDocumentAuthenticated = requestHandler(async (request: Request): Promise<Response> => {
  const session = await getAuthSession();
  if (!session.data.userId) {
    return new Response("Non autorisé — veuillez vous connecter.", {
      status: 401,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  const url = new URL(request.url);
  const match = DOCUMENT_PATH.exec(url.pathname);
  const id = match![1]!;

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
});

export async function serveDocument(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!DOCUMENT_PATH.test(url.pathname)) return null;
  if (request.method !== "GET") return null;
  return serveDocumentAuthenticated(request, {});
}
