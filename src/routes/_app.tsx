import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { Rail } from "@/components/layout/Rail";
import { ProfileChip } from "@/components/layout/profile-chip";
import { NotificationBell } from "@/components/layout/notification-bell";
import { currentUser } from "@/backend/functions/auth";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const user = await currentUser();
    if (!user) throw redirect({ to: "/login" });
    return { user };
  },
  component: AppLayout,
});

function AppLayout() {
  const isPipeline = useRouterState({ select: (state) => state.location.pathname === "/pipeline" });
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      <Rail />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="hidden items-center justify-end gap-1 border-b border-border bg-background px-6 py-2 md:flex lg:px-8">
          <NotificationBell />
          <ProfileChip />
        </header>
        <main
          className={
            isPipeline
              ? "flex min-h-0 flex-1 overflow-hidden px-3 py-3 sm:px-4 md:px-6 md:py-4"
              : "flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8"
          }
        >
          <div
            className={
              isPipeline ? "mx-auto flex min-h-0 w-full flex-1 flex-col" : "mx-auto max-w-6xl"
            }
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
