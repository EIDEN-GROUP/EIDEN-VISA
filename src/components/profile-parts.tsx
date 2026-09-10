import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FileText } from "lucide-react";

export function Avatar({
  nom,
  photo,
  size = 20,
}: {
  nom: string;
  photo?: string | null;
  size?: number;
}) {
  const cls = size >= 20 ? "h-20 w-20 text-xl" : "h-14 w-14 text-base";
  if (photo) {
    return (
      <img
        src={photo}
        alt={nom}
        className={`${cls} rounded-full border border-border object-cover`}
      />
    );
  }
  const initials = nom
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div
      className={`${cls} flex items-center justify-center rounded-full border border-border bg-secondary font-semibold text-secondary-foreground`}
    >
      {initials || "?"}
    </div>
  );
}

export function ProfileKpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string | undefined;
}) {
  return (
    <div className="bg-background p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="num-display mt-1 text-lg text-foreground">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function ProfileListCard({
  title,
  empty,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  empty: string;
  icon?: typeof FileText;
  className?: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const isEmpty = items.filter(Boolean).length === 0;
  return (
    <Card className={`panel ${className ?? ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-1.5 text-sm">
          {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-80 divide-y divide-border overflow-y-auto p-0">
        {isEmpty ? <p className="p-4 text-sm text-muted-foreground">{empty}</p> : children}
      </CardContent>
    </Card>
  );
}
