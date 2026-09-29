import { LayoutGroup, motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";
import { IconButton } from "../components/buttons";
import { Reveal, SplitReveal } from "../components/motion";
import { TEMOIGNAGES } from "../content";

const N = TEMOIGNAGES.length;

export function Temoignages() {
  // Carrousel en rotation : le premier avis passe en fin de file (animation de layout).
  const [debut, setDebut] = useState(0);
  const ordre = TEMOIGNAGES.map((_, i) => TEMOIGNAGES[(debut + i) % N]!);

  return (
    <section
      id="temoignages"
      aria-labelledby="temoignages-titre"
      className="scroll-mt-24 pt-20 lg:pt-[64px]"
    >
      <div className="container-page grid gap-10 xl:grid-cols-[minmax(0,345px)_1fr] xl:gap-10">
        <div className="xl:pt-7">
          <SplitReveal as="p" mode="chars" className="eyebrow text-brand">
            Ils nous font confiance
          </SplitReveal>
          <SplitReveal
            as="h2"
            id="temoignages-titre"
            className="mt-4 max-w-[12.5ch] font-serif text-[clamp(2.1rem,3.2vw,2.9rem)] leading-[1.06] tracking-[-0.01em] text-ink"
          >
            Leur voyage commence ici.
          </SplitReveal>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.15}
            className="mt-4 max-w-[340px] text-[15.5px] leading-[1.65] text-muted"
          >
            Découvrez les témoignages de nos clients qui ont préparé leur visa France avec EIDEN.
          </SplitReveal>
        </div>

        <div className="min-w-0">
          <div className="flex justify-end gap-2.5">
            <IconButton
              direction="left"
              label="Témoignage précédent"
              onClick={() => setDebut((d) => (d + N - 1) % N)}
            />
            <IconButton
              direction="right"
              label="Témoignage suivant"
              onClick={() => setDebut((d) => (d + 1) % N)}
            />
          </div>

          <div className="-mx-4 mt-2 overflow-hidden px-4 pt-2 pb-5">
            <LayoutGroup>
              <ul className="flex gap-4 xl:gap-5" aria-live="polite">
                {ordre.map((t, i) => (
                  <motion.li
                    layout
                    key={t.nom}
                    transition={{ type: "spring", stiffness: 170, damping: 26 }}
                    style={{ zIndex: N - i }}
                    className="w-full shrink-0 sm:w-[calc(50%-8px)] lg:w-[calc((100%-32px)/3)] xl:w-[calc((100%-40px)/3)]"
                  >
                    <Reveal delay={i * 0.12} y={48} className="h-full">
                      <article className="flex h-full gap-4 rounded-[16px] bg-card p-5 shadow-[var(--shadow-soft)] xl:p-6">
                        <img
                          src={t.avatar}
                          alt=""
                          loading="lazy"
                          className="size-[52px] shrink-0 rounded-full object-cover object-top"
                        />
                        <div>
                          <div className="flex gap-1 text-brand" aria-label="Note : 5 sur 5">
                            {Array.from({ length: 5 }, (_, k) => (
                              <Star key={k} className="size-3.5 fill-current" strokeWidth={0} />
                            ))}
                          </div>
                          <blockquote className="mt-3 text-[13px] leading-[1.65] text-muted">
                            “{t.texte}”
                          </blockquote>
                          <p className="mt-4 text-[15px] font-bold text-ink">{t.nom}</p>
                          <p className="mt-0.5 text-[13.5px] text-muted">{t.visa}</p>
                        </div>
                      </article>
                    </Reveal>
                  </motion.li>
                ))}
              </ul>
            </LayoutGroup>
          </div>

          <div
            className="flex justify-center gap-1"
            role="tablist"
            aria-label="Choisir un témoignage"
          >
            {TEMOIGNAGES.map((t, i) => (
              <button
                key={t.nom}
                type="button"
                role="tab"
                aria-selected={debut === i}
                aria-label={`Témoignage de ${t.nom}`}
                onClick={() => setDebut(i)}
                className="grid size-6 place-items-center"
              >
                <motion.span
                  animate={{ scale: debut === i ? 1.15 : 1 }}
                  className={`block size-[10px] rounded-full border transition-colors duration-300 ${
                    debut === i ? "border-brand bg-brand" : "border-muted/60 bg-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
