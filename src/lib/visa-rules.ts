/**
 * Référentiel de qualification Eiden Visa.
 *
 * Source unique de vérité : les règles reprises de la formation visa du 27/08/2026
 * et des simulations officielles France-Visas. Aucune règle n'est écrite ailleurs
 * dans l'application : les écrans ne font que lire ce fichier.
 */

export type Level = "standard" | "attention" | "complexe";

export interface CaseResult {
  key: string;
  title: string;
  cat: string;
  level: Level;
  /** Pièces exigées par France-Visas / le consulat. */
  docs: string[];
  /** Pièces non exigées, ajoutées par Eiden pour renforcer le dossier. */
  extra: string[];
  /** Points de vigilance à dire au client. */
  notes: string[];
}

export const LEVEL_LABEL: Record<Level, string> = {
  standard: "Dossier standard",
  attention: "Vigilance",
  complexe: "Cas complexe",
};

export interface Profile {
  base?:
    | "tourisme"
    | "visite_generale"
    | "visite_enfant_parent"
    | "famille_ue"
    | "visite_familiale_membre"
    | "enfant_parent_francais"
    | "en_vue_mariage";
  dependent?: boolean;
  minor?: boolean;
  married?: boolean;
  spouseNoJob?: boolean;
  visaHist?: boolean;
  grandchildNote?: boolean;
  prof?:
    | "salarie"
    | "fonctionnaire"
    | "commercant"
    | "avocat_medical"
    | "agriculteur"
    | "retraite"
    | "etudiant"
    | "sans";
  /** Durée du séjour — Branche A (Tourisme), Q7. ≤ 90 jours = court, > 90 = long. */
  duree?: "court" | "long";
  /** Q22 — où le demandeur séjourne pendant le voyage. */
  hebergement?: "hotel" | "personne" | "autre";
  /** Moyen de transport — pose la pièce « billet aller-retour » sur le bon support. */
  transport?: "avion" | "autobus" | "bateau";
  /** En vue de mariage : certificat de la mairie (bans publiés sans opposition) disponible. */
  bansCertificat?: boolean;
  /** En vue de mariage : le/la futur(e) conjoint(e) est de nationalité française. */
  futurConjointFrancais?: boolean;
  /** Q35 — qui finance le voyage. */
  financePar?: "soi_meme" | "garant";
  /** Q-F3 (questions finales communes) — déclenche les pièces d'état civil. */
  situationFamiliale?: "celibataire" | "marie" | "divorce" | "veuf" | "autre";
  /** Étape 1 — Q1 : a déjà obtenu un visa pour la France. */
  visaAnterieur?: boolean;
  /** Étape 1 — Q4 : a déjà essuyé un refus de visa Schengen. */
  refusVisa?: boolean;
  /** Branche A, Q15 : accompagne/rejoint un membre de famille UE/EEE — ajoute des pièces,
   * sans remplacer le dossier tourisme (contrairement à la branche « famille UE » historique). */
  ueEeeFamily?: boolean;

  /* ---- Long séjour (Visa D). Champs à plat et non imbriqués : la fusion des réponses
     de l'arbre est superficielle, un objet imbriqué écraserait les réponses précédentes. ---- */
  /** Q1 long séjour — motif principal du séjour. */
  lsMotif?: "etudes" | "travail" | "famille" | "visiteur" | "stage" | "autre";
  /** Études — type de projet. */
  lsEtudesType?: "superieures" | "pro" | "privee" | "autre";
  /** Études — déjà accepté par un établissement en France. */
  lsAdmission?: boolean;
  /** Études / stage — durée annoncée, pour rattraper un dossier qui relève du court séjour. */
  lsDureeCourte?: boolean;
  /** Études — qui finance. */
  lsFinancement?: "soi" | "parents" | "famille" | "tiers" | "bourse";
  /** Travail — type d'activité exercée en France. */
  lsTravailType?: "salarie" | "temporaire" | "saisonnier" | "talent" | "entrepreneur" | "autre";
  /** Travail — contrat ou promesse d'embauche en main. */
  lsContrat?: boolean;
  /** Travail — autorisation de travail obtenue par l'employeur. */
  lsAutorisationTravail?: "oui" | "non" | "inconnu";
  /** Travail — nature du contrat. */
  lsTypeContrat?: "cdi" | "cdd" | "saisonnier" | "autre";
  /** Famille — qui le demandeur rejoint en France. */
  lsFamilleQui?: "conjoint" | "parent_enfant" | "ascendant" | "enfant" | "autre";
  /** Famille — la personne rejointe est de nationalité française. */
  lsPersonneFrancaise?: boolean;
  /** Famille, ascendant — à la charge du descendant en France. */
  lsAscendantCharge?: boolean;
  /** Visiteur — situation socio-économique déclarée. */
  lsSituation?: "salarie" | "fonctionnaire" | "retraite" | "etudiant" | "sans" | "autre";
  /** Visiteur — qui finance le séjour. */
  lsFinanceSejour?: "soi" | "famille" | "autre";
  /** Visiteur — fonds suffisants déclarés. */
  lsFonds?: boolean;
  /** Visiteur — nature du logement en France. */
  lsLogement?: "propriete" | "location" | "heberge" | "autre";
  /** Stage — le demandeur est étudiant ou en formation. */
  lsStageEtudiant?: boolean;
  /** Stage — convention de stage signée. */
  lsConvention?: boolean;

  /** Réponses en texte libre (noms, dates, adresses...) — sans incidence sur la checklist,
   * mais nécessaires pour compléter le dossier. Clé = TreeField.key, valeur = saisie brute. */
  details?: Record<string, string>;
}

/* ============ CAS À RÉSULTAT FIGÉ ============ */

const FIXED: Record<string, Omit<CaseResult, "key">> = {
  t3: {
    title: "VLS-TS « vie privée et familiale » · conjoint de Français",
    cat: "Long séjour (Visa D) · installation durable",
    level: "complexe",
    docs: [
      "Passeport valide",
      "Formulaire de demande de visa long séjour (Cerfa n°14571*05)",
      "3 photos d'identité",
      "Acte de mariage transcrit ou reconnu en France (traduction officielle si célébré à l'étranger)",
      "Preuve de la nationalité française du conjoint (CNI ou passeport)",
      "Justificatifs de vie commune",
      "Justificatif de logement du couple",
      "Justificatifs de ressources du conjoint français",
      "Extrait de casier judiciaire",
      "Certificat médical si demandé",
    ],
    extra: [],
    notes: [
      "Dossier sensible : les consulats surveillent particulièrement les mariages jugés « de complaisance », taux de refus/questionnement plus élevé. Accompagnement renforcé, envisager un partenariat avec un avocat spécialisé plutôt qu'un traitement en pack standard.",
    ],
  },
  t4: {
    title: "Regroupement familial classique → à référer",
    cat: "Procédure administrative distincte",
    level: "complexe",
    docs: [],
    extra: [],
    notes: [
      "Ce n'est pas une démarche initiée au consulat par le demandeur : c'est le résident en France qui engage la procédure auprès de l'OFII/préfecture (18 mois de séjour régulier, ressources stables, logement adapté). Le visa n'intervient qu'en toute fin de procédure. Hors format standard : orienter vers un accompagnement dédié ou un service juridique spécialisé.",
    ],
  },
  t5: {
    title: "Autres liens familiaux (parent, fratrie...) → cas particulier",
    cat: "Hors procédure standard",
    level: "complexe",
    docs: [],
    extra: [],
    notes: [
      "Pas de base légale de regroupement direct pour ces liens. Séjour temporaire : traiter comme une visite familiale et privée standard. Installation durable souhaitée : orienter vers une consultation approfondie, ce n'est pas un cas pack standard.",
    ],
  },
  tc1: {
    title: "Visa court séjour Affaires",
    cat: "Court séjour Schengen (Visa C) · déplacement professionnel",
    level: "standard",
    docs: [
      "Formulaire de demande France-Visas rempli, daté et signé + récépissé",
      "Copie du passeport : page d'identité + toutes les pages comportant des visas, tampons d'entrée/sortie ou autres inscriptions (moins de 10 ans, 2 pages vierges, valable 3 mois après le retour)",
      "Note verbale (uniquement si document de voyage officiel/diplomatique)",
      "Invitation d'une entreprise ou d'une autorité pour participer à des conférences, événements de nature commerciale, industrielle ou professionnelle",
      "Pré-réservation de vol aller-retour (via l'agence partenaire)",
      "Situation socio-professionnelle : preuve du statut (contrat de travail, certificat de travail, extrait du registre du commerce et des sociétés) et document démontrant les liens personnels avec le pays de résidence (copie de l'acte de mariage, livret de famille)",
      "Relevés bancaires des 3 derniers mois, carte professionnelle du demandeur ou attestation de l'ordre professionnel",
      "Si fonctionnaire : attestation de fonction ET document attestant des liens personnels dans le pays de résidence",
      "Fonds : relevés bancaires, bulletins de salaire, déclarations de revenus ou toute autre preuve de revenus",
      "Hébergement : réservation d'hôtel, ou justificatifs de ressources suffisantes (120 €/jour), ou contrat de location/titre de propriété ; si hébergement chez un particulier : justificatif de logement (formulaire Cerfa)",
      "Certificat d'assurance voyage",
    ],
    extra: [
      "Lettre d'invitation ou de mission signée par l'entreprise marocaine confirmant l'objet du déplacement (renforce le dossier au-delà du minimum officiel)",
    ],
    notes: [
      "Pas d'autorisation de travail nécessaire : c'est un déplacement, pas une prise de poste en France. Tarif visa standard ≈ 90 € (≈ 950 MAD). Source : simulateur officiel France-Visas (« Voyage d'affaires »).",
    ],
  },
  tc2: {
    title: "Passeport Talent · salarié qualifié",
    cat: "Long séjour (Visa D) · emploi qualifié",
    level: "attention",
    docs: [
      "Passeport valide",
      "Contrat de travail signé (CDI ou CDD) avec l'employeur en France",
      "Diplôme d'au moins Bac+3 (équivalence ENIC-NARIC si diplôme étranger)",
      "Attestation de l'employeur sur la rémunération annuelle brute",
      "Justificatif de logement en France",
      "Engagement de respect des principes de la République",
    ],
    extra: [],
    notes: [
      "Seuil de salaire brut minimum ≈ 39 582 €/an (chiffre 2026, réévalué chaque année : à revérifier avant chaque dossier). Démarche via le portail ANEF, coût ≈ 350 €, délai ≈ 4 mois, validité jusqu'à 4 ans.",
    ],
  },
  tc3: {
    title: "VLS-TS Salarié classique",
    cat: "Long séjour (Visa D) · emploi salarié",
    level: "attention",
    docs: [
      "Passeport valide",
      "Formulaire de demande de visa long séjour (Cerfa n°14571*05)",
      "3 photos d'identité",
      "Contrat de travail avec l'employeur en France",
      "Autorisation de travail obtenue par l'employeur via le portail dédié",
    ],
    extra: [],
    notes: [
      "Point de blocage fréquent : l'employeur doit avoir obtenu l'autorisation de travail AVANT le dépôt. À vérifier en tout premier avec le client, sinon le dossier ne peut pas avancer.",
    ],
  },
  tc4: {
    title: "Salarié détaché / en mission",
    cat: "Long séjour (Visa D) · détachement",
    level: "attention",
    docs: [
      "Passeport valide",
      "Formulaire de demande de visa long séjour",
      "3 photos d'identité",
      "Contrat de détachement ou lettre de mission",
      "Attestation de l'employeur d'origine (au Maroc)",
      "Attestation de l'entreprise d'accueil en France",
      "Justificatif de maintien de la rémunération",
      "Justificatif de logement",
      "Autorisation de travail : autorisation de travail obtenue par votre employeur auprès de l'administration française, sauf dispense pour manifestation, mannequin, détachement pour enseignement et mission d'ingénierie ou expertise",
      "Diplôme : copie des diplômes, justificatifs de qualification et attestations de travail",
    ],
    extra: [],
    notes: [],
  },
  tc5: {
    title: "Travailleur saisonnier",
    cat: "Long séjour (Visa D) · emploi saisonnier",
    level: "attention",
    docs: [
      "Passeport valide",
      "Formulaire de demande de visa long séjour",
      "3 photos d'identité",
      "Contrat de travail saisonnier",
      "Autorisation de travail saisonnière",
      "Justificatif de logement pendant la mission",
    ],
    extra: [],
    notes: [],
  },
  dout: {
    title: "Hors périmètre pour l'instant",
    cat: "Visa santé",
    level: "complexe",
    docs: [],
    extra: [],
    notes: ["Ce type de dossier est volontairement écarté du service Eiden Visa au lancement."],
  },
  eout: {
    title: "Hors périmètre : orienter vers Campus France",
    cat: "Visa étudiant",
    level: "attention",
    docs: [],
    extra: [],
    notes: [
      "Ce type de dossier relève de Campus France, pas d'Eiden Visa. Une consultation d'orientation payante à 100 MAD peut être proposée pour rediriger correctement, sans construire le dossier.",
    ],
  },
  a_long: {
    title: "Tourisme / visite privée · long séjour (Visa D, > 90 jours)",
    cat: "Long séjour (Visa D) · installation ou séjour privé prolongé",
    level: "complexe",
    docs: [],
    extra: [],
    notes: [
      "⚠ La checklist documentaire de référence (Eiden, à partir des listes visa transmises) ne couvre que le court séjour tourisme (≤ 90 jours). Aucun document n'est ajouté ici tant qu'une source dédiée au long séjour n'est pas fournie — dossier à traiter au cas par cas.",
    ],
  },
  b_long: {
    title: "Visite familiale · long séjour (Visa D, > 90 jours)",
    cat: "Long séjour (Visa D) · installation auprès d'un proche",
    level: "complexe",
    docs: [],
    extra: [],
    notes: [
      "⚠ La checklist documentaire de référence ne détaille pas le long séjour familial. Aucun document n'est ajouté ici — dossier à traiter au cas par cas.",
    ],
  },
  b_ue_famille: {
    title: "Visite familiale · famille d'un ressortissant UE/EEE",
    cat: "Court séjour Schengen (Visa C) · libre circulation UE/EEE",
    level: "attention",
    docs: [
      "Preuve du lien familial",
      "Preuve de la nationalité UE/EEE du membre de la famille",
      "Preuve que le demandeur accompagne ou rejoint ce ressortissant",
      "Passeport (visa et cachet) valide 3 mois après la date de retour au Maroc",
      "Formulaire de demande France-Visas rempli, daté et signé + récépissé (Formulaire + RCPC)",
      "2 photos d'identité sur fond blanc",
    ],
    extra: [],
    notes: [
      "Pièces reconstituées à partir de « eiden_visa_assistant_arbre_complet ». Cette liste ne dépend pas de la profession du demandeur — n'ajoutez pas de pièce professionnelle par réflexe.",
    ],
  },
  conjoint_court: {
    title: "Visite privée · conjoint de Français (Visa C)",
    cat: "Court séjour Schengen (Visa C) · visite du conjoint français",
    level: "attention",
    docs: [
      "Passeport (visa et cachet) valide 3 mois après la date de retour au Maroc",
      "Formulaire de demande France-Visas rempli, daté et signé + récépissé (Formulaire + RCPC)",
      "2 photos d'identité sur fond blanc",
      "Transcription récente de l'acte de mariage, datée de moins de 6 mois (service-public.fr)",
      "Preuve de la nationalité française du conjoint",
      "Livret de famille (si applicable)",
      "Assurance voyage",
    ],
    extra: [],
    notes: [
      "Liste courte, sans variante par profession — reprise telle quelle de « eiden_visa_assistant_arbre_complet ». Si le couple souhaite s'installer durablement plutôt que simplement visiter, orienter vers le long séjour conjoint de Français (VLS-TS).",
    ],
  },
  d_refugie: {
    title: "Rejoindre un conjoint / membre de famille réfugié",
    cat: "Long séjour (Visa D) · regroupement familial (statut de réfugié)",
    level: "complexe",
    docs: [],
    extra: [],
    notes: [
      "⚠ La checklist documentaire de référence ne détaille pas cette sous-branche. Aucun document n'est ajouté ici — dossier à traiter au cas par cas, la même logique de questions s'appliquant à la protection subsidiaire et au statut d'apatride.",
    ],
  },
  d_subsidiaire: {
    title: "Rejoindre un conjoint / membre de famille — protection subsidiaire",
    cat: "Long séjour (Visa D) · regroupement familial (protection subsidiaire)",
    level: "complexe",
    docs: [],
    extra: [],
    notes: [
      "⚠ La checklist documentaire de référence ne détaille pas cette sous-branche — même logique que le cas « réfugié ». Aucun document n'est ajouté ici.",
    ],
  },
  d_apatride: {
    title: "Rejoindre un conjoint / membre de famille apatride",
    cat: "Long séjour (Visa D) · regroupement familial (statut d'apatride)",
    level: "complexe",
    docs: [],
    extra: [],
    notes: [
      "⚠ La checklist documentaire de référence ne détaille pas cette sous-branche — même logique que le cas « réfugié ». Aucun document n'est ajouté ici.",
    ],
  },
  c3: {
    title: "Employé par une entreprise étrangère (hors France)",
    cat: "Long séjour (Visa D) · travail",
    level: "complexe",
    docs: [],
    extra: [],
    notes: ["⚠ Documents spécifiques non détaillés dans la liste documentaire fournie."],
  },
  c4: {
    title: "Employé par une entreprise française",
    cat: "Long séjour (Visa D) · travail",
    level: "complexe",
    docs: [],
    extra: [],
    notes: ["⚠ Documents spécifiques non détaillés dans la liste documentaire fournie."],
  },
  c5: {
    title: "Événement culturel / artistique / scientifique / sportif",
    cat: "Court séjour (Visa C) · mission ponctuelle",
    level: "attention",
    docs: [
      "Justificatifs liés à l'événement (invitation, programme, contrat)",
      "Justificatifs du statut professionnel — pour un artiste : carte d'artiste ou attestations",
      "Relevés bancaires",
      "Documents d'état civil selon situation",
      "Hébergement",
      "Assurance voyage",
    ],
    extra: [],
    notes: [
      "Pièces reconstituées à partir de « eiden_visa_assistant_arbre_complet » — seule sous-branche travail avec un début de détail documentaire hors voyage professionnel.",
    ],
  },
  c6: {
    title: "Mannequin",
    cat: "Long séjour (Visa D) · travail",
    level: "complexe",
    docs: [],
    extra: [],
    notes: ["⚠ Documents spécifiques non détaillés dans la liste documentaire fournie."],
  },
  c7: {
    title: "Marin",
    cat: "Long séjour (Visa D) · travail",
    level: "complexe",
    docs: [],
    extra: [],
    notes: ["⚠ Documents spécifiques non détaillés dans la liste documentaire fournie."],
  },
  c8: {
    title: "Chercheur",
    cat: "Long séjour (Visa D) · travail",
    level: "complexe",
    docs: [],
    extra: [],
    notes: ["⚠ Documents spécifiques non détaillés dans la liste documentaire fournie."],
  },
  c9: {
    title: "Stage salarié",
    cat: "Court séjour Schengen (Visa C) · stage",
    level: "attention",
    docs: [
      "Convention de stage signée entre l'employeur étranger, l'entreprise en France et le stagiaire",
      "Pré-réservation du billet aller-retour (avion, autobus ou bateau)",
      "Justificatifs de ressources équivalents au SMIC brut mensuel",
      "Attestation d'accueil (hébergement chez un particulier) ou réservation d'hôtel ou justificatif de location/propriété d'un bien immobilier",
      "Attestation d'assurance médicale de voyage",
    ],
    extra: [],
    notes: [
      "Pièces reconstituées à partir de « eiden_visa_assistant_arbre_complet » — billet aller-retour attendu, donc dossier traité en court séjour.",
    ],
  },
  c_autre: {
    title: "Projet professionnel hors catégories → à vérifier",
    cat: "Travail · cas non standard",
    level: "complexe",
    docs: [],
    extra: [],
    notes: ["Motif non couvert par les catégories connues — qualification manuelle nécessaire."],
  },
};

/* ============ ASSEMBLAGE DYNAMIQUE (court séjour, Visa C) ============ */

function profDoc(prof?: Profile["prof"]): string {
  if (prof === "commercant")
    return "Situation socio-professionnelle : preuve du statut (contrat de travail, certificat de travail, extrait du registre du commerce et des sociétés) et tout document démontrant les liens personnels avec le pays de résidence (copie du certificat de mariage, livret de famille)";
  if (prof === "retraite")
    return "Situation socio-professionnelle : preuve du statut, et pour un retraité, attestation de pension (justificatif de pension / relevé de virement)";
  if (prof === "agriculteur")
    return "Situation socio-professionnelle : pour un agriculteur/exploitant agricole, attestation d'exploitant agricole et certificat de titre de propriété agricole";
  if (prof === "etudiant")
    return "Situation socio-professionnelle : certificat de scolarité ou carte d'étudiant de l'année en cours, acte de naissance original ou livret de famille, document de prise en charge signé et légalisé établissant la situation socio-professionnelle des parents/représentants légaux, et tout document attestant des liens personnels dans le pays de résidence";
  if (prof === "sans")
    return "Situation socio-professionnelle : preuve du statut et tout document démontrant les liens personnels avec le pays de résidence (copie du certificat de mariage, livret de famille) – dossier plus difficile à justifier sans activité propre, envisager une prise en charge documentée";
  return "Situation socio-professionnelle : preuve du statut (contrat de travail, certificat de travail, extrait du registre du commerce et des sociétés, certificat de scolarité, justificatif de pension) et tout document démontrant les liens personnels avec le pays de résidence (copie du certificat de mariage, livret de famille)";
}

/**
 * Branche A — Tourisme / visite privée, reconstruite pièce par pièce à partir de
 * « eiden_visa_assistant_arbre_complet ». Chaque bloc ci-dessous correspond
 * littéralement à un « Si <profession> » de la source ; rien n'est ajouté qui n'y
 * figure pas.
 */
const PASSEPORT_FORMULAIRE = [
  "Passeport (visa et cachet) valide 3 mois après la date de retour au Maroc",
  "Formulaire de demande France-Visas rempli, daté et signé + récépissé (Formulaire + RCPC)",
  "2 photos d'identité sur fond blanc",
];
const ASSURANCE_VOYAGE = "Assurance voyage";

/** Pièce transport — précise le support choisi quand le demandeur l'a indiqué. */
function transportDoc(t?: Profile["transport"]): string {
  const support =
    t === "avion" ? "avion" : t === "autobus" ? "autobus" : t === "bateau" ? "bateau" : null;
  return support
    ? `Pré-réservation ou réservation du billet aller-retour (${support})`
    : "Pré-réservation ou réservation du billet aller-retour (avion, autobus ou bateau)";
}

function hebergementDoc(h?: Profile["hebergement"]): string {
  if (h === "hotel") return "Réservation d'hôtel";
  if (h === "autre") return "Certificat de propriété d'un bien résidentiel en France";
  return "Attestation d'accueil";
}

/** Pièces d'état civil déclenchées par Q-F3 (situation familiale). */
function etatCivilDocs(s?: Profile["situationFamiliale"]): string[] {
  if (s === "marie") return ["Acte de mariage traduit", "Livret de famille (si applicable)"];
  if (s === "veuf") return ["Acte de décès"];
  return [];
}

/** Bloc « Si <profession> » — Branche A, financement = soi-même. */
function professionDocsTourisme(prof: Profile["prof"]): string[] {
  switch (prof) {
    case "fonctionnaire":
      return [
        "Attestation de travail / salaire",
        "Bulletin mensuel (e-services.tgr.gov.ma)",
        "Attestation de la CNOPS",
        "3 derniers relevés bancaires",
      ];
    case "etudiant":
      return [
        "Acte de naissance",
        "Certificat de scolarité",
        "Liste des vacances scolaires",
        "Attestation de prise en charge avec ressources",
        "Si mineur : autorisation de sortie du territoire signée et légalisée par les deux parents",
      ];
    case "avocat_medical":
      return [
        "Attestation d'exercice de la profession",
        "Carte professionnelle",
        "3 derniers relevés bancaires",
      ];
    case "retraite":
      return ["Attestation de pension", "3 derniers relevés bancaires"];
    case "agriculteur":
      return [
        "Attestation agricole",
        "Justificatif de propriété ou de location des terres agricoles",
        "3 derniers relevés bancaires",
      ];
    case "sans":
      return [
        "Attestation de prise en charge",
        "Preuve du lien avec le garant (si disponible)",
        "Justificatifs des ressources du garant",
        "3 derniers relevés bancaires",
      ];
    case "salarie":
    default:
      return [
        "Attestation de travail / salaire",
        "3 fiches de paie",
        "Récapitulatif CNSS",
        "3 derniers relevés bancaires",
      ];
  }
}

const PROF_LABEL: Record<NonNullable<Profile["prof"]>, string> = {
  salarie: "Salarié(e)",
  fonctionnaire: "Fonctionnaire",
  etudiant: "Étudiant(e)",
  avocat_medical: "Avocat / profession médicale",
  retraite: "Retraité(e)",
  agriculteur: "Agriculteur(rice)",
  sans: "Sans profession",
  commercant: "Commerçant(e) / profession libérale",
};

function buildTourisme(p: Profile): CaseResult {
  if (p.duree === "long") return { key: "a_long", ...FIXED["a_long"]! };

  const docs: string[] = [...PASSEPORT_FORMULAIRE, transportDoc(p.transport)];

  if (p.financePar === "garant") {
    docs.push(
      "Attestation de prise en charge",
      "Preuve du lien avec le garant (si disponible)",
      "Justificatifs des ressources du garant",
      "3 derniers relevés bancaires",
    );
  } else {
    docs.push(...professionDocsTourisme(p.prof));
  }

  docs.push(...etatCivilDocs(p.situationFamiliale));
  docs.push("Justificatifs des biens personnels");
  docs.push(hebergementDoc(p.hebergement));
  docs.push(ASSURANCE_VOYAGE);

  if (p.ueEeeFamily) {
    docs.push(
      "Preuve du lien familial avec le ressortissant UE/EEE accompagné ou rejoint",
      "Preuve de la nationalité UE/EEE de ce ressortissant",
      "Preuve que le demandeur l'accompagne ou le rejoint",
    );
  }

  const notes: string[] = [
    "Pièces reconstituées à partir de « eiden_visa_assistant_arbre_complet » — source unique pour cette branche.",
  ];
  if (p.visaHist)
    notes.push("Visa Schengen dans les 59 derniers mois : joindre la copie de l'ancien visa.");

  return {
    key: "a_tourisme",
    title:
      p.financePar === "garant"
        ? "Visa touriste classique · pris en charge par un garant"
        : `Visa touriste classique · ${PROF_LABEL[p.prof ?? "salarie"]}`,
    cat: "Court séjour Schengen (Visa C) · tourisme",
    level: "standard",
    docs,
    extra: [],
    notes,
  };
}

/**
 * Branche B — Visite familiale (hors conjoint de Français et hors UE/EEE, qui ont
 * chacun leur propre résultat fixe). Couvre B-FAMILLE et B-ENFANT/PARENT DE
 * FRANÇAIS : mêmes pièces professionnelles que le tourisme (le docx source répète
 * un bloc identique), avec en plus la preuve du lien familial.
 */
function buildVisiteFamiliale(p: Profile): CaseResult {
  const enfantParent = p.base === "enfant_parent_francais";

  const docs: string[] = [...PASSEPORT_FORMULAIRE];
  if (enfantParent) {
    docs.push(
      "Justificatif de lien de parenté avec le ressortissant français ou le conjoint (copie intégrale des documents d'état civil)",
      "Preuve de la nationalité française",
    );
  } else {
    docs.push("Justificatif de lien de parenté avec la personne de l'attestation d'accueil");
  }
  docs.push(transportDoc(p.transport));

  if (p.financePar === "garant") {
    docs.push(
      "Attestation de prise en charge",
      "Preuve du lien avec le garant (si disponible)",
      "Justificatifs des ressources du garant",
      "3 derniers relevés bancaires",
    );
  } else {
    docs.push(...professionDocsTourisme(p.prof));
  }

  docs.push(...etatCivilDocs(p.situationFamiliale));
  docs.push("Justificatifs des biens personnels");
  docs.push(hebergementDoc(p.hebergement));
  docs.push(ASSURANCE_VOYAGE);

  return {
    key: enfantParent ? "b_enfant_parent" : "b_famille",
    title:
      p.financePar === "garant"
        ? enfantParent
          ? "Visite familiale · enfant/parent de Français · pris en charge par un garant"
          : "Visite familiale · pris en charge par un garant"
        : enfantParent
          ? `Visite familiale · enfant/parent de Français · ${PROF_LABEL[p.prof ?? "salarie"]}`
          : `Visite familiale · ${PROF_LABEL[p.prof ?? "salarie"]}`,
    cat: "Court séjour Schengen (Visa C) · visite familiale",
    level: "attention",
    docs,
    extra: [],
    notes: [
      "Pièces reconstituées à partir de « eiden_visa_assistant_arbre_complet » — source unique pour cette branche.",
    ],
  };
}

/**
 * « En vue de mariage » — court séjour. Deux questions seulement (certificat de
 * publication des bans, nationalité française du futur conjoint) : chacune ne déclenche
 * sa pièce que si la réponse est « oui ». Le socle commun (passeport, transport,
 * hébergement, financement) vient des questions posées avant le motif.
 */
function buildEnVueMariage(p: Profile): CaseResult {
  const docs: string[] = [...PASSEPORT_FORMULAIRE, transportDoc(p.transport)];

  if (p.bansCertificat)
    docs.push(
      "Certificat délivré par la mairie attestant que la publication des bans a été effectuée sans opposition",
    );
  if (p.futurConjointFrancais) docs.push("Justificatif de la nationalité française du conjoint");

  if (p.financePar === "garant") {
    docs.push(
      "Attestation de prise en charge",
      "Preuve du lien avec le garant (si disponible)",
      "Justificatifs des ressources du garant",
      "3 derniers relevés bancaires",
    );
  }

  docs.push(...etatCivilDocs(p.situationFamiliale));
  docs.push(hebergementDoc(p.hebergement));
  docs.push(ASSURANCE_VOYAGE);

  const notes: string[] = [];
  if (!p.bansCertificat)
    notes.push(
      "Certificat de publication des bans non disponible : pièce centrale du dossier « en vue de mariage » — à obtenir auprès de la mairie du lieu de célébration avant le dépôt.",
    );
  if (!p.futurConjointFrancais)
    notes.push(
      "Le futur conjoint n'est pas déclaré de nationalité française : vérifier le motif réel et la catégorie de visa applicable avant d'engager le dossier.",
    );

  return {
    key: "d_en_vue_mariage",
    title: "En vue de mariage · mariage en France",
    cat: "Court séjour Schengen (Visa C) · en vue de mariage",
    level: "attention",
    docs,
    extra: [],
    notes,
  };
}

/* ============ LONG SÉJOUR (Visa D) — assemblage dynamique ============ */

/** Socle commun à tous les dossiers long séjour, quel que soit le motif. */
const LS_BASE = [
  "Passeport valide",
  "Formulaire de demande de visa long séjour",
  "Récépissé de la demande (RCPC)",
  "2 photos d'identité sur fond blanc",
];

const LS_ASSURANCE = "Assurance / couverture médicale pour la durée du séjour";
const LS_NON_ACTIVITE = "Engagement de ne pas exercer d'activité professionnelle en France";

/** Le dossier relève en réalité du court séjour : on le dit plutôt que de produire une liste fausse. */
function lsTropCourt(motif: string): CaseResult {
  return {
    key: "ls_trop_court",
    title: `${motif} · durée inférieure au seuil du long séjour`,
    cat: "À requalifier en court séjour (Visa C)",
    level: "attention",
    docs: [],
    extra: [],
    notes: [
      "La durée annoncée reste sous le seuil du long séjour : ce dossier relève du court séjour. Reprenez la qualification en choisissant « ≤ 90 jours » pour obtenir la bonne liste de pièces.",
    ],
  };
}

function buildLsEtudes(p: Profile): CaseResult {
  if (p.lsDureeCourte) return lsTropCourt("Études");
  const docs = [...LS_BASE];

  if (p.lsAdmission) docs.push("Attestation d'admission ou de préinscription de l'établissement");
  docs.push("Justificatifs de ressources pour la durée des études");

  const financement: Record<NonNullable<Profile["lsFinancement"]>, string> = {
    soi: "Justificatifs de financement personnel (relevés bancaires, épargne)",
    parents: "Prise en charge des parents + justificatifs de leurs ressources",
    famille: "Prise en charge du membre de la famille + justificatifs de ses ressources",
    tiers: "Attestation de prise en charge du sponsor + justificatifs de ses ressources",
    bourse: "Attestation de bourse précisant le montant et la durée",
  };
  if (p.lsFinancement) docs.push(financement[p.lsFinancement]);

  docs.push("Justificatif de logement en France");
  docs.push(LS_ASSURANCE);
  if (p.lsEtudesType === "superieures")
    docs.push(
      "Documents de la procédure Études en France / Campus France, lorsqu'elle est applicable",
    );

  const notes: string[] = [];
  if (!p.lsAdmission)
    notes.push(
      "Aucune admission obtenue : le dossier est incomplet en l'état. Orienter le client vers l'obtention d'une attestation d'admission ou de préinscription avant tout dépôt.",
    );

  return {
    key: "ls_etudes",
    title: "Long séjour · études / formation",
    cat: "Long séjour (Visa D) · études",
    level: p.lsAdmission ? "attention" : "complexe",
    docs,
    extra: [],
    notes,
  };
}

function buildLsTravail(p: Profile): CaseResult {
  const docs = [...LS_BASE];
  if (p.lsContrat) docs.push("Contrat de travail ou promesse d'embauche signée");
  if (p.lsAutorisationTravail === "oui")
    docs.push("Autorisation de travail obtenue par l'employeur");
  docs.push("Justificatifs professionnels et de qualification (diplômes, attestations)");
  docs.push("Documents relatifs à l'employeur en France");
  docs.push("Justificatif de logement en France");
  docs.push(LS_ASSURANCE);

  const notes: string[] = [];
  if (!p.lsContrat)
    notes.push(
      "Ni contrat ni promesse d'embauche : le dossier ne peut pas être déposé en l'état, l'engagement de l'employeur est la pièce centrale.",
    );
  if (p.lsAutorisationTravail === "non")
    notes.push(
      "Autorisation de travail non obtenue : c'est à l'employeur de l'obtenir auprès de l'administration française AVANT le dépôt. Point de blocage à lever en premier.",
    );
  if (p.lsTravailType === "talent")
    notes.push(
      "Passeport Talent : diplôme d'au moins Bac+3 (équivalence ENIC-NARIC si diplôme étranger) et rémunération annuelle brute au-dessus du seuil réglementaire — ≈ 39 582 € en 2026, réévalué chaque année, à revérifier avant chaque dossier. Démarche via le portail ANEF, validité jusqu'à 4 ans, et pas d'autorisation de travail à obtenir par l'employeur.",
    );
  if (p.lsAutorisationTravail === "inconnu")
    notes.push(
      "Autorisation de travail à vérifier avec l'employeur avant toute autre pièce — dispense possible selon l'activité (manifestation, mannequin, détachement pour enseignement, mission d'ingénierie ou d'expertise).",
    );

  const TITRES: Record<NonNullable<Profile["lsTravailType"]>, string> = {
    salarie: "salarié",
    temporaire: "travailleur temporaire",
    saisonnier: "travailleur saisonnier",
    talent: "talent / hautement qualifié",
    entrepreneur: "entrepreneur / indépendant",
    autre: "activité à préciser",
  };

  return {
    key: "ls_travail",
    title: `Long séjour · travail (${TITRES[p.lsTravailType ?? "autre"]})`,
    cat: "Long séjour (Visa D) · activité professionnelle",
    level: p.lsContrat && p.lsAutorisationTravail === "oui" ? "attention" : "complexe",
    docs,
    extra: [],
    notes,
  };
}

function buildLsFamille(p: Profile): CaseResult {
  const docs = [...LS_BASE];

  // Ascendant : deux listes distinctes, à charge ou non — les justificatifs diffèrent.
  if (p.lsFamilleQui === "ascendant") {
    const aCharge = p.lsAscendantCharge === true;
    docs.push(
      "Acte de naissance prouvant le lien familial",
      "Preuve de la nationalité française du descendant",
      "Acte de mariage du descendant s'il est étranger marié à un(e) Français(e)",
    );
    if (aCharge) {
      docs.push(
        "Justificatifs de ressources du demandeur",
        "Justificatifs de ressources du descendant",
        "Preuves de prise en charge régulière et effective (virements, transferts)",
      );
    } else {
      docs.push(
        "Preuve du lien familial",
        LS_NON_ACTIVITE,
        "Justificatifs de ressources",
        "Justificatif de résidence du descendant en France",
      );
    }
    docs.push(LS_ASSURANCE);
    return {
      key: aCharge ? "ls_ascendant_charge" : "ls_ascendant_non_charge",
      title: aCharge
        ? "Long séjour · ascendant à charge d'un Français"
        : "Long séjour · ascendant non à charge",
      cat: "Long séjour (Visa D) · installation familiale",
      level: "complexe",
      docs,
      extra: [],
      notes: [],
    };
  }

  docs.push("Justificatif du lien familial (acte d'état civil)");
  if (p.lsPersonneFrancaise)
    docs.push("Preuve de la nationalité française de la personne rejointe");
  docs.push("Justificatif de résidence en France de la personne rejointe");
  docs.push("Justificatifs de ressources");
  docs.push("Justificatif de logement");
  docs.push(LS_ASSURANCE);

  const LIENS: Record<NonNullable<Profile["lsFamilleQui"]>, string> = {
    conjoint: "conjoint(e) de Français(e)",
    parent_enfant: "parent / enfant de Français",
    ascendant: "ascendant",
    enfant: "enfant",
    autre: "autre membre de famille",
  };

  return {
    key: "ls_famille",
    title: `Long séjour · installation familiale (${LIENS[p.lsFamilleQui ?? "autre"]})`,
    cat: "Long séjour (Visa D) · installation familiale",
    level: "complexe",
    docs,
    extra: [],
    notes: p.lsPersonneFrancaise
      ? []
      : [
          "La personne rejointe n'est pas déclarée française : vérifier son titre de séjour et si le dossier relève plutôt du regroupement familial, procédure engagée en France par le résident (OFII/préfecture).",
        ],
  };
}

function buildLsVisiteur(p: Profile): CaseResult {
  const docs = [...LS_BASE];

  const SITUATION: Record<NonNullable<Profile["lsSituation"]>, string> = {
    salarie:
      "Justificatifs de situation socio-économique : attestation de travail et bulletins de paie",
    fonctionnaire: "Justificatifs de situation socio-économique : attestation de fonction",
    retraite: "Justificatifs de situation socio-économique : attestation et relevés de pension",
    etudiant: "Justificatifs de situation socio-économique : certificat de scolarité",
    sans: "Justificatifs de situation socio-économique : attestation de prise en charge et ressources du garant",
    autre: "Justificatifs de situation socio-économique",
  };
  docs.push(SITUATION[p.lsSituation ?? "autre"]);

  const FINANCE: Record<NonNullable<Profile["lsFinanceSejour"]>, string> = {
    soi: "Justificatifs de ressources personnelles",
    famille: "Prise en charge de la famille + justificatifs de ses ressources",
    autre: "Attestation de prise en charge du tiers + justificatifs de ses ressources",
  };
  docs.push(FINANCE[p.lsFinanceSejour ?? "soi"]);
  docs.push("Justificatifs des fonds disponibles pour la durée du séjour");

  const LOGEMENT: Record<NonNullable<Profile["lsLogement"]>, string> = {
    propriete: "Justificatif de logement : titre de propriété du bien en France",
    location: "Justificatif de logement : contrat de bail",
    heberge: "Justificatif de logement : attestation d'accueil de l'hébergeant (formulaire Cerfa)",
    autre: "Justificatif de logement",
  };
  docs.push(LOGEMENT[p.lsLogement ?? "autre"]);
  docs.push(LS_NON_ACTIVITE);
  docs.push(LS_ASSURANCE);

  const notes: string[] = [];
  if (p.lsFonds === false)
    notes.push(
      "Fonds déclarés insuffisants : c'est le motif de refus le plus direct sur un visiteur long séjour. Construire une prise en charge documentée avant de déposer.",
    );

  return {
    key: "ls_visiteur",
    title: "Long séjour · visiteur / séjour privé",
    cat: "Long séjour (Visa D) · séjour privé",
    level: p.lsFonds === false ? "complexe" : "attention",
    docs,
    extra: [],
    notes,
  };
}

function buildLsStage(p: Profile): CaseResult {
  if (p.lsDureeCourte) return lsTropCourt("Stage");
  const docs = [...LS_BASE];
  if (p.lsConvention)
    docs.push(
      "Convention de stage signée entre l'organisme d'accueil en France, l'établissement et le stagiaire",
    );
  if (p.lsStageEtudiant) docs.push("Justificatif de formation en cours (certificat de scolarité)");
  docs.push("Justificatifs de ressources");
  docs.push("Justificatif de logement en France");
  docs.push(LS_ASSURANCE);

  const notes: string[] = [];
  if (!p.lsConvention)
    notes.push(
      "Convention de stage absente : c'est la pièce centrale du dossier, rien ne peut être déposé sans elle.",
    );

  return {
    key: "ls_stage",
    title: "Long séjour · stage",
    cat: "Long séjour (Visa D) · stage",
    level: p.lsConvention ? "attention" : "complexe",
    docs,
    extra: [],
    notes,
  };
}

/** Aiguillage du long séjour à partir du motif déclaré (Q1). */
export function buildLongSejour(p: Profile): CaseResult {
  switch (p.lsMotif) {
    case "etudes":
      return buildLsEtudes(p);
    case "travail":
      return buildLsTravail(p);
    case "famille":
      return buildLsFamille(p);
    case "visiteur":
      return buildLsVisiteur(p);
    case "stage":
      return buildLsStage(p);
    default:
      return {
        key: "ls_autre",
        title: "Long séjour · motif hors catégories",
        cat: "Long séjour (Visa D) · à qualifier",
        level: "complexe",
        docs: [...LS_BASE],
        extra: [],
        notes: [
          "Motif non couvert par les branches connues : qualification manuelle nécessaire, seul le socle commun est pré-rempli.",
        ],
      };
  }
}

export function buildCourtSejour(p: Profile): CaseResult {
  const base = p.base ?? "tourisme";

  if (base === "tourisme") return buildTourisme(p);
  if (base === "en_vue_mariage") return buildEnVueMariage(p);
  if (base === "visite_familiale_membre" || base === "enfant_parent_francais")
    return buildVisiteFamiliale(p);

  if (base === "famille_ue") {
    const docs = [
      "Formulaire de demande France-Visas rempli, daté et signé + récépissé",
      "Copie du passeport : page d'identité + toutes les pages comportant des visas, tampons d'entrée/sortie ou autres inscriptions (moins de 10 ans, 2 pages vierges, valable 3 mois après le retour)",
      "Note verbale (uniquement si document de voyage officiel/diplomatique)",
      "Preuve du lien de parenté avec le ressortissant UE, EEE ou suisse",
      "Preuve de la nationalité UE, EEE ou suisse de ce ressortissant",
      "Pré-réservation de vol aller-retour (via l'agence partenaire)",
      "Preuve que le demandeur accompagne ou rejoint ce ressortissant (à défaut : déclaration sous serment)",
      "Certificat d'assurance voyage",
    ];
    if (p.dependent)
      docs.push(
        "Preuve de dépendance : contribution financière régulière et substantielle du ressortissant UE/EEE/Suisse à l'entretien et à l'éducation du demandeur (accompagnée si besoin d'une déclaration sous serment)",
      );
    return {
      key: "cs_famille_ue",
      title: "Visite privée · famille d'un ressortissant UE, EEE ou Suisse",
      cat: "Court séjour Schengen (Visa C) · libre circulation UE/EEE/Suisse",
      level: "attention",
      docs,
      extra: [],
      notes: [
        "Cas simplifié par le droit européen : France-Visas ne demande ici ni justificatif de ressources propres, ni preuve de situation professionnelle, ni justificatif d'hébergement séparé. Ne pas ajouter ces pièces par réflexe : cela alourdit un dossier qui doit rester simple et peut semer le doute sur le motif réel.",
      ],
    };
  }

  const META = {
    visite_generale: {
      title: "Visite familiale généraliste",
      cat: "Court séjour Schengen (Visa C) · visite privée",
      level: "attention" as Level,
    },
    visite_enfant_parent: {
      title: "Visite enfant/parent de Français",
      cat: "Court séjour Schengen (Visa C) · lien direct avec un citoyen français",
      level: "attention" as Level,
    },
  };
  const meta = META[base];
  const docs: string[] = [];
  const extra: string[] = [];
  const notes: string[] = [];

  docs.push("Formulaire de demande France-Visas rempli, daté et signé + récépissé");
  docs.push(
    "Copie du passeport : page d'identité + toutes les pages comportant des visas, tampons d'entrée/sortie ou autres inscriptions (moins de 10 ans, 2 pages vierges, valable 3 mois après le retour prévu)",
  );
  docs.push("Note verbale (uniquement si document de voyage officiel/diplomatique)");
  if (base === "visite_generale") docs.push("Lien de parenté avec l'hôte (le cas échéant)");
  if (base === "visite_enfant_parent") {
    docs.push(
      "Lien familial : preuve du lien de parenté avec le ressortissant français ou son conjoint (copies intégrales des documents d'état civil)",
    );
    docs.push("Preuve de la nationalité française du membre de la famille");
  }
  docs.push("Réservation (billet aller-retour) : pré-réservation de vol via l'agence partenaire");
  if (p.minor) {
    docs.push("Mineur : acte de naissance ou copie du livret de famille");
    docs.push(
      "Mineur : autorisation de voyage signée par le(s) titulaire(s) de l'autorité parentale + copie de leur pièce d'identité (uniquement si le mineur ne voyage pas avec ses parents ou son tuteur)",
    );
    docs.push("Mineur : preuve de l'autorité parentale (le cas échéant)");
  }
  docs.push(profDoc(p.prof));
  docs.push("Fonds : relevés bancaires, bulletins de salaire, relevés de pension");
  docs.push("Hébergement : preuve d'hébergement (attestation d'accueil)");
  docs.push("Certificat d'assurance voyage");

  if (p.married) {
    extra.push(
      "Livret de famille ou acte de mariage traduit (déjà couvert par la pièce « situation socio-professionnelle », mais utile à isoler dans le dossier)",
    );
    extra.push("Liste des biens détenus : maison, voiture, terrain... (recommandé, optionnel)");
  }
  if (base === "visite_enfant_parent" && (p.prof === "retraite" || p.prof === "sans")) {
    extra.push(
      "Justificatifs complémentaires de la personne hébergeante (le proche français) : attestation de travail et bulletins de paie (ou registre de commerce), attestation d'imposition, facture EDF, relevé bancaire des 3 derniers mois",
    );
  }
  if (p.spouseNoJob)
    extra.push(
      "Conjoint sans profession : attestation de prise en charge signée par le demandeur, en complément de l'acte de mariage traduit",
    );
  if (p.visaHist)
    extra.push(
      "Certificat de retour, recommandé au vu du visa Schengen précédent, pour appuyer la régularité du dossier",
    );
  if (p.minor)
    extra.push(
      "Côté marocain (formalité de sortie, pas une pièce du dossier visa France) : autorisation de sortie du territoire signée et légalisée par les deux parents – l'acte de décès du parent absent tient lieu de justificatif pour une seule signature",
    );

  if (p.grandchildNote)
    notes.push(
      "La catégorie « enfant/parent de Français » exclut les petits-enfants : ce profil a été orienté vers la visite familiale généraliste pour cette raison.",
    );
  if (p.visaHist)
    notes.push(
      "Visa Schengen dans les 59 derniers mois : joindre la copie de l'ancien visa avec les cachets d'entrée/sortie (déjà couvert par la pièce « document de voyage »).",
    );
  if (p.minor)
    notes.push(
      "Tarif visa réduit pour un mineur : ≈ 45 € (≈ 480 MAD) dans l'exemple officiel pour un enfant de 10 ans, contre 90 € (≈ 950 MAD) pour un adulte – à revérifier par tranche d'âge avant de communiquer un chiffre.",
    );
  notes.push(
    "Pièces reconstituées à partir des résultats officiels de l'assistant France-Visas. Justificatif de séjour légal requis en plus uniquement si le demandeur n'est pas ressortissant de son pays de résidence.",
  );

  return {
    key: "cs_" + base,
    title: meta.title,
    cat: meta.cat,
    level: meta.level,
    docs,
    extra,
    notes,
  };
}

export function getFixedCase(key: string): CaseResult | null {
  const d = FIXED[key];
  return d ? { key, ...d } : null;
}

export const FIXED_KEYS = Object.keys(FIXED);

/* ============ ARBRE DE QUALIFICATION ============ */

export interface TreeOption {
  l: string;
  n: string; // id du noeud suivant, "DYNAMIC" = résultat assemblé, ou clé de cas figé si r=true
  set?: Profile;
  r?: boolean;
}
/** Un champ de saisie libre (nom, date, adresse...) — sans incidence sur la checklist. */
export interface TreeField {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "date";
  /** Rôle du champ dans le calcul affiché sous le groupe (règle des 59 mois) :
   * `visa_59_mois` = date d'obtention, `visa_59_mois_reference` = date du jour saisie
   * par l'agent — c'est lui qui la renseigne, le système ne la déduit pas de son horloge. */
  calcul?: "visa_59_mois" | "visa_59_mois_reference";
}
export interface TreeNode {
  q: string;
  help?: string;
  /** Nœud à choix (boutons) — mutuellement exclusif avec `fields`. */
  opts?: TreeOption[];
  /** Nœud de saisie libre — un ou plusieurs champs texte, validés en un seul « Continuer ». */
  fields?: TreeField[];
  /** Nœud suivant après validation des `fields`. "DYNAMIC" ou une clé de cas figé sont acceptés
   * si `fieldsResult` est vrai. */
  next?: string;
  /** Si vrai, `next` pointe vers un résultat (DYNAMIC ou cas figé) plutôt qu'un autre nœud. */
  fieldsResult?: boolean;
}

export const TREE: Record<string, TreeNode> = {
  /* ============ ÉTAPE 1 — ANTÉCÉDENTS DE VISA ============ */
  start: {
    q: "Avez-vous déjà obtenu un visa pour la France ?",
    help: "Étape 1 — Antécédents de visa.",
    opts: [
      { l: "Oui", n: "q2", set: { visaAnterieur: true } },
      { l: "Non", n: "q4" },
    ],
  },
  q2: {
    q: "Quel type de visa avez-vous obtenu ?",
    opts: [
      { l: "Court séjour", n: "q3" },
      { l: "Long séjour", n: "q3" },
    ],
  },
  q3: {
    q: "Quand avez-vous obtenu votre dernier visa ?",
    help: "Renseignez les deux dates : l'écart en mois et en jours est calculé en dessous.",
    fields: [
      {
        key: "q3_date_dernier_visa",
        label: "Date d'obtention du visa",
        type: "date",
        calcul: "visa_59_mois",
      },
      {
        key: "q3_date_aujourdhui",
        label: "Date du jour",
        type: "date",
        calcul: "visa_59_mois_reference",
      },
    ],
    next: "q4",
  },
  q4: {
    q: "Avez-vous déjà eu un refus de visa pour la France ou un autre pays Schengen ?",
    opts: [
      { l: "Oui", n: "q5", set: { refusVisa: true } },
      { l: "Non", n: "hebergement" },
    ],
  },
  q5: {
    q: "Précisez le refus.",
    fields: [
      { key: "q5_pays", label: "Pays du refus" },
      { key: "q5_date", label: "Date du refus", type: "date" },
      { key: "q5_motif", label: "Motif du refus (si connu)" },
      { key: "q5_type_visa", label: "Type de visa demandé" },
    ],
    next: "hebergement",
  },

  /* ============ HÉBERGEMENT / FINANCEMENT — communes, avant le motif ============ */
  hebergement: {
    q: "Où allez-vous séjourner pendant votre voyage ?",
    help: "Question commune posée avant le motif du voyage : elle s'applique à toutes les branches court séjour.",
    opts: [
      { l: "Hôtel / hébergement touristique", n: "hotel_fields", set: { hebergement: "hotel" } },
      { l: "Chez une personne", n: "personne_qui", set: { hebergement: "personne" } },
      { l: "Autre (logement personnel)", n: "transport", set: { hebergement: "autre" } },
    ],
  },
  hotel_fields: {
    q: "Hôtel.",
    fields: [
      { key: "hotel_nom", label: "Nom de l'hôtel" },
      { key: "hotel_adresse", label: "Adresse" },
      { key: "hotel_cp_ville", label: "Code postal / ville" },
      { key: "hotel_dates", label: "Dates de réservation" },
    ],
    next: "hotel_confirmee",
  },
  hotel_confirmee: {
    q: "Avez-vous une réservation confirmée ?",
    opts: [
      { l: "Oui", n: "transport" },
      { l: "Non", n: "transport" },
    ],
  },
  personne_qui: {
    q: "Chez qui allez-vous séjourner ?",
    opts: [
      { l: "Famille", n: "personne_fields" },
      { l: "Ami(e)", n: "personne_fields" },
      { l: "Connaissance", n: "personne_fields" },
      { l: "Autre", n: "personne_fields" },
    ],
  },
  personne_fields: {
    q: "Personne hébergeante.",
    fields: [
      { key: "personne_nom", label: "Nom" },
      { key: "personne_lien", label: "Quel est votre lien avec cette personne ?" },
      { key: "personne_adresse", label: "Adresse" },
      { key: "personne_coordonnees", label: "Téléphone / e-mail" },
    ],
    next: "personne_nationalite",
  },
  personne_nationalite: {
    q: "Cette personne est-elle de nationalité française ?",
    opts: [
      { l: "Oui", n: "transport" },
      { l: "Non", n: "personne_fields2" },
    ],
  },
  personne_fields2: {
    q: "Nationalité / statut de la personne hébergeante.",
    fields: [{ key: "personne_nat_statut", label: "Nationalité / statut" }],
    next: "transport",
  },
  transport: {
    q: "Quel est votre moyen de transport pour vous rendre en France ?",
    help: "Déclenche la pièce « pré-réservation ou réservation du billet aller-retour ».",
    opts: [
      { l: "Avion", n: "financement", set: { transport: "avion" } },
      { l: "Autobus", n: "financement", set: { transport: "autobus" } },
      { l: "Bateau", n: "financement", set: { transport: "bateau" } },
    ],
  },
  financement: {
    q: "Qui finance le voyage ?",
    opts: [
      { l: "Moi-même", n: "duree" },
      { l: "Une autre personne / garant", n: "garant_fields", set: { financePar: "garant" } },
    ],
  },
  garant_fields: {
    q: "Personne qui finance le voyage.",
    fields: [
      { key: "garant_nom", label: "Nom de la personne" },
      { key: "garant_lien", label: "Quel est votre lien avec cette personne ?" },
      { key: "garant_pays", label: "Dans quel pays réside-t-elle ?" },
    ],
    next: "garant_frais",
  },
  garant_frais: {
    q: "Quels frais prend-elle en charge ?",
    opts: [
      { l: "Transport", n: "duree" },
      { l: "Hébergement", n: "duree" },
      { l: "Nourriture", n: "duree" },
      { l: "Tous les frais", n: "duree" },
      { l: "Autre", n: "duree" },
    ],
  },
  duree: {
    q: "Quelle est la durée prévue du séjour ?",
    help: "Dernière question commune avant le motif du voyage.",
    opts: [
      { l: "≤ 90 jours (court séjour)", n: "motif", set: { duree: "court" } },
      { l: "> 90 jours (long séjour)", n: "motif_long", set: { duree: "long" } },
    ],
  },

  /* ============ ÉTAPE 2 — MOTIF DU VOYAGE (court séjour) ============ */
  motif: {
    q: "Quel est le motif principal du séjour ?",
    help: "Le motif déclaré conditionne toute la suite du dossier.",
    opts: [
      { l: "Tourisme / visite privée", n: "a_residence", set: { base: "tourisme" } },
      { l: "Visite familiale", n: "b_motif" },
      { l: "Travail", n: "c1" },
      { l: "En vue de mariage", n: "d_court", set: { base: "en_vue_mariage" } },
      { l: "Raisons de santé", n: "dout", r: true },
      { l: "Études", n: "eout", r: true },
    ],
  },
  /* ============ LONG SÉJOUR (Visa D) — arbre propre ============ */
  motif_long: {
    q: "Quel est le motif principal de votre séjour en France ?",
    help: "Séjour de plus de 90 jours — chaque motif a ses propres justificatifs.",
    opts: [
      { l: "Études / formation", n: "ls_etudes_type", set: { lsMotif: "etudes" } },
      {
        l: "Travail / activité professionnelle",
        n: "ls_travail_type",
        set: { lsMotif: "travail" },
      },
      {
        l: "Installation familiale / rejoindre un membre de famille",
        n: "ls_famille_qui",
        set: { lsMotif: "famille" },
      },
      { l: "Visiteur / séjour privé", n: "ls_visiteur_activite", set: { lsMotif: "visiteur" } },
      { l: "Stage", n: "ls_stage_etudiant", set: { lsMotif: "stage" } },
      { l: "Autre motif", n: "DYNAMIC_LS", set: { lsMotif: "autre" }, r: true },
    ],
  },

  /* ---- A. Études / formation ---- */
  ls_etudes_type: {
    q: "Quel type de projet d'études avez-vous ?",
    opts: [
      { l: "Études supérieures", n: "ls_etudes_admission", set: { lsEtudesType: "superieures" } },
      { l: "Formation professionnelle", n: "ls_etudes_admission", set: { lsEtudesType: "pro" } },
      {
        l: "École / établissement privé",
        n: "ls_etudes_admission",
        set: { lsEtudesType: "privee" },
      },
      { l: "Autre formation", n: "ls_etudes_admission", set: { lsEtudesType: "autre" } },
    ],
  },
  ls_etudes_admission: {
    q: "Avez-vous déjà été accepté(e) par un établissement en France ?",
    help: "L'attestation d'admission ou de préinscription est la pièce qui ouvre le dossier.",
    opts: [
      { l: "Oui", n: "ls_etudes_etablissement", set: { lsAdmission: true } },
      { l: "Non — pas encore d'admission", n: "ls_etudes_duree", set: { lsAdmission: false } },
    ],
  },
  ls_etudes_etablissement: {
    q: "Établissement d'accueil.",
    fields: [
      { key: "ls_etudes_nom", label: "Nom de l'établissement" },
      { key: "ls_etudes_ville", label: "Ville" },
      { key: "ls_etudes_formation", label: "Intitulé de la formation" },
      { key: "ls_etudes_rentree", label: "Date de rentrée", type: "date" },
    ],
    next: "ls_etudes_duree",
  },
  ls_etudes_duree: {
    q: "Quelle est la durée de votre formation ?",
    opts: [
      { l: "Plus de 3 mois", n: "ls_etudes_financement", set: { lsDureeCourte: false } },
      {
        l: "3 mois ou moins",
        n: "ls_etudes_financement",
        set: { lsDureeCourte: true },
      },
    ],
  },
  ls_etudes_financement: {
    q: "Qui finance vos études et votre séjour ?",
    opts: [
      { l: "Moi-même", n: "DYNAMIC_LS", set: { lsFinancement: "soi" }, r: true },
      { l: "Mes parents", n: "DYNAMIC_LS", set: { lsFinancement: "parents" }, r: true },
      { l: "Un membre de ma famille", n: "DYNAMIC_LS", set: { lsFinancement: "famille" }, r: true },
      { l: "Un tiers / sponsor", n: "DYNAMIC_LS", set: { lsFinancement: "tiers" }, r: true },
      { l: "Une bourse", n: "DYNAMIC_LS", set: { lsFinancement: "bourse" }, r: true },
    ],
  },

  /* ---- B. Travail / activité professionnelle ---- */
  ls_travail_type: {
    q: "Quel type d'activité allez-vous exercer en France ?",
    opts: [
      { l: "Salarié", n: "ls_travail_contrat", set: { lsTravailType: "salarie" } },
      {
        l: "Travailleur temporaire",
        n: "ls_travail_contrat",
        set: { lsTravailType: "temporaire" },
      },
      { l: "Travail saisonnier", n: "ls_travail_contrat", set: { lsTravailType: "saisonnier" } },
      {
        l: "Talent / hautement qualifié",
        n: "ls_travail_contrat",
        set: { lsTravailType: "talent" },
      },
      {
        l: "Entrepreneur / indépendant",
        n: "ls_travail_contrat",
        set: { lsTravailType: "entrepreneur" },
      },
      { l: "Autre", n: "ls_travail_contrat", set: { lsTravailType: "autre" } },
    ],
  },
  ls_travail_contrat: {
    q: "Avez-vous déjà un contrat ou une promesse d'embauche ?",
    opts: [
      { l: "Oui", n: "ls_travail_employeur", set: { lsContrat: true } },
      { l: "Non", n: "ls_travail_autorisation", set: { lsContrat: false } },
    ],
  },
  ls_travail_employeur: {
    q: "Employeur en France.",
    fields: [
      { key: "ls_travail_employeur_nom", label: "Nom de l'employeur" },
      { key: "ls_travail_poste", label: "Poste" },
      { key: "ls_travail_ville", label: "Ville" },
      { key: "ls_travail_debut", label: "Date de début prévue", type: "date" },
      { key: "ls_travail_salaire", label: "Rémunération annuelle brute" },
    ],
    next: "ls_travail_autorisation",
  },
  ls_travail_autorisation: {
    q: "Votre employeur a-t-il obtenu l'autorisation de travail, lorsqu'elle est requise ?",
    help: "Dispense possible : manifestation, mannequin, détachement pour enseignement, mission d'ingénierie ou d'expertise.",
    opts: [
      { l: "Oui", n: "ls_travail_type_contrat", set: { lsAutorisationTravail: "oui" } },
      { l: "Non", n: "ls_travail_type_contrat", set: { lsAutorisationTravail: "non" } },
      {
        l: "Je ne sais pas",
        n: "ls_travail_type_contrat",
        set: { lsAutorisationTravail: "inconnu" },
      },
    ],
  },
  ls_travail_type_contrat: {
    q: "Quel est votre type de contrat ?",
    opts: [
      { l: "CDI", n: "DYNAMIC_LS", set: { lsTypeContrat: "cdi" }, r: true },
      { l: "CDD", n: "DYNAMIC_LS", set: { lsTypeContrat: "cdd" }, r: true },
      { l: "Contrat saisonnier", n: "DYNAMIC_LS", set: { lsTypeContrat: "saisonnier" }, r: true },
      { l: "Autre", n: "DYNAMIC_LS", set: { lsTypeContrat: "autre" }, r: true },
    ],
  },

  /* ---- C. Installation familiale ---- */
  ls_famille_qui: {
    q: "Qui allez-vous rejoindre en France ?",
    opts: [
      { l: "Conjoint(e) français(e)", n: "d_conjoint_fields1", set: { lsFamilleQui: "conjoint" } },
      {
        l: "Parent / enfant français",
        n: "ls_famille_nationalite",
        set: { lsFamilleQui: "parent_enfant" },
      },
      { l: "Ascendant", n: "ls_famille_nationalite", set: { lsFamilleQui: "ascendant" } },
      { l: "Enfant", n: "ls_famille_nationalite", set: { lsFamilleQui: "enfant" } },
      { l: "Autre membre de famille", n: "ls_famille_autre", set: { lsFamilleQui: "autre" } },
    ],
  },
  ls_famille_nationalite: {
    q: "Cette personne est-elle de nationalité française ?",
    opts: [
      { l: "Oui", n: "ls_famille_lien", set: { lsPersonneFrancaise: true } },
      { l: "Non", n: "ls_famille_lien", set: { lsPersonneFrancaise: false } },
    ],
  },
  ls_famille_lien: {
    q: "Personne rejointe.",
    fields: [
      { key: "ls_famille_nom", label: "Nom et prénom" },
      { key: "ls_famille_lien_texte", label: "Quel est votre lien avec cette personne ?" },
      { key: "ls_famille_naissance", label: "Date de naissance", type: "date" },
      { key: "ls_famille_adresse", label: "Adresse en France" },
    ],
    next: "ls_famille_suite",
  },
  ls_famille_suite: {
    q: "Précisez la situation.",
    help: "Un ascendant à charge ne fournit pas les mêmes justificatifs qu'un ascendant autonome.",
    opts: [
      {
        l: "Je suis un ascendant à la charge de mon descendant en France",
        n: "DYNAMIC_LS",
        set: { lsFamilleQui: "ascendant", lsAscendantCharge: true },
        r: true,
      },
      {
        l: "Je suis un ascendant, mais pas à charge",
        n: "DYNAMIC_LS",
        set: { lsFamilleQui: "ascendant", lsAscendantCharge: false },
        r: true,
      },
      { l: "Aucun de ces cas — autre lien familial", n: "DYNAMIC_LS", r: true },
    ],
  },
  ls_famille_autre: {
    q: "De quel cas s'agit-il ?",
    help: "Certaines situations relèvent d'une procédure distincte du visa classique.",
    opts: [
      { l: "Membre de famille d'un réfugié", n: "d_refugie_fields" },
      { l: "Membre de famille sous protection subsidiaire", n: "d_subsidiaire_fields" },
      { l: "Membre de famille d'un apatride", n: "d_apatride_fields" },
      { l: "Regroupement familial classique", n: "d_install_fields" },
      { l: "Autre lien familial", n: "DYNAMIC_LS", r: true },
    ],
  },

  /* ---- D. Visiteur / séjour privé ---- */
  ls_visiteur_activite: {
    q: "Avez-vous l'intention d'exercer une activité professionnelle en France ?",
    help: "La branche visiteur suppose un engagement de ne pas travailler.",
    opts: [
      { l: "Oui", n: "ls_travail_type", set: { lsMotif: "travail" } },
      { l: "Non", n: "ls_visiteur_situation" },
    ],
  },
  ls_visiteur_situation: {
    q: "Quelle est votre situation socio-économique ?",
    opts: [
      { l: "Salarié(e)", n: "ls_visiteur_finance", set: { lsSituation: "salarie" } },
      { l: "Fonctionnaire", n: "ls_visiteur_finance", set: { lsSituation: "fonctionnaire" } },
      { l: "Retraité(e)", n: "ls_visiteur_finance", set: { lsSituation: "retraite" } },
      { l: "Étudiant(e)", n: "ls_visiteur_finance", set: { lsSituation: "etudiant" } },
      { l: "Sans activité", n: "ls_visiteur_finance", set: { lsSituation: "sans" } },
      { l: "Autre", n: "ls_visiteur_finance", set: { lsSituation: "autre" } },
    ],
  },
  ls_visiteur_finance: {
    q: "Qui finance votre séjour ?",
    opts: [
      { l: "Moi-même", n: "ls_visiteur_fonds", set: { lsFinanceSejour: "soi" } },
      { l: "Ma famille", n: "ls_visiteur_fonds", set: { lsFinanceSejour: "famille" } },
      { l: "Une autre personne", n: "ls_visiteur_fonds", set: { lsFinanceSejour: "autre" } },
    ],
  },
  ls_visiteur_fonds: {
    q: "Disposez-vous de fonds suffisants pour toute la durée du séjour ?",
    opts: [
      { l: "Oui", n: "ls_visiteur_logement", set: { lsFonds: true } },
      { l: "Non", n: "ls_visiteur_logement", set: { lsFonds: false } },
    ],
  },
  ls_visiteur_logement: {
    q: "Où allez-vous résider en France ?",
    opts: [
      { l: "Ma propriété", n: "DYNAMIC_LS", set: { lsLogement: "propriete" }, r: true },
      { l: "Logement loué", n: "DYNAMIC_LS", set: { lsLogement: "location" }, r: true },
      {
        l: "Logement fourni par une personne en France",
        n: "DYNAMIC_LS",
        set: { lsLogement: "heberge" },
        r: true,
      },
      { l: "Autre", n: "DYNAMIC_LS", set: { lsLogement: "autre" }, r: true },
    ],
  },

  /* ---- E. Stage ---- */
  ls_stage_etudiant: {
    q: "Êtes-vous actuellement étudiant(e) ou en formation ?",
    opts: [
      { l: "Oui", n: "ls_stage_convention", set: { lsStageEtudiant: true } },
      { l: "Non", n: "ls_stage_convention", set: { lsStageEtudiant: false } },
    ],
  },
  ls_stage_convention: {
    q: "Avez-vous une convention de stage avec l'organisme ou l'entreprise en France ?",
    opts: [
      { l: "Oui", n: "ls_stage_fields", set: { lsConvention: true } },
      { l: "Non — pas encore", n: "ls_stage_duree", set: { lsConvention: false } },
    ],
  },
  ls_stage_fields: {
    q: "Stage en France.",
    fields: [
      { key: "ls_stage_organisme", label: "Entreprise / organisme d'accueil" },
      { key: "ls_stage_ville", label: "Ville" },
      { key: "ls_stage_domaine", label: "Domaine du stage" },
      { key: "ls_stage_debut", label: "Date de début", type: "date" },
    ],
    next: "ls_stage_duree",
  },
  ls_stage_duree: {
    q: "Quelle est la durée du stage ?",
    opts: [
      { l: "Plus de 90 jours", n: "DYNAMIC_LS", set: { lsDureeCourte: false }, r: true },
      { l: "90 jours ou moins", n: "DYNAMIC_LS", set: { lsDureeCourte: true }, r: true },
    ],
  },

  /* ============ BRANCHE A — TOURISME / VISITE PRIVÉE ============ */
  a_residence: {
    q: "Résidez-vous actuellement dans un pays autre que votre nationalité ?",
    opts: [
      { l: "Oui", n: "a_residence_fields" },
      { l: "Non", n: "a_ue" },
    ],
  },
  a_residence_fields: {
    q: "Titre de séjour.",
    fields: [
      { key: "a_residence_numero", label: "Numéro d'autorisation de séjour / document équivalent" },
      { key: "a_residence_validite", label: "Date de validité du titre de séjour", type: "date" },
    ],
    next: "a_ue",
  },
  a_ue: {
    q: "Rejoignez-vous un membre de votre famille ressortissant français, de l'UE ou de l'EEE ?",
    help: "Si oui, des pièces supplémentaires (lien familial, nationalité, preuve d'accompagnement) s'ajoutent à la checklist tourisme — elles ne la remplacent pas.",
    opts: [
      { l: "Oui", n: "a_ue_fields", set: { ueEeeFamily: true } },
      { l: "Non", n: "a_profession" },
    ],
  },
  a_ue_fields: {
    q: "Membre de la famille UE/EEE.",
    fields: [
      { key: "a_ue_nom", label: "Nom" },
      { key: "a_ue_prenom", label: "Prénom" },
      { key: "a_ue_lien", label: "Lien familial" },
      { key: "a_ue_numero", label: "Numéro du document de voyage / CIN" },
      { key: "a_ue_naissance", label: "Date de naissance", type: "date" },
      { key: "a_ue_nationalite", label: "Nationalité" },
    ],
    next: "a_profession",
  },
  a_profession: {
    q: "Quelle est votre situation professionnelle ?",
    opts: [
      { l: "Salarié(e)", n: "situation", set: { prof: "salarie" } },
      { l: "Fonctionnaire", n: "situation", set: { prof: "fonctionnaire" } },
      { l: "Étudiant(e)", n: "situation", set: { prof: "etudiant" } },
      { l: "Avocat / profession médicale", n: "situation", set: { prof: "avocat_medical" } },
      { l: "Retraité(e)", n: "situation", set: { prof: "retraite" } },
      { l: "Agriculteur(rice)", n: "situation", set: { prof: "agriculteur" } },
      { l: "Sans profession", n: "situation", set: { prof: "sans" } },
    ],
  },

  /* ============ Questions finales communes (partagées entre branches) ============ */
  situation: {
    q: "Quelle est votre situation familiale ?",
    help: "Questions finales communes (Q-F3) — déclenche les pièces d'état civil si applicable.",
    opts: [
      { l: "Célibataire", n: "q_visa_hist", set: { situationFamiliale: "celibataire" } },
      { l: "Marié(e)", n: "q_visa_hist", set: { situationFamiliale: "marie" } },
      { l: "Divorcé(e)", n: "q_visa_hist", set: { situationFamiliale: "divorce" } },
      { l: "Veuf / veuve", n: "q_visa_hist", set: { situationFamiliale: "veuf" } },
      { l: "Autre", n: "q_visa_hist", set: { situationFamiliale: "autre" } },
    ],
  },
  q_visa_hist: {
    q: "Avez-vous déjà voyagé avec un visa Schengen durant les 59 derniers mois ?",
    help: "Questions finales communes (Q-F1).",
    opts: [
      { l: "Oui", n: "DYNAMIC", set: { visaHist: true }, r: true },
      { l: "Non", n: "DYNAMIC", r: true },
    ],
  },

  /* ============ BRANCHE B — VISITE FAMILIALE ============ */
  b_motif: {
    q: "Quel est le motif familial précis ?",
    opts: [
      { l: "Visite familiale (parent, enfant, frère/sœur, autre)", n: "b_qui" },
      {
        l: "Visite d'un enfant/parent de nationalité française ou de son conjoint",
        n: "b_enfant_lien",
        set: { base: "enfant_parent_francais" },
      },
      { l: "Visite privée du conjoint de Français", n: "b_conjoint" },
      { l: "Famille d'un ressortissant UE/EEE", n: "b_ue_fields1" },
    ],
  },
  b_qui: {
    q: "Qui allez-vous visiter ?",
    opts: [
      { l: "Parent", n: "b_famille_fields", set: { base: "visite_familiale_membre" } },
      { l: "Enfant", n: "b_famille_fields", set: { base: "visite_familiale_membre" } },
      { l: "Frère / sœur", n: "b_famille_fields", set: { base: "visite_familiale_membre" } },
      { l: "Conjoint", n: "b_famille_fields", set: { base: "visite_familiale_membre" } },
      {
        l: "Autre membre de famille",
        n: "b_famille_fields",
        set: { base: "visite_familiale_membre" },
      },
    ],
  },
  b_famille_fields: {
    q: "Personne visitée.",
    fields: [
      { key: "b_famille_nom", label: "Nom" },
      { key: "b_famille_naissance", label: "Date de naissance", type: "date" },
      { key: "b_famille_nationalite", label: "Nationalité" },
      { key: "b_famille_adresse", label: "Adresse" },
      { key: "b_famille_coordonnees", label: "Téléphone / e-mail" },
    ],
    next: "b_profession",
  },
  b_profession: {
    q: "Quelle est votre situation professionnelle ?",
    help: "Questions finales communes (Q-F2).",
    opts: [
      { l: "Salarié(e)", n: "situation", set: { prof: "salarie" } },
      { l: "Fonctionnaire", n: "situation", set: { prof: "fonctionnaire" } },
      { l: "Avocat / profession médicale", n: "situation", set: { prof: "avocat_medical" } },
      { l: "Retraité(e)", n: "situation", set: { prof: "retraite" } },
      { l: "Agriculteur(rice)", n: "situation", set: { prof: "agriculteur" } },
      { l: "Sans profession", n: "situation", set: { prof: "sans" } },
    ],
  },

  b_enfant_lien: {
    q: "Quel est votre lien ?",
    opts: [
      { l: "Enfant d'un ressortissant français", n: "b_enfant_fields" },
      { l: "Parent d'un ressortissant français", n: "b_enfant_fields" },
      { l: "Enfant du conjoint d'un ressortissant français", n: "b_enfant_fields" },
      { l: "Parent du conjoint d'un ressortissant français", n: "b_enfant_fields" },
    ],
  },
  b_enfant_fields: {
    q: "Membre de famille français.",
    fields: [
      { key: "b_enfant_nom", label: "Nom" },
      { key: "b_enfant_naissance", label: "Date de naissance", type: "date" },
      { key: "b_enfant_adresse", label: "Adresse" },
    ],
    next: "b_enfant_nationalite",
  },
  b_enfant_nationalite: {
    q: "Cette personne est-elle de nationalité française ?",
    opts: [
      { l: "Oui", n: "b_profession" },
      { l: "Non — vérifier la catégorie familiale concernée", n: "b_profession" },
    ],
  },

  b_conjoint: {
    q: "Êtes-vous marié(e) à un ressortissant français ?",
    opts: [
      { l: "Oui", n: "b_conjoint_fields1" },
      { l: "Non — retour vers les autres motifs familiaux", n: "b_motif" },
    ],
  },
  b_conjoint_fields1: {
    q: "Conjoint.",
    fields: [
      { key: "b_conjoint_nom", label: "Nom du conjoint" },
      { key: "b_conjoint_naissance", label: "Date de naissance", type: "date" },
      { key: "b_conjoint_mariage_date_lieu", label: "Date et lieu du mariage" },
    ],
    next: "b_conjoint_maroc",
  },
  b_conjoint_maroc: {
    q: "Le mariage a-t-il été célébré au Maroc ?",
    opts: [
      { l: "Oui", n: "b_conjoint_transcrit" },
      { l: "Non", n: "b_conjoint_pays_fields" },
    ],
  },
  b_conjoint_transcrit: {
    q: "Le mariage a-t-il été transcrit dans les registres français ?",
    opts: [
      { l: "Oui", n: "b_conjoint_reside" },
      { l: "Non", n: "b_conjoint_reside" },
      { l: "En cours", n: "b_conjoint_reside" },
    ],
  },
  b_conjoint_pays_fields: {
    q: "Lieu du mariage.",
    fields: [
      { key: "b_conjoint_pays_mariage", label: "Dans quel pays le mariage a-t-il été célébré ?" },
    ],
    next: "b_conjoint_reside",
  },
  b_conjoint_reside: {
    q: "Votre conjoint réside-t-il actuellement en France ?",
    opts: [
      { l: "Oui", n: "b_conjoint_adresse_fields" },
      { l: "Non", n: "b_conjoint_pays2_fields" },
    ],
  },
  b_conjoint_adresse_fields: {
    q: "Résidence du conjoint en France.",
    fields: [{ key: "b_conjoint_adresse", label: "Adresse" }],
    next: "b_conjoint_projet",
  },
  b_conjoint_pays2_fields: {
    q: "Résidence du conjoint.",
    fields: [{ key: "b_conjoint_pays_residence", label: "Pays de résidence" }],
    next: "b_conjoint_projet",
  },
  b_conjoint_projet: {
    q: "S'agit-il d'une visite temporaire ou d'une installation ?",
    opts: [
      { l: "Visite temporaire (retour prévu)", n: "conjoint_court", r: true },
      { l: "Installation durable en France", n: "t3", r: true },
    ],
  },

  b_ue_fields1: {
    q: "Membre de la famille UE/EEE.",
    fields: [
      { key: "b_ue_nationalite", label: "Nationalité (vérifier UE/EEE)" },
      { key: "b_ue_nom", label: "Nom" },
      { key: "b_ue_naissance", label: "Date de naissance", type: "date" },
      { key: "b_ue_lien", label: "Quel est votre lien ?" },
      { key: "b_ue_numero", label: "Numéro de la pièce d'identité / document de voyage" },
    ],
    next: "b_ue_reside",
  },
  b_ue_reside: {
    q: "Réside-t-il en France ?",
    opts: [
      { l: "Oui", n: "b_ue_adresse_fields" },
      { l: "Non", n: "b_ue_pays_fields" },
    ],
  },
  b_ue_adresse_fields: {
    q: "Résidence en France.",
    fields: [{ key: "b_ue_adresse", label: "Adresse" }],
    next: "b_ue_voyage",
  },
  b_ue_pays_fields: {
    q: "Pays de résidence.",
    fields: [{ key: "b_ue_pays", label: "Pays" }],
    next: "b_ue_voyage",
  },
  b_ue_voyage: {
    q: "Voyagez-vous avec lui ou le rejoignez-vous ?",
    opts: [
      { l: "Avec lui", n: "b_ue_famille", r: true },
      { l: "Je le rejoins", n: "b_ue_famille", r: true },
    ],
  },

  /* ============ BRANCHE C — TRAVAIL (court séjour) ============ */
  c1: {
    q: "Quel est votre projet professionnel en France ?",
    opts: [
      { l: "Voyage professionnel / d'affaires", n: "c10_fields" },
      { l: "Détachement / mission temporaire", n: "c_detachement_fields" },
      { l: "Événement culturel ou artistique", n: "c5_fields" },
      { l: "Mannequin / modèle", n: "c6_fields" },
      { l: "Recherche / activité scientifique", n: "c8_fields" },
      { l: "Stage professionnel", n: "c9_fields" },
    ],
  },
  c_detachement_fields: {
    q: "Détachement.",
    fields: [
      { key: "c_det_employeur_actuel", label: "Employeur actuel" },
      { key: "c_det_pays", label: "Pays" },
      {
        key: "c_det_anciennete",
        label: "Depuis combien de temps travaillez-vous avec cette entreprise ?",
      },
      { key: "c_det_entreprise_fr", label: "Entreprise française d'accueil" },
      { key: "c_det_poste", label: "Poste en France" },
      { key: "c_det_duree", label: "Durée du détachement" },
    ],
    next: "tc4",
    fieldsResult: true,
  },
  c5_fields: {
    q: "Événement.",
    fields: [
      { key: "c5_evenement", label: "Quel événement ?" },
      { key: "c5_role", label: "Quel est votre rôle ?" },
      { key: "c5_organisateur", label: "Organisateur" },
      { key: "c5_ou_quand", label: "Où et quand ?" },
    ],
    next: "c5",
    fieldsResult: true,
  },
  c6_fields: {
    q: "Mission mannequin.",
    fields: [
      { key: "c6_agence", label: "Agence (nom / contact, si applicable)" },
      { key: "c6_client", label: "Client / employeur en France" },
      { key: "c6_nature", label: "Nature de la mission" },
      { key: "c6_duree", label: "Durée" },
    ],
    next: "c6",
    fieldsResult: true,
  },
  c8_fields: {
    q: "Recherche.",
    fields: [
      { key: "c8_organisme", label: "Organisme de recherche" },
      { key: "c8_ville", label: "Ville" },
      { key: "c8_domaine", label: "Domaine de recherche" },
      { key: "c8_objet", label: "Objet de la recherche" },
      { key: "c8_duree", label: "Durée" },
    ],
    next: "c8",
    fieldsResult: true,
  },
  c9_fields: {
    q: "Stage.",
    fields: [
      { key: "c9_entreprise", label: "Entreprise / organisme" },
      { key: "c9_domaine", label: "Domaine" },
      { key: "c9_duree", label: "Durée" },
      { key: "c9_dates", label: "Dates du stage" },
    ],
    next: "c9",
    fieldsResult: true,
  },
  c10_fields: {
    q: "Déplacement professionnel.",
    fields: [
      { key: "c10_entreprise", label: "Entreprise / organisme concerné" },
      { key: "c10_ville", label: "Ville" },
      { key: "c10_dates", label: "Dates" },
    ],
    next: "tc1",
    fieldsResult: true,
  },

  /* ============ BRANCHE D — MARIAGE / CONJOINT ============ */
  d_install_fields: {
    q: "Personne rejointe.",
    fields: [
      { key: "d_install_qui", label: "Qui souhaitez-vous rejoindre ?" },
      { key: "d_install_lien", label: "Quel est votre lien ?" },
      { key: "d_install_nationalite", label: "Nationalité" },
      { key: "d_install_statut", label: "Situation en France" },
      { key: "d_install_adresse", label: "Adresse" },
      { key: "d_install_duree", label: "Depuis combien de temps réside-t-il/elle en France ?" },
    ],
    next: "t4",
    fieldsResult: true,
  },
  d_conjoint_fields1: {
    q: "Conjoint.",
    fields: [
      { key: "d_conjoint_nom", label: "Nom du conjoint" },
      { key: "d_conjoint_naissance", label: "Date de naissance", type: "date" },
      { key: "d_conjoint_mariage_date_lieu", label: "Date et lieu du mariage" },
    ],
    next: "d_conjoint_maroc",
  },
  d_conjoint_maroc: {
    q: "Le mariage a-t-il été célébré au Maroc ?",
    opts: [
      { l: "Oui", n: "d_conjoint_transcrit" },
      { l: "Non", n: "d_conjoint_pays_fields" },
    ],
  },
  d_conjoint_transcrit: {
    q: "Le mariage est-il transcrit dans les registres français ?",
    opts: [
      { l: "Oui", n: "d_conjoint_reside" },
      { l: "Non", n: "d_conjoint_reside" },
      { l: "En cours", n: "d_conjoint_reside" },
    ],
  },
  d_conjoint_pays_fields: {
    q: "Lieu du mariage.",
    fields: [
      { key: "d_conjoint_pays_mariage", label: "Dans quel pays le mariage a-t-il été célébré ?" },
    ],
    next: "d_conjoint_reside",
  },
  d_conjoint_reside: {
    q: "Où réside actuellement votre conjoint ?",
    opts: [
      { l: "France", n: "d_conjoint_adresse_fields" },
      { l: "Autre pays", n: "d_conjoint_pays2_fields" },
    ],
  },
  d_conjoint_adresse_fields: {
    q: "Résidence du conjoint en France.",
    fields: [{ key: "d_conjoint_adresse", label: "Adresse" }],
    next: "d_conjoint_ensemble",
  },
  d_conjoint_pays2_fields: {
    q: "Résidence du conjoint.",
    fields: [{ key: "d_conjoint_pays_residence", label: "Pays" }],
    next: "d_conjoint_ensemble",
  },
  d_conjoint_ensemble: {
    q: "Avez-vous déjà vécu ensemble ?",
    opts: [
      { l: "Oui", n: "d_conjoint_vecu_fields" },
      { l: "Non", n: "d_conjoint_enfants" },
    ],
  },
  d_conjoint_vecu_fields: {
    q: "Vie commune.",
    fields: [{ key: "d_conjoint_vecu_lieu_periode", label: "Lieu et période" }],
    next: "d_conjoint_enfants",
  },
  d_conjoint_enfants: {
    q: "Avez-vous des enfants ensemble ?",
    opts: [
      { l: "Oui — informations enfants", n: "t3", r: true },
      { l: "Non", n: "t3", r: true },
    ],
  },
  d_refugie_fields: {
    q: "Personne rejointe (réfugié).",
    fields: [
      { key: "d_refugie_nom", label: "Nom de la personne" },
      { key: "d_refugie_naissance", label: "Date de naissance", type: "date" },
      { key: "d_refugie_lien", label: "Quel est votre lien ?" },
      { key: "d_refugie_document", label: "Numéro de résidence / document" },
      { key: "d_refugie_adresse", label: "Adresse" },
    ],
    next: "d_refugie",
    fieldsResult: true,
  },
  d_subsidiaire_fields: {
    q: "Personne rejointe (protection subsidiaire).",
    fields: [
      { key: "d_subsidiaire_nom", label: "Nom de la personne" },
      { key: "d_subsidiaire_lien", label: "Quel est votre lien ?" },
      { key: "d_subsidiaire_document", label: "Numéro de résidence / document" },
      { key: "d_subsidiaire_adresse", label: "Adresse" },
    ],
    next: "d_subsidiaire",
    fieldsResult: true,
  },
  d_apatride_fields: {
    q: "Personne rejointe (apatride).",
    fields: [
      { key: "d_apatride_nom", label: "Nom de la personne" },
      { key: "d_apatride_lien", label: "Quel est votre lien ?" },
      { key: "d_apatride_document", label: "Numéro de résidence / document" },
      { key: "d_apatride_adresse", label: "Adresse" },
    ],
    next: "d_apatride",
    fieldsResult: true,
  },
  /* En vue de mariage — mariage français (court séjour). Deux questions, chacune liée
     à une pièce : certificat de publication des bans, nationalité française du conjoint. */
  d_court: {
    q: "Avez-vous le certificat de la mairie confirmant que la publication des bans a été effectuée sans opposition ?",
    help: "En vue de mariage — mariage français.",
    opts: [
      { l: "Oui", n: "d_court_nationalite", set: { bansCertificat: true } },
      { l: "Non", n: "d_court_nationalite" },
    ],
  },
  d_court_nationalite: {
    q: "Votre futur(e) conjoint(e) est-il/elle de nationalité française ?",
    opts: [
      { l: "Oui", n: "situation", set: { futurConjointFrancais: true } },
      { l: "Non", n: "situation" },
    ],
  },
};

/** Périmètre du service au lancement (étude EV/2026-08). */
export const SCOPE = {
  in: ["Tourisme / visite", "Famille", "Travail"],
  out: ["Santé (écarté au lancement)", "Études (orienter vers Campus France)"],
};

/**
 * Index des champs de saisie libre : clé -> libellé, type, et le nœud qui les regroupe.
 * Permet de réafficher `profile.details` proprement (groupé, dates formatées) au lieu
 * d'un bloc de texte à plat, sans redéclarer les libellés ailleurs.
 */
export const TREE_FIELDS: Record<string, { label: string; type: "text" | "date"; groupe: string }> =
  Object.fromEntries(
    Object.values(TREE).flatMap(
      (n) =>
        n.fields?.map(
          (f) =>
            [
              f.key,
              {
                label: f.label,
                type: f.type ?? "text",
                // `q` des nœuds de saisie est un intitulé court (« Hôtel. », « Conjoint. ») :
                // il sert de titre de section, débarrassé de son point final.
                groupe: n.q.replace(/\.$/, ""),
              },
            ] as const,
        ) ?? [],
    ),
  );
