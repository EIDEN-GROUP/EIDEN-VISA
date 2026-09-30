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
5. [Parcours 7 étapes / 7-step pipeline](#5-parcours-7-étapes--7-step-pipeline)
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
20. [Changelog (obligatoire)](#20-changelog-obligatoire--required)

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

| Couche           | Tech                                                                   | Fichier repère                                                           |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| App              | TanStack Start 1.168 + React 19 + React Router 1.170 + React Query 5   | `src/router.tsx`, `src/start.ts`, `src/server.ts`                        |
| UI               | Tailwind v4 + shadcn new-york + Radix + lucide + recharts + sonner     | `src/styles.css`, `components.json`, `src/components/ui/*` (45 fichiers) |
| Forms/validation | react-hook-form + zod + @hookform/resolvers                            | `src/components/ui/form.tsx`                                             |
| PDF              | jspdf + html2canvas (export tableau + capture pixel)                   | `src/lib/ops-pdf.ts`                                                     |
| DB               | Postgres 16 + Drizzle ORM + driver `postgres`                          | `src/backend/db/*`, `drizzle.config.ts`                                  |
| Auth             | cookie-session TanStack Start + bcryptjs (cost 12)                     | `src/backend/auth.ts`                                                    |
| Build/serveur    | Vite 8 + Nitro (preset `vercel`) + `@lovable.dev/vite-tanstack-config` | `vite.config.ts`                                                         |
| Qualité          | TypeScript strict + ESLint + Prettier                                  | `tsconfig.json`, `eslint.config.js`, `.prettierrc`                       |
| Landing page     | Vite 8 + React 19 + Tailwind v4 + lucide — **projet autonome**         | `landing-page/` (voir §3)                                                |

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

> État vérifié le 2026-09-14 : `typecheck` OK, `lint` 0 erreur (6 warnings shadcn
> `react-refresh/only-export-components` connus et sans impact), `build` OK (~4,8 s).

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

---

## 4. Variables d'environnement / Env vars

Copier `.env.example` vers `.env` (jamais commité — voir `.gitignore`). Chargé **uniquement**
côté Node (`vite.config.ts`, `drizzle.config.ts`, `scripts/seed.ts`) : **ne jamais**
`import "dotenv/config"` dans `src/**` exposé au navigateur (crash `args.reduce` déjà vu,
documenté en tête de `vite.config.ts`).

| Variable           | Obligatoire | Usage                                                                                                                                                                  |
| ------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`     | oui         | ex. `postgres://eidenvisa:eidenvisa@localhost:5435/eidenvisa` (voir `docker-compose.yml`). `src/backend/db/client.ts` exige `prepare:false` (pooler mode transaction). |
| `SESSION_PASSWORD` | oui         | secret >= 32 caractères pour le cookie `eidenvisa_session` (30 jours).                                                                                                 |
| `ADMIN_EMAIL`      | oui (seed)  | ex. `accueil@eidenvisa.ma`. Normalisé en minuscules.                                                                                                                   |
| `ADMIN_PASSWORD`   | oui (seed)  | >= 6 caractères, hashé bcrypt 12. **Changer en prod.**                                                                                                                 |

En prod : `secure` cookie passe à `true` automatiquement quand `NODE_ENV=production`
(derrière HTTPS uniquement — voir `src/backend/auth.ts`).

---

## 5. Parcours 7 étapes / 7-step pipeline

Source unique : `ETAPES` dans `src/lib/dossier-model.ts`.

| n   | key            | Label FR                  | Détail                                             | Encaissement                           | Responsable |
| --- | -------------- | ------------------------- | -------------------------------------------------- | -------------------------------------- | ----------- |
| 1   | `accueil`      | Accueil & diagnostic      | éligibilité + clause de non-garantie               | Gratuit                                | Réception   |
| 2   | `creneau`      | Qualification & ouverture | fiche France-Visas + Boussole + autorisation       | Acompte selon modalité                 | Back office |
| 3   | `attente`      | Dossier en préparation    | suivi quotidien, risque de stagnation              | —                                      | Back office |
| 4   | `constitution` | Constitution              | complétion en agence, photos aux normes, QC        | —                                      | Préparation |
| 5   | `options`      | Options à la carte        | pré-résa partenaire + assurance courtier           | +300 MAD voyage · commission assurance | Back office |
| 6   | `solde`        | Solde & remise scellé     | solde du palier, frais consulaires payés au centre | Solde du palier                        | Réception   |
| 7   | `depot`        | Dépôt au centre           | client dépose lui-même (TLS/BLS)                   | Droit visa direct                      | Client      |

Étape 7 = fin du cycle Eiden (dossier gelé : pièces/pack/encaissement verrouillés).
Après : décision consulat `en_attente | approuve | refuse` (`DECISION_LABEL`).

Alertes auto (`alertes(d)` dans `dossier-model.ts`) : non autorisé (étape≥2),
solde avec pièces manquantes (étape≥6), blocage `tc3` (autorisation travail),
cas complexe, acompte 50 % non encaissé (étape≥2), impayés à l'étape≥6.

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

Modalités : `comptant` (100 % au solde étape 6) | `acompte` (50 % à l'ouverture étape 2
pour sécuriser l'engagement, 50 % à l'étape 6, `ACOMPTE_PCT=0.5`). Options à la carte toujours à part,
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

| Action                                                                      | ceo     | reception | preparation | back_office |
| --------------------------------------------------------------------------- | ------- | --------- | ----------- | ----------- |
| Se connecter, voir dossiers, téléverser (si autorisé)                       | ✅      | ✅        | ✅          | ✅          |
| Autoriser/bloquer upload (`setUploadAutorisation`, `requireCeoOrReception`) | ✅      | ✅        | ❌          | ❌          |
| Gérer comptes/rôles/mots de passe, voir `/ops`, analytique, journal         | ✅ seul | ❌        | ❌          | ❌          |
| Assigner/désassigner (notifie l'assigné sauf auto-assignation)              | ✅      | ✅        | ✅          | ✅          |

Garde double : `beforeLoad` sur `/_app` (redirection `/login`) + `requireUserId`
fail-closed côté serveur sur chaque mutation. `requireCeo` reste `createServerOnlyFn`
pour ne pas embarquer bcrypt/postgres dans le bundle client (incident déjà vu,
commenté dans `src/backend/functions/auth.ts`).

---

## 8. Routes & écrans / Routes & screens

Routage fichier TanStack (`src/routeTree.gen.ts` généré — **ne pas éditer**).
Conventions : voir `src/routes/README.md`.

| URL                  | Fichier                                                                                                                                                                                         | Rôle                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                  | `src/routes/_app/index.tsx`                                                                                                                                                                     | Dashboard : 4 KPI (actifs, à autoriser, alertes, encaissé), alertes système, à autoriser (8), récents (6). Filtre `DateRangeFilter` sur `created_at`.                                                                                                                                                                                             |
| `/qualification`     | `src/routes/_app/qualification.tsx`                                                                                                                                                             | Boussole : arbre `TREE` → `CaseResult` → formulaire client (nom/tél/ville/naissance + **dates de séjour envisagées** début/fin + durée calculée) + centre + modalité (comptant/acompte 50 %) → `createDossier` (`EV-année-XXXXXX`, `client.voyageDebut/Fin`) → `/dossiers/$id`.                                                                   |
| `/dossiers`          | `src/routes/_app/dossiers/index.tsx`                                                                                                                                                            | Liste paginée SQL (50/page, recherche debounce 300 ms nom/tél/ville/réf, filtres niveau/pays/dates, Tous/Mes dossiers) + vue Liste/Kanban (`DossiersKanban`, drag + boutons clavier).                                                                                                                                                             |
| `/dossiers/$id`      | `src/routes/_app/dossiers/$id.tsx` (662 lignes, écran cœur)                                                                                                                                     | Header (retour, reçu, modifier client **avec dates de séjour**, supprimer irréversible), badges, alertes, stepper 7 étapes + précédent/suivant, décision si étape 7, checklist officiel vs eiden + progression, centre, pack & paiements (Acompte 50 % / Solde 50 %, encaisser/ligne), `AssignationCard`, autorisation upload + `DocumentsPanel`. |
| `/paiements`         | `src/routes/_app/paiements.tsx`                                                                                                                                                                 | Encaissé/attente/compteurs, paliers pack (prix + marge + effectif), attentes (encaisser inline), historique (borné 300/100).                                                                                                                                                                                                                      |
| `/referentiel`       | `src/routes/_app/referentiel.tsx`                                                                                                                                                               | Lecture seule : périmètre, 7 étapes, packs + frais, cas types (`FIXED_KEYS`).                                                                                                                                                                                                                                                                     |
| `/profil`            | `src/routes/_app/profil.tsx`                                                                                                                                                                    | Mon profil : avatar (downscale 400px JPEG 0.85), nom, mot de passe (≥6), KPIs perso, BarChart par étape, mes dossiers/pièces/encaissements/activité.                                                                                                                                                                                              |
| `/login`             | `src/routes/login.tsx`                                                                                                                                                                          | Connexion équipe (carte 2 colonnes + rail art). Redirige vers `/` si déjà connecté.                                                                                                                                                                                                                                                               |
| `/ops?s=&u=`         | `src/routes/ops.tsx`                                                                                                                                                                            | Superadmin CEO masqué du Rail : synthèse, analytique (`AnalyticsPanel`), paiements (acomptes en retard, soldes dus, journal, export PDF), équipe (CRUD + `UserProfile` + fiche PDF), alertes, activité. `OpsGate` : non-CEO déconnecté + refus.                                                                                                   |
| `/confidentialite`   | `src/routes/confidentialite.tsx`                                                                                                                                                                | Page publique : objet, données, partage consulaire strict, conservation/suppression irréversible journalisée, accès journalisé, contact Agadir.                                                                                                                                                                                                   |
| `/dossiers/$id/recu` | `src/routes/dossiers.$id.recu.tsx`                                                                                                                                                              | Reçu client imprimable + PDF jsPDF (`Recu-{id}.pdf`, pagination, signatures, mentions).                                                                                                                                                                                                                                                           |
| Shell                | `src/routes/__root.tsx` (fonts Fraunces/Plus Jakarta/Space Mono/Poppins/Quicksand, favicons, 404/erreur), `src/routes/_app.tsx` (garde auth + `Rail` + header `NotificationBell`/`ProfileChip`) | —                                                                                                                                                                                                                                                                                                                                                 |

---

## 9. Référentiel visa / Visa rules

**Source unique de vérité : `src/lib/visa-rules.ts`** (formation 27/08/2026 + sims
France-Visas). Les écrans ne font que lire ce fichier.

- `Level = standard | attention | complexe` + `LEVEL_LABEL`.
- `CaseResult { key, title, cat, level, docs (officiel), extra (Eiden), notes (vigilance) }`.
- `Profile { base: tourisme | visite_generale | visite_enfant_parent | famille_ue, dependent?, minor?, married?, spouseNoJob?, visaHist?, grandchildNote?, prof: salarie | commercant | agriculteur | retraite | etudiant | sans }`.
- **Cas figés :** `t3` (VLS-TS conjoint Français, complexe), `t4` (regroupement → à référer OFII), `t5` (autres liens → particulier), `tc1` (affaires, standard, 11 docs), `tc2` (Passeport Talent, seuil 39 582 €/an 2026, ANEF ~350 €), `tc3` (VLS-TS salarié, **autorisation travail employeur AVANT dépôt**), `tc4` (détaché/mission), `tc5` (saisonnier), `dout` (santé, écarté), `eout` (étudiant → Campus France, orientation 100 MAD).
- **Dynamique `buildCourtSejour` :** `famille_ue` (droit UE simplifié — ne pas ajouter ressources/hébergement par réflexe) sinon tourisme (standard) / visite_generale / visite_enfant_parent (attention), + pièces mineur (naissance, autorisation voyage, autorité parentale ; sortie territoire marocaine à légaliser = formalité de sortie, pas pièce visa), + `profDoc` par profession, fonds, hébergement (120 €/jour ou attestation d'accueil), assurance, extras (livret/biens, hébergeant, prise en charge conjoint, certificat retour si `visaHist`), notes (59 mois, tarifs mineur, séjour légal si non-résident).
- **Arbre `TREE` :** `start` (motif) → `a0/a0b` (UE) → `a1/a2/a3` (famille/visite vs installation) → `q_group` (voyageurs, `minor`) → `q_civil` → `q_conjoint_prof` (`spouseNoJob`) → `q_prof` → `q_visa_hist` → `DYNAMIC` ; `b1/b2` (rejoindre → t3/t4/t5) ; `c1/c2` (travail → tc1/tc2/tc3/tc4/tc5).

---

## 10. Architecture technique / Architecture

- **SSR :** `src/start.ts` (`errorMiddleware` + `csrfMiddleware` sur les serverFn),
  `src/server.ts` (intercepte d'abord `serveDocument`, puis entrée TanStack ; convertit
  les 500 JSON `{"unhandled":true}` en page HTML `renderErrorPage`).
- **Server functions** (`createServerFn` + zod, `src/backend/functions/`) :
  - `auth.ts` — `login/logout/currentUser`, gardes `requireUserId/requireCeo/requireCeoOrReception`.
  - `dossiers.ts` — `listDossiers/listDossiersPage` (pagination + `ilike` nom/ville/réf, tél insensible aux espaces via `regexp_replace`, `pays` BLS, `mine = agentUserId==moi OR assignee==moi`, `dateFrom/To` inclusif sur `createdAt`), `listAlertesDossiers` (300), `listDossiersRecents` (6), `listDossiersAvecImpaye` (300, `jsonb_array_elements(paiements)` non encaissé), `listDossiersAvecEncaissement` (100), `getDashboardStats/getPaiementsStats/getPackCounts`, `getDossier/createDossier` (`agentUserId` = session, anti-spoof, log, **inclut `client.voyageDebut/Fin`**), `togglePiece/avancerEtape/setEtape` (optimiste kanban)/`changerCentre/setUploadAutorisation` (CEO/Réception)/`encaisser/changerPack/setModalitePaiement` (via `reglerEcheancier`, **acompte 50/50**)/`getPaiementsSuivi` (CEO, 5 requêtes)/`setDecision/updateClient` (client + voyage dates)/`deleteDossier` (cascade documents, loggé).
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
```

| Table           | Colonnes clés / notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`         | `id, email unique (minuscule), password_hash (bcrypt12), nom, role (défaut reception), photo_base64 (data URL ≤1,5 Mo), created_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `sessions`      | `id, user_id, expires_at` — **définie mais inutilisée** : la vraie session est le cookie `eidenvisa_session` (`useSession`). Conservée sans lecture/écriture ; ne pas s'en servir sans migration + code.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `dossiers`      | `id (EV-2026-XXXX), client_nom/telephone/ville/naissance (plats) + client_voyage_debut/fin (texte ISO AAAA-MM-JJ, nullable — dates de séjour envisagées saisies à la qualification), agent (texte affichage, ex. Réception · Salma — ne pas filtrer dessus), agent_user_id (vrai ouvreur, filtre Mes dossiers), assignee_user_id (null = non assigné), ouvert_le (texte FR JJ/MM/AAAA, affichage seul), case_key (DYNAMIC ou t3/tc1…), profile (jsonb), titre/categorie (dénormalisés de resolveCase), niveau, pack (défaut base), modalite_paiement (défaut comptant), etape 1..7 (défaut 1), rdv_centre (nom historique — = centre TLS/BLS), upload_autorise (défaut false), pieces/paiements/notes (jsonb), decision (défaut en_attente) + decision_date (texte FR), created_at (**seule colonne de filtre/tri dates**).` |
| `documents`     | `id (uuid), dossier_id (cascade), type (france_tls/espagne_bls/autre), filename, mime_type, data_base64 (base64 — volumes modestes, évite bytea ; 10 Mo max, passer au stockage objet si croissance), uploaded_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `notifications` | `id, user_id (cascade), type (assignation/info), message, dossier_id (sans FK), acteur_nom, read_at (null = non lu), created_at`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `activity_log`  | `id, user_id (set null), action, detail, dossier_id (sans FK), created_at` — audit écran `/ops`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

Règles : `ouvertLe` = affichage ; `createdAt` = filtres `DateRange`. `agent` = affichage ;
`agentUserId/assigneeUserId` = filtres fiables. `drizzle-kit push` utilisé (pas de dossier
`drizzle/` versionné) — OK démo, prévoir des migrations versionnées avant prod multi-env.

---

## 12. Seed démo / Demo seed

`scripts/seed.ts` (exige `DATABASE_URL + ADMIN_EMAIL + ADMIN_PASSWORD`) : crée
`users{id:"user-accueil", email:ADMIN_EMAIL minuscule, nom:"Accueil Eiden Visa"}`
(`onConflictDoNothing(email)`, rôle défaut DB `reception` — **passer ce compte en `ceo`
via `/ops` ou SQL avant usage réel**) puis, **seulement si `dossiers` vide**, insère les
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
  base64 valide, taille. Liste sans `dataBase64` ; téléchargement via `/documents/:uuid`.
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
change. Logo redessiné en SVG inline (`Logo` dans `App.tsx`). EN — the landing keeps a
**copy** of the app tokens (resync by hand if the brand changes); logo is an inline SVG.

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
src/routes/login.tsx  src/routes/ops.tsx  src/routes/confidentialite.tsx
src/routes/dossiers.$id.recu.tsx  src/routes/README.md (conventions routage)
src/backend/db/schema.ts  src/backend/db/client.ts  src/backend/auth.ts
src/backend/functions/auth.ts  src/backend/functions/dossiers.ts
src/backend/functions/documents.ts  src/backend/functions/assignments.ts
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
   si > dizaines de Mo), pas de rate-limit dédié, pas de tests automatisés, double
   lockfile (`bun.lock` + `package-lock.json` — npm utilise le second), table `sessions`
   morte (ne pas utiliser sans migration).
5. SEO/robots : privé désindexé (fait) ; vérifier en-têtes HTTPS/hôte à la mise en ligne.
6. Landing page : FR — hébergement aussi différé ; déployable seule comme site statique
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

## 20. Changelog (obligatoire / required)

> **Règle (voir `AGENTS.md`) : chaque ajout / modification / suppression — code, config,
> asset, doc — DOIT mettre à jour les sections concernées de ce README (FR+EN) ET ajouter
> une ligne ci-dessous. Pas de fusion sans les deux.**
>
> **Rule: every add/edit/delete MUST update the affected README sections (FR+EN) AND append
> a row below. No merge without both.**

| Date         | Portée / Scope                                             | Fichiers                                                                                                                                 | Impact                                                                                                                                                                                            |
| ------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-30   | Landing : couleurs du loader alignées sur `loader-bg.png`  | `landing-page/src/styles.css`, `src/components/Loader.tsx`, `index.html`, `README.md` (§20)                                              | Fond de secours du rideau (et fond avant JS) : ciel bleu, pierre dorée, marine au lieu du coucher de soleil ; voile marine (bleu UE) + halo sombre derrière la marque pour lire le texte blanc ; ombres du texte et de l'avion en marine |
| 2026-09-30   | Landing : menu mobile plein écran                          | `landing-page/src/sections/Header.tsx`, `src/i18n/fr.ts`, `ar.ts`, `README.md` (§20)                                                      | Menu < 1280 px : panneau marine plein écran ouvert en cercle depuis le bouton, liens numérotés en grand qui montent un à un, section courante marquée d'un avion, tampon Schengen en filigrane, boutons « Commencer » / « Nous contacter », choix FR / العربية ; bouton burger marine qui se croise en X ; Échap / focus gérés |
| 2026-09-30   | Landing : grand tampon rond au milieu de la page           | `landing-page/src/styles.css`, `App.tsx`, `sections/Hero.tsx`, `public/images/tampon-schengen-rond.webp`, `README.md` (§20)               | Tampon rond rouge déplacé du hero vers `main::before` : très grand (jusqu'à 820 px), à mi-hauteur de la page côté droit (gauche en arabe), derrière tout le contenu, opacité 7 à 9 %, visible aussi sur mobile ; image ré-exportée en 880 px |
| 2026-09-30   | Landing : tampons Schengen en filigrane                    | `landing-page/src/styles.css`, `sections/Hero.tsx`, `Faq.tsx`, `components/decor.tsx`, `public/images/tampon-schengen-*.webp`, `landing-page/README.md`, `README.md` (§20) | Croquis tour Eiffel (hero, FAQ) remplacés par 2 tampons « Schengen Visa » (rond rouge, rectangulaire bleu) en `::before` / `::after`, opacité 10 %, fond transparent ; `EiffelSketch` supprimé ; desktop uniquement |
| 2026-09-30   | Landing : méthode en trajet d'avion animé                | `landing-page/src/sections/Methode.tsx`, `src/lib/gsap.ts` (MotionPathPlugin), `styles.css`, `README.md` (§20)                           | Fil en pointillés avec petits arcs entre les 6 étapes ; un avion vole d'étape en étape en boucle, trace le pointillé en rouge et allume chaque pastille (halo) ; colonne verticale sur mobile/tablette ; pause hors écran ; contenu et icônes inchangés |
| 2026-09-30   | Landing : cartes packs façon « billet » au survol          | `landing-page/src/sections/Packs.tsx`, `README.md` (§20)                                                                                  | Photo plein cadre, nom + accroche dans un panneau blanc en bas ; au hover (ou focus clavier) le panneau s'ouvre sur la liste incluse et le bouton ; tout visible sur écrans tactiles ; contenu inchangé |
| 2026-09-30   | Landing : loader avion + animations entrée/sortie au scroll | `landing-page/src/components/Loader.tsx` (nouveau), `src/lib/intro.ts` (nouveau), `src/lib/gsap.ts`, `components/motion.tsx`, `App.tsx`, `sections/Hero.tsx`, `Cta.tsx`, `Header.tsx`, `Temoignages.tsx`, `i18n/fr.ts`, `ar.ts`, `styles.css`, `index.html`, `public/images/loader-*.webp`, `landing-page/README.md` | Loader : ciel au coucher du soleil, un avion le traverse de gauche à droite et le découpe comme un rideau pour révéler la landing ; hero/header animés au passage de l'avion ; blocs, textes et boutons avec entrée et sortie visibles au scroll ; parallaxe hero et CTA ; rien de changé côté app |
| 2026-09-30   | Landing : nouveaux textes des cartes « Pourquoi » FR/AR    | `landing-page/src/i18n/fr.ts`, `ar.ts`, `README.md` (§20)                                                                                 | Cartes : Dossier complet, Justificatifs adaptés, Dossier vérifié, Plus de sérénité (titre + description) ; traduction arabe ; surtitre « Pourquoi EIDEN Visa ? »                                     |
| 2026-09-30   | Landing : cartes « Pourquoi » en accordéon au survol       | `landing-page/src/sections/Pourquoi.tsx`, `README.md` (§20)                                                                               | Cartes image plein fond, titre seul ; au hover la carte s'élargit (lg+) et la description apparaît (animation fluide) ; icônes retirées ; description toujours visible sur écrans tactiles           |
| 2026-09-30   | Landing : FAQ + packs FR/AR, packs sans prix               | `landing-page/src/i18n/fr.ts`, `ar.ts`, `content.ts`, `sections/Packs.tsx`, `Faq.tsx`, `landing-page/README.md`, `README.md` (§3)        | FAQ remplacée par 4 questions (pré-réservations, assurance, frais de RDV, pas de garantie) ; packs Standard / Essentiel / Global sans prix ; textes traduits en arabe ; FAQ en 2 colonnes égales  |
| 2026-09-29   | Landing page dans un dossier séparé `landing-page/`        | `landing-page/**` (nouveau), `eslint.config.js`, `AGENTS.md`, `.claude/launch.json`, `README.md` (§2, §3, §10, §15, §16, §17, §18)       | Projet Vite + React + Tailwind autonome (port 5180) avec page de départ (hero, méthode 4 étapes, périmètre, contact) ; exclu du lint/typecheck/build de l'app ; aucun changement fonctionnel app  |
| 2026-09-14   | Sync README : acompte 50/50 + dates de séjour + responsive | `README.md` ( §6, §8, §11, §12) + `dossier-model.ts`, `schema.ts`, `seed.ts`, `qualification.tsx`, `$id.tsx`                             | Acompte corrigé 20/80 → 50/50 (`ACOMPTE_PCT=0.5`, labels, alertes) ; ajout `clientVoyageDebut/Fin` (qualification + fiche dossier) ; seed EV-2026-0141 500+500 ; responsive header dossier détail |
| 2026-09-14   | Tagline métier en une phrase (FR+EN) en tête README        | `README.md`                                                                                                                              | Ajout du pitch « évite le refus pour dossier incomplet » côté client, aligné sur la proposition de valeur Eiden Visa                                                                              |
| 2026-09-14   | Audit complet + README bilingue + durcissement prod        | `README.md`, `AGENTS.md`, `package.json`, `eslint.config.js`, `.prettierignore`, `.gitattributes`, `public/robots.txt`, format LF global | README remplace le placeholder ; package renommé `eiden-visa` + `engines` + `typecheck/format:check` ; lint 0 erreur ; build OK ; robots resserré ; seed + règles + architecture documentés       |
| _YYYY-MM-DD_ | _exemple : ajout champ dossier_                            | _`schema.ts, $id.tsx, README.md`_                                                                                                        | _décrire l'impact utilisateur + migration_                                                                                                                                                        |

<!-- Toute entrée future s'ajoute en haut du tableau (sous l'en-tête), avec sections README sync. / Future entries go on top, with README sections synced. -->
