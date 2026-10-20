/**
 * Rejeu de la qualification : quand l'agent corrige une réponse, toute la
 * qualification doit suivre. On rejoue l'arbre depuis le début avec les
 * réponses corrigées, ce qui recalcule :
 *   - le profil (`Profile`) : les mêmes `set` que dans l|Original parcours ;
 *   - le fil des questions : les questions devenues hors sujet disparaissent,
 *     les nouvelles questions exigées par la nouvelle branche sont signalées ;
 *   - le cas retenu (type de visa), donc la checklist et les points de vigilance.
 *
 * Le module est PUR (aucune dépendance serveur) : le serveur s'en sert pour
 * recalculer, le client peut l'appeler pour prévisualiser.
 */
import { PERSONNE_FIN, PERSONNE_QUI, TREE, type Profile, type TreeOption } from "./visa-rules";

export type EntreeQualification = {
  question: string;
  reponse: string;
  /** Nœud de l'arbre d'où vient la question (absent sur les dossiers anciens). */
  nodeKey?: string | undefined;
};

export type Rejeu = {
  /** Le parcours a pu être rejoué jusqu'à un cas : la qualification est à jour. */
  complet: boolean;
  /** Cas retenu (clé de l'arbre) ; null si le parcours n'a pas pu être rejoué. */
  caseKey: string | null;
  /** Profil recalculé (choix uniquement ; les réponses libres sont conservées). */
  profile: Profile;
  /** Fil reconstruit : les questions de la nouvelle branche, dans l'ordre. */
  entrees: EntreeQualification[];
  /** Nœuds des questions que la nouvelle branche exige et qui restent sans réponse. */
  aRepondre: string[];
};

/** Options d'un nœud correspondant à un libellé de réponse donné. */
/**
 * Options d'un nœud correspondant à un libellé de réponse donné.
 */
function optionsCorrespondantes(
  node: { opts?: TreeOption[]; multi?: boolean },
  reponse: string,
): TreeOption[] {
  if (!node.opts) return [];
  const libelles = node.multi
    ? reponse
        .split(", ")
        .map((l) => l.trim())
        .filter(Boolean)
    : [reponse];
  return libelles
    .map((l) => node.opts!.find((o) => o.l === l))
    .filter((o): o is TreeOption => Boolean(o));
}

/**
 * La suite du parcours est-elle la même quelle que soit la réponse ? Alors on peut
 * enchaîner les questions manquantes sans deviner (c'est le cas du bloc
 * hébergeant : toutes les réponses mènent au même nœud suivant).
 */
function suiteDeterministe(node: {
  opts?: TreeOption[];
  fields?: unknown[];
  next?: string;
}): string | null {
  if (node.fields?.length) return node.next ?? null;
  if (!node.opts?.length) return null;
  const cibles = new Set(node.opts.map((o) => o.n));
  return cibles.size === 1 ? [...cibles][0]! : null;
}

/**
 * Rejoue le parcours à partir des réponses (corrigées) et renvoie le cas, le
 * profil et le fil reconstruit. `profilActuel` sert de repli : les réponses
 * libres (`profile.details`) ne sont pas rejouables, on les conserve.
 */
export function rejouerQualification(
  entrees: EntreeQualification[],
  profilActuel: Profile = {},
): Rejeu {
  const reponses = new Map<string, EntreeQualification>();
  for (const e of entrees) if (e.nodeKey) reponses.set(e.nodeKey, e);

  let profile: Profile = { ...profilActuel, details: profilActuel.details ?? {} };
  const vues: string[] = [];
  const fil: EntreeQualification[] = [];
  const aRepondre: string[] = [];

  let nodeKey = "start";
  let casMemorise: string | null = null;
  let dansBlocPersonne = false;
  let caseKey: string | null = null;
  let complet = false;

  // Garde-fou : une qualification ne dépasse jamais quelques dizaines de questions.
  for (let etape = 0; etape < 200; etape++) {
    if (nodeKey === PERSONNE_FIN) {
      // Fin du bloc hébergeant : on rend la main au cas mis de côté.
      caseKey = casMemorise;
      complet = casMemorise !== null;
      break;
    }
    const node = TREE[nodeKey];
    if (!node) break;
    if (vues.includes(nodeKey)) break; // boucle : on s'arrête.
    vues.push(nodeKey);

    const entree = reponses.get(nodeKey);
    if (!entree) {
      // Question de la nouvelle branche sans réponse : elle sera à reposer.
      // Si la suite du parcours ne dépend pas de la réponse, on continue pour
      // lister TOUTES les questions manquantes d'un coup.
      aRepondre.push(nodeKey);
      fil.push({ question: node.q, reponse: "", nodeKey });
      const suite = suiteDeterministe(node);
      if (!suite) break;
      nodeKey = suite;
      continue;
    }

    if (node.opts?.length) {
      const options = optionsCorrespondantes(node, entree.reponse);
      if (!options.length) {
        // Réponse inconnue (l'arbre a bougé) : on ne peut pas recalculer.
        aRepondre.push(nodeKey);
        fil.push({ question: node.q, reponse: "", nodeKey });
        const suite = suiteDeterministe(node);
        if (!suite) break;
        nodeKey = suite;
        continue;
      }
      for (const o of options) profile = { ...profile, ...(o.set ?? {}) };
      const reponseRetenue = options.map((o) => o.l).join(", ");
      fil.push({ question: node.q, reponse: reponseRetenue, nodeKey });

      const cible = options[0]!;
      if (cible.r) {
        // Cas atteint. Chez un particulier, on enchaîne sur le bloc hébergeant
        // (posé en dernier) avant de résoudre le cas mémorisé.
        if (profile.hebergement === "personne" && !dansBlocPersonne) {
          casMemorise = cible.n;
          dansBlocPersonne = true;
          nodeKey = PERSONNE_QUI;
          continue;
        }
        caseKey = cible.n;
        complet = true;
        break;
      }
      nodeKey = cible.n;
      continue;
    }

    if (node.fields?.length) {
      // Saisie libre : la réponse est conservée telle quelle (les valeurs libres
      // ne pilotent ni le cas ni la checklist).
      fil.push({ question: node.q, reponse: entree.reponse, nodeKey });
      if (node.fieldsResult) {
        const cible = node.next ?? "";
        if (cible === PERSONNE_FIN) {
          caseKey = casMemorise ?? cible;
          complet = casMemorise !== null;
        } else {
          caseKey = cible;
          complet = true;
        }
        break;
      }
      if (!node.next) break;
      nodeKey = node.next;
      continue;
    }

    break;
  }

  // Les questions hors nouvelle branche tombent : on ne garde que le fil reconstruit.
  return { complet, caseKey, profile, entrees: fil, aRepondre };
}
