# Eiden Visa | Landing page

**FR :** site vitrine public d'Eiden Visa. Projet **autonome** (Vite + React 19 +
Tailwind v4 + lucide + Lenis + Framer Motion + GSAP), séparé du back-office qui vit à la
racine du dépôt (`src/`). Rien n'est partagé : ni dépendances, ni imports, ni build.
Travailler ici ne peut pas casser l'app.

**EN:** Eiden Visa public marketing site. **Standalone** project (Vite, React 19,
Tailwind v4, lucide, Lenis, Framer Motion, GSAP), separate from the back-office at the repo
root (`src/`). No shared dependencies, imports or build.

## Démarrer / Get started

```sh
cd landing-page
npm install
npm run dev        # http://localhost:5180
npm run build      # tsc --noEmit + vite build → dist/
npm run preview    # sert dist/ sur http://localhost:5181
```

## Où modifier / Where to edit

| Fichier                            | Contenu                                                                                                                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content.ts`                   | Données non textuelles : `LIENS` (cibles des boutons), `NAV`, icônes, images (`AVANTAGES`, `PACKS`, `AVATARS`). Packs sans prix.                                                               |
| `src/i18n/fr.ts`, `src/i18n/ar.ts` | Tous les textes FR et AR, même structure (vérifiée par `tsc`) : packs Standard, Essentiel, Global ; FAQ en 4 questions. `src/i18n/index.tsx` : langue, sens RTL.                               |
| `src/sections/*.tsx`               | Une section par fichier : Header, Hero, Destination (visa Schengen), Methode, Pourquoi, Packs, Temoignages, Faq, Cta.                                                                          |
| `src/components/motion.tsx`        | Animations : `Reveal` (Framer Motion), `SplitReveal` / `ScriptReveal` / `CountUp` (GSAP ; `CountUp` inutilisé tant que les packs n'ont pas de prix).                                           |
| `src/components/buttons.tsx`       | Boutons animés GSAP (apparition, effet magnétique, remplissage, flèche).                                                                                                                       |
| `src/components/decor.tsx`         | Logo, drapeau UE, tampons.                                                                                                                                                                     |
| `src/components/Loader.tsx`        | Écran d'ouverture : ciel au coucher du soleil (`loader-bg.png`) découpé par un avion (`loader-avion.webp`) qui le traverse de gauche à droite.                                                 |
| `src/lib/intro.ts`                 | Porte d'intro : les animations d'entrée du hero et du header attendent le passage de l'avion.                                                                                                  |
| `src/components/SmoothScroll.tsx`  | Défilement fluide Lenis synchronisé avec GSAP ScrollTrigger.                                                                                                                                   |
| `src/lib/gsap.ts`                  | Plugins GSAP + `replayOnScroll` (rejoue les animations en descendant **et** en remontant).                                                                                                     |
| `src/styles.css`                   | Tokens couleur/typo de la maquette (crème, marine, rouge `#ae0a1a`) ; tampons Schengen en filigrane (`.filigrane-rond` sur `main` : grand, mi-page à droite ; `.filigrane-rect` : bas de FAQ). |
| `index.html`                       | `<title>`, meta description, polices Google (Newsreader, DM Sans, La Belle Aurore, Playfair Display).                                                                                          |
| `public/images/`                   | Photos (webp) issues de cosmos.so ; `public/` : favicon, apple-touch-icon.                                                                                                                     |

## Animations

- **FR :** loader au chargement (ciel + marque, puis un avion traverse l'écran et découpe
  le ciel comme un rideau pour révéler la page ; le scroll est figé pendant le vol). Au
  scroll, chaque bloc, texte et bouton a une **entrée et une sortie visibles** dans les deux
  sens (`Reveal` et `replayOnScroll`) ; le hero s'efface en parallaxe, la photo du CTA
  se pose en parallaxe. Méthode : un avion vole en boucle d'étape en étape sur un fil
  en pointillés (GSAP MotionPath), pause hors écran. `prefers-reduced-motion` : pas de loader, pas de Lenis, textes
  affichés directement.
- **EN:** opening loader (sky + wordmark, then a plane flies across and cuts the sky like a
  curtain to reveal the page; scroll locked during the flight). On scroll, every block, text
  and button has a **visible entrance and exit** in both directions; the hero fades out with
  parallax, the CTA photo settles with parallax. Method: a plane loops from step to step along a
  dotted path (GSAP MotionPath), paused off-screen. `prefers-reduced-motion`: no loader, no
  Lenis, static text.

## Règles / Rules

- Ne jamais importer depuis `../src` (et l'app n'importe jamais d'ici) / never import across.
- Nouvelles dépendances → `landing-page/package.json` uniquement / deps stay here.
- Contenu métier aligné sur `SCOPE` (`src/lib/visa-rules.ts`) : Eiden monte le dossier,
  **le client dépose lui-même** (TLScontact/BLS), Eiden ne prend pas le rendez-vous ;
  santé et études hors périmètre. / Copy must match the app's business scope.
- Photos cosmos.so : droits à vérifier / remplacer par des visuels licenciés avant la prod.
  / Cosmos photos: check rights or replace with licensed images before production.
- Toute modification → mettre à jour le `README.md` racine (§20 Changelog + sections
  concernées), voir `AGENTS.md`. / Every change → root README changelog.
