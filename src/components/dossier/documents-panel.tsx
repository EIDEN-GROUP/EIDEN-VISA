import { useRef, useState } from "react";
import { useDocuments, type DocumentType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, Lock } from "lucide-react";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo par fichier

const PDF_SLOTS: { type: DocumentType; label: string }[] = [
  { type: "france_tls", label: "France · TLScontact" },
  { type: "espagne_bls", label: "Espagne · BLS" },
];

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function DocumentsPanel({
  dossierId,
  authorized,
}: {
  dossierId: string;
  authorized: boolean;
}) {
  const { documents, upload, supprimer } = useDocuments(dossierId);
  const [error, setError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const inputRefs = useRef<Record<DocumentType, HTMLInputElement | null>>({
    france_tls: null,
    espagne_bls: null,
    autre: null,
  });

  async function handlePdfFile(type: DocumentType, file: File | undefined) {
    setError(null);
    if (!authorized) return;
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés ici.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError("Fichier trop volumineux (max 10 Mo).");
      return;
    }
    setUploadingType(type);
    try {
      const dataBase64 = await readAsBase64(file);
      await upload({ type, filename: file.name, mimeType: file.type, dataBase64 });
    } finally {
      setUploadingType(null);
    }
  }

  // "Autres documents" : n'importe quel type et plusieurs fichiers à la fois — pensé pour
  // ne jamais perdre une pièce (photo prise au comptoir, scan, tableur...) faute d'emplacement dédié.
  async function handleAnyFiles(files: FileList | null) {
    setError(null);
    if (!authorized) return;
    if (!files || files.length === 0) return;
    setUploadingType("autre");
    try {
      for (const file of Array.from(files)) {
        if (file.size > MAX_SIZE_BYTES) {
          setError(`"${file.name}" dépasse 10 Mo — non envoyé.`);
          continue;
        }
        const dataBase64 = await readAsBase64(file);
        await upload({
          type: "autre",
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          dataBase64,
        });
      }
    } finally {
      setUploadingType(null);
    }
  }

  const autres = documents.filter((doc) => doc.type === "autre");

  return (
    <div className="space-y-4">
      {!authorized && (
        <p className="flex items-start gap-1.5 rounded-lg bg-[var(--warn-soft)] px-3 py-2 text-xs text-[var(--warn)]">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
          Téléversement bloqué : ce dossier n'est pas autorisé. Un responsable (CEO ou Réception)
          doit l'autoriser. Les documents déjà déposés restent consultables.
        </p>
      )}
      {error && <p className="text-xs text-[var(--stop)]">{error}</p>}
      {PDF_SLOTS.map((slot) => {
        const docs = documents.filter((doc) => doc.type === slot.type);
        return (
          <div key={slot.type}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {slot.label}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!authorized || uploadingType === slot.type}
                onClick={() => inputRefs.current[slot.type]?.click()}
              >
                <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
                {uploadingType === slot.type ? "Envoi…" : "Ajouter un PDF"}
              </Button>
              <input
                ref={(el) => {
                  inputRefs.current[slot.type] = el;
                }}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  void handlePdfFile(slot.type, e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="mt-2 space-y-1.5">
              {docs.length === 0 && (
                <p className="text-xs text-muted-foreground">Aucun PDF déposé.</p>
              )}
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <a
                    href={`/documents/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary hover:underline"
                  >
                    <FileText
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      strokeWidth={1.5}
                    />
                    {doc.filename}
                  </a>
                  <button
                    onClick={() => supprimer(doc.id)}
                    className="text-muted-foreground hover:text-[var(--stop)]"
                    aria-label="Supprimer le document"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Autres documents
            </span>
            <p className="text-xs text-muted-foreground">
              Tout type de fichier — pour ne jamais perdre une pièce.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!authorized || uploadingType === "autre"}
            onClick={() => inputRefs.current.autre?.click()}
          >
            <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
            {uploadingType === "autre" ? "Envoi…" : "Ajouter des fichiers"}
          </Button>
          <input
            ref={(el) => {
              inputRefs.current.autre = el;
            }}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleAnyFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <div className="mt-2 space-y-1.5">
          {autres.length === 0 && (
            <p className="text-xs text-muted-foreground">Aucun fichier déposé.</p>
          )}
          {autres.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <a
                href={`/documents/${doc.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-foreground hover:text-primary hover:underline"
              >
                <FileText
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                />
                {doc.filename}
              </a>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => supprimer(doc.id)}
                  className="text-muted-foreground hover:text-[var(--stop)]"
                  aria-label="Supprimer le document"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
