import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Compass,
  FileCheck2,
  Files,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import stickers from "../assets/eiden-visa-dossier-stickers.png";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Progress } from "../components/ui/progress";
import { alertes, completion, encaisse, ETAPES, PACKS, type Dossier } from "../lib/dossier-model";
import { CRENEAUX } from "../lib/seed";
import { useDossiers } from "../lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de suivi | Eiden Visa" },
      { name: "description", content: "Suivi quotidien des dossiers visa, pièces, rendez-vous et paiements." },
      { property: "og:title", content: "Tableau de suivi | Eiden Visa" },
      { property: "og:description", content: "Suivi quotidien des dossiers visa, pièces, rendez-vous et paiements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type View = "pilotage" | "dossiers" | "rendezvous" | "paiements" | "referentiel";

const NAV: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "pilotage", label: "Vue du jour", icon: LayoutDashboard },
  { key: "dossiers", label: "Dossiers clients", icon: Files },
  { key: "rendezvous", label: "Rendez-vous", icon: CalendarDays },
  { key: "paiements", label: "Encaissements", icon: CircleDollarSign },
  { key: "referentiel", label: "Parcours Eiden", icon: Compass },
];

function StatusDot({ tone }: { tone: "ok" | "warn" | "stop" | "info" }) {
  return <span className={`inline-block size-2 rounded-full bg-${tone}`} aria-hidden="true" />;
}

function AppMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
        <Compass className="size-5" />
      </div>
      <div>
        <p className="text-[15px] font-extrabold leading-none text-rail-foreground">EIDEN VISA</p>
        <p className="mt-1 text-[10px] font-semibold uppercase text-rail-muted">Cellule Agadir</p>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, open, close }: { view: View; setView: (v: View) => void; open: boolean; close: () => void }) {
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-foreground/40 lg:hidden" aria-label="Fermer le menu" onClick={close} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-rail px-4 py-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2">
          <AppMark />
          <Button variant="ghost" size="icon" className="text-rail-muted hover:bg-rail-active hover:text-rail-foreground lg:hidden" onClick={close} aria-label="Fermer le menu"><X /></Button>
        </div>
        <div className="mt-9 px-2 text-[10px] font-bold uppercase text-rail-muted">Opérations</div>
        <nav className="mt-3 space-y-1" aria-label="Navigation principale">
          {NAV.map(({ key, label, icon: Icon }) => (
            <Button key={key} variant="ghost" onClick={() => { setView(key); close(); }} className={`h-11 w-full justify-start px-3 text-sm ${view === key ? "bg-rail-active text-rail-foreground hover:bg-rail-active" : "text-rail-muted hover:bg-rail-active hover:text-rail-foreground"}`}>
              <Icon className="size-[18px]" />{label}
            </Button>
          ))}
        </nav>
        <div className="mt-auto border-t border-rail-muted/20 pt-4">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="grid size-9 place-items-center rounded-full bg-rail-active text-xs font-bold text-rail-foreground">SI</div>
            <div><p className="text-xs font-semibold text-rail-foreground">Salma Idrissi</p><p className="text-[11px] text-rail-muted">Accueil · Agadir</p></div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Metric({ label, value, note, icon: Icon, tone }: { label: string; value: string; note: string; icon: typeof Files; tone: "ok" | "warn" | "stop" | "info" }) {
  return (
    <div className="border-r border-border px-5 py-4 last:border-r-0 max-sm:border-r-0 sm:first:pl-0">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold text-muted-foreground">{label}</p><Icon className={`size-4 text-${tone}`} /></div>
      <p className="mt-2 text-2xl font-extrabold text-foreground">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
    </div>
  );
}

function DossierRow({ dossier, open }: { dossier: Dossier; open: () => void }) {
  const c = completion(dossier);
  const issues = alertes(dossier);
  const step = ETAPES[dossier.etape - 1];
  return (
    <button onClick={open} className="grid w-full grid-cols-[minmax(180px,1.2fr)_minmax(150px,1fr)_140px_110px_36px] items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/55 max-md:grid-cols-[1fr_36px]">
      <div className="min-w-0">
        <div className="flex items-center gap-2"><p className="truncate text-sm font-bold text-foreground">{dossier.client.nom}</p>{issues.length > 0 && <AlertTriangle className="size-3.5 shrink-0 text-stop" />}</div>
        <p className="ref mt-1 text-muted-foreground">{dossier.id} · {dossier.client.ville}</p>
      </div>
      <div className="min-w-0 max-md:hidden"><p className="truncate text-xs font-semibold text-foreground">Étape {dossier.etape} · {step.label}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{dossier.agent}</p></div>
      <div className="max-md:hidden"><div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Pièces</span><span className="font-bold">{c.ok}/{c.total}</span></div><Progress value={c.pct} className="mt-2 h-1.5 bg-muted" /></div>
      <div className="max-md:hidden">{dossier.rdv.date ? <><p className="text-xs font-bold">{dossier.rdv.date.slice(0, 5)}</p><p className="mt-1 text-[11px] text-muted-foreground">{dossier.rdv.heure ?? dossier.rdv.statut}</p></> : <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-warn"><StatusDot tone="warn" /> À rechercher</span>}</div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

function Pilotage({ selectDossier, go }: { selectDossier: (d: Dossier) => void; go: (v: View) => void }) {
  const { dossiers } = useDossiers();
  const active = dossiers.filter((d) => d.etape < 7);
  const blocked = active.filter((d) => alertes(d).length > 0);
  const today = dossiers.filter((d) => d.rdv.date === "17/09/2026");
  const missing = active.reduce((sum, d) => { const c = completion(d); return sum + c.total - c.ok; }, 0);
  const pending = dossiers.reduce((sum, d) => sum + d.paiements.filter((p) => !p.encaisse).reduce((n, p) => n + p.montant, 0), 0);
  return (
    <>
      <section className="grid grid-cols-2 border-y border-border lg:grid-cols-4">
        <Metric label="Dossiers en cours" value={String(active.length)} note="hors dossiers déposés" icon={Files} tone="info" />
        <Metric label="À contrôler" value={String(blocked.length)} note="un blocage à traiter" icon={AlertTriangle} tone="stop" />
        <Metric label="Pièces manquantes" value={String(missing)} note="sur les dossiers actifs" icon={ClipboardCheck} tone="warn" />
        <Metric label="Solde à encaisser" value={`${pending.toLocaleString("fr-FR")} MAD`} note="paiements non encaissés" icon={CircleDollarSign} tone="ok" />
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.75fr)]">
        <section className="panel overflow-hidden">
          <div className="flex items-start justify-between border-b border-border px-5 py-4">
            <div><h2 className="text-base font-extrabold">À traiter en priorité</h2><p className="mt-1 text-xs text-muted-foreground">Dossiers où une action de l'équipe est attendue.</p></div>
            <Button variant="ghost" size="sm" onClick={() => go("dossiers")}>Tous les dossiers <ArrowRight /></Button>
          </div>
          {blocked.slice(0, 5).map((d) => <DossierRow key={d.id} dossier={d} open={() => selectDossier(d)} />)}
        </section>

        <aside className="overflow-hidden rounded-lg bg-rail text-rail-foreground shadow-panel">
          <div className="relative min-h-[190px] overflow-hidden border-b border-rail-muted/20 p-5">
            <div className="relative z-10 max-w-[58%]"><p className="text-[10px] font-bold uppercase text-rail-muted">Rendez-vous du jour</p><p className="mt-3 text-3xl font-extrabold">{today.length || 1}</p><p className="mt-1 text-xs leading-5 text-rail-muted">Dépôt TLScontact à préparer avant 10h10.</p></div>
            <img src={stickers} alt="Illustration de passeport et dossier de voyage" width={1024} height={1536} className="absolute -bottom-28 -right-16 w-48 rotate-6 opacity-90" />
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-md bg-rail-active"><Clock3 className="size-4" /></div><div><p className="text-sm font-bold">10:10 · Famille Amzil</p><p className="mt-1 text-xs text-rail-muted">TLScontact Agadir · 2 adultes + 1 mineur</p></div></div>
            <Button onClick={() => go("rendezvous")} className="w-full">Ouvrir le planning</Button>
          </div>
        </aside>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="panel p-5"><div className="flex items-center justify-between"><div><h2 className="text-base font-extrabold">Veille des créneaux</h2><p className="mt-1 text-xs text-muted-foreground">Dernier relevé transmis par le back office.</p></div><CalendarDays className="size-5 text-info" /></div><div className="mt-5 space-y-3">{CRENEAUX.filter((c) => c.statut === "libre").map((c) => <div key={`${c.centre}-${c.date}`} className="flex items-center justify-between border-t border-border pt-3"><div><p className="text-sm font-bold">{c.centre}</p><p className="mt-1 text-xs text-muted-foreground">{c.date}</p></div><span className="inline-flex items-center gap-2 rounded-md bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok"><StatusDot tone="ok" />{c.places} place{c.places > 1 ? "s" : ""}</span></div>)}</div></div>
        <div className="panel p-5"><div className="flex items-center justify-between"><div><h2 className="text-base font-extrabold">Contrôle avant remise</h2><p className="mt-1 text-xs text-muted-foreground">Le dossier Hafsa Bouzid est prêt pour le solde.</p></div><ShieldCheck className="size-5 text-ok" /></div><div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-md bg-ok-soft p-3"><p className="text-xl font-extrabold text-ok">100%</p><p className="mt-1 text-[11px] text-ok">Pièces officielles</p></div><div className="rounded-md bg-info-soft p-3"><p className="text-xl font-extrabold text-info">24/09</p><p className="mt-1 text-[11px] text-info">Créneau confirmé</p></div><div className="rounded-md bg-warn-soft p-3"><p className="text-xl font-extrabold text-warn">1 000</p><p className="mt-1 text-[11px] text-warn">MAD à encaisser</p></div></div></div>
      </section>
    </>
  );
}

function DossiersView({ selectDossier }: { selectDossier: (d: Dossier) => void }) {
  const { dossiers } = useDossiers();
  const [query, setQuery] = useState("");
  const visible = dossiers.filter((d) => `${d.client.nom} ${d.id} ${d.titre}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="panel overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5"><div><h2 className="text-base font-extrabold">Registre des dossiers</h2><p className="mt-1 text-xs text-muted-foreground">{visible.length} dossiers de démonstration</p></div><label className="flex h-9 w-full max-w-xs items-center gap-2 rounded-md border border-input bg-background px-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nom ou référence" className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label></div>{visible.map((d) => <DossierRow key={d.id} dossier={d} open={() => selectDossier(d)} />)}</section>;
}

function AppointmentsView({ selectDossier }: { selectDossier: (d: Dossier) => void }) {
  const { dossiers } = useDossiers();
  return <div className="grid gap-5 lg:grid-cols-[1fr_320px]"><section className="panel overflow-hidden"><div className="border-b border-border p-5"><h2 className="text-base font-extrabold">Rendez-vous confirmés</h2><p className="mt-1 text-xs text-muted-foreground">Préparer les dossiers dans l'ordre de dépôt.</p></div>{dossiers.filter((d) => d.rdv.date).map((d) => <DossierRow key={d.id} dossier={d} open={() => selectDossier(d)} />)}</section><section className="panel p-5"><h2 className="text-base font-extrabold">Disponibilités relevées</h2><div className="mt-4 space-y-3">{CRENEAUX.map((c) => <div key={`${c.centre}-${c.date}`} className="border-t border-border pt-3"><div className="flex justify-between gap-3"><p className="text-xs font-bold">{c.centre}</p><span className={`text-xs font-bold ${c.statut === "libre" ? "text-ok" : c.statut === "ferme" ? "text-stop" : "text-info"}`}>{c.statut === "libre" ? `${c.places} libre(s)` : c.statut === "ferme" ? "Fermé" : "Réservé"}</span></div><p className="mt-1 text-xs text-muted-foreground">{c.date}</p></div>)}</div></section></div>;
}

function PaymentsView() {
  const { dossiers, encaisser } = useDossiers();
  return <section className="panel overflow-hidden"><div className="border-b border-border p-5"><h2 className="text-base font-extrabold">Journal des encaissements</h2><p className="mt-1 text-xs text-muted-foreground">Chaque paiement reste rattaché à son dossier client.</p></div>{dossiers.flatMap((d) => d.paiements.map((p, i) => ({ d, p, i }))).map(({ d, p, i }) => <div key={`${d.id}-${i}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-b-0"><div><p className="text-sm font-bold">{p.libelle}</p><p className="ref mt-1 text-muted-foreground">{d.id} · {d.client.nom}</p></div><p className="text-sm font-extrabold">{p.montant.toLocaleString("fr-FR")} MAD</p>{p.encaisse ? <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ok"><Check className="size-4" /> Encaissé</span> : <Button size="sm" onClick={() => encaisser(d.id, i)}>Encaisser</Button>}</div>)}</section>;
}

function ProcessView() {
  return <section><div className="mb-6 max-w-2xl"><h2 className="text-xl font-extrabold">Parcours opérationnel</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Les sept passages obligatoires d'un dossier, de l'accueil au dépôt. L'encaissement n'est déclenché qu'au moment prévu.</p></div><div className="grid gap-3">{ETAPES.map((e) => <article key={e.key} className="panel grid gap-4 p-5 md:grid-cols-[52px_1fr_220px]"><div className="grid size-10 place-items-center rounded-md bg-rail text-sm font-extrabold text-rail-foreground">{e.n}</div><div><h3 className="text-sm font-extrabold">{e.label}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{e.detail}</p></div><div className="border-l border-border pl-4 max-md:border-l-0 max-md:border-t max-md:pt-4"><p className="text-[10px] font-bold uppercase text-muted-foreground">Encaissement</p><p className="mt-2 text-xs font-semibold leading-5">{e.encaissement}</p><p className="mt-2 text-[11px] text-muted-foreground">Responsable : {e.role}</p></div></article>)}</div></section>;
}

function DossierPanel({ dossier, close }: { dossier: Dossier; close: () => void }) {
  const { togglePiece, avancer, reculer, encaisser: pay } = useDossiers();
  const current = useDossiers().get(dossier.id) ?? dossier;
  const c = completion(current);
  const issues = alertes(current);
  return <div className="fixed inset-0 z-50 flex justify-end bg-foreground/35" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}><aside className="h-full w-full max-w-2xl overflow-y-auto bg-background shadow-2xl"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/95 px-5 py-4 backdrop-blur"><div><p className="ref text-muted-foreground">{current.id}</p><h2 className="mt-1 text-lg font-extrabold">{current.client.nom}</h2></div><Button variant="ghost" size="icon" onClick={close} aria-label="Fermer la fiche"><X /></Button></header><div className="space-y-6 p-5 sm:p-7"><div className="grid grid-cols-3 gap-3"><div className="rounded-md bg-secondary p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Étape</p><p className="mt-1 text-sm font-extrabold">{current.etape}/7</p></div><div className="rounded-md bg-secondary p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Pièces</p><p className="mt-1 text-sm font-extrabold">{c.pct}%</p></div><div className="rounded-md bg-secondary p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Encaissé</p><p className="mt-1 text-sm font-extrabold">{encaisse(current)} MAD</p></div></div><section><p className="text-[10px] font-bold uppercase text-muted-foreground">Qualification retenue</p><h3 className="mt-2 text-base font-extrabold">{current.titre}</h3><p className="mt-1 text-xs text-muted-foreground">{current.categorie}</p></section>{issues.length > 0 && <section className="rounded-md border border-stop/25 bg-stop-soft p-4"><div className="flex items-center gap-2 text-stop"><AlertTriangle className="size-4" /><h3 className="text-sm font-extrabold">Contrôle requis</h3></div><ul className="mt-3 space-y-2">{issues.map((a) => <li key={a} className="text-xs leading-5 text-foreground">{a}</li>)}</ul></section>}<section><div className="flex items-end justify-between"><div><h3 className="text-sm font-extrabold">Pièces officielles</h3><p className="mt-1 text-xs text-muted-foreground">Cocher uniquement après contrôle du document.</p></div><span className="text-xs font-bold">{c.ok}/{c.total}</span></div><Progress value={c.pct} className="mt-3" /><div className="mt-4 divide-y divide-border border-y border-border">{current.pieces.map((p, i) => <label key={`${p.label}-${i}`} className="flex cursor-pointer items-start gap-3 py-3"><Checkbox checked={p.fourni} onCheckedChange={() => togglePiece(current.id, i)} className={p.source === "eiden" ? "border-info data-[state=checked]:bg-info" : ""} /><span className="text-xs leading-5"><span className="font-semibold">{p.label}</span>{p.source === "eiden" && <span className="ml-2 text-[10px] font-bold uppercase text-info">Recommandation Eiden</span>}</span></label>)}</div></section><section><h3 className="text-sm font-extrabold">Paiements</h3><div className="mt-3 space-y-2">{current.paiements.map((p, i) => <div key={`${p.libelle}-${i}`} className="flex items-center justify-between gap-4 rounded-md bg-secondary p-3"><div><p className="text-xs font-bold">{p.libelle}</p><p className="mt-1 text-[11px] text-muted-foreground">{p.date ?? "Non encaissé"}</p></div>{p.encaisse ? <span className="text-xs font-bold text-ok">{p.montant} MAD · reçu</span> : <Button size="sm" onClick={() => pay(current.id, i)}>Encaisser {p.montant} MAD</Button>}</div>)}</div></section><footer className="flex items-center justify-between border-t border-border pt-5"><Button variant="outline" onClick={() => reculer(current.id)} disabled={current.etape === 1}><ArrowLeft /> Étape précédente</Button><Button onClick={() => avancer(current.id)} disabled={current.etape === 7}>Valider et avancer <ArrowRight /></Button></footer></div></aside></div>;
}

function Index() {
  const [view, setView] = useState<View>("pilotage");
  const [selected, setSelected] = useState<Dossier | null>(null);
  const [menu, setMenu] = useState(false);
  const title = useMemo(() => NAV.find((n) => n.key === view)?.label ?? "Vue du jour", [view]);
  return <div className="min-h-screen bg-background"><Sidebar view={view} setView={setView} open={menu} close={() => setMenu(false)} /><main className="min-h-screen lg:pl-64"><header className="flex min-h-20 items-center justify-between border-b border-border bg-card px-4 sm:px-7"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenu(true)} aria-label="Ouvrir le menu"><Menu /></Button><div><p className="text-[10px] font-bold uppercase text-muted-foreground">Mercredi 17 septembre 2026</p><h1 className="mt-1 text-xl font-extrabold">{title}</h1></div></div><div className="flex items-center gap-2"><Button variant="outline" size="icon" aria-label="Notifications"><Bell /></Button><Button onClick={() => setView("dossiers")} className="max-sm:hidden"><UserRound /> Ouvrir un dossier</Button></div></header><div className="mx-auto max-w-[1500px] p-4 sm:p-7">{view === "pilotage" && <Pilotage selectDossier={setSelected} go={setView} />}{view === "dossiers" && <DossiersView selectDossier={setSelected} />}{view === "rendezvous" && <AppointmentsView selectDossier={setSelected} />}{view === "paiements" && <PaymentsView />}{view === "referentiel" && <ProcessView />}</div></main>{selected && <DossierPanel dossier={selected} close={() => setSelected(null)} />}</div>;
}
