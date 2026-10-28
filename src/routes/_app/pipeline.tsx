import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GitBranch,
  Globe2,
  GripVertical,
  MapPin,
  Plus,
  Search,
  Trophy,
  UserRound,
  XCircle,
} from "lucide-react";
import { useCrmPipeline, useCurrentUser } from "@/lib/store";
import {
  CENTRES,
  CRM_STAGE_KEYS,
  CRM_STAGE_META,
  type Centre,
  type CrmStage,
} from "@/lib/dossier-model";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/pipeline")({ component: PipelinePage });

type PipelineCard = {
  id: string;
  clientNom: string;
  clientTelephone: string;
  clientVille: string;
  titre: string;
  centre: string;
  agent: string;
  crmStage: CrmStage;
  createdAt: Date | string;
};

const STAGE_EDGE: Record<CrmStage, string> = {
  lead: "border-t-slate-400",
  call_back: "border-t-sky-500",
  proposal: "border-t-indigo-500",
  appointment: "border-t-violet-500",
  follow_up: "border-t-amber-500",
  negotiation: "border-t-orange-500",
  won: "border-t-emerald-500",
  lost: "border-t-rose-500",
};

const STAGE_HEADER: Record<CrmStage, string> = {
  lead: "bg-sky-100/80 text-sky-950",
  call_back: "bg-slate-200/80 text-slate-900",
  proposal: "bg-violet-100/80 text-violet-950",
  appointment: "bg-teal-100/80 text-teal-950",
  follow_up: "bg-emerald-100/80 text-emerald-950",
  negotiation: "bg-orange-100/80 text-orange-950",
  won: "bg-green-100/80 text-green-950",
  lost: "bg-rose-100/80 text-rose-950",
};

function PipelinePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mine, setMine] = useState(false);
  const [limitPerStage, setLimitPerStage] = useState(12);
  const [mobileStage, setMobileStage] = useState<CrmStage>("lead");
  const [movingId, setMovingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetStage, setDropTargetStage] = useState<CrmStage | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [leadCentre, setLeadCentre] = useState<Centre>(CENTRES[0]);
  const [savingLead, setSavingLead] = useState(false);
  const [lostConfirmation, setLostConfirmation] = useState<{
    card: PipelineCard;
    stage: CrmStage;
  } | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isError, error, refetch, setCrmStage, createCrmLead } =
    useCrmPipeline({ search: debouncedSearch, mine, limitPerStage });
  const columns = data?.columns ?? [];
  const columnByStage = useMemo(
    () => new Map(columns.map((column) => [column.stage, column])),
    [columns],
  );
  const won = columnByStage.get("won")?.count ?? 0;
  const lost = columnByStage.get("lost")?.count ?? 0;
  const active = Math.max(0, (data?.total ?? 0) - won - lost);
  const selectedMobileColumn = columnByStage.get(mobileStage);

  async function moveCard(card: PipelineCard, nextStage: CrmStage) {
    if (card.crmStage === nextStage) return;
    setMovingId(card.id);
    try {
      await setCrmStage(card.id, card.crmStage, nextStage);
      toast.success(`Déplacé vers ${CRM_STAGE_META[nextStage].label}`, {
        action: {
          label: "Annuler",
          onClick: () => {
            void setCrmStage(card.id, nextStage, card.crmStage)
              .then(() => toast.success("Étape restaurée"))
              .catch((reason: unknown) =>
                toast.error(reason instanceof Error ? reason.message : "Impossible d'annuler."),
              );
          },
        },
      });
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Le changement n'a pas été enregistré.",
      );
    } finally {
      setMovingId(null);
    }
  }

  function chooseStage(card: PipelineCard, nextStage: CrmStage) {
    if (nextStage === "lost") {
      setLostConfirmation({ card, stage: nextStage });
      return;
    }
    void moveCard(card, nextStage);
  }

  function startDraggingCard(card: PipelineCard, event: DragEvent<HTMLButtonElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", card.id);
    setDraggingId(card.id);
  }

  function dragOverStage(stage: CrmStage, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetStage(stage);
  }

  function dropCardOnStage(stage: CrmStage, event: DragEvent<HTMLElement>) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    const card = columns.flatMap((column) => column.cards).find((item) => item.id === id);
    setDraggingId(null);
    setDropTargetStage(null);
    if (card) chooseStage(card, stage);
  }

  function finishDraggingCard() {
    setDraggingId(null);
    setDropTargetStage(null);
  }

  async function addLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingLead(true);
    try {
      await createCrmLead({
        nom: leadName,
        telephone: leadPhone,
        ville: leadCity,
        centre: leadCentre,
      });
      toast.success("Lead ajoutÃ© au Pipeline");
      setAddLeadOpen(false);
      setLeadName("");
      setLeadPhone("");
      setLeadCity("");
      setLeadCentre(CENTRES[0]);
      setMobileStage("lead");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Impossible d'ajouter ce lead.");
    } finally {
      setSavingLead(false);
    }
  }

  const messageErreur = error instanceof Error ? error.message : "Chargement impossible.";
  const erreurAcces = /accès réservé|non authentifié|session révoquée/i.test(messageErreur);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden md:gap-4">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-2xl border border-primary/15 bg-primary/8 p-3 text-primary">
            <GitBranch className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="page-title">Pipeline CRM</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Suivez chaque dossier du premier contact à la conclusion, sans mélanger le suivi
              commercial et les étapes de traitement du visa.
            </p>
          </div>
        </div>
        <Button onClick={() => setAddLeadOpen(true)} className="w-full shrink-0 sm:w-auto">
          <Plus aria-hidden="true" /> Ajouter un lead
        </Button>
        {user?.role === "ceo" && (
          <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
            <Link to="/ops" search={{ s: "activite" }}>
              Journal d'activité <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        )}
      </div>

      {isError ? (
        <Card className="panel border-destructive/30">
          <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                aria-hidden="true"
              />
              <div>
                <h2 className="font-semibold text-foreground">
                  {erreurAcces ? "Accès au pipeline refusé" : "Le pipeline n'a pas pu être chargé"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {erreurAcces
                    ? "Connectez-vous avec un compte autorisé pour consulter les dossiers."
                    : messageErreur}
                </p>
              </div>
            </div>
            {!erreurAcces && (
              <Button variant="outline" onClick={() => void refetch()}>
                Réessayer
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <section
            aria-label="Résumé du pipeline"
            className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4"
          >
            <SummaryCard
              label="Dossiers suivis"
              value={data?.total ?? 0}
              icon={BriefcaseBusiness}
            />
            <SummaryCard label="En cours" value={active} icon={Clock3} tone="blue" />
            <SummaryCard label="Won" value={won} icon={Trophy} tone="green" />
            <SummaryCard label="Lost" value={lost} icon={XCircle} tone="rose" />
          </section>

          <Card className="panel shrink-0">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher un nom, téléphone, ville ou référence"
                  aria-label="Rechercher dans le pipeline"
                  className="h-10 pl-9"
                />
              </div>
              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-xs text-muted-foreground">
                  {isFetching && !isLoading ? "Mise à jour…" : "Actualisé automatiquement"}
                </span>
                <div className="flex shrink-0 rounded-full border border-border p-1">
                  <button
                    type="button"
                    aria-pressed={!mine}
                    onClick={() => setMine(false)}
                    className={cn(
                      "min-h-8 rounded-full px-3 text-xs font-medium transition-colors",
                      !mine
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Tous
                  </button>
                  <button
                    type="button"
                    aria-pressed={mine}
                    onClick={() => setMine(true)}
                    className={cn(
                      "min-h-8 rounded-full px-3 text-xs font-medium transition-colors",
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Mes dossiers
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="min-h-0 flex-1 animate-pulse rounded-2xl border bg-muted/30"></div>
          ) : data?.total === 0 ? (
            <Card className="panel min-h-0 flex-1">
              <CardContent className="flex h-full min-h-0 flex-col items-center justify-center px-6 text-center">
                <div className="rounded-2xl bg-muted p-4 text-muted-foreground">
                  <BriefcaseBusiness className="h-7 w-7" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {debouncedSearch || mine ? "Aucun dossier trouvé" : "Le pipeline est prêt"}
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {debouncedSearch || mine
                    ? "Modifiez la recherche ou affichez tous les dossiers."
                    : "Les nouveaux dossiers apparaîtront automatiquement dans Lead."}
                </p>
                {!debouncedSearch && !mine && (
                  <Button asChild className="mt-4">
                    <Link to="/qualification" search={{ dossier: undefined }}>
                      Créer un dossier
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div
                className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
                role="group"
                aria-label="Étapes du pipeline"
              >
                {CRM_STAGE_KEYS.map((stage) => {
                  const column = columnByStage.get(stage);
                  return (
                    <button
                      key={stage}
                      type="button"
                      aria-pressed={mobileStage === stage}
                      onClick={() => setMobileStage(stage)}
                      className={cn(
                        "min-h-10 shrink-0 rounded-full border px-3 text-sm font-medium transition-colors",
                        mobileStage === stage
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {CRM_STAGE_META[stage].label}
                      <span className="ml-2 opacity-75">{column?.count ?? 0}</span>
                    </button>
                  );
                })}
              </div>

              <div className="lg:hidden min-h-0 flex-1">
                {selectedMobileColumn && (
                  <PipelineColumn
                    column={selectedMobileColumn}
                    busyId={movingId}
                    onChooseStage={chooseStage}
                    draggingId={draggingId}
                    dropTargetStage={dropTargetStage}
                    onCardDragStart={startDraggingCard}
                    onCardDragEnd={finishDraggingCard}
                    onStageDragOver={dragOverStage}
                    onStageDrop={dropCardOnStage}
                  />
                )}
              </div>

              <div
                className="hidden min-h-0 flex-1 overflow-x-auto overflow-y-hidden overscroll-x-contain lg:block"
                tabIndex={0}
                aria-label="Pipeline commercial, défilement horizontal"
              >
                <div className="grid h-full min-h-0 auto-cols-[minmax(180px,1fr)] grid-flow-col gap-2.5 2xl:grid-flow-row 2xl:grid-cols-8 2xl:auto-cols-auto 2xl:gap-3">
                  {columns.map((column) => (
                    <PipelineColumn
                      key={column.stage}
                      column={column}
                      busyId={movingId}
                      onChooseStage={chooseStage}
                      draggingId={draggingId}
                      dropTargetStage={dropTargetStage}
                      onCardDragStart={startDraggingCard}
                      onCardDragEnd={finishDraggingCard}
                      onStageDragOver={dragOverStage}
                      onStageDrop={dropCardOnStage}
                    />
                  ))}
                </div>
              </div>

              {data && columns.some((column) => column.count > column.cards.length) && (
                <div className="flex justify-center">
                  {limitPerStage >= 50 ? (
                    <p className="text-center text-xs text-muted-foreground">
                      Affinez la recherche pour afficher les dossiers suivants.
                    </p>
                  ) : (
                    <Button
                      variant="outline"
                      disabled={isFetching}
                      onClick={() => setLimitPerStage((limit) => Math.min(50, limit + 12))}
                    >
                      Charger plus de dossiers
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          <p className="shrink-0 text-xs text-muted-foreground">
            Les changements de statut sont enregistrés dans le journal d'activité. Le statut
            commercial reste distinct de l'étape visa du dossier.
          </p>
        </>
      )}

      <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un lead</DialogTitle>
            <DialogDescription>
              {
                "Ajoutez un contact au Pipeline. Le dossier sera cr\u00e9\u00e9 en Lead et pourra \u00eatre qualifi\u00e9 plus tard."
              }
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={addLead}>
            <div className="space-y-2">
              <Label htmlFor="crm-lead-name">Nom complet *</Label>
              <Input
                id="crm-lead-name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={160}
                value={leadName}
                onChange={(event) => setLeadName(event.target.value)}
                placeholder="Ex. Salma El Amrani"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crm-lead-phone">{"T\u00e9l\u00e9phone *"}</Label>
                <Input
                  id="crm-lead-phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  minLength={5}
                  maxLength={30}
                  value={leadPhone}
                  onChange={(event) => setLeadPhone(event.target.value)}
                  placeholder="+212 6 00 00 00 00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crm-lead-city">Ville *</Label>
                <Input
                  id="crm-lead-city"
                  autoComplete="address-level2"
                  required
                  minLength={2}
                  maxLength={120}
                  value={leadCity}
                  onChange={(event) => setLeadCity(event.target.value)}
                  placeholder="Agadir"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm-lead-centre">{"Destination souhait\u00e9e"}</Label>
              <Select value={leadCentre} onValueChange={(value) => setLeadCentre(value as Centre)}>
                <SelectTrigger id="crm-lead-centre">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CENTRES.map((centre) => (
                    <SelectItem key={centre} value={centre}>
                      {centre.includes("Espagne")
                        ? "Espagne · BLS Agadir"
                        : "France · TLScontact Agadir"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddLeadOpen(false)}
                disabled={savingLead}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={savingLead}>
                {savingLead ? "Ajout en cours…" : "Ajouter au Pipeline"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(lostConfirmation)}
        onOpenChange={(open) => !open && setLostConfirmation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marquer ce dossier comme Lost ?</AlertDialogTitle>
            <AlertDialogDescription>
              {lostConfirmation?.card.clientNom} passera dans les dossiers non conclus. Le dossier
              et ses informations restent conservés ; ce statut pourra être modifié ensuite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Garder le dossier</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (lostConfirmation) void moveCard(lostConfirmation.card, lostConfirmation.stage);
                setLostConfirmation(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmer Lost
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: typeof BriefcaseBusiness;
  tone?: "default" | "blue" | "green" | "rose";
}) {
  const toneClass = {
    default: "bg-primary/8 text-primary",
    blue: "bg-sky-500/10 text-sky-700",
    green: "bg-emerald-500/10 text-emerald-700",
    rose: "bg-rose-500/10 text-rose-700",
  }[tone];
  return (
    <Card className="panel min-w-0">
      <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="num-display text-2xl font-semibold text-foreground sm:text-3xl">
            {value}
          </div>
          <div className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">{label}</div>
        </div>
        <span className={cn("rounded-xl p-2.5", toneClass)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function PipelineColumn({
  column,
  busyId,
  onChooseStage,
  draggingId,
  dropTargetStage,
  onCardDragStart,
  onCardDragEnd,
  onStageDragOver,
  onStageDrop,
}: {
  column: {
    stage: CrmStage;
    label: string;
    helper: string;
    count: number;
    cards: PipelineCard[];
  };
  busyId: string | null;
  onChooseStage: (card: PipelineCard, stage: CrmStage) => void;
  draggingId: string | null;
  dropTargetStage: CrmStage | null;
  onCardDragStart: (card: PipelineCard, event: DragEvent<HTMLButtonElement>) => void;
  onCardDragEnd: () => void;
  onStageDragOver: (stage: CrmStage, event: DragEvent<HTMLElement>) => void;
  onStageDrop: (stage: CrmStage, event: DragEvent<HTMLElement>) => void;
}) {
  return (
    <section
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-muted/20 p-2.5 transition-colors sm:p-3",
        dropTargetStage === column.stage && "border-primary bg-primary/5 ring-2 ring-primary/40",
      )}
      aria-label={`${column.label}: ${column.count} dossiers`}
      onDragOver={(event) => onStageDragOver(column.stage, event)}
      onDrop={(event) => onStageDrop(column.stage, event)}
    >
      <CardHeader
        className={cn(
          "mb-2 flex shrink-0 flex-row items-start justify-between gap-2 rounded-xl px-2.5 py-2",
          STAGE_HEADER[column.stage],
        )}
      >
        <div className="min-w-0">
          <CardTitle className="text-sm font-semibold text-foreground">{column.label}</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">{column.helper}</p>
        </div>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-900">
          {column.count}
        </span>
      </CardHeader>
      <div className="scrollbar-hidden flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain pr-1">
        {column.cards.map((card) => (
          <Card
            key={card.id}
            className={cn(
              "panel shrink-0 overflow-hidden border-t-[3px] transition-opacity",
              STAGE_EDGE[column.stage],
              draggingId === card.id && "opacity-45",
            )}
          >
            <CardContent className="space-y-3 p-3">
              <div className="flex min-w-0 items-start gap-1.5">
                <button
                  type="button"
                  draggable
                  aria-label={`Glisser ${card.clientNom} vers une autre étape`}
                  title="Glisser vers une autre étape"
                  onDragStart={(event) => onCardDragStart(card, event)}
                  onDragEnd={onCardDragEnd}
                  className="hidden min-h-7 shrink-0 cursor-grab touch-none items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
                >
                  <GripVertical className="h-4 w-4" aria-hidden="true" />
                </button>
                <div className="min-w-0 flex-1">
                  <Link
                    to="/dossiers/$id"
                    params={{ id: card.id }}
                    className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    {card.clientNom}
                  </Link>
                  <div className="ref mt-1 truncate text-muted-foreground">{card.id}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <a
                  href={`tel:${card.clientTelephone.replace(/[^\d+]/g, "")}`}
                  className="inline-flex min-h-7 max-w-full items-center gap-2 rounded-md hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{card.clientTelephone}</span>
                </a>
                <div className="flex min-w-0 items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{card.clientVille}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate" title={card.titre}>
                    {card.titre}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate" title={card.centre}>
                    {card.centre}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Clock3 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{dateCourte(card.createdAt)}</span>
                </div>
              </div>
              <div className="border-t border-border pt-2.5 lg:hidden">
                <label className="sr-only" htmlFor={`crm-stage-${card.id}`}>
                  Changer d'étape
                </label>
                <Select
                  value={card.crmStage}
                  disabled={busyId === card.id}
                  onValueChange={(value) => onChooseStage(card, value as CrmStage)}
                >
                  <SelectTrigger id={`crm-stage-${card.id}`} className="h-9 bg-card text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CRM_STAGE_KEYS.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {CRM_STAGE_META[stage].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Link
                to="/dossiers/$id"
                params={{ id: card.id }}
                className="inline-flex min-h-8 items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Ouvrir le dossier <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        ))}
        {column.cards.length === 0 && (
          <div className="flex min-h-28 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-5 text-center">
            {column.stage === "won" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            ) : column.stage === "lost" ? (
              <XCircle className="h-5 w-5 text-rose-600" aria-hidden="true" />
            ) : (
              <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            )}
            <span className="mt-2 text-xs text-muted-foreground">Aucun dossier à cette étape</span>
          </div>
        )}
      </div>
    </section>
  );
}

function dateCourte(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Date indisponible";
  return new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium" }).format(date);
}
