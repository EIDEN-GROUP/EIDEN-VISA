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

| Fichier                                                                           | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content.ts`                                                                  | Données non textuelles : `LIENS` (cibles des boutons), `NAV`, icônes, images (`AVANTAGES`, `PACKS`, `AVATARS`). Packs sans prix. `CONTACT` : téléphone, e-mail et lien Google Maps `carte` (recherche de l'adresse, à remplacer par la fiche exacte de l'agence).                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `src/i18n/fr.ts`, `src/i18n/ar.ts`                                                | Tous les textes FR et AR, même structure (vérifiée par `tsc`) : packs Standard, Essentiel, Global ; FAQ en 4 questions ; `t.infos` : horaires et adresse de l'agence (barre du haut + pied de page) ; `t.demande.regions` / `villes` : villes de résidence. `src/i18n/index.tsx` : langue, sens RTL.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/sections/*.tsx`                                                              | Une section par fichier : Header, Topbar (barre marine au-dessus du header : téléphone, e-mail, horaires, adresse ; ligne fixe dès 1280 px, défilement en boucle en dessous, repliée dès que la page défile ; hauteur `--topbar-h` dans `styles.css`), Hero, Destination (visa Schengen), Methode, Pourquoi, Packs, Temoignages, Faq, Cta, Footer (compact, même style que la Topbar : marine, icônes dorées ; adresse complète cliquable vers la carte et horaires à gauche, téléphone et e-mail à droite dès 1280 px, puis un fin trait discret et les droits centrés ; `CONTACT` dans `content.ts`, textes `t.infos` ; ses marges de fin et l'espace au-dessus du téléphone sur mobile laissent le coin bas aux badges flottants). |
| `src/villes.ts`                                                                   | Villes de résidence de la demande rapide : `REGIONS_SUD` (Souss-Massa, Guelmim-Oued Noun, Laâyoune-Sakia El Hamra, Dakhla-Oued Ed-Dahab, Drâa-Tafilalet ; chef-lieu en tête, le reste trié selon la langue), sans choix « Autre ». Ajouter une ville = une clé ici + son nom dans `t.demande.villes` (`fr.ts` et `ar.ts`, vérifié par `tsc`).                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/components/motion.tsx`                                                       | Animations : `Reveal` (Framer Motion), `SplitReveal` / `ScriptReveal` / `CountUp` (GSAP ; `CountUp` inutilisé tant que les packs n'ont pas de prix).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/components/buttons.tsx`                                                      | Boutons animés GSAP (apparition, effet magnétique, remplissage, flèche).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `src/components/decor.tsx`                                                        | Logo (image `public/images/logo-eiden-visa.webp`, version couleur du header), drapeau UE, tampon « vérifié ». Tampons Schengen : `public/images/tampon-schengen-*.webp`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `src/components/Loader.tsx`                                                       | Écran d'ouverture : ciel au coucher du soleil (`loader-bg.png`) découpé par un avion (`loader-avion.webp`) qui le traverse de gauche à droite ; la marque affichée est le logo blanc `logo-eiden-visa-blanc.webp`, suivi du slogan.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `src/lib/intro.ts`                                                                | Porte d'intro : les animations d'entrée du hero et du header attendent le passage de l'avion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `src/components/DemandeRapide.tsx`                                                | Badges flottants (WhatsApp, « Demande rapide ») + popup en 3 étapes ; envoi = message WhatsApp pré-rempli **+ sauvegarde Supabase en arrière-plan** (`saveContact`, silencieuse en cas d'échec). `useDemande()` l'ouvre depuis n'importe quel CTA (`ouvrir({ pack })` pré-remplit « Pack souhaité »). Types de visa / pays Schengen / `PACK_IDS` : `content.ts` ; textes : `t.demande`. Champs obligatoires (nom, prénom, téléphone, type de visa, destination, ville) marqués d'un astérisque rouge (`Bloc` prop `requis`, texte lecteur d'écran `t.demande.requis`) ; e-mail, dates, pack restent « facultatif ».                                                                                                                   |
| `src/lib/supabase.ts`, `src/lib/save-contact.ts`                                  | Client Supabase navigateur (clé **anon** publique, INSERT seul via RLS + plafonds ; `null` si non configuré → WhatsApp seul) + `saveContact()` qui n'échoue jamais vers l'utilisateur. E-mail : complétion du domaine (`DOMAINES_EMAIL`, `suggestionsEmail`, pastilles sous le champ, textes `t.demande.suggestionsEmail`). Voir « Contacts » ci-dessous.                                                                                                                                                                                                                                                                                                                                                                             |
| `api/contacts-feed.ts`                                                            | Fonction serverless **GET `/api/contacts-feed`** : vérifie le header `X-API-Key` (`CONTACTS_FEED_API_KEY` serveur), lit `landing_contacts` avec la clé service_role et renvoie un tableau JSON nu — consommée par l'onglet Website Contacts du BMS, sans modification de code côté BMS.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `supabase/schema.sql`, `.env.example`                                             | Table `landing_contacts` + RLS (anon INSERT seul, lecture interdite) et modèle des variables (publiques `VITE_*` vs serveur sans préfixe).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/components/SmoothScroll.tsx`                                                 | Défilement fluide Lenis synchronisé avec GSAP ScrollTrigger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/lib/suivi.ts`                                                                | **Suivi 100 % consenti** : charge GTM / GA4 / Clarity / Bing UET **uniquement après « Tout accepter »** (`eiden-consentement-v1`, 12 mois) ; sans `VITE_*`, tout est dormant (événements en file dans `window.dataLayer`). Taxonomie GA4 : `page_view`, `select_content` (cta/lien/bouton/faq/langue), `generate_lead` (demande envoyée), `contact` (whatsapp/telephone/email), `consentement`. Écoute déléguée des clics (les accordéons FAQ sont exclus, suivis avec la question en libellé). GA4 direct = secours si pas de GTM (sinon double comptage) ; Consent Mode v2 (refus par défaut) pour le GA4 direct. / Fully consent-gated tracking (GTM/GA4/Clarity/Bing), dormant without IDs.                                       |
| `src/components/BandeauCookies.tsx`                                               | Bandeau FR/AR (bouton « Gérer mes cookies » du pied de page oublie le choix et recharge). / FR/AR consent banner; footer button resets the choice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `public/conditions.html`, `confidentialite.html`, `cookies.html`, `securite.html` | **Pages légales statiques** (FR, vraies mentions : EIDEN SARL AU, RC 62623 Agadir, ICE 003670867000027, loi 09-08/CNDP), liées depuis le pied de page ; **zéro requête externe** (polices système) donc aucun traceur ; JSON-LD `WebPage` + fil d'Ariane chacune. Modifier les dates « Dernière mise à jour » à chaque retouche. / Static legal pages (real company details, law 09-08), zero third-party requests, self JSON-LD.                                                                                                                                                                                                                                                                                                     |
| `public/robots.txt`, `sitemap.xml`, `llms.txt`                                    | `robots.txt` (tout autorisé + sitemap absolu), `sitemap.xml` (accueil + 4 pages légales), `llms.txt` (résumé pour assistants IA : GEO/AIO). Mettre à jour `lastmod` à chaque changement d'URL. / Crawl files + AI summary.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/lib/gsap.ts`                                                                 | Plugins GSAP + `replayOnScroll` (rejoue les animations en descendant **et** en remontant).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/styles.css`                                                                  | Tokens couleur/typo de la maquette (crème, marine, rouge `#ae0a1a`) ; tampons Schengen en filigrane (`.filigrane-rond` sur `main` : grand, mi-page à droite ; `.filigrane-hero` : gauche du hero ; `.filigrane-rect` : bas de FAQ).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `index.html`                                                                      | `<title>`, meta description FR/AR (`t.meta`, synchronisés au changement de langue par `src/i18n/index.tsx`), **canonical `https://visa.eiden-group.com/`**, Open Graph + Twitter (image `/images/cta-paris.webp` 2000×1500), géo-tags Agadir (MA-07), **JSON-LD Schema.org** (`Organization` + `WebSite` + `TravelAgency` + `FAQPage`), emplacements commentés pour les codes de vérification Google/Bing ; polices Google + préchargement des images du loader. / Title, FR/AR meta, canonical, OG/Twitter, geo-tags, Schema.org JSON-LD, commented-out verification slots.                                                                                                                                                          |
| `public/images/`                                                                  | Photos (webp) issues de cosmos.so ; `public/` : favicon, apple-touch-icon (avion blanc et traînée rouge du logo sur fond marine ; `favicon.ico` en 16/32/48 px, icône tactile 180 px, appelés avec `?v=2` dans `index.html` pour contourner le cache). Drapeaux des destinations : `public/images/flags/*.svg` (29 SVG 1:1, source flagcdn.com — voir Règles).                                                                                                                                                                                                                                                                                                                                                                        |

## Animations

- **FR :** loader au chargement (ciel + marque, puis un avion traverse l'écran et découpe
  le ciel comme un rideau pour révéler la page — de gauche à droite, **miroir de droite
  à gauche en arabe** ; le scroll est figé pendant le vol). La
  barre de défilement de la page reste masquée pendant le loader et jusqu'au premier
  défilement (classe `scroll-vu` sur `<html>`, posée par `App.tsx`). Au
  scroll, chaque bloc, texte et bouton a une **entrée et une sortie visibles** dans les deux
  sens (`Reveal` et `replayOnScroll`) ; le hero s'efface en parallaxe, la photo du CTA
  se pose en parallaxe. Méthode : un avion vole en boucle d'étape en étape sur un fil
  en pointillés (GSAP MotionPath), pause hors écran. `prefers-reduced-motion` : pas de loader, pas de Lenis, textes
  affichés directement.
- **EN:** opening loader (sky + wordmark, then a plane flies across and cuts the sky like a
  curtain to reveal the page — left to right, **mirrored right to left in Arabic**; scroll locked during the flight). The page scrollbar stays
  hidden during the loader and until the first scroll (`scroll-vu` class on `<html>`, set by
  `App.tsx`). On scroll, every block, text
  and button has a **visible entrance and exit** in both directions; the hero fades out with
  parallax, the CTA photo settles with parallax. Method: a plane loops from step to step along a
  dotted path (GSAP MotionPath), paused off-screen. `prefers-reduced-motion`: no loader, no
  Lenis, static text.

## Contacts (Supabase + flux BMS) / Contacts (Supabase + BMS feed)

**FR :** chaque « Demande rapide » envoyée est sauvegardée dans Supabase (table
`landing_contacts`, même contenu que le message WhatsApp + langue, URL et user-agent),
puis lisible depuis l'onglet Website Contacts du BMS — sans toucher au code du BMS
(config env uniquement, comme les autres sources `CONTACT_SOURCE_*`).

1. Créer un projet Supabase, exécuter `supabase/schema.sql` (SQL Editor) : RLS active,
   rôle `anon` en INSERT seul **avec plafonds de longueur** (aucune lecture navigateur
   possible ; rejouer le script après un `ALTER` si la table existe déjà).
2. Renseigner les variables (local : copier `.env.example` vers `.env` ; prod : dashboard
   Vercel) : navigateur `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` ; **serveur
   uniquement, sans préfixe `VITE_`** : `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` +
   `CONTACTS_FEED_API_KEY` (**≥ 32 caractères aléatoires**, `openssl rand -hex 32`,
   partagée avec le BMS ; en dessous le flux répond 503).
3. Déployer la landing (la fonction `api/contacts-feed.ts` part avec le site).
4. Côté BMS (server `.env`, pas de code) :
   `CONTACT_SOURCE_N_NAME=Eiden Visa Landing`,
   `CONTACT_SOURCE_N_ENDPOINT=https://<domaine-landing>/api/contacts-feed`,
   `CONTACT_SOURCE_N_API_KEY=<même valeur que CONTACTS_FEED_API_KEY>`.
   Le tableau BMS dérive ses colonnes de la première ligne ; sans Supabase configuré,
   l'envoi reste WhatsApp seul (dégradation gracieuse, aucun message d'erreur).

Contrat du flux (durci) : GET seul, clé comparée à temps constant, frein par IP
(best-effort en serverless), colonnes minimales (**sans** `page_url`/`user_agent`),
limite 100 (défaut 50), timeout amont 5 s, erreurs génériques (aucun oracle de
configuration). Champs bornés des deux côtés (`maxLength` UI + `save-contact.ts` +
`CHECK` SQL). Rétention 13 mois : requête fournie en bas de `schema.sql`
(service_role uniquement). Rotation de clé : changer des deux côtés
(Vercel landing + serveur BMS) puis redéployer.

**EN:** every quick request is saved to Supabase (`landing_contacts`, same content as the
WhatsApp message plus locale, URL and user-agent), then readable from the BMS Website
Contacts tab — no BMS code change (env-only config, like other `CONTACT_SOURCE_*`).
Run `supabase/schema.sql` (RLS on, `anon` INSERT-only, no browser reads), set browser
vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` and **server-only** vars
`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + `CONTACTS_FEED_API_KEY` (**≥ 32 random
chars**, `openssl rand -hex 32`, shared with the BMS; shorter keys make the feed
answer 503), deploy, then point a BMS `CONTACT_SOURCE_N_*` triple at
`https://<landing-domain>/api/contacts-feed`. Without Supabase configured, submit stays
WhatsApp-only (graceful, no error shown).

Feed contract (hardened): GET-only, timing-safe key compare, per-IP brake
(best-effort serverless), minimal columns (**no** `page_url`/`user_agent`), limit 100
(default 50), 5 s upstream timeout, generic errors. Length caps on both sides
(UI `maxLength` + `save-contact.ts` + SQL `CHECK`s). 13-month retention query at the
bottom of `schema.sql` (service_role only). Key rotation: change on both sides
(landing Vercel + BMS server), then redeploy.

## SEO / Suivi / Légal / SEO / Tracking / Legal

**FR :**

- **Référencement :** titre + description optimisés « visa Schengen Maroc / Agadir »
  (`t.meta` FR/AR), canonical absolu, OG/Twitter avec image, géo-tags, JSON-LD
  (valider après chaque retouche : https://search.google.com/test/rich-results et
  https://validator.schema.org). **La FAQ du JSON-LD doit rester mot pour mot identique
  aux textes visibles** (`src/i18n/fr.ts`) — vérifier avec `faq.json` + la procédure
  `M:\temp\opencode\checkjson.py`, sinon perte des résultats enrichis.
- **Suivi :** renseigner sur Vercel `VITE_GTM_ID` (recommandé : GA4 + Clarity + Bing se
  configurent **dans** le conteneur), sinon `VITE_GA4_ID` et/ou `VITE_CLARITY_ID`,
  `VITE_BING_UET_ID` (vide = dormant, rien ne part). Vérifier la réception : GTM Preview,
  GA4 temps réel, Clarity tableaux de bord, Bing UET Helper.
- **Propriété / audits :** coller les codes dans `index.html` (emplacements commentés) →
  Search Console, Bing Webmaster ; Semrush : vérification DNS ou fichier (aucune balise
  requise) ; PageSpeed : https://pagespeed.web.dev/ ; crawl Screaming Frog attendu : que
  des 200, sitemap soumise, aucun contenu mixte, images avec `alt`.
- **Légal :** pages statiques modifiables à la main ; consentement requis avant tout
  traceur ; mentions réelles EIDEN (RC, ICE, loi 09-08) déjà renseignées.

**EN:** keyword FR/AR title + description, absolute canonical, OG/Twitter, geo-tags,
Schema.org JSON-LD (keep the FAQ copy byte-identical to the visible text); tracking is
consent-gated and dormant without `VITE_*` IDs (GTM recommended as the single hub);
verify via Search Console, Bing Webmaster, Semrush, Rich Results test, Schema validator,
PageSpeed and a Screaming Frog crawl; legal pages are hand-edited static files with the
real EIDEN company details (law 09-08).

## Règles / Rules

- Ne jamais importer depuis `../src` (et l'app n'importe jamais d'ici) / never import across.
- Nouvelles dépendances → `landing-page/package.json` uniquement / deps stay here.
- Demande rapide : Études et Raisons médicales restent dans la liste (demande client) mais
  affichent une note d'orientation, car hors `SCOPE`. / Out-of-scope types show a note.
- Demande rapide : les labels des champs obligatoires portent un astérisque rouge (nom,
  prénom, téléphone, type de visa, destination, ville) ; les champs facultatifs (e-mail,
  dates, pack) gardent la mention « facultatif ». / Required-field labels show a red
  asterisk; optional fields keep the "facultatif" tag.
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
  validé à la relecture, oublié après un envoi réussi) — aucune donnée ne transite hors
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
