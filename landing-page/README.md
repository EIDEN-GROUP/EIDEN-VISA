# Eiden Visa | Landing page

**FR :** site vitrine public d'Eiden Visa. Projet **autonome** (Vite + React 19 +
Tailwind v4 + lucide + Lenis + Framer Motion + GSAP + HeroUI pour l'Avatar des témoignages), séparé du back-office qui vit à la
racine du dépôt (`src/`). Rien n'est partagé : ni dépendances, ni imports, ni build.
Travailler ici ne peut pas casser l'app.

**EN:** Eiden Visa public marketing site. **Standalone** project (Vite, React 19,
Tailwind v4, lucide, Lenis, Framer Motion, GSAP, HeroUI for the testimonials Avatar), separate from the back-office at the repo
root (`src/`). No shared dependencies, imports or build.

## Démarrer / Get started

```sh
cd landing-page
npm install
npm run dev        # http://localhost:5180
npm run build      # tsc --noEmit + vite build → dist/
npm run preview    # sert dist/ sur http://localhost:5181
npm run pagespeed -- https://visa.eiden-group.com/  # audits Google PSI mobile + desktop
```

## Où modifier / Where to edit

| Fichier                                                                                      | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content.ts`                                                                             | Données non textuelles : `LIENS` (cibles des boutons), `NAV` (ancres internes : accueil, visa, services, packs, FAQ) + `NAV_LIENS` (liens externes : Blog, Contact), icônes, images (`AVANTAGES`, `PACKS`). Packs sans prix. `CONTACT` : téléphone, e-mail et lien Google Maps `carte` (recherche de l'adresse, à remplacer par la fiche exacte du centre).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `src/i18n/fr.ts`, `src/i18n/ar.ts`                                                           | Tous les textes FR et AR, même structure (vérifiée par `tsc`) : packs Essentiel, Confort, Global (noms alignés sur le back-office, sans prix) ; témoignages `t.temoignages.avis` (2 avis FR - Radia, Younes ; 4 avis AR) ; popup de conversion `t.conversion` (après « Notre méthode » : commencer / WhatsApp) ; FAQ en 8 questions (dont TLScontact/BLS, synchronisée avec `index.html`, `faq.json`, `llms-full.txt`) ; `t.infos` : horaires et adresse du centre (barre du haut + pied de page) ; `t.demande.regions` / `villes` : villes de résidence. `src/i18n/index.tsx` : langue (choix mémorisé, sinon arabe si l'appareil est arabophone, sinon français), sens RTL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/sections/*.tsx`                                                                         | Une section par fichier : Header, Topbar (barre marine au-dessus du header : téléphone, e-mail, horaires, adresse ; ligne fixe dès 1280 px, défilement en boucle en dessous, repliée dès que la page défile ; hauteur `--topbar-h` dans `styles.css`), Hero, Destination (visa Schengen), Methode, Pourquoi, Packs, Temoignages (Avatar HeroUI + icône `User` lucide, sans photos ; mode FR : 2 avis FR + 4 avis AR, mode AR : 4 avis AR seuls), Faq, Cta, Footer (compact, même style que la Topbar : marine, icônes dorées ; adresse complète cliquable vers la carte et horaires à gauche, téléphone et e-mail à droite dès 1280 px, puis un fin trait discret et les droits centrés ; `CONTACT` dans `content.ts`, textes `t.infos` ; ses marges de fin et l'espace au-dessus du téléphone sur mobile laissent le coin bas aux badges flottants).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `src/villes.ts`                                                                              | Villes de résidence de la demande rapide : `REGIONS_SUD` (Souss-Massa, Guelmim-Oued Noun, Laâyoune-Sakia El Hamra, Dakhla-Oued Ed-Dahab, Drâa-Tafilalet ; chef-lieu en tête, le reste trié selon la langue), sans choix « Autre ». Ajouter une ville = une clé ici + son nom dans `t.demande.villes` (`fr.ts` et `ar.ts`, vérifié par `tsc`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/components/motion.tsx`                                                                  | Animations : `Reveal` (Framer Motion), `SplitReveal` / `ScriptReveal` / `CountUp` (GSAP ; `CountUp` inutilisé tant que les packs n'ont pas de prix).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/components/buttons.tsx`                                                                 | Boutons animés GSAP (apparition, effet magnétique, remplissage, flèche).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `src/components/decor.tsx`                                                                   | Logo (image `public/images/logo-eiden-visa.webp`, version couleur du header), drapeau UE, tampon « vérifié ». Tampons Schengen : `public/images/tampon-schengen-*.webp`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `src/components/Loader.tsx`                                                                  | Écran d'ouverture : ciel au coucher du soleil (`loader-bg.png`) découpé par un avion (`loader-avion.webp`) qui le traverse de gauche à droite ; la marque affichée est le logo blanc `logo-eiden-visa-blanc.webp`, suivi du slogan. **Interruptible** : un clic ou une touche met fin à l'intro immédiatement (le contenu est déjà en place). Le ciel monte en fondu (0,4 s) sur le contenu servi.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/App.tsx`                                                                                 | Montage **immédiat** de la landing : le contenu est dans le DOM dès la première frame (le loader n'est qu'un voile par-dessus) ; le bloc servi `#eiden-seo` est retiré du DOM à la fin de l'intro (un seul contenu indexable) ; `html.intro-en-cours` verrouille le défilement pendant l'intro. |
| `src/lib/intro.ts`                                                                           | Porte d'intro : les animations d'entrée du hero et du header attendent le passage de l'avion (l'app est montée avant, ses animations restent en attente).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/components/DemandeRapide.tsx` | Three-step « Demande rapide » form. Final submit requires an e-mail, calls `/api/contact`, and proceeds to the success screen/WhatsApp only after the server saves and sends both e-mails; failures stay visible for retry. / Three-step quick dossier form; requires email and reports delivery failures before allowing success. |
| `src/components/PopupConversion.tsx`, `src/lib/popup-conversion.ts`                          | Dialogue modal centré après « Notre méthode » (carte `.demande-carte`, boutons `AnimatedButton`, tiroir bas sur mobile comme la demande rapide) : `IntersectionObserver` sur `#methode` (bas dépassé, une fois), `sessionStorage` (vue/action/envoyée), Échap/clic dehors/Tab verrouillé, focus restauré, défilement figé ; actions = `ouvrirDemande()` et WhatsApp (`LIENS.whatsapp`), suivi `select_content` (`cta`/`bouton`, section `conversion`) ; textes `t.conversion` FR+AR. / Post-méthode centered modal (once per session, existing flows only).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/lib/supabase.ts`, `src/lib/save-contact.ts` | `saveContact()` posts to `/api/contact`; the server validates, saves to Supabase with its service key, and sends both SMTP emails. `supabase.ts` is not used by these forms. / `saveContact()` posts to the server endpoint; Supabase persistence and SMTP delivery stay server-side. |
| `api/contacts-feed.ts`                                                                       | Fonction serverless **GET `/api/contacts-feed`** : vérifie le header `X-API-Key` (`CONTACTS_FEED_API_KEY` serveur), lit `landing_contacts` avec la clé service_role et renvoie un tableau JSON nu consommée par l'onglet Website Contacts du BMS, sans modification de code côté BMS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `supabase/schema.sql`, `.env.example` | Table `landing_contacts`, RLS and length constraints (browser forms do not write directly); environment template separates public build values from server-only Supabase/SMTP credentials. / Contact submissions use the server endpoint and service key; SMTP secrets remain server-side. |
| `src/components/SmoothScroll.tsx`                                                            | Défilement fluide Lenis synchronisé avec GSAP ScrollTrigger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `src/lib/suivi.ts`                                                                           | **Suivi 100 % consenti** : charge GTM / GA4 / Clarity (paquet npm `@microsoft/clarity` en import dynamique → chunk séparé, `init()` + `consent()` explicite, conversions relayées en smart events) / Bing UET (objet UET + `pageLoad`) **uniquement selon les catégories acceptées** (voir modale ci-dessous) ; sans `VITE_*`, tout est dormant (événements en file dans `window.dataLayer`). Taxonomie GA4 (conforme aux règles de nommage : snake_case, ≤ 40 car., aucun nom réservé) : `page_view` (chargement + changement de langue, GA4 direct en `send_page_view: false`), `scroll` (paliers 25/50/75/90 %), `click_phone` / `click_whatsapp` / `click_email`, `contact_form_start` (première saisie), `contact_form_error` (`champ`), `contact_form_submit` (`destination`, `pack` à marquer clé), `appointment_request` (WhatsApp de l'écran de succès), `download` (prêt à l'emploi), `select_content` (cta/lien/bouton/faq/langue), `consentement` (`accepte`/`partiel`/`refuse` + détail). Écoute déléguée des clics (les accordéons FAQ sont exclus, suivis avec la question en libellé ; les liens `.pdf/.doc/.xls` et `[download]` partent en `download`). Consent Mode v2 poussé **à chaque choix** (`analytics_storage` ← statistiques, `functionality_storage` ← expérience, `ad_*` ← marketing) dans GTM, lier chaque balise à son type. Balises de vérification moteurs injectées au démarrage (`VITE_GOOGLE_SITE_VERIFICATION`, `VITE_BING_SITE_VERIFICATION`, sans consentement : pas des traceurs). / Fully consent-gated tracking per category, dormant without IDs. |
| `src/components/BandeauCookies.tsx`                                                          | Bandeau FR/AR : Tout accepter / **Personnaliser** / Tout refuser (+ page cookies). / FR/AR consent banner with customize option.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `src/components/PreferencesCookies.tsx`                                                      | **Modale de préférences** (événement `eiden:preferences-cookies`, ouverte depuis le bandeau ou « Gérer mes cookies ») : 4 lignes Nécessaires (verrouillé), Mesure d'audience, Expérience (Clarity), Marketing (Bing) avec interrupteurs `role=switch`, Échap + focus gérés. Sauvegarde = `choisirPreferences()` (`eiden-consentement-v1` v2, 12 mois ; l'ancien format accepter/refuser est migré à la lecture). **Habillage = popup « Demande rapide »** : même carte `.demande-carte` (crème, tampons Schengen en filigrane, 28 px, tiroir bas avec poignée en mobile), titre Newsreader, croix `X` qui pivote, lignes séparées par un filet (titres serif, « Toujours actif » en petites capitales rouges), pied collant avec trois boutons pilule (encre / rouge / contour), entrée animée (fondu + montée, coupée si mouvement réduit), zone de liste en `data-lenis-prevent`. / Per-category preferences modal, dressed like the quick-request popup (same card, serif title, hairline rows, pill buttons, entrance animation).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `public/404.html`, `public/500.html`                                                         | **Pages d'erreur** (base `legal.css` : topbar + vrai logo + footer ; `500.html` garde la tête de page des légales). **`404.html` = hero de la landing**, via son bloc `<style>` : illustration du bandeau final `world-1.webp` (preload) posée sur `body::before` à la place du tampon, fondue dans le crème par masque (à droite ≥ 1024 px, en bandeau au-dessus du texte en dessous, largeur pilotée par `--illus`), grand « 404 » Newsreader rouge, titre, ligne arabe, boutons pilule de la landing (rouge avec flèche + clair), bloc « Où aller ? » en surtitre + liens sous le filet, entrée animée coupée si mouvement réduit : `404.html` servie par Vercel avec un vrai statut 404 sans config, `500.html` = fallback 5xx avec jeton `::vercel:REQUEST_ID::`. `noindex` + hors sitemap toutes les deux. / Branded error pages (real 404 status, noindex, off-sitemap).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `public/site.webmanifest`, `public/images/icon-192.png`, `icon-512.png`, `public/humans.txt` | Manifeste PWA (nom FR, couleurs crème, icônes redimensionnées depuis `apple-touch-icon.png` refaire en natif 512 si le logo source évolue) + `humans.txt` (équipe, stack, crédits). `index.html` lie le manifeste et porte un `<noscript>` FR/AR (sinon loader figé sans JS). / PWA manifest + humans.txt + noscript fallback.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `vercel.json` (landing)                                                                      | Cache immutable 1 an sur `/images/*`, `/fonts/*`, favicons (renommer le fichier à chaque remplacement, sinon stale) + en-têtes `nosniff`, `Referrer-Policy`, `Permissions-Policy` minimaux. **Volontairement sans** `X-Frame-Options`/CSP : le premier casserait l'aperçu GTM (iframe), la seconde risquerait de couper GTM/Clarity/Supabase. / Immutable caching + minimal security headers (no frame blocking, no CSP would break GTM Preview).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| src/pages/*Page.tsx, *content.ts, LegalPage.tsx, styles.css | Pages légales servies par les routes React /conditions, /confidentialite, /cookies, /securite. Le contenu est dans les modules *-content.ts; mise en page éditoriale accessible, sommaire et date de mise à jour. Toute retouche du contenu doit rester cohérente avec les traitements et mesures réellement configurés. / Legal pages are served by React routes; copy lives in *-content.ts, with an accessible editorial layout, table of contents and last-updated date. Keep statements aligned with actual processing and security controls. |
| public/<page>/index.html, public/blog/<slug>/index.html | Pages visa/service et 4 articles sont servies comme HTML statique indexable. Les articles publics doivent rester synchronisés avec src/pages/articles/*.html (corps), Article*.tsx (métadonnées) et les dates/schema SEO ; legal.css porte leur présentation statique. / Keep public articles synced with their source HTML, route metadata and SEO dates/schema; legal.css styles their static layout. L’index /blog et les pages légales sont des routes React. / Visa and service pages plus four articles are served as indexable static HTML. Keep public articles in sync with src/pages/articles/*.html (body), Article*.tsx (metadata) and SEO dates/schema. The /blog index and legal pages are React routes. |
| `public/mots-cles-map.csv`                                                                                  | **Carte mot-clé → page** : une ligne par formulation unique de `mots-cles.txt` (`keyword,page,url,theme`). C'est le plan de contenu : chaque formulation Google Trends pointe vers une page réelle. Le plugin Vite `eiden-plan-mots-cles` **fait échouer le build** si une formulation n'a pas de cible, si la page cible n'existe pas sur le disque, ou si elle n'est pas dans `sitemap.xml`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `public/robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt`, `feed.xml`                  | `robots.txt` (tout autorisé + **règles `Allow` explicites par crawler IA** : GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, Bytespider, Applebot, Applebot-Extended, Amazonbot, Meta-ExternalAgent, Cohere-ai, Diffbot + sitemap absolu), `sitemap.xml` (accueil + 4 pages légales, `<image:image>` sur l'accueil), `llms.txt` (spec : H1, résumé en citation, mots-clés FR/AR, services, FAQ, prose, listes de liens absolus, `Optional`), `llms-full.txt` (contenu intégral + référentiel de mots-clés FR et AR), `feed.xml` (RSS 2.0 : résumé du site + FAQ, pour agrégateurs et assistants IA). Mettre à jour `lastmod` à chaque changement d'URL. / Crawl files + spec-compliant AI summary + RSS.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `public/llms-full.txt`, `public/.well-known/security.txt`                                    | `llms-full.txt` : contenu complet en un fichier (services, FAQ intégrale, mentions et droits résumés) ; `security.txt` (RFC 9116 : contact, expiration, langues). Vérifier leur présence dans `dist/` après le build (les dossiers en `.` sont copiés). / Full-content companion + RFC 9116 contact.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/lib/gsap.ts`                                                                            | Plugins GSAP + `replayOnScroll` (rejoue les animations en descendant **et** en remontant).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `src/styles.css`                                                                             | Tokens couleur/typo de la maquette (crème, marine, rouge `#ae0a1a`) ; tampons Schengen en filigrane (`.filigrane-rond` sur `main` : grand, mi-page à droite ; `.filigrane-hero` : gauche du hero ; `.filigrane-rect` : bas de FAQ).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `index.html`                                                                                 | `<title>`, meta description FR/AR (`t.meta`, synchronisés au changement de langue par `src/i18n/index.tsx`), **canonical `https://visa.eiden-group.com/`**, Open Graph + Twitter (image `/images/cta-paris.webp` 2000×1500), géo-tags Agadir (MA-07), **JSON-LD Schema.org** (`Organization` + `WebSite` + `ProfessionalService` + `FAQPage` + `HowTo` en 3 étapes calquées sur la demande rapide), emplacements commentés pour les codes de vérification Google/Bing ; **bloc `#eiden-seo` hors de `#root`** (React ne l'efface donc plus) et **visible par défaut** : c'est le premier paint, il ne part qu'à la fin de l'intro ; **`<head>` complet** : favicon + apple-touch-icon + `site.webmanifest`, `preconnect` Google Fonts, DM Sans et Newsreader auto-hébergées en WOFF2 ; polices arabes et décoratives Google non bloquantes, `preload` prioritaire du hero et preload du fond du loader sur desktop uniquement - **ne jamais retirer ce bloc** (la réécriture du JSON-LD l'a fait une fois : la landing retombait sur les polices système et perdait le LCP). / Title, FR/AR meta, canonical, OG/Twitter, geo-tags, Schema.org JSON-LD, commented-out verification slots; the head also carries the favicons, the manifest, self-hosted Latin fonts, non-blocking Google Arabic/decorative fonts, and targeted hero/desktop-loader image preloads.                                                                                                                                                                                                                                                                                                                        |
| `public/images/`                                                                             | Photos (webp) issues de cosmos.so ; `public/` : favicon, apple-touch-icon (avion blanc et traînée rouge du logo sur fond marine ; `favicon.ico` en 16/32/48 px, icône tactile 180 px, appelés avec `?v=2` dans `index.html` pour contourner le cache). Drapeaux des destinations : `public/images/flags/*.svg` (29 SVG 1:1, source flagcdn.com voir Règles). **Tous les visuels utilisés sont en webp** : PNG graphiques → webp sans perte (pixel-parfait, −91 à −95 %), JPG photos → webp haute fidélité vérifiée (PSNR ≥ 43 dB, visuellement identique) ; les jpg/png restants ne sont référencés nulle part (morts, à supprimer avant la prod). / Every used raster is webp (lossless for graphics, verified high-fidelity for photos); leftover jpg/png files are unreferenced.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

## Animations

- **FR :** loader au chargement (ciel + marque, puis un avion traverse l'écran et découpe
  le ciel comme un rideau pour révéler la page de gauche à droite, **miroir de droite
  à gauche en arabe** ; le scroll est figé pendant le vol). La
  barre de défilement de la page reste masquée pendant le loader et jusqu'au premier
  défilement (classe `scroll-vu` sur `<html>`, posée par `App.tsx`). Au
  scroll, chaque bloc, texte et bouton a une **entrée et une sortie visibles** dans les deux
  sens (`Reveal` et `replayOnScroll`) ; le hero s'efface en parallaxe, la photo du CTA
  se pose en parallaxe. Méthode : un avion vole en boucle d'étape en étape sur un fil
  en pointillés (GSAP MotionPath), pause hors écran. `prefers-reduced-motion` : pas de loader, pas de Lenis, textes
  affichés directement.
- **EN:** opening loader (sky + wordmark, then a plane flies across and cuts the sky like a
  curtain to reveal the page left to right, **mirrored right to left in Arabic**; scroll locked during the flight). The page scrollbar stays
  hidden during the loader and until the first scroll (`scroll-vu` class on `<html>`, set by
  `App.tsx`). On scroll, every block, text
  and button has a **visible entrance and exit** in both directions; the hero fades out with
  parallax, the CTA photo settles with parallax. Method: a plane loops from step to step along a
  dotted path (GSAP MotionPath), paused off-screen. `prefers-reduced-motion`: no loader, no
  Lenis, static text.

## Contacts (Supabase, Hostinger SMTP et flux BMS) / Contacts (Supabase, Hostinger SMTP and BMS feed)

**FR :** les deux formulaires, la page Contact et « Commencer mon dossier », appellent
`POST /api/contact`. La fonction valide et limite les envois, insère les coordonnées et
le récapitulatif dans `landing_contacts`, puis envoie en parallèle un e-mail soigné à
l’équipe et une confirmation adaptée en français ou en arabe à la personne. Pour le
parcours dossier, l’e-mail à l’équipe reprend les choix et le résumé lisible du formulaire.
L’adresse e-mail est obligatoire dans les deux formulaires. Si l’enregistrement ou l’envoi
échoue, aucun succès n’est annoncé ; la personne peut réessayer.

1. Créer un projet Supabase et exécuter `supabase/schema.sql`. La table garde RLS,
   contraintes de longueur et la politique de rétention de 13 mois. Le navigateur
   n’écrit plus directement dans cette table.
2. Configurer dans Vercel, côté serveur uniquement : `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` et
   `CONTACT_ADMIN_EMAIL`. Hostinger utilise par défaut `SMTP_HOST=smtp.hostinger.com`
   et `SMTP_PORT=465` (SSL) ; le port `587` (STARTTLS) est également accepté. Les
   identifiants SMTP ne doivent jamais porter le préfixe `VITE_`.
3. Déployer la landing ; `api/contact.ts` et `api/contacts-feed.ts` sont hébergés avec
   le site. Sans les variables SMTP, l’API répond indisponible et les formulaires
   signalent l’échec au lieu d’indiquer que le message est parti.
4. Pour le flux BMS, définir `CONTACTS_FEED_API_KEY` (32 caractères aléatoires ou plus,
   `openssl rand -hex 32`) dans Vercel, puis côté serveur BMS :
   `CONTACT_SOURCE_N_NAME=Eiden Visa Landing`,
   `CONTACT_SOURCE_N_ENDPOINT=https://<domaine-landing>/api/contacts-feed` et
   `CONTACT_SOURCE_N_API_KEY=<même valeur>`. Aucun changement de code BMS n’est requis.

**EN:** both the Contact page and “Commencer mon dossier” forms call `POST /api/contact`.
The server validates and rate-limits submissions, saves the details and summary to
`landing_contacts`, then sends a branded team notification and a French or Arabic visitor
confirmation. Dossier notifications include the readable form summary. Email is required
in both forms. Failed saves or sends are shown as errors so visitors can retry.

1. Create a Supabase project and run `supabase/schema.sql`. The table retains RLS,
   length constraints, and its 13-month retention policy; the browser no longer writes
   directly to it.
2. Set these Vercel server-only variables: `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and
   `CONTACT_ADMIN_EMAIL`. Hostinger defaults are `SMTP_HOST=smtp.hostinger.com` and
   `SMTP_PORT=465` (SSL); port `587` (STARTTLS) is also supported. Never expose SMTP
   credentials through `VITE_` variables.
3. Deploy the landing; `api/contact.ts` and `api/contacts-feed.ts` deploy with it. If
   SMTP variables are missing, the API reports unavailable and the forms show an error.
4. For the BMS feed, set `CONTACTS_FEED_API_KEY` in Vercel (32+ random characters,
   `openssl rand -hex 32`), then configure the BMS server’s `CONTACT_SOURCE_N_NAME`,
   `CONTACT_SOURCE_N_ENDPOINT=https://<landing-domain>/api/contacts-feed`, and matching
   `CONTACT_SOURCE_N_API_KEY`. No BMS code change is required.

Saisie Contact : le composant des champs est défini hors de la page afin de conserver le
focus après chaque frappe. Direction, indications de saisie et teinte du texte suivent la
langue sélectionnée. / Contact inputs use a stable component outside the page render so
focus stays in the field while typing; direction, placeholders, and text color follow the
selected language.

Flux BMS / BMS feed contract : GET seul, clé comparée à temps constant, frein par IP
(best-effort serverless), colonnes minimales, limite 100 (défaut 50), timeout amont 5 s
et erreurs génériques. Les champs restent bornés dans l’interface et en base. Rotation
de la clé : mettre à jour Vercel et le serveur BMS, puis redéployer. / The feed is GET-only,
uses a timing-safe key comparison, per-IP rate limit, minimal columns, 100-row cap
(default 50), 5-second upstream timeout and generic errors. Rotate the key on both sides,
then redeploy.

## SEO / Suivi / Légal / SEO / Tracking / Legal

**FR :**

- **Contenu servi (le point le plus important pour le référencement) :** la landing est une
  SPA React, mais le **HTML servi doit porter la page**. `index.html` contient donc un bloc  `#eiden-seo` (titre H1 « EIDEN Visa, accompagnement indépendant pour votre dossier visa à Agadir », sections méthode /
  packs / FAQ / contact, liens internes, pages de contenu et pages légales) qui est **le premier
  paint** (position fixe, hors de `#root` pour que `createRoot` ne l'efface pas) et **reste
  visible sans JavaScript** ; il est retiré du DOM à la fin de l'intro, quand l'app l'a
  remplacé. **L'app est montée immédiatement** (`App.tsx` ne conditionne plus `<main>` à la
  fin du loader) : pendant l'intro, le DOM contient donc le texte de la page - c'est la
  condition pour que Google, les assistants IA et les crawlers sans JavaScript indexent le
  contenu au lieu d'attendre l'animation. Le HTML servi passe ainsi de 197 caractères de texte visible à environ
  4 500 : c'est la condition pour que les moteurs, les assistants IA (robots.txt les autorise) et
  les crawlers sans JS indexent la page. **Ne pas supprimer ce bloc** (ni le `<noscript>`
  associé) ; le garder synchronisé avec `src/i18n/fr.ts` (mêmes textes que l'app).
- **Référencement :** titre + description optimisés « visa Schengen Maroc / Agadir »
  (`t.meta` FR/AR), canonical absolu, OG/Twitter avec image, géo-tags, JSON-LD
  (valider après chaque retouche : https://search.google.com/test/rich-results et
  https://validator.schema.org). **La FAQ du JSON-LD est générée au build** : `faq.json` est l'unique source, le plugin
  `eiden-faq-jsonld` (`vite.config.ts`) réécrit le bloc `#faq-jsonld` à chaque build ET
  **fait échouer le build** si `faq.json` et les questions visibles (`src/i18n/fr.ts`) divergent
  (sinon Google ignore le résultat enrichi). Le même bloc alimente le **texte servi** dans
  `index.html` (`<!--FAQ-CONTENU-->`) : les crawlers sans JavaScript et les assistants IA
  trouvent donc les 8 questions/réponses retenues. `faq.json` se régénère depuis
  `src/i18n/fr.ts`.
  **Intentions servies** (title, description, `llms.txt`, `llms-full.txt`, JSON-LD
  `knowsAbout`/`Service`, contenu visible) : visa Schengen Maroc, visa Schengen Agadir, visa
  France Maroc, visa Espagne Maroc, préparation administrative indépendante, accompagnement
  visa, pré-réservation hôtel et avion, assurance voyage, dossier visa Schengen, démarches
  officielles et EIDEN Visa (+ équivalents arabes dans `llms-full.txt`). Les noms TLScontact
  et BLS sont employés dans les guides qui expliquent les centres et portails officiels
  correspondants ; ils ne sont pas répétés dans les métadonnées globales. Pas de balise
  `meta keywords` ni de liste de requêtes sur la page d'accueil. **JSON-LD** : `Organization`, `WebSite`, `ProfessionalService`, `Service`
  (+ `OfferCatalog` sans prix affiché), `BreadcrumbList`, `HowTo` (3 étapes de la
  demande rapide), `FAQPage`, `WebPage`, `Brand`, `SocialMediaProfile` - pas
  d'`AggregateRating`, pas de prix en clair. **Signaux d'entité (requêtes de marque
  « eiden visa »)** : `sameAs` (groupe EIDEN GROUP, Instagram, WhatsApp, fiche Google
  Maps) + lien visible vers l'Instagram au pied de page (le profil Instagram alimente le
  knowledge panel Google) ;
  `identifier` (ICE / RC / forme juridique), `hasMap`, `brand`, `slogan`,
  `parentOrganization` (EIDEN GROUP), `alternateName` élargi (Eiden Visa, EIDEN Visa Agadir,
  visa eiden agadir...) et `knowsAbout` (13 sujets). **Le site vitrine est rattaché à
  `https://www.eiden-group.com/`** (site du groupe, qui ne mentionne pas la landing) : sans
  ce lien, une recherche « eiden visa » est attribuée au site du groupe plutôt qu'à la
  landing. Côté visible, le pied de page affiche « Une marque du groupe EIDEN GROUP » avec le
  lien.
  **Nom de site affiché par Google** (le libellé au-dessus de l'URL dans le résultat) :
  il doit être **« EIDEN Visa »**, pas « eiden group ». Google le déduit de l'entité du
  sous-domaine : `WebSite.name` = **la marque seule** (un nom long est tronqué),
  `Organization.name` / `ProfessionalService.name` = « EIDEN Visa », `<title>` et les titres des
  4 pages légales commencent par la marque, `og:site_name` = « EIDEN Visa », et le H1 rendu
  porte la marque. **`WebSite.publisher` reste le centre EIDEN Visa** : le lien avec EIDEN GROUP passe par
  `Organization.parentOrganization`, sinon Google nomme le site d'après la maison mère.
  Corrigé le 2026-10-19 (Google affichait « eiden group »). **Positionnement métier :** EIDEN Visa est un **prestataire privé indépendant d'accompagnement administratif pour les demandes de visa** à Agadir (Agadir Bay, Technopole 1) - **un seul établissement**, zone **Agadir +
  Souss-Massa** - et **pas** une agence de voyage ni un service d'immigration. Ce n'est pas une
  agence de voyage (aucun voyage, aucun circuit : l'hôtel et l'avion sont uniquement des
  pré-réservations **pour le dossier**) ni un service d'immigration (pas de représentation
  juridique, pas de promesse d'obtention : la décision appartient au consulat).
  **Ce que propose EIDEN :** la préparation administrative du dossier et l'orientation vers les
  démarches officielles. Le demandeur utilise lui-même le portail officiel pour demander son
  rendez-vous ; EIDEN ne réserve ni ne garantit de créneau. Aucun service ne garantit la
  délivrance du visa, décision qui relève des autorités consulaires. Le **premier rendez-vous (diagnostic)
  est gratuit** ; la **vérification document par document et le rassemblement des pièces sont
  payants** (service `verification`, inclus dans les packs). Le parcours affiché est celui du
  back-office (`src/lib/dossier-model.ts`, `ETAPES`) : réception et diagnostic -> dossier
  France-Visas (RCPC) -> orientation vers la procédure officielle de rendez-vous -> rassemblement -> vérification puis dossier scellé ->
  décision du consulat. **Packs :** Essentiel / Confort / Global (mêmes noms et mêmes contenus
  que `PACKS` côté back-office, **sans prix affiché** : le devis passe par la demande rapide).
  Le nom « Pack Standard / Pack Essentiel / Pack Global » et l'ordre des cartes ont été corrigés
  (ils ne correspondaient à aucun pack réel et divergeaient entre FR et AR).
  **FAQ :** 8 questions retenues (les plus rentables) en FR et en AR, servies dans le HTML
  et en JSON-LD.
  **Intentions de recherche :** les pages répondent aux besoins liés au visa France, à
  TLScontact/BLS, aux rendez-vous, à Agadir, aux motifs et aux documents. Les noms des
  opérateurs sont réservés aux guides pertinents, sans répétition dans les métadonnées
  globales. Aucun meta keywords n’est utilisé. `llms.txt` et `llms-full.txt` décrivent
  les services et leurs limites. **Contenu servi :** `index.html` porte un bloc `#eiden-seo` (H1 de marque,
  méthode, packs, FAQ, contact, liens) : la SPA est rendue côté client, mais le HTML brut doit
  contenir la page (197 caractères visibles avant, ~9 500 maintenant).
  Tête : `robots` étendu, `application-name`, `format-detection`,
  `alternate` RSS (`/feed.xml`), `preconnect` fonts/wa.me, `dns-prefetch` Supabase.  `hreflang` : une seule `alternate` en `x-default` (une seule URL sert les deux langues, la
| public/<page>/index.html, public/blog/<slug>/index.html | Pages visa/service et 4 articles sont servies comme HTML statique indexable. Les articles publics doivent rester synchronisés avec src/pages/articles/*.html (corps), Article*.tsx (métadonnées) et les dates/schema SEO ; legal.css porte leur présentation statique. / Keep public articles synced with their source HTML, route metadata and SEO dates/schema; legal.css styles their static layout. L’index /blog et les pages légales sont des routes React. / Visa and service pages plus four articles are served as indexable static HTML. Keep public articles in sync with src/pages/articles/*.html (body), Article*.tsx (metadata) and SEO dates/schema. The /blog index and legal pages are React routes. |
  pages visa + **3 pages de service** (/services/, /contact/, /entreprises/) + **5 pages
  de blog** (/blog/ index React + 4 articles HTML statiques). Total : 13 pages statiques indexables
  et l’index React du blog. Les articles comprennent des FAQ et des résumés arabes ; leurs métadonnées
  Article/WebPage/BreadcrumbList, canonical, Open Graph et Twitter sont synchronisées avec les pages
  publiques. Les conditions, la confidentialité, les cookies et la sécurité sont servis par les routes
  React et stylés dans src/styles.css. **Onglets du header :** NAV + NAV_LIENS (Blog, Contact).
  **Plan de contenu :** public/mots-cles-map.csv associe chaque formulation Google Trends (intérêt
  relatif, pas un volume de recherche) à une page réelle ; le build vérifie les cibles et le sitemap.
  Les 287 lignes de mots-cles.txt couvrent 284 formulations uniques ; la couverture est de 100 %
  (284/284 formulations uniques, 0 sans cible) après les 15 pages de contenu.
- **Suivi :** renseigner sur Vercel `VITE_GTM_ID` (recommandé : GA4 + Clarity + Bing se
  configurent **dans** le conteneur), sinon `VITE_GA4_ID` et/ou `VITE_CLARITY_ID`,
  `VITE_BING_UET_ID` (vide = dormant, rien ne part). Vérification de propriété :
  `VITE_GOOGLE_SITE_VERIFICATION` + `VITE_BING_SITE_VERIFICATION` (balises injectées au
  démarrage, hors consentement). Consentement par catégorie
  (statistiques / expérience / marketing) via le bandeau ou la modale, **modifiable à
  tout moment** (retirer une catégorie pousse aussitôt le refus aux traceurs) ; Consent
  Mode v2 à relier aux balises dans GTM. Côté GTM, créer des balises « GA4 Event »
  (déclencheur : événement personnalisé de même nom) pour `click_phone`,
  `click_whatsapp`, `click_email`, `contact_form_start`, `contact_form_error`,
  `contact_form_submit`, `appointment_request` mais PAS pour `page_view` / `scroll`
  (déjà couverts par le Google tag + Enhanced measurement, doublons garantis ; le
  `scroll` à 90 % existe aussi en version nue). Déclarer ensuite les paramètres en
  dimensions personnalisées (Admin > Custom definitions, portée Événement) :
  `destination`, `pack`, `profondeur`, `section`, `champ`, `langue`, `detection`. La dimension
  `langue` (fr/ar, jointe à chaque événement) donne le décompte FR vs AR :
  Explore > Users ou Events ventilés par `langue` (ex. `page_view`, `section_vue`,
  `contact_form_submit` par langue). Entonnoir popup (section `conversion`) :
  affichage (`select_content`) → `popup_commencer` (relayé en smart event Clarity)
  → `contact_form_start` → `contact_form_submit` ; fermetures en `select_content`
  (`Fermer (croix/echap/dehors)`) ; intérêt pack en `choisir-pack-<id>` (section
  `packs`) ; sections vues en `section_vue` (`methode/packs/temoignages/faq/cta`,
  une fois par langue) ; erreurs JS en `erreur_js` (temps réel/DebugView, sans dimension) ;
  **attribution de campagne** : UTM + `gclid`/`fbclid`/`msclkid` + référent lus au
  démarrage (`capturerAttribution`, conservés en session et poussés dans `page_view`) ;
  **événements e-commerce packs** : `view_item` (pack présenté à l'écran) et
  `select_item` (pack choisi) - à déclarer aussi en balises GA4 Event. Vérifier la réception : GTM
  Preview, GA4 temps réel (événement `consentement` : `accepte`/`partiel`/`refuse`), Clarity tableaux de bord,
  Bing UET Helper, puis tester chaque choix (tout accepter / partiel / tout refuser)
  dans l'onglet Réseau (aucun appel tiers en cas de refus).
- **Propriété / audits :** Search Console vérifie le domaine par DNS ou la page par balise HTML.
  Pour la balise, définir `VITE_GOOGLE_SITE_VERIFICATION` dans l'environnement de build Vercel,
  redéployer, puis cliquer sur Vérifier dans Search Console. Soumettre ensuite
  `https://visa.eiden-group.com/sitemap.xml`. PageSpeed Insights est un outil de mesure séparé :
  il ne s'installe pas dans Search Console et ses scores ne peuvent pas y être soumis manuellement.
- **Performance (PageSpeed) :** les images les plus lourdes ont des versions optimisées sous
  `public/images/optimized/` et les pages utilisent ces versions ; le hero est préchargé en priorité.
  DM Sans et Newsreader sont servis localement en WOFF2 ; les polices arabes et décoratives restent
  chargées sans bloquer le rendu. Le loader d'introduction est ignoré sur mobile et en réduction
  de mouvement, et son délai a été raccourci sur ordinateur. Les sections sous le hero sont séparées
  en chunks chargés en parallèle. Lancer `npm run pagespeed -- [URL]` audite mobile et desktop
  via l'API PageSpeed Insights ; définir `PAGESPEED_API_KEY` dans `.env` après avoir activé l'API
  PageSpeed Insights dans Google Cloud pour éviter les limites de requêtes. L'audit est un test
  ponctuel ; le rapport Core Web Vitals de Search Console utilise les données réelles des visiteurs.
- **Légal :** pages statiques modifiables à la main ; consentement requis avant tout
  traceur ; mentions réelles EIDEN (RC, ICE, loi 09-08) déjà renseignées.

**EN:** EIDEN Visa is an **independent private administrative support provider for visa applications** in Agadir (Agadir Bay,
Technopole 1) - a **single location** serving **Agadir + Souss-Massa** - and **not** a travel
agency nor an immigration service. It offers dossier preparation: the **first appointment
(diagnostic) is free**, the **document-by-document check and file assembly are paid**
(included in the packs). EIDEN explains the official appointment steps; applicants use the
official portal themselves to request a slot. EIDEN does not book or guarantee appointments,
and no service guarantees a visa; consular authorities decide applications. The displayed journey mirrors the back-office (`ETAPES`): reception
and diagnostic -> France-Visas file (RCPC) -> guidance on the official appointment process -> document assembly -> check and
contents as the back-office, **no prices shown**). Schema: `ProfessionalService` (not
`TravelAgency`), `areaServed` = Agadir + Souss-Massa.
**EN:** the served block is the first paint and the app is mounted immediately, so the text is
in the DOM from the first frame (the intro is a skippable overlay, not a gate on the content);
14 static indexable pages (7 visa pages + 3 service pages + 4 static blog articles), plus the React
/blog index. Articles include visible FAQs and Arabic summaries; Article/WebPage/BreadcrumbList,
canonical and Open Graph/Twitter metadata are kept in sync with the public HTML. Terms, Privacy,
Cookies and Security are React routes styled in src/styles.css. The keyword map validates targets
and sitemap coverage; all 284 unique phrases have a page target.

**EN:** FR/AR title + description, absolute canonical, OG/Twitter, geo-tags,
Schema.org JSON-LD (keep the FAQ copy byte-identical to the visible text); tracking is
consent-gated and dormant without `VITE_*` IDs (GTM recommended as the single hub);
verify via Search Console, Bing Webmaster, Semrush, Rich Results test, Schema validator,
PageSpeed and a Screaming Frog crawl; legal pages are React routes with copy in src/pages/*-content.ts and the
real EIDEN company details (Moroccan law 09-08).

**EN:** For Google Search Console HTML-tag verification, set `VITE_GOOGLE_SITE_VERIFICATION`
in the Vercel build environment, redeploy, then click Verify in Search Console. Submit
`https://visa.eiden-group.com/sitemap.xml` after verification. PageSpeed Insights is a separate
measurement service; it is not installed inside Search Console, and scores are not submitted there.
The heaviest images now have optimized versions under `public/images/optimized/`; the hero is
preloaded with high priority. DM Sans and Newsreader are served locally as WOFF2; Arabic and
decorative fonts remain non-blocking. The opening animation is skipped on mobile and when reduced
motion is enabled, and is shorter on desktop. Below-hero sections are split into chunks. Run
`npm run pagespeed -- [URL]` for mobile and desktop audits through the PageSpeed Insights API;
set `PAGESPEED_API_KEY` in `.env` after enabling that API in Google Cloud to avoid request limits.
This is a lab audit; Search Console's Core Web Vitals report uses real visitor data.

### Intentions SEO, GEO, AIO et AEO / Search intent and answer visibility

**FR :** Les expressions visa France et France visa, y compris « visa France Maroc », renvoient au guide `/visa-france-maroc/`. Les recherches TLScontact, TLS France et rendez-vous visa France renvoient à `/rendez-vous-tlscontact-agadir/`. Les variantes Agadir renvoient à `/visa-agadir/`. Les recherches visa Espagne Maroc et visa Maroc Espagne ciblent `/visa-espagne-maroc/`. Les recherches « rendez-vous visa Espagne » et TLS Espagne ciblent le guide de rendez-vous BLS. Les liens de source doivent rester visibles dans l’article ; aucune disponibilité ni délivrance de visa n’est promise.

Les titres, descriptions, H1, réponses visibles, données structurées, dates `lastmod` du sitemap et cibles de `mots-cles-map.csv` doivent rester cohérents. France : [France-Visas Maroc](https://www.france-visas.gouv.fr/en/maroc). Espagne à Agadir : [annonce officielle sur les rendez-vous BLS](https://www.exteriores.gob.es/Consulados/agadir/es/Comunicacion/Noticias/Paginas/Articulos/Informaci%C3%B3n-citas-y-entrega-Visados-Nacionales.aspx) et [FAQ officielle sur les rendez-vous](https://www.exteriores.gob.es/Embajadas/rabat/es/Embajada/Paginas/Preguntas-Frecuentes.aspx). Les positions ne sont pas garanties ; les suivre dans Search Console par requête et par URL avant d’élargir le contenu.

**EN:** France visa phrases, including “visa France Maroc”, target `/visa-france-maroc/`; TLScontact and appointment phrases target `/rendez-vous-tlscontact-agadir/`; Agadir variants target `/visa-agadir/`. Spain visa searches target `/visa-espagne-maroc/`; appointment-specific Spain/BLS searches target the appointment guide. Keep titles, descriptions, H1s, visible answers, structured data, sitemap `lastmod`, and keyword-map targets aligned. Ranking positions are not guaranteed; monitor Search Console by query and page before expanding.

## Règles / Rules

- Ne jamais importer depuis `../src` (et l'app n'importe jamais d'ici) / never import across.
- Nouvelles dépendances → `landing-page/package.json` uniquement / deps stay here.
- Demande rapide : Études et Raisons médicales restent dans la liste (demande client) mais
  affichent une note d'orientation, car hors `SCOPE`. / Out-of-scope types show a note.
- Demande rapide : les labels des champs obligatoires portent un astérisque rouge (nom,
  prénom, e-mail, téléphone, type de visa, destination, ville) sont obligatoires ; seules
  les dates et le pack restent facultatifs. / Required-field labels show a red asterisk;
  email is mandatory and only dates and pack stay optional.
- Contenu métier aligné sur `SCOPE` (`src/lib/visa-rules.ts`) : Eiden monte le dossier,
  **le client dépose lui-même** (TLScontact/BLS), Eiden ne prend pas le rendez-vous ;
  santé et études hors périmètre. / Copy must match the app's business scope.
- Photos cosmos.so : droits à vérifier / remplacer par des visuels licenciés avant la prod.
  / Cosmos photos: check rights or replace with licensed images before production.
- Toute modification → mettre à jour le `README.md` racine (§20 Changelog + sections
  concernées), voir `AGENTS.md`. / Every change → root README changelog.
- Secrets : la clé service_role et `CONTACTS_FEED_API_KEY` ne sont **jamais** préfixées
  `VITE_` (fonction `api/*` côté serveur uniquement) ; le navigateur ne voit que la clé
  anon en INSERT seul. / Secrets are never `VITE_`-prefixed; the browser only sees the
  INSERT-only anon key.
- Demande rapide : chaque destination affiche son **drapeau ondulant** (`OptionListe.drapeau`
  → `public/images/flags/`, vague via le filtre SVG partagé `#drapeau-vague` + reflet de
  plis, les autres sélecteurs gardent tuiles icône/code) ; le
  **brouillon est persisté** en `localStorage` (`eiden-demande-v1`, champs + étape,
  validé à la relecture, oublié après un envoi réussi) aucune donnée ne transite hors
  l'envoi WhatsApp/Supabase déjà existant. / Destination shows a waving flag per country;
  the draft persists in `localStorage` and is cleared after a successful send.
- CTA final : le français affiche `public/images/world-1.png`, l'arabe
  `world-1-ar.webp` (choix dans `Cta.tsx`). La version arabe est la même photo en miroir
  (monuments du côté opposé au texte) où le tampon Schengen et le mot « PASSPORT » ont été
  remis à l'endroit ; un simple miroir CSS inverserait ces textes. Si `world-1.png` change,
  refaire aussi `world-1-ar.webp`. / French uses `world-1.png`, Arabic a dedicated mirrored
  `world-1-ar.webp` whose stamp and "PASSPORT" lettering stay readable; regenerate it when
  the source photo changes.
- Demande rapide : « Ville de résidence » est une liste déroulante (même `Selecteur` que la
  destination) groupée par région du Sud (`OptionListe.groupe` → en-tête collant) ; seules
  les villes de `villes.ts` sont proposées, sans choix « Autre » (demande client). Le
  brouillon garde la clé de la ville ; Supabase reçoit toujours son **nom français**
  (colonne lisible côté BMS), le message WhatsApp son nom dans la langue de la page. / City
  of residence is a dropdown grouped by southern region, listed cities only (no "other"
  choice); Supabase always gets the French name.
- Suivi : **aucun traceur tiers sans acceptation cookies** (`src/lib/suivi.ts` + bandeau).
  Ajouter un événement = `suivreEvenement()` + ligne dans le tableau ci-dessus et dans la
  section SEO/Suivi. / No third-party tracker without cookie consent; new events go through
  `suivreEvenement()` and must be documented here.
- SEO : la FAQ du JSON-LD (`index.html`) reste **mot pour mot** identique à `fr.ts`
  (espaces insécables inclus) ; `sitemap.xml` (`lastmod`) et `llms.txt` suivent chaque
  changement d'URL ; les pages légales gardent **zéro requête externe**. / JSON-LD FAQ
  stays byte-identical to `fr.ts`; keep sitemap/llms.txt in sync; legal pages stay
  third-party-free.
- Pages légales : charte centralisée dans `public/legal.css` (tokens + fonts + topbar/footer)  
  retoucher la charte là, pas dans les 4 HTML ; polices **auto-hébergées** dans `public/fonts/`
  (woff2, OFL) : ne jamais pointer vers fonts.googleapis.com depuis ces pages ; rétention des
  demandes = **13 mois** (purge SQL), ne pas réécrire « 3 ans ». Les classes des HTML gardent
  leur nom d'origine (`.hero`, `.chip`, `.card`, `.alerte`, `.sommaire`) même si le rendu n'est
  plus une carte ; `404.html` et `500.html` utilisent la même feuille : les revérifier après
  toute retouche de `legal.css`. / Legal pages share `legal.css`; fonts are self-hosted, never
  Google-hosted; retention is 13 months; HTML class names are kept as-is, and the 404/500 pages
  use the same stylesheet, so recheck them after any change.
- Images : tout visuel utilisé est en **webp** (PNG → sans perte, JPG → fidélité vérifiée
  PSNR ≥ 43 dB) ; ne jamais réintroduire de jpg/png référencé. / All used visuals are
  webp; never reintroduce a referenced jpg/png.
- Pages statiques (`public/*.html`) : un seul motif signature, l'anneau d'étoiles UE
  (`.hero-tampon`, SVG inline, zéro requête) + le tampon « INTROUVABLE » réservé à la 404
  (`.tampon`, écho du `VerifiedStamp` de la landing) - le reste de la déco vit dans
  `legal.css`, jamais en ligne. Contenu légal intouchable sans relecture. / Static pages
  share one signature motif (EU-stars ring) plus the 404-only INTROUVABLE stamp; legal
  copy needs review before any edit.
- Articles statiques (`public/blog/*/index.html`) : mêmes coordonnées, horaires, liens
  juridiques et rattachement au groupe que le pied de page de la landing ; leurs titres
  utilisent `main.blog-article` pour éviter la grille de numérotation des clauses légales.
  Garder les quatre copies cohérentes avec `public/legal.css`. / Static blog articles share
  the landing footer details and use `main.blog-article` to keep plain headings out of the
  legal clause numbering grid. Keep all four copies aligned with `public/legal.css`.

## Blog et pages légales / Blog and legal pages

**FR :** Le blog et les pages Conditions, Confidentialité, Cookies et Sécurité sont des routes React dans src/App.tsx. En production et au serveur de développement, les quatre URL d’articles sont servies depuis public/blog/*/index.html ; garder ces fichiers alignés avec les corps sources dans src/pages/articles/*.html. Leurs titres et métadonnées React sont dans Article*.tsx, et le catalogue dans BlogPage.tsx. Les pages HTML d’article partagent public/legal.css et leur pied de page doit rester aligné avec Footer.tsx. Le contenu légal est dans *-content.ts; LegalPage.tsx et styles.css assurent la présentation éditoriale responsive. Les informations visa/travail renvoient aux sources officielles et distinguent l’accompagnement EIDEN de la décision des autorités. Mettre à jour la date affichée lors de chaque révision et relire les liens et ancres.

**EN:** The blog and the Terms, Privacy, Cookies and Security pages are React routes in src/App.tsx. In production and the dev server, the four article URLs are served from public/blog/*/index.html; keep these files aligned with the source bodies in src/pages/articles/*.html. React article titles and metadata live in Article*.tsx, and the catalogue in BlogPage.tsx. Static article pages share public/legal.css and their footer must stay aligned with Footer.tsx. Legal copy lives in *-content.ts; LegalPage.tsx and styles.css provide the responsive editorial layout. Visa and employment guidance links to official sources and distinguishes EIDEN support from decisions made by public authorities. Update the displayed revision date and recheck links and anchors with each edit.
## Navigation, services et contact / Navigation, services and contact

**FR :** La navigation publique suit cet ordre : Accueil, Services, Blog, Contact. La page indexable des services est `public/services/index.html`, servie directement en développement pour `/services/` par `vite.config.ts`. Elle décrit le diagnostic gratuit, les packs Essentiel/Confort/Global, les prestations à l’unité (vérification et rassemblement du dossier, aide au formulaire et orientation vers la procédure officielle de rendez-vous, pré-réservations, assurance voyage), le parcours et les limites du service. EIDEN ne réserve ni ne garantit un rendez-vous officiel ; le demandeur effectue lui-même sa démarche sur le portail officiel. Garder ses FAQ visibles synchronisées avec le JSON-LD, ses liens légaux sur les routes propres et toutes les images munies d’un texte alternatif. L’ancienne URL d’article `/rendez-vous-tlscontact-bls-agadir-2026/` redirige vers `/blog/rendez-vous-tlscontact-bls-agadir-2026/`. Le formulaire de Contact place les coordonnées et horaires à gauche, le formulaire à droite sur grand écran ; ses textes, direction et métadonnées suivent la langue choisie. Les pages 404 statique et React sont bilingues FR/AR, sans indexation, avec des liens vers l’accueil et les services ; leurs couleurs suivent les tokens crème, marine, rouge et blush de la charte.

**EN:** Public navigation is ordered Home, Services, Blog, Contact. The indexable services page is `public/services/index.html`, served directly for `/services/` in development by `vite.config.ts`. It explains the free diagnostic, Essentiel/Confort/Global packs, one-off services (file review and assembly, form guidance, official appointment-process guidance, provisional bookings, travel insurance), the process, and service limits. EIDEN does not book or guarantee an official appointment; applicants use the relevant official portal themselves. The legacy article URL `/rendez-vous-tlscontact-bls-agadir-2026/` redirects to `/blog/rendez-vous-tlscontact-bls-agadir-2026/`. Keep visible FAQs synchronized with JSON-LD, use clean legal routes, and give every image alternative text. On wide screens, the Contact page places contact details and hours on the left and the localized form on the right; text, direction, and metadata follow the selected language. Static and React 404 pages are bilingual FR/AR, noindex, link to home and services, and use the brand cream, navy, red and blush palette.
