/**
 * Modèle opérationnel Eiden Visa : parcours en 7 étapes, paliers de prix.
 * Eiden monte le dossier et le remet scellé ; le client dépose lui-même au centre.
 * Chiffres issus de l'étude EV/2026-08.
 */

import {
  buildCourtSejour,
  buildLongSejour,
  getFixedCase,
  type CaseResult,
  type Level,
  type Profile,
} from "./visa-rules";

export const ETAPES = [
  {
    n: 1,
    key: "reception",
    label: "Réception et diagnostic",
    detail:
      "Le client est reçu au centre. La réception explique le service, vérifie l'éligibilité de base, fait signer la clause de non-garantie et remet le reçu listant les pièces à rapporter.",
    encaissement: "Gratuit",
    role: "Réception",
  },
  {
    n: 2,
    key: "france_visas",
    label: "Création du dossier sur France-Visas / RCPC",
    detail:
      "Création du compte et saisie du dossier sur le portail France-Visas, à partir des réponses de la qualification. Édition du récépissé (RCPC).",
    encaissement: "Acompte selon la modalité choisie",
    role: "Back office",
  },
  {
    n: 3,
    key: "rdv",
    label: "Prise de rendez-vous sur TLScontact",
    detail:
      "Recherche d'un créneau et prise du rendez-vous au centre de dépôt. Étape dépendante des disponibilités du centre.",
    encaissement: "-",
    role: "Back office",
  },
  {
    n: 4,
    key: "rassemblement",
    label: "Rassemblement du dossier",
    detail:
      "Le client réunit ses pièces et l'équipe vérifie chaque document un par un avant la date du rendez-vous. Le dossier scellé lui est ensuite remis.",
    encaissement: "Solde du palier choisi",
    role: "Back office",
  },
  {
    n: 5,
    key: "decision",
    label: "Visa approuvé ou refusé",
    detail:
      "Décision du consulat, hors du contrôle d'Eiden mais à enregistrer : approbation ou refus, avec le motif en cas de refus.",
    encaissement: "Droit de visa payé en direct par le client",
    role: "Consulat",
  },
] as const;

export type PackKey = "base" | "voyage" | "global";

/**
 * Ce que le client achète : un pack, ou `carte` = des services choisis un par un
 * (`Dossier.services`). Stocké dans la colonne historique `dossiers.pack`.
 */
export type FormuleKey = PackKey | "carte";

/**
 * Les trois packs vendus, alignés sur la landing (Essentiel / Confort / Global). Les clés
 * `base`/`voyage`/`global` sont historiques (colonne `dossiers.pack`) et ne changent pas.
 */
export const PACKS: Record<
  PackKey,
  {
    label: string;
    prix: number;
    margeNette: number | null;
    contenu: string;
    /** Pack dont celui-ci reprend tout le contenu (« Tout le pack X, plus »). */
    herite: PackKey | null;
    /** Ce que le pack ajoute (au pack hérité, le cas échéant). */
    inclus: string[];
  }
> = {
  base: {
    label: "Pack Essentiel",
    prix: 1000,
    // Coût de revient inchangé (309 MAD) : la hausse de prix est de la marge.
    margeNette: 691,
    contenu: "Pour préparer votre demande de visa en toute sérénité.",
    herite: null,
    inclus: [
      "Vérification et Rassemblement du dossier",
      "Assistance au remplissage du formulaire France-Visas",
      "Accompagnement pour la prise de rendez-vous visa",
    ],
  },
  voyage: {
    label: "Pack Confort",
    prix: 1350,
    // Coût de revient inchangé (500 MAD, pré-réservations agence partenaire comprises).
    margeNette: 850,
    contenu: "Une préparation complète avec les réservations nécessaires à votre voyage.",
    herite: "base",
    inclus: ["Pré-réservation du billet d'avion", "Pré-réservation de l'hôtel"],
  },
  global: {
    label: "Pack Global",
    prix: 1900,
    /** Coût de l'assurance / commission courtier non encore figés : pas de chiffre tant qu'ils ne sont pas confirmés. */
    margeNette: null,
    contenu: "Un accompagnement complet pour préparer votre dossier et anticiper votre voyage.",
    herite: "voyage",
    inclus: ["Assurance voyage"],
  },
};

export const PACK_KEYS = Object.keys(PACKS) as PackKey[];

/** Services vendus à l'unité, pour le client qui ne veut pas de pack. */
export type ServiceKey =
  | "verification"
  | "formulaire_rdv"
  | "prereservation"
  | "prereservation_hotel"
  | "prereservation_avion"
  | "assurance_6m"
  | "assurance_1an";

export const SERVICES: Record<ServiceKey, { label: string; prix: number; detail: string }> = {
  verification: {
    label: "Vérification et Rassemblement du dossier",
    prix: 400,
    detail: "Vérification des pièces justificatives et contrôle de la complétude du dossier.",
  },
  formulaire_rdv: {
    label: "Formulaire de demande et rendez-vous visa",
    prix: 600,
    detail:
      "Remplissage du formulaire de demande de visa et accompagnement pour le rendez-vous auprès du centre concerné, TLS Contact ou BLS selon le cas.",
  },
  prereservation: {
    label: "Pré-réservation hôtel et billet d'avion",
    prix: 350,
    detail: "Assistance pour les pré-réservations nécessaires au dossier de voyage.",
  },
  prereservation_hotel: {
    label: "Pré-réservation hôtel",
    prix: 170,
    detail: "Pré-réservation d'hôtel seule.",
  },
  prereservation_avion: {
    label: "Pré-réservation billet d'avion",
    prix: 170,
    detail: "Pré-réservation du billet d'avion seule.",
  },
  assurance_6m: {
    label: "Assurance voyage - 6 mois",
    prix: 550,
    detail: "Assurance selon les conditions et garanties du contrat proposé.",
  },
  assurance_1an: {
    label: "Assurance voyage - 1 an",
    prix: 750,
    detail: "Assurance selon les conditions et garanties du contrat proposé.",
  },
};

export const SERVICE_KEYS = Object.keys(SERVICES) as ServiceKey[];

/**
 * Services qui font double emploi : cocher l'un décoche les autres (une seule assurance ;
 * la pré-réservation combinée remplace hôtel seul / avion seul).
 */
const SERVICES_EXCLUSIFS: ServiceKey[][] = [
  ["assurance_6m", "assurance_1an"],
  ["prereservation", "prereservation_hotel"],
  ["prereservation", "prereservation_avion"],
];

/** Coche / décoche un service en retirant ceux qui feraient double emploi avec lui. */
export function basculerService(services: ServiceKey[], s: ServiceKey): ServiceKey[] {
  if (services.includes(s)) return services.filter((x) => x !== s);
  const exclus = new Set(
    SERVICES_EXCLUSIFS.filter((g) => g.includes(s)).flatMap((g) => g.filter((x) => x !== s)),
  );
  return SERVICE_KEYS.filter((x) => x === s || (services.includes(x) && !exclus.has(x)));
}

/** Message d'erreur si la sélection est invalide (vide ou services en double emploi), sinon null. */
export function erreurServices(services: ServiceKey[]): string | null {
  if (services.length === 0) return "Choisir au moins un service.";
  if (new Set(services).size !== services.length) return "Service en double.";
  for (const g of SERVICES_EXCLUSIFS)
    if (g.filter((x) => services.includes(x)).length > 1)
      return `Services incompatibles : ${g.map((x) => SERVICES[x].label).join(" / ")}.`;
  return null;
}

export function totalServices(services: ServiceKey[]): number {
  return services.reduce((t, s) => t + SERVICES[s].prix, 0);
}

/** Libellé de ce que le client achète : le pack, ou « Services à la carte ». */
export function formuleLabel(formule: FormuleKey): string {
  return formule === "carte" ? "Services à la carte" : PACKS[formule].label;
}

/** Prix de la formule : tarif du pack, ou somme des services choisis. */
export function prixFormule(formule: FormuleKey, services: ServiceKey[]): number {
  return formule === "carte" ? totalServices(services) : PACKS[formule].prix;
}

/** « 1 000 MAD » */
export function mad(n: number): string {
  return `${n.toLocaleString("fr-FR")} MAD`;
}

export const FRAIS = {
  droitVisaAdulte: "≈ 90 € (≈ 950 MAD), payé en direct par le client au centre",
  droitVisaMineur: "≈ 45 € (≈ 480 MAD) selon la tranche d'âge",
};

export interface Piece {
  label: string;
  /** officiel = exigé par France-Visas · eiden = recommandation interne */
  source: "officiel" | "eiden";
  fourni: boolean;
}

/**
 * Modalité de règlement choisie par le client à l'ouverture du dossier :
 * - `comptant`  : il règle le pack en une fois (encaissement au solde, étape 6) ;
 * - `acompte`   : il verse 50 % du prix pour sécuriser l'engagement (à l'ouverture du
 *   dossier, étape 2), les 50 % restants dus à l'étape 6 ;
 * - `acompte15` : même principe avec un acompte de 15 %, solde de 85 %.
 * Les options à la carte (voyage, assurance) sont toujours facturées à part,
 * hors du calcul de l'acompte.
 */
export type Modalite = "comptant" | "acompte" | "acompte15";
export const MODALITE_LABEL: Record<Modalite, string> = {
  comptant: "Paiement comptant",
  acompte: "Acompte 50 % + solde",
  acompte15: "Acompte 15 % + solde",
};
/** Part du prix versée en acompte, par modalité (0 = comptant, pas d'acompte). */
export const ACOMPTE_PCT: Record<Modalite, number> = {
  comptant: 0,
  acompte: 0.5,
  acompte15: 0.15,
};
/** Explication courte de la modalité, affichée sous le sélecteur. */
export function modaliteDetail(m: Modalite): string {
  const pct = Math.round(ACOMPTE_PCT[m] * 100);
  return pct === 0
    ? "Règlement du pack en une fois, à la remise du dossier."
    : `${pct} % à l'ouverture du dossier, solde des ${100 - pct} % à la remise du dossier.`;
}

/** Quand une ligne de paiement est due - la règle métier n'est plus cachée dans le libellé. */
export type Echeance = "acompte" | "solde" | "option";

export interface Paiement {
  libelle: string;
  montant: number;
  date: string | null;
  encaisse: boolean;
  /** Absent sur les dossiers créés avant l'échéancier explicite : traité alors comme un solde. */
  echeance?: Echeance | undefined;
}

/**
 * Échéancier dérivé du pack et de la modalité - jamais saisi à la main.
 * Ne produit que des lignes non encaissées : l'appelant fusionne avec l'historique déjà encaissé.
 */
export function planPaiement(
  formule: FormuleKey,
  modalite: Modalite,
  services: ServiceKey[] = [],
): Paiement[] {
  if (formule === "carte") {
    const erreur = erreurServices(services);
    if (erreur) throw new Error(erreur);
  }
  const label = formuleLabel(formule);
  const prix = prixFormule(formule, services);
  const pct = ACOMPTE_PCT[modalite];
  if (pct > 0) {
    const acompte = Math.round(prix * pct);
    const pctLabel = Math.round(pct * 100);
    return [
      {
        libelle: `Acompte ${pctLabel} % · ${label}`,
        montant: acompte,
        date: null,
        encaisse: false,
        echeance: "acompte",
      },
      {
        libelle: `Solde ${100 - pctLabel} % · ${label}`,
        montant: prix - acompte,
        date: null,
        encaisse: false,
        echeance: "solde",
      },
    ];
  }
  return [
    {
      libelle: `${label} · paiement intégral`,
      montant: prix,
      date: null,
      encaisse: false,
      echeance: "solde",
    },
  ];
}

/**
 * Applique une nouvelle modalité (ou un nouveau pack) à un dossier : on régénère les
 * lignes d'échéancier non encaissées, on garde intactes celles déjà encaissées et
 * toutes les options à la carte.
 */
export function reglerEcheancier(
  paiements: Paiement[],
  formule: FormuleKey,
  modalite: Modalite,
  services: ServiceKey[] = [],
): Paiement[] {
  const gardees = paiements.filter((p) => p.encaisse || p.echeance === "option");
  const echeancesReglees = new Set(
    gardees.filter((p) => p.encaisse).map((p) => p.echeance ?? "solde"),
  );
  const fraiches = planPaiement(formule, modalite, services).filter(
    (l) => !echeancesReglees.has(l.echeance!),
  );
  const ordre: Record<Echeance, number> = { acompte: 0, solde: 1, option: 2 };
  return [...gardees, ...fraiches].sort(
    (a, b) => ordre[a.echeance ?? "solde"] - ordre[b.echeance ?? "solde"],
  );
}

export const CENTRES = ["TLScontact Agadir", "BLS Espagne Agadir"] as const;
export type Centre = (typeof CENTRES)[number];

/** Ce qui se passe après l'étape 7 : la décision du consulat, hors du contrôle d'Eiden. */
export type Decision = "en_attente" | "approuve" | "refuse";
export const DECISION_LABEL: Record<Decision, string> = {
  en_attente: "En attente de décision",
  approuve: "Visa approuvé",
  refuse: "Visa refusé",
};

/**
 * Note écrite par un agent sur un dossier. Distincte de `notes`, qui porte les
 * observations générées par la qualification : ici c'est l'équipe qui parle, et on
 * garde qui a écrit quoi et quand.
 */
export interface NoteAgent {
  texte: string;
  auteur: string;
  date: string;
}

/** Une question posée à la qualification et la réponse donnée par ce client précis. */
export interface QualificationReponse {
  question: string;
  reponse: string;
  /**
   * Nœud de l'arbre d'où vient la question : permet de proposer les réponses
   * possibles à l'agent quand il corrige le fil. Absent sur les dossiers
   * ouverts avant cet ajout (le texte reste alors librement modifiable).
   */
  nodeKey?: string | undefined;
}

export interface Dossier {
  id: string;
  client: {
    nom: string;
    telephone: string;
    ville: string;
    naissance: string;
    /** Dates de séjour envisagées (ISO `AAAA-MM-JJ`), saisies par le client à la qualification.
     * `null` si non renseignées (dossiers créés avant l'ajout de ces champs, ou dates encore
     * indécises côté client). */
    voyageDebut: string | null;
    voyageFin: string | null;
    /** Passeport - `null` tant que la pièce n'est pas passée entre les mains du centre. */
    passeportNumero: string | null;
    passeportDelivrance: string | null;
    passeportExpiration: string | null;
    passeportLieu: string | null;
  };
  /** Le fil des questions/réponses de la Boussole pour ce client. Vide pour les dossiers
   * créés avant que ce fil ne soit conservé. */
  qualification: QualificationReponse[];
  agent: string;
  /** Le VRAI compte qui a ouvert ce dossier - sert à filtrer "Mes dossiers" par utilisateur.
   * `null` pour les dossiers créés avant l'ajout de ce champ. */
  agentUserId: string | null;
  /** À qui le dossier est confié actuellement (assignation), `null` si non assigné. */
  assigneeUserId: string | null;
  ouvertLe: string;
  caseKey: string;
  profile: Profile;
  titre: string;
  categorie: string;
  niveau: Level;
  /** Pack choisi, ou `carte` quand le client prend des services à l'unité. */
  pack: FormuleKey;
  /** Services à l'unité retenus - vide sauf si `pack === "carte"`. */
  services: ServiceKey[];
  /** `comptant` par défaut pour les dossiers créés avant l'ajout de la modalité. */
  modalitePaiement: Modalite;
  etape: number;
  /** Centre de dépôt visé (le client dépose lui-même - Eiden ne prend pas le rendez-vous). */
  centre: Centre;
  /** Le service ne peut téléverser des documents qu'une fois ce dossier autorisé (CEO/Réception). */
  uploadAutorise: boolean;
  pieces: Piece[];
  paiements: Paiement[];
  notes: string[];
  /** Notes libres de l'équipe, les plus récentes en tête. */
  notesAgent: NoteAgent[];
  decision: Decision;
  decisionDate: string | null;
  /** Motif communiqué par le consulat en cas de refus - `null` sinon. */
  decisionMotif: string | null;
  /**
   * Démarches faites HORS de l'application : sur le portail France-Visas puis au centre.
   * L'app ne peut pas les constater elle-même, donc l'agent les déclare - et la référence
   * saisie sert de preuve, sans quoi « étape suivante » ne veut rien dire.
   */
  /** Le reçu papier a été remis au client, en main propre (étape 2). */
  recuRemis: boolean;
  /** Quand la remise a été déclarée (horodatage automatique). */
  recuLe: string | null;
  franceVisasFait: boolean;
  /** Numéro du dossier créé sur France-Visas. */
  franceVisasRef: string | null;
  /** Quand la création a été déclarée faite (horodatage automatique). */
  franceVisasLe: string | null;
  rdvPris: boolean;
  /** Date du rendez-vous obtenu au centre (ISO AAAA-MM-JJ). */
  rdvDate: string | null;
  /** Quand la prise de rendez-vous a été déclarée faite (horodatage automatique). */
  rdvLe: string | null;
}

export function resolveCase(caseKey: string, profile: Profile): CaseResult {
  if (caseKey === "DYNAMIC") return buildCourtSejour(profile);
  if (caseKey === "DYNAMIC_LS") return buildLongSejour(profile);
  return (
    getFixedCase(caseKey) ?? {
      key: caseKey,
      title: "Cas non qualifié",
      cat: "-",
      level: "attention",
      docs: [],
      extra: [],
      notes: [],
    }
  );
}

export function piecesFromCase(c: CaseResult, fournis: number[] = []): Piece[] {
  const all: Piece[] = [
    ...c.docs.map((label) => ({ label, source: "officiel" as const, fourni: false })),
    ...c.extra.map((label) => ({ label, source: "eiden" as const, fourni: false })),
  ];
  fournis.forEach((i) => {
    if (all[i]) all[i].fourni = true;
  });
  return all;
}

export function completion(d: Dossier) {
  const officiels = d.pieces.filter((p) => p.source === "officiel");
  const ok = officiels.filter((p) => p.fourni).length;
  return {
    ok,
    total: officiels.length,
    pct: officiels.length ? Math.round((ok / officiels.length) * 100) : 0,
  };
}

export function encaisse(d: Dossier) {
  return d.paiements.filter((p) => p.encaisse).reduce((s, p) => s + p.montant, 0);
}

/**
 * Validité du passeport : règle Schengen - il doit rester valable au moins 3 mois
 * après la date de retour prévue. `null` si on ne peut pas trancher (dates absentes).
 */
/**
 * État du passeport vis-à-vis du voyage. Un seul booléen mélangeait trois situations
 * très différentes : périmé, expirant PENDANT le séjour, ou simplement sans les 3 mois
 * de marge exigés après le retour. L'agent n'a pas le même message à passer au client.
 */
export type PasseportStatut =
  "inconnu" | "expire" | "expire_pendant_sejour" | "marge_insuffisante" | "ok";

export function passeportStatut(d: Dossier): PasseportStatut {
  const { passeportExpiration, voyageFin } = d.client;
  if (!passeportExpiration) return "inconnu";
  const exp = new Date(passeportExpiration);
  if (Number.isNaN(exp.getTime())) return "inconnu";

  // Déjà périmé : vrai quelles que soient les dates du voyage, même absentes.
  if (exp.getTime() < Date.now()) return "expire";
  if (!voyageFin) return "inconnu";

  const retour = new Date(voyageFin);
  if (Number.isNaN(retour.getTime())) return "inconnu";
  if (exp.getTime() < retour.getTime()) return "expire_pendant_sejour";

  const minimum = new Date(retour);
  minimum.setMonth(minimum.getMonth() + 3);
  return exp.getTime() >= minimum.getTime() ? "ok" : "marge_insuffisante";
}

/** Date d'expiration minimale acceptable : retour + 3 mois. `null` si le retour est inconnu. */
export function passeportExpirationMinimale(d: Dossier): string | null {
  const { voyageFin } = d.client;
  if (!voyageFin) return null;
  const min = new Date(voyageFin);
  if (Number.isNaN(min.getTime())) return null;
  min.setMonth(min.getMonth() + 3);
  return min.toISOString().slice(0, 10);
}

export function passeportValiditeOk(d: Dossier): boolean | null {
  const st = passeportStatut(d);
  if (st === "inconnu") return null;
  return st === "ok";
}

export function passeportPerime(d: Dossier): boolean {
  return passeportStatut(d) === "expire";
}

/** Un point à cocher pour l'étape en cours : ce qui doit être fait, et s'il l'est. */
export interface PointEtape {
  label: string;
  fait: boolean;
  /** Pourquoi ce point compte - affiché quand la raison n'est pas évidente. */
  aide?: string;
}

/**
 * Ce que l'étape en cours attend concrètement. Remplace le décompte abstrait de
 * « points de vigilance » : l'agent voit la liste de son étape, pas celle du dossier entier.
 */
export function checklistEtape(d: Dossier): PointEtape[] {
  const c = completion(d);
  const piecesOk = c.total > 0 && c.pct === 100;
  const piecesLabel = `Pièces officielles réunies (${c.ok}/${c.total})`;
  const soldeOk = d.paiements.filter((p) => !p.encaisse).length === 0;
  const acompte = d.paiements.find((p) => p.echeance === "acompte");

  switch (d.etape) {
    case 1:
      return [
        { label: "Qualification faite", fait: d.qualification.length > 0 },
        {
          label: "Coordonnées du client complètes",
          fait: Boolean(d.client.nom && d.client.telephone && d.client.ville && d.client.naissance),
        },
        {
          label: "Reçu remis au client",
          fait: d.recuRemis,
          aide: "C'est le reçu qui indique au client les pièces à rapporter.",
        },
      ];
    case 2:
      return [
        { label: "Passeport renseigné", fait: Boolean(d.client.passeportNumero) },
        { label: "Dossier créé sur France-Visas", fait: d.franceVisasFait },
        { label: "Numéro France-Visas / RCPC enregistré", fait: Boolean(d.franceVisasRef) },
        ...(ACOMPTE_PCT[d.modalitePaiement] > 0 && acompte
          ? [
              {
                label: `Acompte de ${Math.round(ACOMPTE_PCT[d.modalitePaiement] * 100)} % encaissé`,
                fait: acompte.encaisse,
              },
            ]
          : []),
      ];
    case 3:
      return [
        { label: "Dossier France-Visas confirmé", fait: d.franceVisasFait },
        { label: `Rendez-vous pris · ${d.centre}`, fait: d.rdvPris },
        { label: "Date du rendez-vous enregistrée", fait: Boolean(d.rdvDate) },
      ];
    case 4:
      return [
        {
          label: "Téléversement autorisé",
          fait: d.uploadAutorise,
          aide: "Un responsable (CEO ou Réception) doit autoriser le dossier.",
        },
        {
          label: piecesLabel,
          fait: piecesOk,
          aide: "Le dossier remis au client doit être complet : le centre peut refuser le dépôt.",
        },
        { label: "Solde encaissé", fait: soldeOk },
      ];
    case 5:
      return [
        { label: "Décision du consulat enregistrée", fait: d.decision !== "en_attente" },
        ...(d.decision === "refuse"
          ? [{ label: "Motif du refus enregistré", fait: Boolean(d.decisionMotif) }]
          : []),
      ];
    default:
      return [];
  }
}

/**
 * Blocages transverses, hors de la checklist d'étape : ce qui peut faire échouer le
 * dossier quelle que soit l'étape où il se trouve.
 */
export function alertes(d: Dossier): string[] {
  const out: string[] = [];

  // Passeport - pièce bloquante, indépendante de l'avancement du dossier.
  const statutPasseport = passeportStatut(d);
  const minimumPasseport = passeportExpirationMinimale(d);
  const jusquAu = minimumPasseport
    ? ` Il doit être valable jusqu'au ${new Date(minimumPasseport).toLocaleDateString("fr-FR")} au moins.`
    : "";
  if (statutPasseport === "expire")
    out.push(
      "Passeport expiré : le client doit le faire renouveler avant toute démarche, aucune pièce du dossier ne peut compenser.",
    );
  else if (statutPasseport === "expire_pendant_sejour")
    out.push(
      `Le passeport expire PENDANT le séjour, avant même la date de retour prévue : renouvellement indispensable.${jusquAu}`,
    );
  else if (statutPasseport === "marge_insuffisante")
    out.push(
      `Passeport insuffisamment valide : il doit rester valable au moins 3 mois après le retour.${jusquAu}`,
    );

  if (d.caseKey === "tc3" && d.etape < 2)
    out.push(
      "Autorisation de travail employeur à vérifier avant toute autre pièce, sinon le dossier est bloqué.",
    );
  if (d.niveau === "complexe")
    out.push(
      "Cas complexe : hors pack standard, faire valider par un accompagnement dédié avant d'encaisser un solde.",
    );

  // Incohérences d'ordre : une étape franchie sans que la précédente soit acquise.
  if (d.etape >= 2 && !d.recuRemis)
    out.push("Reçu non remis au client alors que le dossier a quitté la réception.");
  if (d.etape >= 3 && !d.franceVisasFait)
    out.push("Rendez-vous engagé alors que le dossier n'est pas créé sur France-Visas.");
  if (d.etape >= 4 && !d.rdvPris)
    out.push("Rassemblement engagé alors qu'aucun rendez-vous n'est enregistré au centre.");
  if (d.etape >= 5 && d.decision === "en_attente")
    out.push("Décision du consulat non enregistrée : à saisir dès que le client la reçoit.");

  return out;
}

/** Pays de destination, déduit du centre de dépôt (BLS = Espagne, sinon France). */
export function paysCentre(centre: Centre): string {
  return centre.includes("BLS") ? "Espagne" : "France";
}

/**
 * Dossier créé AVANT la qualification (l'agent enregistre d'abord le client, la
 * Boussole qualifie ensuite) : `case_key` provisoire tant que le cas n'est pas
 * retenu. La fiche affiche alors un bandeau « Qualification à compléter ».
 */
export const CASE_PROVISOIRE = "PENDING";
export const TITRE_PROVISOIRE = "Dossier à qualifier";
export const CATEGORIE_PROVISOIRE = "Qualification en cours";

/** Une ligne de reçu : libellé, montant, date (texte libre, ex. « aujourd'hui »), encaissement. */
export interface RecuLigne {
  libelle: string;
  montant: number;
  date: string | null;
  encaisse: boolean;
}

/** Une pièce telle qu'imprimée sur un reçu : affichée ou masquée, fournie ou non. */
export interface RecuPiece {
  label: string;
  source: "officiel" | "eiden";
  fourni: boolean;
  /** Ligne masquée du reçu (reste dans le dossier). Absent = affichée. */
  masque?: boolean | undefined;
}

/**
 * Données complètes d'un reçu (officiel ou brouillon) : tout ce qui s'affiche à
 * l'écran et s'imprime en PDF. Le reçu officiel est dérivé du dossier
 * (`defaultRecuDonnees`) ; un brouillon en est une copie modifiable.
 */
export interface RecuDonnees {
  mode: "avant" | "apres";
  clientNom: string;
  clientTelephone: string;
  clientVille: string;
  dossierTitre: string;
  pays: string;
  afficherPieces: boolean;
  pieces: RecuPiece[];
  lignes: RecuLigne[];
  afficherReste: boolean;
  signature: string;
  mentionAccord: string;
  note: string;
  emisLe: string;
}

/** Dérive le reçu officiel du dossier : montants et pièces toujours à jour. */
export function defaultRecuDonnees(d: Dossier): RecuDonnees {
  return {
    mode: "apres",
    clientNom: d.client.nom,
    clientTelephone: d.client.telephone,
    clientVille: d.client.ville,
    dossierTitre: d.titre,
    pays: paysCentre(d.centre),
    afficherPieces: true,
    pieces: d.pieces.map((p) => ({ label: p.label, source: p.source, fourni: p.fourni })),
    lignes: d.paiements.map((p) => ({
      libelle: p.libelle,
      montant: p.montant,
      date: p.date,
      encaisse: p.encaisse,
    })),
    afficherReste: true,
    signature: "Signature du client",
    mentionAccord: "Bon pour accord sur les montants ci-dessus.",
    note:
      "Ce reçu atteste des sommes effectivement encaissées par Eiden Visa au titre de " +
      "l'accompagnement de ce dossier. Les droits de visa réglés directement au centre de dépôt " +
      "(TLScontact ou BLS) n'apparaissent ici que s'ils ont transité par Eiden Visa.",
    emisLe: new Date().toLocaleDateString("fr-FR"),
  };
}

/** Totaux d'un reçu à partir de ses lignes (jamais ceux d'un client : recalculés). */
export function recuTotaux(r: Pick<RecuDonnees, "lignes">) {
  const paye = r.lignes.filter((l) => l.encaisse);
  const du = r.lignes.filter((l) => !l.encaisse);
  return {
    paye,
    du,
    total: paye.reduce((s, p) => s + p.montant, 0),
    reste: du.reduce((s, p) => s + p.montant, 0),
  };
}

/**
 * Écart avec le grand livre : les lignes financières diffèrent-elles du dossier ?
 * Seules les lignes comptent (présentation, notes et pièces n'attestent rien).
 * Un écart impose le filigrane BROUILLON sur l'aperçu comme sur le PDF.
 */
export function recuEcartLedger(d: Dossier, r: RecuDonnees): boolean {
  if (d.paiements.length !== r.lignes.length) return true;
  return d.paiements.some((p, i) => {
    const l = r.lignes[i];
    if (!l) return true;
    return (
      p.libelle !== l.libelle ||
      p.montant !== l.montant ||
      (p.date ?? null) !== l.date ||
      p.encaisse !== l.encaisse
    );
  });
}
