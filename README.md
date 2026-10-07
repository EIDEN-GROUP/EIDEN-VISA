# Eiden Visa — Back-office Agadir (VisaFlow Pro)

> **En une phrase — FR :** Eiden Visa vous évite le refus pour dossier incomplet : l'agence identifie toutes les pièces manquantes avant le dépôt TLScontact/BLS, pour que les demandeurs de visa France (et Espagne) n'aient plus peur du rejet ni des allers-retours.
>
> **In one sentence — EN:** Eiden Visa prevents refusal due to incomplete files: the agency identifies every missing document before TLScontact/BLS deposit, so France (and Spain) visa applicants no longer fear rejection or back-and-forth hassle.

> **FR :** application interne de l'agence Eiden Visa (Agadir, Maroc) pour qualifier,
> monter, suivre et facturer les dossiers visa France / Espagne, sans erreur côté
> agence ni côté client. Eiden monte le dossier et le remet scellé ; **le client
> dépose lui-même** au centre (TLScontact ou BLS). Eiden ne prend pas le rendez-vous.
>
> **EN:** internal back-office for the Eiden Visa agency (Agadir, Morocco) to qualify,
> build, track and bill France/Spain visa files with zero mistakes. Eiden builds and
> hands over a sealed file; **the client deposits it themselves** at the centre
> (TLScontact or BLS). Eiden never books the appointment.

Built with [Lovable](https://lovable.dev) — project `4a750c07-2f6b-494e-82a3-f4a0947cc4e7`.
Template: `tanstack_start_ts_current` (see `.lovable/project.json`).

---

## Sommaire / Contents

1. [Périmètre / Scope](#1-périmètre--scope)
2. [Stack & prérequis](#2-stack--prérequis--stack--prerequisites)
3. [Démarrage rapide / Quickstart](#3-démarrage-rapide--quickstart)
4. [Variables d'environnement / Env vars](#4-variables-denvironnement--env-vars)
5. [Parcours 5 étapes / 5-step pipeline](#5-parcours-5-étapes--5-step-pipeline)
6. [Packs, modalités, échéancier](#6-packs-modalités-échéancier--packs-payment-schedule)
7. [Rôles & permissions / Roles](#7-rôles--permissions--roles)
8. [Routes & écrans / Routes & screens](#8-routes--écrans--routes--screens)
9. [Référentiel visa / Visa rules](#9-référentiel-visa--visa-rules)
10. [Architecture technique / Architecture](#10-architecture-technique--architecture)
11. [Base de données / Database](#11-base-de-données--database)
12. [Seed démo / Demo seed](#12-seed-démo--demo-seed)
13. [Documents & upload](#13-documents--upload)
14. [Paiements & pilotage CEO](#14-paiements--pilotage-ceo--payments--ceo-ops)
15. [Design system](#15-design-system)
16. [Arborescence complète / Full file tree](#16-arborescence-complète--full-file-tree)
17. [Scripts npm](#17-scripts-npm)
18. [Production ready](#18-production-ready)
19. [Dépannage / Troubleshooting](#19-dépannage--troubleshooting)
20. [Surveillance RDV / appointment watch](#20-surveillance-rdv--appointment-watch)
21. [Journal des sessions / session log](#21-journal-des-sessions--session-log)
22. [Changelog (obligatoire)](#22-changelog-obligatoire--required)

---

## 1. Périmètre / Scope

**FR — Dans le périmètre :** tourisme/visite, famille, travail (court séjour Schengen,
long séjour salarié/talent/détaché/saisonnier, regroupement encadré). Pré-réservation
hôtel/vol **via agence partenaire (jamais une vente ferme)**, assurance via courtier
agréé qui facture le client en direct.

**FR — Hors périmètre :** santé (écarté au lancement, cas `dout`), études (orienter vers
Campus France, cas `eout`, consultation d'orientation 100 MAD possible, aucun dossier
construit). Source : `SCOPE` dans `src/lib/visa-rules.ts`, étude EV/2026-08.

**EN:** In scope: tourism/visit, family, work. Out of scope: health (excluded at launch),
studies (redirect to Campus France). Flight/hotel are pre-bookings via partner, never
firm sales; insurance is billed directly by the broker.

---

## 2. Stack & prérequis / Stack & prerequisites

| Couche           | Tech                                                                                   | Fichier repère                                                           |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| App              | TanStack Start 1.168.60 + React 19.3 + React Router 1.170.41 + React Query 5           | `src/router.tsx`, `src/start.ts`, `src/server.ts`                        |
| UI               | Tailwind v4 + shadcn new-york + Radix + lucide 1.52 + recharts 3 + sonner              | `src/styles.css`, `components.json`, `src/components/ui/*` (45 fichiers) |
| Forms/validation | react-hook-form + zod 4 + @hookform/resolvers                                          | `src/components/ui/form.tsx`                                             |
| PDF              | jspdf + html2canvas (export tableau + capture pixel)                                   | `src/lib/ops-pdf.ts`                                                     |
| DB               | Postgres 16 + Drizzle ORM + driver `postgres`                                          | `src/backend/db/*`, `drizzle.config.ts`                                  |
| Auth             | cookie-session TanStack Start + bcryptjs (cost 12)                                     | `src/backend/auth.ts`                                                    |
| Build/serveur    | Vite 8.3 + Nitro (preset `vercel`) + `@lovable.dev/vite-tanstack-config 2.25`          | `vite.config.ts`                                                         |
| Qualité          | TypeScript 6 strict + ESLint 10 + Prettier                                             | `tsconfig.json`, `eslint.config.js`, `.prettierrc`                       |
| Landing page     | Vite 8.3 + React 19.3 + Tailwind v4 + lucide 1.52 — **projet autonome** (TypeScript 7) | `landing-page/` (voir §3)                                                |

Prérequis : Node.js >= 20 (`engines` dans `package.json`), npm, Docker (pour la DB locale).
La landing page n'a besoin ni de Docker ni de `.env` / _the landing page needs neither Docker nor `.env`_.

---

## 3. Démarrage rapide / Quickstart

```sh
git clone <this-repository-url>
cd visaflow-pro
cp .env.example .env   # puis renseigner les 4 variables ci-dessous
npm install
npm run db:setup       # db:up (docker) + db:push (schema) + db:seed (admin + 9 dossiers)
npm run dev            # http://localhost:3000 (port géré par le sandbox Lovable si utilisé)
```

Vérifications production (tout doit être vert) :

```sh
npm run typecheck   # tsc --noEmit
npm run lint        # eslint . (0 erreur tolérée)
npm run build       # vite build + Nitro vercel
```

> État vérifié le 2026-10-02 : `typecheck` OK (×2 projets), `lint` 0 erreur (37 warnings
> `react-refresh` connus, sans impact), `build` OK (×2), `npm audit --omit=dev` 0 vulnérabilité
> (×2, residu dev-only esbuild/drizzle-kit tracé en §18).

### Landing page (dossier séparé / separate folder)

**FR :** la landing page publique vit dans `landing-page/`, un projet Vite + React +
Tailwind **totalement indépendant** de l'app : son propre `package.json`,
`node_modules`, `tsconfig.json` et build. Elle n'importe rien de `src/**` et l'app
n'importe rien d'elle — on peut y travailler sans risque pour le back-office.

**EN:** the public landing page lives in `landing-page/`, a **fully standalone**
Vite + React + Tailwind project (own `package.json`, `node_modules`, `tsconfig.json`,
build). It imports nothing from `src/**` and the app imports nothing from it — safe
to work on without touching the back-office.

```sh
cd landing-page
npm install
npm run dev        # http://localhost:5180 (l'app reste sur :3000 / app stays on :3000)
npm run build      # tsc --noEmit + vite build → landing-page/dist
```

Contenu à éditer / content to edit : textes FR + AR / FR + AR copy in
`landing-page/src/i18n/fr.ts` + `ar.ts` (packs Standard, Essentiel, Global, sans prix /
no prices ; FAQ) ; liens et images / links and images in `landing-page/src/content.ts`
(`LIENS` à compléter avant mise en ligne / fill `LIENS` before going live).
Détails : `landing-page/README.md`.

Coordonnées de l'agence / agency contact details : **FR** une barre marine au-dessus du
header et le pied de page affichent téléphone, e-mail, horaires et adresse (Agadir Bay,
Technopole 1) ; horaires et adresse dans `t.infos` (`fr.ts` / `ar.ts`), téléphone, e-mail
et lien Google Maps dans `CONTACT` (`content.ts`, lien `carte` à remplacer par la fiche
exacte). La demande rapide propose la ville de résidence dans une liste déroulante des
régions du Sud (`landing-page/src/villes.ts`, sans choix « Autre »). **EN** a navy bar
above the header and the footer show phone, e-mail, opening hours and address; hours and
address live in `t.infos`, phone, e-mail and the Google Maps link in `CONTACT` (replace
the `carte` search link with the exact listing). The quick request offers the city of
residence as a dropdown of the southern regions only (`landing-page/src/villes.ts`, no
"other" choice).

Demandes de contact / contact requests : la popup « Demande rapide » sauvegarde
chaque envoi dans Supabase (table `landing_contacts`, INSERT anon seul) **en plus** de
WhatsApp, et la fonction serverless `GET /api/contacts-feed` (clé `X-API-Key`) expose
les lignes à l'onglet Website Contacts du BMS — sans modification de code côté BMS
(`CONTACT_SOURCE_N_*` env uniquement). Secrets serveur jamais préfixés `VITE_`.
The quick-request popup also saves each submission to Supabase (`landing_contacts`,
anon INSERT-only) **alongside** WhatsApp, and the serverless `GET /api/contacts-feed`
(`X-API-Key`) feeds the BMS Website Contacts tab — no BMS code change
(`CONTACT_SOURCE_N_*` env only). Server secrets never `VITE_`-prefixed.

---

## 4. Variables d'environnement / Env vars

Copier `.env.example` vers `.env` (jamais commité — voir `.gitignore`). Chargé **uniquement**
côté Node (`vite.config.ts`, `drizzle.config.ts`, `scripts/seed.ts`) : **ne jamais**
`import "dotenv/config"` dans `src/**` exposé au navigateur (crash `args.reduce` déjà vu,
documenté en tête de `vite.config.ts`).

| Variable           | Obligatoire | Usage                                                                                                                                                                  |
| ------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`     | oui         | ex. `postgres://eidenvisa:eidenvisa@localhost:5435/eidenvisa` (voir `docker-compose.yml`). `src/backend/db/client.ts` exige `prepare:false` (pooler mode transaction). |
| `SESSION_PASSWORD` | oui         | secret >= 32 caractères (refusé en dessous) pour le cookie `eidenvisa_session` (7 jours, révocable via `session_version`).                                             |
| `ADMIN_EMAIL`      | oui (seed)  | ex. `accueil@eidenvisa.ma`. Normalisé en minuscules.                                                                                                                   |
| `ADMIN_PASSWORD`   | oui (seed)  | >= 12 caractères, hashé bcrypt 12. **Changer en prod.**                                                                                                                |

En prod : `secure` cookie passe à `true` automatiquement quand `NODE_ENV=production`
(derrière HTTPS uniquement — voir `src/backend/auth.ts`).

---

## 5. Parcours 5 étapes / 5-step pipeline

Source unique : `ETAPES` dans `src/lib/dossier-model.ts`.

| n   | key             | Label FR                                    | Détail                                                                                               | Encaissement              | Responsable |
| --- | --------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------- | ----------- |
| 1   | `reception`     | Réception et diagnostic                     | éligibilité de base, clause de non-garantie, **remise du reçu** listant les pièces                   | Gratuit                   | Réception   |
| 2   | `france_visas`  | Création du dossier sur France-Visas / RCPC | compte + saisie sur le portail, édition du récépissé                                                 | Acompte selon modalité    | Back office |
| 3   | `rdv`           | Prise de rendez-vous sur TLScontact         | recherche de créneau et prise du rendez-vous au centre                                               | —                         | Back office |
| 4   | `rassemblement` | Rassemblement du dossier                    | le client réunit ses pièces, vérification une par une avant la date du RDV, remise du dossier scellé | Solde du palier choisi    | Back office |
| 5   | `decision`      | Visa approuvé ou refusé                     | décision du consulat, avec le motif en cas de refus                                                  | Droit visa payé au centre | Consulat    |

Le rendez-vous se prend **avant** le rassemblement : le créneau est la ressource rare, on le
sécurise d'abord, puis on monte le dossier pour la date obtenue. Le reçu part dès l'étape 1
puisque c'est lui qui dit au client quelles pièces rapporter.

Étape 5 = fin du cycle Eiden (`cloture` : pièces/pack/encaissement verrouillés).
Décision : `en_attente | approuve | refuse` (`DECISION_LABEL`) + `decisionMotif` si refus.

### Checklist par étape / per-step checklist

`checklistEtape(d)` renvoie `PointEtape[] { label, fait, aide? }` : **ce que l'étape en
cours attend**, pas un décompte abstrait. Remplace l'ancien badge `niveau` (figé à
l'ouverture, donc muet sur l'avancement réel) sur les cartes Kanban et la colonne
« À faire » de la liste.

| Étape | Points vérifiés                                                                                    |
| ----- | -------------------------------------------------------------------------------------------------- |
| 1     | Qualification faite · coordonnées complètes · **reçu remis**                                       |
| 2     | Passeport renseigné · dossier créé sur France-Visas · n° France-Visas/RCPC · acompte (si modalité) |
| 3     | France-Visas confirmé · rendez-vous pris · date du rendez-vous enregistrée                         |
| 4     | Téléversement autorisé · pièces réunies · solde encaissé                                           |
| 5     | Décision enregistrée · motif du refus si refus                                                     |

### Jalons externes / external milestones

L'application ne peut pas constater ce qui se passe hors d'elle (portail France-Visas,
centre de dépôt, remise papier). L'agent **déclare** ces jalons, et la référence saisie
tient lieu de preuve. **La date de déclaration est posée par le serveur** (`setJalon`),
jamais saisie : une trace antidatable ne vaut rien.

| Jalon        | Étape | Colonnes DB                                       | Preuve demandée     |
| ------------ | ----- | ------------------------------------------------- | ------------------- |
| Reçu remis   | 2     | `recu_remis`, `recu_le`                           | — (bouton reçu PDF) |
| France-Visas | 3     | `france_visas_fait`, `france_visas_ref`, `..._le` | numéro de dossier   |
| Rendez-vous  | 4–5   | `rdv_pris`, `rdv_date`, `rdv_le`                  | date du rendez-vous |

La case RDV est **verrouillée tant que France-Visas n'est pas confirmé** : on ne prend pas
rendez-vous pour un dossier qui n'existe pas sur le portail. La carte « Jalons du dossier »
n'affiche que le jalon de l'étape en cours (`JALONS_ETAPE`).

### Alertes transverses / cross-cutting alerts

`alertes(d)` ne porte plus que ce qui échappe à la checklist d'étape : passeport
(expiré / expire pendant le séjour / marge < 3 mois), blocage `tc3` (autorisation
travail), cas complexe, et **incohérences d'ordre** — étape ≥ 2 sans reçu remis,
étape ≥ 3 sans France-Visas, étape ≥ 4 sans rendez-vous, étape ≥ 5 sans décision.

### Validité du passeport / passport validity

`passeportStatut(d)` renvoie `inconnu | expire | expire_pendant_sejour |
marge_insuffisante | ok`. Trois défauts distincts, trois messages distincts — un
passeport qui meurt en cours de séjour n'est pas « un peu court ».
`passeportExpirationMinimale(d)` = retour + 3 mois, affichée à l'agent pour qu'il
donne **une date** au client plutôt qu'une règle. Un passeport déjà périmé est invalide
même sans dates de voyage connues. `expirationParDefaut()` (`date-calc.ts`) pré-remplit
l'expiration à **délivrance + 5 ans** (passeport marocain) — proposition modifiable,
mineurs et passeports étrangers ayant d'autres durées.

### Notes d'équipe / team notes

`notesAgent` (jsonb `NoteAgent { texte, auteur, date }`, plus récentes en tête) :
ce que l'agent transmet au suivant. Auteur et horodatage viennent du serveur
(`ajouterNote`). Distinctes de `notes`, qui porte les observations générées par la
qualification — mélanger les deux rendrait les deux moins fiables. Panneau visible à
**toutes** les étapes.

---

## 6. Packs, modalités, échéancier / Packs, payment schedule

`PACKS`, `MODALITE_LABEL`, `planPaiement`, `reglerEcheancier` dans `src/lib/dossier-model.ts`.
Ne jamais saisir l'échéancier à la main : il est **dérivé** du pack + modalité ;
`reglerEcheancier` garde les lignes encaissées + toutes les options, régénère le reste.

| Pack     | Label                         | Prix     | Marge nette                                      | Contenu                                 |
| -------- | ----------------------------- | -------- | ------------------------------------------------ | --------------------------------------- |
| `base`   | Pack Dossier                  | 700 MAD  | 391                                              | Qualification + constitution + contrôle |
| `voyage` | Pack + pré-réservation voyage | 1000 MAD | 500                                              | + hôtel/vol partenaire                  |
| `global` | Pack Global                   | 1300 MAD | nulle (commission courtier non figée EV/2026-08) | + mise en relation courtier             |

Modalités : `comptant` (100 % au solde étape 4) | `acompte` (50 % à l'étape 2
— création du dossier France-Visas — pour sécuriser l'engagement, 50 % à l'étape 4,
`ACOMPTE_PCT=0.5`). Le solde est encaissé **au rassemblement**, dernier moment où le client
est en agence : l'étape 5 est la décision du consulat, donc après le dépôt. Options à la carte toujours à part,
hors calcul des 50 %. `Echeance = acompte | solde | option` (défaut historique = `solde`).

Frais consulaires (rappel, payés au centre) : `FRAIS` — adulte ≈ 90 € (≈ 950 MAD),
mineur ≈ 45 € (≈ 480 MAD) selon tranche d'âge.

Centres (`CENTRES`) : `TLScontact Agadir` (France → tout ce qui n'est pas BLS),
`BLS Espagne Agadir` (Espagne, détecté par `ilike %BLS%`). Colonne DB historique :
`rdv_centre`.

---

## 7. Rôles & permissions / Roles

`Role = ceo | reception | preparation | back_office` (`src/backend/db/schema.ts`,
libellés `ROLE_LABEL` dans `src/lib/store.tsx`).

| Action                                                                      | ceo     | reception    | preparation  | back_office  |
| --------------------------------------------------------------------------- | ------- | ------------ | ------------ | ------------ |
| Se connecter, voir dossiers, téléverser (si autorisé)                       | ✅      | ✅           | ✅           | ✅           |
| Étapes, pièces, jalons, notes, fiche client, centre (quotidien)             | ✅      | ✅           | ✅           | ✅           |
| Encaisser, changer pack/modalité (`requireRoles` ceo/reception/back_office) | ✅      | ✅           | ❌           | ✅           |
| Décision consulat (`requireRoles` ceo/back_office)                          | ✅      | ❌           | ❌           | ✅           |
| Supprimer un document (dossier existant requis)                             | ✅      | ✅           | ❌           | ❌           |
| Supprimer un dossier (+ cascade documents, loggé)                           | ✅ seul | ❌           | ❌           | ❌           |
| Autoriser/bloquer upload (`setUploadAutorisation`, `requireCeoOrReception`) | ✅      | ✅           | ❌           | ❌           |
| Gérer comptes/rôles/mots de passe, voir `/ops`, analytique, journal         | ✅ seul | ❌           | ❌           | ❌           |
| Assigner/désassigner (notifie l'assigné sauf auto-assignation)              | ✅      | ✅           | ✅           | ✅           |
| Surveillance RDV : créer (HTTPS public, quota 20) ; modifier/supprimer      | ✅      | ✅ (siennes) | ✅ (siennes) | ✅ (siennes) |

Rôles non-CEO sur une action réservée → erreur (pas de redirection silencieuse).
Anti-lockout : auto-rétrogradation CEO interdite + dernier CEO protégé.
Sessions : cookie 7 jours, `SESSION_PASSWORD` ≥ 32, révocation au changement
de mot de passe (`session_version`) ; login freiné (5 échecs/10 min → 5 min)
avec comparaison bcrypt même sur email inconnu (anti-énumération).

Garde double : `beforeLoad` sur `/_app` (redirection `/login`) + `requireUserId`
fail-closed côté serveur sur chaque mutation. `requireCeo` reste `createServerOnlyFn`
pour ne pas embarquer bcrypt/postgres dans le bundle client (incident déjà vu,
commenté dans `src/backend/functions/auth.ts`).

---

## 8. Routes & écrans / Routes & screens

Routage fichier TanStack (`src/routeTree.gen.ts` généré — **ne pas éditer**).
Conventions : voir `src/routes/README.md`.

| URL                  | Fichier                                                                                                                                                                                         | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                  | `src/routes/_app/index.tsx`                                                                                                                                                                     | Dashboard : 4 KPI (actifs, à autoriser, alertes, encaissé), alertes système, à autoriser (8), récents (6). Filtre `DateRangeFilter` sur `created_at`.                                                                                                                                                                                                                                                                                                                                     |
| `/qualification`     | `src/routes/_app/qualification.tsx`                                                                                                                                                             | Boussole en **carrousel** (une question par diapo, embla, retour arrière en lecture seule, barre de progression) → `CaseResult` → formulaire client (identité + dates de séjour + **passeport**, expiration pré-remplie à +5 ans) + centre + modalité → `createDossier` (`EV-année-XXXXXX`, fil Q/R persisté dans `qualification`) → `/dossiers/$id`. Le résultat s'affiche en premier, les réponses se replient derrière un compteur.                                                    |
| `/dossiers`          | `src/routes/_app/dossiers/index.tsx`                                                                                                                                                            | Liste paginée SQL (50/page, recherche debounce 300 ms nom/tél/ville/réf, filtres niveau/pays/dates, Tous/Mes dossiers) + vue Liste/Kanban (`DossiersKanban`, drag + boutons clavier).                                                                                                                                                                                                                                                                                                     |
| `/dossiers/$id`      | `src/routes/_app/dossiers/$id.tsx` (écran cœur)                                                                                                                                                 | Bandeau d'étape (libellé, rôle, **checklist du moment**, navigation ± étape, « Tout afficher »), alertes transverses, puis **seuls les panneaux de l'étape courante** (`PANNEAUX_ETAPE`) : jalons, informations du client (identité + séjour + passeport + réponses libres groupées), questions posées, notes d'équipe, checklist des pièces, pack & paiements, centre de dépôt, documents. Décision + motif à l'étape 5. Modification client (identité, **dates de séjour**, passeport). |
| `/rdv-watch`         | `src/routes/_app/rdv-watch.tsx`                                                                                                                                                                 | Surveillance RDV : URLs ajoutées dynamiquement, état actif/pause, dernière vérification. Voir §21.                                                                                                                                                                                                                                                                                                                                                                                        |
| `/paiements`         | `src/routes/_app/paiements.tsx`                                                                                                                                                                 | Encaissé/attente/compteurs, paliers pack (prix + marge + effectif), attentes (encaisser inline), historique (borné 300/100).                                                                                                                                                                                                                                                                                                                                                              |
| `/referentiel`       | `src/routes/_app/referentiel.tsx`                                                                                                                                                               | Lecture seule : périmètre, parcours, packs + frais, cas types (`FIXED_KEYS`).                                                                                                                                                                                                                                                                                                                                                                                                             |
| `/profil`            | `src/routes/_app/profil.tsx`                                                                                                                                                                    | Mon profil : avatar (downscale 400px JPEG 0.85, JPEG/PNG/WebP côté serveur), nom, mot de passe (≥12, révoque les autres sessions), KPIs perso, BarChart par étape, mes dossiers/pièces/encaissements/activité.                                                                                                                                                                                                                                                                            |
| `/login`             | `src/routes/login.tsx`                                                                                                                                                                          | Connexion équipe (carte 2 colonnes + rail art). Redirige vers `/` si déjà connecté.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `/ops?s=&u=`         | `src/routes/ops.tsx`                                                                                                                                                                            | Superadmin CEO masqué du Rail : synthèse, analytique (`AnalyticsPanel`), paiements (acomptes en retard, soldes dus, journal, export PDF), équipe (CRUD + `UserProfile` + fiche PDF), alertes, activité. `OpsGate` : non-CEO déconnecté + refus.                                                                                                                                                                                                                                           |
| `/confidentialite`   | `src/routes/confidentialite.tsx`                                                                                                                                                                | Page publique : objet, données, partage consulaire strict, conservation/suppression irréversible journalisée, accès journalisé, contact Agadir.                                                                                                                                                                                                                                                                                                                                           |
| `/dossiers/$id/recu` | `src/routes/dossiers.$id.recu.tsx`                                                                                                                                                              | Reçu client imprimable + PDF jsPDF (`Recu-{id}.pdf`, pagination, signatures, mentions). Sélecteur « Type de reçu » : **Après paiement** (complet) ou **Avant paiement** (même reçu sans la section des paiements, écran + PDF).                                                                                                                                                                                                                                                           |
| Shell                | `src/routes/__root.tsx` (fonts Fraunces/Plus Jakarta/Space Mono/Poppins/Quicksand, favicons, 404/erreur), `src/routes/_app.tsx` (garde auth + `Rail` + header `NotificationBell`/`ProfileChip`) | —                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

---

## 9. Référentiel visa / Visa rules

**Source unique de vérité : `src/lib/visa-rules.ts`** (~1 900 lignes). Les écrans ne font
que lire ce fichier : aucune règle visa n'est écrite ailleurs.

- `Level = standard | attention | complexe` + `LEVEL_LABEL`.
- `CaseResult { key, title, cat, level, docs (officiel), extra (Eiden), notes (vigilance) }`.
- `TREE : Record<string, TreeNode>` — **144 nœuds**, dont 75 pour le long séjour (`ls_*`).
  `TreeNode { q, help?, opts? | fields?, next?, fieldsResult? }`.
  `TreeOption { l, n, set?: Profile, r?, excl? }` — `r: true` ⇒ `n` est un résultat, pas un nœud.
  `TreeNode.multi` ⇒ options cochables (plusieurs réponses), validées par « Continuer » ; toutes
  les options mènent au même nœud suivant, `excl` décoche les autres (« Tous les frais »).
  Multiple-choice nodes: `multi` + `excl`, only `garant_frais` uses it today.
  `PERSONNE_QUI` / `PERSONNE_FIN` désignent le bloc hébergeant différé (voir ci-dessous).
  `Profile.origine` (`site` | `direct`) est posé à la création du dossier (pas par l'arbre) / set at dossier creation, not by the tree.
  `retour()` restaure la réponse : option cochée (`Step.idx`), champs saisis (`Step.champs`) et
  profil d'avant (`Step.avant`) / going back restores the chosen option, typed fields and profile.
- **25 cas figés** (`FIXED`) : `t3 t4 t5 tc1 tc2 tc3 tc4 tc5 dout eout a_long b_long
b_ue_famille conjoint_court d_refugie d_subsidiaire d_apatride c3 c4 c5 c6 c7 c8 c9 c_autre`.
- Deux assembleurs dynamiques : `buildCourtSejour(p)` (clé `DYNAMIC`) et
  `buildLongSejour(p)` (clé `DYNAMIC_LS`), aiguillés par `resolveCase`.

### Fusion des réponses / answer merging

`choose()` fait `{ ...profile, ...opt.set }` — une fusion **superficielle**. D'où des
champs `Profile` **à plat** (`lsType`, `lsFamille`, `lsContratTravail`…) et jamais imbriqués : un objet
`ls: {…}` serait écrasé à chaque réponse, perdant les précédentes.

### Tronc commun (avant le motif) / shared trunk

Posé une seule fois pour toutes les branches, court comme long séjour :

`start` (visa Schengen obtenu dans les 59 derniers mois) → `q2`/`q3` (type + date d'obtention
et date du jour, avec le calcul de l'écart) → `q4`/`q5` (refus antérieur) → **`hebergement`**
(hôtel + champs / chez une personne / autre) → **`transport`** (avion / bateau) →
**`financement`** (moi-même / garant + champs) → **`duree`** → `motif` (≤ 90 j) ou
`motif_long` (> 90 j).

### Bloc personne hébergeante — posé EN DERNIER / host block, asked LAST

`hebergement: "personne"` **ne déclenche plus** `personne_qui` sur-le-champ : `hebergement`
file vers `transport` et ne mémorise que le drapeau. Les quatre questions d'hébergeant
(`personne_qui` → `personne_fields` → `personne_nationalite` → `personne_fields2`) sont
posées **après** la dernière question de la branche, juste avant l'affichage du résultat :

```
… branche (motif + sous-questions) → [terrain : r:true ou fieldsResult]
        → goToResult() memorise la clé du cas → PERSONNE_QUI → … → personne_fields2
        → PERSONNE_FIN → on résout enfin le cas mémorisé
```

`goToResult()` (`src/routes/_app/qualification.tsx`) est le **seul** point d'arrivée vers
un résultat de tout le questionnaire. C'est là — et non dans chacun des ~25 nœuds
terminaux — qu'est décidée la bascule : impossible d'oublier un motif et de laisser un
dossier « chez un particulier » sans la pièce « attestation d'accueil ». Un drapeau
`enCours` empêche la boucle, la clé résolue est conservée pour que « Revenir sur la
dernière question » redonne le même cas.

`hebergement: "hotel"` et `"autre"` ne passent pas par l'entonnoir : le résultat s'affiche
directement, le bloc hébergeant n'est jamais posé.

Hébergement `personne` : **4 questions** de plus qu'en août 2026, toutes en fin de
questionnaire. Dans le fil `qualification` figé au dossier, elles apparaissent donc après
les questions de motif — ce qui est le but.

`transport` ne propose plus que **avion** et **bateau**. « autobus » reste lisible dans le
type `Profile["transport"]` (et dans l'énumération de validation serveur) pour que les
dossiers enregistrés avant le retrait se relisent et se sauvegardent encore ; seule la pièce
« … (avion ou bateau) » a été réécrite.

`start` demande « Avez-vous déjà obtenu un visa Schengen au cours des 59 derniers mois ? »
(ex-« un visa pour la France ») : la question porte sur l'espace Schengen, ce qui colle au
seuil des 59 mois calculé sur `q3`.

### Court séjour (Visa C) / short stay

| Branche                      | Entrée        | Particularités                                                                                                          |
| ---------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| A · Tourisme / visite privée | `a_residence` | titre de séjour si non-résident, famille UE/EEE en supplément (n'écrase pas la checklist)                               |
| B · Visite familiale         | `b_motif`     | 4 sous-branches : famille, enfant/parent de Français, conjoint de Français (→ `conjoint_court` ou `t3`), famille UE/EEE |
| C · Travail                  | `c1`          | **6 types** : voyage d'affaires, détachement, événement culturel, mannequin, recherche, stage                           |
| D · En vue de mariage        | `d_court`     | 2 questions : certificat de publication des bans, nationalité française du futur conjoint                               |

Pièces assemblées par profession (`professionDocsTourisme`), hébergement
(`hebergementDoc`), transport (`transportDoc`, support nommé), état civil
(`etatCivilDocs` via Q-F3), garant si `financePar = garant`.
Professions proposées (`a_profession` tourisme, `b_profession` visite familiale) :
salarié, fonctionnaire, étudiant (tourisme seul), avocat/médical, retraité,
agriculteur, **entrepreneur** (RC, immatriculation RC, statuts, ICE, IF, patente+IRG,
déclarations fiscales, attestation fiscale, relevés pro 3 mois, justificatifs
d'activité et de revenus/CA), sans profession. `commercant` n'est plus proposé
mais reste lisible partout (dossiers existants, `profDoc`, seed).

### Long séjour (Visa D) / long stay

Source unique : le PDF « EIDEN Visa — Système de qualification des visas Long séjour »
(27 p.). Source of truth: that PDF. Après `duree = long`, le nœud `ls_type` demande le
**type de demande** ; 4 branches, 75 nœuds `ls_*`, assemblées par `buildLongSejour(p)`
(clé `DYNAMIC_LS`). Règle EIDEN : un document n'apparaît que si une réponse précédente le
rend nécessaire ; les documents communs ouvrent la liste, les pièces conditionnelles
s'ajoutent ensuite. Les oui/non sont des booléens `ls…` à plat (helper `lsOuiNon`).

| Type de demande                      | Sous-branches (questions)                                                                                                                                                                                                                                                                                | Clés de résultat                                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1 · Visa de retour                   | perte/vol du titre · perte/vol du passeport · récépissé 1re demande · mineur sans DCEM/TIR ; déclaration, copie, références, validité                                                                                                                                                                    | `ls_retour_titre`, `ls_retour_passeport`, `ls_retour_recepisse`, `ls_retour_mineur` |
| 2 · Installation familiale ou privée | ascendant à charge (7 q.) · ascendant non à charge (3 q., ressources ⇒ orientation Visiteur) · conjoint de Français (7 q.) · parent d'enfant mineur français (11 q.)                                                                                                                                     | `ls_asc_charge`, `ls_asc_non_charge`, `ls_conjoint`, `ls_parent_mineur`             |
| 3 · Visiteur                         | âge → majeur (activité pro ⇒ redirection Travail ; situation, financement, fonds, logement) · mineur scolarisé (école, garde, financement, hébergement, ressortissant)                                                                                                                                   | `ls_visiteur_majeur`, `ls_visiteur_mineur`                                          |
| 4 · Travail                          | embauche/détachement (autorisation, contrat, diplômes, attestations) · ICT (groupe, 6 mois, statut, cadre, contrat, mission, profession réglementée) · entrepreneur (création : 6 types ; existante : salarié/non-salarié) · profession libérale (création/existante, réglementée, viabilité SMOE, SMIC) | `ls_embauche`, `ls_ict`, `ls_entrep_creation`, `ls_entrep_existante`, `ls_liberale` |

**Garde-fous :** une réponse bloquante (récépissé périmé, ressources insuffisantes, pas de
garde, pas de communauté de vie, autorisation de travail absente…) passe le dossier en
`complexe` et ajoute une **note nommant le point à lever avant le dépôt** — la liste de
pièces n'est jamais « arrangée ». Visa de retour : la FAQ France-Visas annonce 3
formulaires + 3 photos, d'où une note « vérifier au dépôt ». ICT « même groupe = non » et
Visiteur « activité pro = oui » renvoient vers `ls_travail_situation`.
**Ancien arbre retiré / old tree removed :** études, stage, « autre motif » et les champs
`lsMotif`, `lsEtudesType`, `lsAdmission`, `lsFinancement`, `lsTravailType`… n'existent plus
(plus de `lsTropCourt`, `motif_long`). Un dossier enregistré avec l'ancien arbre se
résout en `ls_a_requalifier` (socle commun + note « reprendre la qualification »).
Les champs zod du profil long séjour sont dans `src/backend/functions/dossiers.ts`
(`dossierInput.profile`) : tout nouveau champ `ls…` doit y être ajouté, sinon il est
retiré en silence à l'enregistrement.

---

## 10. Architecture technique / Architecture

- **SSR :** `src/start.ts` (`errorMiddleware` + `csrfMiddleware` sur les serverFn),
  `src/server.ts` (intercepte d'abord `serveDocument`, puis entrée TanStack ; convertit
  les 500 JSON `{"unhandled":true}` en page HTML `renderErrorPage`).
- **Server functions** (`createServerFn` + zod, `src/backend/functions/`) :
  - `auth.ts` — `login/logout/currentUser`, gardes `requireUserId/requireCeo/requireCeoOrReception`.
  - `dossiers.ts` — `listDossiers/listDossiersPage` (pagination + `ilike` nom/ville/réf, tél insensible aux espaces via `regexp_replace`, `pays` BLS, `mine = agentUserId==moi OR assignee==moi`, `dateFrom/To` inclusif sur `createdAt`), `listAlertesDossiers` (300), `listDossiersRecents` (6), `listDossiersAvecImpaye` (300, `jsonb_array_elements(paiements)` non encaissé), `listDossiersAvecEncaissement` (100), `getDashboardStats/getPaiementsStats/getPackCounts`, `getDossier/createDossier` (`agentUserId` = session, anti-spoof, log, **inclut `client.voyageDebut/Fin`**), `togglePiece/avancerEtape/setEtape` (optimiste kanban)/`changerCentre/setUploadAutorisation` (CEO/Réception)/`encaisser/changerPack/setModalitePaiement` (via `reglerEcheancier`, **acompte 50/50**)/`getPaiementsSuivi` (CEO, 5 requêtes)/`setDecision/updateClient` (client + voyage dates)/`updateOrigine` (profil, journalisé)/`updateDetails` (réponses saisies pendant la qualification, clés limitées à `TREE_FIELDS`, journalisé)/`deleteDossier` (cascade documents, loggé).
  - `documents.ts` — `listDocuments` (léger, sans base64), `uploadDocument` (gate `uploadAutorise` serveur + PDF `%PDF-` ou `autre` tout format, 10 Mo), `deleteDocument`.
  - `assignments.ts` — `listAssignableUsers`, `assignDossier` (+ notification + note ≤280, sauf auto-assignation), `unassignDossier`, `listMyNotifications` (30, `unread`), `markNotificationsRead` (sélectif ou tout).
  - `ops.ts` — CEO : `listUsers/createUser` (bcrypt 12, email minuscule)/`updateUserRole/deleteUser` (refuse auto-suppression)/`listActivity` (200)/`getAnalytics` (**1 seule requête CTE + `json_agg`**, leçon pooler : 13 requêtes parallèles saturaient le pool)/`getUser/updateUser/setUserPhoto` (data:image, ≤1,5 Mo)/`resetUserPassword`/`fetchUserProfile` (CTEs, réutilisé CEO + self)/`getUserProfile`.
  - `profile.ts` — `getMyProfile/updateMyName/setMyPhoto/changeMyPassword` (vérifie l'actuel).
  - `logActivity` (`createServerOnlyFn`, `activity_log`) : toute mutation loggée (`dossier.creation/cloture/autorisation/assignation/desassignation/decision/suppression`, `paiement.*`, `utilisateur.*`, `profil.*`).
- **Frontend data :** `src/lib/store.tsx` (clés `dossiers/documents/ops/auth/my-profile/notifications/assignable-users`, invalidations `dossiers+ops`, `setEtape` optimiste avec rollback, polls : notifications 20 s, activité 15 s, suivi 30 s, users/profils 60 s).
- **Documents binaires :** `GET /documents/:uuid` hors RPC JSON (`src/lib/serve-document.ts` + `src/server.ts`), auth requise (anti-devinette UUID), `inline;filename=…`, `private,no-store`.
- **PDF :** `src/lib/ops-pdf.ts` (`exportOpsPdf` tableau A4 : en-tête Eiden, KPIs 3/ligne, sections paginées, pied de page ; `exportElementPdf` capture pixel via html2canvas avec fallback tableau si couleurs `oklch` — fix Firefox déjà appliqué) ; reçu client dans `dossiers.$id.recu.tsx`.
- **Erreurs :** `error-capture.ts` (hors-bande TTL 5 s, chaîne causes), `error-page.ts` (fallback EN statique), `lovable-error-reporting.ts` (client seul, `window.__lovableEvents`), `ErrorComponent/NotFoundComponent` dans `__root`.
- **Images :** `src/lib/image.ts` (`downscaleImage` 400px JPEG 0.85 pour avatars).
- **Landing page (isolée / isolated) :** `landing-page/` = SPA Vite statique, sans serveur
  ni DB. FR : exclue du `tsconfig.json` racine (`include: src/**`), des `ignores` de
  `eslint.config.js`, et du scan Tailwind de l'app (`source(none)` + `@source "../src"`) ;
  seul `npm run format` (Prettier racine) la couvre. EN: excluded from the root
  tsconfig, ESLint and the app's Tailwind scan; only root Prettier formats it.

---

## 11. Base de données / Database

`src/backend/db/schema.ts` + `drizzle.config.ts` (`dialect postgresql`, `schema ./src/backend/db/schema.ts`, `out ./drizzle`, `DATABASE_URL`). `docker-compose.yml` : Postgres 16-alpine `eidenvisa/eidenvisa`, port hôte **5435→5432**, volume `eidenvisa_db`.

```
users 1—N notifications (cascade)
users 1—N dossiers.agentUserId / dossiers.assigneeUserId (set null)
users 1—N activity_log (set null)
users 1—N sessions (cascade, INUTILISÉ — voir note)
dossiers 1—N documents (cascade)
dossiers 1—N rdv_watches.dossierId (set null)
```

| Table           | Colonnes clés / notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`         | `id, email unique (minuscule), password_hash (bcrypt12), nom, role (défaut reception), session_version (révocation sessions), photo_base64 (data URL JPEG/PNG/WebP ≤1,5 Mo), created_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `sessions`      | `id, user_id, expires_at` — **définie mais inutilisée** : la vraie session est le cookie `eidenvisa_session` (`useSession`). Conservée sans lecture/écriture ; ne pas s'en servir sans migration + code.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `dossiers`      | **42 colonnes.** Identité : `id (EV-2026-XXXXXX), client_nom/telephone/ville/naissance`, `client_voyage_debut/fin` (ISO, nullable), **`client_passeport_numero/delivrance/expiration/lieu`** (nullable — saisis quand la pièce arrive). Attribution : `agent` (affichage seul, ne pas filtrer dessus), `agent_user_id`, `assignee_user_id`. Qualification : `case_key` (`DYNAMIC`, `DYNAMIC_LS` ou cas figé), `profile` (jsonb), **`qualification`** (jsonb — fil Q/R figé à l'ouverture), `titre/categorie/niveau` (dénormalisés). Parcours : `etape 1..5`, `rdv_centre` (nom historique = centre), `upload_autorise`, `pieces/paiements/notes` (jsonb), **`notes_agent`** (jsonb — notes d'équipe signées). Jalons : **`recu_remis/recu_le`**, **`france_visas_fait/ref/le`**, **`rdv_pris/rdv_date/rdv_le`**. Décision : `decision`, `decision_date`, **`decision_motif`**. `created_at` = **seule colonne de filtre/tri dates**. |
| `rdv_watches`   | `id, label, url, dossier_id (set null), actif, interval_seconds (défaut 300), last_snapshot_hash, last_status, last_checked_at, created_by_user_id, created_at` — surveillance de disponibilité, voir §21                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `documents`     | `id (uuid), dossier_id (cascade), type (france_tls/espagne_bls/autre), filename, mime_type, data_base64 (base64 — volumes modestes, évite bytea ; 10 Mo max, passer au stockage objet si croissance), uploaded_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `notifications` | `id, user_id (cascade), type (assignation/info), message, dossier_id (sans FK), **`url`** (lien externe → bouton « Voir »), acteur_nom, read_at (null = non lu), created_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `activity_log`  | `id, user_id (set null), action, detail, dossier_id (sans FK), created_at` — audit écran `/ops`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

Règles : `ouvertLe` = affichage ; `createdAt` = filtres `DateRange`. `agent` = affichage ;
`agentUserId/assigneeUserId` = filtres fiables. `drizzle-kit push` utilisé (pas de dossier
`drizzle/` versionné) — OK démo, prévoir des migrations versionnées avant prod multi-env.

---

## 12. Seed démo / Demo seed

`scripts/seed.ts` (exige `DATABASE_URL + ADMIN_EMAIL + ADMIN_PASSWORD`) : crée
`users{id:"user-accueil", email:ADMIN_EMAIL minuscule, nom:"Accueil Eiden Visa", role:"ceo"}`
(`onConflictDoNothing(email)` — installations existantes : passer ce compte en `ceo`
via `/ops` ou SQL, ex. `update users set role='ceo' where email='...'`) puis, **seulement si `dossiers` vide**, insère les
9 dossiers de `buildSeed()` (`src/lib/seed.ts`, `decision=en_attente`, `agentUserId/
assigneeUserId=null`, `echeance` backfillée par libellé).

| id           | Client                            | Cas / profil                                             | Pack / modalité       | Étape / centre / autorisé | Paiements                                                                                          |
| ------------ | --------------------------------- | -------------------------------------------------------- | --------------------- | ------------------------- | -------------------------------------------------------------------------------------------------- |
| EV-2026-0141 | Hafsa Bouzid, Agadir              | DYNAMIC tourisme/salarie/mariée/visaHist                 | voyage / acompte 50 % | 6 / TLS / non             | **Acompte 500 encaissé 05/09 + Solde 500 dû** (50/50)                                              |
| EV-2026-0140 | Youssef El Amrani, Inezgane       | tc3                                                      | base / comptant       | 2 / TLS / non             | Pack 700 dû (note : autorisation travail employeur non déposée 03/09)                              |
| EV-2026-0139 | Fatima Zahra Ait Baha, Agadir     | DYNAMIC visite_enfant_parent/retraitée                   | base / comptant       | 4 / TLS / **oui**         | Pack 700 encaissé 30/08 (attestation d'accueil Lyon en attente tampon)                             |
| EV-2026-0138 | Karim Oulhaj, Taroudant           | tc1 affaires                                             | global / comptant     | 7 / TLS / **oui**         | Global 1300 encaissé 06/09 (salon Agro Lyon)                                                       |
| EV-2026-0137 | Salima Benhima, Agadir            | t3 conjoint Français                                     | base / comptant       | 1 / TLS / non             | — (complexe : avocat avant solde)                                                                  |
| EV-2026-0136 | Mehdi Tazi, Agadir                | DYNAMIC famille_ue/dependent                             | base / comptant       | 3 / TLS / non             | Pack 700 dû (père espagnol Valence, pas de pièces hors UE)                                         |
| EV-2026-0135 | Rachid & Nadia Amzil, Ait Melloul | DYNAMIC visite_generale/commercant/mariés/mineur         | voyage / comptant     | 5 / TLS / **oui**         | Pack+pré-résa 1000 encaissé 23/08 + Pré-résa 300 encaissé 04/09 (enfant 9 ans, sortie à légaliser) |
| EV-2026-0134 | Abdellah Ouchen, Biougra          | eout étudiant                                            | base / comptant       | 1 / TLS / non             | Orientation 100 encaissé 19/08 (orienté Campus France, aucun dossier)                              |
| EV-2026-0133 | Naima Lahlou, Agadir              | DYNAMIC tourisme/agriculteur/mariée/conjoint sans emploi | base / comptant       | 7 / TLS / **oui**         | Pack 700 encaissé 31/08                                                                            |

Couvre étapes 1,2,3,4,5,6,7,7 · packs base/voyage/global · comptant + acompte ·
autorisé oui/non · solo/couple+mineur · standard/attention/complexe.

**EN:** Seed creates the back-office user from `ADMIN_*` plus these 9 demo files only when
the table is empty. Promote the seeded account to `ceo` before real use.

---

## 13. Documents & upload

- Slots : `france_tls` (France·TLScontact, PDF seul), `espagne_bls` (Espagne·BLS, PDF seul),
  `autre` (tout format). UI : `src/components/dossier/documents-panel.tsx` (10 Mo,
  `FileReader.readAsDataURL`, PDF Slots + fichiers multiples, bannière si non autorisé —
  les docs existants restent visibles).
- Serveur (`documents.ts`) : vérifie dossier + `uploadAutorise` (le bouton désactivé n'est
  pas une sécurité), `mimeType==application/pdf` + en-tête `%PDF-` (pas l'extension),
  base64 valide, taille. **Contenu actif refusé** (HTML/SVG/JS/XML) même en `autre`.
  Liste sans `dataBase64` ; téléchargement via `/documents/:uuid` : slots consulaires en
  `inline` PDF forcé, `autre` en `attachment` + `octet-stream` + `nosniff` (jamais le
  mimeType stocké), nom de fichier assaini + `filename*`.
- Gate : CEO/Réception (`setUploadAutorisation`, log `dossier.autorisation`,
  `AutorisationBadge`). Étape 7 gelée.

---

## 14. Paiements & pilotage CEO / Payments & CEO ops

- Écran `/paiements` : stats (`getPaiementsStats` : encaissé/attente/n), `getPackCounts`,
  impayés/encaissements bornés, `encaisser(id,index)` (date du jour si vide, log
  `paiement.encaissement: {montant} MAD encaissés ({libelle})`), `changerPack/
setModalitePaiement` (via `reglerEcheancier`, logs `paiement.pack/modalite`).
- `/ops` CEO (`ops.ts`) : `getPaiementsSuivi` (totaux, par modalité, soldes dus étape≥6,
  acomptes en retard modalité=acompte étape≥2, journal `paiement.%` × 40),
  `getAnalytics` (KPIs total/actifs/encaissé/ticket moyen/taux approbation + pipeline,
  par niveau/pack/centre/décision/modalité, ouvertures/encaissements par semaine,
  production par rôle, top 12 agents, activité 30 j), `listActivity` (200),
  équipe (`listUsers/createUser/updateUserRole/deleteUser`, fiche `UserProfile` +
  `fetchUserProfile`, photo, reset password), exports PDF (`exportOpsPdf`,
  `exportElementPdf`, `exportRapportTable`).

---

## 15. Design system

`src/styles.css` (Tailwind v4 `source(none)`, `tw-animate-css`) : concept
**registre de dossier** — blanc, filets fins, ombre douce ; forest sur le Rail seul,
terracotta pour action/statut. Tokens : `background/foreground/card/popover/primary
(marine)/secondary/muted/accent/destructive/border/input/ring`, `rail/*`, `ok/warn/
stop/info + soft`, `panel-shadow`. Fonts : `sans Quicksand/Poppins/Plus Jakarta`,
`mono Space Mono` (réfs, classe `ref`), `display Quicksand/Fraunces` (titres).
Utilitaires : `panel`, `dot`, `page-title`, `num-display`. Scrollbar 10 px, `lucide`
1.5 px. Exception `.login-rounded` (lavande/crème, pill 999px, Quicksand seul) pour
login + ops-login. Print `@page 1.5cm` pour le reçu. Décorations `src/assets/
decorations/*` (21 PNG : `logo-eiden`, `perimetre-*`, `stamp-*`, `ops-security-icons`)

- `eiden-visa-dossier-stickers.png` (login). Icônes jamais seules : légende + couleur.

**Landing page :** FR — `landing-page/src/styles.css` contient une **copie** des tokens
(marine, lavande/crème du login, `ok`/`stop`, Quicksand + Space Mono) pour garder la même
identité sans dépendre de `src/styles.css` : à resynchroniser à la main si la charte
change. Logo officiel en image : `public/images/logo-eiden-visa.webp` (couleur, header,
composant `Logo` de `components/decor.tsx`) et `logo-eiden-visa-blanc.webp` (blanc, loader).
EN — the landing keeps a **copy** of the app tokens (resync by hand if the brand changes);
the official logo ships as two images (colour in the header, white in the loader).

---

## 16. Arborescence complète / Full file tree

```
.env.example  docker-compose.yml  drizzle.config.ts  vite.config.ts
tsconfig.json  components.json  eslint.config.js  .prettierrc  .prettierignore
.gitattributes  .gitignore  bunfig.toml  bun.lock  package-lock.json  package.json
public/robots.txt  public/favicon.ico  public/icon-512.png  public/apple-touch-icon.png
.lovable/project.json
scripts/seed.ts
src/start.ts  src/server.ts  src/router.tsx  src/routeTree.gen.ts (généré)
src/styles.css
src/routes/__root.tsx  src/routes/_app.tsx
src/routes/_app/index.tsx  src/routes/_app/qualification.tsx
src/routes/_app/dossiers/index.tsx  src/routes/_app/dossiers/$id.tsx
src/routes/_app/paiements.tsx  src/routes/_app/referentiel.tsx  src/routes/_app/profil.tsx
src/routes/_app/rdv-watch.tsx (surveillance RDV)
src/routes/login.tsx  src/routes/ops.tsx  src/routes/confidentialite.tsx
src/routes/dossiers.$id.recu.tsx  src/routes/README.md (conventions routage)
src/backend/db/schema.ts  src/backend/db/client.ts  src/backend/auth.ts
src/backend/functions/auth.ts  src/backend/functions/dossiers.ts
src/backend/functions/documents.ts  src/backend/functions/assignments.ts
src/backend/functions/rdvWatches.ts
scripts/rdv_watcher.py (surveillance RDV — hors chaîne npm, voir §21)
src/backend/functions/ops.ts  src/backend/functions/profile.ts
src/lib/visa-rules.ts  src/lib/dossier-model.ts  src/lib/store.tsx  src/lib/seed.ts
src/lib/ops-pdf.ts  src/lib/serve-document.ts  src/lib/image.ts  src/lib/utils.ts (cn)
src/lib/error-page.ts  src/lib/error-capture.ts  src/lib/lovable-error-reporting.ts
src/hooks/use-mobile.tsx
src/components/dossier/kanban.tsx  src/components/dossier/documents-panel.tsx
src/components/dossier/badges.tsx  src/components/dossier/assignation-card.tsx
src/components/layout/Rail.tsx  src/components/layout/profile-chip.tsx
src/components/layout/notification-bell.tsx
src/components/ops/user-profile.tsx  src/components/ops/analytics-panel.tsx
src/components/filters/date-range-filter.tsx  src/components/profile-parts.tsx
src/components/ui/* (45 : accordion alert alert-dialog aspect-ratio avatar badge
  breadcrumb button calendar card carousel chart checkbox collapsible command
  context-menu dialog drawer dropdown-menu form hover-card input input-otp label
  menubar navigation-menu pagination popover progress radio-group resizable
  scroll-area select separator sheet sidebar skeleton slider sonner switch table
  tabs textarea toggle toggle-group tooltip)
src/assets/eiden-visa-dossier-stickers.png
src/assets/decorations/logo-eiden.png  ops-security-icons.png
  perimetre-travail/tourisme/sante/etudes.png
  stamp-visa-approved/time/rendezvous/passport/name/male/female/family/
  encaissement/eiden/dossier/date/child/boarding-pass/alerte.png
landing-page/ (projet autonome / standalone)
  package.json  package-lock.json  vite.config.ts  tsconfig.json  index.html
  .gitignore  README.md  public/favicon.ico  public/apple-touch-icon.png
  src/main.tsx  src/App.tsx  src/styles.css
.claude/launch.json (preview landing :5180 dans Claude Code desktop)
```

Aucun test (`*.test.*`), aucun `Dockerfile`, aucun workflow CI — voir §18.

---

## 17. Scripts npm

| Script                    | Commande                        | Usage                                                |
| ------------------------- | ------------------------------- | ---------------------------------------------------- |
| `dev`                     | `vite dev`                      | dev local                                            |
| `build`                   | `vite build`                    | build prod (Nitro vercel)                            |
| `build:dev`               | `vite build --mode development` | build dev                                            |
| `preview`                 | `vite preview`                  | prévisualiser le build                               |
| `lint`                    | `eslint .`                      | 0 erreur exigée (`.vercel/.nitro/.tanstack` ignorés) |
| `typecheck`               | `tsc --noEmit`                  | types stricts                                        |
| `format` / `format:check` | `prettier --write/check .`      | LF normalisé (`.gitattributes eol=lf`)               |
| `db:up`                   | `docker compose up -d`          | Postgres locale :5435                                |
| `db:push`                 | `drizzle-kit push`              | applique le schema (sans migrations versionnées)     |
| `db:seed`                 | `tsx scripts/seed.ts`           | admin + seed si vide                                 |
| `db:setup`                | `db:up && db:push && db:seed`   | installation complète                                |

Landing page — scripts à lancer **dans `landing-page/`** (ou `npm --prefix landing-page run <script>`) /
_run inside `landing-page/`_ :

| Script      | Commande                     | Usage                                |
| ----------- | ---------------------------- | ------------------------------------ |
| `dev`       | `vite`                       | dev local http://localhost:5180      |
| `build`     | `tsc --noEmit && vite build` | build statique → `landing-page/dist` |
| `preview`   | `vite preview`               | prévisualiser le build (:5181)       |
| `typecheck` | `tsc --noEmit`               | types stricts                        |

---

## 18. Production ready

**Vérifié :** `typecheck` OK · `lint` 0 erreur · `build` OK · `format` normalisé (LF).
Correctifs appliqués : nom package `tanstack_start_ts → eiden-visa`, `engines node>=20`,
scripts `typecheck/format:check`, ignores ESLint/Prettier `.vercel/.nitro/.tanstack`,
`robots.txt` resserré (seuls `/login` + `/confidentialite` indexables ; `/ops`,
`/dossiers`, `/profil`, `/paiements`, `/qualification` interdits), `.gitattributes` LF.

**Cible d'hébergement : différée** (choix utilisateur : « leave it to later »).
État actuel : preset Nitro `vercel` (un build local/Vercel l'utilise ; le bouton Publish
Lovable force `cloudflare-module` dans son sandbox — voir `vite.config.ts`), DB locale
via compose. Avant d'ouvrir en prod, quel que soit l'hôte :

1. Secrets : `SESSION_PASSWORD` aléatoire 32+, `ADMIN_PASSWORD` fort, `DATABASE_URL`
   managée + sauvegardes. Rotation du compte seed + passage en `ceo`.
2. DB : versionner les migrations (`drizzle/` absent — aujourd'hui `push` direct),
   sauvegardes, `prepare:false` conservé derrière pooler.
3. Sécurité : HTTPS (cookie `secure` auto en prod), CSRF Start conservé (`start.ts`),
   zod sur toutes les serverFn, 10 Mo + `%PDF-` conservés, logs `activity_log`
   surveillés, UUID `/documents` non énumérables + session requise.
4. Limites connues : documents en base64 (OK volumes agence ; migrer vers stockage objet
   si > dizaines de Mo), frein login/flux en mémoire (best-effort en serverless —
   persistant recommandé si abuse), pas de tests automatisés, double
   lockfile (`bun.lock` + `package-lock.json` — npm utilise le second), table `sessions`
   morte (ne pas utiliser sans migration).
5. Risques acceptés et tracés : CVE `GHSA-67mh-4wv8-2f99` (esbuild dev-only sous
   `drizzle-kit`, `npm audit --omit=dev` vert — jamais servi en prod) ; lecture
   passeports/docs par tous les rôles (petite équipe, à durcir en `redaction`
   si l'équipe grandit) ; `rdv_watcher.py` avec plein droit DB (réduire à
   SELECT/UPDATE `rdv_watches` + INSERT `notifications` quand possible).
6. SEO/robots : privé désindexé (fait) ; vérifier en-têtes HTTPS/hôte à la mise en ligne.
7. Landing page : FR — hébergement aussi différé ; déployable seule comme site statique
   (ex. projet Vercel séparé avec Root Directory = `landing-page`, sortie `dist`) sans
   toucher au preset Nitro de l'app. Avant mise en ligne : remplir `CONTACT` dans
   `landing-page/src/App.tsx` (WhatsApp/email vides → le bouton pointe sur `#contact`).
   EN — hosting deferred too; deploy as its own static site; fill `CONTACT` first.

---

## 19. Dépannage / Troubleshooting

| Symptôme                                              | Cause / fix                                                                               |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `DATABASE_URL manquant` / `SESSION_PASSWORD manquant` | `.env` absent — `cp .env.example .env`, `docker compose up -d`.                           |
| Connexion impossible en LAN HTTP                      | cookie `Secure` rejeté hors HTTPS — normal en dev (`secure=false`), OK en prod HTTPS.     |
| `prepared statement already exists` sur `/ops`        | pooler transaction — garder `prepare:false` (`db/client.ts`).                             |
| Page blanche `args.reduce is not a function`          | `dotenv` importé côté client — dotenv uniquement en config Node (`vite.config.ts`).       |
| PDF analytique vide/erreur couleur                    | couleurs `oklch` — fallback tableau auto (`exportRapportTable`), fix Firefox déjà inclus. |
| `lint` interminable                                   | `.vercel` scanné — corrigé via ignores (fait). Relancer `npm run lint`.                   |
| CRLF `Delete ␍`                                       | fins de ligne Windows — `npm run format`, verrouillé par `.gitattributes`.                |
| Seed : `dossiers déjà en base`                        | normal — seed dossiers seulement si table vide ; admin en `onConflictDoNothing`.          |
| Build Lovable vs Vercel différent                     | sandbox Lovable force Cloudflare, local/Vercel utilise `vercel` (voir `vite.config.ts`).  |

---

## 20. Surveillance RDV / appointment watch

Écran `/rdv-watch` + table `rdv_watches` + `scripts/rdv_watcher.py` (Python, hors chaîne
npm : `pip install psycopg2-binary requests`, puis `python3 scripts/rdv_watcher.py --loop`).

**Ce que c'est :** on colle une URL publique dans l'app, un script la relit à intervalle
régulier (plancher 60 s, `interval_seconds` par ligne) et, si le contenu change, insère une
notification `info` pour toute l'équipe — avec l'URL, d'où le bouton « Voir » de la cloche.
Rien n'est codé en dur : la liste des URLs vient de la table, remplie depuis l'écran.

**Ce que ce n'est pas :** le script ne se connecte à aucun compte, ne remplit aucun
formulaire et ne réserve rien. Il lit une page publique, comme un humain qui rafraîchit.
C'est un humain qui va réserver, sur le site officiel.

> **Limite constatée (2026-09-29) :** TLScontact n'expose aucune page publique de
> disponibilité — tout est derrière authentification — et Cloudflare renvoie **403 à tout
> client non-navigateur**, y compris sur les pages publiques. L'outil est donc **sans cible
> TLScontact exploitable**. Il reste valable pour un site public non protégé par ce type de
> filtre. La voie légitime pour obtenir de la visibilité sur les créneaux est un accès
> professionnel négocié directement avec TLScontact.

---

## 21. Journal des sessions / session log

Travaux menés sur le back-office, du plus récent au plus ancien. Le détail fichier par
fichier est dans `git log` ; cette section donne le **pourquoi**.

| Date       | Chantier                               | Ce qui a changé et pourquoi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-02 | Hébergeant posé en dernier             | « Chez qui allez-vous séjourner ? » et ses 3 questions de saisie sortent du milieu du tronc commun et passent **après** la dernière question de la branche. Elles interrompant le client pour savoir qui l'héberge alors qu'il venait de choisir son motif — or rien dans le motif ne dépend du lien de parenté, alors que la pièce « attestation d'accueil » en dépend entièrement. Le basculement est fait dans `goToResult()`, seul point d'arrivée vers un résultat dans tout le questionnaire : insérer le nœud dans les ~25 branches terminales serait fragile (un motif oublié = un dossier sans attestation d'accueil), un point unique ne peut pas être oublié. Vérifié par simulation sur 200 parcours aléatoires `hebergement = personne`. |
| 2026-10-02 | Q1Recentrée sur Schengen               | « Avez-vous déjà obtenu un visa pour la France ? » → « … un visa **Schengen** au cours des **59 derniers mois** ? ». La formulation demandée collait au seuil des 59 mois, mais l'ancienne ne portait que sur la France alors que la règle est européenne ; `q3` (date d'obtention + date du jour) et le calcul de l'écart en dépendent.                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-10-02 | Fin de l'autobus                       | Retiré du questionnaire de transport (avion / bateau). **Pas** retiré du type `Profile["transport"]` ni de l'énumération zod serveur : les dossiers créés avant le retrait gardent `autobus` et doivent pouvoir être relus et sauvegardés. Seul le libellé générique de la pièce passe de « (avion, autobus ou bateau) » à « (avion ou bateau) ».                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-10-01 | Parcours 6 → 5 étapes                  | Rendez-vous avant rassemblement : le créneau est la ressource rare, on le sécurise d'abord et on monte le dossier pour la date obtenue. Le reçu passe à l'étape 1, puisqu'il dit au client quoi rapporter. Solde à l'étape 4, dernier moment où le client est en agence — l'étape 5 est la décision, donc après le dépôt. Les 12 dossiers en base ont été remappés par **sens** (1→1, 2→4, 3→2, 4→3, 5→4, 6→5) et non par numéro.                                                                                                                                                                                                                                                                                                                     |
| 2026-10-01 | Notes d'équipe                         | `notes_agent` (jsonb signé + horodaté serveur). L'équipe n'avait aucun endroit pour se transmettre un appel passé ou une pièce promise ; `notes` servait déjà aux observations générées par la qualification, mélanger les deux aurait rendu les deux moins fiables.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-10-01 | Dates de séjour modifiables            | `voyageDebut/Fin` ajoutées à `updateClient` (validateur zod **et** UPDATE SQL). Elles étaient saisies à l'ouverture puis **figées à jamais**, alors qu'elles pilotent tout le contrôle de validité du passeport : une faute de frappe rendait l'alerte incorrigible.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-10-01 | Validité du passeport, 3 cas distincts | `passeportStatut()` remplace un booléen qui confondait « périmé », « expire pendant le séjour » et « marge de 3 mois non tenue ». Un passeport qui meurt en France n'est pas « un peu court ». Expiration pré-remplie à +5 ans (passeport marocain).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-09-30 | Long séjour (Visa D)                   | Arbre complet : 5 branches, 24 nœuds, `buildLongSejour`. Le menu long séjour n'était qu'un placeholder. Garde-fous de durée pour ne pas produire une liste fausse quand le dossier relève en fait du court séjour.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-09-30 | Vue par étape                          | `PANNEAUX_ETAPE` : chaque étape n'affiche que ses panneaux (4–5 au lieu de 8), avec « Tout afficher » comme échappatoire. La fiche montrait tout à tout le monde, ce qui noyait l'agent. Le badge `niveau`, figé à l'ouverture, cède la place à la checklist d'étape sur les cartes et la liste.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-09-30 | Jalons externes                        | Reçu / France-Visas / rendez-vous, déclarés par l'agent avec preuve, datés par le serveur. Un dossier pouvait atteindre l'étape rendez-vous sans que rien n'ait été créé sur le portail.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-09-29 | Parcours 7 → 6 étapes                  | Étapes recentrées sur le déroulé réel, acompte étape 2 et solde étape 5 (avant le départ au centre, plus après la décision). Les 24 dossiers existants ont été repositionnés à l'étape 1, le sens des étapes ayant changé.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-09-29 | Fil de qualification persisté          | `qualification` (jsonb) : les questions réellement posées à CE client, figées à l'ouverture. Elles n'étaient **jamais sauvegardées** — l'état local disparaissait à la création du dossier.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-09-29 | Passeport                              | 4 colonnes + contrôle de la règle Schengen (validité ≥ 3 mois après le retour).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-09-29 | Carrousel de qualification             | Une question par diapo (embla), le résultat n'est plus enterré sous la liste des réponses.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-09-28 | Tronc commun avant le motif            | Hébergement, transport, financement et durée remontés avant le choix du motif : ils étaient dupliqués dans chaque branche. Ajout de la question transport (Abdo) et du financement garant sur la visite familiale, absent alors que la source le prévoyait.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-09-28 | Surveillance RDV                       | Écran + table + script Python (voir §20). Conclusion : sans cible TLScontact exploitable.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-09-26 | Court séjour, corrections de fond      | `c9` (stage salarié) reclassé en court séjour avec sa checklist documentée au lieu d'un placeholder vide ; liste « projet professionnel » restreinte à 6 types ; « Mariage / conjoint » → « En vue de mariage » avec ses 2 questions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

### Pièges rencontrés, à ne pas réapprendre / traps worth remembering

- **zod retire en silence.** Tout champ ajouté à `Profile` ou `Dossier["client"]` doit être
  déclaré dans le validateur de `createDossier` / `updateClient`, sinon il est supprimé à
  l'enregistrement sans la moindre erreur. Arrivé trois fois : `transport`, les champs
  long séjour, `voyageDebut/Fin`.
- **La fusion des réponses est superficielle** (`{...profile, ...opt.set}`) : d'où des
  champs `Profile` à plat, jamais imbriqués.
- **`drizzle-kit push` ne passe pas sur le pooler Supabase** : les colonnes sont ajoutées
  en `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` exécuté directement.
- **Supprimer un panneau supprime aussi ce qu'il portait.** Retirer le stepper a emporté
  les boutons « étape suivante / précédente », seul moyen de faire avancer un dossier
  depuis sa fiche ; ils ont été remis dans le bandeau d'étape.
- **`landing-page/` ne se touche pas** : dossier d'un autre contributeur, projet autonome.
  Les commits du back-office restent dans `src/`, `scripts/` et la doc.

---

## 22. Changelog (obligatoire / required)

> **Règle (voir `AGENTS.md`) : chaque ajout / modification / suppression — code, config,
> asset, doc — DOIT mettre à jour les sections concernées de ce README (FR+EN) ET ajouter
> une ligne ci-dessous. Pas de fusion sans les deux.**
>
> **Rule: every add/edit/delete MUST update the affected README sections (FR+EN) AND append
> a row below. No merge without both.**

| Date         | Portée / Scope                                                                                     | Fichiers                                                                                                                                                                                                                                                                                                             | Impact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-07   | Landing : refonte UI/UX + SEO des 4 pages légales                                                  | `landing-page/public/legal.css` (nouveau), `public/fonts/*.woff2` (nouveau), `public/conditions.html`, `confidentialite.html`, `cookies.html`, `securite.html`, `public/llms.txt`, `landing-page/README.md`, `README.md` (§22)                                                                                       | Charte identique à la landing : feuille partagée `public/legal.css` (tokens de `styles.css`), **logo réel** `logo-eiden-visa.webp`, topbar marine (tél/e-mail/horaires, icônes dorées) + footer copiant le Footer React, hero dégradé ciel du loader, typographie Newsreader + DM Sans **auto-hébergées** (4 woff2 ≈ 310 Ko — zéro requête externe conservée) ; sommaire ancré, encadrés alerte blush, `aria-current` + focus visible + styles impression. SEO : OG/Twitter complets (image cta-paris), `dateModified` + `publisher` en JSON-LD, fil d'Ariane avec URLs. **Corrections factuelles** : rétention des demandes **13 mois** (purge SQL, avant « 3 ans » dans la page + llms.txt), §3/§7 conditions alignés sur `SCOPE` (le client dépose lui-même au centre TLScontact/BLS), durées cookies tiers « quelques mois à 2 ans selon l'outil ». |
| 2026-10-06   | Fiche dossier : « Modifier » couvre toute la carte « Informations du client »                      | `src/routes/_app/dossiers/$id.tsx`, `src/lib/store.tsx`, `src/backend/functions/dossiers.ts` (`updateDetails`), `README.md` (§5, §22)                                                                                                                                                                                | Un seul formulaire pour tout ce que la carte affiche : identité, origine, séjour, passeport, **centre de dépôt**, **modalité de paiement** (réservée CEO / réception / back-office, recalcule l'échéancier ; si elle est refusée le reste est déjà enregistré et un message le dit) et **les réponses saisies pendant la qualification** (nom de l'hôtel, etc., via `updateDetails`). **Type de visa / Catégorie restent en lecture seule** (ils pilotent la checklist) avec un lien « Refaire la qualification ». Centre et modalité restent aussi modifiables dans leurs cartes.                                                                                                                                                                                                                                                                      |
| 2026-10-05   | Assistant de qualification : « Question précédente » retrouve la réponse donnée                    | `src/routes/_app/qualification.tsx`, `README.md` (§5, §22)                                                                                                                                                                                                                                                           | En revenant en arrière, l'option choisie est cochée (une ou plusieurs), les champs saisis sont réaffichés, et le profil revient à son état d'avant la réponse — une réponse différente ne laisse plus de trace de l'ancienne. `Step` porte `avant`, `idx`, `champs`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-10-05   | Assistant de qualification : réponses données en haut (ouvertes) + cases à cocher + choix multiple | `src/routes/_app/qualification.tsx`, `src/lib/visa-rules.ts` (`TreeNode.multi`, `TreeOption.excl`), `README.md` (§5, §22)                                                                                                                                                                                            | Le récapitulatif « N réponses données » reste en haut de l'assistant, ouvert par défaut, pendant les questions comme sur le résultat. Chaque option affiche une case à cocher ; `garant_frais` (« Quels frais prend-elle en charge ? ») est à choix multiples (« Tous les frais » exclusif) validé par « Continuer ».                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-10-05   | Long séjour : arbre remplacé par celui du PDF « Long séjour » (retour, famille, visiteur, travail) | `src/lib/visa-rules.ts`, `src/backend/functions/dossiers.ts`, `README.md` (§5, §22)                                                                                                                                                                                                                                  | `motif_long` → `ls_type` ; 75 nœuds `ls_*`, 15 clés de résultat ; études / stage / autre motif et `lsTropCourt` supprimés ; schéma zod du profil aligné ; anciens dossiers → `ls_a_requalifier`. Base : colonne `users.session_version` ajoutée à la main sur Supabase (migration e9ef74d jamais appliquée → 500 sur les pages connectées).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-10-02   | Landing : motif signature pages statiques                                                          | `landing-page/public/legal.css`, `404.html`, `500.html`, `conditions/confidentialite/cookies/securite.html`, `README.md` (landing)                                                                                                                                                                                   | Anneau d'étoiles UE en filigrane des heros (SVG inline, zéro requête) + tampon « INTROUVABLE » réservé à la 404 (écho du VerifiedStamp) ; contenus légaux et SEO intacts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-10-02   | Landing : Clarity npm + perf PageSpeed + vercel.json                                               | `landing-page/src/lib/suivi.ts`, `package.json`, `index.html`, `vercel.json`, `README.md` (landing)                                                                                                                                                                                                                  | Clarity via `@microsoft/clarity` (chunk séparé, `init` + `consent`, conversions en smart events) ; LCP préchargé, fonts non-bloquantes, cache immutable images/fonts, en-têtes sécurité minimaux (sans frame-blocking pour GTM Preview)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-10-02   | Landing : pages d'erreur + finitions prod                                                          | `landing-page/public/404.html`, `500.html`, `site.webmanifest`, `icon-*.png`, `humans.txt`, `index.html`, `README.md` (landing)                                                                                                                                                                                      | 404 brandée (vrai statut via Vercel, noindex, FR/AR, même système legal.css + vrai logo), 500 fallback avec request ID, manifeste PWA + icônes, humans.txt, `<noscript>` FR/AR ; aucune config `vercel.json` requise                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-10-02   | Landing : fix build Vercel (`@types/node`) + fonts/legal auto-hébergés                             | `landing-page/package.json`, `public/legal.css`, `public/fonts/*.woff2`                                                                                                                                                                                                                                              | `process.env` dans `vite.config.ts` exigeait les types Node (build Vercel rouge) ; commit des pages légales en feuille partagée + fonts Newsreader/DM Sans auto-hébergées (zéro requête externe, vérifié)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-10-02   | Landing : vérif moteurs écrite au build                                                            | `landing-page/vite.config.ts`, `index.html`, `.env.example`, `package.json`                                                                                                                                                                                                                                          | Plugin Vite `eiden-verification` : métas Search Console/Bing écrites dans le HTML au build (les vérificateurs ne voient pas le JS), extraction du jeton seul, `dotenv` en devDep pour le `.env` local                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-10-02   | Landing : événements GA4 métier imposés                                                            | `landing-page/src/lib/suivi.ts`, `DemandeRapide.tsx`, `README.md` (landing)                                                                                                                                                                                                                                          | `click_phone/whatsapp/email`, `contact_form_start/error/submit`, `appointment_request`, `download` (+ `scroll`, `page_view`) : noms vérifiés contre la doc GA4 (naming rules, réservés) ; guide des balises GTM + dimensions personnalisées dans le README landing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-10-02   | Landing : consentement synchro, verif moteurs, llms-full, audit suivi                              | `landing-page/src/lib/suivi.ts`, `BandeauCookies.tsx`, `i18n/index.tsx`, `robots.txt`, `llms.txt`, `llms-full.txt`, `.well-known/security.txt`, `.env.example`, `index.html`, `README.md` (landing)                                                                                                                  | Bandeau + modale se ferment ensemble (événement `eiden:consentement`) ; vérif Search Console/Bing via `VITE_*` (sans consentement) ; robots avec `Allow` explicites par crawler IA ; `llms.txt` conforme à la spec + `llms-full.txt` + `security.txt` (RFC 9116) ; audit suivi : Consent Mode poussé à chaque choix, stub Clarity officiel, Bing UET officiel, GA4 sans double page_view, scroll 25/50/75/90 %, page_view au changement de langue                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-10-02   | Landing : webp, charte légale, cookies granulaires, reset formulaire                               | `landing-page/public/images/*.webp`, `public/*.html`, `PreferencesCookies.tsx`, `suivi.ts`, `DemandeRapide.tsx`, `README.md` (landing)                                                                                                                                                                               | 10 visuels → webp (PNG sans perte, JPG PSNR ≥ 43 dB) ; pages légales au design EIDEN ; « Gérer mes cookies » ouvre une modale par catégorie (statistiques/expérience/marketing, Consent Mode v2) ; le brouillon ne ressuscite plus après un envoi réussi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-10-02   | Landing : SEO/suivi/consentement/légal complet                                                     | `landing-page/index.html`, `src/lib/suivi.ts`, `BandeauCookies.tsx`, `public/*.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, `.env.example`, `README.md` (landing)                                                                                                                                                 | SEO : titre/desc FR+AR, canonical visa.eiden-group.com, OG/Twitter, géo-tags, JSON-LD vérifié identique à la FAQ ; suivi 100 % consenti (GTM/GA4/Clarity/Bing, dormant sans `VITE_*`) ; 4 pages légales statiques (RC 62623, ICE, loi 09-08) + bandeau accepter/refuser ; détails dans le README landing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-10-02   | Reçu PDF : filets et cases encre marine                                                            | `dossiers.$id.recu.tsx`, `README.md` (§8)                                                                                                                                                                                                                                                                            | Lignes et cases cochées du PDF en marine `--primary` (RVB 28, 30, 45) au lieu du terracotta, comme l'écran                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-10-02   | Reçu client : variante avant/après paiement                                                        | `dossiers.$id.recu.tsx`, `README.md` (§8)                                                                                                                                                                                                                                                                            | Sélecteur « Type de reçu » sur la page : Après paiement (complet, défaut) ou Avant paiement (identique sans la section paiements, écran + PDF)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-10-02   | Landing : complétion du domaine e-mail                                                             | `DemandeRapide.tsx`, `i18n/fr.ts`, `ar.ts`                                                                                                                                                                                                                                                                           | Sous le champ e-mail : `local` → `local@gmail.com / hotmail.com…` (6 domaines, filtrés à la frappe) ; toucher remplit le champ ; FR+AR                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-10-02   | Paquets à jour (tout latest), faille TanStack corrigée                                             | `package.json` (×2), lockfiles, `__root.tsx`, `dossiers.ts` (`z.record` v4), graphes (`formatter` recharts 3), `ops.tsx` (`NavContenu` module), `dossiers/index.tsx`, `use-mobile.tsx`, `overrides` nitro                                                                                                            | `@tanstack/react-start` 1.168.32 → 1.168.60 (corrige le XSS bloqué par Vercel — **redéployer**) ; zod 4, recharts 3, lucide 1.52, framer-motion 14, TS 6 (app) / TS 7 (landing, TS 7 impossible app : `typescript-eslint` plafonne à <6.1) ; `overrides.nitro` contre le conflit peer du template                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-10-02   | Boussole : profession Entrepreneur(e) + 11 pièces                                                  | `visa-rules.ts` (`prof`, `PROF_LABEL`, `professionDocsTourisme`, `a/b_profession`, `profDoc`), `dossiers.ts` (enum zod), `README.md` (§9)                                                                                                                                                                            | Nouvelle réponse « Entrepreneur(e) » (tourisme + visite familiale, avant « Sans profession ») avec checklist RC/immatriculation/statuts/ICE/IF/patente-IRG/fiscal/banque pro/activité/revenus ; validateur serveur aligné (sinon 400) ; `commercant` et long séjour inchangés                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-10-02   | Sécu P0 : téléchargements sûrs + validateurs + flux BMS durci                                      | `serve-document.ts`, `documents.ts`, `dossiers.ts` (validateurs), `landing-page/api/contacts-feed.ts`, `save-contact.ts`, `schema.sql`, `.env.example`                                                                                                                                                               | `autre` en `attachment`+`octet-stream`+`nosniff` (mime stocké jamais rejoué), contenu actif refusé à l'upload, bornes zod partout, feed BMS : clé temps-constant ≥32B, colonnes minimales, limite 100/50, timeout 5 s, erreurs génériques, frein IP ; RLS : longueurs CHECK + `REVOKE/GRANT`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-10-02   | Sécu P1 : matrice des rôles + sessions révocables + frein login                                    | `functions/auth.ts`, `backend/auth.ts`, `schema.ts` (`session_version`), `dossiers.ts`, `documents.ts`, `ops.ts`, `profile.ts`, `rdvWatches.ts`, `scripts/seed.ts`, `routes/ops.tsx`                                                                                                                                 | Argent/décision/suppression réservés par rôle (+ anti-lockout dernier CEO), cookie 7 j + secret ≥32, révocation au changement de mot de passe, login freiné + anti-énumération, seed admin `ceo`, synthèse `/ops` bornée (300) ; **migration : `npm run db:push` (colonne `session_version`), une reconnexion requise**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-10-02   | Sécu P2 : SSRF + transactions + rétention                                                          | `rdvWatches.ts`, `scripts/rdv_watcher.py`, `dossiers.ts` (transactions), `schema.sql`, `DemandeRapide.tsx` (`maxLength`)                                                                                                                                                                                             | URLs de surveillance : HTTPS public uniquement (littéraux + revérification DNS démon), quota 20, proprio-ou-CEO ; démon : 2 Mo max + IP publiques ; lectures-modifications jsonb en transactions ; `maxLength` + plafonds alignés CHECK ; purge 13 mois documentée                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-10-02   | Sécu P3 : dépendances + hygiène                                                                    | `package.json` (×2), lockfiles, `docker-compose.yml`, `drizzle.config.ts`, `.env.example`                                                                                                                                                                                                                            | `drizzle-kit` 0.18.1 → 0.31.11 (retour ligne à jour), rolldown 1.2.12, vite 8.3.2, react 19.3, drizzle-orm 0.45.3 ; compose lié à 127.0.0.1, `DATABASE_URL` explicite, mots de passe ≥12 ; cassants reportés (`recharts` 3, `framer-motion` 14, `zod` v4)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-10-02   | Boussole : Q1 sur le visa Schengen / 59 mois, hébergeant en dernière question, plus d'autobus      | `visa-rules.ts`, `routes/_app/qualification.tsx`, `README.md` (§9, §21, §22)                                                                                                                                                                                                                                         | Q1 devient « Avez-vous déjà obtenu un visa Schengen au cours des 59 derniers mois ? » (elle portait sur « un visa pour la France », alors que le seuil des 59 mois se calcule sur l'espace Schengen) ; les 4 questions d'hébergeant ne sont plus posées au milieu du tronc commun mais **après** la dernière question de la branche, via un entonnoir dans `goToResult` — un seul point à instrumenter au lieu d'une insertion dans chaque branche terminale, donc aucun motif ne peut omettre la pièce « attestation d'accueil » ; « Autobus » retiré du questionnaire (avion / bateau), la valeur reste lisible pour les dossiers déjà enregistrés                                                                                                                                                                                                    |
| 2026-10-02   | Landing : ordre du menu (Méthodes avant Services)                                                  | `content.ts` (`NAV`), `i18n/fr.ts`, `ar.ts`                                                                                                                                                                                                                                                                          | Ancres + libellés FR/AR réordonnés ; label AR de `visa` aligné (« منهجيتنا »)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-10-02   | Landing : vol du loader en miroir en arabe                                                         | `Loader.tsx`, `styles.css`                                                                                                                                                                                                                                                                                           | En arabe l'avion traverse de droite à gauche (image retournée avec ses traînées par un seul `scaleX: -1`, rideau `-100deg` compté depuis la droite) ; Méthode inchangée (suit déjà le sens de lecture)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-10-02   | Landing : drapeaux ondulants dans la Demande rapide                                                | `DemandeRapide.tsx`                                                                                                                                                                                                                                                                                                  | Drapeaux 4:3 avec vague douce (filtre SVG `#drapeau-vague`, `scale` 2.2) + reflet de plis                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-10-02   | Landing : drapeaux des destinations + brouillon persistant                                         | `DemandeRapide.tsx`, `public/images/flags/` (29 SVG), brouillon `localStorage`                                                                                                                                                                                                                                       | Drapeau par pays au lieu du code ISO ; rouvrir retrouve champs + étape, oublié après envoi ; CTA pack prime sur le brouillon                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-10-02   | Landing : demandes sauvegardées dans Supabase + flux BMS                                           | `landing-page/api/contacts-feed.ts` (nouveau), `landing-page/src/lib/supabase.ts`, `save-contact.ts` (nouveaux), `DemandeRapide.tsx`, `tsconfig.json`, `package.json`, `supabase/schema.sql`, `.env.example`, `landing-page/README.md`, `README.md` (§3)                                                             | Chaque « Demande rapide » est enregistrée dans `landing_contacts` (RLS anon INSERT seul) **en plus** de WhatsApp (silencieux en cas d'échec) ; `GET /api/contacts-feed` (serverless, `X-API-Key`) expose les lignes au BMS Website Contacts sans code BMS (`CONTACT_SOURCE_N_*` env) ; secrets serveur jamais `VITE_` — **restant : exécuter `schema.sql`, renseigner les env, brancher le triple BMS**                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-10-01   | Back-office : parcours 6 → 5 étapes                                                                | `dossier-model.ts`, `backend/functions/dossiers.ts`, `backend/functions/ops.ts`, `dossiers/$id.tsx`, `dossiers/index.tsx`, `seed.ts`, `README.md` (§5, §6, §8, §11, §21)                                                                                                                                             | Réception → France-Visas/RCPC → prise de RDV → rassemblement → décision ; jalons, checklists, panneaux par étape et bornes remappés ; acompte étape 2, solde étape 4 ; **migration : 12 dossiers remappés par sens (1→1, 2→4, 3→2, 4→3, 5→4, 6→5)**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-10-01   | Back-office : calcul de la règle des 59 mois                                                       | `date-calc.ts`, `visa-rules.ts`, `qualification.tsx`, `README.md` (§5, §22)                                                                                                                                                                                                                                          | Deux dates saisies **par l'agent** (obtention du visa, date du jour — jamais l'horloge du poste) et l'écart calculé en dessous : mois calendaires, jours, et de quel côté du seuil de 59 mois il tombe. Affichage factuel : aucun verdict « joindre / ne pas joindre » et pas de réponse dérivée — c'est l'agent qui tranche à la question posée plus loin. Obtention postérieure à la date du jour signalée                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-10-01   | Back-office : notes d'équipe + dates de séjour modifiables                                         | `dossier-model.ts`, `schema.ts`, `backend/functions/dossiers.ts`, `store.tsx`, `dossiers/$id.tsx`, `qualification.tsx`, `seed.ts`, `README.md` (§5, §8, §11, §21)                                                                                                                                                    | Notes signées et horodatées par le serveur (`notes_agent`), visibles à toutes les étapes ; dates de séjour enfin modifiables après l'ouverture (elles étaient figées alors qu'elles pilotent le contrôle du passeport) ; migration `notes_agent`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-10-01   | Back-office : validité du passeport, trois cas distincts                                           | `dossier-model.ts`, `date-calc.ts`, `dossiers/$id.tsx`, `qualification.tsx`, `README.md` (§5)                                                                                                                                                                                                                        | « Passeport expiré », « Expire pendant le séjour » et « Validité insuffisante » ne sont plus confondus ; date de validité minimale affichée ; un passeport périmé est signalé même sans dates de voyage ; expiration pré-remplie à +5 ans                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-09-30   | Back-office : long séjour (Visa D) + vue par étape                                                 | `visa-rules.ts`, `dossier-model.ts`, `backend/functions/dossiers.ts`, `dossiers/$id.tsx`, `dossiers/index.tsx`, `kanban.tsx`, `README.md` (§5, §9)                                                                                                                                                                   | Arbre long séjour complet (5 branches, 24 nœuds, `buildLongSejour`) ; chaque étape n'affiche que ses panneaux ; checklist d'étape à la place du badge `niveau` figé ; jalons France-Visas / RDV / reçu déclarés avec preuve                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-09-30   | Landing : couleurs du loader alignées sur `loader-bg.png`                                          | `landing-page/src/styles.css`, `src/components/Loader.tsx`, `index.html`, `README.md` (§20)                                                                                                                                                                                                                          | Fond de secours du rideau (et fond avant JS) : ciel bleu, pierre dorée, marine au lieu du coucher de soleil ; voile marine (bleu UE) + halo sombre derrière la marque pour lire le texte blanc ; ombres du texte et de l'avion en marine                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-09-30   | Landing : menu mobile plein écran                                                                  | `landing-page/src/sections/Header.tsx`, `src/i18n/fr.ts`, `ar.ts`, `README.md` (§20)                                                                                                                                                                                                                                 | Menu < 1280 px : panneau marine plein écran ouvert en cercle depuis le bouton, liens numérotés en grand qui montent un à un, section courante marquée d'un avion, tampon Schengen en filigrane, boutons « Commencer » / « Nous contacter », choix FR / العربية ; bouton burger marine qui se croise en X ; Échap / focus gérés                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-09-30   | Landing : grand tampon rond au milieu de la page                                                   | `landing-page/src/styles.css`, `App.tsx`, `sections/Hero.tsx`, `public/images/tampon-schengen-rond.webp`, `README.md` (§20)                                                                                                                                                                                          | Tampon rond rouge déplacé du hero vers `main::before` : très grand (jusqu'à 820 px), à mi-hauteur de la page côté droit (gauche en arabe), derrière tout le contenu, opacité 7 à 9 %, visible aussi sur mobile ; image ré-exportée en 880 px                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-09-30   | Landing : tampons Schengen en filigrane                                                            | `landing-page/src/styles.css`, `sections/Hero.tsx`, `Faq.tsx`, `components/decor.tsx`, `public/images/tampon-schengen-*.webp`, `landing-page/README.md`, `README.md` (§20)                                                                                                                                           | Croquis tour Eiffel (hero, FAQ) remplacés par 2 tampons « Schengen Visa » (rond rouge, rectangulaire bleu) en `::before` / `::after`, opacité 10 %, fond transparent ; `EiffelSketch` supprimé ; desktop uniquement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-09-30   | Landing : méthode en trajet d'avion animé                                                          | `landing-page/src/sections/Methode.tsx`, `src/lib/gsap.ts` (MotionPathPlugin), `styles.css`, `README.md` (§20)                                                                                                                                                                                                       | Fil en pointillés avec petits arcs entre les 6 étapes ; un avion vole d'étape en étape en boucle, trace le pointillé en rouge et allume chaque pastille (halo) ; colonne verticale sur mobile/tablette ; pause hors écran ; contenu et icônes inchangés                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-09-30   | Landing : cartes packs façon « billet » au survol                                                  | `landing-page/src/sections/Packs.tsx`, `README.md` (§20)                                                                                                                                                                                                                                                             | Photo plein cadre, nom + accroche dans un panneau blanc en bas ; au hover (ou focus clavier) le panneau s'ouvre sur la liste incluse et le bouton ; tout visible sur écrans tactiles ; contenu inchangé                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-09-30   | Landing : loader avion + animations entrée/sortie au scroll                                        | `landing-page/src/components/Loader.tsx` (nouveau), `src/lib/intro.ts` (nouveau), `src/lib/gsap.ts`, `components/motion.tsx`, `App.tsx`, `sections/Hero.tsx`, `Cta.tsx`, `Header.tsx`, `Temoignages.tsx`, `i18n/fr.ts`, `ar.ts`, `styles.css`, `index.html`, `public/images/loader-*.webp`, `landing-page/README.md` | Loader : ciel au coucher du soleil, un avion le traverse de gauche à droite et le découpe comme un rideau pour révéler la landing ; hero/header animés au passage de l'avion ; blocs, textes et boutons avec entrée et sortie visibles au scroll ; parallaxe hero et CTA ; rien de changé côté app                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-09-30   | Landing : nouveaux textes des cartes « Pourquoi » FR/AR                                            | `landing-page/src/i18n/fr.ts`, `ar.ts`, `README.md` (§20)                                                                                                                                                                                                                                                            | Cartes : Dossier complet, Justificatifs adaptés, Dossier vérifié, Plus de sérénité (titre + description) ; traduction arabe ; surtitre « Pourquoi EIDEN Visa ? »                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-09-30   | Landing : cartes « Pourquoi » en accordéon au survol                                               | `landing-page/src/sections/Pourquoi.tsx`, `README.md` (§20)                                                                                                                                                                                                                                                          | Cartes image plein fond, titre seul ; au hover la carte s'élargit (lg+) et la description apparaît (animation fluide) ; icônes retirées ; description toujours visible sur écrans tactiles                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-09-30   | Landing : FAQ + packs FR/AR, packs sans prix                                                       | `landing-page/src/i18n/fr.ts`, `ar.ts`, `content.ts`, `sections/Packs.tsx`, `Faq.tsx`, `landing-page/README.md`, `README.md` (§3)                                                                                                                                                                                    | FAQ remplacée par 4 questions (pré-réservations, assurance, frais de RDV, pas de garantie) ; packs Standard / Essentiel / Global sans prix ; textes traduits en arabe ; FAQ en 2 colonnes égales                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-09-30   | Landing : « France-Visas » remplacé par « visa Schengen »                                          | `landing-page/src/i18n/fr.ts`, `ar.ts`, `index.html`, `README.md` (§20)                                                                                                                                                                                                                                              | Texte du hero et meta description : « dossier de visa Schengen » ; packs : « Formulaire de visa Schengen » (AR : « ملف تأشيرة شنغن » / « استمارة تأشيرة شنغن ») ; plus aucune mention de France-Visas sur la landing                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-09-30   | Landing : barres de défilement aux couleurs du site                                                | `landing-page/src/styles.css`, `README.md` (§20)                                                                                                                                                                                                                                                                     | Page : piste crème, pouce marine en pilule (12 px) qui passe au rouge au survol ; popup, listes et menu : version fine (8 px) sur piste transparente ; Firefox : `scrollbar-color` / `scrollbar-width` ; en couche base (le carrousel reste sans barre)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-09-30   | Landing : menu mobile en version claire                                                            | `landing-page/src/sections/Header.tsx`, `README.md` (§20)                                                                                                                                                                                                                                                            | Panneau plein écran crème au lieu de marine, lueur rouge supprimée, tampon Schengen conservé (couleurs d'origine, 8 %) ; liens marine, section courante en rouge ; « Nous contacter » en bouton clair ; logo et bouton de fermeture restent lisibles sur fond clair                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-09-30   | Landing : cartes « Pourquoi » en carrousel sur mobile / tablette                                   | `landing-page/src/sections/Pourquoi.tsx`, `README.md` (§20)                                                                                                                                                                                                                                                          | Sous 1024 px : carrousel pleine largeur à aimantation ; la carte centrée est ouverte (description qui apparaît comme au survol desktop), les autres en retrait (92 %, plus pâles) ; points de position cliquables, toucher une carte la centre ; desktop inchangé (accordéon au survol)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-09-30   | Landing : badges « dock + étiquette de bagage » et listes déroulantes sur mesure                   | `landing-page/src/components/DemandeRapide.tsx`, `src/styles.css`, `README.md` (§20)                                                                                                                                                                                                                                 | Badges refaits sans halo ni ombre colorée : dock blanc (bouton formulaire marine, WhatsApp) et étiquette de bagage en papier kraft « Demande rapide » écrite à la main, reliée par un fil, qui se balance ; les 3 `<select>` du formulaire (type de visa, destination, pack) remplacés par une liste sur mesure (tuile d'icône ou code pays, option choisie cochée, ouverture vers le haut si besoin, clavier : flèches, Entrée, Échap, frappe directe)                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-09-30   | Landing : CTA branchés sur la demande rapide + « Pack souhaité »                                   | `landing-page/src/components/DemandeRapide.tsx`, `components/buttons.tsx`, `App.tsx`, `content.ts`, `i18n/fr.ts`, `ar.ts`, `sections/Header.tsx`, `Hero.tsx`, `Packs.tsx`, `Cta.tsx`, `landing-page/README.md`, `README.md` (§20)                                                                                    | « Commencer mon dossier » (header + menu mobile), « Évaluer mon dossier » (hero + bandeau final) et « Choisir ce pack » ouvrent la popup (`useDemande()`) ; champ facultatif « Pack souhaité » (étape 3), pré-rempli et affiché en pastille quand on vient d'un pack ; « Voir comment ça marche » : icône trajet au lieu de l'icône vidéo ; `AnimatedButton` rend un `<button>` sans `href` ; `LIENS.commencer` supprimé                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-09-30   | Landing : badges WhatsApp + « Demande rapide » (popup 3 étapes)                                    | `landing-page/src/components/DemandeRapide.tsx` (nouveau), `App.tsx`, `content.ts`, `i18n/fr.ts`, `ar.ts`, `styles.css`, `sections/Faq.tsx`, `landing-page/README.md`, `README.md` (§20)                                                                                                                             | Badge WhatsApp (wa.me/212777777428) en bas à droite ; au-dessus, badge « Demande rapide » qui ouvre un formulaire en 3 étapes (nom, prénom, e-mail, téléphone / type de visa, dates facultatives, destination Schengen / ville, nombre de demandeurs), validation, tampons en filigrane, envoi en message WhatsApp pré-rempli ; types de visa = intitulés du formulaire harmonisé Schengen ; Études et Raisons médicales (hors `SCOPE`) affichent une note d'orientation ; lien FAQ « Voir toutes les questions » retiré jusqu'au bout (build réparé)                                                                                                                                                                                                                                                                                                   |
| 2026-09-30   | Landing : tampons Schengen partout (fin des tampons France)                                        | `landing-page/src/sections/Hero.tsx`, `Destination.tsx`, `components/decor.tsx`, `styles.css`, `public/images/tampon-schengen-*.webp`, `landing-page/README.md`, `README.md` (§20)                                                                                                                                   | « République française » retiré des 2 tampons (images ré-exportées, fond 100 % transparent) ; hero : tampon rond Schengen en blanc sur la photo (tourne au scroll) au lieu de « PARIS ★ FRANCE » + tampon rectangulaire en filigrane à gauche, glissé sous la carte ; carte destination : tampon rectangulaire au lieu de « PARIS / France » ; `HeroStamp` et `PostalStamp` supprimés                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-09-29   | Back-office : parcours 7 → 6 étapes                                                                | `dossier-model.ts`, `schema.ts`, `backend/functions/dossiers.ts`, `backend/functions/ops.ts`, `dossiers/*`, `seed.ts`, `README.md` (§5, §6, §8, §11)                                                                                                                                                                 | Étapes recentrées sur le déroulé réel (réception → rassemblement → France-Visas → RDV → confirmation → décision) ; acompte étape 2, solde étape 5 ; passeport et fil de qualification persistés ; **migration : 24 dossiers repositionnés à l'étape 1**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-09-29   | Landing page dans un dossier séparé `landing-page/`                                                | `landing-page/**` (nouveau), `eslint.config.js`, `AGENTS.md`, `.claude/launch.json`, `README.md` (§2, §3, §10, §15, §16, §17, §18)                                                                                                                                                                                   | Projet Vite + React + Tailwind autonome (port 5180) avec page de départ (hero, méthode 4 étapes, périmètre, contact) ; exclu du lint/typecheck/build de l'app ; aucun changement fonctionnel app                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-09-28   | Back-office : tronc commun + surveillance RDV                                                      | `visa-rules.ts`, `rdvWatches.ts`, `rdv-watch.tsx`, `scripts/rdv_watcher.py`, `notification-bell.tsx`, `README.md` (§8, §11, §20)                                                                                                                                                                                     | Hébergement / transport / financement / durée posés une seule fois avant le motif ; écran de surveillance d'URL + script Python en lecture seule (sans cible TLScontact exploitable, voir §20)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-09-14   | Sync README : acompte 50/50 + dates de séjour + responsive                                         | `README.md` ( §6, §8, §11, §12) + `dossier-model.ts`, `schema.ts`, `seed.ts`, `qualification.tsx`, `$id.tsx`                                                                                                                                                                                                         | Acompte corrigé 20/80 → 50/50 (`ACOMPTE_PCT=0.5`, labels, alertes) ; ajout `clientVoyageDebut/Fin` (qualification + fiche dossier) ; seed EV-2026-0141 500+500 ; responsive header dossier détail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-09-14   | Tagline métier en une phrase (FR+EN) en tête README                                                | `README.md`                                                                                                                                                                                                                                                                                                          | Ajout du pitch « évite le refus pour dossier incomplet » côté client, aligné sur la proposition de valeur Eiden Visa                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-09-14   | Audit complet + README bilingue + durcissement prod                                                | `README.md`, `AGENTS.md`, `package.json`, `eslint.config.js`, `.prettierignore`, `.gitattributes`, `public/robots.txt`, format LF global                                                                                                                                                                             | README remplace le placeholder ; package renommé `eiden-visa` + `engines` + `typecheck/format:check` ; lint 0 erreur ; build OK ; robots resserré ; seed + règles + architecture documentés                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| _YYYY-MM-DD_ | _exemple : ajout champ dossier_                                                                    | _`schema.ts, $id.tsx, README.md`_                                                                                                                                                                                                                                                                                    | _décrire l'impact utilisateur + migration_                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

<!-- Toute entrée future s'ajoute en haut du tableau (sous l'en-tête), avec sections README sync. / Future entries go on top, with README sections synced. -->
