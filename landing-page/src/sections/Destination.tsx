import { IconButton } from "../components/buttons";
import { EUFlag, PostalStamp } from "../components/decor";
import { Reveal, SplitReveal } from "../components/motion";
import { LIENS } from "../content";

/** Carte « Votre destination » juste sous le hero : visa Schengen + drapeau de l'UE. */
export function Destination() {
  return (
    <section id="visa" aria-labelledby="visa-titre" className="relative z-10 scroll-mt-24">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-[3.1rem]">
        <Reveal
          y={0}
          scale={0.97}
          className="grid items-center gap-2 rounded-[18px] bg-card p-3 shadow-[var(--shadow-float)] sm:p-3.5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,37%)] lg:gap-0"
        >
          <div className="relative py-5 pr-4 pl-12 sm:py-6 sm:pl-[4.6rem]">
            <span
              aria-hidden="true"
              className="absolute top-[2.05rem] left-[0.95rem] h-[2px] w-[26px] bg-brand sm:top-[2.3rem] sm:left-[1.5rem]"
            />
            <SplitReveal
              as="p"
              mode="chars"
              start="top bottom"
              className="eyebrow text-[11.5px] text-ink-soft"
            >
              Votre destination
            </SplitReveal>
            <h2
              id="visa-titre"
              className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 font-serif text-[clamp(2.1rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.01em] text-ink"
            >
              <SplitReveal as="span" delay={0.1} start="top bottom">
                Visa Schengen
              </SplitReveal>
              <Reveal as="span" delay={0.35} y={10} scale={0.6} className="inline-flex">
                <EUFlag className="h-[0.78em] w-auto drop-shadow-[0_3px_6px_rgb(0_51_153/0.25)]" />
              </Reveal>
            </h2>
            <SplitReveal
              as="p"
              mode="lines"
              delay={0.2}
              start="top bottom"
              className="mt-3 text-[14.5px] leading-[1.6] text-muted"
            >
              Préparez votre dossier et commencez votre voyage en toute sérénité.
            </SplitReveal>
          </div>

          <IconButton
            href={LIENS.evaluer}
            tone="outline-brand"
            size="lg"
            label="Préparer mon dossier visa Schengen"
            className="mb-3 ml-12 sm:ml-[4.6rem] lg:mx-10 lg:mb-0 xl:mx-14"
          />

          <div className="relative h-[190px] sm:h-[220px] lg:h-[161px]">
            <PostalStamp className="absolute top-1/2 right-[calc(100%-18px)] hidden h-[122px] w-[112px] -translate-y-1/2 -rotate-[10deg] text-brand/35 xl:block" />
            <div className="relative h-full overflow-hidden rounded-[12px]">
              <img
                src="/images/destination-paris.webp"
                alt="La tour Eiffel encadrée de feuillages rouges d'automne"
                loading="lazy"
                className="h-full w-full object-cover object-[50%_38%] transition-transform duration-[1.4s] ease-out hover:scale-[1.05]"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
