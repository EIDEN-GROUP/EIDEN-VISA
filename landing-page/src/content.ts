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

/**
 * Coordonnées affichées dans la barre du haut et le pied de page (horaires et adresse :
 * `t.infos`). `carte` = recherche Google Maps de l'adresse, à remplacer par le lien exact
 * de la fiche du centre.
 */
export const CONTACT = {
  telephone: "+212 777 777 428",
  telephoneLien: "tel:+212777777428",
  instagram: "eiden_visa",
  instagramLien: "https://www.instagram.com/eiden_visa/",
  email: "visa@eiden-group.com",
  carte: "https://www.google.com/maps/search/?api=1&query=Technopole+1+Agadir+Bay+Agadir",
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
export const NAV = ["accueil"] as const;

/** Onglets qui pointent vers d'autres pages (pas vers une section de la page).
 *  Rendus dans le header desktop et le menu mobile, apres les ancres internes. */
export const NAV_LIENS = [
  { id: "services", href: "/services/", nom_fr: "Services", nom_ar: "خدماتنا" },
  { id: "blog", href: "/blog", nom_fr: "Blog", nom_ar: "مدونة" },
  { id: "contact", href: "/contact", nom_fr: "Contact", nom_ar: "اتصل بنا" },
] as const;

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
  width: number;
  height: number;
  position: string;
  tampon?: boolean;
}[] = [
  { icon: Users, image: "/images/04-etudiante.webp", width: 492, height: 285, position: "50% 55%" },
  {
    icon: FileSpreadsheet,
    image: "/images/justificatifs.webp",
    width: 1755,
    height: 896,
    position: "50% 40%",
  },
  {
    icon: ShieldCheck,
    image: "/images/hero-3.webp",
    width: 940,
    height: 788,
    position: "50% 50%",
    tampon: true,
  },
  {
    icon: Settings,
    image: "/images/optimized/serenite.webp",
    width: 1800,
    height: 1200,
    position: "50% 62%",
  },
];

/** Packs Standard, Essentiel, Global (textes : `t.packs.offres`). Aucun prix affiché. */
/** Même ordre que `t.packs.offres` (fr.ts) : la carte du milieu est la « vedette ». */
export const PACK_IDS = ["essentiel", "confort", "global"] as const;
export type PackId = (typeof PACK_IDS)[number];
export const PACKS: {
  id: PackId;
  image: string;
  width: number;
  height: number;
  position: string;
  vedette?: boolean;
}[] = [
  {
    id: "essentiel",
    image: "/images/pack-essentiel.webp",
    width: 800,
    height: 800,
    position: "50% 45%",
  },
  {
    id: "confort",
    image: "/images/06-valise-aeroport.webp",
    width: 491,
    height: 268,
    position: "50% 50%",
  },
  {
    id: "global",
    image: "/images/optimized/hero-bg-2.webp",
    width: 1800,
    height: 1013,
    position: "50% 55%",
    vedette: true,
  },
];
