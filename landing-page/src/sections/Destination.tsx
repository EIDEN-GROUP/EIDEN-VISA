import type { CSSProperties } from "react";
import { IconButton } from "../components/buttons";
import { EUFlag } from "../components/decor";
import { Reveal, SplitReveal } from "../components/motion";
import { LIENS } from "../content";
import { useLangue } from "../i18n";

export function Destination() {
  const { t } = useLangue();

  return (
    <section
      id="visa"
      aria-labelledby="visa-titre"
      className="relative z-20 -mt-(--carte-chevauche) scroll-mt-24"
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-[3.1rem]">
        <Reveal
          y={0}
          scale={0.97}
          immediat
          className="grid items-center gap-2 font-bold rounded-lg bg-card p-3 shadow-[var(--shadow-float)] sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,37%)] sm:gap-0 sm:p-3.5"
        >
          <div className="relative py-5 ps-12 pe-4 sm:py-6 sm:ps-[3.4rem] lg:ps-[4.6rem]">
            <span
              aria-hidden="true"
              className="absolute start-[0.95rem] top-[2.05rem] h-[2px] w-[26px] bg-brand sm:top-[2.3rem] lg:start-[1.5rem]"
            />
            <SplitReveal
              as="p"
              mode="chars"
              start="top bottom"
              className="eyebrow text-[11.5px] text-ink-soft"
            >
              {t.destination.surtitre}
            </SplitReveal>
            <h2
              id="visa-titre"
              className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 font-serif text-[clamp(2.1rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.01em] text-ink"
            >
              <SplitReveal as="span" delay={0.1} start="top bottom">
                {t.destination.titre}
              </SplitReveal>
              <Reveal as="span" delay={0.35} y={10} scale={0.6} immediat className="inline-flex">
                <EUFlag
                  label={t.destination.drapeau}
                  className="h-[0.78em] w-auto drop-shadow-[0_3px_6px_rgb(0_51_153/0.25)]"
                />
              </Reveal>
            </h2>
            <SplitReveal
              as="p"
              mode="lines"
              delay={0.2}
              start="top bottom"
              className="mt-3 text-[14.5px] leading-[1.6] text-muted"
            >
              {t.destination.texte}
            </SplitReveal>
          </div>

          {/* Marge de fin large en xl : le tampon Schengen se loge entre la flèche et la photo. */}
          <IconButton
            href={LIENS.evaluer}
            tone="outline-brand"
            size="lg"
            label={t.destination.bouton}
            className="ms-12 mb-3 sm:ms-2 sm:me-4 sm:mb-0 lg:ms-8 lg:me-8 xl:ms-10 xl:me-[132px]"
          />

          <div className="relative h-[190px] sm:h-[161px]">
            <img
              src="/images/tampon-schengen-rect.webp"
              alt=""
              aria-hidden="true"
              className="tilt absolute end-[calc(100%-22px)] top-1/2 hidden w-[150px] -translate-y-1/2 opacity-55 xl:block"
              style={{ "--tilt": "-10deg" } as CSSProperties}
            />
            <div className="relative h-full overflow-hidden rounded-r-lg ">
              <img
                src="/images/world-2.png"
                alt={t.destination.imageAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-[50%_38%] transition-transform duration-[1.4s] ease-out hover:scale-[1.05]"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
