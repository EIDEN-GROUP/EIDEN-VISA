import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import {
  useUser,
  useUserProfile,
  useOpsUsers,
  useCurrentUser,
  ROLE_LABEL,
  type Role,
} from "@/lib/store";
import { ETAPES, DECISION_LABEL } from "@/lib/dossier-model";
import { LEVEL_LABEL, type Level } from "@/lib/visa-rules";
import { exportOpsPdf } from "@/lib/ops-pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Camera,
  Download,
  FileText,
  KeyRound,
  Pencil,
  Trash2,
  Wallet2,
  X,
} from "lucide-react";

const ROLES = (Object.keys(ROLE_LABEL) as Role[]).map((value) => ({
  value,
  label: ROLE_LABEL[value],
}));

/** Réduit une image à 400 px de côté max et l'encode en JPEG base64 — l'avatar reste léger. */
function downscaleImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Fichier image invalide."));
      img.onload = () => {
        const max = 400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponible."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function UserProfile({ id, onBack }: { id: string; onBack: () => void }) {
  const { user, isLoading, modifier, changerPhoto, reinitialiserMotDePasse } = useUser(id);
  const { data: profil } = useUserProfile(id);
  const { changerRole, supprimer } = useOpsUsers();
  const { user: me } = useCurrentUser();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editNom, setEditNom] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  if (!user) {
    return (
      <div>
        <BackLink onBack={onBack} />
        <p className="mt-6 text-sm text-muted-foreground">
          {isLoading ? "Chargement de la fiche…" : "Compte introuvable."}
        </p>
      </div>
    );
  }

  const isSelf = me?.id === user.id;
  const roleSteps = ETAPES.filter((e) => e.role === ROLE_LABEL[user.role]);
  const k = profil?.kpis;

  const etapeData = (profil?.parEtape ?? []).map((r) => {
    const e = ETAPES.find((x) => String(x.n) === r.k);
    return { name: e ? `${e.n}` : r.k, label: e?.label ?? r.k, n: r.n };
  });

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoError(null);
    setBusy(true);
    try {
      const dataUrl = await downscaleImage(file);
      await changerPhoto(dataUrl);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setBusy(false);
    }
  }

  function openEdit() {
    setEditNom(user!.nom);
    setEditEmail(user!.email);
    setEditOpen(true);
  }

  async function saveEdit() {
    setBusy(true);
    try {
      await modifier({ nom: editNom.trim(), email: editEmail.trim() });
      setEditOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function savePw() {
    setBusy(true);
    try {
      await reinitialiserMotDePasse(newPw);
      setNewPw("");
      setPwOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      await supprimer(user!.id);
      onBack();
    } finally {
      setBusy(false);
    }
  }

  function exportFiche() {
    if (!profil) return;
    void exportOpsPdf({
      title: `Fiche agent · ${user!.nom}`,
      filename: `fiche-${user!.nom.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      intro: `${ROLE_LABEL[user!.role]} · ${user!.email} · compte créé le ${new Date(user!.createdAt).toLocaleDateString("fr-FR")}.`,
      kpis: [
        { label: "Dossiers", value: `${profil.kpis.dossiers}` },
        { label: "Actifs", value: `${profil.kpis.actifs}` },
        {
          label: "Taux d'approbation",
          value: profil.kpis.tauxApprobation === null ? "—" : `${profil.kpis.tauxApprobation} %`,
        },
        { label: "Encaissé", value: `${profil.kpis.encaisse.toLocaleString("fr-FR")} MAD` },
        { label: "Pièces rassemblées", value: `${profil.kpis.documents}` },
      ],
      sections: [
        {
          heading: `Dossiers (${profil.dossiers.length})`,
          empty: "Aucun dossier ouvert par cet agent.",
          columns: [
            { header: "Client", w: 3 },
            { header: "Dossier", w: 3 },
            { header: "Type", w: 4 },
            { header: "Niveau", w: 2 },
            { header: "Étape", w: 1, align: "right" },
          ],
          rows: profil.dossiers.map((d) => [
            d.nom,
            d.id,
            d.titre,
            LEVEL_LABEL[d.niveau as Level] ?? d.niveau,
            `${d.etape}`,
          ]),
        },
        {
          heading: `Pièces rassemblées (${profil.documents.length})`,
          empty: "Aucune pièce déposée sur ses dossiers.",
          columns: [
            { header: "Fichier", w: 4 },
            { header: "Client", w: 3 },
            { header: "Dossier", w: 3 },
            { header: "Déposé le", w: 2 },
          ],
          rows: profil.documents.map((d) => [
            d.filename,
            d.clientNom,
            d.dossierId,
            new Date(d.uploadedAt).toLocaleDateString("fr-FR"),
          ]),
        },
        {
          heading: `Encaissements (${profil.encaissements.length})`,
          empty: "Aucun encaissement à son actif.",
          columns: [
            { header: "Date", w: 3 },
            { header: "Détail", w: 6 },
            { header: "Dossier", w: 2 },
          ],
          rows: profil.encaissements.map((enc) => [
            new Date(enc.createdAt).toLocaleString("fr-FR"),
            enc.detail,
            enc.dossierId ?? "—",
          ]),
        },
      ],
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <BackLink onBack={onBack} />
        <Button size="sm" variant="outline" onClick={exportFiche} disabled={!profil}>
          <Download className="h-3.5 w-3.5" /> Fiche agent (PDF)
        </Button>
      </div>

      {/* En-tête */}
      <Card className="panel mb-6">
        <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start">
          <div className="relative shrink-0 self-center sm:self-start">
            <Avatar nom={user.nom} photo={user.photoBase64} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="absolute -bottom-1 -right-1 rounded-full border border-border bg-card p-1.5 text-muted-foreground shadow-sm hover:text-foreground"
              aria-label="Changer la photo"
            >
              <Camera className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickPhoto} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="page-title truncate">{user.nom}</h1>
              <button
                onClick={openEdit}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Modifier"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
            {user.photoBase64 && (
              <button
                onClick={() => changerPhoto(null)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--stop)]"
              >
                <X className="h-3 w-3" /> Retirer la photo
              </button>
            )}
            {photoError && <p className="mt-1 text-xs text-[var(--stop)]">{photoError}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Select value={user.role} onValueChange={(v) => changerRole(user.id, v as Role)}>
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" onClick={() => setPwOpen(true)}>
                <KeyRound className="h-3.5 w-3.5" /> Mot de passe
              </Button>
              {!isSelf && (
                <Button size="sm" variant="outline" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-3.5 w-3.5" /> Supprimer
                </Button>
              )}
            </div>

            {roleSteps.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Responsable de&nbsp;:</span>{" "}
                {roleSteps.map((e) => `${e.n}. ${e.label}`).join(" · ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-5">
        <Kpi
          label="Dossiers"
          value={k ? `${k.dossiers}` : "—"}
          hint={k ? `${k.actifs} actifs` : undefined}
        />
        <Kpi
          label="Taux d'approbation"
          value={k?.tauxApprobation == null ? "—" : `${k.tauxApprobation} %`}
          hint={k ? `${k.approuve} ✓ · ${k.refuse} ✗` : undefined}
        />
        <Kpi
          label="Encaissé"
          value={k ? `${k.encaisse.toLocaleString("fr-FR")} MAD` : "—"}
          hint={k ? `${k.nEncaissements} opération(s)` : undefined}
        />
        <Kpi label="Pièces rassemblées" value={k ? `${k.documents}` : "—"} />
        <Kpi
          label="Niveau dominant"
          value={
            profil?.parNiveau?.length
              ? (LEVEL_LABEL[[...profil.parNiveau].sort((a, b) => b.n - a.n)[0]!.k as Level] ?? "—")
              : "—"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ses dossiers par étape</CardTitle>
          </CardHeader>
          <CardContent>
            {etapeData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Aucun dossier.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={etapeData} margin={{ left: 4, right: 8 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    allowDecimals={false}
                    width={24}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    stroke="var(--border)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    cursor={{ fill: "var(--muted)" }}
                    formatter={(v: number, _n, p) => [`${v} dossier(s)`, p.payload.label]}
                  />
                  <Bar dataKey="n" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={26}>
                    <LabelList
                      dataKey="n"
                      position="top"
                      fill="var(--muted-foreground)"
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <ListCard
          title={`Dossiers (${profil?.dossiers.length ?? 0})`}
          empty="Aucun dossier ouvert."
        >
          {(profil?.dossiers ?? []).map((d) => (
            <Link
              key={d.id}
              to="/dossiers/$id"
              params={{ id: d.id }}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-accent/40"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{d.nom}</div>
                <div className="ref text-muted-foreground">
                  {d.id} · {LEVEL_LABEL[d.niveau as Level] ?? d.niveau} · étape {d.etape}
                </div>
              </div>
              <span className="ref shrink-0 text-muted-foreground">
                {DECISION_LABEL[d.decision as keyof typeof DECISION_LABEL] ?? d.decision}
              </span>
            </Link>
          ))}
        </ListCard>

        <ListCard
          title={`Pièces rassemblées (${profil?.documents.length ?? 0})`}
          empty="Aucune pièce déposée sur ses dossiers."
          icon={FileText}
        >
          {(profil?.documents ?? []).map((doc) => (
            <a
              key={doc.id}
              href={`/documents/${doc.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-accent/40"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">{doc.filename}</div>
                <div className="ref text-muted-foreground">
                  {doc.clientNom} · {doc.dossierId}
                </div>
              </div>
              <span className="ref shrink-0 text-muted-foreground">
                {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
              </span>
            </a>
          ))}
        </ListCard>

        <ListCard
          title={`Encaissements (${profil?.encaissements.length ?? 0})`}
          empty="Aucun encaissement à son actif."
          icon={Wallet2}
        >
          {(profil?.encaissements ?? []).map((enc) => (
            <div
              key={enc.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <span className="min-w-0 truncate text-foreground">{enc.detail}</span>
              <div className="flex shrink-0 items-center gap-3">
                {enc.dossierId && (
                  <Link
                    to="/dossiers/$id"
                    params={{ id: enc.dossierId }}
                    className="text-primary hover:underline"
                  >
                    {enc.dossierId}
                  </Link>
                )}
                <span className="ref text-muted-foreground">
                  {new Date(enc.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>
          ))}
        </ListCard>

        <ListCard
          title={`Activité (${profil?.activite.length ?? 0})`}
          empty="Aucune activité enregistrée."
          className="lg:col-span-2"
        >
          {(profil?.activite ?? []).map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">{a.detail}</span>
              <span className="ref shrink-0 text-muted-foreground">
                {new Date(a.createdAt).toLocaleString("fr-FR")}
              </span>
            </div>
          ))}
        </ListCard>
      </div>

      {/* Dialogs */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la fiche</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nom</label>
              <Input value={editNom} onChange={(e) => setEditNom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={busy || !editNom.trim() || !editEmail.trim()} onClick={saveEdit}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Le nouveau mot de passe remplace l'ancien immédiatement. Communique-le à l'agent en
            direct.
          </p>
          <Input
            type="text"
            placeholder="12 caractères minimum"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <DialogFooter>
            <Button disabled={busy || newPw.length < 12} onClick={savePw}>
              Réinitialiser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le compte de {user.nom} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le compte est définitivement supprimé et l'agent ne pourra plus se connecter. Ses
              dossiers et son activité sont conservés mais ne lui seront plus rattachés. Cette
              action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[var(--stop)] text-white hover:bg-[var(--stop)]/90"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Retour à l'équipe
    </button>
  );
}

function Avatar({ nom, photo }: { nom: string; photo?: string | null }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt={nom}
        className="h-20 w-20 rounded-full border border-border object-cover"
      />
    );
  }
  const initials = nom
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-secondary text-xl font-semibold text-secondary-foreground">
      {initials || "?"}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string | undefined;
}) {
  return (
    <div className="bg-background p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="num-display mt-1 text-lg text-foreground">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function ListCard({
  title,
  empty,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  empty: string;
  icon?: typeof FileText;
  className?: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const isEmpty = items.filter(Boolean).length === 0;
  return (
    <Card className={`panel ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-80 divide-y divide-border overflow-y-auto p-0">
        {isEmpty ? <p className="p-4 text-sm text-muted-foreground">{empty}</p> : children}
      </CardContent>
    </Card>
  );
}
