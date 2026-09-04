/**
 * Modèle opérationnel Eiden Visa : parcours en 7 étapes, paliers de prix,
 * frais reversés aux centres. Chiffres issus de l'étude EV/2026-08.
 */

import { buildCourtSejour, getFixedCase, type CaseResult, type Level, type Profile } from "./visa-rules";

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
    label: "Qualification & recherche de créneau",
    detail:
      "Création de la fiche France-Visas, qualification du type de visa via la Boussole, recherche d'un créneau TLScontact.",
    encaissement: "309 MAD, encaissés seulement une fois la date confirmée",
    role: "Back office",
  },
  {
    n: 3,
    key: "attente",
    label: "Attente de créneau",
    detail: "Délai hors contrôle d'Eiden. C'est ici que le dossier peut stagner : à surveiller chaque jour.",
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
      "Paiement du solde selon le palier. Les frais consulaires restants sont payés par le client en direct chez TLS.",
    encaissement: "Solde du palier choisi",
    role: "Réception",
  },
  {
    n: 7,
    key: "depot",
    label: "Dépôt chez TLS",
    detail: "Le client se présente au rendez-vous avec un dossier complet. Fin du cycle Eiden Visa.",
    encaissement: "Droit de visa payé en direct par le client",
    role: "Client",
  },
] as const;

export type PackKey = "base" | "voyage" | "global";

export const PACKS: Record<PackKey, { label: string; prix: number; margeNette: number; contenu: string }> = {
  base: {
    label: "Pack Dossier",
    prix: 700,
    margeNette: 391,
    contenu: "Qualification, rendez-vous, constitution et contrôle du dossier.",
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
    margeNette: 500,
    contenu: "Pack voyage + mise en relation courtier assurance (commission non encore figée).",
  },
};

export const FRAIS = {
  rdvTls: 309,
  rdvBls: 186,
  droitVisaAdulte: "≈ 90 € (≈ 950 MAD), payé en direct par le client",
  droitVisaMineur: "≈ 45 € (≈ 480 MAD) selon la tranche d'âge",
};

export interface Piece {
  label: string;
  /** officiel = exigé par France-Visas · eiden = recommandation interne */
  source: "officiel" | "eiden";
  fourni: boolean;
}

export interface Paiement {
  libelle: string;
  montant: number;
  date: string | null;
  encaisse: boolean;
}

export interface RendezVous {
  centre: "TLScontact Agadir" | "TLScontact Casablanca" | "BLS Espagne Agadir";
  date: string | null;
  heure: string | null;
  statut: "recherche" | "confirme" | "depose";
}

export interface Dossier {
  id: string;
  client: { nom: string; telephone: string; ville: string; naissance: string };
  agent: string;
  ouvertLe: string;
  caseKey: string;
  profile: Profile;
  titre: string;
  categorie: string;
  niveau: Level;
  pack: PackKey;
  etape: number;
  rdv: RendezVous;
  pieces: Piece[];
  paiements: Paiement[];
  notes: string[];
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
  return { ok, total: officiels.length, pct: officiels.length ? Math.round((ok / officiels.length) * 100) : 0 };
}

export function encaisse(d: Dossier) {
  return d.paiements.filter((p) => p.encaisse).reduce((s, p) => s + p.montant, 0);
}

/** Blocages détectés par le système, avant que le client ne les découvre. */
export function alertes(d: Dossier): string[] {
  const out: string[] = [];
  const c = completion(d);
  if (d.etape >= 3 && d.rdv.statut === "recherche")
    out.push("Aucun créneau confirmé : le dossier ne peut pas avancer au-delà de l'attente.");
  if (d.etape >= 6 && c.pct < 100)
    out.push(`Solde en cours alors que ${c.total - c.ok} pièce(s) officielle(s) manquent encore.`);
  if (d.caseKey === "tc3" && d.etape < 4)
    out.push("Autorisation de travail employeur à vérifier avant toute autre pièce, sinon le dossier est bloqué.");
  if (d.niveau === "complexe")
    out.push("Cas complexe : hors pack standard, faire valider par un accompagnement dédié avant d'encaisser un solde.");
  const impayes = d.paiements.filter((p) => !p.encaisse);
  if (d.etape >= 6 && impayes.length) out.push(`Solde non encaissé : ${impayes.map((p) => p.libelle).join(", ")}.`);
  return out;
}
