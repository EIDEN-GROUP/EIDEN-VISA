import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { Reveal, SplitReveal } from "../components/motion";
import { ETAPES_ICONES } from "../content";
import { useLangue } from "../i18n";
import { gsap, prefersReducedMotion, ScrollTrigger } from "../lib/gsap";
import { introPrete } from "../lib/intro";

/** Hauteur des petits arcs entre deux étapes (px) : le fil ressemble à une trajectoire de vol. */
const ARC = 22;
/** Durée d'un vol entre deux étapes, puis de l'escale (s). */
const VOL = 1.25;
const ESCALE = 0.6;

type Point = { x: number; y: number };

/**
 * Trajet en pointillés passant par le centre de chaque pastille. Entre deux pastilles :
 * un arc vers le haut en ligne (desktop), vers le côté texte en colonne (mobile).
 */
function trajet(points: Point[], rtl: boolean) {
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let k = 1; k < points.length; k++) {
    const a = points[k - 1]!;
    const b = points[k]!;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const ligne = Math.abs(b.x - a.x) > Math.abs(b.y - a.y);
    const cx = ligne ? mx : mx + (rtl ? -ARC : ARC);
    const cy = ligne ? my - ARC : my;
    d += ` Q ${cx} ${cy} ${b.x} ${b.y}`;
  }
  return d;
}

export function Methode() {
  const { t } = useLangue();
  const liste = useRef<HTMLOListElement>(null);
  const idMasque = `m${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Le vol en boucle : l'avion part de l'étape 1, fait escale à chaque pastille (qui
  // s'allume), trace le pointillé en rouge derrière lui, puis tout repart de zéro.
  useEffect(() => {
    const ol = liste.current;
    if (!ol) return;
    const svg = ol.querySelector<SVGSVGElement>("[data-parcours]")!;
    const fond = svg.querySelector<SVGPathElement>("[data-fond]")!;
    const trace = svg.querySelector<SVGPathElement>("[data-trace]")!;
    const masque = svg.querySelector<SVGPathElement>("[data-masque]")!;
    const zoneMasque = svg.querySelector<SVGMaskElement>("mask")!;
    const avion = ol.querySelector<HTMLElement>("[data-avion]")!;
    const etapes = [...ol.querySelectorAll<HTMLElement>(":scope > li")];
    const reduit = prefersReducedMotion();

    let ctx: gsap.Context | undefined;
    let annule = false;

    const construire = () => {
      ctx?.revert();
      if (annule || etapes.length < 2) return;
      ctx = gsap.context(() => {
        // Pas de viewBox : 1 unité SVG = 1 px de la liste, quelle que soit sa hauteur.
        const marge = ARC * 2;
        const zone = { x: -marge, y: -marge, width: ol.clientWidth + marge * 2 };
        for (const [k, v] of Object.entries({ ...zone, height: ol.clientHeight + marge * 2 }))
          zoneMasque.setAttribute(k, String(v));

        // offsetLeft/Top : positions de mise en page, insensibles aux animations d'apparition.
        const points = etapes.map((li) => {
          const p = li.querySelector<HTMLElement>("[data-pastille]")!;
          return {
            x: li.offsetLeft + p.offsetLeft + p.offsetWidth / 2,
            y: li.offsetTop + p.offsetTop + p.offsetHeight / 2,
          };
        });
        const rtl = getComputedStyle(ol).direction === "rtl";
        const d = trajet(points, rtl);
        for (const p of [fond, trace, masque]) p.setAttribute("d", d);
        if (reduit) return;

        // Fraction du trajet atteinte à chaque escale.
        const mesure = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svg.appendChild(mesure);
        const total = masque.getTotalLength();
        const escales = points.map((_, k) => {
          if (k === 0) return 0;
          mesure.setAttribute("d", trajet(points.slice(0, k + 1), rtl));
          return mesure.getTotalLength() / total;
        });
        mesure.remove();

        const allumer = (k: number) =>
          etapes.forEach((li, i) => {
            li.dataset.atteint = String(i <= k);
            li.dataset.actif = String(i === k);
          });
        const eteindre = () =>
          etapes.forEach((li) => {
            li.dataset.atteint = "false";
            li.dataset.actif = "false";
          });

        gsap.set(masque, { strokeDasharray: total, strokeDashoffset: total });
        gsap.set(trace, { opacity: 1 });
        gsap.set(avion, { xPercent: -50, yPercent: -50, x: points[0]!.x, y: points[0]!.y });
        allumer(0);

        const vol = gsap.timeline({ repeat: -1, paused: true });
        for (let k = 0; k < points.length - 1; k++) {
          vol
            .to(avion, {
              motionPath: { path: masque, autoRotate: 45, start: escales[k], end: escales[k + 1] },
              duration: VOL,
              ease: "power1.inOut",
            })
            .to(
              masque,
              {
                strokeDashoffset: total * (1 - escales[k + 1]!),
                duration: VOL,
                ease: "power1.inOut",
              },
              "<",
            )
            .call(allumer, [k + 1])
            .to({}, { duration: ESCALE });
        }
        // Arrivée : le tracé s'efface, les pastilles s'éteignent, l'avion revient au départ.
        vol
          .to({}, { duration: 0.8 })
          .to([trace, avion], { opacity: 0, duration: 0.5, ease: "power1.in" })
          .call(eteindre)
          .set(masque, { strokeDashoffset: total })
          .set(avion, { x: points[0]!.x, y: points[0]!.y, rotation: 0 })
          .to([trace, avion], { opacity: 1, duration: 0.01 })
          .call(allumer, [0])
          .to({}, { duration: 0.5 });

        // En boucle seulement quand la section est à l'écran (et après le loader).
        ScrollTrigger.create({
          trigger: ol,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            if (!self.isActive) {
              vol.pause();
              return;
            }
            void introPrete.then(() => {
              if (self.isActive) vol.play();
            });
          },
        });
      }, ol);
    };

    construire();
    // Taille modifiée (redimensionnement, police chargée, langue) : on recalcule le trajet.
    let attente = 0;
    let taille = `${ol.clientWidth}x${ol.clientHeight}`;
    const observateur = new ResizeObserver(() => {
      const nouvelle = `${ol.clientWidth}x${ol.clientHeight}`;
      if (nouvelle === taille) return;
      taille = nouvelle;
      clearTimeout(attente);
      attente = window.setTimeout(construire, 200);
    });
    observateur.observe(ol);

    return () => {
      annule = true;
      clearTimeout(attente);
      observateur.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="methode"
      aria-labelledby="methode-titre"
      className="scroll-mt-24 pt-16 sm:pt-20 lg:pt-[58px]"
    >
      <div className="container-page text-center font-medium">
        <SplitReveal as="p" mode="chars" className="eyebrow text-muted">
          {t.methode.surtitre}
        </SplitReveal>
        <SplitReveal
          as="h2"
          id="methode-titre"
          className="mx-auto mt-4 font-serif text-[clamp(1.75rem,2.6vw,2.35rem)] leading-[1.15] text-ink"
        >
          {t.methode.titre}
        </SplitReveal>

        {/* Mobile / tablette : colonne (pastille + texte) ; desktop : 6 étapes en ligne. */}
        <ol
          ref={liste}
          className="relative mx-auto mt-12 grid max-w-[440px] gap-y-10 lg:mt-14 lg:max-w-none lg:grid-cols-6 lg:gap-x-4"
        >
          <svg
            data-parcours
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            <defs>
              <mask id={idMasque} maskUnits="userSpaceOnUse">
                <path
                  data-masque
                  fill="none"
                  stroke="#fff"
                  strokeWidth={10}
                  strokeLinecap="round"
                />
              </mask>
            </defs>
            <path
              data-fond
              fill="none"
              stroke="#d8cdc1"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeDasharray="0.01 9"
            />
            <path
              data-trace
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeDasharray="0.01 9"
              mask={`url(#${idMasque})`}
            />
          </svg>
          {/* Sous les pastilles (z-10) : l'avion « atterrit » derrière chaque étape. */}
          <span
            data-avion
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-[5] text-brand drop-shadow-[0_4px_6px_rgb(174_10_26/0.3)] motion-reduce:hidden"
          >
            <Plane className="size-[22px] fill-current" strokeWidth={1.4} />
          </span>

          {t.methode.etapes.map(({ titre, texte }, i) => {
            const Icon = ETAPES_ICONES[i]!;
            return (
              <Reveal
                as="li"
                key={titre}
                delay={i * 0.1}
                y={36}
                className="group relative flex items-start gap-5 text-start font-bold lg:flex-col lg:items-center lg:gap-0 lg:text-center"
              >
                <motion.span
                  data-pastille
                  whileHover={{ scale: 1.1, rotate: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  className="relative z-10 grid size-[55px] shrink-0 place-items-center rounded-full bg-sand text-brand shadow-[0_0_0_6px_var(--color-cream)] transition-colors duration-500 group-data-[atteint=true]:bg-brand group-data-[atteint=true]:text-white"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-2 border-brand opacity-0 group-data-[actif=true]:animate-[eiden-pulse_1.6s_ease-out_infinite]"
                  />
                  <Icon className="size-[30px]" />
                </motion.span>
                <div className="pt-1 lg:pt-0">
                  <span className="font-serif text-[15px] text-brand [font-variant-numeric:oldstyle-nums] lg:mt-4 lg:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-0.5 font-serif text-[18px] leading-[1.2] text-ink lg:mx-auto lg:max-w-[150px]">
                    {titre}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-[1.55] text-muted lg:mx-auto lg:max-w-[175px]">
                    {texte}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
