// Landing page Eiden Visa   projet Vite autonome, séparé de l'app (TanStack Start à la racine).
// Aucun import depuis ../src : ce dossier doit pouvoir être déplacé ou déployé seul.
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { defineConfig, type Plugin } from "vite";

// `.env` local (jamais commité) ; sur Vercel, les variables viennent de l'environnement.
dotenv.config();

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

export default defineConfig({
  plugins: [react(), tailwindcss(), balisesVerification()],
  // Port distinct de l'app (3000) pour lancer les deux en parallèle.
  server: { port: 5180 },
  preview: { port: 5181 },
});
