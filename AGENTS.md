<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# Eiden Visa — Agent Rules (obligatoire)

> FR : ces règles s'appliquent à chaque intervention (humaine ou agent), Lovable inclus.
> EN: these rules apply to every change (human or agent), Lovable included.

## 1. README sync — FULL (bloquant / blocking)

**Chaque ajout / modification / suppression — code, config, asset, seed, doc — DOIT :**

1. mettre à jour **toutes les sections concernées de `README.md` en FR + EN**
   (pas seulement le Changelog : pipeline, packs, rôles, routes, règles visa,
   architecture, DB, seed, design, scripts, prod, dépannage selon le cas) ;
2. ajouter **une ligne en haut du tableau `§20 Changelog`**
   (`Date | Portée/Scope | Fichiers | Impact`).

**Pas de commit/merge vert sans les deux.** Un refactor « invisible » touche au
minimum le Changelog + l'arborescence/scripts si concernés.
Si tu ne sais pas où documenter, demande avant de fusionner — ne saute jamais la synchro.

## 2. Garde-fous projet (ne pas casser)

- Routage fichier TanStack : `src/routes/**` uniquement ; `routeTree.gen.ts` généré, ne jamais l'éditer.
- `dotenv` uniquement côté Node (`vite.config.ts`, `drizzle.config.ts`, `scripts/*`) — jamais dans `src/**` client.
- Auth : garde route `/_app` + `requireUserId` serveur (fail-closed) ; `requireCeo*` en `createServerOnlyFn` (jamais bcrypt/postgres dans le bundle client).
- DB : filtres dates sur `createdAt` (pas `ouvertLe`) ; filtres agent sur `agentUserId/assigneeUserId` (pas le texte `agent`) ; garder `prepare:false` (pooler).
- Métier : échéancier jamais saisi à la main — `planPaiement` / `reglerEcheancier` ; upload 10 Mo + `%PDF-` + gate `uploadAutorise` ; étape 7 gelée ; `SCOPE` et `visa-rules.ts` = seule vérité métier.
- PDF : garder le fallback tableau anti-`oklch` (`exportRapportTable`) ; légende + couleur pour les icônes.
- Fins de ligne LF (`.gitattributes`), `npm run format` avant commit.
- Landing page : `landing-page/` est un projet Vite autonome — aucun import entre `landing-page/**` et `src/**` (dans les deux sens) ; ses dépendances restent dans `landing-page/package.json`, jamais dans le `package.json` racine. Une tâche « app » ne touche pas `landing-page/`, et inversement.

## 3. Gate prod avant chaque merge

```sh
npm run typecheck && npm run lint && npm run build
npm run db:setup   # sur base jetable, si le schema/seed a changé
npm --prefix landing-page run build   # si landing-page/ a changé (tsc + vite build)
```

`robots.txt` : garder le privé désindexé (`/ops`, `/dossiers`, `/profil`, `/paiements`, `/qualification`).
Ne jamais committer `.env`. Ne versionner ni `drizzle/` généré localement sans revue, ni `.vercel/`.
Cible d'hébergement différée (Vercel/Lovable/Docker) : ne pas changer `nitro.preset` sans décision explicite.
