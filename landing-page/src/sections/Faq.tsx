import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { ArrowLink } from "../components/buttons";
import { EiffelSketch } from "../components/decor";
import { EASE_OUT, Reveal, SplitReveal } from "../components/motion";
import { FAQ } from "../content";
import { ScrollTrigger } from "../lib/gsap";

function Question({
  question,
  reponse,
  ouvert,
  basculer,
  delay,
}: {
  question: string;
  reponse: string;
  ouvert: boolean;
  basculer: () => void;
  delay: number;
}) {
  const id = useId();
  return (
    <Reveal delay={delay} y={28}>
      <div className="rounded-[10px] bg-card shadow-[0_10px_28px_-20px_rgb(20_20_40/0.35)] ring-1 ring-black/[0.03]">
        <h3>
          <button
            type="button"
            onClick={basculer}
            aria-expanded={ouvert}
            aria-controls={id}
            className="flex w-full items-center justify-between gap-4 rounded-[10px] px-5 py-3.5 text-left text-[15px] leading-[1.4] text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span>{question}</span>
            <motion.span
              animate={{ rotate: ouvert ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="shrink-0 text-ink"
            >
              <Plus className="size-[18px]" strokeWidth={2.3} />
            </motion.span>
          </button>
        </h3>
        <AnimatePresence initial={false}>
          {ouvert && (
            <motion.div
              id={id}
              role="region"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              // La page change de hauteur : on recale les déclencheurs GSAP en dessous.
              onAnimationComplete={() => ScrollTrigger.refresh()}
              className="overflow-hidden"
            >
              <p className="px-5 pb-4 text-[14px] leading-[1.65] text-muted">{reponse}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export function Faq() {
  const [ouverts, setOuverts] = useState<Set<number>>(new Set());
  const tousOuverts = ouverts.size === FAQ.length;
  const basculer = (i: number) =>
    setOuverts((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const colonnes = [FAQ.slice(0, 3), FAQ.slice(3)];
  const toutVoir = (
    <ArrowLink
      href="#faq"
      onClick={(e) => {
        e.preventDefault();
        setOuverts(tousOuverts ? new Set() : new Set(FAQ.map((_, i) => i)));
      }}
    >
      Voir toutes les questions
    </ArrowLink>
  );

  return (
    <section
      id="faq"
      aria-labelledby="faq-titre"
      className="relative scroll-mt-24 pt-16 pb-16 lg:pt-[46px] lg:pb-[74px]"
    >
      <EiffelSketch className="pointer-events-none absolute bottom-0 -left-4 hidden w-[180px] text-ink/[0.06] lg:block" />
      <div className="container-page relative">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <SplitReveal as="p" mode="chars" className="eyebrow text-muted">
            Questions fréquentes
          </SplitReveal>
          <div className="hidden lg:block">{toutVoir}</div>
        </div>

        <div className="mt-3 grid gap-6 lg:grid-cols-[150px_1fr] lg:gap-0">
          <SplitReveal
            as="h2"
            id="faq-titre"
            className="font-serif text-[clamp(2.7rem,3.8vw,3.4rem)] leading-none tracking-[-0.01em] text-ink"
          >
            FAQ
          </SplitReveal>
          <div className="grid gap-3 md:grid-cols-2 md:gap-x-10 lg:gap-x-12 lg:pt-5">
            {colonnes.map((col, c) => (
              <div key={c} className="flex flex-col gap-3">
                {col.map(({ question, reponse }, k) => {
                  const i = c * 3 + k;
                  return (
                    <Question
                      key={question}
                      question={question}
                      reponse={reponse}
                      ouvert={ouverts.has(i)}
                      basculer={() => basculer(i)}
                      delay={k * 0.08 + c * 0.12}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 lg:hidden">{toutVoir}</div>
      </div>
    </section>
  );
}
