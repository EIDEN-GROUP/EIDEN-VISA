import { useState } from "react";
import type { Dossier } from "@/lib/dossier-model";
import { useAssignableUsers, useDossier, useCurrentUser, ROLE_LABEL, type Role } from "@/lib/store";
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
import { UserPlus, X } from "lucide-react";

export function AssignationCard({ dossier }: { dossier: Dossier }) {
  const { users } = useAssignableUsers();
  const { assigner, desassigner } = useDossier(dossier.id);
  const { user: me } = useCurrentUser();

  const [choice, setChoice] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const current = users.find((u) => u.id === dossier.assigneeUserId);

  async function onAssign() {
    if (!choice) return;
    setBusy(true);
    try {
      await assigner(dossier.id, choice, note.trim() || undefined);
      setChoice("");
      setNote("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="panel">
      <CardHeader>
        <CardTitle className="text-base">Assignation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Confié à</span>
          {dossier.assigneeUserId ? (
            <span className="font-medium text-foreground">
              {current
                ? `${current.nom} · ${ROLE_LABEL[current.role as Role] ?? current.role}`
                : "Utilisateur"}
              {dossier.assigneeUserId === me?.id && " (vous)"}
            </span>
          ) : (
            <span className="text-muted-foreground">Non assigné</span>
          )}
        </div>

        {dossier.assigneeUserId && (
          <button
            onClick={() => desassigner(dossier.id)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--stop)]"
          >
            <X className="h-3 w-3" /> Retirer l'assignation
          </button>
        )}

        <div className="space-y-2 border-t border-border pt-3">
          <Select value={choice} onValueChange={setChoice}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un membre de l'équipe" />
            </SelectTrigger>
            <SelectContent>
              {users
                .filter((u) => u.id !== dossier.assigneeUserId)
                .map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nom} · {ROLE_LABEL[u.role as Role] ?? u.role}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (facultatif) — visible dans la notification"
            maxLength={280}
          />
          <Button size="sm" className="w-full" disabled={!choice || busy} onClick={onAssign}>
            <UserPlus className="h-3.5 w-3.5" />{" "}
            {dossier.assigneeUserId ? "Réassigner" : "Assigner"}
          </Button>
          <p className="text-xs text-muted-foreground">
            La personne reçoit une notification, sauf si vous vous l'assignez à vous-même.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
