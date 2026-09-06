import {
  piecesFromCase,
  resolveCase,
  type Dossier,
  type PackKey,
  type Paiement,
  type RendezVous,
} from "./dossier-model";
import type { Profile } from "./visa-rules";

interface SeedInput {
  id: string;
  nom: string;
  telephone: string;
  ville: string;
  naissance: string;
  agent: string;
  ouvertLe: string;
  caseKey: string;
  profile: Profile;
  pack: PackKey;
  etape: number;
  rdv: RendezVous;
  fournis: number[] | "tout";
  paiements: Paiement[];
  notes?: string[];
}

const SEED: SeedInput[] = [
  {
    id: "EV-2026-0141",
    nom: "Hafsa Bouzid",
    telephone: "06 61 84 22 07",
    ville: "Agadir",
    naissance: "12/03/1989",
    agent: "Réception · Salma",
    ouvertLe: "02/09/2026",
    caseKey: "DYNAMIC",
    profile: { base: "tourisme", prof: "salarie", married: true, visaHist: true },
    pack: "voyage",
    etape: 6,
    rdv: { centre: "TLScontact Agadir", date: "24/09/2026", heure: "09:20", statut: "confirme" },
    fournis: "tout",
    paiements: [
      { libelle: "Frais de rendez-vous TLS", montant: 309, date: "05/09/2026", encaisse: true },
      { libelle: "Solde Pack + voyage", montant: 1000, date: null, encaisse: false },
    ],
  },
  {
    id: "EV-2026-0140",
    nom: "Youssef El Amrani",
    telephone: "06 70 15 39 88",
    ville: "Inezgane",
    naissance: "27/11/1994",
    agent: "Préparation · Nabil",
    ouvertLe: "01/09/2026",
    caseKey: "tc3",
    profile: {},
    pack: "base",
    etape: 2,
    rdv: { centre: "TLScontact Casablanca", date: null, heure: null, statut: "recherche" },
    fournis: [0, 1],
    paiements: [{ libelle: "Frais de rendez-vous TLS", montant: 309, date: null, encaisse: false }],
    notes: ["Employeur contacté le 03/09 : autorisation de travail pas encore déposée sur le portail."],
  },
  {
    id: "EV-2026-0139",
    nom: "Fatima Zahra Ait Baha",
    telephone: "06 12 44 90 51",
    ville: "Agadir",
    naissance: "05/07/1957",
    agent: "Préparation · Nabil",
    ouvertLe: "29/08/2026",
    caseKey: "DYNAMIC",
    profile: { base: "visite_enfant_parent", prof: "retraite", married: false },
    pack: "base",
    etape: 4,
    rdv: { centre: "TLScontact Agadir", date: "19/09/2026", heure: "11:00", statut: "confirme" },
    fournis: [0, 1, 3, 4, 6, 7],
    paiements: [{ libelle: "Frais de rendez-vous TLS", montant: 309, date: "30/08/2026", encaisse: true }],
    notes: ["Fille française résidant à Lyon : attestation d'accueil déposée en mairie, en attente du tampon."],
  },
  {
    id: "EV-2026-0138",
    nom: "Karim Oulhaj",
    telephone: "06 55 71 08 34",
    ville: "Taroudant",
    naissance: "18/01/1982",
    agent: "Réception · Salma",
    ouvertLe: "28/08/2026",
    caseKey: "tc1",
    profile: {},
    pack: "global",
    etape: 7,
    rdv: { centre: "TLScontact Agadir", date: "08/09/2026", heure: "08:40", statut: "depose" },
    fournis: "tout",
    paiements: [
      { libelle: "Frais de rendez-vous TLS", montant: 309, date: "29/08/2026", encaisse: true },
      { libelle: "Solde Pack Global", montant: 1300, date: "06/09/2026", encaisse: true },
    ],
    notes: ["Déplacement salon Agro Lyon. Lettre de mission de l'entreprise marocaine jointe."],
  },
  {
    id: "EV-2026-0137",
    nom: "Salima Benhima",
    telephone: "06 38 27 61 19",
    ville: "Agadir",
    naissance: "22/05/1991",
    agent: "Back office · Imane",
    ouvertLe: "26/08/2026",
    caseKey: "t3",
    profile: {},
    pack: "base",
    etape: 1,
    rdv: { centre: "TLScontact Casablanca", date: null, heure: null, statut: "recherche" },
    fournis: [0, 1],
    paiements: [],
    notes: ["Conjoint français. Cas complexe : rendez-vous avocat partenaire proposé avant tout encaissement de solde."],
  },
  {
    id: "EV-2026-0136",
    nom: "Mehdi Tazi",
    telephone: "06 44 90 12 76",
    ville: "Agadir",
    naissance: "03/09/1996",
    agent: "Back office · Imane",
    ouvertLe: "24/08/2026",
    caseKey: "DYNAMIC",
    profile: { base: "famille_ue", dependent: true },
    pack: "base",
    etape: 3,
    rdv: { centre: "TLScontact Agadir", date: null, heure: null, statut: "recherche" },
    fournis: [0, 1, 3, 4],
    paiements: [{ libelle: "Frais de rendez-vous TLS", montant: 309, date: null, encaisse: false }],
    notes: ["Rejoint son père, ressortissant espagnol résidant à Valence. Ne pas ajouter de pièces hors liste UE."],
  },
  {
    id: "EV-2026-0135",
    nom: "Rachid & Nadia Amzil",
    telephone: "06 21 63 47 90",
    ville: "Ait Melloul",
    naissance: "14/02/1985",
    agent: "Préparation · Nabil",
    ouvertLe: "21/08/2026",
    caseKey: "DYNAMIC",
    profile: { base: "visite_generale", prof: "commercant", married: true, minor: true },
    pack: "voyage",
    etape: 5,
    rdv: { centre: "TLScontact Agadir", date: "17/09/2026", heure: "10:10", statut: "confirme" },
    fournis: [0, 1, 3, 4, 5, 6, 8, 9],
    paiements: [
      { libelle: "Frais de rendez-vous TLS (x2)", montant: 618, date: "23/08/2026", encaisse: true },
      { libelle: "Pré-réservation voyage", montant: 300, date: "04/09/2026", encaisse: true },
    ],
    notes: ["Un enfant de 9 ans au dossier : autorisation de sortie du territoire à légaliser côté marocain."],
  },
  {
    id: "EV-2026-0134",
    nom: "Abdellah Ouchen",
    telephone: "06 09 55 31 42",
    ville: "Biougra",
    naissance: "30/06/1968",
    agent: "Réception · Salma",
    ouvertLe: "19/08/2026",
    caseKey: "eout",
    profile: {},
    pack: "base",
    etape: 1,
    rdv: { centre: "TLScontact Agadir", date: null, heure: null, statut: "recherche" },
    fournis: [],
    paiements: [{ libelle: "Consultation d'orientation", montant: 100, date: "19/08/2026", encaisse: true }],
    notes: ["Fils étudiant : orienté Campus France, aucun dossier construit par Eiden Visa."],
  },
  {
    id: "EV-2026-0133",
    nom: "Naima Lahlou",
    telephone: "06 77 02 84 65",
    ville: "Agadir",
    naissance: "09/12/1979",
    agent: "Préparation · Nabil",
    ouvertLe: "17/08/2026",
    caseKey: "DYNAMIC",
    profile: { base: "tourisme", prof: "agriculteur", married: true, spouseNoJob: true },
    pack: "base",
    etape: 7,
    rdv: { centre: "TLScontact Agadir", date: "02/09/2026", heure: "14:30", statut: "depose" },
    fournis: "tout",
    paiements: [
      { libelle: "Frais de rendez-vous TLS", montant: 309, date: "18/08/2026", encaisse: true },
      { libelle: "Solde Pack Dossier", montant: 700, date: "31/08/2026", encaisse: true },
    ],
  },
];

export function buildSeed(): Dossier[] {
  return SEED.map((s) => {
    const c = resolveCase(s.caseKey, s.profile);
    const pieces = piecesFromCase(
      c,
      s.fournis === "tout" ? c.docs.map((_, i) => i) : s.fournis,
    );
    return {
      id: s.id,
      client: { nom: s.nom, telephone: s.telephone, ville: s.ville, naissance: s.naissance },
      agent: s.agent,
      agentUserId: null,
      ouvertLe: s.ouvertLe,
      caseKey: s.caseKey,
      profile: s.profile,
      titre: c.title,
      categorie: c.cat,
      niveau: c.level,
      pack: s.pack,
      etape: s.etape,
      rdv: s.rdv,
      pieces,
      paiements: s.paiements,
      notes: [...(s.notes ?? []), ...c.notes],
      decision: "en_attente",
      decisionDate: null,
    } satisfies Dossier;
  });
}
