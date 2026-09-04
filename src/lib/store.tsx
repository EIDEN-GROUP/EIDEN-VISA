import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { buildSeed } from "./seed";
import type { Dossier, PackKey } from "./dossier-model";

interface Store {
  dossiers: Dossier[];
  get: (id: string) => Dossier | undefined;
  togglePiece: (id: string, index: number) => void;
  avancer: (id: string) => void;
  reculer: (id: string) => void;
  confirmerRdv: (id: string, date: string, heure: string) => void;
  encaisser: (id: string, index: number) => void;
  changerPack: (id: string, pack: PackKey) => void;
  ajouter: (d: Dossier) => void;
}

const Ctx = createContext<Store | null>(null);

export function DossiersProvider({ children }: { children: ReactNode }) {
  const [dossiers, setDossiers] = useState<Dossier[]>(() => buildSeed());

  const value = useMemo<Store>(() => {
    const patch = (id: string, fn: (d: Dossier) => Dossier) =>
      setDossiers((list) => list.map((d) => (d.id === id ? fn(d) : d)));

    return {
      dossiers,
      get: (id) => dossiers.find((d) => d.id === id),
      togglePiece: (id, index) =>
        patch(id, (d) => ({
          ...d,
          pieces: d.pieces.map((p, i) => (i === index ? { ...p, fourni: !p.fourni } : p)),
        })),
      avancer: (id) => patch(id, (d) => ({ ...d, etape: Math.min(7, d.etape + 1) })),
      reculer: (id) => patch(id, (d) => ({ ...d, etape: Math.max(1, d.etape - 1) })),
      confirmerRdv: (id, date, heure) =>
        patch(id, (d) => ({
          ...d,
          rdv: { ...d.rdv, date, heure, statut: "confirme" },
          etape: Math.max(d.etape, 3),
        })),
      encaisser: (id, index) =>
        patch(id, (d) => ({
          ...d,
          paiements: d.paiements.map((p, i) =>
            i === index ? { ...p, encaisse: true, date: p.date ?? "aujourd'hui" } : p,
          ),
        })),
      changerPack: (id, pack) => patch(id, (d) => ({ ...d, pack })),
      ajouter: (d) => setDossiers((list) => [d, ...list]),
    };
  }, [dossiers]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDossiers() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDossiers doit être utilisé dans DossiersProvider");
  return ctx;
}
