import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Rail } from "@/components/layout/Rail";
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
    <div className="flex h-screen overflow-hidden bg-background">
      <Rail />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
