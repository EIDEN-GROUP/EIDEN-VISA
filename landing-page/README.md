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

| Fichier                           | Contenu                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/content.ts`                  | Tous les textes : `LIENS` (cibles des boutons), `NAV`, `ETAPES`, `AVANTAGES`, `PACKS`, `TEMOIGNAGES`, `FAQ`.          |
| `src/sections/*.tsx`              | Une section par fichier : Header, Hero, Destination (visa Schengen), Methode, Pourquoi, Packs, Temoignages, Faq, Cta. |
| `src/components/motion.tsx`       | Animations : `Reveal` (Framer Motion), `SplitReveal` / `ScriptReveal` / `CountUp` (GSAP).                             |
| `src/components/buttons.tsx`      | Boutons animés GSAP (apparition, effet magnétique, remplissage, flèche).                                              |
| `src/components/decor.tsx`        | Logo, drapeau UE, tampons, croquis tour Eiffel.                                                                       |
| `src/components/SmoothScroll.tsx` | Défilement fluide Lenis synchronisé avec GSAP ScrollTrigger.                                                          |
| `src/lib/gsap.ts`                 | Plugins GSAP + `replayOnScroll` (rejoue les animations en descendant **et** en remontant).                            |
| `src/styles.css`                  | Tokens couleur/typo de la maquette (crème, marine, rouge `#ae0a1a`).                                                  |
| `index.html`                      | `<title>`, meta description, polices Google (Newsreader, DM Sans, La Belle Aurore, Playfair Display).                 |
| `public/images/`                  | Photos (webp) issues de cosmos.so ; `public/` : favicon, apple-touch-icon.                                            |

## Animations

- **FR :** chaque animation se rejoue à chaque passage à l'écran, dans les deux sens de
  scroll ; la remise à zéro se fait hors écran. `prefers-reduced-motion` est respecté
  (pas de Lenis, textes affichés directement).
- **EN:** every animation replays each time it enters the viewport, scrolling down or up;
  resets happen off-screen. `prefers-reduced-motion` is honoured (no Lenis, static text).

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
