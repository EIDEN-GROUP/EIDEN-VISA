import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { Check, ChevronDown, Plane } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatedButton } from "../components/buttons";
import { useDemande } from "../components/DemandeRapide";
import { Logo } from "../components/decor";
import { EASE_OUT } from "../components/motion";
import { useIntroPrete } from "../lib/intro";
import { LIENS, NAV } from "../content";
import { LANGUES, useLangue } from "../i18n";

/** Section affichée : la plus basse dont le haut a passé 40 % de l'écran. */
function sectionActive() {
  const repere = window.innerHeight * 0.4;
  let active: string = NAV[0];
  let meilleur = -Infinity;
  for (const id of NAV) {
    const top = document.getElementById(id)?.getBoundingClientRect().top;
    if (top !== undefined && top <= repere && top > meilleur) {
      meilleur = top;
      active = id;
    }
  }
  return active;
}

/** Sélecteur de langue (FR / العربية) du header. */
function MenuLangue() {
  const { langue, changerLangue, t } = useLangue();
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermeture au clic en dehors ou avec Échap.
  useEffect(() => {
    if (!ouvert) return;
    const auClic = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOuvert(false);
    };
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    document.addEventListener("pointerdown", auClic);
    document.addEventListener("keydown", auClavier);
    return () => {
      document.removeEventListener("pointerdown", auClic);
      document.removeEventListener("keydown", auClavier);
    };
  }, [ouvert]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={ouvert}
        aria-label={t.header.langue}
        className="inline-flex items-center gap-1.5 rounded-full px-2 py-2 text-[14px] font-semibold text-ink transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        <span lang="fr">{langue.toUpperCase()}</span>
        <motion.span animate={{ rotate: ouvert ? 180 : 0 }} className="inline-flex">
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {ouvert && (
          <motion.ul
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="absolute end-0 top-full z-50 mt-2 w-48 origin-top overflow-hidden rounded-2xl bg-card p-1.5 shadow-[var(--shadow-float)] ring-1 ring-black/5"
          >
            {LANGUES.map(({ code, nom, dir }) => {
              const actif = langue === code;
              return (
                <li key={code} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={actif}
                    lang={code}
                    dir={dir}
                    onClick={() => {
                      setOuvert(false);
                      if (!actif) changerLangue(code);
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[14.5px] transition-colors hover:bg-sand ${
                      actif ? "font-semibold text-brand" : "text-ink"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        lang="fr"
                        className="grid h-6 w-8 place-items-center rounded-md bg-sand text-[11px] font-bold text-ink-soft"
                      >
                        {code.toUpperCase()}
                      </span>
                      {nom}
                    </span>
                    {actif && <Check className="size-4" strokeWidth={2.4} />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const EASE_RIDEAU = [0.76, 0, 0.24, 1] as const;

/**
 * Menu plein écran (mobile / tablette) : un panneau crème s'ouvre en cercle depuis le
 * bouton, les liens montent un à un, la section courante est marquée d'un avion.
 */
function MenuMobile({
  origine,
  active,
  fermer,
}: {
  origine: { x: number; y: number };
  active: string;
  fermer: () => void;
}) {
  const { t, langue, changerLangue } = useLangue();
  const ouvrirDemande = useDemande();
  const premier = useRef<HTMLAnchorElement>(null);
  const cercle = (rayon: string) => `circle(${rayon} at ${origine.x}px ${origine.y}px)`;

  useEffect(() => {
    premier.current?.focus({ preventScroll: true });
  }, []);

  return createPortal(
    <motion.div
      id="menu-mobile"
      role="dialog"
      aria-modal="true"
      aria-label={t.header.navigationMobile}
      initial={{ clipPath: cercle("0px") }}
      animate={{ clipPath: cercle("150vmax") }}
      exit={{
        clipPath: cercle("0px"),
        transition: { duration: 0.6, ease: EASE_RIDEAU, delay: 0.15 },
      }}
      transition={{ duration: 0.8, ease: EASE_RIDEAU }}
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-cream text-ink xl:hidden"
    >
      {/* Décor : tampon Schengen très pâle en bas. */}
      <img
        src="/images/tampon-schengen-rond.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 -bottom-20 w-[min(105vw,560px)] -rotate-[14deg] opacity-[0.08]"
      />

      <nav
        aria-label={t.header.navigationMobile}
        className="container-page relative flex flex-1 flex-col overflow-y-auto pt-[100px] pb-[max(1.75rem,env(safe-area-inset-bottom))]"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="eyebrow text-muted"
        >
          {t.header.menu}
        </motion.p>
        <ul className="mt-3">
          {NAV.map((id, i) => {
            const courant = active === id;
            return (
              <li key={id} className="border-b border-line/50">
                <a
                  ref={i === 0 ? premier : undefined}
                  href={`#${id}`}
                  onClick={fermer}
                  aria-current={courant ? "location" : undefined}
                  className="group flex items-center gap-4 py-3.5 outline-none focus-visible:bg-ink/[0.04] sm:py-4"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.5 }}
                    className={`w-7 shrink-0 font-serif text-[10px] tabular-nums ${
                      courant ? "text-brand" : "text-ink/35"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.span>
                  <span className="overflow-hidden pb-1">
                    <motion.span
                      initial={{ y: "115%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "115%", transition: { duration: 0.35, ease: EASE_RIDEAU } }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.75, ease: EASE_OUT }}
                      className={`block font-serif text-[25px] leading-[1.08] transition-colors duration-300 ${
                        courant ? "text-ink" : "text-ink-soft/70 group-hover:text-ink"
                      }`}
                    >
                      {t.nav[id]}
                    </motion.span>
                  </span>
                  {courant && (
                    <motion.span
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.75, duration: 0.6, ease: EASE_OUT }}
                      className="ms-auto text-brand"
                    >
                      <Plane className="size-5 fill-current rtl:-scale-x-100" strokeWidth={1.4} />
                    </motion.span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
          transition={{ delay: 0.7, duration: 0.7, ease: EASE_OUT }}
          className="mt-auto pt-10"
        >
          <p className="font-script text-[26px] leading-none text-ink/60">{t.loader.slogan}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AnimatedButton
              size="md"
              full
              entrance={false}
              popup
              onClick={() => {
                fermer();
                ouvrirDemande();
              }}
            >
              {t.header.commencer}
            </AnimatedButton>
            <AnimatedButton
              href={LIENS.contact}
              variant="light"
              size="md"
              arrow={false}
              full
              entrance={false}
              onClick={fermer}
            >
              {t.cta.contact}
            </AnimatedButton>
          </div>
          <div role="group" aria-label={t.header.langue} className="mt-6 flex gap-2">
            {LANGUES.map(({ code, nom, dir }) => {
              const actif = langue === code;
              return (
                <button
                  key={code}
                  type="button"
                  lang={code}
                  dir={dir}
                  aria-pressed={actif}
                  onClick={() => {
                    if (actif) return;
                    fermer();
                    changerLangue(code);
                  }}
                  className={`rounded-full px-4 py-2 text-[13.5px] font-semibold ring-1 transition-colors duration-300 ${
                    actif
                      ? "bg-ink text-white ring-ink"
                      : "text-ink-soft ring-line hover:text-ink hover:ring-ink/30"
                  }`}
                >
                  {nom}
                </button>
              );
            })}
          </div>
        </motion.div>
      </nav>
    </motion.div>,
    document.body,
  );
}

export function Header() {
  const { t } = useLangue();
  const ouvrirDemande = useDemande();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(NAV[0]);
  const [open, setOpen] = useState(false);
  const [origine, setOrigine] = useState({ x: 0, y: 0 });
  const burger = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const pret = useIntroPrete();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 24);
        setActive(sectionActive());
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Menu mobile ouvert : on fige le défilement de la page.
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  // Menu ouvert : Échap le ferme, le passage en desktop (menu masqué) aussi ; à la
  // fermeture, le focus revient sur le bouton.
  useEffect(() => {
    if (!open) return;
    const bouton = burger.current;
    const desktop = window.matchMedia("(min-width: 1280px)");
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const auChangement = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", auClavier);
    desktop.addEventListener("change", auChangement);
    return () => {
      document.removeEventListener("keydown", auClavier);
      desktop.removeEventListener("change", auChangement);
      bouton?.focus({ preventScroll: true });
    };
  }, [open]);

  // Relance Lenis tout de suite : son gestionnaire d'ancre passe juste après ce clic.
  const fermer = () => {
    lenis?.start();
    setOpen(false);
  };

  // Le cercle du menu s'ouvre depuis le centre du bouton.
  const basculer = () => {
    const r = burger.current?.getBoundingClientRect();
    if (r) setOrigine({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    setOpen((o) => !o);
  };

  // Menu ouvert : le header passe au-dessus du panneau crème (langue et CTA masqués).
  const masqueSiMenu = `transition-opacity duration-300 ${open ? "pointer-events-none opacity-0" : ""}`;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={pret ? { y: 0, opacity: 1 } : undefined}
      transition={{ duration: 1, ease: EASE_OUT, delay: 0.15 }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500 ${
        scrolled && !open
          ? "bg-cream/90 shadow-[0_10px_30px_-22px_rgb(20_20_40/0.45)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div
        className={`container-page grid grid-cols-[auto_1fr_auto] items-center transition-[height] duration-500 lg:ps-[4.25rem] ${
          scrolled ? "h-[70px]" : "h-[78px] lg:h-[92px]"
        }`}
      >
        <a
          href="#accueil"
          aria-label={t.header.accueil}
          onClick={fermer}
          className="rounded-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Logo />
        </a>

        <nav aria-label={t.header.navigation} className="hidden justify-center xl:flex">
          <ul className="flex items-center gap-9 xl:gap-11">
            {NAV.map((id) => {
              const courant = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={courant ? "location" : undefined}
                    className={`relative block py-2 text-[14px] transition-colors font-semibold duration-300 ${
                      courant ? "font-extrabold text-brand" : "text-ink-soft/80 hover:text-ink"
                    }`}
                  >
                    {t.nav[id]}
                    {courant && (
                      <motion.span
                        layoutId="nav-soulignement"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-brand"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-2 sm:gap-5">
          <div className={masqueSiMenu}>
            <MenuLangue />
          </div>
          <div className={`hidden md:block ${masqueSiMenu}`}>
            <AnimatedButton size="md" entrance={false} popup onClick={() => ouvrirDemande()}>
              {t.header.commencer}
            </AnimatedButton>
          </div>
          <button
            ref={burger}
            type="button"
            onClick={basculer}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? t.header.fermerMenu : t.header.ouvrirMenu}
            className={`grid size-11 place-items-center rounded-full transition-[background-color,color,box-shadow,scale] duration-500 active:scale-90 xl:hidden ${
              open
                ? "bg-card text-ink shadow-[var(--shadow-soft)] ring-1 ring-line"
                : "bg-ink text-white shadow-[0_10px_24px_-10px_rgb(11_26_48/0.6)]"
            }`}
          >
            {/* Deux traits (le second plus court) qui se croisent en X à l'ouverture. */}
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span
                className={`absolute inset-x-0 top-0 h-[2px] rounded-full bg-current transition-transform duration-500 ${
                  open ? "translate-y-[5px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute end-0 bottom-0 h-[2px] rounded-full bg-current transition-[translate,rotate,width] duration-500 ${
                  open ? "w-5 -translate-y-[5px] -rotate-45" : "w-3.5"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && <MenuMobile origine={origine} active={active} fermer={fermer} />}
      </AnimatePresence>
    </motion.header>
  );
}
