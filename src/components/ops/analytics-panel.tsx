import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import { useRef, useState } from "react";
import { useAnalytics, ROLE_LABEL, type Role } from "@/lib/store";
import { ETAPES, PACKS, DECISION_LABEL, MODALITE_LABEL, type PackKey } from "@/lib/dossier-model";
import { LEVEL_LABEL, type Level } from "@/lib/visa-rules";
import { exportElementPdf, exportOpsPdf } from "@/lib/ops-pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

/* Palette : tokens de marque. Catégoriel = ordre fixe, jamais cyclé.
 * Les graphiques d'état réutilisent les couleurs de statut (avec légende, jamais couleur seule). */
const C = {
  primary: "var(--primary)",
  ok: "var(--ok)",
  warn: "var(--warn)",
  stop: "var(--stop)",
  info: "var(--info)",
  rail: "var(--rail)",
  grid: "var(--border)",
  ink: "var(--muted-foreground)",
};
const CAT = [C.info, C.primary, C.ok, C.warn, C.rail];

const NIVEAU_COLOR: Record<Level, string> = {
  standard: C.info,
  attention: C.warn,
  complexe: C.stop,
};
const DECISION_COLOR: Record<string, string> = {
  approuve: C.ok,
  refuse: C.stop,
  en_attente: C.ink,
};

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--popover-foreground)",
} as const;

const axis = { tick: { fill: C.ink, fontSize: 11 }, stroke: C.grid } as const;

function roleLabel(r: string) {
  return r === "non_attribue" ? "Non attribué" : (ROLE_LABEL[r as Role] ?? r);
}

function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function AnalyticsPanel() {
  const { data, isLoading, isError } = useAnalytics();
  const captureRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function onExport() {
    if (!captureRef.current || exporting || !data) return;
    setExporting(true);
    try {
      await exportElementPdf(captureRef.current, {
        title: "Rapport analytique",
        filename: "rapport-analytique-eiden-visa.pdf",
      });
    } catch {
      // La capture pixel a échoué (couleurs modernes non gérées par html2canvas
      // selon le navigateur) : on retombe sur un rapport tabulé propre, mêmes chiffres.
      await exportRapportTable(data);
    } finally {
      setExporting(false);
    }
  }

  if (!data) {
    return (
      <Card className="panel">
        <CardHeader>
          <CardTitle className="text-base">Analytique</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isError
              ? "Impossible de charger les données analytiques. Réessayez dans un instant."
              : isLoading
                ? "Chargement des données…"
                : "Indisponible."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const k = data.kpis;

  const pipeline = data.pipeline.map((row) => {
    const e = ETAPES.find((x) => String(x.n) === row.k);
    return { label: e ? `${e.n}. ${e.label}` : row.k, role: e?.role ?? "—", n: row.n };
  });
  const niveau = data.parNiveau.map((r) => ({
    name: LEVEL_LABEL[r.k as Level] ?? r.k,
    key: r.k,
    value: r.n,
  }));
  const decision = data.parDecision.map((r) => ({
    name: DECISION_LABEL[r.k as keyof typeof DECISION_LABEL] ?? r.k,
    key: r.k,
    value: r.n,
  }));
  const pack = data.parPack.map((r) => ({ name: PACKS[r.k as PackKey]?.label ?? r.k, n: r.n }));
  const centre = data.parCentre.map((r) => ({ name: r.k, n: r.n }));
  const modalite = data.parModalite.map((r, i) => ({
    name: MODALITE_LABEL[r.k as keyof typeof MODALITE_LABEL] ?? r.k,
    value: r.n,
    fill: CAT[i % CAT.length] ?? C.info,
  }));
  const tendance = mergeWeeks(data.ouverturesParSemaine, data.encaissementsParSemaine);
  const parRole = data.parRole.map((r) => ({ ...r, name: roleLabel(r.role) }));
  const activite = data.activiteParAction.map((r) => ({
    name: r.k.replace(/^[a-z]+\./, "").replace(/_/g, " "),
    n: r.n,
  }));

  return (
    <Card className="panel" ref={captureRef}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-base">Analytique</CardTitle>
          <p className="text-xs text-muted-foreground">
            L'état complet de l'agence : où sont les dossiers, ce qui rentre, et qui produit quoi.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onExport} disabled={exporting} data-pdf-hide>
          <Download className="h-3.5 w-3.5" /> {exporting ? "Génération…" : "Rapport (PDF)"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-5">
          <Kpi label="Dossiers" value={k.total} />
          <Kpi label="Actifs" value={k.actifs} />
          <Kpi
            label="Taux d'approbation"
            value={k.tauxApprobation === null ? "—" : `${k.tauxApprobation} %`}
            hint={`${k.approuve} approuvés · ${k.refuse} refusés`}
          />
          <Kpi label="Encaissé" value={`${k.totalEncaisse.toLocaleString("fr-FR")} MAD`} />
          <Kpi label="Ticket moyen" value={`${k.ticketMoyen.toLocaleString("fr-FR")} MAD`} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Pipeline" hint="Dossiers par étape · rôle responsable">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipeline} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke={C.grid} strokeOpacity={0.5} />
                <XAxis type="number" allowDecimals={false} {...axis} />
                <YAxis type="category" dataKey="label" width={150} {...axis} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "var(--muted)" }}
                  formatter={(v: number, _n, p) => [`${v} dossier(s)`, `Rôle : ${p.payload.role}`]}
                />
                <Bar dataKey="n" fill={C.primary} radius={[0, 4, 4, 0]} barSize={16}>
                  <LabelList dataKey="n" position="right" fill={C.ink} fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel
            title="Tendance (10 semaines)"
            hint="Ouvertures de dossiers · encaissements — deux échelles, deux graphes"
          >
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={tendance} margin={{ left: 4, right: 12, top: 4 }} syncId="tendance">
                <CartesianGrid stroke={C.grid} strokeOpacity={0.5} />
                <XAxis dataKey="semaine" tickFormatter={fmtWeek} {...axis} />
                <YAxis allowDecimals={false} width={28} {...axis} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={fmtWeek}
                  formatter={(v: number) => [`${v}`, "Ouvertures"]}
                />
                <Line
                  type="monotone"
                  dataKey="ouvertures"
                  stroke={C.info}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={tendance} margin={{ left: 4, right: 12, top: 4 }} syncId="tendance">
                <CartesianGrid stroke={C.grid} strokeOpacity={0.5} />
                <XAxis dataKey="semaine" tickFormatter={fmtWeek} {...axis} />
                <YAxis width={44} {...axis} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={fmtWeek}
                  formatter={(v: number) => [`${v.toLocaleString("fr-FR")} MAD`, "Encaissé"]}
                />
                <Line
                  type="monotone"
                  dataKey="encaisse"
                  stroke={C.primary}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Niveau de dossier">
            <Donut data={niveau} colorBy={(d) => NIVEAU_COLOR[d.key as Level] ?? C.info} />
          </Panel>

          <Panel title="Décision consulaire" hint="Le vrai résultat, après le dépôt">
            <Donut data={decision} colorBy={(d) => DECISION_COLOR[d.key] ?? C.ink} />
          </Panel>

          <Panel title="Packs">
            <SimpleBar data={pack} />
          </Panel>

          <Panel title="Centre de dépôt">
            <SimpleBar data={centre} />
          </Panel>

          <Panel title="Production par rôle" hint="Dossiers ouverts par les comptes de chaque rôle">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={parRole} margin={{ left: 4, right: 8 }}>
                <CartesianGrid vertical={false} stroke={C.grid} strokeOpacity={0.5} />
                <XAxis dataKey="name" {...axis} />
                <YAxis allowDecimals={false} width={28} {...axis} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar
                  dataKey="dossiers"
                  name="Dossiers"
                  fill={C.rail}
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="actifs"
                  name="Actifs"
                  fill={C.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
            <Legend
              items={[
                { c: C.rail, l: "Dossiers" },
                { c: C.primary, l: "Actifs" },
              ]}
            />
          </Panel>

          <Panel title="Top agents" hint="Par nombre de dossiers ouverts">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.parAgent} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid horizontal={false} stroke={C.grid} strokeOpacity={0.5} />
                <XAxis type="number" allowDecimals={false} {...axis} />
                <YAxis type="category" dataKey="nom" width={110} {...axis} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "var(--muted)" }}
                  formatter={(v: number, _n, p) => [`${v} dossier(s)`, roleLabel(p.payload.role)]}
                />
                <Bar dataKey="dossiers" fill={C.info} radius={[0, 4, 4, 0]} barSize={14}>
                  <LabelList dataKey="dossiers" position="right" fill={C.ink} fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>

          <Panel title="Modalité de paiement">
            <Donut
              data={modalite.map((m) => ({ name: m.name, key: m.name, value: m.value }))}
              colorBy={(_, i) => CAT[i % CAT.length] ?? C.info}
            />
          </Panel>

          <Panel title="Activité (30 jours)" hint="Actions enregistrées, par type">
            <SimpleBar data={activite} />
          </Panel>
        </div>
      </CardContent>
    </Card>
  );
}

function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-background p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="num-display mt-1 text-xl text-foreground">{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Legend({ items }: { items: { c: string; l: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {items.map((it) => (
        <div key={it.l} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.c }} />
          {it.l}
        </div>
      ))}
    </div>
  );
}

type DonutRow = { name: string; key: string; value: number };
function Donut({
  data,
  colorBy,
}: {
  data: DonutRow[];
  colorBy: (d: DonutRow, i: number) => string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {data.map((d, i) => (
              <Cell key={d.key} fill={colorBy(d, i)} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number, n) => [
              `${v} (${total ? Math.round((v / total) * 100) : 0} %)`,
              n,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
        {data.map((d, i) => (
          <div key={d.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colorBy(d, i) }} />
            {d.name} · {d.value}
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleBar({ data }: { data: { name: string; n: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(140, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
        <CartesianGrid horizontal={false} stroke={C.grid} strokeOpacity={0.5} />
        <XAxis type="number" allowDecimals={false} {...axis} />
        <YAxis type="category" dataKey="name" width={130} {...axis} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="n" fill={C.primary} radius={[0, 4, 4, 0]} barSize={16}>
          <LabelList dataKey="n" position="right" fill={C.ink} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function mergeWeeks(
  ouvertures: { k: string; n: number }[],
  encaissements: { k: string; n: number }[],
) {
  const map = new Map<string, { semaine: string; ouvertures: number; encaisse: number }>();
  for (const o of ouvertures) map.set(o.k, { semaine: o.k, ouvertures: o.n, encaisse: 0 });
  for (const e of encaissements) {
    const row = map.get(e.k) ?? { semaine: e.k, ouvertures: 0, encaisse: 0 };
    row.encaisse = e.n;
    map.set(e.k, row);
  }
  return [...map.values()].sort((a, b) => a.semaine.localeCompare(b.semaine));
}

function fmtWeek(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

type AnalyticsData = NonNullable<ReturnType<typeof useAnalytics>["data"]>;

/** Repli tabulé quand la capture pixel échoue — mêmes chiffres, format « rapport ». */
async function exportRapportTable(data: AnalyticsData) {
  const k = data.kpis;
  const total = data.kpis.total || 1;
  const pct = (n: number) => `${Math.round((n / total) * 100)} %`;
  const kv = (rows: { k: string; n: number }[], label: (x: string) => string) =>
    rows.map((r) => [label(r.k), `${r.n}`]);

  await exportOpsPdf({
    title: "Rapport analytique",
    filename: "rapport-analytique-eiden-visa.pdf",
    intro:
      "Instantané de l'activité Eiden Visa : répartition des dossiers, production par rôle et par agent.",
    kpis: [
      { label: "Dossiers", value: `${k.total}` },
      { label: "Actifs", value: `${k.actifs}` },
      {
        label: "Taux d'approbation",
        value: k.tauxApprobation === null ? "—" : `${k.tauxApprobation} %`,
      },
      { label: "Encaissé", value: `${k.totalEncaisse.toLocaleString("fr-FR")} MAD` },
      { label: "Ticket moyen", value: `${k.ticketMoyen.toLocaleString("fr-FR")} MAD` },
      { label: "Décisions", value: `${k.approuve} ok · ${k.refuse} refus` },
    ],
    sections: [
      {
        heading: "Pipeline — dossiers par étape",
        columns: [
          { header: "Étape", w: 5 },
          { header: "Rôle", w: 3 },
          { header: "Dossiers", w: 2, align: "right" },
          { header: "Part", w: 2, align: "right" },
        ],
        rows: data.pipeline.map((r) => {
          const e = ETAPES.find((x) => String(x.n) === r.k);
          return [e ? `${e.n}. ${e.label}` : r.k, e?.role ?? "—", `${r.n}`, pct(r.n)];
        }),
      },
      {
        heading: "Niveau de dossier",
        columns: [
          { header: "Niveau", w: 4 },
          { header: "Dossiers", w: 2, align: "right" },
        ],
        rows: kv(data.parNiveau, (x) => LEVEL_LABEL[x as Level] ?? x),
      },
      {
        heading: "Décision consulaire",
        columns: [
          { header: "Décision", w: 4 },
          { header: "Dossiers", w: 2, align: "right" },
        ],
        rows: kv(data.parDecision, (x) => DECISION_LABEL[x as keyof typeof DECISION_LABEL] ?? x),
      },
      {
        heading: "Packs",
        columns: [
          { header: "Pack", w: 4 },
          { header: "Dossiers", w: 2, align: "right" },
        ],
        rows: kv(data.parPack, (x) => PACKS[x as PackKey]?.label ?? x),
      },
      {
        heading: "Centre de dépôt",
        columns: [
          { header: "Centre", w: 4 },
          { header: "Dossiers", w: 2, align: "right" },
        ],
        rows: kv(data.parCentre, (x) => x),
      },
      {
        heading: "Modalité de paiement",
        columns: [
          { header: "Modalité", w: 4 },
          { header: "Dossiers", w: 2, align: "right" },
        ],
        rows: kv(data.parModalite, (x) => MODALITE_LABEL[x as keyof typeof MODALITE_LABEL] ?? x),
      },
      {
        heading: "Production par rôle",
        columns: [
          { header: "Rôle", w: 3 },
          { header: "Comptes", w: 2, align: "right" },
          { header: "Dossiers", w: 2, align: "right" },
          { header: "Actifs", w: 2, align: "right" },
        ],
        rows: data.parRole.map((r) => [
          roleLabel(r.role),
          `${r.agents}`,
          `${r.dossiers}`,
          `${r.actifs}`,
        ]),
      },
      {
        heading: "Top agents",
        empty: "Aucun dossier attribué.",
        columns: [
          { header: "Agent", w: 4 },
          { header: "Rôle", w: 3 },
          { header: "Dossiers", w: 2, align: "right" },
        ],
        rows: data.parAgent.map((a) => [a.nom, roleLabel(a.role), `${a.dossiers}`]),
      },
      {
        heading: "Activité (30 jours)",
        empty: "Aucune activité.",
        columns: [
          { header: "Type d'action", w: 4 },
          { header: "Occurrences", w: 2, align: "right" },
        ],
        rows: data.activiteParAction.map((r) => [r.k.replace(/_/g, " "), `${r.n}`]),
      },
    ],
  });
}
