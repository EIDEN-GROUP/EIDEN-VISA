import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TREE, getFixedCase, buildCourtSejour, type Profile, type CaseResult } from "@/lib/visa-rules";
import { piecesFromCase, PACKS, CENTRES, type Dossier, type Centre } from "@/lib/dossier-model";
import { useDossiers } from "@/lib/store";
import { NiveauBadge } from "@/components/dossier/badges";
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
import { ArrowLeft, RotateCcw } from "lucide-react";
import stampApproved from "@/assets/decorations/stamp-visa-approved.png";
import stampName from "@/assets/decorations/stamp-name.png";
import stampFamily from "@/assets/decorations/stamp-family.png";
import stampChild from "@/assets/decorations/stamp-child.png";

export const Route = createFileRoute("/_app/qualification")({
  component: Qualification,
});

type Step = { nodeKey: string; label: string };

const FAMILY_BASES: Profile["base"][] = ["visite_generale", "visite_enfant_parent", "famille_ue"];
const FAMILY_CASE_KEYS = ["t3", "t4", "t5"];

function familyRelated(caseKey: string, profile: Profile) {
  return FAMILY_CASE_KEYS.includes(caseKey) || FAMILY_BASES.includes(profile.base);
}

function Qualification() {
  const navigate = useNavigate();
  const { ajouter } = useDossiers();

  const [nodeKey, setNodeKey] = useState("start");
  const [profile, setProfile] = useState<Profile>({});
  const [history, setHistory] = useState<Step[]>([]);
  const [result, setResult] = useState<{ caseKey: string; c: CaseResult } | null>(null);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [ville, setVille] = useState("");
  const [naissance, setNaissance] = useState("");
  const [centre, setCentre] = useState<Centre>(CENTRES[0]);

  const node = TREE[nodeKey]!;

  function choose(opt: (typeof node.opts)[number]) {
    const nextProfile = { ...profile, ...(opt.set ?? {}) };
    setProfile(nextProfile);
    setHistory((h) => [...h, { nodeKey, label: opt.l }]);

    if (opt.r) {
      const caseKey = opt.n === "DYNAMIC" ? "DYNAMIC" : opt.n;
      const c = caseKey === "DYNAMIC" ? buildCourtSejour(nextProfile) : (getFixedCase(caseKey) ?? buildCourtSejour(nextProfile));
      setResult({ caseKey, c });
      return;
    }
    setNodeKey(opt.n);
  }

  function reset() {
    setNodeKey("start");
    setProfile({});
    setHistory([]);
    setResult(null);
    setCentre(CENTRES[0]);
  }

  function retour() {
    if (history.length === 0) return;
    const prev = history[history.length - 1]!;
    setHistory((h) => h.slice(0, -1));
    setNodeKey(prev.nodeKey);
    setResult(null);
  }

  async function creerDossier() {
    if (!result || !nom) return;
    const pieces = piecesFromCase(result.c);
    const id = `EV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const dossier: Dossier = {
      id,
      client: { nom, telephone, ville, naissance },
      agent: "Accueil",
      ouvertLe: new Date().toLocaleDateString("fr-FR"),
      caseKey: result.caseKey,
      profile,
      titre: result.c.title,
      categorie: result.c.cat,
      niveau: result.c.level,
      pack: "base",
      etape: 1,
      rdv: { centre, date: null, heure: null, statut: "recherche" },
      pieces,
      // Le solde du pack choisi (base par défaut) devient tout de suite un paiement
      // dû, sinon le dossier n'existe nulle part sur l'écran Paiements.
      paiements: [{ libelle: PACKS.base.label, montant: PACKS.base.prix, date: null, encaisse: false }],
      notes: result.c.notes,
      decision: "en_attente",
      decisionDate: null,
    };
    await ajouter(dossier);
    navigate({ to: "/dossiers/$id", params: { id } });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Assistant de qualification</h1>
          <p className="mt-1 text-sm text-muted-foreground">Boussole de qualification Eiden Visa, pas à pas.</p>
        </div>
        {(history.length > 0 || result) && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Recommencer
          </Button>
        )}
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <span className="text-sm text-muted-foreground">{TREE[h.nodeKey]!.q}</span>
              <span className="ml-4 shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {h.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {!result && (
        <Card className="panel">
          <CardHeader>
            <CardTitle className="text-lg">{node.q}</CardTitle>
            {node.help && <p className="pt-1 text-sm text-muted-foreground">{node.help}</p>}
          </CardHeader>
          <CardContent className="space-y-2">
            {node.opts.map((opt, i) => (
              <button
                key={i}
                onClick={() => choose(opt)}
                className="block w-full rounded-xl border border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-accent"
              >
                {opt.l}
              </button>
            ))}
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={retour} className="mt-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Question précédente
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card className="panel">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {result.c.level === "standard" && <img src={stampApproved} alt="" className="h-10 w-10" />}
                  <CardTitle className="text-lg">{result.c.title}</CardTitle>
                </div>
                <NiveauBadge level={result.c.level} />
              </div>
              <p className="text-sm text-muted-foreground">{result.c.cat}</p>
              {(profile.minor || familyRelated(result.caseKey, profile)) && (
                <div className="flex items-center gap-4 pt-1">
                  {familyRelated(result.caseKey, profile) && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <img src={stampFamily} alt="" className="h-6 w-6" /> Dossier familial
                    </span>
                  )}
                  {profile.minor && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <img src={stampChild} alt="" className="h-6 w-6" /> Mineur dans le dossier
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {result.c.docs.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pièces officielles France-Visas ({result.c.docs.length})
                  </div>
                  <ul className="space-y-1.5">
                    {result.c.docs.map((doc, i) => (
                      <li key={i} className="text-sm text-foreground">
                        · {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.c.extra.length > 0 && (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommandations Eiden
                  </div>
                  <ul className="space-y-1.5">
                    {result.c.extra.map((doc, i) => (
                      <li key={i} className="text-sm text-muted-foreground">
                        · {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.c.notes.length > 0 && (
                <div className="border-l-2 border-[var(--info)] pl-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--info)]">
                    Points de vigilance
                  </div>
                  <ul className="space-y-1">
                    {result.c.notes.map((n, i) => (
                      <li key={i} className="text-xs text-foreground/80">
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.c.docs.length === 0 && result.c.extra.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Ce cas ne fait pas l'objet d'une checklist Eiden Visa — voir les points de vigilance ci-dessus pour
                  l'orientation à donner au client.
                </p>
              )}
            </CardContent>
          </Card>

          {result.c.docs.length > 0 && (
            <Card className="panel">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <img src={stampName} alt="" className="h-9 w-9" />
                <CardTitle className="text-base">Créer le dossier</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Nom du client</label>
                  <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom complet" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Téléphone</label>
                  <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="06 00 00 00 00" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Ville</label>
                  <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Agadir" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Date de naissance</label>
                  <Input value={naissance} onChange={(e) => setNaissance(e.target.value)} placeholder="JJ/MM/AAAA" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Centre de dépôt</label>
                  <Select value={centre} onValueChange={(v) => setCentre(v as Centre)}>
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
                <div className="col-span-2 pt-2">
                  <Button className="w-full" disabled={!nom} onClick={creerDossier}>
                    Créer le dossier
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Button variant="ghost" size="sm" onClick={retour}>
            <ArrowLeft className="h-3.5 w-3.5" /> Revenir sur la dernière question
          </Button>
        </div>
      )}
    </div>
  );
}
