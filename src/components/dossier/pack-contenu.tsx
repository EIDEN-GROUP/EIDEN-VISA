import { PACKS, type PackKey } from "@/lib/dossier-model";

/** Contenu d'un pack, comme sur la landing : « Tout le pack X, plus » puis ses ajouts. */
export function PackContenu({ pack }: { pack: PackKey }) {
  const p = PACKS[pack];
  return (
    <div className="text-xs text-muted-foreground">
      <p>{p.contenu}</p>
      <p className="mt-2 font-medium text-foreground">
        {p.herite ? `Tout le ${PACKS[p.herite].label}, plus :` : "Le pack comprend :"}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {p.inclus.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
