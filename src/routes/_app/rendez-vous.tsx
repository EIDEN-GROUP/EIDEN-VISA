import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDossiersByRdvStatut, useCreneaux, type Creneau, type DateRange } from "@/lib/store";
import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { CENTRES } from "@/lib/dossier-model";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RdvBadge } from "@/components/dossier/badges";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import stampRendezvous from "@/assets/decorations/stamp-rendezvous.png";
import stampTime from "@/assets/decorations/stamp-time.png";

type CreneauForm = { centre: string; date: string; places: string; statut: Creneau["statut"]; dossierId: string | null };
const EMPTY_FORM: CreneauForm = { centre: CENTRES[0], date: "", places: "0", statut: "libre", dossierId: null };

export const Route = createFileRoute("/_app/rendez-vous")({
  component: RendezVous,
});

function RendezVous() {
  const [range, setRange] = useState<DateRange>({});
  // Chaque statut est chargé séparément et borné côté SQL — à l'échelle réelle on ne
  // charge jamais tous les dossiers pour en filtrer un sous-ensemble en JS.
  const { dossiers: enAttente, confirmerRdv } = useDossiersByRdvStatut("recherche", range);
  const { dossiers: confirmes } = useDossiersByRdvStatut("confirme", range);
  const { creneaux, ajouter, modifier, supprimer } = useCreneaux();
  const [target, setTarget] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreneauForm>(EMPTY_FORM);

  const dossiers = [...enAttente, ...confirmes];
  const targetDossier = target ? dossiers.find((d) => d.id === target) : null;

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(c: Creneau) {
    setEditingId(c.id);
    setForm({ centre: c.centre, date: c.date, places: String(c.places), statut: c.statut, dossierId: c.dossierId });
    setFormOpen(true);
  }

  async function saveForm() {
    const payload = {
      centre: form.centre,
      date: form.date.trim(),
      places: Number(form.places) || 0,
      statut: form.statut,
      dossierId: form.dossierId,
    };
    if (editingId) await modifier({ id: editingId, ...payload });
    else await ajouter(payload);
    setFormOpen(false);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={stampRendezvous} alt="" className="h-12 w-12" />
          <div>
            <h1 className="page-title">Rendez-vous</h1>
            <p className="mt-1 text-sm text-muted-foreground">Veille des créneaux et suivi des rendez-vous TLS / BLS.</p>
          </div>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      <Card className="panel">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Veille des créneaux</CardTitle>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Ajouter un créneau
          </Button>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {creneaux.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">
              Aucun créneau suivi pour l'instant — ajoutez-en un dès qu'un agent en repère un chez TLS ou BLS.
            </p>
          )}
          {creneaux.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  {c.centre}
                </div>
                <div className="ref mt-0.5 text-muted-foreground">{c.date}</div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 font-medium",
                    c.statut === "libre"
                      ? "text-[var(--ok)]"
                      : c.statut === "reserve"
                        ? "text-[var(--info)]"
                        : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "dot",
                      c.statut === "libre" ? "bg-[var(--ok)]" : c.statut === "reserve" ? "bg-[var(--info)]" : "bg-muted-foreground",
                    )}
                  />
                  {c.statut === "libre" ? `${c.places} place(s) libre(s)` : c.statut === "reserve" ? "Réservé" : "Fermé"}
                </span>
                {c.dossierId && (
                  <Link to="/dossiers/$id" params={{ id: c.dossierId }} className="text-primary hover:underline">
                    {c.dossierId}
                  </Link>
                )}
                <button onClick={() => openEdit(c)} className="text-muted-foreground hover:text-foreground" aria-label="Modifier">
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => supprimer(c.id)}
                  className="text-muted-foreground hover:text-[var(--stop)]"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-base">Dossiers en attente de créneau ({enAttente.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {enAttente.length === 0 && (
            <p className="p-5 text-sm text-muted-foreground">Tous les dossiers actifs ont un créneau confirmé.</p>
          )}
          {enAttente.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-5 py-3.5">
              <Link to="/dossiers/$id" params={{ id: d.id }} className="hover:underline">
                <div className="text-sm font-medium text-foreground">{d.client.nom}</div>
                <div className="ref text-muted-foreground">
                  {d.id} · {d.rdv.centre}
                </div>
              </Link>
              <div className="flex items-center gap-3">
                <RdvBadge statut={d.rdv.statut} />
                <Button size="sm" onClick={() => setTarget(d.id)}>
                  Confirmer un créneau
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-base">Rendez-vous confirmés ({confirmes.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {confirmes.map((d) => (
            <Link
              key={d.id}
              to="/dossiers/$id"
              params={{ id: d.id }}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/40"
            >
              <div>
                <div className="text-sm font-medium text-foreground">{d.client.nom}</div>
                <div className="ref text-muted-foreground">{d.rdv.centre}</div>
              </div>
              <div className="ref text-foreground">
                {d.rdv.date} · {d.rdv.heure}
              </div>
            </Link>
          ))}
          {confirmes.length === 0 && <p className="p-5 text-sm text-muted-foreground">Aucun rendez-vous confirmé.</p>}
        </CardContent>
      </Card>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent>
          <DialogHeader className="flex-row items-center gap-3 space-y-0">
            <img src={stampTime} alt="" className="h-9 w-9" />
            <DialogTitle>Confirmer le créneau — {targetDossier?.client.nom}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input value={date} onChange={(e) => setDate(e.target.value)} placeholder="JJ/MM/AAAA" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Heure</label>
              <Input value={heure} onChange={(e) => setHeure(e.target.value)} placeholder="HH:MM" />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={!date || !heure}
              onClick={() => {
                if (target) confirmerRdv(target, date, heure);
                setTarget(null);
                setDate("");
                setHeure("");
              }}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier le créneau" : "Ajouter un créneau"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Centre</label>
              <Select value={form.centre} onValueChange={(v) => setForm((f) => ({ ...f, centre: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CENTRES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                placeholder="JJ/MM/AAAA"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Statut</label>
              <Select value={form.statut} onValueChange={(v) => setForm((f) => ({ ...f, statut: v as Creneau["statut"] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="libre">Libre</SelectItem>
                  <SelectItem value="reserve">Réservé</SelectItem>
                  <SelectItem value="ferme">Fermé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.statut === "libre" && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">Places libres</label>
                <Input
                  type="number"
                  min={0}
                  value={form.places}
                  onChange={(e) => setForm((f) => ({ ...f, places: e.target.value }))}
                />
              </div>
            )}
            {form.statut === "reserve" && (
              <div className="col-span-2">
                <label className="text-xs font-medium text-muted-foreground">Dossier lié</label>
                <Select
                  value={form.dossierId ?? "none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, dossierId: v === "none" ? null : v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    {dossiers.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.id} · {d.client.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button disabled={!form.date.trim()} onClick={saveForm}>
              {editingId ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
