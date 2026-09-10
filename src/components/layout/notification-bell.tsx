import { useNavigate } from "@tanstack/react-router";
import { useNotifications } from "@/lib/store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Check, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

function relative(iso: string | Date) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  if (j < 7) return `il y a ${j} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function NotificationBell({ tone = "surface" }: { tone?: "rail" | "surface" }) {
  const { items, unread, marquerLu } = useNotifications();
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "relative rounded-lg p-2 transition-colors",
          tone === "rail"
            ? "text-rail-foreground hover:bg-rail-active/50"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
        aria-label={`Notifications${unread ? ` (${unread} non lues)` : ""}`}
      >
        <Bell className="h-5 w-5" strokeWidth={1.5} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--stop)] px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-medium text-foreground">Notifications</span>
          {unread > 0 && (
            <button
              onClick={() => marquerLu()}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Check className="h-3 w-3" /> Tout marquer comme lu
            </button>
          )}
        </div>
        <div className="max-h-96 divide-y divide-border overflow-y-auto">
          {items.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Aucune notification.</p>
          )}
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (!n.read) marquerLu([n.id]);
                if (n.dossierId) navigate({ to: "/dossiers/$id", params: { id: n.dossierId } });
              }}
              className={cn(
                "flex w-full gap-2.5 px-3 py-2.5 text-left hover:bg-accent/40",
                !n.read && "bg-accent/30",
              )}
            >
              <FolderOpen
                className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  n.read ? "text-muted-foreground" : "text-primary",
                )}
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <p className="text-sm text-foreground">{n.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {n.acteurNom ? `${n.acteurNom} · ` : ""}
                  {relative(n.createdAt)}
                </p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
