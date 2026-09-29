import { motion } from "framer-motion";
import { VerifiedStamp } from "../components/decor";
import { Reveal, SplitReveal } from "../components/motion";
import { AVANTAGES } from "../content";

export function Pourquoi() {
  return (
    <section
      id="services"
      aria-labelledby="services-titre"
      className="scroll-mt-24 pt-20 lg:pt-[86px]"
    >
      <div className="container-page">
        <div className="grid gap-5 lg:grid-cols-[1.12fr_1fr] lg:items-center lg:gap-10">
          <div>
            <SplitReveal as="p" mode="chars" className="eyebrow text-brand">
              Pourquoi Eiden <span className="whitespace-nowrap">Visa ?</span>
            </SplitReveal>
            <SplitReveal
              as="h2"
              id="services-titre"
              className="mt-4 max-w-[650px] font-serif text-[clamp(2.1rem,3.4vw,3.05rem)] leading-[1.06] tracking-[-0.01em] text-ink"
            >
              Un accompagnement complet pour votre visa France.
            </SplitReveal>
          </div>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.15}
            className="max-w-[560px] text-[16px] leading-[1.75] text-muted lg:pt-8"
          >
            Nous simplifions vos démarches et vous accompagnons à chaque étape, avec une expertise
            dédiée et un suivi personnalisé.
          </SplitReveal>
        </div>

        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:mt-[58px] lg:gap-6 xl:grid-cols-4">
          {AVANTAGES.map(({ icon: Icon, titre, texte, image, alt, position, tampon }, i) => (
            <Reveal key={titre} delay={i * 0.12} y={64} className="h-full">
              <motion.article
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="group flex h-full min-h-[400px] flex-col overflow-hidden rounded-[16px] bg-card shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-float)] lg:min-h-[414px]"
              >
                <div className="relative z-10 px-5 pt-5 xl:px-6 xl:pt-6">
                  <span className="grid size-[55px] place-items-center rounded-full bg-blush text-brand transition-transform duration-500 group-hover:-rotate-6">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-serif text-[24px] leading-[1.12] text-ink">{titre}</h3>
                  <p className="mt-2 text-[15px] leading-[1.55] text-muted">{texte}</p>
                </div>
                <div className="relative mt-auto h-[215px] overflow-hidden">
                  <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    style={{ objectPosition: position }}
                    className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.07]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-card to-transparent"
                  />
                  {tampon && (
                    <VerifiedStamp className="absolute bottom-[14%] left-[10%] -rotate-[9deg]" />
                  )}
                </div>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
