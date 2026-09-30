import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { AnimatedButton, ArrowLink } from "../components/buttons";
import { useDemande } from "../components/DemandeRapide";
import { Reveal, SplitReveal } from "../components/motion";
import { PACKS } from "../content";
import { useLangue } from "../i18n";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function Packs() {
  const { t } = useLangue();
  const ouvrirDemande = useDemande();

  return (
    <section id="packs" aria-labelledby="packs-titre" className="scroll-mt-24 pt-20 lg:pt-[62px]">
      <div className="container-page">
        <div className="grid gap-5 lg:grid-cols-[1.12fr_1fr] lg:items-center lg:gap-10 font-bold">
          <div>
            <SplitReveal as="p" mode="chars" className="eyebrow text-brand">
              {t.packs.surtitre}
            </SplitReveal>
            <SplitReveal
              as="h2"
              id="packs-titre"
              className="mt-4 max-w-[650px] font-serif text-[clamp(2.1rem,3.4vw,3.05rem)] leading-[1.06] tracking-[-0.01em] text-ink"
            >
              {t.packs.titre}
            </SplitReveal>
          </div>
          <div>
            <SplitReveal
              as="p"
              mode="lines"
              delay={0.15}
              className="max-w-[560px] text-[16px] leading-[1.75] text-muted lg:pt-8"
            >
              {t.packs.texte}
            </SplitReveal>
            <div className="flex justify-end">
              <ArrowLink href="#packs-grille" className="mt-9 lg:mt-12">
                {t.packs.comparer}
              </ArrowLink>
            </div>
          </div>
        </div>
        {/* Cartes « billet » : photo plein cadre, textes dans un panneau blanc en bas.
            Au survol (ou au focus clavier), le panneau s'ouvre sur le détail et le bouton.
            Écrans tactiles (pas de survol) : tout reste visible. */}
        <div
          id="packs-grille"
          className="mt-10 grid scroll-mt-28 gap-6 pt-3 md:grid-cols-3 md:gap-4 xl:gap-5"
        >
          {PACKS.map(({ id, image, position, vedette }, i) => {
            const { nom, texte, alt, inclus } = t.packs.offres[i]!;
            return (
              <Reveal key={image} delay={i * 0.12} y={64} className="h-full">
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className={`group relative isolate flex h-full min-h-[560px] flex-col justify-end overflow-hidden rounded-[24px] bg-ink shadow-[var(--shadow-soft)] transition-shadow duration-500 focus-within:shadow-[var(--shadow-float)] hover:shadow-[var(--shadow-float)] lg:min-h-[500px] ${
                    vedette ? "ring-2 ring-brand ring-offset-4 ring-offset-cream" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    style={{ objectPosition: position }}
                    className={`absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-[1.2s] ${EASE} group-hover:scale-[1.07]`}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-gradient-to-b from-black/25 via-transparent to-black/10"
                  />
                  {vedette && (
                    <span className="absolute start-4 top-4 rounded-full bg-brand px-4 py-1.5 text-[12.5px] font-bold text-white shadow-[0_8px_18px_-8px_rgb(174_10_26/0.7)]">
                      {t.packs.badge}
                    </span>
                  )}

                  <div className="m-2.5 rounded-[18px] bg-card p-5 font-bold shadow-[0_18px_40px_-24px_rgb(0_0_0/0.45)]">
                    <h3 className="text-[20px] font-bold tracking-[-0.01em] text-ink">{nom}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted">
                      {texte[0]}
                      <br />
                      {texte[1]}
                    </p>

                    <div
                      className={`grid grid-rows-[1fr] transition-[grid-template-rows] duration-700 ${EASE} [@media(hover:hover)]:grid-rows-[0fr] [@media(hover:hover)]:group-hover:grid-rows-[1fr] [@media(hover:hover)]:group-focus-within:grid-rows-[1fr]`}
                    >
                      <div
                        className={`overflow-hidden transition-[opacity,translate] duration-500 ${EASE} [@media(hover:hover)]:translate-y-3 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:delay-150 [@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100`}
                      >
                        <hr className="my-4 border-line" />
                        <ul className="space-y-2.5">
                          {inclus.map((ligne) => (
                            <li
                              key={ligne}
                              className="flex items-start gap-2.5 text-[12.5px] leading-[1.4] text-ink-soft/85 xl:text-[12px]"
                            >
                              <Check className="mt-px size-4 shrink-0 text-brand" strokeWidth={3} />
                              {ligne}
                            </li>
                          ))}
                        </ul>
                        <div className="pt-5">
                          <AnimatedButton
                            popup
                            onClick={() => ouvrirDemande({ pack: id })}
                            variant={vedette ? "primary" : "sand"}
                            size="md"
                            full
                            entrance={false}
                          >
                            {t.packs.choisir}
                          </AnimatedButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
