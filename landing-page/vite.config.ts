// Landing page Eiden Visa   projet Vite autonome, séparé de l'app (TanStack Start à la racine).
// Aucun import depuis ../src : ce dossier doit pouvoir être déplacé ou déployé seul.
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

/**
 * Carte mot-clé -> page (`public/mots-cles-map.csv`) : garde-fou de build.
 *
 * Les 286 formulations de `public/mots-cles.txt` (Google Trends : intérêt
 * relatif, pas un volume de recherche) sont conservées telles quelles et
 * chacune doit pointer vers une page RÉELLE du site. Le build échoue si :
 *  - une formulation n'a pas de cible, ou si la carte contient une ligne
 *    qui n'est plus dans `mots-cles.txt` ;
 *  - la page cible n'existe pas sur le disque ;
 *  - la page cible n'est pas dans `public/sitemap.xml`.
 * Sans ce garde-fou, la carte et le sitemap peuvent dériver l'un de l'autre.
 */
function planMotsCles(): Plugin {
  return {
    name: "eiden-plan-mots-cles",
    buildStart() {
      // Le fichier peut contenir la meme formulation plusieurs fois : on raisonne
      // sur les formulations uniques (une page cible par formulation).
      const mots = [
        ...new Set(
          readFileSync(join(racine, "public/mots-cles.txt"), "utf8")
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        ),
      ];

      const lignes = readFileSync(join(racine, "public/mots-cles-map.csv"), "utf8")
        .split("\n")
        .slice(1)
        .map((l) => l.trim())
        .filter(Boolean);

      /** Parseur CSV minimal (champs entre guillemets). */
      const champs = (ligne: string): string[] => {
        const out: string[] = [];
        let champ = "";
        let guillemet = false;
        for (const c of ligne) {
          if (c === '"') guillemet = !guillemet;
          else if (c === "," && !guillemet) {
            out.push(champ.trim());
            champ = "";
          } else champ += c;
        }
        out.push(champ.trim());
        return out;
      };

      const carte = new Map<string, string>();
      for (const ligne of lignes) {
        const [mot, , url] = champs(ligne);
        if (!mot || !url) throw new Error(`[eiden-plan] ligne invalide : ${ligne}`);
        if (carte.has(mot))
          throw new Error(`[eiden-plan] formulation en double dans la carte : ${mot}`);
        carte.set(mot, url);
      }

      const manquants = mots.filter((m) => !carte.has(m));
      if (manquants.length)
        throw new Error(
          `[eiden-plan] ${manquants.length} formulation(s) sans page cible : ${manquants.join(", ")}`,
        );

      const enTrop = [...carte.keys()].filter((m) => !mots.includes(m));
      if (enTrop.length)
        throw new Error(
          `[eiden-plan] ${enTrop.length} formulation(s) dans la carte mais absentes de mots-cles.txt : ${enTrop.join(", ")}`,
        );

      const sitemap = readFileSync(join(racine, "public/sitemap.xml"), "utf8");
      const urls = [...new Set(carte.values())];
      for (const url of urls) {
        const chemin =
          url === "/"
            ? join(racine, "index.html")
            : join(racine, "public", url.replace(/^\//, "").replace(/\/$/, ""), "index.html");
        if (!existsSync(chemin))
          throw new Error(`[eiden-plan] page cible absente pour ${url} : ${chemin}`);
        if (!sitemap.includes(`https://visa.eiden-group.com${url}`))
          throw new Error(`[eiden-plan] page cible absente du sitemap : ${url}`);
      }
    },
  };
}

/**
 * Sert les articles de blog statiques (`public/blog/<slug>/index.html`) sur leurs
 * URL réelles (`/blog/<slug>/`) au lieu de laisser le fallback SPA de Vite
 * (index.html React) afficher une page blanche. L'index `/blog` exact reste
 * géré par le composant React `BlogPage`.
 */
function servirArticlesBlog(): Plugin {
  return {
    name: "eiden-servir-blog",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        const m = url.match(/^\/blog\/([^?#]+)\/?$/);
        if (!m) return next();
        const slug = (m[1] ?? "").replace(/\/$/, "");
        // `/blog` exact est la page React : on ne touche pas.
        if (slug === "blog") return next();
        const fichier = join(racine, "public", "blog", slug, "index.html");
        if (existsSync(fichier)) {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.statusCode = 200;
          res.end(readFileSync(fichier));
          return;
        }
        next();
      });
    },
  };
}

/** Sert la page services statique sur son URL propre pendant le développement. */
function servirPageServices(): Plugin {
  return {
    name: "eiden-servir-services",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!/^\/services\/?(?:[?#].*)?$/.test(req.url || "")) return next();
        const fichier = join(racine, "public", "services", "index.html");
        if (!existsSync(fichier)) return next();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.statusCode = 200;
        res.end(readFileSync(fichier));
      });
    },
  };
}

/** Écrit un HTML initial propre aux routes SPA afin que les robots sans JS
 * reçoivent titre, description, canonique et contenu utiles dès la réponse. */
function prerendreRoutesSeo(): Plugin {
  const routes = [
    {
      path: "conditions",
      title: "Conditions d’utilisation | EIDEN Visa",
      description:
        "Consultez les conditions des services d’accompagnement visa proposés par EIDEN Visa à Agadir, prestataire privé indépendant.",
      source: "conditions-content.ts",
      lead: "Accompagnement visa Schengen depuis le Maroc",
    },
    {
      path: "confidentialite",
      title: "Confidentialité | EIDEN Visa",
      description:
        "Comment EIDEN Visa collecte, utilise, conserve et protège vos données personnelles conformément à la loi marocaine 09-08.",
      source: "confidentialite-content.ts",
      lead: "Protection de vos données personnelles",
    },
    {
      path: "cookies",
      title: "Politique cookies | EIDEN Visa",
      description:
        "Découvrez les cookies utilisés sur le site EIDEN Visa et gérez vos préférences de consentement à tout moment.",
      source: "cookies-content.ts",
      lead: "Vos choix concernant les cookies",
    },
    {
      path: "securite",
      title: "Sécurité du site | EIDEN Visa",
      description:
        "Mesures de sécurité du site EIDEN Visa et moyens de signaler une vulnérabilité ou une tentative d’usurpation.",
      source: "securite-content.ts",
      lead: "Sécurité et signalement",
    },
  ];
  const pages = [
    ...routes.map((route) => {
      const source = readFileSync(join(racine, "src/pages", route.source), "utf8");
      const contenu = source.match(/export const html = `([\s\S]*?)`;?\s*$/)?.[1];
      if (!contenu) throw new Error(`[eiden-prerender] contenu introuvable: ${route.source}`);
      return {
        ...route,
        content: `<header><p><a href="/">Accueil</a> / ${route.title.replace(" | EIDEN Visa", "")}</p><h1>${route.title.replace(" | EIDEN Visa", "")}</h1><p>${route.lead}</p><p>Dernière mise à jour : 26 octobre 2026</p></header><article>${contenu}</article>`,
      };
    }),
    {
      path: "contact",
      title: "Contact EIDEN Visa à Agadir",
      description:
        "Contactez EIDEN Visa à Agadir pour un diagnostic gratuit et des informations sur la préparation administrative de votre dossier visa.",
      content: `<header><p><a href="/">Accueil</a> / Contact</p><h1>Contactez EIDEN Visa à Agadir</h1><p>Pour toute question sur nos services de préparation administrative de dossier visa, contactez notre équipe à Agadir.</p></header><main><h2>Coordonnées</h2><address>EIDEN SARL AU, Agadir Bay, Technopole 1, Bloc B, 1er étage, Bureau 101 B, Agadir, Maroc<br><a href="tel:+212777777428">+212 777 777 428</a><br><a href="mailto:visa@eiden-group.com">visa@eiden-group.com</a></address><h2>Envoyer une demande</h2><p>Utilisez le formulaire de contact pour nous indiquer votre demande. Le diagnostic initial est gratuit et sans engagement.</p><p>EIDEN Visa est un prestataire privé indépendant. Nous ne délivrons pas de visas et ne garantissons ni rendez-vous ni décision consulaire.</p></main>`,
    },
    {
      path: "blog",
      title: "Guides visa France et Schengen depuis le Maroc | EIDEN Visa",
      description:
        "Guides pratiques pour préparer un dossier visa depuis le Maroc, comprendre un refus et vérifier les démarches officielles.",
      content: `<header><p><a href="/">Accueil</a> / Blog</p><h1>Guides visa France et Schengen depuis le Maroc</h1><p>Des réponses pratiques sur les documents, les ressources, les refus et les démarches officielles. Les autorités compétentes restent seules décisionnaires des visas.</p></header><main><ul>${[
        [
          "dossier-visa-schengen-maroc-releve-bancaire",
          "Visa Schengen au Maroc : ressources et justificatifs",
          "Présenter ses ressources et construire un dossier cohérent.",
        ],
        [
          "refus-visa-schengen-maroc-motifs-recours",
          "Refus de visa Schengen : motifs et recours",
          "Lire la décision et vérifier les voies de recours applicables.",
        ],
        [
          "recruter-salarie-marocain-autorisation-travail",
          "Recruter un salarié marocain en France",
          "Repères sur l’autorisation de travail et les démarches employeur.",
        ],
        [
          "rendez-vous-tlscontact-bls-agadir-2026",
          "Visa Espagne à Agadir : consignes BLS",
          "Vérifier les consignes officielles et préparer sa demande.",
        ],
      ]
        .map(
          ([slug, title, summary]) =>
            `<li><h2><a href="/blog/${slug}/">${title}</a></h2><p>${summary}</p></li>`,
        )
        .join("")}</ul></main>`,
    },
  ];

  return {
    name: "eiden-prerender-seo-routes",
    closeBundle() {
      const dist = join(racine, "dist");
      const base = readFileSync(join(dist, "index.html"), "utf8");
      for (const page of pages) {
        const canonical = `https://visa.eiden-group.com/${page.path}`;
        const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        let html = base
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)}</title>`)
          .replace(
            /<meta\s+name="description"[^>]*>/,
            `<meta name="description" content="${escape(page.description)}" />`,
          )
          .replace(/<link\s+rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}" />`)
          .replace(
            /<meta\s+property="og:url"[^>]*>/,
            `<meta property="og:url" content="${canonical}" />`,
          )
          .replace(
            /<meta\s+property="og:title"[^>]*>/,
            `<meta property="og:title" content="${escape(page.title)}" />`,
          )
          .replace(
            /<meta\s+property="og:description"[^>]*>/,
            `<meta property="og:description" content="${escape(page.description)}" />`,
          )
          .replace(
            /<meta\s+name="twitter:title"[^>]*>/,
            `<meta name="twitter:title" content="${escape(page.title)}" />`,
          )
          .replace(
            /<meta\s+name="twitter:description"[^>]*>/,
            `<meta name="twitter:description" content="${escape(page.description)}" />`,
          );
        html = html.replace(
          /<script type="application\/ld\+json" id="faq-jsonld">[\s\S]*?<\/script>/,
          "",
        );
        html = html.replace(
          /<!--EIDEN-SEO-START-->[\s\S]*?<!--EIDEN-SEO-END-->/,
          '<!--EIDEN-SEO-START--><div id="eiden-seo" lang="fr"><div class="eiden-seo-page">' +
            page.content +
            "</div></div><!--EIDEN-SEO-END-->",
        );
        html = html.replace("<head>", '<head>\n    <link rel="stylesheet" href="/legal.css" />');
        const destination = join(dist, page.path, "index.html");
        mkdirSync(join(dist, page.path), { recursive: true });
        writeFileSync(destination, html, "utf8");
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    balisesVerification(),
    jsonLdFaq(),
    planMotsCles(),
    servirPageServices(),
    servirArticlesBlog(),
    prerendreRoutesSeo(),
  ],
  // Port distinct de l'app (3000) pour lancer les deux en parallèle.
  server: { port: 5180 },
  preview: { port: 5181 },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: "motion-vendor",
              test: /node_modules[\\/](?:framer-motion|motion|motion-dom|motion-utils)[\\/]/,
              priority: 20,
            },
            {
              name: "animation-vendor",
              test: /node_modules[\\/](?:gsap|@gsap)[\\/]/,
              priority: 20,
            },
            { name: "vendor", test: /node_modules[\\/]/, priority: 0 },
          ],
        },
      },
    },
  },
});
