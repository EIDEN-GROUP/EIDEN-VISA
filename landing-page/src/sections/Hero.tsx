import { motion, useScroll, useTransform } from "framer-motion";
import { CirclePlay } from "lucide-react";
import { useRef } from "react";
import { AnimatedButton } from "../components/buttons";
import { HeroStamp } from "../components/decor";
import { EASE_OUT, Reveal, ScriptReveal, SplitReveal } from "../components/motion";
import { HERO_ICONES, LIENS } from "../content";
import { useLangue } from "../i18n";
import { useIntroPrete } from "../lib/intro";

export function Hero() {
  const { t } = useLangue();
  const ref = useRef<HTMLElement>(null);
  const pret = useIntroPrete();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scriptY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const stampRotate = useTransform(scrollYProgress, [0, 1], [0, 75]);
  // Sortie du hero : la photo glisse en parallaxe, le texte monte et s'efface.
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const texteY = useTransform(scrollYProgress, [0, 0.7], [0, -90]);
  const texteOpacity = useTransform(scrollYProgress, [0.1, 0.65], [1, 0]);

  return (
    <section
      id="accueil"
      ref={ref}
      className="relative isolate flex min-h-svh flex-col overflow-hidden lg:block"
    >
      <div className="relative min-h-[250px] flex-1 court:min-h-[150px] lg:absolute lg:inset-0">
        <div className="absolute inset-0 -z-20 overflow-hidden motion-safe:[animation:eiden-film-settle_2.4s_var(--ease-brand)_both]">
          <motion.div style={{ y: photoY, scale: photoScale }} className="h-full w-full">
            <img
              src="/images/hero-222.png"
              alt={t.hero.imageAlt}
              fetchPriority="high"
              className="hero-photo h-full w-full object-cover object-[86%_50%] lg:object-[70%_30%]"
            />
          </motion.div>
        </div>
        <span aria-hidden="true" className="hero-voile absolute inset-0 -z-10" />

        <motion.div
          style={{ y: scriptY }}
          className="absolute end-4 top-[86px] sm:end-10 sm:top-[108px] lg:end-[5.5%] lg:top-[150px]"
        >
          <ScriptReveal
            lines={t.hero.script}
            delay={1}
            tilt={-11}
            className="block font-script text-[26px] leading-[1.2] text-ink sm:text-[36px] lg:text-[clamp(2.2rem,3.2vw,2.9rem)]"
            lineClassName="last:ps-[0.35em]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={pret ? { opacity: 0.92, scale: 1 } : undefined}
          transition={{ duration: 1.2, ease: EASE_OUT, delay: 1.2 }}
          className="absolute -start-[26px] bottom-[24%] w-[150px] sm:w-[200px] lg:start-auto lg:-end-[37px] lg:top-[64%] lg:bottom-auto lg:w-[250px]"
        >
          <HeroStamp rotate={stampRotate} className="h-auto w-full" />
        </motion.div>
      </div>

      <div className="container-page relative z-10 -mt-14 pb-[calc(var(--carte-chevauche)+1.75rem)] lg:mt-0 lg:flex lg:min-h-svh lg:items-center lg:ps-[4.25rem] lg:pt-[92px] lg:pb-[calc(var(--carte-chevauche)+2.5rem)]">
        <motion.div
          style={{ y: texteY, opacity: texteOpacity }}
          className="max-w-[640px] lg:max-w-[48%] xl:max-w-[650px] font-semibold"
        >
          <SplitReveal as="p" mode="chars" className="eyebrow text-muted">
            {t.hero.surtitre}
          </SplitReveal>
          <SplitReveal
            as="h1"
            delay={0.2}
            className="mt-3 font-serif text-[clamp(2.9rem,6.3vw,5.6rem)] leading-[0.98] tracking-[-0.015em] text-ink sm:mt-4 court:text-[2.45rem]"
          >
            {t.hero.titre[0]}
            <br />
            {t.hero.titre[1]}
          </SplitReveal>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.45}
            className="mt-4 max-w-[590px] text-[15px] leading-[1.6] text-muted sm:mt-6 sm:text-[17px] sm:leading-[1.65] court:mt-3 court:text-[14px] court:leading-[1.5]"
          >
            {t.hero.texte}
          </SplitReveal>

          <div className="mt-6 flex flex-wrap items-center gap-2.5 sm:mt-8 sm:gap-4 court:mt-4">
            <AnimatedButton href={LIENS.evaluer} size="auto" fullMobile>
              {t.hero.evaluer}
            </AnimatedButton>
            <AnimatedButton
              href={LIENS.methode}
              variant="light"
              size="auto"
              arrow={false}
              fullMobile
              leading={<CirclePlay className="size-6" strokeWidth={1.8} />}
            >
              {t.hero.commentCaMarche}
            </AnimatedButton>
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-3 sm:mt-9 sm:gap-6 court:mt-4">
            {t.hero.atouts.map(([ligne1, ligne2], i) => {
              const Icon = HERO_ICONES[i]!;
              return (
                <Reveal
                  as="li"
                  key={ligne1}
                  delay={0.5 + i * 0.1}
                  y={20}
                  className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-start"
                >
                  <Icon className="size-7 shrink-0 text-ink" strokeWidth={2} />
                  <span className="text-[12px] leading-[1.35] font-bold text-ink-soft sm:text-[13px]">
                    {ligne1}
                    <br />
                    {ligne2}
                  </span>
                </Reveal>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
