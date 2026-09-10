import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { useMyProfile, ROLE_LABEL } from "@/lib/store";
import { ETAPES, DECISION_LABEL } from "@/lib/dossier-model";
import { LEVEL_LABEL, type Level } from "@/lib/visa-rules";
import { Avatar, ProfileKpi, ProfileListCard } from "@/components/profile-parts";
import { downscaleImage } from "@/lib/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, FileText, KeyRound, Pencil, Wallet2, X } from "lucide-react";

export const Route = createFileRoute("/_app/profil")({
  component: MyProfile,
});

function MyProfile() {
  const { data, isLoading, isError, changerNom, changerPhoto, changerMotDePasse } = useMyProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [nameOpen, setNameOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [pwActuel, setPwActuel] = useState("");
  const [pwNouveau, setPwNouveau] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!data) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        {isError
          ? "Impossible de charger votre profil."
          : isLoading
            ? "Chargement…"
            : "Indisponible."}
      </p>
    );
  }

  const { user } = data;
  const k = data.kpis;
  const roleSteps = ETAPES.filter((e) => e.role === ROLE_LABEL[user.role]);
  const etapeData = data.parEtape.map((r) => {
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
      await changerPhoto(await downscaleImage(file));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Échec de l'envoi.");
    } finally {
      setBusy(false);
    }
  }

  async function saveName() {
    setBusy(true);
    try {
      await changerNom(nom.trim());
      setNameOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function savePw() {
    setPwError(null);
    setBusy(true);
    try {
      await changerMotDePasse({ actuel: pwActuel, nouveau: pwNouveau });
      setPwActuel("");
      setPwNouveau("");
      setPwOpen(false);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Échec.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="panel">
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
                onClick={() => {
                  setNom(user.nom);
                  setNameOpen(true);
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Modifier le nom"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                {ROLE_LABEL[user.role]}
              </span>
              <span className="text-xs text-muted-foreground">
                Compte créé le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>

            {user.photoBase64 && (
              <button
                onClick={() => changerPhoto(null)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--stop)]"
              >
                <X className="h-3 w-3" /> Retirer la photo
              </button>
            )}
            {photoError && <p className="mt-1 text-xs text-[var(--stop)]">{photoError}</p>}

            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={() => setPwOpen(true)}>
                <KeyRound className="h-3.5 w-3.5" /> Changer mon mot de passe
              </Button>
            </div>

            {roleSteps.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Vous êtes responsable de&nbsp;:</span>{" "}
                {roleSteps.map((e) => `${e.n}. ${e.label}`).join(" · ")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-5">
        <ProfileKpi label="Mes dossiers" value={`${k.dossiers}`} hint={`${k.actifs} actifs`} />
        <ProfileKpi
          label="Taux d'approbation"
          value={k.tauxApprobation == null ? "—" : `${k.tauxApprobation} %`}
          hint={`${k.approuve} ✓ · ${k.refuse} ✗`}
        />
        <ProfileKpi
          label="Encaissé"
          value={`${k.encaisse.toLocaleString("fr-FR")} MAD`}
          hint={`${k.nEncaissements} opération(s)`}
        />
        <ProfileKpi label="Pièces rassemblées" value={`${k.documents}`} />
        <ProfileKpi
          label="Niveau dominant"
          value={
            data.parNiveau.length
              ? (LEVEL_LABEL[[...data.parNiveau].sort((a, b) => b.n - a.n)[0]!.k as Level] ?? "—")
              : "—"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="panel">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mes dossiers par étape</CardTitle>
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

        <ProfileListCard
          title={`Mes dossiers (${data.dossiers.length})`}
          empty="Vous n'avez ouvert aucun dossier."
        >
          {data.dossiers.map((d) => (
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
        </ProfileListCard>

        <ProfileListCard
          title={`Pièces rassemblées (${data.documents.length})`}
          empty="Aucune pièce déposée sur vos dossiers."
          icon={FileText}
        >
          {data.documents.map((doc) => (
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
        </ProfileListCard>

        <ProfileListCard
          title={`Mes encaissements (${data.encaissements.length})`}
          empty="Aucun encaissement à votre actif."
          icon={Wallet2}
        >
          {data.encaissements.map((enc) => (
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
        </ProfileListCard>

        <ProfileListCard
          title={`Mon activité (${data.activite.length})`}
          empty="Aucune activité enregistrée."
          className="lg:col-span-2"
        >
          {data.activite.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">{a.detail}</span>
              <span className="ref shrink-0 text-muted-foreground">
                {new Date(a.createdAt).toLocaleString("fr-FR")}
              </span>
            </div>
          ))}
        </ProfileListCard>
      </div>

      <Dialog open={nameOpen} onOpenChange={setNameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier mon nom</DialogTitle>
          </DialogHeader>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} />
          <DialogFooter>
            <Button disabled={busy || !nom.trim()} onClick={saveName}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer mon mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Mot de passe actuel
              </label>
              <Input
                type="password"
                value={pwActuel}
                onChange={(e) => setPwActuel(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Nouveau mot de passe
              </label>
              <Input
                type="password"
                placeholder="6 caractères minimum"
                value={pwNouveau}
                onChange={(e) => setPwNouveau(e.target.value)}
              />
            </div>
            {pwError && <p className="text-sm text-[var(--stop)]">{pwError}</p>}
          </div>
          <DialogFooter>
            <Button disabled={busy || !pwActuel || pwNouveau.length < 6} onClick={savePw}>
              Changer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
