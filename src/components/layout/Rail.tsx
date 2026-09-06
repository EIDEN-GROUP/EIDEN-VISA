import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useCurrentUser, ROLE_LABEL } from "@/lib/store";
import {
  LayoutDashboard,
  FolderOpen,
  ListTree,
  CalendarClock,
  Wallet,
  BookOpen,
  LogOut,
} from "lucide-react";
import { logout } from "@/backend/functions/auth";
import sealEiden from "@/assets/decorations/stamp-eiden.png";

const NAV = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dossiers", label: "Dossiers", icon: FolderOpen },
  { to: "/qualification", label: "Qualification", icon: ListTree },
  { to: "/rendez-vous", label: "Rendez-vous", icon: CalendarClock },
  { to: "/paiements", label: "Paiements", icon: Wallet },
  { to: "/referentiel", label: "Référentiel", icon: BookOpen },
] as const;

export function Rail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  const { user } = useCurrentUser();

  async function onLogout() {
    await logout();
    router.navigate({ to: "/login" });
  }

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col bg-rail text-rail-foreground">
      <div className="flex items-center gap-3 px-6 py-7">
        <img src={sealEiden} alt="" className="h-9 w-9" />
        <div>
          <div className="font-display text-base leading-tight font-semibold tracking-tight">Eiden Visa</div>
          <div className="ref mt-0.5 text-rail-muted">Back-office</div>
        </div>
      </div>

      {user && (
        <div className="px-6 pb-3">
          <div className="text-sm font-medium text-rail-foreground">{user.nom}</div>
          <div className="ref text-rail-muted">{ROLE_LABEL[user.role]}</div>
        </div>
      )}

      <nav className="flex-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm",
                active
                  ? "border-primary font-medium text-rail-foreground"
                  : "border-transparent text-rail-muted hover:text-rail-foreground",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-6">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-rail-muted hover:text-rail-foreground"
        >
          <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
          Déconnexion
        </button>
        <div className="ref mt-3 text-rail-muted">Agadir · Maroc</div>
        <Link to="/confidentialite" className="ref mt-1 block text-rail-muted hover:text-rail-foreground">
          Confidentialité
        </Link>
      </div>
    </aside>
  );
}
