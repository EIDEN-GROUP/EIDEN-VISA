import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatedButton, ArrowLink } from "../components/buttons";
import { CountUp, Reveal, SplitReveal } from "../components/motion";
import { LIENS, PACKS } from "../content";

export function Packs() {
  return (
    <section id="packs" aria-labelledby="packs-titre" className="scroll-mt-24 pt-20 lg:pt-[62px]">
      <div className="container-page grid gap-12 xl:grid-cols-[minmax(0,345px)_1fr] xl:gap-10">
        <div className="xl:pt-5">
          <SplitReveal as="p" mode="chars" className="eyebrow text-brand">
            Nos packs
          </SplitReveal>
          <SplitReveal
            as="h2"
            id="packs-titre"
            className="mt-4 max-w-[400px] font-serif text-[clamp(2rem,2.7vw,2.45rem)] leading-[1.1] tracking-[-0.01em] text-ink"
          >
            Un accompagnement pour chaque projet.
          </SplitReveal>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.15}
            className="mt-4 max-w-[330px] text-[16px] leading-[1.65] text-muted"
          >
            Des solutions adaptées à vos besoins, du dossier simple à l'accompagnement complet.
          </SplitReveal>
          <ArrowLink href="#packs-grille" className="mt-9 lg:mt-12">
            Comparer les packs
          </ArrowLink>
        </div>

        <div
          id="packs-grille"
          className="grid scroll-mt-28 gap-8 pt-3 md:grid-cols-3 md:gap-4 xl:gap-5"
        >
          {PACKS.map(({ nom, texte, prix, image, alt, position, inclus, vedette }, i) => (
            <Reveal key={nom} delay={i * 0.12} y={64} className="h-full">
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className={`group relative flex h-full flex-col rounded-[16px] bg-card shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-float)] ${
                  vedette ? "ring-[1.5px] ring-brand" : ""
                }`}
              >
                {vedette && (
                  <span className="absolute -top-3.5 left-1 z-10 rounded-full bg-brand px-4 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_8px_18px_-8px_rgb(174_10_26/0.7)]">
                    Le plus choisi
                  </span>
                )}
                <div className="h-[110px] overflow-hidden rounded-t-[16px] md:h-[96px]">
                  <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    style={{ objectPosition: position }}
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.08]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[20px] font-bold tracking-[-0.01em] text-ink">{nom}</h3>
                  <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted">
                    {texte[0]}
                    <br />
                    {texte[1]}
                  </p>
                  <p className="mt-3 flex items-baseline gap-1.5 text-ink">
                    <CountUp
                      value={prix}
                      className="text-[31px] leading-none font-bold tracking-[-0.02em] tabular-nums"
                    />
                    <span className="text-[17px] font-bold">MAD</span>
                  </p>
                  <hr className="my-4 border-line" />
                  <ul className="space-y-2.5">
                    {inclus.map((ligne) => (
                      <li
                        key={ligne}
                        className="flex items-start gap-2.5 text-[12.5px] leading-[1.4] xl:text-[12px] text-ink-soft/85"
                      >
                        <Check className="mt-px size-4 shrink-0 text-brand" strokeWidth={2.6} />
                        {ligne}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <AnimatedButton
                      href={LIENS.commencer}
                      variant={vedette ? "primary" : "sand"}
                      size="md"
                      full
                    >
                      Choisir ce pack
                    </AnimatedButton>
                  </div>
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
