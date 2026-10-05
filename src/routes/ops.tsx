import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useCurrentUser,
  useOpsUsers,
  useActivity,
  useAlertesDossiers,
  usePaiementsSuivi,
  useAnalytics,
  ROLE_LABEL,
  type Role,
} from "@/lib/store";
import { MODALITE_LABEL, alertes, ETAPES } from "@/lib/dossier-model";
import { exportOpsPdf } from "@/lib/ops-pdf";
import { AnalyticsPanel } from "@/components/ops/analytics-panel";
import { UserProfile } from "@/components/ops/user-profile";
import { login, logout } from "@/backend/functions/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertTriangle,
  Plus,
  LogOut,
  LayoutDashboard,
  BarChart3,
  Wallet2,
  Users2,
  ScrollText,
  Download,
  Receipt,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import sealEiden from "@/assets/decorations/logo-eiden.png";
import opsIcons from "@/assets/decorations/ops-security-icons.png";

const ROLES: { value: Role; label: string }[] = (Object.keys(ROLE_LABEL) as Role[]).map(
  (value) => ({
    value,
    label: ROLE_LABEL[value],
  }),
);

const SECTIONS = ["synthese", "analytique", "paiements", "equipe", "alertes", "activite"] as const;
type OpsSection = (typeof SECTIONS)[number];

// Route volontairement top-level (pas sous /_app) : /ops a sa propre porte d'entrée,
// distincte du login du reste de l'équipe, et n'apparaît nulle part dans le rail latéral.
// La section active vit dans l'URL (?s=) pour être partageable et gérer le bouton retour.
export const Route = createFileRoute("/ops")({
  validateSearch: (search: Record<string, unknown>): { s: OpsSection; u?: string } => {
    const s = SECTIONS.includes(search["s"] as OpsSection)
      ? (search["s"] as OpsSection)
      : "synthese";
    const u = typeof search["u"] === "string" && search["u"] ? (search["u"] as string) : undefined;
    return u ? { s, u } : { s };
  },
  component: OpsGate,
});

function OpsGate() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return null;
  if (!user) return <OpsLogin />;
  if (user.role !== "ceo") return <OpsDenied />;
  return <Ops />;
}

function OpsLogin() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const account = await login({ data: { email, password } });
      if (account.role !== "ceo") {
        // Identifiants valides mais compte non-CEO : refusé ici, mais on ne le laisse
        // pas connecté via la porte superadmin — il devra passer par /login normalement.
        await logout();
        setError("Ce compte n'a pas les droits superadmin.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="login-rounded flex min-h-screen items-center justify-center p-4"
      style={{ background: "var(--login-bg)" }}
    >
      <div
        className="ops-login-card login-card relative w-full max-w-sm overflow-hidden border border-white/10 shadow-2xl"
        style={{ background: "var(--login-rail)" }}
      >
        {/* Halo doux derrière le cluster d'icônes */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/4 rounded-full opacity-60 blur-3xl"
          style={{ background: "oklch(0.4 0.05 275)" }}
        />

        <div className="relative flex flex-col items-center px-8 pt-10 pb-2 text-center">
          <img src={opsIcons} alt="" className="w-32 drop-shadow-lg" />
          <h1
            className="login-display mt-4 text-2xl tracking-tight"
            style={{ color: "oklch(0.97 0.008 90)" }}
          >
            Accès superadmin
          </h1>
          <div className="login-mark mt-2 flex items-center gap-2">
            <img src={sealEiden} alt="" className="h-5 w-5 rounded-full bg-white p-0.5" />
            <span className="ref" style={{ color: "var(--rail-muted)" }}>
              Eiden Visa · Espace Ops
            </span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="relative space-y-4 px-8 pt-7 pb-10">
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              className="ops-login-input h-12 border-white/15 bg-white/5 px-5 text-sm text-white placeholder:text-white/40"
            />
            <Input
              type="password"
              placeholder="mot de passe"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ops-login-input h-12 border-white/15 bg-white/5 px-5 text-sm text-white placeholder:text-white/40"
            />
          </div>
          {error && <p className="text-sm text-[var(--stop)]">{error}</p>}
          <Button
            type="submit"
            disabled={pending}
            className="h-11 w-full hover:opacity-90"
            style={{ background: "oklch(0.97 0.008 90)", color: "var(--login-rail)" }}
          >
            {pending ? "Connexion…" : "Entrer"}
          </Button>
          <p className="pt-1 text-center text-xs" style={{ color: "var(--rail-muted)" }}>
            Réservé aux comptes CEO — les autres comptes doivent utiliser{" "}
            <Link to="/login" className="underline hover:text-white">
              la connexion standard
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

function OpsDenied() {
  const queryClient = useQueryClient();
  async function onLogout() {
    await logout();
    await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-center">
      <p className="text-sm text-muted-foreground">
        Ce compte est connecté, mais n'a pas les droits superadmin nécessaires pour /ops.
      </p>
      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 text-sm text-primary hover:underline"
      >
        <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> Se déconnecter
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Corps de navigation de l'espace Ops — défini au niveau module (jamais pendant
 * le rendu) pour ne pas recréer un composant à chaque passe. */
function NavContenu({
  nav,
  section,
  go,
  onLogout,
  onPick,
}: {
  nav: {
    key: OpsSection;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number | undefined;
  }[];
  section: OpsSection;
  go: (s: OpsSection, u?: string) => void;
  onLogout: () => void;
  onPick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col text-rail-foreground">
      <div className="hidden items-center gap-3 px-5 py-5 md:flex">
        <img src={sealEiden} alt="" className="h-8 w-8 rounded-full bg-white p-0.5" />
        <div>
          <div className="font-display text-base font-semibold leading-none">Eiden Visa</div>
          <div className="ref mt-1 text-rail-muted">Espace Ops</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3 py-4 md:py-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = section === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                go(item.key);
                onPick?.();
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-rail-active font-medium text-rail-foreground"
                  : "text-rail-muted hover:bg-rail-active/50",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-[var(--stop)] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-5 py-4 text-sm text-rail-muted hover:text-rail-foreground"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.5} /> Se déconnecter
      </button>
    </div>
  );
}

function Ops() {
  const { s: section, u: userId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const go = (s: OpsSection, u?: string) => navigate({ search: u ? { s, u } : { s } });

  const { users, creer, changerRole } = useOpsUsers();
  const { activity } = useActivity();
  // Borné (300 actifs) : la synthèse n'a jamais besoin de la table entière.
  const { dossiers } = useAlertesDossiers();
  const { suivi } = usePaiementsSuivi();
  const queryClient = useQueryClient();

  const [navOpen, setNavOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("reception");

  const alertesActives = dossiers.map((d) => ({ d, a: alertes(d) })).filter((x) => x.a.length > 0);
  const paiementsDus = (suivi?.acomptesEnRetard.length ?? 0) + (suivi?.soldesDus.length ?? 0);

  async function onCreate() {
    await creer({ nom, email, password, role });
    setCreateOpen(false);
    setNom("");
    setEmail("");
    setPassword("");
    setRole("reception");
  }

  async function onLogout() {
    await logout();
    await queryClient.invalidateQueries({ queryKey: ["auth", "current-user"] });
  }

  const NAV: {
    key: OpsSection;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number | undefined;
  }[] = [
    { key: "synthese", label: "Vue d'ensemble", icon: LayoutDashboard },
    { key: "analytique", label: "Analytique", icon: BarChart3 },
    { key: "paiements", label: "Paiements", icon: Wallet2, badge: paiementsDus || undefined },
    { key: "equipe", label: "Équipe", icon: Users2 },
    {
      key: "alertes",
      label: "Alertes",
      icon: AlertTriangle,
      badge: alertesActives.length || undefined,
    },
    { key: "activite", label: "Activité", icon: ScrollText },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      {/* Barre supérieure mobile */}
      <div className="flex items-center justify-between border-b border-border bg-rail px-4 py-3 text-rail-foreground md:hidden">
        <div className="flex items-center gap-2">
          <img src={sealEiden} alt="" className="h-7 w-7 rounded-full bg-white p-0.5" />
          <span className="font-display text-sm font-semibold">Espace Ops</span>
        </div>
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger
            className="rounded-md p-1.5 text-rail-muted hover:text-rail-foreground"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 border-0 bg-rail p-0 [&>button]:z-10 [&>button]:bg-rail-active/70 [&>button]:p-1.5 [&>button]:text-rail-foreground [&>button]:opacity-90 [&>button]:hover:opacity-100"
          >
            <NavContenu
              nav={NAV}
              section={section}
              go={go}
              onLogout={onLogout}
              onPick={() => setNavOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar fixe desktop */}
      <aside className="hidden w-60 shrink-0 bg-rail md:block">
        <NavContenu nav={NAV} section={section} go={go} onLogout={onLogout} />
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          {section === "synthese" && (
            <Synthese
              alertesActives={alertesActives}
              suivi={suivi}
              activity={activity}
              onNav={go}
            />
          )}
          {section === "analytique" && <AnalyticsPanel />}
          {section === "paiements" && <PaiementsSection suivi={suivi} />}
          {section === "equipe" &&
            (userId ? (
              <UserProfile id={userId} onBack={() => go("equipe")} />
            ) : (
              <EquipeSection
                users={users}
                changerRole={changerRole}
                onOpen={(id) => go("equipe", id)}
                onCreate={() => setCreateOpen(true)}
              />
            ))}
          {section === "alertes" && <AlertesSection rows={alertesActives} />}
          {section === "activite" && <ActiviteSection activity={activity} />}
        </div>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un compte</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Nom</label>
              <Input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom complet"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@eidenvisa.ma"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Mot de passe</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12 caractères min."
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Rôle</label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!nom.trim() || !email.trim() || password.length < 12}
              onClick={onCreate}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------- Sections -------------------------------- */

type AlerteRow = { d: ReturnType<typeof useAlertesDossiers>["dossiers"][number]; a: string[] };
type Suivi = ReturnType<typeof usePaiementsSuivi>["suivi"];
type Activity = ReturnType<typeof useActivity>["activity"];

function SectionTitle({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="page-title">{title}</h1>
        {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function Synthese({
  alertesActives,
  suivi,
  activity,
  onNav,
}: {
  alertesActives: AlerteRow[];
  suivi: Suivi;
  activity: Activity;
  onNav: (s: OpsSection) => void;
}) {
  const { data } = useAnalytics();
  const k = data?.kpis;
  const pipeline = ETAPES.map((e) => ({
    e,
    n: data?.pipeline.find((p) => p.k === String(e.n))?.n ?? 0,
  }));
  const pipelineTotal = pipeline.reduce((s, x) => s + x.n, 0) || 1;

  return (
    <div>
      <SectionTitle
        title="Vue d'ensemble"
        hint="L'essentiel en un écran — ce qui va, et ce qui demande une décision."
      />

      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        <Kpi
          label="Dossiers actifs"
          value={k ? `${k.actifs}` : "—"}
          hint={k ? `${k.total} au total` : undefined}
        />
        <Kpi
          label="Taux d'approbation"
          value={k?.tauxApprobation == null ? "—" : `${k.tauxApprobation} %`}
          hint={k ? `${k.approuve} ✓ · ${k.refuse} ✗` : undefined}
        />
        <Kpi
          label="Encaissé"
          value={k ? `${k.totalEncaisse.toLocaleString("fr-FR")} MAD` : "—"}
          hint={suivi ? `${suivi.totaux.attente.toLocaleString("fr-FR")} en attente` : undefined}
        />
        <Kpi
          label="Alertes actives"
          value={`${alertesActives.length}`}
          hint={alertesActives.length ? "à traiter" : "rien à signaler"}
          tone={alertesActives.length ? "stop" : "ok"}
        />
      </div>

      <Card className="panel mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Où sont les dossiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-3 overflow-hidden rounded-full">
            {pipeline.map(({ e, n }) => (
              <div
                key={e.n}
                title={`${e.label} — ${n}`}
                style={{ width: `${(n / pipelineTotal) * 100}%` }}
                className={cn(e.n % 2 ? "bg-primary" : "bg-rail")}
              />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
            {pipeline.map(({ e, n }) => (
              <button
                key={e.n}
                onClick={() => onNav("analytique")}
                className="flex items-center justify-between text-xs text-muted-foreground hover:text-foreground"
              >
                <span className="truncate">
                  {e.n}. {e.label}
                </span>
                <span className="ref ml-2 text-foreground">{n}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">À traiter en priorité</CardTitle>
            {alertesActives.length > 3 && (
              <button
                onClick={() => onNav("alertes")}
                className="text-xs text-primary hover:underline"
              >
                Tout voir
              </button>
            )}
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {alertesActives.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Aucun blocage détecté.</p>
            )}
            {alertesActives.slice(0, 4).map(({ d, a }) => (
              <Link
                key={d.id}
                to="/dossiers/$id"
                params={{ id: d.id }}
                className="block px-4 py-3 hover:bg-accent/40"
              >
                <div className="flex items-center justify-between">
                  <span className="ref text-muted-foreground">{d.id}</span>
                  <span className="text-sm font-medium text-foreground">{d.client.nom}</span>
                </div>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-[var(--stop)]">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.5} />
                  {a[0]}
                  {a.length > 1 && <span className="text-muted-foreground"> +{a.length - 1}</span>}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="panel">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Encaissements à venir</CardTitle>
            {paiementsCount(suivi) > 4 && (
              <button
                onClick={() => onNav("paiements")}
                className="text-xs text-primary hover:underline"
              >
                Tout voir
              </button>
            )}
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {paiementsCount(suivi) === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Rien en attente d'encaissement.</p>
            )}
            {[...(suivi?.acomptesEnRetard ?? []), ...(suivi?.soldesDus ?? [])]
              .slice(0, 4)
              .map((r) => (
                <Link
                  key={r.id}
                  to="/dossiers/$id"
                  params={{ id: r.id }}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-accent/40"
                >
                  <div>
                    <div className="font-medium text-foreground">{r.nom}</div>
                    <div className="ref text-muted-foreground">
                      {r.id} · étape {r.etape}
                    </div>
                  </div>
                  <span className="ref text-foreground">
                    {r.montant.toLocaleString("fr-FR")} MAD
                  </span>
                </Link>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card className="panel mt-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm">Activité récente</CardTitle>
          <button
            onClick={() => onNav("activite")}
            className="text-xs text-primary hover:underline"
          >
            Tout voir
          </button>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {activity.slice(0, 6).map((a) => (
            <ActivityRow key={a.id} a={a} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function paiementsCount(suivi: Suivi) {
  return (suivi?.acomptesEnRetard.length ?? 0) + (suivi?.soldesDus.length ?? 0);
}

function PaiementsSection({ suivi }: { suivi: Suivi }) {
  return (
    <div>
      <SectionTitle
        title="Paiements"
        hint="Tous dossiers confondus — la source de vérité des encaissements Eiden Visa."
        action={
          suivi && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportOpsPdf({
                  title: "Suivi des encaissements",
                  filename: "encaissements-eiden-visa.pdf",
                  intro:
                    "État des paiements Eiden Visa, tous dossiers confondus. Les frais réglés en direct à TLScontact / BLS n'y figurent pas.",
                  kpis: [
                    { label: "Encaissé", value: money(suivi.totaux.encaisse) },
                    { label: "En attente", value: money(suivi.totaux.attente) },
                    { label: "Acomptes dus", value: money(suivi.totaux.acompteDu) },
                    { label: "Soldes dus", value: money(suivi.totaux.soldeDu) },
                  ],
                  sections: [
                    {
                      heading: `Acomptes en retard (${suivi.acomptesEnRetard.length})`,
                      empty: "Aucun acompte en souffrance.",
                      columns: [
                        { header: "Client", w: 4 },
                        { header: "Dossier", w: 3 },
                        { header: "Étape", w: 2 },
                        { header: "Montant", w: 3, align: "right" },
                      ],
                      rows: suivi.acomptesEnRetard.map((r) => [
                        r.nom,
                        r.id,
                        `${r.etape}`,
                        `${r.montant.toLocaleString("fr-FR")} MAD`,
                      ]),
                    },
                    {
                      heading: `Soldes à encaisser (${suivi.soldesDus.length})`,
                      empty: "Aucun solde en attente.",
                      columns: [
                        { header: "Client", w: 4 },
                        { header: "Dossier", w: 3 },
                        { header: "Étape", w: 2 },
                        { header: "Montant", w: 3, align: "right" },
                      ],
                      rows: suivi.soldesDus.map((r) => [
                        r.nom,
                        r.id,
                        `${r.etape}`,
                        `${r.montant.toLocaleString("fr-FR")} MAD`,
                      ]),
                    },
                    {
                      heading: `Journal des encaissements (${suivi.journal.length})`,
                      empty: "Aucun encaissement enregistré.",
                      columns: [
                        { header: "Date", w: 3 },
                        { header: "Agent", w: 3 },
                        { header: "Détail", w: 5 },
                        { header: "Dossier", w: 2 },
                      ],
                      rows: suivi.journal.map((j) => [
                        new Date(j.createdAt).toLocaleString("fr-FR"),
                        j.userNom ?? "Inconnu",
                        j.detail,
                        j.dossierId ?? "—",
                      ]),
                    },
                  ],
                })
              }
            >
              <Download className="h-3.5 w-3.5" /> Exporter (PDF)
            </Button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
        <Kpi label="Encaissé" value={money(suivi?.totaux.encaisse)} tone="ok" />
        <Kpi label="En attente" value={money(suivi?.totaux.attente)} tone="warn" />
        <Kpi label="Dont acomptes dus" value={money(suivi?.totaux.acompteDu)} />
        <Kpi label="Dont soldes dus" value={money(suivi?.totaux.soldeDu)} />
      </div>

      <p className="mb-6 text-xs text-muted-foreground">
        {suivi
          ? `${suivi.parModalite.acompte} dossier(s) en « ${MODALITE_LABEL.acompte} », ${suivi.parModalite.comptant} en « ${MODALITE_LABEL.comptant} ».`
          : "Chargement…"}
      </p>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SuiviListe
          titre="Acomptes en retard"
          vide="Aucun acompte en souffrance."
          rows={suivi?.acomptesEnRetard ?? []}
        />
        <SuiviListe
          titre="Soldes à encaisser (étape ≥ 6)"
          vide="Aucun solde en attente à la remise."
          rows={suivi?.soldesDus ?? []}
        />
      </div>

      <Card className="panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Journal des encaissements</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {(suivi?.journal.length ?? 0) === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Aucun encaissement enregistré.</p>
          )}
          {suivi?.journal.map((j) => (
            <div key={j.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <span className="font-medium text-foreground">{j.userNom ?? "Inconnu"}</span>
                <span className="ml-2 text-muted-foreground">{j.detail}</span>
              </div>
              <div className="flex items-center gap-3">
                {j.dossierId && (
                  <>
                    <Link
                      to="/dossiers/$id"
                      params={{ id: j.dossierId }}
                      className="text-primary hover:underline"
                    >
                      {j.dossierId}
                    </Link>
                    <RecuLink id={j.dossierId} />
                  </>
                )}
                <span className="ref text-muted-foreground">
                  {new Date(j.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function EquipeSection({
  users,
  changerRole,
  onOpen,
  onCreate,
}: {
  users: ReturnType<typeof useOpsUsers>["users"];
  changerRole: ReturnType<typeof useOpsUsers>["changerRole"];
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const { data } = useAnalytics();
  return (
    <div>
      <SectionTitle
        title="Équipe"
        hint="Comptes, rôles, et production par personne."
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportOpsPdf({
                  title: "Comptes & rôles",
                  filename: "comptes-eiden-visa.pdf",
                  sections: [
                    {
                      heading: `Utilisateurs (${users.length})`,
                      columns: [
                        { header: "Nom", w: 3 },
                        { header: "Email", w: 4 },
                        { header: "Rôle", w: 2 },
                      ],
                      rows: users.map((u) => [u.nom, u.email, ROLE_LABEL[u.role]]),
                    },
                    ...(data?.parRole?.length
                      ? [
                          {
                            heading: "Production par rôle",
                            columns: [
                              { header: "Rôle", w: 3 },
                              { header: "Comptes", w: 2, align: "right" as const },
                              { header: "Dossiers", w: 2, align: "right" as const },
                              { header: "Actifs", w: 2, align: "right" as const },
                            ],
                            rows: data.parRole.map((r) => [
                              r.role === "non_attribue"
                                ? "Non attribué"
                                : (ROLE_LABEL[r.role as Role] ?? r.role),
                              `${r.agents}`,
                              `${r.dossiers}`,
                              `${r.actifs}`,
                            ]),
                          },
                        ]
                      : []),
                  ],
                })
              }
            >
              <Download className="h-3.5 w-3.5" /> Exporter (PDF)
            </Button>
            <Button size="sm" onClick={onCreate}>
              <Plus className="h-3.5 w-3.5" /> Créer un compte
            </Button>
          </div>
        }
      />

      <Card className="panel mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
            >
              <button
                onClick={() => onOpen(u.id)}
                className="min-w-0 flex-1 text-left hover:underline"
              >
                <div className="truncate text-sm font-medium text-foreground">{u.nom}</div>
                <div className="ref text-muted-foreground">{u.email}</div>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <Select value={u.role} onValueChange={(v) => changerRole(u.id, v as Role)}>
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={() => onOpen(u.id)}>
                  Ouvrir la fiche
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="panel">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Production par rôle</CardTitle>
          <p className="text-xs text-muted-foreground">
            Dossiers ouverts par les comptes de chaque rôle.
          </p>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {(data?.parRole ?? []).map((r) => (
            <div key={r.role} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="font-medium text-foreground">
                {r.role === "non_attribue"
                  ? "Non attribué"
                  : (ROLE_LABEL[r.role as Role] ?? r.role)}
              </span>
              <span className="text-muted-foreground">
                {r.agents} compte(s) · <span className="text-foreground">{r.dossiers}</span>{" "}
                dossier(s) · {r.actifs} actif(s)
              </span>
            </div>
          ))}
          {(data?.parAgent ?? []).length > 0 && (
            <div className="px-5 py-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Top agents</div>
              {data!.parAgent.map((a) => (
                <div key={a.nom} className="flex items-center justify-between py-1 text-sm">
                  <span className="text-foreground">{a.nom}</span>
                  <span className="ref text-muted-foreground">{a.dossiers} dossier(s)</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AlertesSection({ rows }: { rows: AlerteRow[] }) {
  return (
    <div>
      <SectionTitle
        title="Alertes"
        hint="Blocages détectés par le système sur l'ensemble des dossiers, avant que le client ne les découvre."
      />
      <Card className="panel">
        <CardContent className="divide-y divide-border p-0">
          {rows.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">
              Aucun blocage détecté sur l'ensemble des dossiers.
            </p>
          )}
          {rows.map(({ d, a }) => (
            <div key={d.id} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <Link
                  to="/dossiers/$id"
                  params={{ id: d.id }}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 hover:underline"
                >
                  <span className="ref text-muted-foreground">{d.id}</span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {d.client.nom}
                  </span>
                </Link>
                <RecuLink id={d.id} />
              </div>
              <ul className="mt-1.5 space-y-1">
                {a.map((msg, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--stop)]">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.5} />
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ActiviteSection({ activity }: { activity: Activity }) {
  return (
    <div>
      <SectionTitle title="Activité" hint="Journal complet : qui a fait quoi, sur quel dossier." />
      <Card className="panel">
        <CardContent className="divide-y divide-border p-0">
          {activity.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">Aucune activité enregistrée.</p>
          )}
          {activity.map((a) => (
            <ActivityRow key={a.id} a={a} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------- Pieces -------------------------------- */

function ActivityRow({ a }: { a: Activity[number] }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <div>
        <span className="font-medium text-foreground">{a.userNom ?? "Inconnu"}</span>
        <span className="ml-2 text-muted-foreground">{a.detail}</span>
      </div>
      <div className="flex items-center gap-3">
        {a.dossierId && (
          <Link
            to="/dossiers/$id"
            params={{ id: a.dossierId }}
            className="text-primary hover:underline"
          >
            {a.dossierId}
          </Link>
        )}
        <span className="ref text-muted-foreground">
          {new Date(a.createdAt).toLocaleString("fr-FR")}
        </span>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string | undefined;
  tone?: "ok" | "warn" | "stop" | undefined;
}) {
  const color =
    tone === "ok"
      ? "text-[var(--ok)]"
      : tone === "warn"
        ? "text-[var(--warn)]"
        : tone === "stop"
          ? "text-[var(--stop)]"
          : "text-foreground";
  return (
    <div className="bg-background p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className={`num-display mt-1 text-xl ${color}`}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function SuiviListe({
  titre,
  vide,
  rows,
}: {
  titre: string;
  vide: string;
  rows: { id: string; nom: string; etape: number; montant: number }[];
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        {titre} ({rows.length})
      </div>
      <div className="divide-y divide-border rounded-xl border border-border">
        {rows.length === 0 && <p className="p-4 text-sm text-muted-foreground">{vide}</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <Link
              to="/dossiers/$id"
              params={{ id: r.id }}
              className="min-w-0 flex-1 hover:underline"
            >
              <div className="truncate font-medium text-foreground">{r.nom}</div>
              <div className="ref text-muted-foreground">
                {r.id} · étape {r.etape}
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-3">
              <RecuLink id={r.id} />
              <span className="ref text-foreground">{r.montant.toLocaleString("fr-FR")} MAD</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function money(v?: number) {
  return v === undefined ? "—" : `${v.toLocaleString("fr-FR")} MAD`;
}

/** Ouvre le reçu de paiement du dossier dans un nouvel onglet — vérification côté ops. */
function RecuLink({ id }: { id: string }) {
  return (
    <Link
      to="/dossiers/$id/recu"
      params={{ id }}
      target="_blank"
      rel="noreferrer"
      title="Voir le reçu du client"
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
      onClick={(e) => e.stopPropagation()}
    >
      <Receipt className="h-3.5 w-3.5" strokeWidth={1.5} /> Reçu
    </Link>
  );
}
