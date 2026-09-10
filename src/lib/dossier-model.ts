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
    key: "accueil",
    label: "Accueil & diagnostic",
    detail:
      "Le client est reçu en devanture. La réception explique le service, vérifie l'éligibilité de base et fait signer la clause de non-garantie.",
    encaissement: "Gratuit",
    role: "Réception",
  },
  {
    n: 2,
    key: "creneau",
    label: "Qualification & ouverture du dossier",
    detail:
      "Création de la fiche France-Visas et qualification du type de visa via la Boussole. Autorisation du dossier avant de commencer à réunir les pièces.",
    encaissement: "Acompte selon la modalité choisie",
    role: "Back office",
  },
  {
    n: 3,
    key: "attente",
    label: "Dossier en préparation",
    detail:
      "Le client réunit ses pièces, l'équipe suit l'avancement au jour le jour. C'est ici que le dossier peut stagner : à surveiller.",
    encaissement: "—",
    role: "Back office",
  },
  {
    n: 4,
    key: "constitution",
    label: "Constitution du dossier",
    detail:
      "Le client revient en agence : complétion pièce par pièce, photos aux normes prises sur place, contrôle qualité.",
    encaissement: "—",
    role: "Préparation",
  },
  {
    n: 5,
    key: "options",
    label: "Options à la carte",
    detail:
      "Pré-réservation hôtel/vol via l'agence partenaire (jamais une vente ferme), assurance via un courtier agréé qui facture le client en direct.",
    encaissement: "+300 MAD voyage · commission assurance",
    role: "Back office",
  },
  {
    n: 6,
    key: "solde",
    label: "Solde & remise du dossier scellé",
    detail:
      "Paiement du solde selon le palier. Les frais consulaires restants sont payés par le client en direct au centre.",
    encaissement: "Solde du palier choisi",
    role: "Réception",
  },
  {
    n: 7,
    key: "depot",
    label: "Dépôt au centre",
    detail:
      "Le client dépose lui-même son dossier complet au centre de dépôt (TLScontact ou BLS). Fin du cycle Eiden Visa.",
    encaissement: "Droit de visa payé en direct par le client",
    role: "Client",
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
 * - `acompte`  : il verse 20 % du prix du pack pour sécuriser l'engagement
 *   (à l'ouverture du dossier, étape 2), le solde des 80 % restant dû à l'étape 6.
 * Les options à la carte (voyage, assurance) sont toujours facturées à part,
 * hors du calcul des 20 %.
 */
export type Modalite = "comptant" | "acompte";
export const MODALITE_LABEL: Record<Modalite, string> = {
  comptant: "Paiement comptant",
  acompte: "Acompte 20 % + solde",
};
export const ACOMPTE_PCT = 0.2;

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
        libelle: `Acompte 20 % · ${label}`,
        montant: acompte,
        date: null,
        encaisse: false,
        echeance: "acompte",
      },
      {
        libelle: `Solde 80 % · ${label}`,
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

export const CENTRES = [
  "TLScontact Agadir",
  "TLScontact Casablanca",
  "BLS Espagne Agadir",
] as const;
export type Centre = (typeof CENTRES)[number];

/** Ce qui se passe après l'étape 7 : la décision du consulat, hors du contrôle d'Eiden. */
export type Decision = "en_attente" | "approuve" | "refuse";
export const DECISION_LABEL: Record<Decision, string> = {
  en_attente: "En attente de décision",
  approuve: "Visa approuvé",
  refuse: "Visa refusé",
};

export interface Dossier {
  id: string;
  client: { nom: string; telephone: string; ville: string; naissance: string };
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

/** Blocages détectés par le système, avant que le client ne les découvre. */
export function alertes(d: Dossier): string[] {
  const out: string[] = [];
  const c = completion(d);
  if (d.etape >= 2 && !d.uploadAutorise)
    out.push("Dossier non autorisé : le service ne peut pas téléverser de documents.");
  if (d.etape >= 6 && c.pct < 100)
    out.push(`Solde en cours alors que ${c.total - c.ok} pièce(s) officielle(s) manquent encore.`);
  if (d.caseKey === "tc3" && d.etape < 4)
    out.push(
      "Autorisation de travail employeur à vérifier avant toute autre pièce, sinon le dossier est bloqué.",
    );
  if (d.niveau === "complexe")
    out.push(
      "Cas complexe : hors pack standard, faire valider par un accompagnement dédié avant d'encaisser un solde.",
    );
  if (d.modalitePaiement === "acompte" && d.etape >= 2) {
    const acompte = d.paiements.find((p) => p.echeance === "acompte");
    if (acompte && !acompte.encaisse)
      out.push("Acompte de 20 % non encaissé : l'engagement du client n'est pas sécurisé.");
  }
  const impayes = d.paiements.filter((p) => !p.encaisse);
  if (d.etape >= 6 && impayes.length)
    out.push(`Solde non encaissé : ${impayes.map((p) => p.libelle).join(", ")}.`);
  return out;
}
