import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { login, currentUser } from "@/backend/functions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import sealEiden from "@/assets/decorations/stamp-eiden.png";
import stickers from "@/assets/eiden-visa-dossier-stickers.png";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const user = await currentUser();
    if (user) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ data: { email, password } });
      navigate({ to: "/" });
    } catch {
      setError("Identifiants incorrects.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Panneau de marque — masqué sur mobile, seul le formulaire compte à l'étroit. */}
      <div className="relative hidden w-[44%] shrink-0 flex-col justify-between bg-rail px-12 py-12 text-rail-foreground lg:flex">
        <div className="flex items-center gap-3">
          <img src={sealEiden} alt="" className="h-9 w-9" />
          <span className="font-display text-base font-semibold tracking-tight">Eiden Visa</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <img src={stickers} alt="" className="w-full max-w-sm" />
        </div>
        <p className="max-w-sm font-display text-2xl font-medium leading-snug">
          Un dossier ne devrait jamais être la raison d'un refus.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden">
            <img src={sealEiden} alt="" className="mb-4 h-12 w-12" />
          </div>
          <div>
            <h1 className="page-title">Eiden Visa</h1>
            <p className="mt-1 text-sm text-muted-foreground">Back-office — connexion.</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Mot de passe</label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          {error && <p className="text-sm text-[var(--stop)]">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Connexion…" : "Se connecter"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <a href="/confidentialite" className="hover:text-foreground hover:underline">
              Conditions d'utilisation & confidentialité
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
