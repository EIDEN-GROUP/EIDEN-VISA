import { motion } from "framer-motion";
import { EASE_OUT, Reveal, SplitReveal } from "../components/motion";
import { ETAPES } from "../content";

export function Methode() {
  return (
    <section
      id="methode"
      aria-labelledby="methode-titre"
      className="scroll-mt-24 pt-16 sm:pt-20 lg:pt-[58px]"
    >
      <div className="container-page text-center">
        <SplitReveal as="p" mode="chars" className="eyebrow text-muted">
          Notre méthode
        </SplitReveal>
        <SplitReveal
          as="h2"
          id="methode-titre"
          className="mx-auto mt-4 max-w-[820px] font-serif text-[clamp(1.75rem,2.6vw,2.35rem)] leading-[1.15] text-ink"
        >
          De votre projet à votre rendez-vous, étape par étape.
        </SplitReveal>

        <ol className="relative mt-12 grid grid-cols-2 gap-x-5 gap-y-11 sm:grid-cols-3 lg:mt-11 lg:grid-cols-6 lg:gap-x-4">
          {/* Fil reliant les pastilles : se trace à chaque passage à l'écran. */}
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ amount: 0.6 }}
            transition={{ duration: 1.6, ease: EASE_OUT }}
            className="absolute top-[27px] right-[8.33%] left-[8.33%] hidden h-px origin-left bg-[#ddd6cd] lg:block"
          />
          {ETAPES.map(({ icon: Icon, titre, texte }, i) => (
            <Reveal
              as="li"
              key={titre}
              delay={i * 0.1}
              y={36}
              className="relative flex flex-col items-center"
            >
              <motion.span
                whileHover={{ scale: 1.1, rotate: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 16 }}
                className="relative z-10 grid size-[55px] place-items-center rounded-full bg-sand text-brand shadow-[0_0_0_6px_var(--color-cream)]"
              >
                <Icon className="size-[22px]" />
              </motion.span>
              <span className="mt-4 font-serif text-[15px] text-brand [font-variant-numeric:oldstyle-nums]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-0.5 max-w-[150px] font-serif text-[18px] leading-[1.2] font-semibold text-ink">
                {titre}
              </h3>
              <p className="mt-2 max-w-[175px] text-[13.5px] leading-[1.55] text-muted">{texte}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
