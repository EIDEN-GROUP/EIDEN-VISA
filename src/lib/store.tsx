import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Dossier, PackKey, Centre, Decision } from "./dossier-model";
import {
  listDossiers,
  getDossier as getDossierFn,
  togglePiece as togglePieceFn,
  avancerEtape,
  setEtape as setEtapeFn,
  changerCentre as changerCentreFn,
  setDecision as setDecisionFn,
  confirmerRdv as confirmerRdvFn,
  encaisser as encaisserFn,
  changerPack as changerPackFn,
  createDossier,
  updateClient as updateClientFn,
  deleteDossier as deleteDossierFn,
} from "@/backend/functions/dossiers";
import {
  listDocuments as listDocumentsFn,
  uploadDocument as uploadDocumentFn,
  deleteDocument as deleteDocumentFn,
} from "@/backend/functions/documents";
import {
  listCreneaux as listCreneauxFn,
  createCreneau as createCreneauFn,
  updateCreneau as updateCreneauFn,
  deleteCreneau as deleteCreneauFn,
} from "@/backend/functions/creneaux";
import {
  listUsers as listUsersFn,
  createUser as createUserFn,
  updateUserRole as updateUserRoleFn,
  deleteUser as deleteUserFn,
  listActivity as listActivityFn,
  setActingUser as setActingUserFn,
  getActingUser as getActingUserFn,
} from "@/backend/functions/ops";

export type Role = "ceo" | "reception" | "preparation" | "back_office";

const DOSSIERS_KEY = ["dossiers"] as const;
const dossierKey = (id: string) => ["dossiers", id] as const;
const documentsKey = (dossierId: string) => ["documents", dossierId] as const;
const CRENEAUX_KEY = ["creneaux"] as const;
const USERS_KEY = ["ops", "users"] as const;
const ACTIVITY_KEY = ["ops", "activity"] as const;
const ACTING_USER_KEY = ["ops", "acting-user"] as const;

export interface Creneau {
  id: string;
  centre: string;
  date: string;
  places: number;
  statut: "libre" | "reserve" | "ferme";
  dossierId: string | null;
}

export type DocumentType = "france_tls" | "espagne_bls";

function useDossierMutations() {
  const queryClient = useQueryClient();
  const invalidateAll = () => queryClient.invalidateQueries({ queryKey: DOSSIERS_KEY });

  const togglePieceMutation = useMutation({
    mutationFn: (vars: { id: string; index: number }) => togglePieceFn({ data: vars }),
    onSuccess: invalidateAll,
  });
  const avancerMutation = useMutation({
    mutationFn: (id: string) => avancerEtape({ data: { id, direction: "avancer" } }),
    onSuccess: invalidateAll,
  });
  const reculerMutation = useMutation({
    mutationFn: (id: string) => avancerEtape({ data: { id, direction: "reculer" } }),
    onSuccess: invalidateAll,
  });
  const confirmerRdvMutation = useMutation({
    mutationFn: (vars: { id: string; date: string; heure: string }) => confirmerRdvFn({ data: vars }),
    onSuccess: invalidateAll,
  });
  const encaisserMutation = useMutation({
    mutationFn: (vars: { id: string; index: number }) => encaisserFn({ data: vars }),
    onSuccess: invalidateAll,
  });
  const changerPackMutation = useMutation({
    mutationFn: (vars: { id: string; pack: PackKey }) => changerPackFn({ data: vars }),
    onSuccess: invalidateAll,
  });
  const changerCentreMutation = useMutation({
    mutationFn: (vars: { id: string; centre: Centre }) => changerCentreFn({ data: vars }),
    onSuccess: invalidateAll,
  });
  const setDecisionMutation = useMutation({
    mutationFn: (vars: { id: string; decision: Decision }) => setDecisionFn({ data: vars }),
    onSuccess: invalidateAll,
  });
  const ajouterMutation = useMutation({
    mutationFn: (d: Dossier) => createDossier({ data: d }),
    onSuccess: invalidateAll,
  });
  const updateClientMutation = useMutation({
    mutationFn: (vars: { id: string; client: Dossier["client"] }) => updateClientFn({ data: vars }),
    onSuccess: invalidateAll,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDossierFn({ data: { id } }),
    onSuccess: invalidateAll,
  });
  const setEtapeMutation = useMutation({
    mutationFn: (vars: { id: string; etape: number }) => setEtapeFn({ data: vars }),
    // Optimiste : le kanban doit bouger la carte tout de suite au dépôt, pas après un aller-retour réseau.
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: DOSSIERS_KEY });
      const previous = queryClient.getQueryData<Dossier[]>(DOSSIERS_KEY);
      queryClient.setQueryData<Dossier[]>(DOSSIERS_KEY, (old) =>
        old?.map((d) => (d.id === vars.id ? { ...d, etape: vars.etape } : d)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(DOSSIERS_KEY, context.previous);
    },
    onSettled: invalidateAll,
  });

  return {
    togglePiece: (id: string, index: number) => togglePieceMutation.mutateAsync({ id, index }),
    avancer: (id: string) => avancerMutation.mutateAsync(id),
    reculer: (id: string) => reculerMutation.mutateAsync(id),
    confirmerRdv: (id: string, date: string, heure: string) => confirmerRdvMutation.mutateAsync({ id, date, heure }),
    encaisser: (id: string, index: number) => encaisserMutation.mutateAsync({ id, index }),
    changerPack: (id: string, pack: PackKey) => changerPackMutation.mutateAsync({ id, pack }),
    changerCentre: (id: string, centre: Centre) => changerCentreMutation.mutateAsync({ id, centre }),
    setDecision: (id: string, decision: Decision) => setDecisionMutation.mutateAsync({ id, decision }),
    ajouter: (d: Dossier) => ajouterMutation.mutateAsync(d),
    updateClient: (id: string, client: Dossier["client"]) => updateClientMutation.mutateAsync({ id, client }),
    supprimer: (id: string) => deleteMutation.mutateAsync(id),
    setEtape: (id: string, etape: number) => setEtapeMutation.mutateAsync({ id, etape }),
  };
}

/** Liste complète, pour le tableau de bord, la liste des dossiers, paiements, rendez-vous. */
export function useDossiers() {
  const query = useQuery({ queryKey: DOSSIERS_KEY, queryFn: () => listDossiers() });
  const mutations = useDossierMutations();

  return {
    dossiers: query.data ?? [],
    isLoading: query.isLoading,
    get: (id: string) => query.data?.find((d) => d.id === id),
    ...mutations,
  };
}

/** Un seul dossier, pour l'écran de détail — n'attend pas que la liste soit en cache. */
export function useDossier(id: string) {
  const query = useQuery({ queryKey: dossierKey(id), queryFn: () => getDossierFn({ data: { id } }) });
  const mutations = useDossierMutations();

  return {
    dossier: query.data ?? null,
    isLoading: query.isLoading,
    ...mutations,
  };
}

/** Pièces jointes (PDF France/TLScontact ou Espagne/BLS) d'un dossier. */
export function useDocuments(dossierId: string) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: documentsKey(dossierId),
    queryFn: () => listDocumentsFn({ data: { dossierId } }),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: documentsKey(dossierId) });

  const uploadMutation = useMutation({
    mutationFn: (vars: { type: DocumentType; filename: string; mimeType: string; dataBase64: string }) =>
      uploadDocumentFn({ data: { dossierId, ...vars } }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocumentFn({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    documents: query.data ?? [],
    isLoading: query.isLoading,
    upload: (vars: { type: DocumentType; filename: string; mimeType: string; dataBase64: string }) =>
      uploadMutation.mutateAsync(vars),
    supprimer: (id: string) => deleteMutation.mutateAsync(id),
  };
}

/** Veille des créneaux TLS/BLS — saisie manuelle par le back-office, persistée en base. */
export function useCreneaux() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: CRENEAUX_KEY, queryFn: () => listCreneauxFn() });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: CRENEAUX_KEY });

  const createMutation = useMutation({
    mutationFn: (vars: Omit<Creneau, "id">) => createCreneauFn({ data: vars }),
    onSuccess: invalidate,
  });
  const updateMutation = useMutation({
    mutationFn: (vars: Creneau) => updateCreneauFn({ data: vars }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCreneauFn({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    creneaux: query.data ?? [],
    isLoading: query.isLoading,
    ajouter: (c: Omit<Creneau, "id">) => createMutation.mutateAsync(c),
    modifier: (c: Creneau) => updateMutation.mutateAsync(c),
    supprimer: (id: string) => deleteMutation.mutateAsync(id),
  };
}

/** Gestion des comptes — écran /ops, réservé au CEO. */
export function useOpsUsers() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: USERS_KEY, queryFn: () => listUsersFn() });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: USERS_KEY });

  const createMutation = useMutation({
    mutationFn: (vars: { email: string; password: string; nom: string; role: Role }) => createUserFn({ data: vars }),
    onSuccess: invalidate,
  });
  const updateRoleMutation = useMutation({
    mutationFn: (vars: { id: string; role: Role }) => updateUserRoleFn({ data: vars }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserFn({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    creer: (vars: { email: string; password: string; nom: string; role: Role }) => createMutation.mutateAsync(vars),
    changerRole: (id: string, role: Role) => updateRoleMutation.mutateAsync({ id, role }),
    supprimer: (id: string) => deleteMutation.mutateAsync(id),
  };
}

/** Journal d'activité — écran /ops. */
export function useActivity() {
  const query = useQuery({ queryKey: ACTIVITY_KEY, queryFn: () => listActivityFn(), refetchInterval: 15_000 });
  return { activity: query.data ?? [], isLoading: query.isLoading };
}

/** "Connecté en tant que" — pas un vrai login, juste l'attribution des actions tant que
 * l'authentification réelle reste désactivée. */
export function useActingUser() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ACTING_USER_KEY, queryFn: () => getActingUserFn() });
  const mutation = useMutation({
    mutationFn: (userId: string) => setActingUserFn({ data: { userId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTING_USER_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVITY_KEY });
    },
  });
  return {
    actingUser: query.data ?? null,
    isLoading: query.isLoading,
    devenir: (userId: string) => mutation.mutateAsync(userId),
  };
}
