import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Briefcase,
  CalendarHeart,
  Camera,
  Check,
  ChevronDown,
  CircleHelp,
  Gem,
  Globe,
  GraduationCap,
  Heart,
  HeartHandshake,
  Info,
  Lock,
  Minus,
  NotebookPen,
  Package,
  Plane,
  Plus,
  Stethoscope,
  Truck,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  LIENS,
  PACK_IDS,
  PAYS_SCHENGEN,
  TYPES_VISA,
  VISAS_HORS_OFFRE,
  VISAS_LONG_SEJOUR,
  type PackId,
  type TypeVisa,
} from "../content";
import { useLangue } from "../i18n";
import type { Dictionnaire } from "../i18n/fr";
import { useIntroPrete } from "../lib/intro";
import { saveContact } from "../lib/save-contact";
import { EASE_OUT } from "./motion";

type Textes = Dictionnaire["demande"];

type Donnees = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  typeVisa: TypeVisa | "";
  depart: string;
  retour: string;
  destination: string;
  pack: PackId | "indecis" | "";
  ville: string;
  demandeurs: number;
};
type Champ = keyof Donnees;
type Erreurs = Partial<Record<Champ, string>>;

const VIDE: Donnees = {
  nom: "",
  prenom: "",
  email: "",
  telephone: "",
  typeVisa: "",
  depart: "",
  retour: "",
  destination: "",
  pack: "",
  ville: "",
  demandeurs: 1,
};

/** Champs de chaque étape, dans l'ordre demandé. */
const ETAPES: Champ[][] = [
  ["nom", "prenom", "email", "telephone"],
  ["typeVisa", "depart", "retour", "destination"],
  ["pack", "ville", "demandeurs"],
];
const MAX_DEMANDEURS = 20;

const estLong = (v: TypeVisa | "") => v !== "" && VISAS_LONG_SEJOUR.includes(v);

/** Date du jour au format des champs date (AAAA-MM-JJ), en heure locale. */
function aujourdhui() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

const jjmmaaaa = (iso: string) => iso.split("-").reverse().join("/");

/** Brouillon local : fermer la popup puis la rouvrir retrouve tout ce qui était saisi. */
const CLE_BROUILLON = "eiden-demande-v1";

function estValeur<T extends readonly string[]>(liste: T, v: string): v is T[number] {
  return (liste as readonly string[]).includes(v);
}

/** Relit le brouillon en validant chaque champ ; null si absent ou illisible. */
function chargerBrouillon(): { donnees: Donnees; etape: number } | null {
  try {
    const brut = window.localStorage.getItem(CLE_BROUILLON);
    if (!brut) return null;
    const parsed = JSON.parse(brut) as {
      donnees?: Partial<Record<Champ, unknown>>;
      etape?: unknown;
    };
    const b = parsed.donnees ?? {};
    const texte = (v: unknown) => (typeof v === "string" ? v : "");
    const typeVisa = texte(b.typeVisa);
    const destination = texte(b.destination);
    const pack = texte(b.pack);
    const donnees: Donnees = {
      ...VIDE,
      nom: texte(b.nom),
      prenom: texte(b.prenom),
      email: texte(b.email),
      telephone: texte(b.telephone),
      typeVisa: estValeur(TYPES_VISA, typeVisa) ? typeVisa : "",
      depart: texte(b.depart),
      retour: texte(b.retour),
      destination:
        destination === "plusieurs" || estValeur(PAYS_SCHENGEN, destination) ? destination : "",
      pack: pack === "indecis" || estValeur(PACK_IDS, pack) ? pack : "",
      ville: texte(b.ville),
      demandeurs:
        typeof b.demandeurs === "number"
          ? Math.min(MAX_DEMANDEURS, Math.max(1, Math.floor(b.demandeurs)))
          : 1,
    };
    // Long séjour : pas de date de retour.
    if (estLong(donnees.typeVisa)) donnees.retour = "";
    const etape =
      typeof parsed.etape === "number"
        ? Math.min(ETAPES.length - 1, Math.max(0, Math.floor(parsed.etape)))
        : 0;
    return { donnees, etape };
  } catch {
    return null;
  }
}

/** Oublie le brouillon (après un envoi réussi). Silencieux si indisponible. */
function effacerBrouillon() {
  try {
    window.localStorage.removeItem(CLE_BROUILLON);
  } catch {
    /* stockage indisponible : le formulaire marche sans */
  }
}

function valider(d: Donnees, champs: Champ[], e: Textes["erreurs"]): Erreurs {
  const err: Erreurs = {};
  const jour = aujourdhui();
  for (const c of champs) {
    if (c === "email") {
      // Facultatif : vérifié seulement s'il est rempli.
      if (d.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim()))
        err.email = e.email;
    } else if (c === "telephone") {
      const chiffres = d.telephone.replace(/\D/g, "").length;
      if (!d.telephone.trim()) err.telephone = e.requis;
      else if (chiffres < 8 || chiffres > 15) err.telephone = e.telephone;
    } else if (c === "depart") {
      if (d.depart && d.depart < jour) err.depart = e.passe;
    } else if (c === "retour") {
      if (!d.retour || estLong(d.typeVisa)) continue;
      if (d.depart && d.retour < d.depart) err.retour = e.ordre;
      else if (d.retour < jour) err.retour = e.passe;
    } else if (c !== "demandeurs" && c !== "pack" && !String(d[c]).trim()) {
      err[c] = e.requis;
    }
  }
  return err;
}

/** Nom affiché d'un pack (« Pack Essentiel »…) ou « Je ne sais pas encore ». */
function nomPack(p: Donnees["pack"], t: Dictionnaire) {
  if (p === "") return "";
  if (p === "indecis") return t.demande.packIndecis;
  return t.packs.offres[PACK_IDS.indexOf(p)]?.nom ?? p;
}

/** Message WhatsApp : une ligne par champ rempli, dans la langue de la page. */
function message(d: Donnees, t: Dictionnaire) {
  const D = t.demande;
  const c = D.champs;
  const destination =
    d.destination === "plusieurs"
      ? D.plusieurs
      : (D.pays[d.destination as keyof Textes["pays"]] ?? d.destination);
  const lignes: [string, string][] = [
    [c.nom, d.nom],
    [c.prenom, d.prenom],
    [c.email, d.email],
    [c.telephone, d.telephone],
    [c.typeVisa, d.typeVisa ? D.visas[d.typeVisa] : ""],
    [c.depart, d.depart ? jjmmaaaa(d.depart) : ""],
    [c.retour, d.retour && !estLong(d.typeVisa) ? jjmmaaaa(d.retour) : ""],
    [c.destination, destination],
    [c.pack, nomPack(d.pack, t)],
    [c.ville, d.ville],
    [c.demandeurs, String(d.demandeurs)],
  ];
  return [
    D.message.intro,
    "",
    ...lignes.filter(([, v]) => v.trim()).map(([k, v]) => `• ${k} : ${v.trim()}`),
    "",
    D.message.fin,
  ].join("\n");
}

/** Logo WhatsApp (glyphe officiel simplifié). */
function IconeWhatsApp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88a9.83 9.83 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.9a11.82 11.82 0 0 0-3.48-8.41" />
    </svg>
  );
}

/** Style commun des champs : fond carte, liseré, anneau rouge au focus et en erreur. */
const CHAMP =
  "h-12 w-full rounded-xl bg-card px-4 text-[15px] text-ink ring-1 ring-line transition-[box-shadow,background-color] duration-200 placeholder:text-muted/60 focus:ring-2 focus:ring-brand/45 focus:outline-none aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-brand/60";

function Bloc({
  id,
  label,
  requis,
  facultatif,
  aide,
  erreur,
  className = "",
  children,
}: {
  id: string;
  label: string;
  /** Astérisque rouge + mention pour lecteur d'écran, sur les champs obligatoires. */
  requis?: string;
  facultatif?: string;
  aide?: string;
  erreur?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label
        id={`${id}-label`}
        htmlFor={id}
        className="flex items-baseline justify-between gap-2 text-[13px] font-bold text-ink-soft"
      >
        <span>
          {label}
          {requis && (
            <>
              <span aria-hidden="true" className="ms-0.5 text-brand">
                *
              </span>
              <span className="sr-only"> ({requis})</span>
            </>
          )}
        </span>
        {facultatif && <span className="text-[11.5px] font-medium text-muted">{facultatif}</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      <AnimatePresence initial={false}>
        {(erreur || aide) && (
          <motion.p
            key={erreur ? "erreur" : "aide"}
            id={`${id}-note`}
            role={erreur ? "alert" : undefined}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`mt-1.5 text-[12.5px] ${erreur ? "font-semibold text-brand" : "text-muted"}`}
          >
            {erreur ?? aide}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

type OptionListe = {
  valeur: string;
  libelle: string;
  /** Pictogramme dans une tuile, drapeau rond, ou à défaut un code court (ex. code pays). */
  icone?: LucideIcon;
  drapeau?: string;
  code?: string;
};

/** Pictogramme de chaque type de visa dans la liste déroulante. */
const ICONES_VISA: Record<TypeVisa, LucideIcon> = {
  conjointUe: HeartHandshake,
  famille: Users,
  tourisme: Camera,
  travail: Briefcase,
  familleFrancais: Baby,
  conjointFrCourt: Heart,
  conjointFrLong: CalendarHeart,
  mariage: Gem,
  chauffeur: Truck,
  etudes: GraduationCap,
  medical: Stethoscope,
};

function Tuile({ option, choisie }: { option: OptionListe; choisie: boolean }) {
  const Icone = option.icone;
  // Drapeau ondulant du pays (sélecteur de destination) : vague réelle via le
  // filtre SVG partagé #drapeau-vague + reflet de plis de tissu. Le filtre est
  // statique (aucune animation, aucun coût continu) ; sans lui, le drapeau
  // reste un simple rectangle avec son reflet.
  if (option.drapeau)
    return (
      <span aria-hidden="true" className="relative h-5 w-7 shrink-0">
        <img
          src={option.drapeau}
          alt=""
          draggable={false}
          className="h-full w-full rounded-[5px] object-cover ring-1 ring-line"
          style={{ filter: "url(#drapeau-vague)" }}
        />
        <span className="pointer-events-none absolute inset-0 rounded-[5px] bg-gradient-to-r from-white/30 via-transparent to-black/20" />
      </span>
    );
  if (!Icone && !option.code) return null;
  return (
    <span
      aria-hidden="true"
      className={`grid size-8 shrink-0 place-items-center rounded-lg text-[10.5px] font-bold tracking-[0.06em] transition-colors duration-200 ${
        choisie ? "bg-brand text-white" : "bg-cream text-ink-soft ring-1 ring-line"
      }`}
    >
      {Icone ? <Icone className="size-4" strokeWidth={1.9} /> : option.code}
    </span>
  );
}

/**
 * Liste déroulante sur mesure (remplace le <select> natif) : panneau arrondi posé sous le
 * champ (ou au-dessus s'il manque de place), tuile d'icône par option, option choisie en
 * rouge avec une coche. Clavier : flèches, Début/Fin, Entrée/Espace, Échap, frappe directe.
 */
function Selecteur({
  id,
  valeur,
  options,
  placeholder,
  erreur,
  onChange,
}: {
  id: string;
  valeur: string;
  options: OptionListe[];
  placeholder: string;
  erreur?: string;
  onChange: (v: string) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const [pos, setPos] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    max: number;
    haut: boolean;
  } | null>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const liste = useRef<HTMLUListElement>(null);
  const frappe = useRef({ texte: "", temps: 0 });
  const choisie = options.find((o) => o.valeur === valeur);
  const listeId = `${id}-liste`;
  const optionId = (i: number) => `${id}-option-${i}`;

  // Position fixe calculée depuis le champ : suit le défilement de la popup.
  const placer = useCallback(() => {
    const r = bouton.current?.getBoundingClientRect();
    if (!r) return;
    const dessous = window.innerHeight - r.bottom - 16;
    const dessus = r.top - 16;
    const haut = dessous < 240 && dessus > dessous;
    setPos({
      left: r.left,
      width: r.width,
      max: Math.min(320, haut ? dessus : dessous),
      haut,
      ...(haut ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }),
    });
  }, []);
  useLayoutEffect(() => {
    if (!ouvert) return;
    placer();
    window.addEventListener("resize", placer);
    window.addEventListener("scroll", placer, true);
    return () => {
      window.removeEventListener("resize", placer);
      window.removeEventListener("scroll", placer, true);
    };
  }, [ouvert, placer]);
  useEffect(() => {
    if (!ouvert) return;
    const dehors = (e: PointerEvent) => {
      const cible = e.target as Node;
      if (!bouton.current?.contains(cible) && !liste.current?.contains(cible)) setOuvert(false);
    };
    document.addEventListener("pointerdown", dehors);
    return () => document.removeEventListener("pointerdown", dehors);
  }, [ouvert]);
  useEffect(() => {
    if (ouvert && actif >= 0)
      liste.current?.querySelector(`#${CSS.escape(optionId(actif))}`)?.scrollIntoView({
        block: "nearest",
      });
  }, [actif, ouvert]);

  const ouvrir = () => {
    setActif(
      Math.max(
        0,
        options.findIndex((o) => o.valeur === valeur),
      ),
    );
    setOuvert(true);
  };
  const choisir = (i: number) => {
    const o = options[i];
    if (o) onChange(o.valeur);
    setOuvert(false);
    bouton.current?.focus();
  };
  const sansAccents = (v: string) =>
    v
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

  const auClavier = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const dernier = options.length - 1;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (!ouvert) return ouvrir();
        const pas = e.key === "ArrowDown" ? 1 : -1;
        setActif((a) => Math.min(dernier, Math.max(0, a + pas)));
        return;
      }
      case "Home":
      case "End":
        if (!ouvert) return;
        e.preventDefault();
        setActif(e.key === "Home" ? 0 : dernier);
        return;
      case "Enter":
      case " ":
        if (e.key === " " && frappe.current.texte) break;
        e.preventDefault();
        if (ouvert && actif >= 0) choisir(actif);
        else ouvrir();
        return;
      case "Escape":
        if (!ouvert) return;
        // Ferme la liste sans fermer la popup (qui ignore les Échap déjà traités).
        e.preventDefault();
        setOuvert(false);
        return;
      case "Tab":
        setOuvert(false);
        return;
    }
    // Frappe directe : saute à la première option qui commence par les lettres tapées.
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    const maintenant = Date.now();
    const f = frappe.current;
    f.texte = (maintenant - f.temps < 700 ? f.texte : "") + sansAccents(e.key);
    f.temps = maintenant;
    const i = options.findIndex((o) => sansAccents(o.libelle).startsWith(f.texte));
    if (i < 0) return;
    if (!ouvert) setOuvert(true);
    setActif(i);
  };

  return (
    <>
      <button
        ref={bouton}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-controls={listeId}
        aria-activedescendant={ouvert && actif >= 0 ? optionId(actif) : undefined}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? `${id}-note` : undefined}
        onClick={() => (ouvert ? setOuvert(false) : ouvrir())}
        onKeyDown={auClavier}
        className={`${CHAMP} flex cursor-pointer items-center gap-3 ps-2 text-start ${
          choisie?.icone || choisie?.code ? "" : "ps-4"
        } ${ouvert ? "ring-2 ring-brand/45" : ""}`}
      >
        {choisie && <Tuile option={choisie} choisie={false} />}
        <span className={`min-w-0 flex-1 truncate ${choisie ? "text-ink" : "text-muted/70"}`}>
          {choisie?.libelle ?? placeholder}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-muted transition-transform duration-300 ${
            ouvert ? "rotate-180" : ""
          }`}
        />
      </button>
      {createPortal(
        <AnimatePresence>
          {ouvert && pos && (
            <motion.ul
              ref={liste}
              id={listeId}
              role="listbox"
              aria-labelledby={`${id}-label`}
              data-lenis-prevent
              initial={{ opacity: 0, y: pos.haut ? 8 : -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: pos.haut ? 6 : -6,
                scale: 0.98,
                transition: { duration: 0.14 },
              }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              style={{
                left: pos.left,
                width: pos.width,
                top: pos.top,
                bottom: pos.bottom,
                maxHeight: pos.max,
              }}
              className={`fixed z-[70] overflow-y-auto overscroll-contain rounded-2xl bg-card p-1.5 shadow-[0_24px_48px_-22px_rgb(0_0_0/0.32),0_2px_8px_-4px_rgb(0_0_0/0.1)] ring-1 ring-black/[0.07] ${
                pos.haut ? "origin-bottom" : "origin-top"
              }`}
            >
              {options.map((o, i) => {
                const estChoisie = o.valeur === valeur;
                return (
                  <li
                    key={o.valeur}
                    id={optionId(i)}
                    role="option"
                    aria-selected={estChoisie}
                    onPointerMove={() => setActif(i)}
                    onClick={() => choisir(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-[14.5px] transition-colors duration-150 ${
                      i === actif ? "bg-sand" : ""
                    } ${estChoisie ? "font-semibold text-brand" : "text-ink"}`}
                  >
                    <Tuile option={o} choisie={estChoisie} />
                    <span className="min-w-0 flex-1 leading-snug">{o.libelle}</span>
                    {estChoisie && (
                      <Check aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.6} />
                    )}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

/** Suivi des étapes : pastilles reliées par un pointillé, l'avion vole vers l'étape courante. */
function Progression({ etape, D }: { etape: number; D: Textes }) {
  const total = D.etapes.length;
  const pct = (etape / (total - 1)) * 100;
  return (
    <div className="mt-6">
      <div className="relative">
        {/* Piste d'un centre de pastille à l'autre : pointillé gris, pointillé rouge qui se
            trace, avion au-dessus. Retournée en arabe : elle se lit de droite à gauche. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[18px] top-0 h-9 rtl:-scale-x-100"
        >
          <span className="pointilles absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 text-ink/20" />
          <motion.span
            initial={false}
            animate={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="pointilles absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 text-brand"
          />
          <motion.span
            initial={false}
            animate={{ left: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="absolute -top-[18px] -translate-x-1/2 text-brand"
          >
            <Plane className="size-4 rotate-45 fill-current" strokeWidth={1.4} />
          </motion.span>
        </div>
        <ol className="relative flex justify-between">
          {D.etapes.map((nom, i) => {
            const fait = i < etape;
            const courant = i === etape;
            return (
              <li key={nom} className="flex flex-col items-center">
                <span
                  aria-current={courant ? "step" : undefined}
                  className={`grid size-9 place-items-center rounded-full text-[13px] font-bold transition-[background-color,color,box-shadow] duration-500 ${
                    fait || courant ? "bg-brand text-white" : "bg-card text-muted ring-1 ring-line"
                  } ${courant ? "shadow-[0_0_0_5px_rgb(174_10_26/0.14)]" : ""}`}
                >
                  {fait ? <Check className="size-4" strokeWidth={3} /> : i + 1}
                  <span className="sr-only">{` ${nom}`}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="mt-2 flex justify-between text-[12px] font-bold">
        {D.etapes.map((nom, i) => (
          <span
            key={nom}
            aria-hidden="true"
            className={`w-24 transition-colors duration-500 first:text-start last:text-end ${
              i === etape ? "text-ink" : "text-muted"
            } ${i > 0 && i < total - 1 ? "text-center" : ""}`}
          >
            {nom}
          </span>
        ))}
      </div>
    </div>
  );
}

function FormulaireDemande({ fermer, pack }: { fermer: () => void; pack?: PackId }) {
  const { t, langue, dir } = useLangue();
  const D = t.demande;
  const lenis = useLenis();
  const uid = useId();
  const id = (c: Champ) => `${uid}-${c}`;
  const titreId = `${uid}-titre`;
  const carte = useRef<HTMLDivElement>(null);
  const fermerRef = useRef(fermer);
  fermerRef.current = fermer;

  const [brouillonInitial] = useState(chargerBrouillon);
  const [etape, setEtape] = useState(brouillonInitial?.etape ?? 0);
  const [sens, setSens] = useState(1);
  const [d, setD] = useState<Donnees>(() => ({
    ...VIDE,
    ...brouillonInitial?.donnees,
    // Un pack choisi via un CTA (« Choisir ce pack ») prime sur le brouillon.
    pack: pack ?? brouillonInitial?.donnees?.pack ?? "",
  }));
  const [erreurs, setErreurs] = useState<Erreurs>({});

  const mobile = useMemo(() => window.matchMedia("(max-width: 639px)").matches, []);
  const long = estLong(d.typeVisa);
  const horsOffre = d.typeVisa !== "" && VISAS_HORS_OFFRE.includes(d.typeVisa);
  const jour = aujourdhui();
  const lien = `${LIENS.whatsapp}?text=${encodeURIComponent(message(d, t))}`;
  const optionsVisa: OptionListe[] = TYPES_VISA.map((v) => ({
    valeur: v,
    libelle: D.visas[v],
    icone: ICONES_VISA[v],
  }));
  const optionsPack: OptionListe[] = [
    ...PACK_IDS.map((p) => ({ valeur: p, libelle: nomPack(p, t), icone: Package })),
    { valeur: "indecis", libelle: D.packIndecis, icone: CircleHelp },
  ];
  const pays = useMemo(
    () =>
      PAYS_SCHENGEN.map((code) => [code, D.pays[code]] as const).sort((a, b) =>
        a[1].localeCompare(b[1], langue),
      ),
    [D, langue],
  );

  // Page figée derrière la popup ; Échap ferme ; Tab reste dans la popup ; au départ, le
  // focus revient sur le bouton qui l'a ouverte.
  useEffect(() => {
    lenis?.stop();
    return () => lenis?.start();
  }, [lenis]);
  useEffect(() => {
    const avant = document.activeElement as HTMLElement | null;
    const auClavier = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        e.preventDefault();
        fermerRef.current();
        return;
      }
      if (e.key !== "Tab" || !carte.current) return;
      const cibles = [
        ...carte.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input, select, textarea",
        ),
      ].filter((el) => el.offsetParent !== null);
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      if (!premier || !dernier) return;
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener("keydown", auClavier);
    return () => {
      document.removeEventListener("keydown", auClavier);
      avant?.focus({ preventScroll: true });
    };
  }, []);

  // Souris / clavier : focus sur le premier champ de l'étape (pas sur mobile, pour ne pas
  // ouvrir le clavier d'office).
  useEffect(() => {
    if (mobile) return;
    const minuterie = window.setTimeout(() => {
      carte.current
        ?.querySelector<HTMLElement>(
          "[data-etape] input, [data-etape] [role=combobox], [data-etape] a",
        )
        ?.focus({ preventScroll: true });
    }, 380);
    return () => clearTimeout(minuterie);
  }, [etape, mobile]);

  // Brouillon local : chaque saisie est conservée ; rouvrir la popup retrouve
  // tout (champs + étape). Silencieux si le stockage est indisponible.
  useEffect(() => {
    try {
      window.localStorage.setItem(CLE_BROUILLON, JSON.stringify({ version: 1, etape, donnees: d }));
    } catch {
      /* stockage indisponible : le formulaire marche sans */
    }
  }, [d, etape]);

  const maj = <C extends Champ>(c: C, v: Donnees[C]) => {
    setD((p) => ({
      ...p,
      [c]: v,
      ...(c === "typeVisa" && estLong(v as TypeVisa) ? { retour: "" } : {}),
    }));
    if (erreurs[c]) setErreurs((e) => ({ ...e, [c]: undefined }));
  };

  const aller = (cible: number) => {
    setSens(cible > etape ? 1 : -1);
    setEtape(cible);
    carte.current?.querySelector("[data-lenis-prevent]")?.scrollTo({ top: 0 });
  };

  const suivant = async () => {
    const err = valider(d, ETAPES[etape]!, D.erreurs);
    const premier = Object.keys(err)[0];
    if (premier) {
      setErreurs(err);
      carte.current?.querySelector<HTMLElement>(`#${CSS.escape(id(premier as Champ))}`)?.focus();
      return;
    }
    if (etape === ETAPES.length - 1) {
      // Sauvegarde Supabase en arrière-plan (silencieuse en cas d'échec),
      // puis ouverture WhatsApp comme avant — les deux portent le même contenu.
      await saveContact({
        nom: d.nom.trim(),
        prenom: d.prenom.trim(),
        email: d.email.trim(),
        telephone: d.telephone.trim(),
        typeVisa: d.typeVisa,
        depart: d.depart,
        retour: long ? "" : d.retour,
        destination: d.destination,
        pack: d.pack,
        ville: d.ville.trim(),
        demandeurs: d.demandeurs,
        langue,
        message: message(d, t),
        pageUrl: window.location.href,
        userAgent: window.navigator.userAgent,
      }).catch(() => false);
      // Envoi réussi : le brouillon est oublié, la prochaine ouverture repart de zéro.
      effacerBrouillon();
      window.open(lien, "_blank", "noopener,noreferrer");
    }
    aller(etape + 1);
  };

  const attrs = (c: Champ) => ({
    id: id(c),
    name: c,
    "aria-invalid": erreurs[c] ? true : undefined,
    "aria-describedby": erreurs[c] ? `${id(c)}-note` : undefined,
  });

  const glisse = sens * (dir === "rtl" ? -1 : 1);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      initial="ferme"
      animate="ouvert"
      exit="ferme"
    >
      <motion.div
        aria-hidden="true"
        onClick={fermer}
        variants={{ ferme: { opacity: 0 }, ouvert: { opacity: 1 } }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]"
      />
      <motion.div
        ref={carte}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        variants={
          mobile
            ? { ferme: { y: "100%" }, ouvert: { y: 0 } }
            : { ferme: { opacity: 0, y: 40, scale: 0.96 }, ouvert: { opacity: 1, y: 0, scale: 1 } }
        }
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="demande-carte relative isolate flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-[28px] bg-cream shadow-[0_30px_80px_-30px_rgb(11_26_48/0.6)] sm:max-h-[min(92svh,780px)] sm:max-w-[640px] sm:rounded-[28px]"
      >
        <span
          aria-hidden="true"
          className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden"
        />
        <header className="shrink-0 px-5 pt-4 sm:px-8 sm:pt-7">
          <div className="flex items-center justify-between gap-4">
            <span className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-[12px] font-bold text-brand">
                <Zap className="size-3.5 fill-current" />
                {D.surtitre}
              </span>
              <AnimatePresence initial={false}>
                {d.pack && d.pack !== "indecis" && (
                  <motion.span
                    key={d.pack}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-white"
                  >
                    <Package className="size-3.5" />
                    {nomPack(d.pack, t)}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
            <button
              type="button"
              onClick={fermer}
              aria-label={D.fermer}
              className="grid size-10 place-items-center rounded-full bg-card text-ink shadow-[var(--shadow-soft)] transition-transform duration-300 hover:rotate-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X className="size-5" />
            </button>
          </div>
          {etape < ETAPES.length && (
            <>
              <h2
                id={titreId}
                className="mt-4 font-serif text-[clamp(1.55rem,4.6vw,2.15rem)] leading-[1.08] text-ink"
              >
                {D.titre}
              </h2>
              <p className="mt-2 max-w-[480px] text-[14px] leading-[1.55] text-muted">{D.texte}</p>
              <Progression etape={etape} D={D} />
            </>
          )}
        </header>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void suivant();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 pt-6 pb-5 sm:px-8"
          >
            <AnimatePresence mode="wait" initial={false} custom={glisse}>
              <motion.div
                key={etape}
                data-etape
                custom={glisse}
                variants={{
                  entre: (s: number) => ({ opacity: 0, x: 44 * s }),
                  la: { opacity: 1, x: 0 },
                  sort: (s: number) => ({ opacity: 0, x: -44 * s }),
                }}
                initial="entre"
                animate="la"
                exit="sort"
                transition={{ duration: 0.35, ease: EASE_OUT }}
              >
                {etape === 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Bloc
                      id={id("nom")}
                      label={D.champs.nom}
                      requis={D.requis}
                      erreur={erreurs.nom}
                    >
                      <input
                        {...attrs("nom")}
                        autoComplete="family-name"
                        placeholder={D.exemples.nom}
                        value={d.nom}
                        onChange={(e) => maj("nom", e.target.value)}
                        className={CHAMP}
                      />
                    </Bloc>
                    <Bloc
                      id={id("prenom")}
                      label={D.champs.prenom}
                      requis={D.requis}
                      erreur={erreurs.prenom}
                    >
                      <input
                        {...attrs("prenom")}
                        autoComplete="given-name"
                        placeholder={D.exemples.prenom}
                        value={d.prenom}
                        onChange={(e) => maj("prenom", e.target.value)}
                        className={CHAMP}
                      />
                    </Bloc>
                    <Bloc
                      id={id("email")}
                      label={D.champs.email}
                      facultatif={D.facultatif}
                      erreur={erreurs.email}
                    >
                      <input
                        {...attrs("email")}
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        inputMode="email"
                        placeholder={D.exemples.email}
                        value={d.email}
                        onChange={(e) => maj("email", e.target.value)}
                        className={`${CHAMP} rtl:text-end`}
                      />
                    </Bloc>
                    <Bloc
                      id={id("telephone")}
                      label={D.champs.telephone}
                      requis={D.requis}
                      erreur={erreurs.telephone}
                    >
                      <input
                        {...attrs("telephone")}
                        type="tel"
                        dir="ltr"
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder={D.exemples.telephone}
                        value={d.telephone}
                        onChange={(e) => maj("telephone", e.target.value)}
                        className={`${CHAMP} rtl:text-end`}
                      />
                    </Bloc>
                  </div>
                )}

                {etape === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Bloc
                      id={id("typeVisa")}
                      label={D.champs.typeVisa}
                      requis={D.requis}
                      erreur={erreurs.typeVisa}
                      className="sm:col-span-2"
                    >
                      <Selecteur
                        id={id("typeVisa")}
                        valeur={d.typeVisa}
                        options={optionsVisa}
                        placeholder={D.exemples.typeVisa}
                        erreur={erreurs.typeVisa}
                        onChange={(v) => maj("typeVisa", v as TypeVisa)}
                      />
                    </Bloc>
                    <AnimatePresence initial={false}>
                      {horsOffre && (
                        <motion.p
                          key={d.typeVisa}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: EASE_OUT }}
                          className="overflow-hidden sm:col-span-2"
                        >
                          <span className="flex gap-2.5 rounded-xl bg-brand/[0.07] px-4 py-3 text-[13px] leading-[1.5] text-ink-soft ring-1 ring-brand/15">
                            <Info className="mt-0.5 size-4 shrink-0 text-brand" />
                            {D.horsOffre[d.typeVisa as keyof Textes["horsOffre"]]}
                          </span>
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <Bloc
                      id={id("depart")}
                      label={D.champs.depart}
                      facultatif={D.facultatif}
                      aide={long ? D.datesAideLong : D.datesAide}
                      erreur={erreurs.depart}
                      className={long ? "sm:col-span-2" : ""}
                    >
                      <input
                        {...attrs("depart")}
                        type="date"
                        min={jour}
                        value={d.depart}
                        onChange={(e) => maj("depart", e.target.value)}
                        className={CHAMP}
                      />
                    </Bloc>
                    {!long && (
                      <Bloc
                        id={id("retour")}
                        label={D.champs.retour}
                        facultatif={D.facultatif}
                        erreur={erreurs.retour}
                      >
                        <input
                          {...attrs("retour")}
                          type="date"
                          min={d.depart || jour}
                          value={d.retour}
                          onChange={(e) => maj("retour", e.target.value)}
                          className={CHAMP}
                        />
                      </Bloc>
                    )}
                    <Bloc
                      id={id("destination")}
                      label={D.champs.destination}
                      requis={D.requis}
                      erreur={erreurs.destination}
                      className="sm:col-span-2"
                    >
                      <Selecteur
                        id={id("destination")}
                        valeur={d.destination}
                        options={[
                          { valeur: "plusieurs", libelle: D.plusieurs, icone: Globe },
                          ...pays.map(([code, nom]) => ({
                            valeur: code,
                            libelle: nom,
                            drapeau: `/images/flags/${code}.svg`,
                          })),
                        ]}
                        placeholder={D.exemples.destination}
                        erreur={erreurs.destination}
                        onChange={(v) => maj("destination", v)}
                      />
                    </Bloc>
                  </div>
                )}

                {etape === 2 && (
                  <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <Bloc
                      id={id("pack")}
                      label={D.champs.pack}
                      facultatif={D.facultatif}
                      className="sm:col-span-2"
                    >
                      <Selecteur
                        id={id("pack")}
                        valeur={d.pack}
                        options={optionsPack}
                        placeholder={D.exemples.pack}
                        onChange={(v) => maj("pack", v as Donnees["pack"])}
                      />
                    </Bloc>
                    <Bloc
                      id={id("ville")}
                      label={D.champs.ville}
                      requis={D.requis}
                      erreur={erreurs.ville}
                    >
                      <input
                        {...attrs("ville")}
                        autoComplete="address-level2"
                        placeholder={D.exemples.ville}
                        value={d.ville}
                        onChange={(e) => maj("ville", e.target.value)}
                        className={CHAMP}
                      />
                    </Bloc>
                    <Bloc id={id("demandeurs")} label={D.champs.demandeurs} aide={D.demandeursAide}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={D.moins}
                          disabled={d.demandeurs <= 1}
                          onClick={() => maj("demandeurs", Math.max(1, d.demandeurs - 1))}
                          className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-ink ring-1 ring-line transition hover:bg-sand disabled:opacity-40"
                        >
                          <Minus className="size-4" />
                        </button>
                        <input
                          {...attrs("demandeurs")}
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={MAX_DEMANDEURS}
                          value={d.demandeurs}
                          onChange={(e) =>
                            maj(
                              "demandeurs",
                              Math.min(MAX_DEMANDEURS, Math.max(1, Number(e.target.value) || 1)),
                            )
                          }
                          className={`${CHAMP} w-16 px-2 text-center font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
                        />
                        <button
                          type="button"
                          aria-label={D.plus}
                          disabled={d.demandeurs >= MAX_DEMANDEURS}
                          onClick={() =>
                            maj("demandeurs", Math.min(MAX_DEMANDEURS, d.demandeurs + 1))
                          }
                          className="grid size-12 shrink-0 place-items-center rounded-xl bg-card text-ink ring-1 ring-line transition hover:bg-sand disabled:opacity-40"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </Bloc>

                    {/* Récapitulatif façon billet : nom en grand, détails sous un pointillé. */}
                    <div className="relative mt-2 overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-line sm:col-span-2">
                      <p className="eyebrow text-[10.5px] text-muted">{D.recap}</p>
                      <p className="mt-2 font-serif text-[20px] leading-tight text-ink">
                        {`${d.prenom} ${d.nom}`.trim()}
                      </p>
                      <div className="mt-4 grid gap-3 border-t border-dashed border-line pt-4 text-[13px] sm:grid-cols-2">
                        <p>
                          <span className="block text-[11.5px] font-bold text-muted">
                            {D.champs.typeVisa}
                          </span>
                          <span className="font-semibold text-ink-soft">
                            {d.typeVisa ? D.visas[d.typeVisa] : ""}
                          </span>
                        </p>
                        <p>
                          <span className="block text-[11.5px] font-bold text-muted">
                            {D.champs.destination}
                          </span>
                          <span className="font-semibold text-ink-soft">
                            {d.destination === "plusieurs"
                              ? D.plusieurs
                              : D.pays[d.destination as keyof Textes["pays"]]}
                          </span>
                        </p>
                        {d.pack && (
                          <p>
                            <span className="block text-[11.5px] font-bold text-muted">
                              {D.champs.pack}
                            </span>
                            <span className="font-semibold text-ink-soft">
                              {nomPack(d.pack, t)}
                            </span>
                          </p>
                        )}
                        {d.depart && (
                          <p
                            dir="ltr"
                            className="font-semibold text-ink-soft rtl:text-end sm:col-span-2"
                          >
                            {jjmmaaaa(d.depart)}
                            {d.retour && !long && ` → ${jjmmaaaa(d.retour)}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="flex items-center gap-2 text-[12px] text-muted sm:col-span-2">
                      <Lock className="size-3.5 shrink-0" />
                      {D.confidentialite}
                    </p>
                  </div>
                )}

                {etape === ETAPES.length && (
                  <div className="flex flex-col items-center pt-2 pb-4 text-center">
                    {/* Coup de tampon : le tampon Schengen s'abat sur la demande. */}
                    <motion.img
                      src="/images/tampon-schengen-rond.webp"
                      alt=""
                      aria-hidden="true"
                      initial={{ scale: 2.2, opacity: 0, rotate: -40 }}
                      animate={{ scale: 1, opacity: 0.95, rotate: -12 }}
                      transition={{ type: "spring", stiffness: 260, damping: 17, delay: 0.15 }}
                      className="w-36 sm:w-44"
                    />
                    <h2
                      id={titreId}
                      className="mt-6 font-serif text-[clamp(1.8rem,5vw,2.3rem)] leading-tight text-ink"
                    >
                      {D.succesTitre}
                    </h2>
                    <p className="mt-2 max-w-[400px] text-[14.5px] leading-[1.6] text-muted">
                      {D.succesTexte}
                    </p>
                    <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                      <a
                        href={lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ backgroundColor: "#25D366" }}
                        className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full px-6 text-[14.5px] font-semibold text-white shadow-[0_12px_28px_-12px_rgb(37_211_102/0.8)] transition-transform hover:-translate-y-0.5"
                      >
                        <IconeWhatsApp className="size-5" />
                        {D.ouvrirWhatsapp}
                      </a>
                      <button
                        type="button"
                        onClick={fermer}
                        className="h-12 rounded-full px-6 text-[14.5px] font-semibold text-ink-soft ring-1 ring-line transition-colors hover:bg-sand"
                      >
                        {D.nouvelle}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {etape < ETAPES.length && (
            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line/80 bg-cream/85 px-5 py-4 backdrop-blur-sm sm:px-8">
              {etape > 0 ? (
                <button
                  type="button"
                  onClick={() => aller(etape - 1)}
                  className="inline-flex h-12 items-center gap-2 rounded-full px-4 text-[14px] font-semibold text-ink-soft transition-colors hover:bg-sand"
                >
                  <ArrowLeft className="size-4 rtl:-scale-x-100" />
                  {D.precedent}
                </button>
              ) : (
                <span className="text-[12.5px] font-bold text-muted">
                  {`${D.etape} ${etape + 1} ${D.sur} ${ETAPES.length}`}
                </span>
              )}
              <button
                type="submit"
                className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-brand px-6 text-[14.5px] font-semibold text-white shadow-[0_10px_30px_-12px_rgb(174_10_26/0.6)] transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                {etape === ETAPES.length - 1 ? D.envoyer : D.suivant}
                <ArrowRight className="size-[18px] transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
              </button>
            </footer>
          )}
        </form>
      </motion.div>
    </motion.div>,
    document.body,
  );
}

type OuvrirDemande = (options?: { pack?: PackId }) => void;
const ContexteDemande = createContext<OuvrirDemande>(() => {});

/** Ouvre la popup de demande rapide, avec un pack pré-choisi si besoin. */
export const useDemande = () => useContext(ContexteDemande);

/**
 * Fournit `useDemande()` à la landing et affiche les badges flottants (bas, côté fin de
 * lecture) : un petit dock blanc (demande rapide, WhatsApp) et, attachée par un fil, une
 * étiquette de bagage manuscrite « Demande rapide ».
 */
export function DemandeRapide({ children }: { children: ReactNode }) {
  const { t } = useLangue();
  const D = t.demande;
  const pret = useIntroPrete();
  const [ouvert, setOuvert] = useState<{ pack?: PackId } | null>(null);
  const ouvrir = useCallback<OuvrirDemande>((options = {}) => setOuvert(options), []);

  return (
    <ContexteDemande.Provider value={ouvrir}>
      {/* Filtre SVG partagé des drapeaux : vague statique (feTurbulence +
          feDisplacementMap), montée une seule fois pour toute la landing. */}
      <svg aria-hidden="true" focusable="false" className="absolute size-0">
        <defs>
          <filter id="drapeau-vague" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018 0.035"
              numOctaves="1"
              seed="7"
              result="bruit"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="bruit"
              scale="2.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      {children}
      <div className="pointer-events-none fixed end-4 bottom-4 z-30 flex items-start sm:end-6 sm:bottom-6">
        {/* Étiquette de bagage : papier kraft, écriture manuscrite, œillet et fil vers le
            dock ; elle se balance doucement. Doublon souris du bouton (hors tabulation). */}
        <motion.button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => ouvrir()}
          initial={{ opacity: 0, y: -14, rotate: -14 }}
          animate={pret ? { opacity: 1, y: 0, rotate: 0 } : undefined}
          transition={{ type: "spring", stiffness: 120, damping: 11, delay: 1.1 }}
          className="etiquette-balance pointer-events-auto mt-3 flex cursor-pointer items-center will-change-transform [filter:drop-shadow(0_8px_12px_rgb(0_0_0/0.14))]"
        >
          <span className="etiquette-bagage relative flex items-center py-2 ps-3.5 pe-7 text-ink">
            <span className="font-script text-[19px] leading-none whitespace-nowrap sm:text-[21px]">
              {D.tag}
            </span>
            <span className="absolute end-[11px] top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-cream ring-[1.5px] ring-ink/25" />
          </span>
          <svg viewBox="0 0 22 12" className="h-3 w-[18px] text-ink/35 rtl:-scale-x-100">
            <motion.path
              d="M0 6 C 6 1, 13 11, 22 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={pret ? { pathLength: 1 } : undefined}
              transition={{ delay: 1.35, duration: 0.6, ease: EASE_OUT }}
            />
          </svg>
        </motion.button>

        {/* Dock : carte blanche, ombre neutre, deux actions séparées par un pointillé. */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={pret ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.6 }}
          className="pointer-events-auto flex flex-col items-center rounded-full bg-card p-1.5 shadow-[0_18px_36px_-20px_rgb(0_0_0/0.4),0_2px_6px_-3px_rgb(0_0_0/0.12)] ring-1 ring-ink/[0.08]"
        >
          <button
            type="button"
            onClick={() => ouvrir()}
            aria-haspopup="dialog"
            aria-expanded={ouvert !== null}
            aria-label={D.ouvrir}
            className="group grid size-12 place-items-center rounded-full bg-brand text-cream transition-colors duration-300 hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <NotebookPen
              className="size-[21px] transition-transform duration-300 group-hover:-rotate-6"
              strokeWidth={1.8}
            />
          </button>
          <span aria-hidden="true" className="my-1.5 w-7 border-t border-dashed border-ink/20" />
          <a
            href={LIENS.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={D.whatsapp}
            className="group relative grid size-12 place-items-center rounded-full text-[#1da851] transition-colors duration-300 hover:bg-[#25d366]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1da851]"
          >
            <IconeWhatsApp className="size-[25px] transition-transform duration-300 group-hover:scale-110" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute end-full top-1/2 me-3 hidden -translate-y-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-[12px] font-semibold whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block"
            >
              WhatsApp
            </span>
          </a>
        </motion.div>
      </div>

      <AnimatePresence>
        {ouvert && <FormulaireDemande pack={ouvert.pack} fermer={() => setOuvert(null)} />}
      </AnimatePresence>
    </ContexteDemande.Provider>
  );
}
