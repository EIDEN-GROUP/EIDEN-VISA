import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  TREE,
  getFixedCase,
  buildCourtSejour,
  buildLongSejour,
  type Profile,
  type CaseResult,
} from "@/lib/visa-rules";
import {
  piecesFromCase,
  planPaiement,
  MODALITE_LABEL,
  CENTRES,
  type Dossier,
  type Centre,
  type Modalite,
} from "@/lib/dossier-model";
import { useDossiers, useCurrentUser, ROLE_LABEL } from "@/lib/store";
import { joursEntre, moisEntre, expirationParDefaut } from "@/lib/date-calc";
import { NiveauBadge } from "@/components/dossier/badges";
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
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import stampApproved from "@/assets/decorations/stamp-visa-approved.png";
import stampName from "@/assets/decorations/stamp-name.png";
import stampFamily from "@/assets/decorations/stamp-family.png";
import stampChild from "@/assets/decorations/stamp-child.png";

export const Route = createFileRoute("/_app/qualification")({
  component: Qualification,
});

type Step = { nodeKey: string; label: string };

const FAMILY_BASES: Profile["base"][] = [
  "visite_generale",
  "visite_enfant_parent",
  "famille_ue",
  "visite_familiale_membre",
  "enfant_parent_francais",
];
const FAMILY_CASE_KEYS = [
  "t3",
  "t4",
  "t5",
  "b_famille",
  "b_enfant_parent",
  "b_ue_famille",
  "b_long",
  "conjoint_court",
  "d_refugie",
  "d_subsidiaire",
  "d_apatride",
];

function familyRelated(caseKey: string, profile: Profile) {
  return FAMILY_CASE_KEYS.includes(caseKey) || FAMILY_BASES.includes(profile.base);
}

function Qualification() {
  const navigate = useNavigate();
  const { ajouter } = useDossiers();
  const { user: currentUser } = useCurrentUser();

  const [nodeKey, setNodeKey] = useState("start");
  const [profile, setProfile] = useState<Profile>({});
  const [history, setHistory] = useState<Step[]>([]);
  const [result, setResult] = useState<{ caseKey: string; c: CaseResult } | null>(null);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [naissance, setNaissance] = useState("");
  const [voyageDebut, setVoyageDebut] = useState("");
  const [voyageFin, setVoyageFin] = useState("");
  const [passNumero, setPassNumero] = useState("");
  const [passDelivrance, setPassDelivrance] = useState("");
  const [passExpiration, setPassExpiration] = useState("");
  const [passLieu, setPassLieu] = useState("");
  const [centre, setCentre] = useState<Centre>(CENTRES[0]);
  const [modalite, setModalite] = useState<Modalite>("comptant");

  // Nombre de jours du séjour envisagé — jour de fin exclu (méthode calculconversion.com
  // validée par l'équipe : 21→25 mars = 4 jours, pas 5). `null` tant que les deux dates ne
  // sont pas renseignées.
  const dureeSejour = voyageDebut && voyageFin ? joursEntre(voyageDebut, voyageFin) : null;

  const node = TREE[nodeKey]!;
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  // Carrousel : une question par diapo. On peut revenir en arrière pour relire ses
  // réponses, mais jamais dépasser la question en cours — elle est toujours la dernière.
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", duration: 18 });
  const [diapo, setDiapo] = useState(0);
  const [peutReculer, setPeutReculer] = useState(false);
  const [peutAvancer, setPeutAvancer] = useState(false);
  const [histoOuverte, setHistoOuverte] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setDiapo(emblaApi.selectedScrollSnap());
      setPeutReculer(emblaApi.canScrollPrev());
      setPeutAvancer(emblaApi.canScrollNext());
    };
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Une question répondue ajoute une diapo : on recale la vue sur la question en cours.
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(history.length);
  }, [emblaApi, history.length, nodeKey]);

  function goToResult(key: string, nextProfile: Profile) {
    const c =
      key === "DYNAMIC"
        ? buildCourtSejour(nextProfile)
        : key === "DYNAMIC_LS"
          ? buildLongSejour(nextProfile)
          : (getFixedCase(key) ?? buildCourtSejour(nextProfile));
    setResult({ caseKey: key, c });
  }

  function choose(opt: NonNullable<(typeof node)["opts"]>[number]) {
    const nextProfile = { ...profile, ...(opt.set ?? {}) };
    setProfile(nextProfile);
    setHistory((h) => [...h, { nodeKey, label: opt.l }]);

    if (opt.r) {
      goToResult(opt.n, nextProfile);
      return;
    }
    setNodeKey(opt.n);
  }

  function submitFields() {
    if (!node.fields || !node.next) return;
    const nextProfile: Profile = {
      ...profile,
      details: { ...profile.details, ...fieldValues },
    };
    setProfile(nextProfile);
    const label = node.fields
      .map((f) => fieldValues[f.key])
      .filter(Boolean)
      .join(" · ");
    setHistory((h) => [...h, { nodeKey, label: label || "Renseigné" }]);
    setFieldValues({});

    if (node.fieldsResult) {
      goToResult(node.next, nextProfile);
      return;
    }
    setNodeKey(node.next);
  }

  function reset() {
    setNodeKey("start");
    setProfile({});
    setHistory([]);
    setResult(null);
    setFieldValues({});
    setCentre(CENTRES[0]);
    setModalite("comptant");
    setHistoOuverte(false);
  }

  function retour() {
    if (history.length === 0) return;
    const prev = history[history.length - 1]!;
    setHistory((h) => h.slice(0, -1));
    setNodeKey(prev.nodeKey);
    setFieldValues({});
    setResult(null);
  }

  async function creerDossier() {
    if (!result || !nom) return;
    const pieces = piecesFromCase(result.c);
    const year = new Date().getFullYear();
    // Suffixe aléatoire large (base36, 6 caractères) : le risque de collision avec un ID
    // à 4 chiffres devenait réel dès quelques milliers de dossiers.
    const id = `EV-${year}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    // Attribué à la personne réellement connectée ("Connecté en tant que"), pas un texte
    // figé — sinon le journal d'activité et le champ "agent" du dossier se contredisent.
    const agent = currentUser ? `${ROLE_LABEL[currentUser.role]} · ${currentUser.nom}` : "Accueil";
    const dossier: Dossier = {
      id,
      client: {
        nom,
        telephone,
        ville,
        naissance,
        voyageDebut: voyageDebut || null,
        voyageFin: voyageFin || null,
        passeportNumero: passNumero.trim() || null,
        passeportDelivrance: passDelivrance || null,
        passeportExpiration: passExpiration || null,
        passeportLieu: passLieu.trim() || null,
      },
      agent,
      // Le serveur dérive le VRAI agentUserId de la session (voir createDossier) — cette
      // valeur client n'est là que pour satisfaire le type, elle est ignorée par le backend.
      agentUserId: currentUser?.id ?? null,
      assigneeUserId: null,
      ouvertLe: new Date().toLocaleDateString("fr-FR"),
      caseKey: result.caseKey,
      profile,
      // Le fil des questions réellement posées à CE client, figé ici : l'arbre évoluera,
      // la trace du dossier ne doit pas bouger avec lui.
      qualification: history.map((h) => ({
        question: TREE[h.nodeKey]?.q ?? h.nodeKey,
        reponse: h.label,
      })),
      titre: result.c.title,
      categorie: result.c.cat,
      niveau: result.c.level,
      pack: "base",
      modalitePaiement: modalite,
      etape: 1,
      centre,
      uploadAutorise: false,
      pieces,
      // Échéancier dérivé du pack (base par défaut) et de la modalité choisie à l'accueil :
      // comptant = une ligne de solde, acompte = 50 % + solde 50 %.
      paiements: planPaiement("base", modalite),
      // Les réponses libres ne sont plus aplaties ici : elles vivent dans `profile.details`,
      // et la fiche dossier les affiche groupées par sujet.
      notes: result.c.notes,
      decision: "en_attente",
      decisionDate: null,
      decisionMotif: null,
      recuRemis: false,
      recuLe: null,
      franceVisasFait: false,
      franceVisasRef: null,
      franceVisasLe: null,
      rdvPris: false,
      rdvDate: null,
      rdvLe: null,
    };
    await ajouter(dossier);
    navigate({ to: "/dossiers/$id", params: { id } });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Assistant de qualification</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Boussole de qualification Eiden Visa, pas à pas.
          </p>
        </div>
        {(history.length > 0 || result) && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Recommencer
          </Button>
        )}
      </div>

      {!result && (
        <>
          {/* Progression — la page ne s'allonge plus, on avance de diapo en diapo. */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm font-medium text-foreground">
              Question {history.length + 1}
              {history.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {diapo < history.length
                    ? `· vous relisez la réponse ${diapo + 1}`
                    : `· ${history.length} réponse${history.length > 1 ? "s" : ""} donnée${history.length > 1 ? "s" : ""}`}
                </span>
              )}
            </div>
            {history.length > 0 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => emblaApi?.scrollPrev()}
                  disabled={!peutReculer}
                  aria-label="Relire la réponse précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => emblaApi?.scrollNext()}
                  disabled={!peutAvancer}
                  aria-label="Revenir à la question en cours"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((diapo + 1) / (history.length + 1)) * 100}%` }}
            />
          </div>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex items-start">
              {/* Réponses déjà données — consultables en glissant, non modifiables ici. */}
              {history.map((h, i) => (
                <div key={i} className="min-w-0 flex-[0_0_100%] pr-4">
                  <Card className="panel border-dashed">
                    <CardHeader>
                      <div className="ref text-muted-foreground">Réponse {i + 1}</div>
                      <CardTitle className="text-lg">{TREE[h.nodeKey]!.q}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-block rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                        {h.label}
                      </span>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Pour modifier cette réponse, revenez à la question en cours puis utilisez «
                        Question précédente ».
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}

              {/* Question en cours — toujours la dernière diapo. */}
              <div className="min-w-0 flex-[0_0_100%] pr-4">
                <Card className="panel">
                  <CardHeader>
                    <CardTitle className="text-lg">{node.q}</CardTitle>
                    {node.help && <p className="pt-1 text-sm text-muted-foreground">{node.help}</p>}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {node.fields ? (
                      <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {node.fields.map((f) => (
                            <div
                              key={f.key}
                              className={node.fields!.length === 1 ? "sm:col-span-2" : ""}
                            >
                              <label className="text-xs font-medium text-muted-foreground">
                                {f.label}
                              </label>
                              <Input
                                type={f.type === "date" ? "date" : "text"}
                                placeholder={f.placeholder}
                                value={fieldValues[f.key] ?? ""}
                                onChange={(e) =>
                                  setFieldValues((v) => ({ ...v, [f.key]: e.target.value }))
                                }
                              />
                            </div>
                          ))}
                        </div>
                        <Button onClick={submitFields} className="mt-2 w-full">
                          Continuer
                        </Button>
                      </>
                    ) : (
                      node.opts!.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => choose(opt)}
                          className="block w-full rounded-xl border border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-accent"
                        >
                          {opt.l}
                        </button>
                      ))
                    )}
                    {history.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={retour} className="mt-2">
                        <ArrowLeft className="h-3.5 w-3.5" /> Question précédente
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}

      {result && (
        <div className="space-y-6">
          {/* Le résultat arrive en premier : plus besoin de faire défiler toutes les
              réponses pour le voir. Elles restent consultables juste en dessous. */}
          {history.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/30">
              <button
                onClick={() => setHistoOuverte((o) => !o)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left"
              >
                <span className="text-sm font-medium text-foreground">
                  {history.length} réponse{history.length > 1 ? "s" : ""} donnée
                  {history.length > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1 text-xs text-primary">
                  {histoOuverte ? "Masquer" : "Voir le détail"}
                  <ChevronRight
                    className={cn("h-3.5 w-3.5 transition-transform", histoOuverte && "rotate-90")}
                  />
                </span>
              </button>
              {histoOuverte && (
                <div className="space-y-2 border-t border-border px-4 py-3">
                  {history.map((h, i) => (
                    <div key={i} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                        {TREE[h.nodeKey]!.q}
                      </span>
                      <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        {h.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Card className="panel">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {result.c.level === "standard" && (
                    <img src={stampApproved} alt="" className="h-10 w-10" />
                  )}
                  <CardTitle className="text-lg">{result.c.title}</CardTitle>
                </div>
                <NiveauBadge level={result.c.level} />
              </div>
              <p className="text-sm text-muted-foreground">{result.c.cat}</p>
              {(profile.minor || familyRelated(result.caseKey, profile)) && (
                <div className="flex items-center gap-4 pt-1">
                  {familyRelated(result.caseKey, profile) && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <img src={stampFamily} alt="" className="h-6 w-6" /> Dossier familial
                    </span>
                  )}
                  {profile.minor && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <img src={stampChild} alt="" className="h-6 w-6" /> Mineur dans le dossier
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {result.c.docs.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pièces officielles France-Visas ({result.c.docs.length})
                  </div>
                  <ul className="space-y-1.5">
                    {result.c.docs.map((doc, i) => (
                      <li key={i} className="text-sm text-foreground">
                        · {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.c.extra.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommandations Eiden
                  </div>
                  <ul className="space-y-1.5">
                    {result.c.extra.map((doc, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        · {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.c.notes.length > 0 && (
                <div className="border-l-2 border-[var(--info)] pl-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--info)]">
                    Points de vigilance
                  </div>
                  <ul className="space-y-1">
                    {result.c.notes.map((n, i) => (
                      <li key={i} className="text-xs text-foreground/80">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.c.docs.length === 0 && result.c.extra.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ce cas ne fait pas l'objet d'une checklist Eiden Visa — voir les points de
                  vigilance ci-dessus pour l'orientation à donner au client.
                </p>
              )}
            </CardContent>
          </Card>

          {
            // Même un cas sans checklist officielle (orientation, référé à un tiers) doit
            // pouvoir devenir un dossier — ne serait-ce que pour tracer une consultation
            // d'orientation facturée. Bloquer la création ici laissait ces cas sans issue.
            <Card className="panel">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <img src={stampName} alt="" className="h-9 w-9" />
                <CardTitle className="text-base">Créer le dossier</CardTitle>
                {result.c.docs.length === 0 && (
                  <span className="ref ml-auto text-muted-foreground">
                    Sans checklist officielle
                  </span>
                )}
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Type de visa</label>
                  <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
                    <span className="text-sm font-medium text-foreground">{result.c.title}</span>
                    <NiveauBadge level={result.c.level} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Déterminé par la Boussole de qualification ci-dessus. Pour changer de type,
                    revenez sur la dernière question.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Nom du client</label>
                  <Input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Nom complet"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
                  <Input
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="06 00 00 00 00"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Ville</label>
                  <Input
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Agadir"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Date de naissance
                  </label>
                  <Input
                    value={naissance}
                    onChange={(e) => setNaissance(e.target.value)}
                    placeholder="JJ/MM/AAAA"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Départ souhaité
                  </label>
                  <Input
                    type="date"
                    value={voyageDebut}
                    onChange={(e) => setVoyageDebut(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Retour souhaité
                  </label>
                  <Input
                    type="date"
                    value={voyageFin}
                    min={voyageDebut || undefined}
                    onChange={(e) => setVoyageFin(e.target.value)}
                  />
                </div>
                {voyageDebut && voyageFin && (
                  <div className="col-span-2 -mt-1">
                    {dureeSejour !== null && dureeSejour > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Séjour envisagé :{" "}
                        <span className="font-medium text-foreground">
                          {moisEntre(voyageDebut, voyageFin)} mois
                        </span>{" "}
                        ({dureeSejour} jour{dureeSejour > 1 ? "s" : ""}).
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--stop)]">
                        La date de retour doit être postérieure à la date de départ.
                      </p>
                    )}
                  </div>
                )}
                <div className="col-span-2 mt-2 border-t border-border pt-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Passeport
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Facultatif à l'ouverture — à compléter dès que la pièce est entre vos mains.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Numéro de passeport
                  </label>
                  <Input
                    value={passNumero}
                    onChange={(e) => setPassNumero(e.target.value)}
                    placeholder="AB1234567"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Lieu de délivrance
                  </label>
                  <Input
                    value={passLieu}
                    onChange={(e) => setPassLieu(e.target.value)}
                    placeholder="Agadir"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Date de délivrance
                  </label>
                  <Input
                    type="date"
                    value={passDelivrance}
                    onChange={(e) => {
                      setPassDelivrance(e.target.value);
                      // Passeport marocain : 5 ans. Proposé seulement si l'agent n'a
                      // pas déjà saisi une expiration à la main.
                      if (!passExpiration) {
                        const suggestion = expirationParDefaut(e.target.value);
                        if (suggestion) setPassExpiration(suggestion);
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Date d'expiration
                  </label>
                  <Input
                    type="date"
                    value={passExpiration}
                    onChange={(e) => setPassExpiration(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pré-remplie à 5 ans après la délivrance (passeport marocain) — modifiable.
                  </p>
                </div>
                {passExpiration && voyageFin && (
                  <div className="col-span-2 -mt-1">
                    {(() => {
                      const min = new Date(voyageFin);
                      min.setMonth(min.getMonth() + 3);
                      const ok = new Date(passExpiration).getTime() >= min.getTime();
                      return ok ? (
                        <p className="text-xs text-muted-foreground">
                          Validité du passeport conforme (≥ 3 mois après le retour).
                        </p>
                      ) : (
                        <p className="text-xs text-[var(--stop)]">
                          Passeport insuffisamment valide : il doit rester valable au moins 3 mois
                          après la date de retour.
                        </p>
                      );
                    })()}
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Centre de dépôt
                  </label>
                  <Select value={centre} onValueChange={(v) => setCentre(v as Centre)}>
                    <SelectTrigger>
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
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Modalité de paiement
                  </label>
                  <Select value={modalite} onValueChange={(v) => setModalite(v as Modalite)}>
                    <SelectTrigger>
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
                    {modalite === "acompte"
                      ? "50 % à l'ouverture du dossier, solde des 50 % à la remise du dossier."
                      : "Règlement du pack en une fois, à la remise du dossier."}
                  </p>
                </div>
                <div className="col-span-2 pt-2">
                  <Button
                    className="w-full"
                    disabled={!nom || (dureeSejour !== null && dureeSejour <= 0)}
                    onClick={creerDossier}
                  >
                    Créer le dossier
                  </Button>
                </div>
              </CardContent>
            </Card>
          }

          <Button variant="ghost" size="sm" onClick={retour}>
            <ArrowLeft className="h-3.5 w-3.5" /> Revenir sur la dernière question
          </Button>
        </div>
      )}
    </div>
  );
}
