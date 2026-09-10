import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Rail } from "@/components/layout/Rail";
import { ProfileChip } from "@/components/layout/profile-chip";
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
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      <Rail />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="hidden items-center justify-end border-b border-border bg-background px-6 py-2.5 md:flex lg:px-8">
          <ProfileChip />
        </header>
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
