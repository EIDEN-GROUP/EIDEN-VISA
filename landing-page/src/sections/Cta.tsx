import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { AnimatedButton } from "../components/buttons";
import { ScriptReveal, SplitReveal } from "../components/motion";
import { LIENS } from "../content";
import { useLangue } from "../i18n";

export function Cta() {
  const { t } = useLangue();
  const ref = useRef<HTMLElement>(null);
  // Photo en parallaxe : elle se pose (zoom arrière) pendant que la section entre.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const photoScale = useTransform(scrollYProgress, [0, 0.6, 1], [1.26, 1.1, 1.14]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <section
      ref={ref}
      aria-labelledby="cta-titre"
      className="relative isolate flex flex-col overflow-hidden bg-[#0d0c0e] text-white lg:p-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 overflow-hidden motion-safe:[animation:eiden-film-settle_2.4s_var(--ease-brand)_both]"
      >
        <motion.img
          src="/images/world-1.png"
          alt=""
          loading="lazy"
          style={{ scale: photoScale, y: photoY }}
          className="h-full w-full object-cover"
        />
      </div>
      <span aria-hidden="true" className="cta-voile absolute inset-0 -z-10" />

      <div className="absolute end-5 top-8 sm:end-10 lg:end-[5.5%] lg:top-[34px]">
        <ScriptReveal
          lines={t.cta.script}
          delay={0.3}
          tilt={-13}
          className="block font-script text-[24px] leading-[1.25] text-white sm:text-[28px] lg:text-[clamp(1.6rem,2.2vw,2rem)]"
          lineClassName="[&:nth-child(2)]:ps-[0.4em] [&:nth-child(3)]:ps-[0.9em]"
        />
      </div>

      <div className="container-page relative flex min-h-[520px] items-end pt-44 pb-14 sm:min-h-[480px] lg:min-h-[467px] lg:items-center lg:py-14 lg:ps-[3.1rem]">
        <div className="max-w-[640px]">
          <SplitReveal as="p" mode="chars" className="eyebrow text-white/90">
            {t.cta.surtitre}
          </SplitReveal>
          <SplitReveal
            as="h2"
            id="cta-titre"
            className="mt-3 max-w-[570px] font-serif text-[clamp(2.2rem,3.4vw,3rem)] leading-[1.05] tracking-[-0.01em]"
          >
            {t.cta.titre}
          </SplitReveal>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.15}
            className="mt-3 text-[16px] leading-[1.6] text-white/85 sm:text-[17px]"
          >
            {t.cta.texte}
          </SplitReveal>
          <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
            <AnimatedButton href={LIENS.evaluer} fullMobile>
              {t.cta.evaluer}
            </AnimatedButton>
            <AnimatedButton href={LIENS.contact} variant="outline" arrow={false} fullMobile>
              {t.cta.contact}
            </AnimatedButton>
          </div>
        </div>
      </div>
    </section>
  );
}
