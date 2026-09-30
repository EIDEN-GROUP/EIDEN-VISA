import { Reveal, SplitReveal } from "../components/motion";
import { AVANTAGES } from "../content";
import { useLangue } from "../i18n";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function Pourquoi() {
  const { t } = useLangue();

  return (
    <section
      id="services"
      aria-labelledby="services-titre"
      className="scroll-mt-24 pt-20 lg:pt-[86px]"
    >
      <div className="container-page">
        <div className="grid gap-5 lg:grid-cols-[1.12fr_1fr] lg:items-center lg:gap-10 font-bold">
          <div>
            <SplitReveal as="p" mode="chars" className="eyebrow text-brand">
              {t.pourquoi.surtitre}
            </SplitReveal>
            <SplitReveal
              as="h2"
              id="services-titre"
              className="mt-4 max-w-[650px] font-serif text-[clamp(2.1rem,3.4vw,3.05rem)] leading-[1.06] tracking-[-0.01em] text-ink"
            >
              {t.pourquoi.titre}
            </SplitReveal>
          </div>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.15}
            className="max-w-[560px] text-[16px] leading-[1.75] text-muted lg:pt-8"
          >
            {t.pourquoi.texte}
          </SplitReveal>
        </div>

        {/* Cartes accordéon : la carte survolée s'élargit (lg+) et révèle sa description.
            Sur écrans tactiles (pas de hover), la description reste visible. */}
        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:mt-[58px] lg:flex lg:h-[460px]">
          {AVANTAGES.map(({ image, position }, i) => {
            const { titre, texte, alt } = t.pourquoi.avantages[i]!;
            return (
              <Reveal
                key={image}
                delay={i * 0.12}
                y={64}
                className={`group h-[380px] sm:h-[420px] lg:h-full lg:min-w-0 lg:flex-1 lg:transition-[flex-grow] lg:duration-700 ${EASE} lg:hover:grow-[2.4] lg:focus-within:grow-[2.4]`}
              >
                <article
                  tabIndex={0}
                  className="relative h-full overflow-hidden rounded-[18px] shadow-[var(--shadow-soft)] outline-none transition-shadow duration-500 hover:shadow-[var(--shadow-float)] focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    style={{ objectPosition: position }}
                    className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ${EASE} group-hover:scale-[1.06]`}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5 transition-opacity duration-700 [@media(hover:hover)]:opacity-80 [@media(hover:hover)]:group-hover:opacity-100"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-6 xl:p-7">
                    <h3 className="font-serif text-[24px] leading-[1.12] text-white lg:text-[26px]">
                      {titre}
                    </h3>
                    <div
                      className={`grid grid-rows-[1fr] transition-[grid-template-rows] duration-700 ${EASE} [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-focus-within:grid-rows-[1fr]`}
                    >
                      <p
                        className={`overflow-hidden text-[15px] leading-[1.55] text-white/85 transition-[opacity,transform] duration-700 ${EASE} [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:delay-150 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100`}
                      >
                        <span className="block pt-2 lg:max-w-[340px]">{texte}</span>
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
