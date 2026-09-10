import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDossiersPage, useCurrentUser, type DateRange } from "@/lib/store";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { completion } from "@/lib/dossier-model";
import { NiveauBadge, DecisionBadge } from "@/components/dossier/badges";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import stampDossier from "@/assets/decorations/stamp-dossier.png";
import { DossiersKanban } from "@/components/dossier/kanban";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dossiers/")({
  component: DossiersList,
});

const PAGE_SIZE = 50;

function DossiersList() {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [niveau, setNiveau] = useState<"tous" | "standard" | "attention" | "complexe">("tous");
  const [vue, setVue] = useState<"liste" | "kanban">("liste");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<DateRange>({});
  const [mine, setMine] = useState(false);
  const { user } = useCurrentUser();

  // Recherche débattue côté serveur : chaque frappe ne doit pas lancer une requête —
  // à l'échelle réelle (potentiellement des millions de lignes) une requête par lettre serait intenable.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => setPage(1), [debouncedQ, niveau, range, mine]);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: debouncedQ || undefined, niveau, range, mine }),
    [page, debouncedQ, niveau, range, mine],
  );
  const { dossiers, total, isLoading, setEtape } = useDossiersPage(params);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <img src={stampDossier} alt="" className="h-12 w-12" />
          <div>
            <h1 className="page-title">Dossiers</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {total} dossier(s) au total
              {vue === "liste" && total > 0 && ` · page ${page}/${totalPages}`}
            </p>
          </div>
        </div>
        <Link
          to="/qualification"
          className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Nouveau dossier
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom, téléphone, ville ou référence"
            className="pl-9"
          />
        </div>
        <Select value={niveau} onValueChange={(v) => setNiveau(v as typeof niveau)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les niveaux</SelectItem>
            <SelectItem value="standard">Dossier standard</SelectItem>
            <SelectItem value="attention">Vigilance</SelectItem>
            <SelectItem value="complexe">Cas complexe</SelectItem>
          </SelectContent>
        </Select>
        <DateRangeFilter value={range} onChange={setRange} />
        {user && (
          <div className="flex items-center gap-1 rounded-full border border-border p-1">
            <button
              onClick={() => setMine(false)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium",
                !mine
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Tous les dossiers
            </button>
            <button
              onClick={() => setMine(true)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium",
                mine
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Mes dossiers
            </button>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border p-1">
          <button
            onClick={() => setVue("liste")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
              vue === "liste"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="h-3.5 w-3.5" strokeWidth={1.5} /> Liste
          </button>
          <button
            onClick={() => setVue("kanban")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
              vue === "kanban"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} /> Kanban
          </button>
        </div>
      </div>

      {vue === "kanban" && (
        <p className="text-xs text-muted-foreground">
          Le kanban affiche la page courante ({dossiers.length} dossier(s)) — affinez la recherche
          pour retrouver un dossier précis dans un grand volume.
        </p>
      )}

      {vue === "kanban" ? (
        <DossiersKanban dossiers={dossiers} onMove={(id, etape) => setEtape(id, etape)} />
      ) : (
        <div className="panel overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="ref px-5">Référence</TableHead>
                <TableHead className="ref">Client</TableHead>
                <TableHead className="ref">Dossier</TableHead>
                <TableHead className="ref">Étape</TableHead>
                <TableHead className="ref">Pièces</TableHead>
                <TableHead className="ref">Pays</TableHead>
                <TableHead className="ref">Upload</TableHead>
                <TableHead className="ref px-5">Niveau</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dossiers.map((d) => {
                const c = completion(d);
                return (
                  <TableRow key={d.id} className="cursor-pointer">
                    <TableCell className="p-0">
                      <Link to="/dossiers/$id" params={{ id: d.id }} className="block px-5 py-3">
                        <span className="ref text-muted-foreground">{d.id}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to="/dossiers/$id" params={{ id: d.id }} className="block">
                        <div className="text-sm font-medium text-foreground">{d.client.nom}</div>
                        <div className="text-xs text-muted-foreground">
                          {d.client.ville} · {d.client.telephone}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-64 text-sm text-muted-foreground">
                      {d.titre}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {d.etape === 7 ? (
                        <DecisionBadge decision={d.decision} />
                      ) : (
                        `Étape ${d.etape}/7`
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.ok}/{c.total}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {d.centre.includes("BLS") ? "Espagne" : "France"}
                    </TableCell>
                    <TableCell>
                      {d.uploadAutorise ? (
                        <span className="ref text-[var(--ok)]">Autorisé</span>
                      ) : (
                        <span className="ref text-[var(--warn)]">Bloqué</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5">
                      <NiveauBadge level={d.niveau} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {dossiers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {isLoading ? "Chargement…" : "Aucun dossier ne correspond à cette recherche."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-xs text-muted-foreground">
                Page {page} sur {totalPages} · {total} dossier(s)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
