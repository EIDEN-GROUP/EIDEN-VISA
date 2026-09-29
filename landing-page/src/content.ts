// Tout le contenu de la landing (textes de la maquette), séparé du rendu.
import {
  CalendarDays,
  Clock,
  FileSpreadsheet,
  FolderOpen,
  House,
  List,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

/** Liens des boutons. À pointer vers l'app / WhatsApp quand les URL de prod sont fixées. */
export const LIENS = {
  commencer: "#packs",
  evaluer: "#packs",
  methode: "#methode",
  contact: "#faq",
};

export const NAV = [
  { id: "accueil", label: "Accueil" },
  { id: "services", label: "Nos services" },
  { id: "visa", label: "Types de visa" },
  { id: "packs", label: "Nos packs" },
  { id: "faq", label: "FAQ" },
] as const;

export const HERO_ATOUTS: { icon: LucideIcon; lignes: [string, string] }[] = [
  { icon: UserRound, lignes: ["Accompagnement", "par des experts"] },
  { icon: Clock, lignes: ["Processus simple", "et rapide"] },
  { icon: House, lignes: ["Plus de sérénité", "pour votre voyage"] },
];

export const ETAPES: { icon: LucideIcon; titre: string; texte: string }[] = [
  { icon: Search, titre: "Analyse", texte: "Nous comprenons votre situation et votre projet." },
  {
    icon: FileSpreadsheet,
    titre: "Documents",
    texte: "Nous identifions les documents nécessaires à votre dossier.",
  },
  {
    icon: FolderOpen,
    titre: "Préparation",
    texte: "Nous vous aidons à préparer et organiser les pièces.",
  },
  {
    icon: ShieldCheck,
    titre: "Vérification",
    texte: "Nous vérifions la cohérence et la complétude du dossier.",
  },
  {
    icon: List,
    titre: "Formulaire & démarches",
    texte: "Nous vous accompagnons dans les démarches nécessaires.",
  },
  {
    icon: CalendarDays,
    titre: "Rendez-vous",
    texte: "Nous vous accompagnons jusqu'à la prise de votre rendez-vous.",
  },
];

export const AVANTAGES: {
  icon: LucideIcon;
  titre: string;
  texte: string;
  image: string;
  alt: string;
  position?: string;
  tampon?: boolean;
}[] = [
  {
    icon: Users,
    titre: "Accompagnement personnalisé",
    texte: "Un suivi adapté à votre profil et à votre projet.",
    image: "/images/why-accompagnement.webp",
    alt: "Une conseillère étudie un dossier avec une cliente",
    position: "50% 55%",
  },
  {
    icon: FileSpreadsheet,
    titre: "Checklist sur mesure",
    texte: "Les documents nécessaires selon votre situation.",
    image: "/images/why-checklist.webp",
    alt: "Passeport bordeaux posé sur un formulaire",
    position: "50% 40%",
  },
  {
    icon: ShieldCheck,
    titre: "Vérification méthodique",
    texte: "Chaque pièce est contrôlée avant le dépôt.",
    image: "/images/why-verification.webp",
    alt: "Tampon posé sur un document vérifié",
    position: "50% 50%",
    tampon: true,
  },
  {
    icon: Settings,
    titre: "Processus structuré",
    texte: "Une démarche claire, étape par étape.",
    image: "/images/why-processus.webp",
    alt: "Le Trocadéro et la tour Eiffel au coucher du soleil",
    position: "50% 62%",
  },
];

export const PACKS: {
  nom: string;
  texte: [string, string];
  prix: number;
  image: string;
  alt: string;
  position?: string;
  inclus: string[];
  vedette?: boolean;
}[] = [
  {
    nom: "Pack Essentiel",
    texte: ["Pour un dossier simple", "et bien préparé."],
    prix: 1500,
    image: "/images/pack-essentiel.webp",
    alt: "Passeport posé sur des documents",
    position: "50% 45%",
    inclus: [
      "Vérification de la liste des documents",
      "Assistance dans la préparation",
      "Contrôle du dossier avant soumission",
      "Guide pratique et conseils",
    ],
  },
  {
    nom: "Pack Confort",
    texte: ["Un accompagnement complet", "jusqu'au rendez-vous."],
    prix: 2500,
    image: "/images/pack-confort.webp",
    alt: "Paris et la tour Eiffel au coucher du soleil",
    position: "50% 55%",
    vedette: true,
    inclus: [
      "Tout le Pack Essentiel",
      "Assistance France-Visas",
      "Prise de rendez-vous",
      "Support personnalisé par email et téléphone",
      "Conseils pour l'entretien",
    ],
  },
  {
    nom: "Pack Premium",
    texte: ["Une prise en charge totale", "et une tranquillité absolue."],
    prix: 3500,
    image: "/images/pack-premium.webp",
    alt: "Valise de voyage en cuir",
    position: "50% 50%",
    inclus: [
      "Tout le Pack Confort",
      "Réservation d'hôtel",
      "Réservation de vol (pré-réservation)",
      "Assurance voyage",
      "Accompagnement jusqu'au rendez-vous",
    ],
  },
];

export const TEMOIGNAGES = [
  {
    nom: "Salma E.",
    visa: "Visa étudiant",
    avatar: "/images/avatar-salma.webp",
    texte:
      "Un accompagnement très professionnel et rassurant. Mon dossier a été accepté sans problème. Merci à toute l'équipe !",
  },
  {
    nom: "Yassine K.",
    visa: "Visa touristique",
    avatar: "/images/avatar-yassine.webp",
    texte:
      "Équipe réactive et à l'écoute. Le processus est clair et bien organisé. Je recommande vivement.",
  },
  {
    nom: "Meriem A.",
    visa: "Visa visite familiale",
    avatar: "/images/avatar-meriem.webp",
    texte:
      "Service de qualité, un vrai suivi du début à la fin. J'ai obtenu mon rendez-vous rapidement.",
  },
];

export const FAQ: { question: string; reponse: string }[] = [
  {
    question: "Quels types de visa France traitez-vous ?",
    reponse:
      "Nous préparons les visas court séjour Schengen (visa C) et long séjour (visa D) pour la France : tourisme, visite familiale, affaires et travail.",
  },
  {
    question: "Quels sont les documents nécessaires ?",
    reponse:
      "Ils dépendent de votre situation. Après l'analyse de votre profil, vous recevez une checklist sur mesure : passeport, justificatifs financiers, hébergement, assurance voyage…",
  },
  {
    question: "Combien de temps faut-il pour préparer un dossier ?",
    reponse:
      "Comptez généralement quelques jours, selon la rapidité à réunir vos pièces. Nous vous conseillons de commencer 4 à 6 semaines avant votre départ.",
  },
  {
    question: "Proposez-vous la prise de rendez-vous ?",
    reponse:
      "Oui : avec les packs Confort et Premium, nous vous accompagnons jusqu'à la prise de votre rendez-vous au centre de dépôt.",
  },
  {
    question: "Le paiement est-il sécurisé ?",
    reponse:
      "Oui. Chaque règlement est enregistré et vous recevez un reçu. Les frais consulaires et ceux du centre de dépôt restent réglés directement par vous.",
  },
  {
    question: "Que se passe-t-il en cas de refus ?",
    reponse:
      "La décision appartient au consulat. En cas de refus, nous analysons avec vous le motif indiqué et vous conseillons sur la suite : nouvelle demande ou recours.",
  },
];
