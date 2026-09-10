import { Link } from "@tanstack/react-router";
import { useCurrentUser, ROLE_LABEL } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Pastille de profil : avatar (initiales), nom et rôle. Cliquer ouvre `/profil`.
 * `tone="rail"` pour le fond sombre du rail, `tone="surface"` pour l'en-tête clair.
 */
export function ProfileChip({
  onNavigate,
  tone = "surface",
  compact = false,
}: {
  onNavigate?: () => void;
  tone?: "rail" | "surface";
  compact?: boolean;
}) {
  const { user } = useCurrentUser();
  if (!user) return null;

  const initials = user.nom
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Link
      to="/profil"
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
        tone === "rail"
          ? "text-rail-foreground hover:bg-rail-active/50"
          : "text-foreground hover:bg-accent/50",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          tone === "rail"
            ? "bg-rail-active text-rail-foreground"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        {initials || "?"}
      </div>
      {!compact && (
        <div className="min-w-0 text-left">
          <div
            className={cn(
              "truncate text-sm font-medium",
              tone === "rail" ? "text-rail-foreground" : "text-foreground",
            )}
          >
            {user.nom}
          </div>
          <div className={cn("ref", tone === "rail" ? "text-rail-muted" : "text-muted-foreground")}>
            {ROLE_LABEL[user.role]} · Mon profil
          </div>
        </div>
      )}
    </Link>
  );
}
