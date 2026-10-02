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

| Fichier                                          | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content.ts`                                 | Données non textuelles : `LIENS` (cibles des boutons), `NAV`, icônes, images (`AVANTAGES`, `PACKS`, `AVATARS`). Packs sans prix.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/i18n/fr.ts`, `src/i18n/ar.ts`               | Tous les textes FR et AR, même structure (vérifiée par `tsc`) : packs Standard, Essentiel, Global ; FAQ en 4 questions. `src/i18n/index.tsx` : langue, sens RTL.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/sections/*.tsx`                             | Une section par fichier : Header, Hero, Destination (visa Schengen), Methode, Pourquoi, Packs, Temoignages, Faq, Cta, Footer (téléphone / e-mail : `CONTACT` dans `content.ts`).                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/components/motion.tsx`                      | Animations : `Reveal` (Framer Motion), `SplitReveal` / `ScriptReveal` / `CountUp` (GSAP ; `CountUp` inutilisé tant que les packs n'ont pas de prix).                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `src/components/buttons.tsx`                     | Boutons animés GSAP (apparition, effet magnétique, remplissage, flèche).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `src/components/decor.tsx`                       | Logo, drapeau UE, tampon « vérifié ». Tampons Schengen : `public/images/tampon-schengen-*.webp`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `src/components/Loader.tsx`                      | Écran d'ouverture : ciel au coucher du soleil (`loader-bg.png`) découpé par un avion (`loader-avion.webp`) qui le traverse de gauche à droite.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `src/lib/intro.ts`                               | Porte d'intro : les animations d'entrée du hero et du header attendent le passage de l'avion.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `src/components/DemandeRapide.tsx`               | Badges flottants (WhatsApp, « Demande rapide ») + popup en 3 étapes ; envoi = message WhatsApp pré-rempli **+ sauvegarde Supabase en arrière-plan** (`saveContact`, silencieuse en cas d'échec). `useDemande()` l'ouvre depuis n'importe quel CTA (`ouvrir({ pack })` pré-remplit « Pack souhaité »). Types de visa / pays Schengen / `PACK_IDS` : `content.ts` ; textes : `t.demande`. Champs obligatoires (nom, prénom, téléphone, type de visa, destination, ville) marqués d'un astérisque rouge (`Bloc` prop `requis`, texte lecteur d'écran `t.demande.requis`) ; e-mail, dates, pack restent « facultatif ». |
| `src/lib/supabase.ts`, `src/lib/save-contact.ts` | Client Supabase navigateur (clé **anon** publique, INSERT seul via RLS ; `null` si non configuré → WhatsApp seul) + `saveContact()` qui n'échoue jamais vers l'utilisateur. Voir « Contacts » ci-dessous.                                                                                                                                                                                                                                                                                                                                                                                                           |
| `api/contacts-feed.ts`                           | Fonction serverless **GET `/api/contacts-feed`** : vérifie le header `X-API-Key` (`CONTACTS_FEED_API_KEY` serveur), lit `landing_contacts` avec la clé service_role et renvoie un tableau JSON nu — consommée par l'onglet Website Contacts du BMS, sans modification de code côté BMS.                                                                                                                                                                                                                                                                                                                             |
| `supabase/schema.sql`, `.env.example`            | Table `landing_contacts` + RLS (anon INSERT seul, lecture interdite) et modèle des variables (publiques `VITE_*` vs serveur sans préfixe).                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/components/SmoothScroll.tsx`                | Défilement fluide Lenis synchronisé avec GSAP ScrollTrigger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `src/lib/gsap.ts`                                | Plugins GSAP + `replayOnScroll` (rejoue les animations en descendant **et** en remontant).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `src/styles.css`                                 | Tokens couleur/typo de la maquette (crème, marine, rouge `#ae0a1a`) ; tampons Schengen en filigrane (`.filigrane-rond` sur `main` : grand, mi-page à droite ; `.filigrane-hero` : gauche du hero ; `.filigrane-rect` : bas de FAQ).                                                                                                                                                                                                                                                                                                                                                                                 |
| `index.html`                                     | `<title>`, meta description, polices Google (Newsreader, DM Sans, La Belle Aurore, Playfair Display).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `public/images/`                                 | Photos (webp) issues de cosmos.so ; `public/` : favicon, apple-touch-icon. Drapeaux des destinations : `public/images/flags/*.svg` (29 SVG 1:1, source flagcdn.com — voir Règles).                                                                                                                                                                                                                                                                                                                                                                                                                                  |

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
