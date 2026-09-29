import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AnimatedButton } from "../components/buttons";
import { ScriptReveal, SplitReveal } from "../components/motion";
import { LIENS } from "../content";

export function Cta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section
      ref={ref}
      aria-labelledby="cta-titre"
      className="relative isolate overflow-hidden bg-[#0d0c0e] text-white"
    >
      <motion.img
        src="/images/cta-paris.webp"
        alt=""
        loading="lazy"
        style={{ y: imageY }}
        className="absolute inset-x-0 -top-[60px] -z-20 h-[calc(100%+120px)] w-full -scale-x-100 object-cover object-[50%_45%] saturate-[1.3] contrast-[1.05]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0d0c0e_0%,rgb(13_12_14/0.9)_28%,rgb(13_12_14/0.45)_50%,rgb(13_12_14/0)_72%)] max-lg:bg-[linear-gradient(180deg,rgb(13_12_14/0.35)_0%,rgb(13_12_14/0.85)_45%,#0d0c0e_100%)]"
      />

      <div className="absolute top-8 right-5 sm:right-10 lg:top-[34px] lg:right-[5.5%]">
        <ScriptReveal
          lines={["De nouveaux", "horizons vous", "attendent !"]}
          delay={0.3}
          className="block -rotate-[13deg] font-script text-[24px] leading-[1.25] text-white sm:text-[28px] lg:text-[clamp(1.6rem,2.2vw,2rem)]"
          lineClassName="[&:nth-child(2)]:pl-[0.4em] [&:nth-child(3)]:pl-[0.9em]"
        />
      </div>

      <div className="container-page relative flex min-h-[520px] items-end pt-44 pb-14 sm:min-h-[480px] lg:min-h-[467px] lg:items-center lg:py-14 lg:pl-[3.1rem]">
        <div className="max-w-[640px]">
          <SplitReveal as="p" mode="chars" className="eyebrow text-white/90">
            Prêt pour votre prochain <span className="whitespace-nowrap">voyage ?</span>
          </SplitReveal>
          <SplitReveal
            as="h2"
            id="cta-titre"
            className="mt-3 max-w-[570px] font-serif text-[clamp(2.2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.01em]"
          >
            Commencez votre dossier dès maintenant.
          </SplitReveal>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.15}
            className="mt-3 text-[16px] leading-[1.6] text-white/85 sm:text-[17px]"
          >
            Un accompagnement sur mesure pour voyager en toute sérénité.
          </SplitReveal>
          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <AnimatedButton href={LIENS.evaluer} fullMobile>
              Évaluer mon dossier
            </AnimatedButton>
            <AnimatedButton href={LIENS.contact} variant="outline" arrow={false} fullMobile>
              Nous contacter
            </AnimatedButton>
          </div>
        </div>
      </div>
    </section>
  );
}
