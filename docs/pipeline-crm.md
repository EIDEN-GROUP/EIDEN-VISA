# Pipeline CRM / CRM Pipeline

## Pourquoi / Purpose

Le Pipeline suit la relation commerciale avec le client, de la première prise de contact à la conclusion. Il est rattaché au dossier interne Eiden Visa. Il ne remplace pas le parcours opérationnel du visa.

The Pipeline tracks the client relationship from first contact through the outcome. It is attached to an internal Eiden Visa dossier and does not replace the visa-processing workflow.

## Étapes / Stages

| Valeur stockée / Stored value | Libellé / Label | Usage                                                 |
| ----------------------------- | --------------- | ----------------------------------------------------- |
| `lead`                        | Lead            | Nouveau dossier, premier contact à traiter.           |
| `call_back`                   | Call-back       | Rappel à effectuer ou à terminer.                     |
| `proposal`                    | Proposal        | Offre ou accompagnement présenté au client.           |
| `appointment`                 | Appointment     | Échange ou rendez-vous commercial à organiser/suivre. |
| `follow_up`                   | Follow-up       | Relance après échange ou proposition.                 |
| `negotiation`                 | Negotiation     | Besoin, périmètre ou modalités en discussion.         |
| `won`                         | Won             | Le client accepte l’accompagnement.                   |
| `lost`                        | Lost            | Le dossier commercial n’aboutit pas.                  |

Les libellés sont partagés par le tableau de bord et le modèle de données. Les transitions ne modifient pas `dossiers.etape`, qui reste l’étape du parcours visa.

Stage labels are shared by the board and data model. Moving a card never changes `dossiers.etape`, which remains the visa workflow step.

## Connexion aux dossiers / Dossier integration

- Depuis le bouton « Ajouter un lead », l'équipe crée un dossier minimal avec nom, téléphone, ville et destination. Le serveur attribue l'identifiant, l'agent connecté et l'étape Lead, puis consigne la création dans `activity_log` au sein de la même transaction. Le dossier porte `PENDING` et peut être qualifié ensuite depuis sa fiche.
- Chaque nouveau dossier créé via la qualification reçoit `crm_stage = 'lead'` dans la même insertion.
- Lors de la migration, les dossiers déjà présents reçoivent aussi `lead` par défaut. Le statut commercial historique n’est pas déduit de l’étape visa ; l’équipe les reclasse au besoin.
- Les contacts du formulaire public (`landing_contacts`) ne sont pas importés : ils sont dans un stockage distinct et ne sont pas encore des dossiers qualifiés.
- `crm_stage` est une colonne contrôlée par une contrainte SQL ; les huit valeurs sont définies dans `src/lib/dossier-model.ts`.

- New dossiers created through qualification receive `crm_stage = 'lead'` in the same insert.
- The “Ajouter un lead” action creates a minimal dossier with name, phone, city, and destination. The server assigns its ID, the signed-in agent, and Lead stage, then records creation in `activity_log` in the same transaction. The dossier remains `PENDING` until staff qualifies it from the dossier page.
- Existing dossiers receive `lead` as the migration default. Their sales stage is not inferred from the visa step; staff can reclassify them.
- Public form contacts (`landing_contacts`) are not imported: they live in separate storage and are not yet qualified dossiers.
- `crm_stage` is a SQL-constrained column; the eight allowed values are defined in `src/lib/dossier-model.ts`.

## Utilisation / Use

Desktop: drag a card by its grip handle and drop it on another stage. Touch and keyboard users can continue using the stage selector on each card. Card rows keep their natural height, so each list scrolls inside its column. Scrollbars are visually hidden while scrolling remains enabled.

Sur desktop, faites glisser une carte par sa poignée et déposez-la dans une autre étape. Sur écran tactile et au clavier, le sélecteur de chaque carte reste disponible. Les cartes gardent leur hauteur ; seule la liste de la colonne défile et sa barre de défilement est masquée visuellement.

La route interne `/pipeline` est disponible aux rôles authentifiés existants. Elle propose les colonnes adaptées à l’écran, une recherche serveur, le filtre « Mes dossiers » basé sur `agentUserId`/`assigneeUserId`, ainsi qu’un lien vers la fiche dossier. Sur mobile, une étape est affichée à la fois ; sur ordinateur, le tableau défile horizontalement afin de conserver des cartes lisibles.

The internal `/pipeline` route is available to existing authenticated staff roles. It provides responsive columns, server-side search, a “Mes dossiers” filter based on `agentUserId`/`assigneeUserId`, and links to dossier details. Mobile shows one stage at a time; desktop uses a horizontal board to keep cards readable. On wide desktop screens, the Pipeline uses the available page width so all eight stages fit into equal-width columns; on narrower desktop screens, columns keep a readable minimum width and the board scrolls horizontally. All columns share a viewport-sized height; each card list scrolls independently without page scrolling.

Sur les grands écrans desktop, le Pipeline utilise toute la largeur disponible et les huit étapes tiennent dans des colonnes de même largeur. Sur les écrans desktop plus étroits, les colonnes gardent une largeur lisible et le tableau défile horizontalement. Sur mobile, une seule étape est affichée à la fois. Les colonnes ont la même hauteur ; chaque liste de cartes défile indépendamment, sans défilement de la page.

Chaque déplacement vérifie côté serveur l’utilisateur connecté, la valeur cible et le statut de départ attendu. La mise à jour compare atomiquement l’ancien statut (pour éviter d’écraser une modification concurrente) et écrit l’événement dans `activity_log` au cours de la même transaction. La perte demande une confirmation ; les autres changements offrent une annulation temporaire dans l’interface. L’audit complet est visible par le CEO dans `/ops?s=activite`.

Un lead manuel n'est pas facturé et n'a pas d'échéancier initial : aucun pack n'est encore confirmé. Les données de naissance et de passeport restent vides jusqu'à la qualification. L'équipe reprend le dossier via « Reprendre la qualification » pour saisir les informations manquantes et appliquer les règles métier habituelles.

Every move validates the signed-in user, target stage, and expected current stage on the server. The update atomically checks the previous stage to avoid overwriting a concurrent change and records the event in `activity_log` in the same transaction. Marking a dossier Lost asks for confirmation; other moves offer a temporary undo in the UI. The CEO can review the activity log at `/ops?s=activite`.

## Données affichées / Data shown

Le tableau ne charge que les champs nécessaires aux cartes : identité client, téléphone, ville, motif/titre, centre, agent, date de création et étape CRM. Les documents, données de passeport et paiements ne sont pas renvoyés par cette requête. Les résultats sont limités par étape et chargés par lots ; les compteurs restent calculés en base.

The board fetches only fields needed for its cards: client identity, phone, city, dossier title, centre, agent, creation date, and CRM stage. It does not return documents, passport details, or payment data. Cards are fetched in bounded batches per stage; counts are computed in SQL.

## Déploiement / Deployment

Appliquer une fois `scripts/migrations/2026-10-27-crm-pipeline.sql` à la base cible avant de déployer l’application. Le script est transactionnel et idempotent. La migration n’est pas exécutée automatiquement ici ; vérifier la sauvegarde et la base cible selon la procédure d’exploitation.

Apply `scripts/migrations/2026-10-27-crm-pipeline.sql` once to the target database before deploying the application. The transaction is idempotent. This change does not run the migration automatically; follow the operations process to confirm the target database and backup.
