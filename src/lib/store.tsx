import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Dossier, PackKey, Centre, Decision, Modalite } from "./dossier-model";
import {
  listDossiers,
  listDossiersPage,
  listAlertesDossiers,
  listDossiersRecents,
  listDossiersByRdvStatut,
  listDossiersAvecImpaye,
  listDossiersAvecEncaissement,
  getDashboardStats,
  getPaiementsStats,
  getPackCounts,
  getDossier as getDossierFn,
  togglePiece as togglePieceFn,
  avancerEtape,
  setEtape as setEtapeFn,
  changerCentre as changerCentreFn,
  setDecision as setDecisionFn,
  confirmerRdv as confirmerRdvFn,
  encaisser as encaisserFn,
  changerPack as changerPackFn,
  setModalitePaiement as setModalitePaiementFn,
  getPaiementsSuivi,
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
  getAnalytics,
  getUser as getUserFn,
  updateUser as updateUserFn,
  setUserPhoto as setUserPhotoFn,
  resetUserPassword as resetUserPasswordFn,
  getUserProfile as getUserProfileFn,
} from "@/backend/functions/ops";
import { currentUser as currentUserFn } from "@/backend/functions/auth";
import {
  getMyProfile as getMyProfileFn,
  updateMyName as updateMyNameFn,
  setMyPhoto as setMyPhotoFn,
  changeMyPassword as changeMyPasswordFn,
} from "@/backend/functions/profile";

export type Role = "ceo" | "reception" | "preparation" | "back_office";
export const ROLE_LABEL: Record<Role, string> = {
  ceo: "CEO",
  reception: "Réception",
  preparation: "Préparation",
  back_office: "Back office",
};

const DOSSIERS_KEY = ["dossiers", "all"] as const;
const dossierKey = (id: string) => ["dossiers", "detail", id] as const;
/** Filtre de date partagé par tous les écrans — porte sur la date d'ouverture réelle du dossier. */
export interface DateRange {
  from?: string | undefined;
  to?: string | undefined;
}
const emptyRange: DateRange = {};

export interface DossiersPageParams {
  page: number;
  pageSize: number;
  search?: string | undefined;
  niveau?: "tous" | "standard" | "attention" | "complexe" | undefined;
  pays?: "tous" | "france" | "espagne" | undefined;
  range?: DateRange | undefined;
  mine?: boolean | undefined;
}
const dossiersPageKey = (params: DossiersPageParams) => ["dossiers", "page", params] as const;
const dashboardStatsKey = (range: DateRange) => ["dossiers", "dashboard-stats", range] as const;
const paiementsStatsKey = (range: DateRange) => ["dossiers", "paiements-stats", range] as const;
const packCountsKey = (range: DateRange) => ["dossiers", "pack-counts", range] as const;
const ALERTES_KEY = ["dossiers", "alertes"] as const;
const RECENTS_KEY = ["dossiers", "recents"] as const;
const impayeKey = (range: DateRange) => ["dossiers", "impaye", range] as const;
const encaissementKey = (range: DateRange) => ["dossiers", "encaissement", range] as const;
const rdvStatutKey = (statut: "recherche" | "confirme" | "depose", range: DateRange) =>
  ["dossiers", "rdv-statut", statut, range] as const;
const documentsKey = (dossierId: string) => ["documents", dossierId] as const;
const CRENEAUX_KEY = ["creneaux"] as const;
const USERS_KEY = ["ops", "users"] as const;
const ACTIVITY_KEY = ["ops", "activity"] as const;
const CURRENT_USER_KEY = ["auth", "current-user"] as const;
const PAIEMENTS_SUIVI_KEY = ["ops", "paiements-suivi"] as const;
const ANALYTICS_KEY = ["ops", "analytics"] as const;

export interface Creneau {
  id: string;
  centre: string;
  date: string;
  places: number;
  statut: "libre" | "reserve" | "ferme";
  dossierId: string | null;
}

export type DocumentType = "france_tls" | "espagne_bls" | "autre";

function useDossierMutations() {
  const queryClient = useQueryClient();
  // Une seule mutation peut affecter la page filtrée courante, les stats agrégées, le
  // tableau de bord et les listes bornées (impayés, encaissements, rendez-vous) —
  // on invalide tout ce qui vit sous le préfixe "dossiers" plutôt que de traquer chaque cas.
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["dossiers"] });
    // Le suivi des paiements /ops et le journal d'activité dérivent des mêmes mutations.
    queryClient.invalidateQueries({ queryKey: ["ops"] });
  };

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
    mutationFn: (vars: { id: string; date: string; heure: string }) =>
      confirmerRdvFn({ data: vars }),
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
  const changerModaliteMutation = useMutation({
    mutationFn: (vars: { id: string; modalite: Modalite }) => setModalitePaiementFn({ data: vars }),
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
    // Le kanban lit désormais une page filtrée (["dossiers","page",params]), pas la liste
    // complète : on met à jour toutes les entrées en cache portant ce préfixe.
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["dossiers"] });
      const previousEntries = queryClient.getQueriesData<
        Dossier[] | { rows: Dossier[]; total: number }
      >({
        queryKey: ["dossiers"],
      });
      for (const [key, data] of previousEntries) {
        if (!data) continue;
        if (Array.isArray(data)) {
          queryClient.setQueryData<Dossier[]>(
            key,
            data.map((d) => (d.id === vars.id ? { ...d, etape: vars.etape } : d)),
          );
        } else if (Array.isArray(data.rows)) {
          queryClient.setQueryData(key, {
            ...data,
            rows: data.rows.map((d) => (d.id === vars.id ? { ...d, etape: vars.etape } : d)),
          });
        }
      }
      return { previousEntries };
    },
    onError: (_err, _vars, context) => {
      context?.previousEntries.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: invalidateAll,
  });

  return {
    togglePiece: (id: string, index: number) => togglePieceMutation.mutateAsync({ id, index }),
    avancer: (id: string) => avancerMutation.mutateAsync(id),
    reculer: (id: string) => reculerMutation.mutateAsync(id),
    confirmerRdv: (id: string, date: string, heure: string) =>
      confirmerRdvMutation.mutateAsync({ id, date, heure }),
    encaisser: (id: string, index: number) => encaisserMutation.mutateAsync({ id, index }),
    changerPack: (id: string, pack: PackKey) => changerPackMutation.mutateAsync({ id, pack }),
    changerModalite: (id: string, modalite: Modalite) =>
      changerModaliteMutation.mutateAsync({ id, modalite }),
    changerCentre: (id: string, centre: Centre) =>
      changerCentreMutation.mutateAsync({ id, centre }),
    setDecision: (id: string, decision: Decision) =>
      setDecisionMutation.mutateAsync({ id, decision }),
    ajouter: (d: Dossier) => ajouterMutation.mutateAsync(d),
    updateClient: (id: string, client: Dossier["client"]) =>
      updateClientMutation.mutateAsync({ id, client }),
    supprimer: (id: string) => deleteMutation.mutateAsync(id),
    setEtape: (id: string, etape: number) => setEtapeMutation.mutateAsync({ id, etape }),
  };
}

/** Page filtrée/paginée côté SQL — écran Dossiers. Tient à l'échelle quel que soit le volume. */
export function useDossiersPage(params: DossiersPageParams) {
  const { range, ...rest } = params;
  const query = useQuery({
    queryKey: dossiersPageKey(params),
    queryFn: () =>
      listDossiersPage({ data: { ...rest, dateFrom: range?.from, dateTo: range?.to } }),
    placeholderData: (prev) => prev,
  });
  const mutations = useDossierMutations();
  return {
    dossiers: query.data?.rows ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    ...mutations,
  };
}

/** Statistiques agrégées côté SQL pour le tableau de bord. */
export function useDashboardStats(range: DateRange = emptyRange) {
  const query = useQuery({
    queryKey: dashboardStatsKey(range),
    queryFn: () => getDashboardStats({ data: { dateFrom: range.from, dateTo: range.to } }),
  });
  return { stats: query.data, isLoading: query.isLoading };
}

/** Dossiers actifs, bornés — sert à calculer les alertes sans charger toute la table. */
export function useAlertesDossiers() {
  const query = useQuery({ queryKey: ALERTES_KEY, queryFn: () => listAlertesDossiers() });
  return { dossiers: query.data ?? [], isLoading: query.isLoading };
}

export function useDossiersRecents() {
  const query = useQuery({ queryKey: RECENTS_KEY, queryFn: () => listDossiersRecents() });
  return { dossiers: query.data ?? [], isLoading: query.isLoading };
}

export function useDossiersByRdvStatut(
  statut: "recherche" | "confirme" | "depose",
  range: DateRange = emptyRange,
) {
  const query = useQuery({
    queryKey: rdvStatutKey(statut, range),
    queryFn: () =>
      listDossiersByRdvStatut({ data: { statut, dateFrom: range.from, dateTo: range.to } }),
  });
  const mutations = useDossierMutations();
  return { dossiers: query.data ?? [], isLoading: query.isLoading, ...mutations };
}

export function useDossiersAvecImpaye(range: DateRange = emptyRange) {
  const query = useQuery({
    queryKey: impayeKey(range),
    queryFn: () => listDossiersAvecImpaye({ data: { dateFrom: range.from, dateTo: range.to } }),
  });
  const mutations = useDossierMutations();
  return { dossiers: query.data ?? [], isLoading: query.isLoading, ...mutations };
}

export function useDossiersAvecEncaissement(range: DateRange = emptyRange) {
  const query = useQuery({
    queryKey: encaissementKey(range),
    queryFn: () =>
      listDossiersAvecEncaissement({ data: { dateFrom: range.from, dateTo: range.to } }),
  });
  return { dossiers: query.data ?? [], isLoading: query.isLoading };
}

export function usePaiementsStats(range: DateRange = emptyRange) {
  const query = useQuery({
    queryKey: paiementsStatsKey(range),
    queryFn: () => getPaiementsStats({ data: { dateFrom: range.from, dateTo: range.to } }),
  });
  return { stats: query.data, isLoading: query.isLoading };
}

export function usePackCounts(range: DateRange = emptyRange) {
  const query = useQuery({
    queryKey: packCountsKey(range),
    queryFn: () => getPackCounts({ data: { dateFrom: range.from, dateTo: range.to } }),
  });
  return { counts: query.data ?? [], isLoading: query.isLoading };
}

/** Liste complète — conservée pour les besoins ponctuels (formulaires listant tous les dossiers). */
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
  const query = useQuery({
    queryKey: dossierKey(id),
    queryFn: () => getDossierFn({ data: { id } }),
  });
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
    mutationFn: (vars: {
      type: DocumentType;
      filename: string;
      mimeType: string;
      dataBase64: string;
    }) => uploadDocumentFn({ data: { dossierId, ...vars } }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocumentFn({ data: { id } }),
    onSuccess: invalidate,
  });

  return {
    documents: query.data ?? [],
    isLoading: query.isLoading,
    upload: (vars: {
      type: DocumentType;
      filename: string;
      mimeType: string;
      dataBase64: string;
    }) => uploadMutation.mutateAsync(vars),
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
    mutationFn: (vars: { email: string; password: string; nom: string; role: Role }) =>
      createUserFn({ data: vars }),
    onSuccess: invalidate,
  });
  const updateRoleMutation = useMutation({
    mutationFn: (vars: { id: string; role: Role }) => updateUserRoleFn({ data: vars }),
    onSuccess: invalidate,
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUserFn({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ops"] }),
  });

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    creer: (vars: { email: string; password: string; nom: string; role: Role }) =>
      createMutation.mutateAsync(vars),
    changerRole: (id: string, role: Role) => updateRoleMutation.mutateAsync({ id, role }),
    supprimer: (id: string) => deleteMutation.mutateAsync(id),
  };
}

const userKey = (id: string) => ["ops", "user", id] as const;
const userProfileKey = (id: string) => ["ops", "user-profile", id] as const;

/** Fiche d'un agent : infos éditables + photo + mot de passe. Réservé au CEO. */
export function useUser(id: string) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: userKey(id), queryFn: () => getUserFn({ data: { id } }) });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["ops"] });

  const infosMutation = useMutation({
    mutationFn: (vars: { nom: string; email: string }) => updateUserFn({ data: { id, ...vars } }),
    onSuccess: invalidate,
  });
  const photoMutation = useMutation({
    mutationFn: (photoBase64: string | null) => setUserPhotoFn({ data: { id, photoBase64 } }),
    onSuccess: invalidate,
  });
  const passwordMutation = useMutation({
    mutationFn: (password: string) => resetUserPasswordFn({ data: { id, password } }),
    onSuccess: invalidate,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    modifier: (vars: { nom: string; email: string }) => infosMutation.mutateAsync(vars),
    changerPhoto: (photoBase64: string | null) => photoMutation.mutateAsync(photoBase64),
    reinitialiserMotDePasse: (password: string) => passwordMutation.mutateAsync(password),
  };
}

/** Profil analytique complet d'un agent — dossiers, pièces, encaissements, activité. */
export function useUserProfile(id: string) {
  const query = useQuery({
    queryKey: userProfileKey(id),
    queryFn: () => getUserProfileFn({ data: { id } }),
    refetchInterval: 60_000,
  });
  return { data: query.data ?? null, isLoading: query.isLoading };
}

const MY_PROFILE_KEY = ["my-profile"] as const;

/** La fiche de l'utilisateur connecté — accessible depuis le rail, avec self-service. */
export function useMyProfile() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: MY_PROFILE_KEY,
    queryFn: () => getMyProfileFn(),
    refetchInterval: 60_000,
  });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: MY_PROFILE_KEY });
    queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
  };

  const nameMutation = useMutation({
    mutationFn: (nom: string) => updateMyNameFn({ data: { nom } }),
    onSuccess: invalidate,
  });
  const photoMutation = useMutation({
    mutationFn: (photoBase64: string | null) => setMyPhotoFn({ data: { photoBase64 } }),
    onSuccess: invalidate,
  });
  const passwordMutation = useMutation({
    mutationFn: (vars: { actuel: string; nouveau: string }) => changeMyPasswordFn({ data: vars }),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    changerNom: (nom: string) => nameMutation.mutateAsync(nom),
    changerPhoto: (photoBase64: string | null) => photoMutation.mutateAsync(photoBase64),
    changerMotDePasse: (vars: { actuel: string; nouveau: string }) =>
      passwordMutation.mutateAsync(vars),
  };
}

/** Journal d'activité — écran /ops. */
export function useActivity() {
  const query = useQuery({
    queryKey: ACTIVITY_KEY,
    queryFn: () => listActivityFn(),
    refetchInterval: 15_000,
  });
  return { activity: query.data ?? [], isLoading: query.isLoading };
}

/** Suivi complet des encaissements — écran /ops, réservé au CEO. */
export function usePaiementsSuivi() {
  const query = useQuery({
    queryKey: PAIEMENTS_SUIVI_KEY,
    queryFn: () => getPaiementsSuivi(),
    refetchInterval: 30_000,
  });
  return { suivi: query.data ?? null, isLoading: query.isLoading };
}

/** Tableau analytique complet — écran /ops, réservé au CEO. */
export function useAnalytics() {
  const query = useQuery({
    queryKey: ANALYTICS_KEY,
    queryFn: () => getAnalytics(),
    refetchInterval: 60_000,
    retry: 1,
  });
  return { data: query.data ?? null, isLoading: query.isLoading, isError: query.isError };
}

/** Le VRAI utilisateur connecté — remplace l'ancien sélecteur "connecté en tant que"
 * maintenant que le login réel est actif. Plus aucune façon de se faire passer pour
 * quelqu'un d'autre sans son mot de passe. */
export function useCurrentUser() {
  const query = useQuery({ queryKey: CURRENT_USER_KEY, queryFn: () => currentUserFn() });
  return { user: query.data ?? null, isLoading: query.isLoading };
}
