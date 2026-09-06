import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Rail } from "@/components/layout/Rail";

// Auth guard temporairement désactivé (login en cours de mise au point) :
// voir src/backend/functions/auth.ts et src/routes/login.tsx pour la réactiver.
export const Route = createFileRoute("/_app")({
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
