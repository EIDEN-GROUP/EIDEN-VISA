import { motion, useScroll, useTransform } from "framer-motion";
import { CirclePlay } from "lucide-react";
import { useRef } from "react";
import { AnimatedButton } from "../components/buttons";
import { EiffelSketch, HeroStamp } from "../components/decor";
import { EASE_OUT, Reveal, ScriptReveal, SplitReveal } from "../components/motion";
import { HERO_ATOUTS, LIENS } from "../content";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const scriptY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const stampRotate = useTransform(scrollYProgress, [0, 1], [0, 75]);

  return (
    <section id="accueil" ref={ref} className="relative overflow-hidden">
      <EiffelSketch className="pointer-events-none absolute bottom-0 -left-6 hidden w-[170px] text-ink/[0.07] lg:block" />

      {/* Photo : en tête sur mobile, 62 % à droite sur desktop, fondue dans le crème. */}
      <div className="relative h-[500px] sm:h-[600px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[62%]">
        <motion.div
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE_OUT }}
          className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_58%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,#000_36%)]"
        >
          <motion.img
            src="/images/hero-voyageuse.webp"
            alt="Voyageuse souriante devant la tour Eiffel, à Paris"
            fetchPriority="high"
            style={{ y: imageY }}
            className="absolute inset-x-0 top-0 h-full w-full object-cover object-[50%_0%] lg:-top-[70px] lg:h-[calc(100%+70px)] lg:object-[50%_30%]"
          />
        </motion.div>

        <motion.div
          style={{ y: scriptY }}
          className="absolute top-[84px] right-4 sm:top-[104px] sm:right-10 lg:top-[150px] lg:right-[5.5%]"
        >
          <ScriptReveal
            lines={["Vos projets", "sans frontières"]}
            delay={1}
            className="block -rotate-[11deg] font-script text-[26px] leading-[1.2] text-ink sm:text-[36px] lg:text-[clamp(2.2rem,3.2vw,2.9rem)]"
            lineClassName="last:pl-[0.35em]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.92, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE_OUT, delay: 1.2 }}
          className="absolute right-[-30px] bottom-[30%] w-[170px] sm:w-[215px] lg:top-[69%] lg:right-[-37px] lg:bottom-auto lg:w-[250px]"
        >
          <HeroStamp rotate={stampRotate} className="h-auto w-full" />
        </motion.div>
      </div>

      <div className="container-page relative z-10 -mt-28 pb-12 sm:-mt-32 lg:mt-0 lg:pt-[184px] lg:pb-[46px] lg:pl-[4.25rem]">
        <div className="max-w-[640px] lg:max-w-[48%] xl:max-w-[650px]">
          <SplitReveal as="p" mode="chars" className="eyebrow text-muted">
            Simplifiez vos démarches
          </SplitReveal>
          <SplitReveal
            as="h1"
            delay={0.2}
            className="mt-4 font-serif text-[clamp(3.1rem,6.3vw,5.6rem)] leading-[0.98] tracking-[-0.015em] text-ink"
          >
            Le monde
            <br />
            vous attend.
          </SplitReveal>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.45}
            className="mt-6 max-w-[590px] text-[16px] leading-[1.65] text-muted sm:text-[17px]"
          >
            EIDEN Visa vous accompagne dans la préparation de votre dossier France-Visas, avec un
            accompagnement personnalisé et une expertise complète jusqu'à la prise de votre
            rendez-vous.
          </SplitReveal>

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <AnimatedButton href={LIENS.evaluer} fullMobile>
              Évaluer mon dossier
            </AnimatedButton>
            <AnimatedButton
              href={LIENS.methode}
              variant="light"
              arrow={false}
              fullMobile
              leading={<CirclePlay className="size-6" strokeWidth={1.8} />}
            >
              Voir comment ça marche
            </AnimatedButton>
          </div>

          <ul className="mt-9 grid grid-cols-3 gap-3 sm:gap-6">
            {HERO_ATOUTS.map(({ icon: Icon, lignes }, i) => (
              <Reveal
                as="li"
                key={lignes[0]}
                delay={0.5 + i * 0.1}
                y={20}
                className="flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3 sm:text-left"
              >
                <Icon className="size-7 shrink-0 text-ink" strokeWidth={1.5} />
                <span className="text-[12px] leading-[1.35] font-medium text-ink-soft sm:text-[13px]">
                  {lignes[0]}
                  <br />
                  {lignes[1]}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
