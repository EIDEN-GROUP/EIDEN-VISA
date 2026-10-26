import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function ServerErrorPage() {
  return (
    <div className="bg-cream font-sans text-ink">
      <main id="contenu" className="relative overflow-x-clip">
        <section className="relative isolate overflow-hidden bg-[#0d0c0e] text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0c0e] via-[#1a1820] to-[#0d0c0e]" />
          <div className="container-page relative flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="eyebrow text-white/70">
              Erreur 500
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 }} className="mt-4 font-serif text-[clamp(4rem,12vw,9rem)] leading-none tracking-tight">
              500
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }} className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-white/80">
              Une erreur serveur s'est produite. Reessayez dans quelques instants ou contactez-nous.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }} className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[14px] font-bold text-ink transition hover:bg-cream">
                Retour a l'accueil
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-[14px] font-bold text-white transition hover:bg-white/10">
                Nous contacter
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
