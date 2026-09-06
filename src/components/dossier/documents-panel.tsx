import { useRef, useState } from "react";
import { useDocuments, type DocumentType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2 } from "lucide-react";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo : largement suffisant pour un PDF de dossier scanné

const SLOTS: { type: DocumentType; label: string }[] = [
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

export function DocumentsPanel({ dossierId }: { dossierId: string }) {
  const { documents, upload, supprimer } = useDocuments(dossierId);
  const [error, setError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const inputRefs = useRef<Record<DocumentType, HTMLInputElement | null>>({
    france_tls: null,
    espagne_bls: null,
  });

  async function handleFile(type: DocumentType, file: File | undefined) {
    setError(null);
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Seuls les fichiers PDF sont acceptés.");
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

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-[var(--stop)]">{error}</p>}
      {SLOTS.map((slot) => {
        const docs = documents.filter((doc) => doc.type === slot.type);
        return (
          <div key={slot.type}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{slot.label}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={uploadingType === slot.type}
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
                  void handleFile(slot.type, e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
            <div className="mt-2 space-y-1.5">
              {docs.length === 0 && <p className="text-xs text-muted-foreground">Aucun PDF déposé.</p>}
              {docs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <a
                    href={`/documents/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
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
    </div>
  );
}
