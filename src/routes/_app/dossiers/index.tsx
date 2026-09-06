import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDossiers } from "@/lib/store";
import { completion } from "@/lib/dossier-model";
import { NiveauBadge, RdvBadge, DecisionBadge } from "@/components/dossier/badges";
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
import { Search, LayoutGrid, List } from "lucide-react";
import stampDossier from "@/assets/decorations/stamp-dossier.png";
import { DossiersKanban } from "@/components/dossier/kanban";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/dossiers/")({
  component: DossiersList,
});

function DossiersList() {
  const { dossiers, setEtape } = useDossiers();
  const [q, setQ] = useState("");
  const [niveau, setNiveau] = useState<string>("tous");
  const [vue, setVue] = useState<"liste" | "kanban">("liste");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const digits = term.replace(/\D/g, "");
    return dossiers.filter((d) => {
      const matchQ =
        !term ||
        d.client.nom.toLowerCase().includes(term) ||
        d.id.toLowerCase().includes(term) ||
        d.client.ville.toLowerCase().includes(term) ||
        (digits.length > 0 && d.client.telephone.replace(/\D/g, "").includes(digits));
      const matchNiveau = niveau === "tous" || d.niveau === niveau;
      return matchQ && matchNiveau;
    });
  }, [dossiers, q, niveau]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={stampDossier} alt="" className="h-12 w-12" />
          <div>
            <h1 className="page-title">Dossiers</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dossiers.length} dossier(s) au total · {filtered.length} affiché(s)
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
        <div className="relative w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nom, téléphone, ville ou référence"
            className="pl-9"
          />
        </div>
        <Select value={niveau} onValueChange={setNiveau}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tous">Tous les niveaux</SelectItem>
            <SelectItem value="standard">Dossier standard</SelectItem>
            <SelectItem value="attention">Vigilance</SelectItem>
            <SelectItem value="complexe">Cas complexe</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-border p-1">
          <button
            onClick={() => setVue("liste")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
              vue === "liste" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="h-3.5 w-3.5" strokeWidth={1.5} /> Liste
          </button>
          <button
            onClick={() => setVue("kanban")}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
              vue === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} /> Kanban
          </button>
        </div>
      </div>

      {vue === "kanban" ? (
        <DossiersKanban dossiers={filtered} onMove={(id, etape) => setEtape(id, etape)} />
      ) : (
      <div className="panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="ref px-5">Référence</TableHead>
              <TableHead className="ref">Client</TableHead>
              <TableHead className="ref">Dossier</TableHead>
              <TableHead className="ref">Étape</TableHead>
              <TableHead className="ref">Pièces</TableHead>
              <TableHead className="ref">Pays</TableHead>
              <TableHead className="ref">Rendez-vous</TableHead>
              <TableHead className="ref px-5">Niveau</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((d) => {
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
                  <TableCell className="max-w-64 text-sm text-muted-foreground">{d.titre}</TableCell>
                  <TableCell className="text-sm text-foreground">
                    {d.etape === 7 ? <DecisionBadge decision={d.decision} /> : `Étape ${d.etape}/7`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.ok}/{c.total}
                  </TableCell>
                  <TableCell className="text-sm text-foreground">
                    {d.rdv.centre.includes("BLS") ? "Espagne" : "France"}
                  </TableCell>
                  <TableCell>
                    <RdvBadge statut={d.rdv.statut} />
                  </TableCell>
                  <TableCell className="px-5">
                    <NiveauBadge level={d.niveau} />
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                  Aucun dossier ne correspond à cette recherche.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      )}
    </div>
  );
}
