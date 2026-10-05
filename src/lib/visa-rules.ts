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
  /** Moyen de transport — pose la pièce « billet aller-retour » sur le bon support.
   *  « avion » / « bateau » sont proposés ; « autobus » n'est plus proposé mais reste
   *  dans le type pour les dossiers enregistrés avant le retrait. */
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

  /* ---- Long séjour (Visa D) — arbre « EIDEN Visa — Long séjour ». Champs à plat et non
     imbriqués : la fusion des réponses de l'arbre est superficielle, un objet imbriqué
     écraserait les réponses précédentes. Les questions oui/non sont des booléens nommés
     `ls…` (voir l'index ci-dessous) ; seuls les aiguillages à plusieurs issues sont typés. ---- */
  /** Type de demande de visa long séjour. */
  lsType?: "retour" | "famille" | "visiteur" | "travail";
  /** Visa de retour — motif de la demande. */
  lsRetour?: "perte_titre" | "perte_passeport" | "recepisse" | "mineur";
  /** Installation familiale ou privée — situation familiale en France. */
  lsFamille?: "asc_charge" | "asc_non_charge" | "conjoint" | "parent_mineur";
  /** Visiteur — majeur (≥ 18 ans) ou mineur. */
  lsVisiteur?: "majeur" | "mineur";
  /** Travail — situation professionnelle en France. */
  lsTravail?: "embauche" | "ict" | "entrepreneur" | "liberale";
  /* Réponses de l'arbre long séjour : booléens oui/non, ou code court quand il y a plus de deux issues. */
  lsActeMariage?: boolean;
  lsActiviteType?:
    "individuelle" | "location_gerance" | "fonds" | "societe_fr" | "filiale" | "personne_morale";
  lsAnciennete?: boolean;
  lsAttestations?: boolean;
  lsAutorisation?: "oui" | "non" | "encours";
  lsAutreParent?: boolean;
  lsAutreParentAutorise?: boolean;
  lsCadre?: boolean;
  lsCommunaute?: boolean;
  lsConjointFrancais?: boolean;
  lsContratTravail?: boolean;
  lsContribue?: boolean;
  lsContribue2ans?: boolean;
  lsCopieTitre?: boolean;
  lsDcemTir?: boolean;
  lsDecisionGarde?: boolean;
  lsDeclarationPerte?: boolean;
  lsDescFrancais?: boolean;
  lsDescMarie?: "oui" | "non" | "na";
  lsDiplomes?: boolean;
  lsEmployeur?: "france" | "detachement";
  lsEnfantFrancais?: boolean;
  lsEnfantMineur?: boolean;
  lsEnfantReside?: boolean;
  lsFiliation?: boolean;
  lsFinanceMineur?: "pere" | "mere" | "parents" | "organisme" | "proche" | "autre";
  lsFinanceSejour?: "soi" | "famille" | "autre";
  lsFonds?: boolean;
  lsGarde?: "pere" | "mere" | "autre";
  lsGardeAutorise?: boolean;
  lsHebergMineur?: "parents" | "proche" | "residence" | "autre";
  lsLettreMission?: boolean;
  lsLien?: "parent" | "grand_parent" | "autre";
  lsLogement?: "propriete" | "location" | "personne" | "autre";
  lsMaintien?: boolean;
  lsMarie?: boolean;
  lsMemeGroupe?: boolean;
  lsMineur?: boolean;
  lsParentFrancais?: boolean;
  lsParentsSepares?: boolean;
  lsPolygamie?: boolean;
  lsPriseEnCharge?: boolean;
  lsPriseRegulier?: boolean;
  lsProfReglementee?: boolean;
  lsProjet?: "creation" | "existante";
  lsRecepisse?: boolean;
  lsRecepisseValide?: boolean;
  lsReferencesTitre?: boolean;
  lsRessortissant?: boolean;
  lsRessourcesPerso?: boolean;
  lsRessourcesPropres?: boolean;
  lsRessourcesSmic?: boolean;
  lsScolarise?: boolean;
  lsSituation?:
    "salarie" | "fonctionnaire" | "entrepreneur" | "retraite" | "etudiant" | "sans" | "autre";
  lsStatutExistant?: "salarie" | "non_salarie";
  lsStatutIct?: "salarie" | "stagiaire";
  lsStructure?: boolean;
  lsTranscrit?: "oui" | "non" | "na";
  lsViabilite?: boolean;

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
      "Pré-réservation du billet aller-retour (avion ou bateau)",
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

/** Pièce transport — précise le support choisi quand le demandeur l'a indiqué.
 *  « avion » et « bateau » sont les seuls supports proposés au questionnaire ; « autobus »
 *  n'est plus posé mais reste lu pour les dossiers créés avant le retrait. */
function transportDoc(t?: Profile["transport"]): string {
  const support =
    t === "avion" ? "avion" : t === "autobus" ? "autobus" : t === "bateau" ? "bateau" : null;
  return support
    ? `Pré-réservation ou réservation du billet aller-retour (${support})`
    : "Pré-réservation ou réservation du billet aller-retour (avion ou bateau)";
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

/* Source : « EIDEN Visa — Système de qualification des visas Long séjour » (PDF, 27 p.).
   Règle EIDEN : un document n'est affiché que si une réponse précédente le rend nécessaire ;
   les documents communs ouvrent le dossier, les pièces conditionnelles s'ajoutent ensuite. */

/** Une réponse oui/non du questionnaire long séjour : `true` / `false`, `undefined` si non posée. */
const oui = (v: unknown) => v === true;
const non = (v: unknown) => v === false;

const LS_FORMULAIRE = "Formulaire de demande de visa long séjour";
const LS_PHOTOS = "Photographies d'identité";
const LS_RCPC = "Récépissé de la demande (RCPC)";
const LS_NOTE_VERBALE =
  "Note verbale si le demandeur est titulaire d'un document de voyage officiel";

function lsResult(
  key: string,
  title: string,
  cat: string,
  level: Level,
  docs: string[],
  notes: string[] = [],
): CaseResult {
  return { key, title, cat, level, docs, extra: [], notes };
}

/* ---------- 1. Visa de retour ---------- */

function buildLsRetour(p: Profile): CaseResult {
  const cat = "Long séjour (Visa D) · visa de retour";
  const docs = [
    LS_FORMULAIRE,
    LS_PHOTOS,
    "Passeport en cours de validité",
    "Lettre détaillée expliquant les raisons de la demande de visa de retour",
    "Preuve de la résidence habituelle en France",
  ];
  const notes = [
    "Attention système : la FAQ France-Visas indique 3 formulaires et 3 photographies pour une demande de visa de retour. Vérifier la liste applicable au point de dépôt au moment du dépôt.",
  ];

  switch (p.lsRetour) {
    case "perte_titre": {
      if (oui(p.lsDeclarationPerte))
        docs.push(
          "Déclaration originale de perte ou de vol établie par les autorités locales",
          "Photocopie de la déclaration de perte ou de vol",
        );
      else
        notes.push(
          "Pas de déclaration de perte ou de vol : à faire établir par les autorités locales avant le dépôt.",
        );
      if (oui(p.lsCopieTitre)) docs.push("Photocopie du titre de séjour perdu ou volé");
      else if (oui(p.lsReferencesTitre))
        docs.push(
          "À défaut de photocopie : références du titre de séjour (numéro, date et lieu de délivrance)",
        );
      else
        notes.push(
          "Ni photocopie ni références du titre de séjour (numéro, date et lieu de délivrance) : retrouver au moins les références avant le dépôt.",
        );
      return lsResult(
        "ls_retour_titre",
        "Visa de retour · perte ou vol du titre de séjour",
        cat,
        "attention",
        docs,
        notes,
      );
    }
    case "perte_passeport": {
      if (oui(p.lsDeclarationPerte)) docs.push("Déclaration de perte ou de vol du passeport");
      else
        notes.push(
          "Pas de déclaration de perte ou de vol du passeport : à faire établir avant le dépôt.",
        );
      if (oui(p.lsCopieTitre))
        docs.push("Copie du passeport perdu ou volé contenant le visa long séjour");
      else if (oui(p.lsReferencesTitre))
        docs.push("À défaut de copie : références du passeport ou du visa");
      else
        notes.push(
          "Ni copie du passeport perdu ou volé ni références du passeport ou du visa : à retrouver avant le dépôt.",
        );
      return lsResult(
        "ls_retour_passeport",
        "Visa de retour · perte ou vol du passeport (visa long séjour)",
        cat,
        "attention",
        docs,
        notes,
      );
    }
    case "recepisse": {
      if (oui(p.lsRecepisse) && oui(p.lsRecepisseValide))
        docs.push(
          "Original + photocopie du récépissé de première demande de carte de séjour en cours de validité",
        );
      else
        notes.push(
          non(p.lsRecepisse)
            ? "Pas de récépissé de première demande de carte de séjour : le visa de retour sur ce motif suppose un récépissé en cours de validité."
            : "Récépissé périmé : il doit être en cours de validité pour demander un visa de retour sur ce motif.",
        );
      return lsResult(
        "ls_retour_recepisse",
        "Visa de retour · première demande de carte de séjour (récépissé)",
        cat,
        non(p.lsRecepisse) || non(p.lsRecepisseValide) ? "complexe" : "attention",
        docs,
        notes,
      );
    }
    case "mineur": {
      if (oui(p.lsMineur)) {
        if (oui(p.lsDcemTir)) docs.push("DCEM ou TIR");
        else
          docs.push(
            "Documents relatifs à la régularité du séjour des parents en France",
            "Preuve du lien de filiation",
            "Preuve d'un regroupement familial, le cas échéant",
            "Attestation de scolarité",
            "Tout document permettant d'établir la régularité du séjour en France",
          );
      } else
        notes.push(
          "Le demandeur n'est pas mineur : ce motif (mineur sorti de France sans DCEM / TIR) ne s'applique pas. Reprendre la qualification avec le bon motif de retour.",
        );
      return lsResult(
        "ls_retour_mineur",
        "Visa de retour · mineur sorti de France sans DCEM / TIR",
        cat,
        non(p.lsMineur) ? "complexe" : "attention",
        docs,
        notes,
      );
    }
    default:
      return lsResult("ls_retour", "Visa de retour", cat, "attention", docs, notes);
  }
}

/* ---------- 2. Installation familiale ou privée ---------- */

const LS_ASSURANCE_3M = "Assurance médicale couvrant les 3 premiers mois du séjour";
const LS_ID_FAMILLE = [
  "Passeport avec visas et cachets",
  LS_FORMULAIRE,
  LS_RCPC,
  "2 photographies d'identité",
];
const LS_ACTE_MARIAGE_DESC = [
  "Si le descendant est étranger : copie intégrale récente de l'acte de mariage avec un Français",
  "Acte dressé ou transcrit par une autorité française",
];

function buildLsAscendantCharge(p: Profile): CaseResult {
  const docs = [
    ...LS_ID_FAMILLE,
    "Copie intégrale récente de l'acte de naissance justifiant le lien familial avec le descendant",
  ];
  if (oui(p.lsDescFrancais)) docs.push("Justificatif de la nationalité française du descendant");
  else docs.push("Justificatif de la nationalité française du conjoint du descendant étranger");
  if (!oui(p.lsDescFrancais) || p.lsDescMarie === "oui") docs.push(...LS_ACTE_MARIAGE_DESC);
  if (oui(p.lsRessourcesPropres))
    docs.push("Justificatifs des ressources propres de l'ascendant dans le pays d'origine");
  docs.push("Justificatifs des ressources du descendant");
  if (oui(p.lsPriseEnCharge) && oui(p.lsPriseRegulier))
    docs.push(
      "Preuves d'une contribution effective et régulière à l'entretien de l'ascendant depuis une période significative",
    );
  docs.push(LS_ASSURANCE_3M);

  const notes = [
    "France-Visas : pour l'installation comme ascendant, prouver le lien familial, la nationalité du descendant ou de son conjoint, la prise en charge dans le pays de résidence, les conditions de logement et une assurance couvrant les trois premiers mois.",
  ];
  if (non(p.lsPriseEnCharge))
    notes.push(
      "Pas de prise en charge financière par le descendant dans le pays de résidence : le dossier ne relève pas de l'ascendant à charge — reprendre avec « Ascendant non à charge ».",
    );
  else if (non(p.lsPriseRegulier))
    notes.push(
      "Prise en charge non régulière / non effective depuis une période significative : point faible du dossier, à documenter avant le dépôt.",
    );
  return lsResult(
    "ls_asc_charge",
    "Installation familiale · ascendant à charge de Français ou de son conjoint étranger",
    "Long séjour (Visa D) · installation familiale",
    non(p.lsPriseEnCharge) || non(p.lsPriseRegulier) ? "complexe" : "attention",
    docs,
    notes,
  );
}

function buildLsAscendantNonCharge(p: Profile): CaseResult {
  const docs = [
    ...LS_ID_FAMILLE,
    "Copie intégrale récente de l'acte de naissance justifiant le lien familial avec le descendant",
    "Justificatif de la nationalité française du descendant",
    "Ou justificatif de la nationalité française du conjoint du descendant étranger",
    ...LS_ACTE_MARIAGE_DESC,
    "Engagement à ne pas exercer d'activité professionnelle en France",
    "Preuve du lien familial : acte de naissance + traduction, le cas échéant",
    "CNI ou passeport du descendant français",
    "Relevés bancaires des 3 derniers mois",
    "Justificatifs de ressources régulières",
    "Autres revenus : loyers, rentes, etc.",
    "Justificatif de résidence du descendant en France",
    "Assurance médicale couvrant la durée requise du séjour",
  ];
  const notes: string[] = [];
  if (non(p.lsParentFrancais))
    notes.push(
      "Le demandeur n'est ni parent ni grand-parent d'un ressortissant français ou de son conjoint : ce motif ne s'applique pas.",
    );
  if (non(p.lsRessourcesPerso))
    notes.push(
      "Ressources personnelles insuffisantes : sans elles, l'ascendant non à charge ne peut pas subvenir à ses besoins en France — point bloquant à lever avant le dépôt.",
    );
  return lsResult(
    "ls_asc_non_charge",
    "Installation familiale · ascendant non à charge",
    "Long séjour (Visa D) · installation familiale",
    "complexe",
    docs,
    notes,
  );
}

function buildLsConjoint(p: Profile): CaseResult {
  const docs = [
    "Passeport / document de voyage",
    LS_FORMULAIRE,
    LS_RCPC,
    "2 photographies d'identité",
    "Copie intégrale de l'acte de mariage",
  ];
  if (p.lsTranscrit !== "na")
    docs.push("Documents de transcription / reconnaissance du mariage, le cas échéant");
  docs.push(
    "Justificatif de la nationalité française du conjoint",
    "CNI ou passeport français du conjoint",
    "Justificatifs relatifs à la communauté de vie",
    "Éléments permettant d'établir l'intention de maintenir la communauté de vie en France",
    "Preuve de résidence, lorsque requise",
    LS_NOTE_VERBALE,
  );
  const notes = [
    "France-Visas : le conjoint de Français demandant un long séjour doit justifier du mariage, de la nationalité française du conjoint, de la communauté de vie et de l'intention de la maintenir en France.",
  ];
  const bloquants: string[] = [];
  if (non(p.lsMarie)) bloquants.push("le demandeur n'est pas légalement marié");
  if (non(p.lsConjointFrancais)) bloquants.push("le conjoint n'est pas de nationalité française");
  if (non(p.lsActeMariage)) bloquants.push("l'acte intégral de mariage manque");
  if (p.lsTranscrit === "non") bloquants.push("le mariage n'est pas transcrit alors qu'il le faut");
  if (non(p.lsCommunaute)) bloquants.push("pas de communauté de vie");
  if (non(p.lsMaintien))
    bloquants.push("pas de projet de maintenir la communauté de vie en France");
  if (bloquants.length)
    notes.push(`Points bloquants à lever avant le dépôt : ${bloquants.join(" ; ")}.`);
  return lsResult(
    "ls_conjoint",
    "Installation familiale · conjoint(e) de Français",
    "Long séjour (Visa D) · installation familiale",
    bloquants.length ? "complexe" : "attention",
    docs,
    notes,
  );
}

function buildLsParentMineur(p: Profile): CaseResult {
  const docs = [
    "Document de voyage",
    LS_FORMULAIRE,
    LS_RCPC,
    "Photographie d'identité",
    "Copie de la page d'identité",
    "Copies des pages comportant visas, cachets ou autres inscriptions",
    "Actes d'état civil établissant la filiation",
    "Justificatif de la nationalité française de l'enfant",
    "Acte de naissance / document d'état civil permettant d'établir l'âge de l'enfant",
    "Justificatif de résidence de l'enfant en France",
    "Justificatifs de contribution effective à l'entretien et à l'éducation de l'enfant",
  ];
  // Autorité parentale : l'autre parent, sa décision, la garde.
  if (oui(p.lsAutreParent)) {
    docs.push(
      "Acte de mariage des parents, le cas échéant",
      "Documents relatifs à l'autorité parentale",
      "Copie de la pièce d'identité de l'autre parent",
    );
    if (oui(p.lsAutreParentAutorise)) docs.push("Autorisation de l'autre parent, le cas échéant");
  } else {
    docs.push("Déclaration du parent étranger, selon la situation");
  }
  if (oui(p.lsDecisionGarde))
    docs.push(
      "Décision de justice, le cas échéant",
      "Acte de décès de l'autre parent, le cas échéant",
    );
  docs.push(
    "Contrat de bail du parent en France",
    "Ou titre de propriété",
    "Ou lettre signée du parent attestant le transfert de sa résidence vers la France",
    "Lettre explicative si nécessaire",
  );

  const notes = [
    "France-Visas : le parent étranger d'un enfant français mineur doit justifier du lien de filiation, de la nationalité et de l'âge de l'enfant, de sa résidence en France, de sa contribution effective à son entretien et son éducation, ainsi que de l'absence de polygamie.",
  ];
  const bloquants: string[] = [];
  if (non(p.lsEnfantFrancais)) bloquants.push("l'enfant n'est pas de nationalité française");
  if (non(p.lsEnfantMineur)) bloquants.push("l'enfant a 18 ans ou plus");
  if (non(p.lsFiliation)) bloquants.push("lien de filiation non établi officiellement");
  if (non(p.lsEnfantReside)) bloquants.push("l'enfant ne réside pas en France");
  if (non(p.lsContribue))
    bloquants.push("pas de contribution effective à l'entretien et à l'éducation");
  else if (non(p.lsContribue2ans))
    bloquants.push("contribution inférieure à 2 ans et non depuis la naissance");
  if (oui(p.lsAutreParent) && non(p.lsAutreParentAutorise))
    bloquants.push("l'autre parent (autorité parentale) n'autorise pas l'installation");
  if (oui(p.lsPolygamie)) bloquants.push("situation de polygamie");
  if (bloquants.length)
    notes.push(`Points bloquants à lever avant le dépôt : ${bloquants.join(" ; ")}.`);
  return lsResult(
    "ls_parent_mineur",
    "Installation familiale · parent d'un enfant mineur français",
    "Long séjour (Visa D) · installation familiale",
    bloquants.length ? "complexe" : "attention",
    docs,
    notes,
  );
}

/* ---------- 3. Visiteur ---------- */

function buildLsVisiteurMajeur(p: Profile): CaseResult {
  const docs = [
    LS_FORMULAIRE,
    LS_RCPC,
    "2 photographies d'identité",
    "Passeport / document de voyage valide",
    "Engagement à ne pas exercer d'activité professionnelle en France",
    "Lettre expliquant le projet, le cas échéant",
    "Justificatifs de situation socio-économique",
    "Preuve de fonds suffisants",
    "Justificatifs de ressources régulières, le cas échéant",
  ];
  const LOGEMENT: Record<string, string> = {
    propriete: "Titre de propriété",
    location: "Contrat de location",
    personne: "Justificatif d'hébergement par une personne résidant en France",
    autre: "Document expliquant les modalités de logement",
  };
  docs.push(
    LOGEMENT[typeof p.lsLogement === "string" ? p.lsLogement : "autre"] ?? LOGEMENT["autre"]!,
    "Assurance maladie couvrant toute la durée du séjour (période de validité du visa, dans la limite applicable)",
  );
  const notes = [
    "France-Visas : le long séjour « visiteur » suppose l'absence d'activité professionnelle, la justification de la situation socio-économique, des ressources, de l'hébergement et de la couverture médicale.",
  ];
  if (non(p.lsFonds))
    notes.push(
      "Fonds déclarés insuffisants : c'est le motif de refus le plus direct sur un visiteur long séjour — construire une prise en charge documentée avant de déposer.",
    );
  return lsResult(
    "ls_visiteur_majeur",
    "Visiteur majeur",
    "Long séjour (Visa D) · visiteur",
    non(p.lsFonds) ? "complexe" : "attention",
    docs,
    notes,
  );
}

function buildLsVisiteurMineur(p: Profile): CaseResult {
  const docs = [
    LS_FORMULAIRE,
    LS_RCPC,
    "Photographie d'identité",
    "Document de voyage valide : délivré depuis moins de 10 ans, minimum 2 pages vierges, validité suffisante pour le long séjour",
    "Page d'identité et toutes les pages comportant visas, cachets ou inscriptions",
    LS_NOTE_VERBALE,
  ];
  if (non(p.lsRessortissant))
    docs.push(
      "Preuve de résidence légale dans le pays de résidence (le demandeur n'en est pas ressortissant)",
    );
  docs.push("Justificatif d'inscription scolaire en France");
  if (oui(p.lsParentsSepares))
    docs.push(
      "Justificatif du droit de garde en cas de séparation / divorce",
      "Accord écrit du parent investi du droit de garde",
      "Documents officiels de garde si nécessaire",
    );
  docs.push(
    "Justificatifs de ressources des parents, ou de l'organisme, ou du proche résidant en France",
    "Hébergement : titre de propriété, ou bail, ou autre justificatif d'hébergement, ou justificatif de prise en charge de l'hébergement, ou document expliquant les conditions d'hébergement",
    "Assurance médicale couvrant toute la durée du séjour",
  );
  const notes: string[] = [];
  if (non(p.lsScolarise))
    notes.push(
      "Pas d'inscription dans un établissement scolaire en France : le justificatif d'inscription est la pièce centrale du dossier, à obtenir avant le dépôt.",
    );
  if (oui(p.lsParentsSepares) && non(p.lsGardeAutorise))
    notes.push(
      "Le parent disposant du droit de garde n'autorise pas le séjour : bloquant tant que l'accord écrit n'est pas obtenu.",
    );
  return lsResult(
    "ls_visiteur_mineur",
    "Visiteur mineur / mineur scolarisé",
    "Long séjour (Visa D) · visiteur mineur",
    notes.length ? "complexe" : "attention",
    docs,
    notes,
  );
}

/* ---------- 4. Travail ---------- */

/** Pièces d'identité communes à toutes les branches travail. */
const LS_TRAVAIL_IDENTITE = [
  "Photographie d'identité",
  "Note verbale si document de voyage officiel",
  "Preuve de résidence légale si nécessaire",
  "Document de voyage : copie de la page identité + toutes les pages comportant visas / cachets / inscriptions",
];

function buildLsEmbauche(p: Profile): CaseResult {
  const docs = [...LS_TRAVAIL_IDENTITE];
  if (p.lsAutorisation === "oui") docs.push("Autorisation de travail");
  if (oui(p.lsContratTravail)) docs.push("Contrat de travail / document équivalent");
  if (oui(p.lsDiplomes)) docs.push("Diplômes", "Justificatifs de qualification");
  if (oui(p.lsAttestations)) docs.push("Attestations de travail");

  const notes: string[] = [];
  if (p.lsEmployeur === "detachement")
    notes.push(
      "Détachement : l'employeur ou l'entreprise bénéficiaire doit obtenir l'autorisation de travail lorsqu'elle est requise.",
    );
  if (p.lsAutorisation === "non")
    notes.push(
      "Autorisation de travail non obtenue alors qu'elle est requise : à obtenir par l'employeur AVANT le dépôt — point de blocage à lever en premier.",
    );
  if (p.lsAutorisation === "encours")
    notes.push(
      "Autorisation de travail en cours : le dossier ne peut être déposé qu'une fois obtenue.",
    );
  if (non(p.lsContratTravail))
    notes.push("Pas de contrat de travail ni de document équivalent : pièce centrale du dossier.");
  const complet = p.lsAutorisation === "oui" && oui(p.lsContratTravail);
  return lsResult(
    "ls_embauche",
    p.lsEmployeur === "detachement"
      ? "Travail · détachement par un employeur étranger"
      : "Travail · embauche par une entreprise française",
    "Long séjour (Visa D) · travail salarié",
    complet ? "attention" : "complexe",
    docs,
    notes,
  );
}

function buildLsIct(p: Profile): CaseResult {
  const docs = [
    ...LS_TRAVAIL_IDENTITE,
    "Formulaire CERFA n°15619*01 et pièces qui y sont listées",
    "Preuve d'ancienneté d'au moins 6 mois",
    "Preuve de l'appartenance des deux entreprises au même groupe",
    p.lsStatutIct === "stagiaire"
      ? "Pour le stagiaire : diplôme d'enseignement supérieur"
      : "Pour le salarié détaché : qualifications professionnelles + expérience",
  ];
  if (oui(p.lsProfReglementee))
    docs.push("Justificatif des conditions d'exercice de la profession réglementée, si applicable");
  if (oui(p.lsContratTravail)) docs.push("Contrat de travail, ou document équivalent");
  if (oui(p.lsLettreMission))
    docs.push(
      "Lettre de mission : conditions de rémunération, durée du transfert, localisation de l'entreprise d'accueil",
    );
  if (oui(p.lsCadre))
    docs.push(
      "Fonction de cadre / expert",
      "Possibilité de retour dans une entité du groupe située dans un pays tiers",
    );
  docs.push(
    "Justificatifs de ressources suffisantes : au moins égales au SMIC mensuel brut à temps plein",
  );
  const notes = [
    "France-Visas confirme le cadre ICT et le formulaire déclaratif 15619*01, ainsi que les justificatifs liés au groupe, au contrat et à la mission.",
  ];
  const bloquants: string[] = [];
  if (non(p.lsAnciennete)) bloquants.push("moins de 6 mois d'ancienneté dans le groupe");
  if (non(p.lsCadre)) bloquants.push("pas de fonction de cadre ou d'expert");
  if (non(p.lsContratTravail)) bloquants.push("pas de contrat de travail");
  if (non(p.lsLettreMission)) bloquants.push("pas de lettre de mission");
  if (bloquants.length)
    notes.push(`Points bloquants à lever avant le dépôt : ${bloquants.join(" ; ")}.`);
  return lsResult(
    "ls_ict",
    `Travail · ICT — mobilité intragroupe (${p.lsStatutIct === "stagiaire" ? "stagiaire" : "salarié"})`,
    "Long séjour (Visa D) · travail ICT",
    bloquants.length ? "complexe" : "attention",
    docs,
    notes,
  );
}

function buildLsEntrepreneur(p: Profile): CaseResult {
  const docs = [...LS_TRAVAIL_IDENTITE];
  const notes = [
    "France-Visas : l'activité entrepreneuriale / libérale en France relève du visa long séjour « entrepreneur / profession libérale » ; la viabilité économique du projet, ou la capacité à générer au moins le niveau minimum de ressources, est à justifier selon le cas.",
  ];

  if (p.lsProjet === "existante") {
    docs.push(
      "Attestation de compte à jour de l'entreprise délivrée par l'URSSAF",
      "Bordereau de situation fiscale de l'entreprise (P237)",
      "Statuts de l'entreprise si insertion dans une société",
      "Extrait RCS de moins de 3 mois, ou extrait du répertoire des métiers de moins de 3 mois",
      "Justificatif de nomination, ou lettre d'intention de l'organe compétent",
      p.lsStatutExistant === "salarie"
        ? "Original du contrat de travail + copie"
        : "Élément comptable certifié attestant d'un revenu au moins équivalent au SMIC",
      "Justificatifs de la viabilité économique du projet",
    );
    return lsResult(
      "ls_entrep_existante",
      `Travail · entrepreneur — insertion dans une activité existante (${p.lsStatutExistant === "salarie" ? "salarié" : "non-salarié"})`,
      "Long séjour (Visa D) · entrepreneur",
      "complexe",
      docs,
      notes,
    );
  }

  docs.push(
    "Présentation du projet",
    "Business plan",
    "Budget prévisionnel pluriannuel",
    "Avis de la plateforme compétente de la Main-d'œuvre étrangère lorsque requis",
    "Statuts",
    "Extrait K / Kbis si déjà obtenu, ou justificatif d'affiliation au régime social des indépendants",
    "CERFA « commerçant, artisan, industriel » complété",
    "Bordereau fiscal si résident en France, ou casier judiciaire / document équivalent du pays de nationalité, selon le cas",
    "Diplômes",
    "Qualifications",
    "Attestations de travail",
    "Engagement de cautionnement d'un établissement de crédit ou d'une entreprise d'assurance agréée en France, ou attestation de solde créditeur d'un compte bancaire en France",
  );
  const PAR_TYPE: Record<string, string[]> = {
    individuelle: [
      "Promesse de bail commercial, ou contrat de sous-location",
      "Autorisation du propriétaire si nécessaire",
      "Ou document relatif aux locaux, ou contrat de domiciliation",
    ],
    location_gerance: [
      "Promesse / contrat de location-gérance",
      "Extrait RCS / répertoire des métiers du précédent exploitant datant de moins de 3 mois",
      "Copie du bail du propriétaire du fonds",
    ],
    fonds: ["Promesse ou contrat de vente du fonds"],
    societe_fr: [
      "Promesse de bail / sous-location / document concernant les locaux",
      "Projet de statuts",
      "Répartition du capital",
    ],
    filiale: [
      "Justificatif de nomination / lettre d'intention",
      "Statuts de la société étrangère",
      "Documents concernant les locaux",
      "Projet de statuts + répartition du capital",
    ],
    personne_morale: [
      "Justificatif de nomination / lettre d'intention",
      "Statuts de la personne morale étrangère",
    ],
  };
  const TITRES: Record<string, string> = {
    individuelle: "entreprise individuelle / en nom propre",
    location_gerance: "location-gérance",
    fonds: "reprise d'un fonds de commerce",
    societe_fr: "société de droit français",
    filiale: "filiale d'une société étrangère",
    personne_morale: "établissement d'une personne morale étrangère",
  };
  const t = typeof p.lsActiviteType === "string" ? p.lsActiviteType : "individuelle";
  docs.push(...(PAR_TYPE[t] ?? []));
  return lsResult(
    "ls_entrep_creation",
    `Travail · entrepreneur — création d'activité (${TITRES[t] ?? "à préciser"})`,
    "Long séjour (Visa D) · entrepreneur",
    "complexe",
    docs,
    notes,
  );
}

function buildLsLiberale(p: Profile): CaseResult {
  const docs = [...LS_TRAVAIL_IDENTITE];
  const notes = [
    "France-Visas : le visa « entrepreneur / profession libérale » concerne la création ou la participation à une activité économique ; démontrer la viabilité du projet ou, pour une activité existante / libérale, une capacité à générer un niveau de ressources au moins équivalent au salaire minimum légal pour un temps plein.",
  ];
  if (oui(p.lsProfReglementee))
    docs.push(
      "Autorisation correspondant à l'exercice de la profession",
      "Autorisation de l'Ordre professionnel, si applicable",
      "Profession médicale / paramédicale : inscription au Conseil de l'Ordre, ou autorisation du Ministère de la Santé",
    );
  if (p.lsProjet === "existante")
    docs.push("Justificatifs démontrant l'effectivité de l'activité déjà existante");
  else {
    docs.push(
      "Avis du Service de la Main-d'Œuvre Étrangère (SMOE) sur la viabilité économique du projet",
      "Documents de présentation du projet",
      "Justificatifs professionnels nécessaires",
    );
    if (non(p.lsViabilite))
      notes.push(
        "La viabilité économique du projet n'a pas été évaluée : obtenir l'avis du SMOE avant le dépôt.",
      );
  }
  docs.push(
    "Documents justifiant le niveau de ressources attendu",
    "Justificatifs économiques de l'activité",
  );
  if (p.lsProjet === "existante")
    docs.push("Justificatifs de poursuite d'activité, le cas échéant");
  if (non(p.lsRessourcesSmic))
    notes.push(
      "L'activité ne permet pas de générer des ressources au moins équivalentes au SMIC temps plein : motif de refus direct, à corriger avant le dépôt.",
    );
  const bloque = non(p.lsViabilite) || non(p.lsRessourcesSmic);
  return lsResult(
    "ls_liberale",
    `Travail · profession libérale / indépendante (${p.lsProjet === "existante" ? "poursuite d'activité" : "création d'activité"}${oui(p.lsProfReglementee) ? ", profession réglementée" : ""})`,
    "Long séjour (Visa D) · profession libérale",
    bloque ? "complexe" : "attention",
    docs,
    notes,
  );
}

/** Aiguillage du long séjour à partir du type de demande, puis de la branche. */
export function buildLongSejour(p: Profile): CaseResult {
  switch (p.lsType) {
    case "retour":
      return buildLsRetour(p);
    case "famille":
      switch (p.lsFamille) {
        case "asc_charge":
          return buildLsAscendantCharge(p);
        case "asc_non_charge":
          return buildLsAscendantNonCharge(p);
        case "conjoint":
          return buildLsConjoint(p);
        case "parent_mineur":
          return buildLsParentMineur(p);
      }
      break;
    case "visiteur":
      return p.lsVisiteur === "mineur" ? buildLsVisiteurMineur(p) : buildLsVisiteurMajeur(p);
    case "travail":
      switch (p.lsTravail) {
        case "embauche":
          return buildLsEmbauche(p);
        case "ict":
          return buildLsIct(p);
        case "entrepreneur":
          return buildLsEntrepreneur(p);
        case "liberale":
          return buildLsLiberale(p);
      }
      break;
  }
  // Dossier enregistré avant la refonte du long séjour (ancien arbre : études, stage…) ou
  // réponses incomplètes : on ne devine rien, on demande une requalification.
  return lsResult(
    "ls_a_requalifier",
    "Long séjour · à requalifier",
    "Long séjour (Visa D) · à qualifier",
    "complexe",
    [LS_FORMULAIRE, LS_RCPC, LS_PHOTOS, "Passeport valide"],
    [
      "Qualification long séjour absente ou issue de l'ancien arbre : reprendre la qualification (retour, installation familiale, visiteur ou travail). Seul le socle commun est pré-rempli.",
    ],
  );
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

/**
 * Clés du bloc « personne hébergeante », posé EN DERNIER dans le questionnaire.
 *
 * L'hébergeant conditionne la pièce « attestation d'accueil » mais n'a rien à faire
 * du motif, de la durée ni du financement : le poser ici, au milieu du tronc commun,
 * interrompait le client pour des questions sans rapport avec ce qu'il venait de
 * répondre. `hebergement` ne mémorise plus que le drapeau « chez une personne » et
 * file vers `transport` ; c'est `goToResult` (qualification.tsx) qui, au terme de
 * N'IMPORTE QUELLE branche, bascule sur `PERSONNE_QUI` puis revient résoudre le cas
 * memorisé via `PERSONNE_FIN`.
 *
 * Un seul point d'entrée à instrumenter plutôt qu'une insertion dans les ~25 branches
 * qui se terminent chacune sur un résultat : un motif oublié ne peut pas&display
 * le bloc à moitié.
 */
export const PERSONNE_QUI = "personne_qui";
export const PERSONNE_FIN = "personne_fin";

/** Suite d'un nœud long séjour : un nœud du questionnaire, ou le résultat (`DYNAMIC_LS`). */
const lsTo = (n: string): Pick<TreeOption, "n" | "r"> =>
  n === "DYNAMIC_LS" ? { n, r: true } : { n };

/** Clés du profil qui portent une réponse oui/non du long séjour. */
type LsBoolKey = {
  [K in keyof Profile]-?: NonNullable<Profile[K]> extends boolean ? K : never;
}[keyof Profile];

/** Nœud oui/non du long séjour : enregistre la réponse dans `key` (booléen à plat). */
function lsOuiNon(q: string, key: LsBoolKey, nOui: string, nNon: string, help?: string): TreeNode {
  return {
    q,
    ...(help ? { help } : {}),
    opts: [
      { l: "Oui", ...lsTo(nOui), set: { [key]: true } },
      { l: "Non", ...lsTo(nNon), set: { [key]: false } },
    ],
  };
}
export const TREE: Record<string, TreeNode> = {
  /* ============ ÉTAPE 1 — ANTÉCÉDENTS DE VISA ============ */
  start: {
    q: "Avez-vous déjà obtenu un visa Schengen au cours des 59 derniers mois ?",
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

  /* ============ HÉBERGEMENT — commun, avant le motif ============ */
  hebergement: {
    q: "Où allez-vous séjourner pendant votre voyage ?",
    help: "Question commune posée avant le motif du voyage : elle s'applique à toutes les branches court séjour.",
    opts: [
      { l: "Hôtel / hébergement touristique", n: "hotel_fields", set: { hebergement: "hotel" } },
      // « Chez une personne » ne déclenche plus les questions d'hébergeant ici : elles sont
      // posées en dernier, une fois le dossier qualifié (voir PERSONNE_QUI).
      { l: "Chez une personne", n: "transport", set: { hebergement: "personne" } },
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
  /* ============ PERSONNE HÉBERGEANTE — bloc différé, posé EN DERNIER ============
     Ces quatre nœuds ne sont PAS dans le tronc commun : `hebergement` saute par-dessus,
     et `goToResult` (qualification.tsx) y revient au terme de la branche. Ils restent
     déclarés ici, entre `hebergement` et `transport`, pour rester lisibles. */
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
      { l: "Oui", n: "personne_fields2" },
      { l: "Non", n: "personne_fields2" },
    ],
  },
  personne_fields2: {
    q: "Nationalité / statut de la personne hébergeante.",
    fields: [{ key: "personne_nat_statut", label: "Nationalité / statut" }],
    // Dernière question du questionnaire : on rend la main au cas mis de côté.
    next: PERSONNE_FIN,
    fieldsResult: true,
  },

  /* ============ TRANSPORT / FINANCEMENT / DURÉE — communes, avant le motif ============ */
  transport: {
    q: "Quel est votre moyen de transport pour vous rendre en France ?",
    help: "Déclenche la pièce « pré-réservation ou réservation du billet aller-retour ».",
    opts: [
      { l: "Avion", n: "financement", set: { transport: "avion" } },
      // « Autobus » retiré du questionnaire (décision Eiden) — la valeur reste lisible
      // dans le type pour les dossiers créés avant le retrait.
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
      { l: "> 90 jours (long séjour)", n: "ls_type", set: { duree: "long" } },
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
  /* ============ LONG SÉJOUR (Visa D) — arbre « EIDEN Visa — Long séjour » ============ */
  ls_type: {
    q: "Quel est le type de votre demande de visa long séjour ?",
    help: "Séjour de plus de 90 jours — chaque type a ses propres questions et justificatifs.",
    opts: [
      { l: "Visa de retour", n: "ls_retour_motif", set: { lsType: "retour" } },
      {
        l: "Installation familiale ou privée",
        n: "ls_famille_situation",
        set: { lsType: "famille" },
      },
      { l: "Visiteur", n: "ls_visiteur_age", set: { lsType: "visiteur" } },
      { l: "Travail", n: "ls_travail_situation", set: { lsType: "travail" } },
    ],
  },

  /* ---- 1. Visa de retour ---- */
  ls_retour_motif: {
    q: "Pourquoi demandez-vous un visa de retour en France ?",
    opts: [
      {
        l: "Perte ou vol du titre de séjour",
        n: "ls_pt_declaration",
        set: { lsRetour: "perte_titre" },
      },
      {
        l: "Perte ou vol du passeport contenant le visa long séjour",
        n: "ls_pp_declaration",
        set: { lsRetour: "perte_passeport" },
      },
      {
        l: "Première demande de carte de séjour / récépissé",
        n: "ls_rec_recepisse",
        set: { lsRetour: "recepisse" },
      },
      {
        l: "Mineur sorti de France sans DCEM / TIR",
        n: "ls_min_mineur",
        set: { lsRetour: "mineur" },
      },
    ],
  },
  ls_pt_declaration: lsOuiNon(
    "Avez-vous effectué une déclaration de perte ou de vol ?",
    "lsDeclarationPerte",
    "ls_pt_copie",
    "ls_pt_copie",
  ),
  ls_pt_copie: lsOuiNon(
    "Disposez-vous d'une photocopie de votre titre de séjour perdu ou volé ?",
    "lsCopieTitre",
    "DYNAMIC_LS",
    "ls_pt_references",
  ),
  ls_pt_references: lsOuiNon(
    "Disposez-vous des références de votre titre de séjour ?",
    "lsReferencesTitre",
    "ls_pt_references_fields",
    "DYNAMIC_LS",
  ),
  ls_pt_references_fields: {
    q: "Références du titre de séjour.",
    fields: [
      { key: "ls_titre_numero", label: "Numéro du titre" },
      { key: "ls_titre_delivrance", label: "Date de délivrance", type: "date" },
      { key: "ls_titre_lieu", label: "Lieu de délivrance" },
    ],
    next: "DYNAMIC_LS",
    fieldsResult: true,
  },
  ls_pp_declaration: lsOuiNon(
    "Avez-vous effectué une déclaration de perte ou de vol du passeport ?",
    "lsDeclarationPerte",
    "ls_pp_copie",
    "ls_pp_copie",
  ),
  ls_pp_copie: lsOuiNon(
    "Disposez-vous d'une copie du passeport perdu ou volé ?",
    "lsCopieTitre",
    "DYNAMIC_LS",
    "ls_pp_references",
  ),
  ls_pp_references: lsOuiNon(
    "Disposez-vous des références du passeport ou du visa ?",
    "lsReferencesTitre",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),
  ls_rec_recepisse: lsOuiNon(
    "Avez-vous un récépissé de première demande de carte de séjour ?",
    "lsRecepisse",
    "ls_rec_valide",
    "DYNAMIC_LS",
  ),
  ls_rec_valide: lsOuiNon(
    "Votre récépissé est-il encore en cours de validité ?",
    "lsRecepisseValide",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),
  ls_min_mineur: lsOuiNon("Êtes-vous mineur ?", "lsMineur", "ls_min_dcem", "DYNAMIC_LS"),
  ls_min_dcem: lsOuiNon(
    "Disposez-vous d'un DCEM ou d'un TIR ?",
    "lsDcemTir",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),

  /* ---- 2. Installation familiale ou privée ---- */
  ls_famille_situation: {
    q: "Quelle est votre situation familiale en France ?",
    opts: [
      {
        l: "Ascendant à charge de Français ou de son conjoint étranger",
        n: "ls_ac_lien",
        set: { lsFamille: "asc_charge" },
      },
      { l: "Ascendant non à charge", n: "ls_anc_parent", set: { lsFamille: "asc_non_charge" } },
      { l: "Conjoint(e) de Français", n: "ls_c_marie", set: { lsFamille: "conjoint" } },
      {
        l: "Parent d'un enfant mineur français",
        n: "ls_pm_francais",
        set: { lsFamille: "parent_mineur" },
      },
    ],
  },
  /* 2.1 Ascendant à charge */
  ls_ac_lien: {
    q: "Quel est votre lien avec la personne que vous allez rejoindre ?",
    opts: [
      { l: "Parent", n: "ls_ac_francais", set: { lsLien: "parent" } },
      { l: "Grand-parent", n: "ls_ac_francais", set: { lsLien: "grand_parent" } },
      { l: "Autre ascendant", n: "ls_ac_francais", set: { lsLien: "autre" } },
    ],
  },
  ls_ac_francais: lsOuiNon(
    "La personne que vous rejoignez est-elle de nationalité française ?",
    "lsDescFrancais",
    "ls_ac_marie",
    "ls_ac_marie",
  ),
  ls_ac_marie: {
    q: "Si la personne que vous rejoignez est étrangère, est-elle mariée à un ressortissant français ?",
    opts: [
      { l: "Oui", n: "ls_ac_charge", set: { lsDescMarie: "oui" } },
      { l: "Non", n: "ls_ac_charge", set: { lsDescMarie: "non" } },
      { l: "Non applicable", n: "ls_ac_charge", set: { lsDescMarie: "na" } },
    ],
  },
  ls_ac_charge: lsOuiNon(
    "Êtes-vous financièrement pris en charge par votre descendant ou son conjoint dans votre pays de résidence ?",
    "lsPriseEnCharge",
    "ls_ac_regulier",
    "DYNAMIC_LS",
  ),
  ls_ac_regulier: lsOuiNon(
    "Cette prise en charge est-elle régulière et effective depuis une période significative ?",
    "lsPriseRegulier",
    "ls_ac_ressources",
    "ls_ac_ressources",
  ),
  ls_ac_ressources: lsOuiNon(
    "Avez-vous vos propres ressources dans votre pays d'origine ?",
    "lsRessourcesPropres",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),
  /* 2.2 Ascendant non à charge */
  ls_anc_parent: lsOuiNon(
    "Êtes-vous le parent ou grand-parent d'un ressortissant français ou de son conjoint ?",
    "lsParentFrancais",
    "ls_anc_ressources",
    "DYNAMIC_LS",
  ),
  ls_anc_ressources: {
    q: "Avez-vous des ressources personnelles suffisantes pour subvenir à vos besoins en France ?",
    help: "Si oui, orientation vers Long séjour → Visiteur, conformément à l'orientation actuelle de France-Visas.",
    opts: [
      {
        l: "Oui — orienter vers Visiteur",
        n: "ls_visiteur_age",
        set: { lsRessourcesPerso: true, lsType: "visiteur" },
      },
      { l: "Non", n: "DYNAMIC_LS", r: true, set: { lsRessourcesPerso: false } },
    ],
  },
  /* 2.3 Conjoint(e) de Français */
  ls_c_marie: lsOuiNon(
    "Êtes-vous légalement marié(e) à un ressortissant français ?",
    "lsMarie",
    "ls_c_francais",
    "ls_c_francais",
  ),
  ls_c_francais: lsOuiNon(
    "Votre conjoint est-il de nationalité française ?",
    "lsConjointFrancais",
    "ls_c_acte",
    "ls_c_acte",
  ),
  ls_c_acte: lsOuiNon(
    "Disposez-vous de l'acte intégral de mariage ?",
    "lsActeMariage",
    "ls_c_transcrit",
    "ls_c_transcrit",
  ),
  ls_c_transcrit: {
    q: "Votre mariage est-il reconnu / transcrit lorsque cette transcription est nécessaire ?",
    opts: [
      { l: "Oui", n: "ls_c_communaute", set: { lsTranscrit: "oui" } },
      { l: "Non", n: "ls_c_communaute", set: { lsTranscrit: "non" } },
      { l: "Non applicable", n: "ls_c_communaute", set: { lsTranscrit: "na" } },
    ],
  },
  ls_c_communaute: lsOuiNon(
    "Avez-vous une communauté de vie avec votre conjoint français ?",
    "lsCommunaute",
    "ls_c_maintien",
    "ls_c_maintien",
  ),
  ls_c_maintien: lsOuiNon(
    "Votre projet est-il de maintenir cette communauté de vie en France ?",
    "lsMaintien",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),
  /* 2.4 Parent d'un enfant mineur français */
  ls_pm_francais: lsOuiNon(
    "Avez-vous un enfant de nationalité française ?",
    "lsEnfantFrancais",
    "ls_pm_mineur",
    "ls_pm_mineur",
  ),
  ls_pm_mineur: lsOuiNon(
    "Votre enfant est-il âgé de moins de 18 ans ?",
    "lsEnfantMineur",
    "ls_pm_filiation",
    "ls_pm_filiation",
  ),
  ls_pm_filiation: lsOuiNon(
    "Le lien de filiation avec votre enfant est-il officiellement établi ?",
    "lsFiliation",
    "ls_pm_reside",
    "ls_pm_reside",
  ),
  ls_pm_reside: lsOuiNon(
    "Votre enfant réside-t-il en France ?",
    "lsEnfantReside",
    "ls_pm_contribue",
    "ls_pm_contribue",
  ),
  ls_pm_contribue: lsOuiNon(
    "Contribuez-vous effectivement à l'entretien et à l'éducation de votre enfant ?",
    "lsContribue",
    "ls_pm_2ans",
    "ls_pm_2ans",
  ),
  ls_pm_2ans: lsOuiNon(
    "Cette contribution existe-t-elle depuis la naissance de l'enfant ou depuis au moins 2 ans ?",
    "lsContribue2ans",
    "ls_pm_autre",
    "ls_pm_autre",
  ),
  ls_pm_autre: lsOuiNon(
    "L'autre parent exerce-t-il également l'autorité parentale ?",
    "lsAutreParent",
    "ls_pm_autorise",
    "ls_pm_garde",
  ),
  ls_pm_autorise: lsOuiNon(
    "L'autre parent vous autorise-t-il à établir votre résidence en France avec l'enfant / à rejoindre votre enfant en France ?",
    "lsAutreParentAutorise",
    "ls_pm_garde",
    "ls_pm_garde",
  ),
  ls_pm_garde: lsOuiNon(
    "Existe-t-il une décision de justice ou une situation particulière concernant la garde de l'enfant ?",
    "lsDecisionGarde",
    "ls_pm_polygamie",
    "ls_pm_polygamie",
  ),
  ls_pm_polygamie: lsOuiNon(
    "Vivez-vous en état de polygamie ?",
    "lsPolygamie",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),

  /* ---- 3. Visiteur ---- */
  ls_visiteur_age: {
    q: "Quel est l'âge du demandeur ?",
    opts: [
      { l: "18 ans ou plus — visiteur majeur", n: "ls_vm_activite", set: { lsVisiteur: "majeur" } },
      {
        l: "Moins de 18 ans — visiteur mineur",
        n: "ls_vmin_scolarise",
        set: { lsVisiteur: "mineur" },
      },
    ],
  },
  /* 3.1 Visiteur majeur */
  ls_vm_activite: {
    q: "Avez-vous l'intention d'exercer une activité professionnelle en France ?",
    help: "Le visa visiteur suppose l'engagement de ne pas travailler : si oui, redirection vers Travail.",
    opts: [
      { l: "Oui — rediriger vers Travail", n: "ls_travail_situation", set: { lsType: "travail" } },
      { l: "Non", n: "ls_vm_situation" },
    ],
  },
  ls_vm_situation: {
    q: "Quelle est votre situation socio-économique ?",
    opts: [
      { l: "Salarié", n: "ls_vm_finance", set: { lsSituation: "salarie" } },
      { l: "Fonctionnaire", n: "ls_vm_finance", set: { lsSituation: "fonctionnaire" } },
      { l: "Entrepreneur", n: "ls_vm_finance", set: { lsSituation: "entrepreneur" } },
      { l: "Retraité", n: "ls_vm_finance", set: { lsSituation: "retraite" } },
      { l: "Étudiant", n: "ls_vm_finance", set: { lsSituation: "etudiant" } },
      { l: "Sans activité", n: "ls_vm_finance", set: { lsSituation: "sans" } },
      { l: "Autre", n: "ls_vm_finance", set: { lsSituation: "autre" } },
    ],
  },
  ls_vm_finance: {
    q: "Qui finance votre séjour ?",
    opts: [
      { l: "Moi-même", n: "ls_vm_fonds", set: { lsFinanceSejour: "soi" } },
      { l: "Parent / famille", n: "ls_vm_fonds", set: { lsFinanceSejour: "famille" } },
      { l: "Autre personne", n: "ls_vm_fonds", set: { lsFinanceSejour: "autre" } },
    ],
  },
  ls_vm_fonds: lsOuiNon(
    "Disposez-vous de fonds suffisants pour couvrir votre séjour en France ?",
    "lsFonds",
    "ls_vm_logement",
    "ls_vm_logement",
  ),
  ls_vm_logement: {
    q: "Où allez-vous résider en France ?",
    opts: [
      { l: "Ma propriété", n: "DYNAMIC_LS", set: { lsLogement: "propriete" }, r: true },
      { l: "Logement loué", n: "DYNAMIC_LS", set: { lsLogement: "location" }, r: true },
      {
        l: "Chez une personne résidant en France",
        n: "DYNAMIC_LS",
        set: { lsLogement: "personne" },
        r: true,
      },
      { l: "Autre", n: "DYNAMIC_LS", set: { lsLogement: "autre" }, r: true },
    ],
  },
  /* 3.2 Visiteur mineur / mineur scolarisé */
  ls_vmin_scolarise: lsOuiNon(
    "Êtes-vous inscrit(e) dans un établissement scolaire en France ?",
    "lsScolarise",
    "ls_vmin_ecole",
    "ls_vmin_separes",
  ),
  ls_vmin_ecole: {
    q: "Établissement scolaire à rejoindre en France.",
    fields: [
      { key: "ls_ecole_nom", label: "Nom de l'établissement" },
      { key: "ls_ecole_adresse", label: "Adresse" },
    ],
    next: "ls_vmin_separes",
  },
  ls_vmin_separes: lsOuiNon(
    "Vos parents sont-ils séparés ou divorcés ?",
    "lsParentsSepares",
    "ls_vmin_garde",
    "ls_vmin_finance",
  ),
  ls_vmin_garde: {
    q: "Qui dispose du droit de garde ?",
    opts: [
      { l: "Le père", n: "ls_vmin_autorise", set: { lsGarde: "pere" } },
      { l: "La mère", n: "ls_vmin_autorise", set: { lsGarde: "mere" } },
      { l: "Autre", n: "ls_vmin_autorise", set: { lsGarde: "autre" } },
    ],
  },
  ls_vmin_autorise: lsOuiNon(
    "Le parent disposant du droit de garde autorise-t-il le séjour / l'établissement de l'enfant en France ?",
    "lsGardeAutorise",
    "ls_vmin_finance",
    "ls_vmin_finance",
  ),
  ls_vmin_finance: {
    q: "Qui finance votre séjour ?",
    opts: [
      { l: "Père", n: "ls_vmin_heberg", set: { lsFinanceMineur: "pere" } },
      { l: "Mère", n: "ls_vmin_heberg", set: { lsFinanceMineur: "mere" } },
      { l: "Les deux parents", n: "ls_vmin_heberg", set: { lsFinanceMineur: "parents" } },
      { l: "Organisme", n: "ls_vmin_heberg", set: { lsFinanceMineur: "organisme" } },
      {
        l: "Proche résidant en France",
        n: "ls_vmin_heberg",
        set: { lsFinanceMineur: "proche" },
      },
      { l: "Autre", n: "ls_vmin_heberg", set: { lsFinanceMineur: "autre" } },
    ],
  },
  ls_vmin_heberg: {
    q: "Où serez-vous hébergé(e) en France ?",
    opts: [
      { l: "Chez les parents", n: "ls_vmin_ressortissant", set: { lsHebergMineur: "parents" } },
      { l: "Chez un proche", n: "ls_vmin_ressortissant", set: { lsHebergMineur: "proche" } },
      { l: "Résidence", n: "ls_vmin_ressortissant", set: { lsHebergMineur: "residence" } },
      { l: "Autre", n: "ls_vmin_ressortissant", set: { lsHebergMineur: "autre" } },
    ],
  },
  ls_vmin_ressortissant: lsOuiNon(
    "Êtes-vous ressortissant du pays dans lequel vous déposez votre demande ?",
    "lsRessortissant",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
    "Si non : preuve de résidence légale demandée.",
  ),

  /* ---- 4. Travail ---- */
  ls_travail_situation: {
    q: "Quelle est votre situation professionnelle en France ?",
    opts: [
      { l: "Embauche / détachement", n: "ls_emb_employeur", set: { lsTravail: "embauche" } },
      { l: "ICT — mobilité intragroupe", n: "ls_ict_groupe", set: { lsTravail: "ict" } },
      { l: "Entrepreneur", n: "ls_ent_projet", set: { lsTravail: "entrepreneur" } },
      {
        l: "Profession libérale / indépendante",
        n: "ls_lib_projet",
        set: { lsTravail: "liberale" },
      },
    ],
  },
  /* 4.1 Embauche / détachement */
  ls_emb_employeur: {
    q: "Votre employeur est-il établi en France ou allez-vous être détaché(e) par votre employeur actuel ?",
    opts: [
      {
        l: "Embauche par une entreprise française",
        n: "ls_emb_autorisation",
        set: { lsEmployeur: "france" },
      },
      {
        l: "Détachement par mon employeur étranger",
        n: "ls_emb_autorisation",
        set: { lsEmployeur: "detachement" },
      },
    ],
  },
  ls_emb_autorisation: {
    q: "Disposez-vous d'une autorisation de travail lorsque celle-ci est requise ?",
    opts: [
      { l: "Oui", n: "ls_emb_contrat", set: { lsAutorisation: "oui" } },
      { l: "Non", n: "ls_emb_contrat", set: { lsAutorisation: "non" } },
      { l: "En cours", n: "ls_emb_contrat", set: { lsAutorisation: "encours" } },
    ],
  },
  ls_emb_contrat: lsOuiNon(
    "Avez-vous un contrat de travail ou document équivalent ?",
    "lsContratTravail",
    "ls_emb_diplomes",
    "ls_emb_diplomes",
  ),
  ls_emb_diplomes: lsOuiNon(
    "Disposez-vous de diplômes ou justificatifs de qualification pour le poste ?",
    "lsDiplomes",
    "ls_emb_attestations",
    "ls_emb_attestations",
  ),
  ls_emb_attestations: lsOuiNon(
    "Avez-vous des attestations de travail / expérience professionnelle ?",
    "lsAttestations",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),
  /* 4.2 ICT — mobilité intragroupe */
  ls_ict_groupe: {
    q: "Votre employeur actuel et l'entreprise française d'accueil appartiennent-ils au même groupe d'entreprises ?",
    help: "Si non, redirection vers une autre catégorie de travail.",
    opts: [
      { l: "Oui", n: "ls_ict_anciennete", set: { lsMemeGroupe: true } },
      {
        l: "Non — rediriger vers une autre catégorie de travail",
        n: "ls_travail_situation",
        set: { lsMemeGroupe: false },
      },
    ],
  },
  ls_ict_anciennete: lsOuiNon(
    "Êtes-vous salarié(e) du groupe depuis au moins 6 mois ?",
    "lsAnciennete",
    "ls_ict_statut",
    "ls_ict_statut",
  ),
  ls_ict_statut: {
    q: "Quel est votre statut dans le cadre de la mobilité ?",
    opts: [
      { l: "Salarié ICT", n: "ls_ict_cadre", set: { lsStatutIct: "salarie" } },
      { l: "Stagiaire ICT", n: "ls_ict_cadre", set: { lsStatutIct: "stagiaire" } },
    ],
  },
  ls_ict_cadre: lsOuiNon(
    "Exercerez-vous une fonction de cadre ou d'expert ?",
    "lsCadre",
    "ls_ict_contrat",
    "ls_ict_contrat",
  ),
  ls_ict_contrat: lsOuiNon(
    "Disposez-vous d'un contrat de travail ?",
    "lsContratTravail",
    "ls_ict_mission",
    "ls_ict_mission",
  ),
  ls_ict_mission: lsOuiNon(
    "Avez-vous une lettre de mission de votre employeur ?",
    "lsLettreMission",
    "ls_ict_reglementee",
    "ls_ict_reglementee",
  ),
  ls_ict_reglementee: lsOuiNon(
    "Votre profession est-elle réglementée ?",
    "lsProfReglementee",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),
  /* 4.3 Entrepreneur */
  ls_ent_projet: {
    q: "Quel est votre projet en France ?",
    opts: [
      { l: "Création d'une nouvelle activité", n: "ls_ent_type", set: { lsProjet: "creation" } },
      {
        l: "Insertion / participation dans une activité existante",
        n: "ls_ent_statut",
        set: { lsProjet: "existante" },
      },
    ],
  },
  ls_ent_type: {
    q: "Quel type d'activité souhaitez-vous créer ?",
    opts: [
      {
        l: "Entreprise individuelle / en nom propre",
        n: "ls_ent_activite",
        set: { lsActiviteType: "individuelle" },
      },
      { l: "Location-gérance", n: "ls_ent_activite", set: { lsActiviteType: "location_gerance" } },
      {
        l: "Reprise d'un fonds de commerce",
        n: "ls_ent_activite",
        set: { lsActiviteType: "fonds" },
      },
      {
        l: "Société de droit français",
        n: "ls_ent_activite",
        set: { lsActiviteType: "societe_fr" },
      },
      {
        l: "Filiale d'une société étrangère",
        n: "ls_ent_activite",
        set: { lsActiviteType: "filiale" },
      },
      {
        l: "Établissement d'une personne morale étrangère",
        n: "ls_ent_activite",
        set: { lsActiviteType: "personne_morale" },
      },
    ],
  },
  ls_ent_activite: {
    q: "Votre activité.",
    help: "Commerciale, artisanale, industrielle ou autre.",
    fields: [{ key: "ls_ent_nature", label: "Quelle est votre activité ?" }],
    next: "ls_ent_structure",
  },
  ls_ent_structure: lsOuiNon(
    "Disposez-vous déjà d'une structure ou d'une immatriculation en France ?",
    "lsStructure",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),
  ls_ent_statut: {
    q: "Quel sera votre statut dans cette activité existante ?",
    help: "Vous intégrez une entreprise ou une activité déjà existante en France.",
    opts: [
      { l: "Salarié", n: "DYNAMIC_LS", set: { lsStatutExistant: "salarie" }, r: true },
      { l: "Non-salarié", n: "DYNAMIC_LS", set: { lsStatutExistant: "non_salarie" }, r: true },
    ],
  },
  /* 4.4 Profession libérale / indépendante */
  ls_lib_projet: {
    q: "Souhaitez-vous créer une nouvelle activité ou poursuivre une activité existante ?",
    opts: [
      { l: "Création d'activité", n: "ls_lib_reglementee_c", set: { lsProjet: "creation" } },
      {
        l: "Poursuite d'activité existante",
        n: "ls_lib_reglementee_e",
        set: { lsProjet: "existante" },
      },
    ],
  },
  ls_lib_reglementee_c: lsOuiNon(
    "Votre profession est-elle réglementée ?",
    "lsProfReglementee",
    "ls_lib_viabilite",
    "ls_lib_viabilite",
  ),
  ls_lib_reglementee_e: lsOuiNon(
    "Votre profession est-elle réglementée ?",
    "lsProfReglementee",
    "ls_lib_smic",
    "ls_lib_smic",
  ),
  ls_lib_viabilite: lsOuiNon(
    "Votre projet a-t-il fait l'objet d'une évaluation de sa viabilité économique ?",
    "lsViabilite",
    "ls_lib_smic",
    "ls_lib_smic",
  ),
  ls_lib_smic: lsOuiNon(
    "Votre activité vous permet-elle de générer des ressources au moins équivalentes au SMIC correspondant à un temps plein ?",
    "lsRessourcesSmic",
    "DYNAMIC_LS",
    "DYNAMIC_LS",
  ),

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
