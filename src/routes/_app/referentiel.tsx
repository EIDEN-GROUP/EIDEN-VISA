import { createFileRoute } from "@tanstack/react-router";
import { ETAPES, PACKS, FRAIS, type PackKey } from "@/lib/dossier-model";
import { SCOPE, FIXED_KEYS, getFixedCase } from "@/lib/visa-rules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NiveauBadge } from "@/components/dossier/badges";
import stampPassport from "@/assets/decorations/stamp-passport.png";
import stampBoardingPass from "@/assets/decorations/stamp-boarding-pass.png";
import stampSuitcase from "@/assets/decorations/stamp-date.png";

const PACK_ICON: Record<PackKey, string> = {
  base: stampPassport,
  voyage: stampBoardingPass,
  global: stampSuitcase,
};

export const Route = createFileRoute("/_app/referentiel")({
  component: Referentiel,
});

function Referentiel() {
  const cas = FIXED_KEYS.map((k) => getFixedCase(k)!).filter((c) => c.docs.length > 0 || c.notes.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Référentiel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Source unique de vérité : règles métier, parcours et tarification Eiden Visa.
        </p>
      </div>

      <Tabs defaultValue="perimetre">
        <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
          <TabsTrigger value="perimetre" className="rounded-full border border-border data-[state=active]:border-primary">
            Périmètre
          </TabsTrigger>
          <TabsTrigger value="parcours" className="rounded-full border border-border data-[state=active]:border-primary">
            Parcours en 7 étapes
          </TabsTrigger>
          <TabsTrigger value="packs" className="rounded-full border border-border data-[state=active]:border-primary">
            Paliers de pack & frais
          </TabsTrigger>
          <TabsTrigger value="cas" className="rounded-full border border-border data-[state=active]:border-primary">
            Cas types ({cas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perimetre" className="mt-4">
          <Card className="panel">
            <CardHeader>
              <CardTitle className="text-base">Périmètre du service</CardTitle>
              <CardDescription>Ce que le service prend en charge au lancement, et ce qui est orienté ailleurs.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SCOPE.in.map((s) => (
                <div key={s} className="rounded-xl border border-border p-4">
                  <span className="dot bg-[var(--ok)]" />
                  <div className="mt-2 ref text-[var(--ok)]">Pris en charge</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{s}</div>
                </div>
              ))}
              {SCOPE.out.map((s) => (
                <div key={s} className="rounded-xl border border-border p-4">
                  <span className="dot bg-[var(--stop)]" />
                  <div className="mt-2 ref text-[var(--stop)]">Hors périmètre</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{s}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parcours" className="mt-4">
          <Card className="panel">
            <CardHeader>
              <CardTitle className="text-base">Parcours en 7 étapes</CardTitle>
              <CardDescription>Ce qui se passe à chaque étape, qui s'en occupe, et ce qui est encaissé.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ETAPES.map((e) => (
                  <div key={e.n} className="rounded-xl border border-border p-4">
                    <div className="ref text-muted-foreground">Étape {e.n} · {e.role}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{e.label}</div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{e.detail}</p>
                    <p className="ref mt-2 text-foreground">{e.encaissement}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packs" className="mt-4">
          <Card className="panel">
            <CardHeader>
              <CardTitle className="text-base">Paliers de pack & frais</CardTitle>
              <CardDescription>Les trois formules vendues au client, et les frais fixes qui s'y ajoutent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(PACKS) as PackKey[]).map((k) => (
                  <div key={k} className="rounded-xl border border-border p-4">
                    <img src={PACK_ICON[k]} alt="" className="mb-2 h-9 w-9" />
                    <div className="text-sm font-semibold text-foreground">{PACKS[k].label}</div>
                    <div className="ref mt-1 text-primary">{PACKS[k].prix} MAD</div>
                    <div className="ref text-muted-foreground">
                      Marge nette {PACKS[k].margeNette !== null ? `${PACKS[k].margeNette} MAD` : "à confirmer (courtier assurance)"}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{PACKS[k].contenu}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Rendez-vous TLScontact", value: `${FRAIS.rdvTls} MAD` },
                  { label: "Rendez-vous BLS Espagne", value: `${FRAIS.rdvBls} MAD` },
                  { label: "Droit de visa adulte", value: FRAIS.droitVisaAdulte },
                  { label: "Droit de visa mineur", value: FRAIS.droitVisaMineur },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl border border-border p-4">
                    <div className="ref text-muted-foreground">{f.label}</div>
                    <div className="mt-1 text-sm font-semibold text-foreground">{f.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cas" className="mt-4">
          <Card className="panel">
            <CardHeader>
              <CardTitle className="text-base">Cas types ({cas.length})</CardTitle>
              <CardDescription>Dossiers déjà qualifiés, avec leur checklist et leur niveau de vigilance.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {cas.map((c) => (
                <div key={c.key} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">{c.title}</div>
                    <NiveauBadge level={c.level} />
                  </div>
                  <div className="ref mt-1 text-muted-foreground">{c.cat}</div>
                  {c.docs.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">{c.docs.length} pièce(s) officielle(s) exigée(s)</p>
                  )}
                  {c.notes.map((n, i) => (
                    <p key={i} className="mt-2 text-xs text-foreground/80">
                      {n}
                    </p>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
