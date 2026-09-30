import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useDossier, useCurrentUser } from "@/lib/store";
import { joursEntre, moisEntre } from "@/lib/date-calc";
import {
  alertes,
  completion,
  encaisse,
  passeportValiditeOk,
  ETAPES,
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
import { AlertTriangle, ArrowLeft, ArrowRight, FileText, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TREE_FIELDS } from "@/lib/visa-rules";
import stampPassport from "@/assets/decorations/stamp-passport.png";

const ECHEANCE_LABEL: Record<Echeance, string> = {
  acompte: "Acompte, dû à l'ouverture du dossier",
  solde: "Solde, dû à la remise du dossier",
  option: "Option à la carte",
};

/** Une date ISO saisie au questionnaire se relit en français, pas en AAAA-MM-JJ. */
function formatValeur(valeur: string, type: "text" | "date") {
  if (type !== "date") return valeur;
  const d = new Date(valeur);
  return Number.isNaN(d.getTime()) ? valeur : d.toLocaleDateString("fr-FR");
}

/** Regroupe `profile.details` par nœud d'origine, en ignorant les champs laissés vides. */
function grouperDetails(details: Record<string, string> | undefined) {
  if (!details) return [];
  const groupes = new Map<string, { label: string; valeur: string }[]>();
  for (const [cle, brut] of Object.entries(details)) {
    const valeur = brut?.trim();
    if (!valeur) continue;
    const champ = TREE_FIELDS[cle];
    const groupe = champ?.groupe ?? "Autres informations";
    const ligne = {
      label: champ?.label ?? cle,
      valeur: formatValeur(valeur, champ?.type ?? "text"),
    };
    groupes.set(groupe, [...(groupes.get(groupe) ?? []), ligne]);
  }
  return [...groupes.entries()].map(([titre, lignes]) => ({ titre, lignes }));
}

/** Ordre d'affichage des panneaux principaux, par étape du parcours. */
const ORDRE_PANNEAUX: Record<
  number,
  { client: number; grid: number; qualif: number; jalons: number }
> = {
  1: { client: 1, qualif: 2, grid: 3, jalons: 4 },
  2: { grid: 1, client: 2, qualif: 3, jalons: 4 },
  3: { jalons: 1, client: 2, qualif: 3, grid: 4 },
  4: { jalons: 1, grid: 2, client: 3, qualif: 4 },
  5: { grid: 1, jalons: 2, client: 3, qualif: 4 },
  6: { grid: 2, jalons: 3, client: 4, qualif: 5 },
};

/** Même logique pour la colonne de droite. */
const ORDRE_SIDEBAR: Record<number, { centre: number; docs: number }> = {
  1: { centre: 1, docs: 2 },
  2: { docs: 1, centre: 2 },
  3: { docs: 1, centre: 2 },
  4: { centre: 1, docs: 2 },
  5: { centre: 1, docs: 2 },
  6: { centre: 1, docs: 2 },
};

/** Une ligne libellé / valeur, format partagé par les panneaux de lecture. */
function Ligne({ label, valeur }: { label: string; valeur: string | null | undefined }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn("text-sm font-medium", valeur ? "text-foreground" : "text-muted-foreground")}
      >
        {valeur || "—"}
      </dd>
    </div>
  );
}

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
    avancer,
    reculer,
    encaisser,
    changerPack,
    changerModalite,
    changerCentre,
    setDecision,
    setJalon,
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
  const [fvRef, setFvRef] = useState("");
  const [rdvDate, setRdvDate] = useState("");

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
  const etapeCourante = ETAPES.find((e) => e.n === d.etape) ?? ETAPES[0];
  const detailsGroupes = grouperDetails(d.profile.details);
  // Les anciens dossiers portent encore ces réponses recopiées à plat dans les notes :
  // on masque ce doublon maintenant qu'un panneau dédié les affiche proprement.
  const notesAffichees = d.notes.filter(
    (n) => !n.startsWith("Informations complémentaires saisies"),
  );

  // Chaque étape met en avant ce dont l'agent a besoin À CE MOMENT : celui qui rassemble
  // les pièces (étape 2) ne cherche pas la même chose que celui qui recopie le dossier sur
  // France-Visas (étape 3). Rien n'est masqué — seul l'ordre change.
  const ordre = ORDRE_PANNEAUX[d.etape] ?? ORDRE_PANNEAUX[1]!;
  const ordreSide = ORDRE_SIDEBAR[d.etape] ?? ORDRE_SIDEBAR[1]!;

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

      {/* Où en est ce dossier, et ce que l'étape attend concrètement. */}
      <Card className="panel border-l-4 border-l-primary">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary">
              Étape {etapeCourante.n} sur {ETAPES.length} · {etapeCourante.role}
            </div>
            <div className="ref text-muted-foreground">
              {a.length > 0 ? `${a.length} point(s) de vigilance` : "Aucun point bloquant"}
            </div>
          </div>
          <div className="mt-1 text-base font-semibold text-foreground">{etapeCourante.label}</div>
          <p className="mt-1 text-sm text-muted-foreground">{etapeCourante.detail}</p>

          {/* Faire avancer le dossier sans repasser par le kanban. */}
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => reculer(d.id)}
              disabled={d.etape <= 1}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Étape précédente
            </Button>
            <Button size="sm" onClick={() => avancer(d.id)} disabled={d.etape >= ETAPES.length}>
              {d.etape + 1 <= ETAPES.length
                ? `Passer à l'étape ${d.etape + 1} · ${ETAPES[d.etape]!.label}`
                : "Dernière étape"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            {d.etape >= ETAPES.length && (
              <span className="ref text-muted-foreground">
                Dernière étape — enregistrez la décision du consulat ci-dessous.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        {cloture && (
          <Card className="panel" style={{ order: 1 }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Décision du consulat</CardTitle>
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

        {/* Démarches faites hors de l'app — l'agent les déclare, la référence fait preuve. */}
        <Card className="panel" style={{ order: ordre.jalons }}>
          <CardHeader>
            <CardTitle className="text-lg">Démarches externes</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Ce qui se fait sur les portails, hors de l'application. À cocher une fois réellement
              effectué — la référence saisie sert de preuve.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* France-Visas */}
            <div className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    checked={d.franceVisasFait}
                    onCheckedChange={(v) =>
                      setJalon(d.id, "france_visas", v === true, { reference: fvRef })
                    }
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Dossier créé sur France-Visas
                    </div>
                    <div className="text-xs text-muted-foreground">Étape 3 · Back office</div>
                  </div>
                </div>
                {d.franceVisasFait ? (
                  <span className="ref text-[var(--ok)]">
                    Fait{d.franceVisasLe ? ` le ${d.franceVisasLe}` : ""}
                  </span>
                ) : (
                  <span className="ref text-muted-foreground">À faire</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-48 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Numéro de dossier France-Visas
                  </label>
                  <Input
                    value={d.franceVisasFait ? (d.franceVisasRef ?? "") : fvRef}
                    onChange={(e) =>
                      d.franceVisasFait
                        ? setJalon(d.id, "france_visas", true, { reference: e.target.value })
                        : setFvRef(e.target.value)
                    }
                    placeholder="FRA-2026-XXXXXX"
                  />
                </div>
              </div>
            </div>

            {/* TLScontact / BLS */}
            <div className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    checked={d.rdvPris}
                    onCheckedChange={(v) => setJalon(d.id, "rdv", v === true, { date: rdvDate })}
                    className="mt-0.5"
                    disabled={!d.franceVisasFait}
                  />
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      Rendez-vous pris · {d.centre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Étape 4 · Back office
                      {!d.franceVisasFait && " — créez d'abord le dossier sur France-Visas"}
                    </div>
                  </div>
                </div>
                {d.rdvPris ? (
                  <span className="ref text-[var(--ok)]">
                    Fait{d.rdvLe ? ` le ${d.rdvLe}` : ""}
                  </span>
                ) : (
                  <span className="ref text-muted-foreground">À faire</span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-48 flex-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Date du rendez-vous
                  </label>
                  <Input
                    type="date"
                    value={d.rdvPris ? (d.rdvDate ?? "") : rdvDate}
                    onChange={(e) =>
                      d.rdvPris
                        ? setJalon(d.id, "rdv", true, { date: e.target.value })
                        : setRdvDate(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations saisies à l'ouverture du dossier */}
        <Card className="panel" style={{ order: ordre.client }}>
          <CardHeader>
            <CardTitle className="text-lg">Informations du client</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Saisies à l'ouverture du dossier — modifiables via « Modifier ».
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Identité
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <Ligne label="Nom du client" valeur={d.client.nom} />
                <Ligne label="Date de naissance" valeur={d.client.naissance} />
                <Ligne label="Téléphone" valeur={d.client.telephone} />
                <Ligne label="Ville" valeur={d.client.ville} />
              </dl>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Séjour envisagé
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <Ligne
                  label="Départ souhaité"
                  valeur={
                    d.client.voyageDebut
                      ? new Date(d.client.voyageDebut).toLocaleDateString("fr-FR")
                      : null
                  }
                />
                <Ligne
                  label="Retour souhaité"
                  valeur={
                    d.client.voyageFin
                      ? new Date(d.client.voyageFin).toLocaleDateString("fr-FR")
                      : null
                  }
                />
                {d.client.voyageDebut && d.client.voyageFin && (
                  <Ligne
                    label="Durée"
                    valeur={`${moisEntre(d.client.voyageDebut, d.client.voyageFin)} mois (${joursEntre(
                      d.client.voyageDebut,
                      d.client.voyageFin,
                    )} jours)`}
                  />
                )}
              </dl>
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Dossier
              </div>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <Ligne label="Type de visa" valeur={d.titre} />
                <Ligne label="Catégorie" valeur={d.categorie} />
                <Ligne label="Centre de dépôt" valeur={d.centre} />
                <Ligne label="Modalité de paiement" valeur={MODALITE_LABEL[d.modalitePaiement]} />
              </dl>
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Passeport
                </span>
                {passeportOk === true && (
                  <span className="ref text-[var(--ok)]">Validité conforme</span>
                )}
                {passeportOk === false && (
                  <span className="ref text-[var(--stop)]">Validité insuffisante</span>
                )}
              </div>
              {d.client.passeportNumero ? (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  <Ligne label="Numéro" valeur={d.client.passeportNumero} />
                  <Ligne label="Lieu de délivrance" valeur={d.client.passeportLieu} />
                  <Ligne
                    label="Délivré le"
                    valeur={
                      d.client.passeportDelivrance
                        ? new Date(d.client.passeportDelivrance).toLocaleDateString("fr-FR")
                        : null
                    }
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-1.5">
                    <dt className="text-xs text-muted-foreground">Expire le</dt>
                    <dd
                      className={cn(
                        "text-sm font-medium",
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
                  Passeport non renseigné — cliquez sur « Modifier » pour saisir le numéro et les
                  dates.
                </p>
              )}
            </div>

            {/* Réponses libres du questionnaire, regroupées par sujet. */}
            {detailsGroupes.map((g) => (
              <div key={g.titre}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {g.titre}
                </div>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                  {g.lignes.map((l) => (
                    <Ligne key={l.label} label={l.label} valeur={l.valeur} />
                  ))}
                </dl>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Réponses de la qualification pour CE client */}
        {d.qualification.length > 0 && (
          <Card className="panel" style={{ order: ordre.qualif }}>
            <CardHeader>
              <CardTitle className="text-lg">
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
                  <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                    {qr.question}
                  </span>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    {qr.reponse}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3"
          style={{ order: ordre.grid }}
        >
          {/* Pieces checklist */}
          <Card className="panel lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
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
              {notesAffichees.length > 0 && (
                <div className="border-l-2 border-[var(--info)] pl-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--info)]">
                    Notes
                  </div>
                  <ul className="space-y-1">
                    {notesAffichees.map((n, i) => (
                      <li key={i} className="whitespace-pre-line text-xs text-foreground/80">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            {/* Pack & paiements */}
            <Card className="panel">
              <CardHeader>
                <CardTitle className="text-lg">Pack & paiements</CardTitle>
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
          </div>
        </div>

        {/* Dépôt et pièces jointes : sous la checklist, pas dans une colonne étroite. */}
        <div
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3"
          style={{ order: ordre.grid + 1 }}
        >
          {/* Centre de dépôt */}
          <Card className="panel" style={{ order: ordreSide.centre }}>
            <CardHeader>
              <CardTitle className="text-lg">Centre de dépôt</CardTitle>
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

          {/* Documents */}
          <Card className="panel lg:col-span-2" style={{ order: ordreSide.docs }}>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg">Documents</CardTitle>
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
