import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useActingUser, useOpsUsers, useActivity, useDossiers, ROLE_LABEL, type Role } from "@/lib/store";
import { alertes } from "@/lib/dossier-model";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Plus, ShieldCheck, Trash2 } from "lucide-react";

const ROLES: { value: Role; label: string }[] = (Object.keys(ROLE_LABEL) as Role[]).map((value) => ({
  value,
  label: ROLE_LABEL[value],
}));

export const Route = createFileRoute("/_app/ops")({
  component: Ops,
});

function Ops() {
  const { actingUser } = useActingUser();
  const { users, creer, changerRole, supprimer } = useOpsUsers();
  const { activity } = useActivity();
  const { dossiers } = useDossiers();

  const [createOpen, setCreateOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("reception");

  const alertesActives = dossiers.map((d) => ({ d, a: alertes(d) })).filter((x) => x.a.length > 0);

  if (actingUser?.role !== "ceo") {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Accès réservé au CEO — choisissez ce compte dans "Connecté en tant que" pour ouvrir /ops.
        </p>
      </div>
    );
  }

  async function onCreate() {
    await creer({ nom, email, password, role });
    setCreateOpen(false);
    setNom("");
    setEmail("");
    setPassword("");
    setRole("reception");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <ShieldCheck className="h-10 w-10 text-primary" strokeWidth={1.5} />
        <div>
          <h1 className="page-title">Ops</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comptes, rôles et activité de l'équipe — réservé au CEO.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="panel lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Utilisateurs ({users.length})</CardTitle>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Créer un compte
            </Button>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium text-foreground">{u.nom}</div>
                  <div className="ref text-muted-foreground">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={u.role} onValueChange={(v) => changerRole(u.id, v as Role)}>
                    <SelectTrigger className="h-8 w-40 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => supprimer(u.id)}
                    className="text-muted-foreground hover:text-[var(--stop)]"
                    aria-label="Supprimer le compte"
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
            <CardTitle className="text-base">Alertes actives ({alertesActives.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border p-0">
            {alertesActives.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">Aucun blocage détecté sur l'ensemble des dossiers.</p>
            )}
            {alertesActives.map(({ d, a }) => (
              <Link key={d.id} to="/dossiers/$id" params={{ id: d.id }} className="block px-5 py-3.5 hover:bg-accent/40">
                <div className="flex items-center justify-between">
                  <span className="ref text-muted-foreground">{d.id}</span>
                  <span className="text-sm font-medium text-foreground">{d.client.nom}</span>
                </div>
                <ul className="mt-1.5 space-y-1">
                  {a.map((msg, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-[var(--stop)]">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.5} />
                      {msg}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-base">Activité récente</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {activity.length === 0 && <p className="p-5 text-sm text-muted-foreground">Aucune activité enregistrée.</p>}
          {activity.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <span className="font-medium text-foreground">{a.userNom ?? "Inconnu"}</span>
                <span className="ml-2 text-muted-foreground">{a.detail}</span>
              </div>
              <div className="flex items-center gap-3">
                {a.dossierId && (
                  <Link to="/dossiers/$id" params={{ id: a.dossierId }} className="text-primary hover:underline">
                    {a.dossierId}
                  </Link>
                )}
                <span className="ref text-muted-foreground">
                  {new Date(a.createdAt).toLocaleString("fr-FR")}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un compte</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Nom</label>
              <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom complet" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@eidenvisa.ma" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Mot de passe</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères min." />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Rôle</label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={!nom.trim() || !email.trim() || password.length < 6} onClick={onCreate}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
