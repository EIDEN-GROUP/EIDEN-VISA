// Landing page Eiden Visa   projet Vite autonome, séparé de l'app (TanStack Start à la racine).
// Aucun import depuis ../src : ce dossier doit pouvoir être déplacé ou déployé seul.
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { defineConfig, type Plugin } from "vite";

// `.env` local (jamais commité) ; sur Vercel, les variables viennent de l'environnement.
dotenv.config();

const racine = join(dirname(fileURLToPath(import.meta.url)));

/** Extrait le jeton seul si la balise entière a été collée par erreur. */
function jeton(valeur: string | undefined): string {
  const brut = (valeur ?? "").trim();
  if (!brut) return "";
  const contenu = brut.match(/content\s*=\s*"([^"]+)"/)?.[1];
  return (contenu ?? brut).trim();
}

/**
 * Balises de vérification Search Console / Bing Webmaster écrites dans le HTML
 * AU BUILD (`<!--VERIFICATION-METAS-->` dans `index.html`) : les vérificateurs
 * lisent le HTML brut sans exécuter le JS, donc l'injection au runtime
 * (`src/lib/suivi.ts`, gardée en secours) est invisible pour eux.
 * Absentes de l'environnement = rien n'est injecté, le build reste identique.
 */
function balisesVerification(): Plugin {
  return {
    name: "eiden-verification",
    transformIndexHtml(html: string) {
      const metas: string[] = [];
      const google = jeton(process.env.VITE_GOOGLE_SITE_VERIFICATION);
      const bing = jeton(process.env.VITE_BING_SITE_VERIFICATION);
      if (google) metas.push(`<meta name="google-site-verification" content="${google}" />`);
      if (bing) metas.push(`<meta name="msvalidate.01" content="${bing}" />`);
      if (metas.length === 0) return html;
      return html.replace("<!--VERIFICATION-METAS-->", metas.join("\n    "));
    },
  };
}

/** Questions visibles du bloc FAQ, extraites de `src/i18n/fr.ts`. */
function questionsVisibles(): { question: string; reponse: string }[] {
  const src = readFileSync(join(racine, "src/i18n/fr.ts"), "utf8");
  const debut = src.indexOf("questions: [");
  const fin = src.indexOf("\n    ],", debut);
  if (debut < 0 || fin < 0)
    throw new Error("[eiden-faq] tableau questions: introuvable dans fr.ts");
  const bloc = src.slice(debut, fin);
  const paires: { question: string; reponse: string }[] = [];
  const re = /question:\s*"((?:[^"\\]|\\.)*)"\s*,\s*reponse:\s*"((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bloc))) {
    if (m[1] === undefined || m[2] === undefined) continue;
    paires.push({ question: m[1], reponse: m[2] });
  }
  return paires;
}

/**
 * JSON-LD FAQ injecté au build depuis `faq.json` (source unique) : plus de FAQ
 * dupliquée dans `index.html`, le bloc est réécrit à chaque build.
 * Garde-fou : le build échoue si `faq.json` et les questions visibles
 * (`src/i18n/fr.ts`) divergent, sinon Google refuse le résultat enrichi FAQ.
 */
function jsonLdFaq(): Plugin {
  return {
    name: "eiden-faq-jsonld",
    transformIndexHtml(html: string) {
      const faq = JSON.parse(readFileSync(join(racine, "faq.json"), "utf8")) as {
        name: string;
        acceptedAnswer: { text: string };
      }[];

      // Garde-fou de synchronisation : le JSON-LD doit dire mot pour mot ce que
      // la page affiche, sinon Google ignore le résultat enrichi.
      const visibles = questionsVisibles();
      if (visibles.length !== faq.length) {
        throw new Error(
          `[eiden-faq] faq.json (${faq.length} questions) et src/i18n/fr.ts (${visibles.length}) divergent : ` +
            `recopie les questions visibles dans faq.json (ou régénère les deux).`,
        );
      }
      faq.forEach((q, i) => {
        const v = visibles[i]!;
        if (q.name !== v.question || q.acceptedAnswer.text !== v.reponse) {
          throw new Error(
            `[eiden-faq] question n°${i + 1} divergente entre faq.json et src/i18n/fr.ts : ` +
              `"${q.name}" vs "${v.question}"`,
          );
        }
      });

      const bloc = JSON.stringify(
        {
          "@type": "FAQPage",
          "@id": "https://visa.eiden-group.com/#faq",
          mainEntity: faq,
        },
        null,
        2,
      );
      const htmlAvecJsonLd = html.replace(
        /(<script type="application\/ld\+json" id="faq-jsonld">)[\s\S]*?(<\/script>)/,
        (_m, debut: string, fin: string) => `${debut}\n${bloc}\n        ${fin}`,
      );

      // Meme source : le texte de la FAQ est aussi injecte dans le contenu servi
      // (les crawlers sans JavaScript, les assistants IA, et le mode sans JS).
      const echapper = (t: string) =>
        t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const questions = faq
        .map(
          (q) =>
            `            <h3>${echapper(q.name)}</h3>\n            <p>${echapper(q.acceptedAnswer.text)}</p>`,
        )
        .join("\n");
      return htmlAvecJsonLd.replace("<!--FAQ-CONTENU-->", questions);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), balisesVerification(), jsonLdFaq()],
  // Port distinct de l'app (3000) pour lancer les deux en parallèle.
  server: { port: 5180 },
  preview: { port: 5181 },
});
