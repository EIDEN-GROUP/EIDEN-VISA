// Écran d'ouverture : un ciel au coucher du soleil couvre la page, puis un avion le
// traverse (de gauche à droite ; miroir droite → gauche en arabe, voir `rtl`
// ci-dessous et les surcharges `[dir="rtl"]` dans styles.css). Derrière lui, le ciel
// est découpé comme un rideau (masque à bord fondu) et la landing apparaît.
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { useLangue } from "../i18n";
import { gsap, useGSAP } from "../lib/gsap";
import { lancerIntro } from "../lib/intro";

const CIEL = "/images/loader-bg.png";
const AVION = "/images/loader-avion.webp";
const LOGO = "/images/logo-eiden-visa-blanc.webp";
const A_PRECHARGER = [CIEL, AVION, LOGO, "/images/hero.png"];
/** Le temps de lire la marque, même quand tout est déjà en cache (ms). */
const TEMPS_MIN = 1400;
/** Réseau lent : on n'attend jamais plus longtemps (ms). */
const TEMPS_MAX = 5000;
/** Bord du rideau placé vers la queue de l'avion (fraction de sa largeur). */
const BORD_RIDEAU = 0.2;

const delai = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function precharger(src: string) {
  const img = new Image();
  img.src = src;
  return img.decode().catch(() => undefined);
}

type Props = {
  /** Images prêtes : la landing peut être montée sous le rideau. */
  onReady: () => void;
  /** Avion sorti de l'écran : le loader peut être retiré. */
  onDone: () => void;
};

export function Loader({ onReady, onDone }: Props) {
  const { t, langue } = useLangue();
  const root = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const rappels = useRef({ onReady, onDone, lenis });
  rappels.current = { onReady, onDone, lenis };

  // Pendant l'attente : le ciel se pose doucement et la marque apparaît.
  useGSAP(
    () => {
      gsap.fromTo("[data-ciel]", { scale: 1.14 }, { scale: 1, duration: 3.4, ease: "power2.out" });
      gsap.from("[data-marque] > *", {
        y: 26,
        opacity: 0,
        filter: "blur(8px)",
        duration: 1.1,
        stagger: 0.16,
        ease: "power3.out",
        delay: 0.15,
      });
    },
    { scope: root },
  );

  useEffect(() => {
    let annule = false;
    let vol: gsap.core.Timeline | undefined;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const voler = () => {
      const el = root.current;
      const avion = el?.querySelector<HTMLElement>("[data-avion]");
      const rideau = el?.querySelector<HTMLElement>("[data-rideau]");
      if (!el || !avion || !rideau) return rappels.current.onDone();

      // Le Header vient d'être monté et relance Lenis : on fige le scroll pendant le vol.
      rappels.current.lenis?.stop();
      window.scrollTo(0, 0);

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = avion.offsetWidth;
      const h = avion.offsetHeight;
      const distance = vw + w * 1.25;
      const depart = vh * 0.6;
      const arrivee = depart - Math.min(vh * 0.42, distance * 0.2);
      const duree = gsap.utils.clamp(1.9, 2.8, distance / 880);
      const rtl = document.documentElement.dir === "rtl";

      // En arabe le vol est miroir (droite → gauche) : la queue est à droite et le
      // masque (orienté -100deg, compté depuis le bord droit) compte depuis la droite.
      const couper = () => {
        const r = avion.getBoundingClientRect();
        const queue = rtl ? r.right - r.width * BORD_RIDEAU : r.left + r.width * BORD_RIDEAU;
        rideau.style.setProperty("--cut", `${rtl ? vw - queue : queue}px`);
      };

      gsap.set(avion, {
        visibility: "visible",
        x: rtl ? vw + w * 0.1 : -w * 1.1,
        y: depart - h / 2,
        rotate: rtl ? -3 : 3,
        // Miroir : l'image regarde vers la gauche. `scale` seul réécrirait scaleX
        // pendant le vol, d'où scaleX/scaleY explicites (valeurs miroirs de 0.82→1.06).
        ...(rtl ? { scaleX: -0.82, scaleY: 0.82 } : { scale: 0.82 }),
      });
      couper();

      vol = gsap
        .timeline({
          onComplete: () => {
            rappels.current.lenis?.start();
            rappels.current.onDone();
          },
        })
        .to(avion, {
          x: rtl ? -w * 1.15 : vw + w * 0.15,
          y: arrivee - h / 2,
          rotate: rtl ? 4 : -4,
          ...(rtl ? { scaleX: -1.06, scaleY: 1.06 } : { scale: 1.06 }),
          duration: duree,
          ease: "sine.inOut",
          onUpdate: couper,
        })
        .fromTo(
          el.querySelectorAll("[data-trainee]"),
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: duree * 0.55, ease: "power2.out", stagger: 0.08 },
          duree * 0.12,
        )
        .to(
          el.querySelector("[data-marque]"),
          { opacity: 0, y: -18, duration: duree * 0.5, ease: "power1.in" },
          0,
        )
        // Les textes du hero (à gauche, à droite en arabe) démarrent quand l'avion les découvre.
        .call(lancerIntro, [], duree * (rtl ? 0.72 : 0.42))
        .to(el, { opacity: 0, duration: 0.45, ease: "power2.out" }, duree - 0.1);
    };

    void Promise.race([
      Promise.all([...A_PRECHARGER.map(precharger), document.fonts.ready, delai(TEMPS_MIN)]),
      delai(TEMPS_MAX),
    ])
      .then(() => {
        if (annule) return;
        rappels.current.onReady();
        // Laisse React monter la landing sous le rideau avant de lancer l'avion.
        return delai(260);
      })
      .then(() => {
        if (!annule) voler();
      });

    return () => {
      annule = true;
      vol?.kill();
    };
  }, []);

  return (
    <div
      ref={root}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      <span className="sr-only">{t.loader.chargement}</span>

      <div
        data-rideau
        aria-hidden="true"
        className="loader-rideau absolute inset-0 overflow-hidden"
      >
        <img
          data-ciel
          src={CIEL}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[70%_50%]"
        />
        <span className="loader-voile absolute inset-0" />
        <div
          data-marque
          lang="fr"
          className="absolute inset-x-0 top-[26%] flex flex-col items-center text-center text-white sm:top-[24%]"
        >
          <img
            src={LOGO}
            alt=""
            width={1400}
            height={416}
            className="h-auto w-[clamp(250px,46vw,560px)] [filter:drop-shadow(0_4px_26px_rgb(8_20_52/0.45))]"
          />
          <span
            lang={langue}
            className="mt-6 font-script text-[clamp(1.5rem,3.4vw,2.4rem)] text-white/90 [text-shadow:0_2px_18px_rgb(8_20_52/0.5)]"
          >
            {t.loader.slogan}
          </span>
        </div>
      </div>

      <div
        data-avion
        aria-hidden="true"
        className="invisible absolute top-0 left-0 w-[clamp(280px,52vw,900px)] will-change-transform"
      >
        {/* Traînées de condensation, sorties des réacteurs, derrière l'avion.
            Elles sont DANS le bloc avion : le `scaleX: -1` arabe les retourne
            avec l'image, donc aucune surcharge RTL ici (sinon double miroir). */}
        <span data-trainee className="loader-trainee top-[63%] right-[54%]" />
        <span data-trainee className="loader-trainee top-[72%] right-[26%]" />
        <img
          src={AVION}
          alt=""
          className="relative block h-auto w-full [filter:drop-shadow(0_28px_36px_rgb(8_20_52/0.35))]"
        />
      </div>
    </div>
  );
}
