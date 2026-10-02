// Données non textuelles de la landing (icônes, images, liens).
// Les textes sont dans src/i18n/fr.ts et src/i18n/ar.ts, dans le même ordre.
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

/**
 * Liens des boutons. Les CTA « Commencer mon dossier », « Évaluer mon dossier » et
 * « Choisir ce pack » n'ont pas de lien : ils ouvrent la demande rapide (`useDemande`).
 */
export const LIENS = {
  evaluer: "#packs",
  methode: "#methode",
  contact: "#faq",
  whatsapp: "https://wa.me/212777777428",
};

/** Coordonnées affichées dans le pied de page. */
export const CONTACT = {
  telephone: "+212 777 777 428",
  telephoneLien: "tel:+212777777428",
  email: "contact@eiden-group.com",
};

/**
 * Demande rapide (bouton flottant). Libellés : `t.demande.visas` / `t.demande.pays`.
 * Types de visa, dans l'ordre d'affichage : « conjointUe » = conjoint ou parent d'un
 * ressortissant UE ; « familleFrancais » = enfant ou parent étranger de Français ;
 * « travail » et « conjointFrLong » = visa national de long séjour (D).
 */
export const TYPES_VISA = [
  "conjointUe",
  "famille",
  "tourisme",
  "travail",
  "familleFrancais",
  "conjointFrCourt",
  "conjointFrLong",
  "mariage",
  "chauffeur",
  "etudes",
  "medical",
] as const;
export type TypeVisa = (typeof TYPES_VISA)[number];
/** Long séjour : seule une date de départ prévue a du sens (pas de date de retour). */
export const VISAS_LONG_SEJOUR: readonly TypeVisa[] = ["travail", "conjointFrLong", "etudes"];
/** Hors `SCOPE` (src/lib/visa-rules.ts de l'app) : santé écartée au lancement, études → Campus France. */
export const VISAS_HORS_OFFRE: readonly TypeVisa[] = ["etudes", "medical"];

/** Les 29 États de l'espace Schengen (codes ISO), triés à l'affichage selon la langue. */
export const PAYS_SCHENGEN = [
  "de",
  "at",
  "be",
  "bg",
  "hr",
  "dk",
  "es",
  "ee",
  "fi",
  "fr",
  "gr",
  "hu",
  "is",
  "it",
  "lv",
  "li",
  "lt",
  "lu",
  "mt",
  "no",
  "nl",
  "pl",
  "pt",
  "cz",
  "ro",
  "sk",
  "si",
  "se",
  "ch",
] as const;

/** Ancres des sections, dans l'ordre du menu (libellés : `t.nav`). */
export const NAV = ["accueil", "visa", "services", "packs", "faq"] as const;

export const HERO_ICONES: LucideIcon[] = [UserRound, Clock, House];

export const ETAPES_ICONES: LucideIcon[] = [
  Search,
  FileSpreadsheet,
  FolderOpen,
  ShieldCheck,
  List,
  CalendarDays,
];

export const AVANTAGES: {
  icon: LucideIcon;
  image: string;
  position: string;
  tampon?: boolean;
}[] = [
  { icon: Users, image: "/images/04-etudiante.png", position: "50% 55%" },
  { icon: FileSpreadsheet, image: "/images/02-passeport.png", position: "50% 40%" },
  {
    icon: ShieldCheck,
    image: "/images/hero-3.webp",
    position: "50% 50%",
    tampon: true,
  },
  { icon: Settings, image: "/images/serenite.jpg", position: "50% 62%" },
];

/** Packs Standard, Essentiel, Global (textes : `t.packs.offres`). Aucun prix affiché. */
/** Même ordre que `t.packs.offres` (fr.ts) : la carte du milieu est la « vedette ». */
export const PACK_IDS = ["standard", "global", "essentiel"] as const;
export type PackId = (typeof PACK_IDS)[number];
export const PACKS: { id: PackId; image: string; position: string; vedette?: boolean }[] = [
  { id: "standard", image: "/images/pack-essentiel.webp", position: "50% 45%" },
  {
    id: "global",
    image: "/images/hero-bg-2.jpg",
    position: "50% 55%",
    vedette: true,
  },
  { id: "essentiel", image: "/images/06-valise-aeroport.png", position: "50% 50%" },
];

export const AVATARS = [
  "/images/avatar-salma.webp",
  "/images/avatar-yassine.webp",
  "/images/avatar-meriem.webp",
];
