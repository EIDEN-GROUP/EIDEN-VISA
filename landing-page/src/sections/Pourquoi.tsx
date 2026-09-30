import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal, SplitReveal } from "../components/motion";
import { AVANTAGES } from "../content";
import { useLangue } from "../i18n";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** En dessous de lg (1024 px), les cartes deviennent un carrousel. */
const MOBILE = "(max-width: 1023px)";

function useCarrousel() {
  const [actif, setActif] = useState(() => window.matchMedia(MOBILE).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE);
    const maj = () => setActif(mq.matches);
    mq.addEventListener("change", maj);
    return () => mq.removeEventListener("change", maj);
  }, []);
  return actif;
}

export function Pourquoi() {
  const { t } = useLangue();
  const carrousel = useCarrousel();
  const piste = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(0);

  // Carrousel : la carte la plus proche du centre est la carte ouverte.
  useEffect(() => {
    const el = piste.current;
    if (!carrousel || !el) return;
    let raf = 0;
    const maj = () => {
      raf = 0;
      const centre = el.getBoundingClientRect().left + el.clientWidth / 2;
      let meilleur = 0;
      let ecart = Infinity;
      [...el.children].forEach((carte, i) => {
        const r = carte.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - centre);
        if (d < ecart) {
          ecart = d;
          meilleur = i;
        }
      });
      setActif(meilleur);
    };
    const auScroll = () => {
      if (!raf) raf = requestAnimationFrame(maj);
    };
    maj();
    el.addEventListener("scroll", auScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", auScroll);
      cancelAnimationFrame(raf);
    };
  }, [carrousel]);

  const centrer = (i: number) =>
    piste.current?.children[i]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

  const cartes = AVANTAGES.map(({ image, position }, i) => {
    const { titre, texte, alt } = t.pourquoi.avantages[i]!;
    const ouverte = carrousel && i === actif;
    const carte = (
      <article
        tabIndex={0}
        data-actif={carrousel ? String(ouverte) : undefined}
        onClick={() => carrousel && !ouverte && centrer(i)}
        onFocus={() => carrousel && !ouverte && centrer(i)}
        className={`group relative h-full overflow-hidden rounded-[18px] shadow-[var(--shadow-soft)] outline-none transition-[scale,opacity,box-shadow] duration-500 ${EASE} hover:shadow-[var(--shadow-float)] focus-visible:ring-2 focus-visible:ring-brand max-lg:scale-[0.92] max-lg:opacity-75 max-lg:data-[actif=true]:scale-100 max-lg:data-[actif=true]:opacity-100`}
      >
        <img
          src={image}
          alt={alt}
          loading="lazy"
          style={{ objectPosition: position }}
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ${EASE} group-hover:scale-[1.06] group-data-[actif=true]:scale-[1.04]`}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5 transition-opacity duration-700 [@media(hover:hover)]:opacity-80 [@media(hover:hover)]:group-hover:opacity-100"
        />
        <div className="absolute inset-x-0 bottom-0 p-6 xl:p-7">
          <h3 className="font-serif text-[24px] leading-[1.12] text-white lg:text-[26px]">
            {titre}
          </h3>
          {/* Description : ouverte au survol (desktop) ou sur la carte centrée (carrousel). */}
          <div
            className={`grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ${EASE} group-data-[actif=true]:grid-rows-[1fr] lg:grid-rows-[1fr] lg:[@media(hover:hover)]:grid-rows-[0fr] lg:[@media(hover:hover)]:group-hover:grid-rows-[1fr] lg:[@media(hover:hover)]:group-focus-within:grid-rows-[1fr]`}
          >
            <p
              className={`translate-y-3 overflow-hidden text-[15px] leading-[1.55] text-white/85 opacity-0 transition-[opacity,translate] duration-700 ${EASE} group-data-[actif=true]:translate-y-0 group-data-[actif=true]:opacity-100 group-data-[actif=true]:delay-150 lg:translate-y-0 lg:opacity-100 lg:[@media(hover:hover)]:translate-y-3 lg:[@media(hover:hover)]:opacity-0 lg:[@media(hover:hover)]:group-hover:translate-y-0 lg:[@media(hover:hover)]:group-hover:opacity-100 lg:[@media(hover:hover)]:group-hover:delay-150 lg:[@media(hover:hover)]:group-focus-within:translate-y-0 lg:[@media(hover:hover)]:group-focus-within:opacity-100`}
            >
              <span className="block pt-2 lg:max-w-[340px]">{texte}</span>
            </p>
          </div>
        </div>
      </article>
    );
    return { cle: image, carte, titre };
  });

  // Desktop : chaque carte apparaît au scroll ; carrousel : la piste entière apparaît
  // (des cartes hors écran à l'horizontale ne doivent pas rester cachées).
  const enveloppe = (contenu: ReactNode) =>
    carrousel ? <Reveal y={48}>{contenu}</Reveal> : contenu;

  return (
    <section
      id="services"
      aria-labelledby="services-titre"
      className="scroll-mt-24 pt-20 lg:pt-[86px]"
    >
      <div className="container-page">
        <div className="grid gap-5 font-bold lg:grid-cols-[1.12fr_1fr] lg:items-center lg:gap-10">
          <div>
            <SplitReveal as="p" mode="chars" className="eyebrow text-brand">
              {t.pourquoi.surtitre}
            </SplitReveal>
            <SplitReveal
              as="h2"
              id="services-titre"
              className="mt-4 max-w-[650px] font-serif text-[clamp(2.1rem,3.4vw,3.05rem)] leading-[1.06] tracking-[-0.01em] text-ink"
            >
              {t.pourquoi.titre}
            </SplitReveal>
          </div>
          <SplitReveal
            as="p"
            mode="lines"
            delay={0.15}
            className="max-w-[560px] text-[16px] leading-[1.75] text-muted lg:pt-8"
          >
            {t.pourquoi.texte}
          </SplitReveal>
        </div>

        {/* Desktop : accordéon, la carte survolée s'élargit et révèle sa description.
            Mobile / tablette : carrousel pleine largeur à aimantation, la carte centrée
            est ouverte (même effet), les autres restent en retrait. */}
        {enveloppe(
          <div
            ref={piste}
            className="relative mt-11 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-[calc(50%+1.25rem-var(--carte)/2)] py-2 [--carte:min(78vw,380px)] [scrollbar-width:none] sm:-mx-8 sm:px-[calc(50%+2rem-var(--carte)/2)] sm:[--carte:min(58vw,440px)] lg:mx-0 lg:mt-[58px] lg:h-[460px] lg:snap-none lg:gap-5 lg:overflow-visible lg:px-0 lg:py-0 [&::-webkit-scrollbar]:hidden"
          >
            {cartes.map(({ cle, carte }, i) =>
              carrousel ? (
                <div key={cle} className="h-[440px] w-(--carte) shrink-0 snap-center sm:h-[480px]">
                  {carte}
                </div>
              ) : (
                <Reveal
                  key={cle}
                  delay={i * 0.12}
                  y={64}
                  className={`h-full min-w-0 flex-1 transition-[flex-grow] duration-700 ${EASE} hover:grow-[2.4] focus-within:grow-[2.4]`}
                >
                  {carte}
                </Reveal>
              ),
            )}
          </div>,
        )}

        {/* Points du carrousel : position courante, un toucher centre la carte. */}
        {carrousel && (
          <div className="mt-5 flex justify-center gap-2">
            {cartes.map(({ cle, titre }, i) => (
              <button
                key={cle}
                type="button"
                aria-label={titre}
                aria-current={i === actif ? "true" : undefined}
                onClick={() => centrer(i)}
                className="grid h-6 place-items-center px-0.5"
              >
                <span
                  className={`block h-2 rounded-full transition-[width,background-color] duration-500 ${EASE} ${
                    i === actif ? "w-7 bg-brand" : "w-2 bg-ink/20"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
