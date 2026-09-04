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
  base?: "tourisme" | "visite_generale" | "visite_enfant_parent" | "famille_ue";
  dependent?: boolean;
  minor?: boolean;
  married?: boolean;
  spouseNoJob?: boolean;
  visaHist?: boolean;
  grandchildNote?: boolean;
  prof?: "salarie" | "commercant" | "agriculteur" | "retraite" | "etudiant" | "sans";
}

/* ============ CAS À RÉSULTAT FIGÉ ============ */

const FIXED: Record<string, Omit<CaseResult, "key">> = {
  t3: {
    title: "VLS-TS « vie privée et familiale » · conjoint de Français",
    cat: "Long séjour · installation durable",
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
      "Ce n'est pas une démarche initiée au consulat par le demandeur : c'est le résident en France qui engage la procédure auprès de l'OFII/préfecture (18 mois de séjour régulier, ressources stables, logement adapté). Le visa n'intervient qu'en toute fin de procédure. Hors format « dossier + rendez-vous » : orienter vers un accompagnement dédié ou un service juridique spécialisé.",
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
    cat: "Court séjour Schengen · déplacement professionnel",
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
    cat: "Long séjour · emploi qualifié",
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
    cat: "Long séjour · emploi salarié",
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
    cat: "Long séjour · détachement",
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
    ],
    extra: [],
    notes: [],
  },
  tc5: {
    title: "Travailleur saisonnier",
    cat: "Long séjour · emploi saisonnier",
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
};

/* ============ ASSEMBLAGE DYNAMIQUE (court séjour) ============ */

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

export function buildCourtSejour(p: Profile): CaseResult {
  const base = p.base ?? "tourisme";

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
      cat: "Court séjour Schengen · libre circulation UE/EEE/Suisse",
      level: "attention",
      docs,
      extra: [],
      notes: [
        "Cas simplifié par le droit européen : France-Visas ne demande ici ni justificatif de ressources propres, ni preuve de situation professionnelle, ni justificatif d'hébergement séparé. Ne pas ajouter ces pièces par réflexe : cela alourdit un dossier qui doit rester simple et peut semer le doute sur le motif réel.",
      ],
    };
  }

  const META = {
    tourisme: {
      title: "Visa touriste classique",
      cat: "Court séjour Schengen · tourisme",
      level: "standard" as Level,
    },
    visite_generale: {
      title: "Visite familiale généraliste",
      cat: "Court séjour Schengen · visite privée",
      level: "attention" as Level,
    },
    visite_enfant_parent: {
      title: "Visite enfant/parent de Français",
      cat: "Court séjour Schengen · lien direct avec un citoyen français",
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
  if (base === "tourisme")
    docs.push(
      "Réservation (voyage) : confirmation d'un voyage organisé, ou tout document décrivant le programme prévu",
    );
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
  if (base === "tourisme")
    docs.push(
      "Hébergement : réservation d'hôtel, ou justificatifs de ressources suffisantes (120 €/jour), ou contrat de location/titre de propriété ; si hébergement chez un particulier : justificatif de logement (Cerfa = attestation d'accueil)",
    );
  else docs.push("Hébergement : preuve d'hébergement (attestation d'accueil)");
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

  return { key: "cs_" + base, title: meta.title, cat: meta.cat, level: meta.level, docs, extra, notes };
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
export interface TreeNode {
  q: string;
  help?: string;
  opts: TreeOption[];
}

export const TREE: Record<string, TreeNode> = {
  start: {
    q: "Quel est le motif principal du séjour ?",
    help: "Question posée telle quelle au client à l'accueil. Le motif déclaré conditionne toute la suite du dossier.",
    opts: [
      { l: "Tourisme / visite privée", n: "a0" },
      { l: "Rejoindre un proche pour vivre en France", n: "b1" },
      { l: "Travail", n: "c1" },
      { l: "Raisons de santé", n: "dout", r: true },
      { l: "Études", n: "eout", r: true },
    ],
  },
  a0: {
    q: "Le demandeur accompagne-t-il ou rejoint-il un membre de sa famille ressortissant d'un pays de l'UE/EEE ou de la Confédération suisse (hors France) ?",
    help: "Inclut aussi le membre de la famille d'un citoyen britannique bénéficiaire de l'accord de retrait. Ce cas suit le droit européen : liste de pièces plus courte.",
    opts: [
      { l: "Oui", n: "a0b", set: { base: "famille_ue" } },
      { l: "Non", n: "a1" },
    ],
  },
  a0b: {
    q: "Le demandeur est-il à la charge de ce ressortissant UE/EEE/Suisse ?",
    help: "Enfant de plus de 21 ans, ascendant, ou membre du foyer.",
    opts: [
      { l: "Oui", n: "DYNAMIC", set: { dependent: true }, r: true },
      { l: "Non", n: "DYNAMIC", r: true },
    ],
  },
  a1: {
    q: "Le demandeur a-t-il de la famille proche en France (parent, conjoint, enfant, frère/sœur) ?",
    opts: [
      { l: "Non", n: "q_group", set: { base: "tourisme" } },
      { l: "Oui", n: "a2" },
    ],
  },
  a2: {
    q: "Le séjour est-il une simple visite avec retour prévu, ou une installation ?",
    opts: [
      { l: "Simple visite, retour prévu", n: "a3" },
      { l: "Souhaite s'installer durablement", n: "b1" },
    ],
  },
  a3: {
    q: "Quel est le lien avec la personne qui héberge en France ?",
    opts: [
      { l: "Enfant ou parent/beau-parent d'un citoyen français", n: "q_group", set: { base: "visite_enfant_parent" } },
      { l: "Petit-enfant d'un citoyen français", n: "q_group", set: { base: "visite_generale", grandchildNote: true } },
      { l: "Autre lien familial ou ami", n: "q_group", set: { base: "visite_generale" } },
    ],
  },
  q_group: {
    q: "Qui voyage dans le cadre de ce dossier ?",
    opts: [
      { l: "Une personne seule", n: "q_civil" },
      { l: "Un couple sans enfant", n: "q_civil" },
      { l: "Une famille avec au moins un mineur", n: "q_civil", set: { minor: true } },
      { l: "Un groupe ou autre configuration", n: "q_civil" },
    ],
  },
  q_civil: {
    q: "Le demandeur est-il marié(e) ou célibataire ?",
    opts: [
      { l: "Marié(e)", n: "q_conjoint_prof", set: { married: true } },
      { l: "Célibataire", n: "q_prof" },
    ],
  },
  q_conjoint_prof: {
    q: "Le conjoint (en France ou au Maroc) a-t-il une profession ?",
    opts: [
      { l: "Oui, il/elle travaille", n: "q_prof" },
      { l: "Non, sans profession", n: "q_prof", set: { spouseNoJob: true } },
    ],
  },
  q_prof: {
    q: "Quelle est la situation professionnelle du demandeur ?",
    opts: [
      { l: "Salarié(e) ou fonctionnaire", n: "q_visa_hist", set: { prof: "salarie" } },
      { l: "Commerçant(e) / profession libérale", n: "q_visa_hist", set: { prof: "commercant" } },
      { l: "Agriculteur(rice) / exploitant agricole", n: "q_visa_hist", set: { prof: "agriculteur" } },
      { l: "Retraité(e)", n: "q_visa_hist", set: { prof: "retraite" } },
      { l: "Étudiant(e)", n: "q_visa_hist", set: { prof: "etudiant" } },
      { l: "Sans profession / autre", n: "q_visa_hist", set: { prof: "sans" } },
    ],
  },
  q_visa_hist: {
    q: "A-t-il voyagé avec un visa Schengen durant les 59 derniers mois ?",
    opts: [
      { l: "Oui", n: "DYNAMIC", set: { visaHist: true }, r: true },
      { l: "Non", n: "DYNAMIC", r: true },
    ],
  },
  b1: {
    q: "Quel est le lien avec la personne en France ?",
    opts: [
      { l: "Époux / épouse (marié)", n: "b2" },
      { l: "Parent ou enfant à charge", n: "t5", r: true },
      { l: "Autre lien (frère/sœur, oncle...)", n: "t5", r: true },
    ],
  },
  b2: {
    q: "Le conjoint en France a-t-il la nationalité française ?",
    opts: [
      { l: "Oui", n: "t3", r: true },
      { l: "Non, c'est un résident étranger", n: "t4", r: true },
    ],
  },
  c1: {
    q: "Quelle est la nature de l'activité prévue en France ?",
    opts: [
      { l: "Déplacement professionnel court (réunions, salon), pas de contrat local", n: "tc1", r: true },
      { l: "Emploi salarié chez un employeur basé en France", n: "c2" },
      { l: "Détachement par l'entreprise marocaine actuelle", n: "tc4", r: true },
      { l: "Travail saisonnier", n: "tc5", r: true },
    ],
  },
  c2: {
    q: "Diplôme d'au moins Bac+3 ET salaire annuel brut prévu ≥ ~39 582 € (seuil 2026) ?",
    opts: [
      { l: "Oui", n: "tc2", r: true },
      { l: "Non", n: "tc3", r: true },
    ],
  },
};

/** Périmètre du service au lancement (étude EV/2026-08). */
export const SCOPE = {
  in: ["Tourisme / visite", "Famille", "Travail"],
  out: ["Santé (écarté au lancement)", "Études (orienter vers Campus France)"],
};
