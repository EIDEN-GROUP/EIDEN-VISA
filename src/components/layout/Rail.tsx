import { useState } from "react";
import { Link, useRouterState, useRouter } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ProfileChip } from "@/components/layout/profile-chip";
import { NotificationBell } from "@/components/layout/notification-bell";
import {
  LayoutDashboard,
  FolderOpen,
  ListTree,
  Wallet,
  BookOpen,
  LogOut,
  Menu,
} from "lucide-react";
import { logout } from "@/backend/functions/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import sealEiden from "@/assets/decorations/logo-eiden.png";

const NAV = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/dossiers", label: "Dossiers", icon: FolderOpen },
  { to: "/qualification", label: "Qualification", icon: ListTree },
  { to: "/paiements", label: "Paiements", icon: Wallet },
  { to: "/referentiel", label: "Référentiel", icon: BookOpen },
] as const;

function RailBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.navigate({ to: "/login" });
  }

  return (
    <div className="flex h-full flex-col text-rail-foreground">
      <div className="flex items-center gap-3 px-6 py-7">
        <img src={sealEiden} alt="" className="h-9 w-9 rounded-full bg-white p-0.5" />
        <div>
          <div className="font-display text-base leading-tight font-semibold tracking-tight">
            Eiden Visa
          </div>
          <div className="ref mt-0.5 text-rail-muted">Back-office</div>
        </div>
      </div>

      {/* La pastille de profil n'est plus dans le rail : barre supérieure sur mobile,
          en-tête à droite sur desktop (voir _app.tsx). */}

      <nav className="flex-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
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
        <Link
          to="/confidentialite"
          onClick={onNavigate}
          className="ref mt-1 block text-rail-muted hover:text-rail-foreground"
        >
          Confidentialité
        </Link>
      </div>
    </div>
  );
}

export function Rail() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Barre supérieure mobile */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-rail px-3 py-2 text-rail-foreground md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="flex items-center gap-2 rounded-md p-1.5 text-rail-foreground hover:bg-rail-active/50"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
            <img src={sealEiden} alt="" className="h-6 w-6 rounded-full bg-white p-0.5" />
            <span className="font-display text-sm font-semibold">Eiden Visa</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 border-0 bg-rail p-0 [&>button]:z-10 [&>button]:bg-rail-active/70 [&>button]:p-1.5 [&>button]:text-rail-foreground [&>button]:opacity-90 [&>button]:hover:opacity-100"
          >
            <RailBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-1">
          <NotificationBell tone="rail" />
          <ProfileChip tone="rail" compact />
        </div>
      </div>

      {/* Rail fixe desktop */}
      <aside className="hidden w-56 shrink-0 bg-rail md:block">
        <RailBody />
      </aside>
    </>
  );
}
