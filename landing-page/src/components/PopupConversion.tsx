// Popup de conversion après « Notre méthode » : dialogue modal centré (tiroir bas
// sur mobile, comme la demande rapide). Deux actions existantes : ouvrir la
// demande rapide (`useDemande`, comme « Commencer mon dossier ») ou WhatsApp
// (`LIENS.whatsapp`, comme « Nous contacter »). Habillage = carte
// `.demande-carte` + boutons `AnimatedButton`, comme le reste du site.
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";
import { AnimatedButton } from "./buttons";
import { IconeWhatsApp, useDemande } from "./DemandeRapide";
import { LIENS } from "../content";
import { useLangue } from "../i18n";
import {
  demandeEnvoyee,
  marquerPopupAction,
  marquerPopupVue,
  popupDejaVue,
} from "../lib/popup-conversion";
import { suivreContenu, suivrePopupCommencer } from "../lib/suivi";

/** La demande rapide est ouverte : la popup n'a plus rien à proposer. */
export function PopupConversion({ demandeOuverte }: { demandeOuverte: boolean }) {
  const { t } = useLangue();
  const ouvrirDemande = useDemande();
  const lenis = useLenis();
  const [visible, setVisible] = useState(false);
  const carte = useRef<HTMLDivElement>(null);
  // Tiroir bas sur mobile, carte centrée sur desktop (même discipline que la demande).
  const [mobile] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const C = t.conversion;

  const fermer = useCallback(
    (origine: "croix" | "dehors" | "echap") => {
      marquerPopupVue();
      suivreContenu("bouton", `${C.fermer} (${origine})`, "conversion");
      setVisible(false);
    },
    [C.fermer],
  );

  // Déclencheur : la section est entrée à l'écran au moins une fois, puis son bas
  // passe au-dessus du viewport (le visiteur l'a lue et continue). Rien au
  // chargement, rien tant qu'on la lit encore, une seule fois par session.
  useEffect(() => {
    if (popupDejaVue() || demandeEnvoyee()) return;
    const section = document.getElementById("methode");
    if (!section) return;
    let vue = false;
    let declenche = false;
    const observer = new IntersectionObserver(
      ([entree]) => {
        if (!entree || declenche) return;
        if (entree.isIntersecting) {
          vue = true;
          return;
        }
        if (vue && entree.boundingClientRect.bottom < 0) {
          declenche = true;
          observer.disconnect();
          if (popupDejaVue() || demandeEnvoyee()) return;
          marquerPopupVue();
          suivreContenu("cta", "popup-conversion", "conversion");
          setVisible(true);
        }
      },
      { threshold: 0 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Si la demande s'ouvre ou aboutit pendant que la popup est visible, on l'efface.
  useEffect(() => {
    if (demandeOuverte || demandeEnvoyee()) setVisible(false);
  }, [demandeOuverte]);

  // Page figée derrière la popup ; Échap ferme ; Tab reste dedans ; au départ, le
  // focus revient à l'élément qui l'avait (même discipline que la demande rapide).
  useEffect(() => {
    if (!visible) return;
    lenis?.stop();
    const avant = document.activeElement as HTMLElement | null;
    const auClavier = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "Escape") {
        e.preventDefault();
        fermer("echap");
        return;
      }
      if (e.key !== "Tab" || !carte.current) return;
      const cibles = [
        ...carte.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
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
      lenis?.start();
    };
  }, [visible, fermer, lenis]);

  // Focus d'entrée sur l'action principale (pas sur mobile, pour ne pas ouvrir
  // le clavier d'office — même règle que la demande rapide).
  useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const minuterie = window.setTimeout(() => {
      carte.current
        ?.querySelector<HTMLElement>(".bloc-principal button")
        ?.focus({ preventScroll: true });
    }, 380);
    return () => clearTimeout(minuterie);
  }, [visible]);

  const commencer = () => {
    marquerPopupAction();
    suivrePopupCommencer();
    setVisible(false);
    ouvrirDemande();
  };

  const whatsapp = () => {
    marquerPopupAction();
    suivreContenu("bouton", t.demande.whatsapp, "conversion");
    setVisible(false);
  };

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center sm:p-6"
          initial="ferme"
          animate="ouvert"
          exit="ferme"
        >
          <motion.div
            aria-hidden="true"
            onClick={() => fermer("dehors")}
            variants={{ ferme: { opacity: 0 }, ouvert: { opacity: 1 } }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-ink/55 backdrop-blur-[3px]"
          />
          <motion.div
            ref={carte}
            role="dialog"
            aria-modal="true"
            aria-labelledby="conversion-titre"
            variants={
              mobile
                ? { ferme: { y: "100%" }, ouvert: { y: 0 } }
                : {
                    ferme: { opacity: 0, y: 40, scale: 0.96 },
                    ouvert: { opacity: 1, y: 0, scale: 1 },
                  }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="demande-carte sans-barre relative isolate flex max-h-[94svh] w-full flex-col overflow-y-auto rounded-t-[28px] bg-cream p-6 shadow-[0_30px_80px_-30px_rgb(11_26_48/0.6)] sm:max-w-[480px] sm:rounded-[28px] sm:p-8"
          >
            <span
              aria-hidden="true"
              className="mx-auto h-1 w-10 shrink-0 rounded-full bg-ink/15 sm:hidden"
            />
            <button
              type="button"
              onClick={() => fermer("croix")}
              aria-label={C.fermer}
              className="absolute end-4 top-4 grid size-10 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-ink/5 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
            <p className="eyebrow pe-10 text-brand">{C.surtitre}</p>
            <h2
              id="conversion-titre"
              className="mt-3 font-serif text-[clamp(1.6rem,2.4vw,2rem)] leading-[1.12] text-ink"
            >
              {C.titre}
            </h2>
            <p className="mt-3 text-[14.5px] leading-[1.65] text-muted">{C.texte}</p>
            <div className="mt-6 flex flex-col gap-3">
              <AnimatedButton
                full
                popup
                entrance={false}
                onClick={commencer}
                className="bloc-principal"
              >
                {C.commencer}
              </AnimatedButton>
              <AnimatedButton
                full
                entrance={false}
                variant="sand"
                arrow={false}
                href={LIENS.whatsapp}
                onClick={whatsapp}
                leading={<IconeWhatsApp className="size-5 text-[#1da851]" />}
              >
                {C.whatsapp}
              </AnimatedButton>
            </div>
            <p className="mt-4 text-center text-[12.5px] leading-[1.5] text-muted">{C.note}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
