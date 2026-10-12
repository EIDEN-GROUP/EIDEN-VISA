import { Checkbox } from "@/components/ui/checkbox";
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
  basculerService,
  mad,
  prixFormule,
  type FormuleKey,
  type PackKey,
  type ServiceKey,
} from "@/lib/dossier-model";
import { cn } from "@/lib/utils";

export interface Formule {
  pack: FormuleKey;
  services: ServiceKey[];
}

/**
 * Ce que le client achète : un pack (case cochée) OU des services à l'unité. Les deux
 * s'excluent — cocher « pack » désactive les services, et inversement — et le total
 * affiché est celui qui part dans l'échéancier.
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
  const total = prixFormule(value.pack, value.services);
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Checkbox
          checked={enPack}
          disabled={disabled}
          onCheckedChange={(v) =>
            onChange(v === true ? { pack: "base", services: [] } : { pack: "carte", services: [] })
          }
        />
        Le client prend un pack
      </label>

      <div className={cn("space-y-2", !enPack && "opacity-50")}>
        <Select
          value={enPack ? value.pack : ""}
          disabled={disabled || !enPack}
          onValueChange={(v) => onChange({ pack: v as PackKey, services: [] })}
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
                onChange({ pack: "carte", services: basculerService(value.services, k) })
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

      <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="font-medium text-foreground">Total</span>
        <span className="ref text-base text-foreground">
          {!enPack && value.services.length === 0 ? "— choisir un service" : mad(total)}
        </span>
      </div>
    </div>
  );
}
