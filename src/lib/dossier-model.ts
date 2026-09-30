/**
 * Modèle opérationnel Eiden Visa : parcours en 7 étapes, paliers de prix.
 * Eiden monte le dossier et le remet scellé ; le client dépose lui-même au centre.
 * Chiffres issus de l'étude EV/2026-08.
 */

import {
  buildCourtSejour,
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
      "Le client est reçu en agence. La réception explique le service, vérifie l'éligibilité de base et fait signer la clause de non-garantie.",
    encaissement: "Gratuit",
    role: "Réception",
  },
  {
    n: 2,
    key: "rassemblement",
    label: "Rassemblement du dossier",
    detail:
      "Le client réunit ses pièces et l'équipe vérifie chaque document un par un. Toute pièce manquante ou non conforme est signalée ici.",
    encaissement: "Acompte selon la modalité choisie",
    role: "Back office",
  },
  {
    n: 3,
    key: "france_visas",
    label: "Création du dossier sur France-Visas",
    detail:
      "Création du compte et saisie du dossier sur le portail France-Visas, à partir des réponses de la qualification.",
    encaissement: "—",
    role: "Back office",
  },
  {
    n: 4,
    key: "rdv",
    label: "Prise de rendez-vous sur TLScontact",
    detail:
      "Recherche d'un créneau et prise du rendez-vous au centre de dépôt. Étape dépendante des disponibilités du centre.",
    encaissement: "—",
    role: "Back office",
  },
  {
    n: 5,
    key: "confirmation_rdv",
    label: "Confirmation du rendez-vous",
    detail:
      "Le rendez-vous est confirmé et le dossier scellé est remis au client, qui se présentera lui-même au centre.",
    encaissement: "Solde du palier choisi",
    role: "Réception",
  },
  {
    n: 6,
    key: "decision",
    label: "Visa approuvé ou refusé",
    detail:
      "Décision du consulat, hors du contrôle d'Eiden mais à enregistrer : approbation ou refus, avec le motif en cas de refus.",
    encaissement: "Droit de visa payé en direct par le client",
    role: "Consulat",
  },
] as const;

export type PackKey = "base" | "voyage" | "global";

export const PACKS: Record<
  PackKey,
  { label: string; prix: number; margeNette: number | null; contenu: string }
> = {
  base: {
    label: "Pack Dossier",
    prix: 700,
    margeNette: 391,
    contenu: "Qualification, constitution et contrôle du dossier.",
  },
  voyage: {
    label: "Pack + pré-réservation voyage",
    prix: 1000,
    margeNette: 500,
    contenu: "Pack Dossier + pré-réservation hôtel et vol via l'agence partenaire.",
  },
  global: {
    label: "Pack Global",
    prix: 1300,
    /** Commission courtier assurance non encore figée (EV/2026-08) : pas de chiffre tant qu'elle n'est pas confirmée. */
    margeNette: null,
    contenu: "Pack voyage + mise en relation courtier assurance (commission non encore figée).",
  },
};

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
 * - `comptant` : il règle le pack en une fois (encaissement au solde, étape 6) ;
 * - `acompte`  : il verse 50 % du prix du pack pour sécuriser l'engagement
 *   (à l'ouverture du dossier, étape 2), le solde des 50 % restant dû à l'étape 6.
 * Les options à la carte (voyage, assurance) sont toujours facturées à part,
 * hors du calcul des 50 %.
 */
export type Modalite = "comptant" | "acompte";
export const MODALITE_LABEL: Record<Modalite, string> = {
  comptant: "Paiement comptant",
  acompte: "Acompte 50 % + solde",
};
export const ACOMPTE_PCT = 0.5;

/** Quand une ligne de paiement est due — la règle métier n'est plus cachée dans le libellé. */
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
 * Échéancier dérivé du pack et de la modalité — jamais saisi à la main.
 * Ne produit que des lignes non encaissées : l'appelant fusionne avec l'historique déjà encaissé.
 */
export function planPaiement(pack: PackKey, modalite: Modalite): Paiement[] {
  const { label, prix } = PACKS[pack];
  if (modalite === "acompte") {
    const acompte = Math.round(prix * ACOMPTE_PCT);
    return [
      {
        libelle: `Acompte 50 % · ${label}`,
        montant: acompte,
        date: null,
        encaisse: false,
        echeance: "acompte",
      },
      {
        libelle: `Solde 50 % · ${label}`,
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
  pack: PackKey,
  modalite: Modalite,
): Paiement[] {
  const gardees = paiements.filter((p) => p.encaisse || p.echeance === "option");
  const echeancesReglees = new Set(
    gardees.filter((p) => p.encaisse).map((p) => p.echeance ?? "solde"),
  );
  const fraiches = planPaiement(pack, modalite).filter((l) => !echeancesReglees.has(l.echeance!));
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

/** Une question posée à la qualification et la réponse donnée par ce client précis. */
export interface QualificationReponse {
  question: string;
  reponse: string;
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
    /** Passeport — `null` tant que la pièce n'est pas passée entre les mains de l'agence. */
    passeportNumero: string | null;
    passeportDelivrance: string | null;
    passeportExpiration: string | null;
    passeportLieu: string | null;
  };
  /** Le fil des questions/réponses de la Boussole pour ce client. Vide pour les dossiers
   * créés avant que ce fil ne soit conservé. */
  qualification: QualificationReponse[];
  agent: string;
  /** Le VRAI compte qui a ouvert ce dossier — sert à filtrer "Mes dossiers" par utilisateur.
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
  pack: PackKey;
  /** `comptant` par défaut pour les dossiers créés avant l'ajout de la modalité. */
  modalitePaiement: Modalite;
  etape: number;
  /** Centre de dépôt visé (le client dépose lui-même — Eiden ne prend pas le rendez-vous). */
  centre: Centre;
  /** Le service ne peut téléverser des documents qu'une fois ce dossier autorisé (CEO/Réception). */
  uploadAutorise: boolean;
  pieces: Piece[];
  paiements: Paiement[];
  notes: string[];
  decision: Decision;
  decisionDate: string | null;
  /** Motif communiqué par le consulat en cas de refus — `null` sinon. */
  decisionMotif: string | null;
  /**
   * Démarches faites HORS de l'application : sur le portail France-Visas puis au centre.
   * L'app ne peut pas les constater elle-même, donc l'agent les déclare — et la référence
   * saisie sert de preuve, sans quoi « étape suivante » ne veut rien dire.
   */
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
  return (
    getFixedCase(caseKey) ?? {
      key: caseKey,
      title: "Cas non qualifié",
      cat: "—",
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
 * Validité du passeport : règle Schengen — il doit rester valable au moins 3 mois
 * après la date de retour prévue. `null` si on ne peut pas trancher (dates absentes).
 */
export function passeportValiditeOk(d: Dossier): boolean | null {
  const { passeportExpiration } = d.client;
  const retour = d.client.voyageFin;
  if (!passeportExpiration || !retour) return null;
  const exp = new Date(passeportExpiration);
  const minimum = new Date(retour);
  minimum.setMonth(minimum.getMonth() + 3);
  return exp.getTime() >= minimum.getTime();
}

/** Blocages détectés par le système, avant que le client ne les découvre. */
export function alertes(d: Dossier): string[] {
  const out: string[] = [];
  const c = completion(d);

  // Étape 2 — rassemblement : c'est ici que la vérification des pièces se joue.
  if (d.etape >= 2 && !d.uploadAutorise)
    out.push("Dossier non autorisé : le service ne peut pas téléverser de documents.");
  if (d.etape >= 2 && c.pct < 100)
    out.push(
      `Rassemblement incomplet : ${c.total - c.ok} pièce(s) officielle(s) sur ${c.total} manquent encore.`,
    );

  // Passeport — pièce bloquante, contrôlée dès qu'on connaît sa date d'expiration.
  if (d.etape >= 2 && !d.client.passeportNumero)
    out.push("Informations du passeport non renseignées : à saisir avant France-Visas.");
  if (passeportValiditeOk(d) === false)
    out.push(
      "Passeport insuffisamment valide : il doit rester valable au moins 3 mois après la date de retour prévue.",
    );

  // Étape 3 — France-Visas : rien ne doit partir sur le portail avec un dossier incomplet.
  if (d.etape >= 3 && c.pct < 100)
    out.push("Dossier saisi sur France-Visas alors que des pièces officielles manquent encore.");
  if (d.etape >= 4 && !d.franceVisasFait)
    out.push(
      "Rendez-vous engagé alors que la création du dossier sur France-Visas n'est pas confirmée.",
    );
  if (d.franceVisasFait && !d.franceVisasRef)
    out.push("Dossier France-Visas déclaré créé sans numéro de référence enregistré.");

  // Étape 4/5 — rendez-vous puis remise du dossier scellé.
  if (d.etape >= 5 && !d.rdvPris)
    out.push("Rendez-vous non confirmé : aucune prise de rendez-vous n'est enregistrée au centre.");
  if (d.rdvPris && !d.rdvDate) out.push("Rendez-vous déclaré pris sans date enregistrée.");
  if (d.etape >= 5 && c.pct < 100)
    out.push(
      `Rendez-vous confirmé alors que ${c.total - c.ok} pièce(s) officielle(s) manquent : le client risque un refus de dépôt au centre.`,
    );

  if (d.caseKey === "tc3" && d.etape < 3)
    out.push(
      "Autorisation de travail employeur à vérifier avant toute autre pièce, sinon le dossier est bloqué.",
    );
  if (d.niveau === "complexe")
    out.push(
      "Cas complexe : hors pack standard, faire valider par un accompagnement dédié avant d'encaisser un solde.",
    );

  // Paiements — acompte à l'étape 2 (rassemblement), solde à l'étape 5 (confirmation du RDV).
  if (d.modalitePaiement === "acompte" && d.etape >= 2) {
    const acompte = d.paiements.find((p) => p.echeance === "acompte");
    if (acompte && !acompte.encaisse)
      out.push("Acompte de 50 % non encaissé : l'engagement du client n'est pas sécurisé.");
  }
  const impayes = d.paiements.filter((p) => !p.encaisse);
  if (d.etape >= 5 && impayes.length)
    out.push(`Solde non encaissé : ${impayes.map((p) => p.libelle).join(", ")}.`);

  // Étape 6 — la décision doit être enregistrée, sinon le dossier reste en suspens.
  if (d.etape >= 6 && d.decision === "en_attente")
    out.push("Décision du consulat non enregistrée : à saisir dès que le client la reçoit.");
  if (d.decision === "refuse" && !d.decisionMotif)
    out.push("Visa refusé sans motif enregistré : le motif conditionne toute nouvelle tentative.");

  return out;
}
