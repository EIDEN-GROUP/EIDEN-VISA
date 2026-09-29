import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useDossier, useCurrentUser } from "@/lib/store";
import { joursEntre, moisEntre } from "@/lib/date-calc";
import {
  alertes,
  completion,
  encaisse,
  passeportValiditeOk,
  PACKS,
  CENTRES,
  MODALITE_LABEL,
  type PackKey,
  type Centre,
  type Modalite,
  type Echeance,
} from "@/lib/dossier-model";
import {
  NiveauBadge,
  ClotureBadge,
  DecisionBadge,
  AutorisationBadge,
} from "@/components/dossier/badges";
import { DocumentsPanel } from "@/components/dossier/documents-panel";
import { AssignationCard } from "@/components/dossier/assignation-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { AlertTriangle, ArrowLeft, FileText, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import stampPassport from "@/assets/decorations/stamp-passport.png";

const ECHEANCE_LABEL: Record<Echeance, string> = {
  acompte: "Acompte, dû à l'ouverture du dossier",
  solde: "Solde, dû à la remise du dossier",
  option: "Option à la carte",
};

export const Route = createFileRoute("/_app/dossiers/$id")({
  component: DossierDetail,
});

function DossierDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const {
    dossier: d,
    isLoading,
    togglePiece,
    encaisser,
    changerPack,
    changerModalite,
    changerCentre,
    setDecision,
    setUploadAutorisation,
    updateClient,
    supprimer,
  } = useDossier(id);
  const { user: me } = useCurrentUser();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editNom, setEditNom] = useState("");
  const [editTelephone, setEditTelephone] = useState("");
  const [editVille, setEditVille] = useState("");
  const [editNaissance, setEditNaissance] = useState("");
  const [editPassNumero, setEditPassNumero] = useState("");
  const [editPassDelivrance, setEditPassDelivrance] = useState("");
  const [editPassExpiration, setEditPassExpiration] = useState("");
  const [editPassLieu, setEditPassLieu] = useState("");
  const [refusOpen, setRefusOpen] = useState(false);
  const [refusMotif, setRefusMotif] = useState("");

  if (!d) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Chargement du dossier…" : "Dossier introuvable."}
        </p>
        {!isLoading && (
          <Link
            to="/dossiers"
            className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour aux dossiers
          </Link>
        )}
      </div>
    );
  }

  const c = completion(d);
  const a = alertes(d);
  const totalEncaisse = encaisse(d);
  const totalDu = d.paiements.reduce((s, p) => s + p.montant, 0);
  // Étape 6 = décision du consulat : le cycle Eiden Visa est terminé pour ce dossier,
  // on gèle les panneaux de travail (pièces, pack, encaissement) pour éviter une
  // modification accidentelle d'un dossier déjà clos.
  const cloture = d.etape === 6;
  const passeportOk = passeportValiditeOk(d);

  function openEdit() {
    setEditNom(d!.client.nom);
    setEditTelephone(d!.client.telephone);
    setEditVille(d!.client.ville);
    setEditNaissance(d!.client.naissance);
    setEditPassNumero(d!.client.passeportNumero ?? "");
    setEditPassDelivrance(d!.client.passeportDelivrance ?? "");
    setEditPassExpiration(d!.client.passeportExpiration ?? "");
    setEditPassLieu(d!.client.passeportLieu ?? "");
    setEditOpen(true);
  }

  async function saveEdit() {
    await updateClient(d!.id, {
      ...d!.client,
      nom: editNom.trim(),
      telephone: editTelephone.trim(),
      ville: editVille.trim(),
      naissance: editNaissance.trim(),
      passeportNumero: editPassNumero.trim() || null,
      passeportDelivrance: editPassDelivrance || null,
      passeportExpiration: editPassExpiration || null,
      passeportLieu: editPassLieu.trim() || null,
    });
    setEditOpen(false);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await supprimer(d!.id);
      navigate({ to: "/dossiers" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/dossiers"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retour aux dossiers
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/dossiers/$id/recu" params={{ id: d.id }} target="_blank">
            <Button variant="outline" size="sm">
              <FileText className="h-3.5 w-3.5" /> Reçu client
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Pencil className="h-3.5 w-3.5" /> Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[var(--stop)]/40 text-[var(--stop)] hover:bg-[var(--stop-soft)]"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Supprimer
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <img src={stampPassport} alt="" className="mt-1 h-12 w-12 shrink-0" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{d.client.nom}</h1>
              <NiveauBadge level={d.niveau} />
              {d.etape === 6 && <ClotureBadge />}
            </div>
            <p className="ref mt-1 text-muted-foreground">{d.id}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {d.titre} · {d.categorie}
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground sm:text-right">
          <div>
            {d.client.telephone} · {d.client.ville}
          </div>
          <div>Né(e) le {d.client.naissance}</div>
          {d.client.voyageDebut && d.client.voyageFin && (
            <div>
              Séjour du {new Date(d.client.voyageDebut).toLocaleDateString("fr-FR")} au{" "}
              {new Date(d.client.voyageFin).toLocaleDateString("fr-FR")}
              {" · "}
              {moisEntre(d.client.voyageDebut, d.client.voyageFin)} mois (
              {joursEntre(d.client.voyageDebut, d.client.voyageFin)} jours)
            </div>
          )}
          <div>
            Ouvert le {d.ouvertLe} par {d.agent}
          </div>
        </div>
      </div>

      {a.length > 0 && (
        <div className="space-y-2 border-l-2 border-[var(--stop)] pl-4">
          {a.map((msg, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-[var(--stop)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
              {msg}
            </div>
          ))}
        </div>
      )}

      {cloture && (
        <Card className="panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Décision du consulat</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Ce qui se passe après le dépôt — hors du contrôle d'Eiden, mais à suivre.
              </p>
            </div>
            <DecisionBadge decision={d.decision} />
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant={d.decision === "approuve" ? "default" : "outline"}
              className={
                d.decision === "approuve"
                  ? ""
                  : "border-[var(--ok)]/40 text-[var(--ok)] hover:bg-[var(--ok-soft)]"
              }
              onClick={() => setDecision(d.id, "approuve")}
            >
              Visa approuvé
            </Button>
            <Button
              size="sm"
              variant={d.decision === "refuse" ? "default" : "outline"}
              className={
                d.decision === "refuse"
                  ? "bg-[var(--stop)] hover:bg-[var(--stop)]/90"
                  : "border-[var(--stop)]/40 text-[var(--stop)] hover:bg-[var(--stop-soft)]"
              }
              onClick={() => {
                setRefusMotif(d.decisionMotif ?? "");
                setRefusOpen(true);
              }}
            >
              Visa refusé
            </Button>
            {d.decision !== "en_attente" && (
              <Button size="sm" variant="ghost" onClick={() => setDecision(d.id, "en_attente")}>
                Revenir à "en attente"
              </Button>
            )}
            {d.decisionDate && (
              <span className="ref ml-auto text-muted-foreground">
                Décision du {d.decisionDate}
              </span>
            )}
            {d.decision === "refuse" && (
              <div className="w-full border-l-2 border-[var(--stop)] pl-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--stop)]">
                  Motif du refus
                </div>
                <p className="mt-1 text-sm text-foreground">
                  {d.decisionMotif ||
                    "Non renseigné — à saisir, il conditionne toute nouvelle tentative."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Passeport */}
      <Card className="panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Passeport</CardTitle>
          {passeportOk === true && <span className="ref text-[var(--ok)]">Validité conforme</span>}
          {passeportOk === false && (
            <span className="ref text-[var(--stop)]">Validité insuffisante</span>
          )}
        </CardHeader>
        <CardContent>
          {d.client.passeportNumero ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted-foreground">Numéro</dt>
                <dd className="mt-0.5 font-medium text-foreground">{d.client.passeportNumero}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Lieu de délivrance</dt>
                <dd className="mt-0.5 text-foreground">{d.client.passeportLieu || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Délivré le</dt>
                <dd className="mt-0.5 text-foreground">
                  {d.client.passeportDelivrance
                    ? new Date(d.client.passeportDelivrance).toLocaleDateString("fr-FR")
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Expire le</dt>
                <dd
                  className={cn(
                    "mt-0.5 font-medium",
                    passeportOk === false ? "text-[var(--stop)]" : "text-foreground",
                  )}
                >
                  {d.client.passeportExpiration
                    ? new Date(d.client.passeportExpiration).toLocaleDateString("fr-FR")
                    : "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Passeport non renseigné — cliquez sur « Modifier » pour saisir le numéro et les dates.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Réponses de la qualification pour CE client */}
      {d.qualification.length > 0 && (
        <Card className="panel">
          <CardHeader>
            <CardTitle className="text-base">
              Questions posées au client ({d.qualification.length})
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Le fil exact de la Boussole au moment de l'ouverture du dossier — figé, même si
              l'arbre de qualification évolue ensuite.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {d.qualification.map((qr, i) => (
              <div
                key={i}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-2.5"
              >
                <span className="min-w-0 flex-1 text-sm text-muted-foreground">{qr.question}</span>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                  {qr.reponse}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pieces checklist */}
        <Card className="panel lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Checklist des pièces ({c.ok}/{c.total})
            </CardTitle>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${c.pct}%` }} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pièces officielles France-Visas
              </div>
              <ul className="space-y-2">
                {d.pieces
                  .map((p, i) => ({ p, i }))
                  .filter(({ p }) => p.source === "officiel")
                  .map(({ p, i }) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Checkbox
                        checked={p.fourni}
                        disabled={cloture}
                        onCheckedChange={() => togglePiece(d.id, i)}
                        className="mt-0.5"
                      />
                      <span
                        className={cn(
                          "text-sm",
                          p.fourni ? "text-foreground" : "text-foreground/90",
                        )}
                      >
                        {p.label}
                      </span>
                    </li>
                  ))}
                {d.pieces.filter((p) => p.source === "officiel").length === 0 && (
                  <li className="text-sm text-muted-foreground">
                    Aucune pièce officielle listée pour ce cas — voir les notes du dossier.
                  </li>
                )}
              </ul>
            </div>
            {d.pieces.some((p) => p.source === "eiden") && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recommandations Eiden (non exigées)
                </div>
                <ul className="space-y-2">
                  {d.pieces
                    .map((p, i) => ({ p, i }))
                    .filter(({ p }) => p.source === "eiden")
                    .map(({ p, i }) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Checkbox
                          checked={p.fourni}
                          disabled={cloture}
                          onCheckedChange={() => togglePiece(d.id, i)}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-muted-foreground">{p.label}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {d.notes.length > 0 && (
              <div className="border-l-2 border-[var(--info)] pl-3">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--info)]">
                  Notes
                </div>
                <ul className="space-y-1">
                  {d.notes.map((n, i) => (
                    <li key={i} className="whitespace-pre-line text-xs text-foreground/80">
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Centre de dépôt */}
          <Card className="panel">
            <CardHeader>
              <CardTitle className="text-base">Centre de dépôt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Pays visé</span>
                <span className="font-medium text-foreground">
                  {d.centre.includes("BLS") ? "Espagne" : "France"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="shrink-0 text-muted-foreground">Centre</span>
                <Select
                  value={d.centre}
                  disabled={cloture}
                  onValueChange={(v) => changerCentre(d.id, v as Centre)}
                >
                  <SelectTrigger className="h-8 w-auto text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CENTRES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Le client dépose lui-même son dossier au centre — Eiden ne prend pas le rendez-vous.
              </p>
            </CardContent>
          </Card>

          {/* Pack & paiements */}
          <Card className="panel">
            <CardHeader>
              <CardTitle className="text-base">Pack & paiements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={d.pack}
                disabled={cloture}
                onValueChange={(v) => changerPack(d.id, v as PackKey)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PACKS) as PackKey[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {PACKS[k].label} · {PACKS[k].prix} MAD
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{PACKS[d.pack].contenu}</p>

              <div className="border-t border-border pt-3">
                <label className="text-xs font-medium text-muted-foreground">
                  Modalité de paiement
                </label>
                <Select
                  value={d.modalitePaiement}
                  disabled={cloture}
                  onValueChange={(v) => changerModalite(d.id, v as Modalite)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MODALITE_LABEL) as Modalite[]).map((m) => (
                      <SelectItem key={m} value={m}>
                        {MODALITE_LABEL[m]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.modalitePaiement === "acompte"
                    ? "50 % à l'ouverture du dossier, solde des 50 % à la remise du dossier."
                    : "Règlement du pack en une fois, à la remise du dossier."}
                </p>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                {d.paiements.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-foreground">{p.libelle}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.date ?? "En attente"} · {ECHEANCE_LABEL[p.echeance ?? "solde"]}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="ref text-foreground">{p.montant} MAD</span>
                      {p.encaisse ? (
                        <span className="rounded-full bg-[var(--ok-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--ok)]">
                          Encaissé
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={cloture}
                          onClick={() => encaisser(d.id, i)}
                        >
                          Encaisser
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {d.paiements.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
                <span className="text-muted-foreground">Total encaissé</span>
                <span className="text-foreground">
                  {totalEncaisse} / {totalDu} MAD
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assignation */}
          <AssignationCard dossier={d} />

          {/* Documents */}
          <Card className="panel">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">Documents</CardTitle>
              <div className="flex items-center gap-2">
                <AutorisationBadge autorise={d.uploadAutorise} />
                {(me?.role === "ceo" || me?.role === "reception") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setUploadAutorisation(d.id, !d.uploadAutorise)}
                  >
                    {d.uploadAutorise ? "Bloquer" : "Autoriser"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <DocumentsPanel dossierId={d.id} authorized={d.uploadAutorise} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les informations du client</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Nom du client</label>
              <Input
                value={editNom}
                onChange={(e) => setEditNom(e.target.value)}
                placeholder="Nom complet"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
              <Input
                value={editTelephone}
                onChange={(e) => setEditTelephone(e.target.value)}
                placeholder="06 00 00 00 00"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Ville</label>
              <Input
                value={editVille}
                onChange={(e) => setEditVille(e.target.value)}
                placeholder="Agadir"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Date de naissance</label>
              <Input
                value={editNaissance}
                onChange={(e) => setEditNaissance(e.target.value)}
                placeholder="JJ/MM/AAAA"
              />
            </div>
            <div className="col-span-2 mt-1 border-t border-border pt-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Passeport
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Numéro</label>
              <Input
                value={editPassNumero}
                onChange={(e) => setEditPassNumero(e.target.value)}
                placeholder="AB1234567"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Lieu de délivrance
              </label>
              <Input
                value={editPassLieu}
                onChange={(e) => setEditPassLieu(e.target.value)}
                placeholder="Agadir"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Délivré le</label>
              <Input
                type="date"
                value={editPassDelivrance}
                onChange={(e) => setEditPassDelivrance(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Expire le</label>
              <Input
                type="date"
                value={editPassExpiration}
                onChange={(e) => setEditPassExpiration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button
              disabled={!editNom.trim() || !editTelephone.trim() || !editVille.trim()}
              onClick={saveEdit}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refusOpen} onOpenChange={setRefusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un refus de visa</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Le motif communiqué par le consulat conditionne toute nouvelle tentative : sans lui,
              impossible de savoir quoi corriger pour le prochain dossier.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Motif du refus (tel que communiqué)
              </label>
              <Input
                value={refusMotif}
                onChange={(e) => setRefusMotif(e.target.value)}
                placeholder="Ex. justificatifs de ressources insuffisants"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefusOpen(false)}>
              Annuler
            </Button>
            <Button
              className="bg-[var(--stop)] text-white hover:bg-[var(--stop)]/90"
              onClick={async () => {
                await setDecision(d.id, "refuse", refusMotif.trim() || undefined);
                setRefusOpen(false);
              }}
            >
              Enregistrer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce dossier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le dossier <b>{d.id}</b> de <b>{d.client.nom}</b> sera définitivement supprimé, avec
              ses pièces et paiements. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-[var(--stop)] text-white hover:bg-[var(--stop)]/90"
            >
              {deleting ? "Suppression…" : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
