import { useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { login, currentUser } from "@/backend/functions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import sealEiden from "@/assets/decorations/logo-eiden.png";
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
    <div
      className="login-rounded flex min-h-screen items-center justify-center p-4 sm:p-8"
      style={{ background: "var(--login-bg)" }}
    >
      <div
        className="login-card grid w-full max-w-5xl overflow-hidden shadow-xl lg:grid-cols-[1fr_1fr]"
        style={{ background: "var(--login-card)" }}
      >
        {/* Colonne formulaire */}
        <div className="flex flex-col justify-center px-8 py-12 sm:px-14">
          <div className="login-mark mb-10 flex items-center gap-2.5">
            <img src={sealEiden} alt="" className="h-9 w-9 object-contain" />
            <span
              className="login-display text-lg tracking-tight"
              style={{ color: "var(--login-ink)" }}
            >
              Eiden Visa
            </span>
          </div>

          <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
            <div>
              <h1
                className="login-display text-3xl tracking-tight"
                style={{ color: "var(--login-ink)" }}
              >
                Bon retour
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--login-muted)" }}>
                Back-office — connexion.
              </p>
            </div>

            <div className="space-y-3">
              <Input
                type="email"
                placeholder="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                className="h-12 bg-transparent px-5 text-sm"
                style={{ borderColor: "var(--login-border)", color: "var(--login-ink)" }}
              />
              <Input
                type="password"
                placeholder="mot de passe"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-transparent px-5 text-sm"
                style={{ borderColor: "var(--login-border)", color: "var(--login-ink)" }}
              />
            </div>

            {error && <p className="text-sm text-[var(--stop)]">{error}</p>}

            <div className="flex flex-col-reverse items-stretch gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="/confidentialite"
                className="text-xs hover:underline"
                style={{ color: "var(--login-muted)" }}
              >
                Conditions & confidentialité
              </a>
              <Button
                type="submit"
                disabled={pending}
                className="h-11 w-full px-7 hover:opacity-90 sm:w-auto sm:min-w-28"
                style={{ background: "var(--login-dark)", color: "oklch(0.98 0.005 90)" }}
              >
                {pending ? "Connexion…" : "Se connecter"}
              </Button>
            </div>
          </form>
        </div>

        {/* Colonne illustration */}
        <div
          className="login-art relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between"
          style={{ background: "var(--login-rail)" }}
        >
          <p
            className="login-display relative max-w-xs text-xl leading-snug"
            style={{ color: "oklch(0.97 0.008 90)" }}
          >
            Un dossier ne devrait jamais être la raison d'un refus.
          </p>
          <div className="flex flex-1 items-center justify-center">
            <img src={stickers} alt="" className="w-full max-w-sm drop-shadow-xl" />
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}
