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

/** Liens des boutons. À pointer vers l'app / WhatsApp quand les URL de prod sont fixées. */
export const LIENS = {
  commencer: "#packs",
  evaluer: "#packs",
  methode: "#methode",
  contact: "#faq",
};

/** Ancres des sections, dans l'ordre du menu (libellés : `t.nav`). */
export const NAV = ["accueil", "services", "visa", "packs", "faq"] as const;

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
  { icon: ShieldCheck, image: "/images/03-tampon-visa-france.png", position: "50% 50%", tampon: true,},
  { icon: Settings, image: "/images/why-processus.webp", position: "50% 62%" },
];

/** Packs Standard, Essentiel, Global (textes : `t.packs.offres`). Aucun prix affiché. */
export const PACKS: { image: string; position: string; vedette?: boolean }[] = [
  { image: "/images/pack-essentiel.webp", position: "50% 45%" },
  { image: "/images/08-maroc-coucher-soleil.png", position: "50% 55%", vedette: true },
  { image: "/images/06-valise-aeroport.png", position: "50% 50%" },
];

export const AVATARS = [
  "/images/avatar-salma.webp",
  "/images/avatar-yassine.webp",
  "/images/avatar-meriem.webp",
];
