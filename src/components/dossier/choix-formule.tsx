import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PackContenu } from "@/components/dossier/pack-contenu";
import {
  PACKS,
  PACK_KEYS,
  SERVICES,
  SERVICE_KEYS,
  PRIX_MANUEL_MAX,
  basculerService,
  erreurPrixManuel,
  mad,
  prixCatalogue,
  type FormuleKey,
  type PackKey,
  type ServiceKey,
} from "@/lib/dossier-model";
import { cn } from "@/lib/utils";

export interface Formule {
  pack: FormuleKey;
  services: ServiceKey[];
  /** Total saisi à la main, `null` = prix catalogue. `NaN` = case cochée, champ encore vide. */
  prixManuel: number | null;
}

/**
 * Ce que le client achète : un pack (case cochée) OU des services à l'unité. Les deux
 * s'excluent - cocher « pack » désactive les services, et inversement - et le total
 * affiché est celui qui part dans l'échéancier. « Prix manuel » remplace le prix catalogue
 * par un total saisi (remise, tarif négocié).
 */
export function ChoixFormule({
  value,
  onChange,
  disabled = false,
}: {
  value: Formule;
  onChange: (f: Formule) => void;
  disabled?: boolean;
}) {
  const enPack = value.pack !== "carte";
  const catalogue = prixCatalogue(value.pack, value.services);
  const manuel = value.prixManuel !== null;
  const erreurPrix = manuel ? erreurPrixManuel(value.prixManuel) : null;
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Checkbox
          checked={enPack}
          disabled={disabled}
          onCheckedChange={(v) =>
            onChange({
              pack: v === true ? "base" : "carte",
              services: [],
              prixManuel: value.prixManuel,
            })
          }
        />
        Le client prend un pack
      </label>

      <div className={cn("space-y-2", !enPack && "opacity-50")}>
        <Select
          value={enPack ? value.pack : ""}
          disabled={disabled || !enPack}
          onValueChange={(v) =>
            onChange({ pack: v as PackKey, services: [], prixManuel: value.prixManuel })
          }
        >
          <SelectTrigger aria-label="Pack">
            <SelectValue placeholder="Pack" />
          </SelectTrigger>
          <SelectContent>
            {PACK_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {PACKS[k].label} · {mad(PACKS[k].prix)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {enPack && <PackContenu pack={value.pack as PackKey} />}
      </div>

      <fieldset
        disabled={disabled || enPack}
        className={cn("space-y-1.5 border-t border-border pt-3", enPack && "opacity-50")}
      >
        <legend className="text-xs font-medium text-muted-foreground">Services à l'unité</legend>
        {SERVICE_KEYS.map((k) => (
          <label key={k} className="flex items-start gap-2 text-sm">
            <Checkbox
              className="mt-0.5"
              checked={!enPack && value.services.includes(k)}
              disabled={disabled || enPack}
              onCheckedChange={() =>
                onChange({
                  pack: "carte",
                  services: basculerService(value.services, k),
                  prixManuel: value.prixManuel,
                })
              }
            />
            <span className="flex-1">
              <span className="text-foreground">{SERVICES[k].label}</span>
              <span className="block text-xs text-muted-foreground">{SERVICES[k].detail}</span>
            </span>
            <span className="ref whitespace-nowrap text-foreground">{mad(SERVICES[k].prix)}</span>
          </label>
        ))}
      </fieldset>

      <div className="space-y-2 border-t border-border pt-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">Total</span>
          <span className="ref text-base text-foreground">
            {!enPack && value.services.length === 0 ? (
              "- choisir un service"
            ) : manuel ? (
              <>
                <span className="mr-2 text-xs text-muted-foreground line-through">
                  {mad(catalogue)}
                </span>
                {erreurPrix ? "-" : mad(value.prixManuel!)}
              </>
            ) : (
              mad(catalogue)
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-muted-foreground">
            <Checkbox
              checked={manuel}
              disabled={disabled}
              onCheckedChange={(v) =>
                onChange({ ...value, prixManuel: v === true ? catalogue || Number.NaN : null })
              }
            />
            Prix manuel
          </label>
          {manuel && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={PRIX_MANUEL_MAX}
                step={1}
                aria-label="Prix manuel (MAD)"
                aria-invalid={erreurPrix !== null}
                className="ref h-8 w-32 text-right"
                disabled={disabled}
                value={Number.isNaN(value.prixManuel) ? "" : value.prixManuel!}
                onChange={(e) =>
                  onChange({
                    ...value,
                    prixManuel: e.target.value === "" ? Number.NaN : Number(e.target.value),
                  })
                }
              />
              <span className="text-xs text-muted-foreground">MAD</span>
            </div>
          )}
        </div>
        {erreurPrix ? (
          <p className="text-xs text-destructive">{erreurPrix}</p>
        ) : (
          manuel && (
            <p className="text-xs text-muted-foreground">
              Remplace le prix catalogue : l'échéancier est calculé sur ce total.
            </p>
          )
        )}
      </div>
    </div>
  );
}
