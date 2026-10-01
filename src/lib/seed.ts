import {
  piecesFromCase,
  resolveCase,
  type Centre,
  type Dossier,
  type Modalite,
  type PackKey,
  type Paiement,
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
  modalite?: Modalite;
  etape: number;
  centre: Centre;
  autorise?: boolean;
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
    modalite: "acompte",
    etape: 5,
    centre: "TLScontact Agadir",
    fournis: "tout",
    // Cliente en modalité acompte : 50 % versés à la confirmation du créneau, solde des 50 %
    // dû à la remise du dossier scellé (étape 6). Aucun "frais de rendez-vous" en plus.
    paiements: [
      {
        libelle: "Acompte 50 % · Pack + pré-réservation voyage",
        montant: 500,
        date: "05/09/2026",
        encaisse: true,
        echeance: "acompte",
      },
      {
        libelle: "Solde 50 % · Pack + pré-réservation voyage",
        montant: 500,
        date: null,
        encaisse: false,
        echeance: "solde",
      },
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
    centre: "TLScontact Agadir",
    fournis: [0, 1],
    paiements: [{ libelle: "Pack Dossier", montant: 700, date: null, encaisse: false }],
    notes: [
      "Employeur contacté le 03/09 : autorisation de travail pas encore déposée sur le portail.",
    ],
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
    centre: "TLScontact Agadir",
    autorise: true,
    fournis: [0, 1, 3, 4, 6, 7],
    paiements: [{ libelle: "Pack Dossier", montant: 700, date: "30/08/2026", encaisse: true }],
    notes: [
      "Fille française résidant à Lyon : attestation d'accueil déposée en mairie, en attente du tampon.",
    ],
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
    etape: 5,
    centre: "TLScontact Agadir",
    autorise: true,
    fournis: "tout",
    paiements: [{ libelle: "Pack Global", montant: 1300, date: "06/09/2026", encaisse: true }],
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
    centre: "TLScontact Agadir",
    fournis: [0, 1],
    paiements: [],
    notes: [
      "Conjoint français. Cas complexe : rendez-vous avocat partenaire proposé avant tout encaissement de solde.",
    ],
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
    centre: "TLScontact Agadir",
    fournis: [0, 1, 3, 4],
    paiements: [{ libelle: "Pack Dossier", montant: 700, date: null, encaisse: false }],
    notes: [
      "Rejoint son père, ressortissant espagnol résidant à Valence. Ne pas ajouter de pièces hors liste UE.",
    ],
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
    centre: "TLScontact Agadir",
    autorise: true,
    fournis: [0, 1, 3, 4, 5, 6, 8, 9],
    paiements: [
      {
        libelle: "Pack + pré-réservation voyage",
        montant: 1000,
        date: "23/08/2026",
        encaisse: true,
      },
      { libelle: "Pré-réservation voyage", montant: 300, date: "04/09/2026", encaisse: true },
    ],
    notes: [
      "Un enfant de 9 ans au dossier : autorisation de sortie du territoire à légaliser côté marocain.",
    ],
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
    centre: "TLScontact Agadir",
    fournis: [],
    paiements: [
      { libelle: "Consultation d'orientation", montant: 100, date: "19/08/2026", encaisse: true },
    ],
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
    etape: 5,
    centre: "TLScontact Agadir",
    autorise: true,
    fournis: "tout",
    paiements: [{ libelle: "Pack Dossier", montant: 700, date: "31/08/2026", encaisse: true }],
  },
];

export function buildSeed(): Dossier[] {
  return SEED.map((s) => {
    const c = resolveCase(s.caseKey, s.profile);
    const pieces = piecesFromCase(c, s.fournis === "tout" ? c.docs.map((_, i) => i) : s.fournis);
    return {
      id: s.id,
      client: {
        nom: s.nom,
        telephone: s.telephone,
        ville: s.ville,
        naissance: s.naissance,
        voyageDebut: null,
        voyageFin: null,
        passeportNumero: null,
        passeportDelivrance: null,
        passeportExpiration: null,
        passeportLieu: null,
      },
      qualification: [],
      agent: s.agent,
      agentUserId: null,
      assigneeUserId: null,
      ouvertLe: s.ouvertLe,
      caseKey: s.caseKey,
      profile: s.profile,
      titre: c.title,
      categorie: c.cat,
      niveau: c.level,
      pack: s.pack,
      modalitePaiement: s.modalite ?? "comptant",
      etape: s.etape,
      centre: s.centre,
      uploadAutorise: s.autorise ?? false,
      pieces,
      // Backfill de l'échéance sur les lignes qui n'en portent pas : les options à la carte
      // sont identifiées par leur libellé, tout le reste est un solde.
      paiements: s.paiements.map((p) => ({
        ...p,
        echeance:
          p.echeance ??
          (/pré-réservation|assurance|option|orientation|consultation/i.test(p.libelle)
            ? "option"
            : "solde"),
      })),
      notes: [...(s.notes ?? []), ...c.notes],
      decision: "en_attente",
      decisionDate: null,
      decisionMotif: null,
      notesAgent: [],
      recuRemis: false,
      recuLe: null,
      franceVisasFait: false,
      franceVisasRef: null,
      franceVisasLe: null,
      rdvPris: false,
      rdvDate: null,
      rdvLe: null,
    } satisfies Dossier;
  });
}
