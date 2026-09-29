import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatedButton } from "../components/buttons";
import { Logo } from "../components/decor";
import { EASE_OUT } from "../components/motion";
import { LIENS, NAV } from "../content";

function sectionActive() {
  const repere = window.innerHeight * 0.4;
  let active: string = NAV[0].id;
  let meilleur = -Infinity;
  for (const { id } of NAV) {
    const top = document.getElementById(id)?.getBoundingClientRect().top;
    if (top !== undefined && top <= repere && top > meilleur) {
      meilleur = top;
      active = id;
    }
  }
  return active;
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(NAV[0].id);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

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
  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open, lenis]);

  const fermer = () => {
    lenis?.start();
    setOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: EASE_OUT, delay: 0.15 }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-500 ${
        scrolled || open
          ? "bg-cream/90 shadow-[0_10px_30px_-22px_rgb(20_20_40/0.45)] backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div
        className={`container-page grid grid-cols-[auto_1fr_auto] items-center transition-[height] duration-500 lg:pl-[4.25rem] ${scrolled ? "h-[70px]" : "h-[78px] lg:h-[92px]"}`}
      >
        <a
          href="#accueil"
          aria-label="EIDEN Visa, accueil"
          onClick={fermer}
          className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <Logo />
        </a>

        <nav aria-label="Navigation principale" className="hidden justify-center xl:flex">
          <ul className="flex items-center gap-9 xl:gap-11">
            {NAV.map(({ id, label }) => {
              const courant = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={courant ? "location" : undefined}
                    className={`relative block py-2 text-[14px] transition-colors duration-300 ${courant ? "font-medium text-brand" : "text-ink-soft/80 hover:text-ink"}`}
                  >
                    {label}
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

        <div className="col-start-3 flex items-center justify-end gap-3 sm:gap-6">
          <button
            type="button"
            aria-label="Langue : français"
            className="hidden items-center gap-1.5 text-[14px] font-semibold text-ink sm:inline-flex"
          >
            FR <ChevronDown className="size-4" />
          </button>
          <div className="hidden md:block">
            <AnimatedButton href={LIENS.commencer} size="md" entrance={false}>
              Commencer mon dossier
            </AnimatedButton>
          </div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            className="grid size-11 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-soft)] xl:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-mobile"
            aria-label="Navigation mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="overflow-hidden xl:hidden"
          >
            <ul className="container-page flex flex-col gap-1 pt-2 pb-6">
              {NAV.map(({ id, label }, i) => (
                <motion.li
                  key={id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: EASE_OUT }}
                >
                  <a
                    href={`#${id}`}
                    onClick={fermer}
                    className={`block border-b border-line py-3.5 font-serif text-[22px] ${active === id ? "text-brand" : "text-ink"}`}
                  >
                    {label}
                  </a>
                </motion.li>
              ))}
              <li className="mt-5 md:hidden">
                <AnimatedButton
                  href={LIENS.commencer}
                  size="md"
                  full
                  entrance={false}
                  onClick={fermer}
                >
                  Commencer mon dossier
                </AnimatedButton>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
