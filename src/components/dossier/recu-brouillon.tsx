import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Download, Eye, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useBrouillons, useCurrentUser } from "@/lib/store";
import {
  defaultRecuDonnees,
  recuEcartLedger,
  recuTotaux,
  type Dossier,
  type RecuDonnees,
} from "@/lib/dossier-model";
import { cn } from "@/lib/utils";
import logoEidenVisa from "@/assets/decorations/logo-eiden-visa.webp";
import { buildReceiptPdf } from "@/routes/dossiers.$id.recu";

/**
 * Aperçu écran d'un reçu (officiel ou brouillon) : même contenu que le PDF,
 * rendu depuis les mêmes données résolues (`RecuDonnees`).
 */
export function ApercuRecu({ r, ecart }: { r: RecuDonnees; ecart: boolean }) {
  const { paye, du, total, reste } = recuTotaux(r);
  const visibles = r.pieces.filter((p) => !p.masque);
  return (
    <div className="border border-border bg-card p-10">
      {ecart && (
        <div className="mb-6 rounded-xl border border-[var(--warn)] bg-[var(--warn-soft)] px-4 py-3 text-sm font-medium text-foreground">
          Brouillon — montants modifiés, sans valeur comptable. Seul le reçu officiel atteste les
          sommes encaissées.
        </div>
      )}
      <div className="flex items-start justify-between border-b border-border pb-6">
        <div>
          <img src={logoEidenVisa} alt="Eiden Visa" className="h-14 w-auto" />
        </div>
        <div className="text-right">
          <div className="ref text-muted-foreground">Reçu de paiement</div>
          <div className="ref mt-1 text-muted-foreground">Émis le {r.emisLe}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 border-b border-border py-6 text-sm">
        <div>
          <div className="ref text-muted-foreground">Client</div>
          <div className="mt-1 font-medium text-foreground">{r.clientNom}</div>
          <div className="mt-0.5 text-muted-foreground">{r.clientTelephone}</div>
          <div className="text-muted-foreground">{r.clientVille}</div>
        </div>
        <div>
          <div className="ref text-muted-foreground">Dossier</div>
          <div className="mt-1 font-medium text-foreground">{r.dossierTitre}</div>
          <div className="mt-0.5 text-muted-foreground">{r.pays}</div>
        </div>
      </div>

      {r.afficherPieces && (
        <div className="border-b border-border py-6">
          <div className="ref mb-3 text-muted-foreground">Pièces du dossier</div>
          <ul className="space-y-1.5">
            {visibles.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm">
                <span
                  className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
                    p.fourni ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {p.fourni && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                </span>
                <span className={p.fourni ? "text-foreground" : "text-muted-foreground"}>
                  {p.label}
                </span>
              </li>
            ))}
            {visibles.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Aucune pièce listée pour ce dossier.
              </li>
            )}
          </ul>
        </div>
      )}

      {r.mode === "apres" && (
        <div className="py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="ref border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">Libellé</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 text-right font-medium">Montant</th>
              </tr>
            </thead>
            <tbody>
              {paye.map((p, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-2.5 text-foreground">{p.libelle}</td>
                  <td className="py-2.5 text-muted-foreground">{p.date}</td>
                  <td className="py-2.5 text-right font-medium text-foreground">{p.montant} MAD</td>
                </tr>
              ))}
              {paye.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-muted-foreground">
                    Aucun paiement encaissé à ce jour.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm font-semibold">
            <span className="text-foreground">Total encaissé</span>
            <span className="num-display text-lg text-foreground">{total} MAD</span>
          </div>
          {r.afficherReste && (
            <>
              {du.map((p, i) => (
                <div
                  key={i}
                  className="mt-2 flex items-center justify-between text-sm text-muted-foreground"
                >
                  <span>{p.libelle}</span>
                  <span>{p.montant} MAD</span>
                </div>
              ))}
              <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                <span className="text-foreground">
                  {reste > 0 ? "Reste à payer" : "Reste à payer — dossier soldé"}
                </span>
                <span className="num-display text-lg text-foreground">{reste} MAD</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-6 border-t border-border pt-6 text-xs text-muted-foreground">
        <div>
          <div className="h-10 border-b border-border" />
          <div className="mt-1.5 font-medium text-foreground">{r.signature}</div>
          <div className="mt-0.5">{r.mentionAccord}</div>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">{r.note}</p>
    </div>
  );
}

/**
 * Champ texte invisible : indiscernable du texte jusqu'au survol/focus, puis
 * bordure de saisie. Entrée = valider, Échap = quitter. Shift+Entrée n'ajoute
 * que dans les listes (`onAjouter`) : libellés de pièces et de lignes.
 */
function Champ({
  value,
  onChange,
  maxLength,
  label,
  className = "",
  focusKey,
  onAjouter,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  label: string;
  className?: string;
  focusKey?: string;
  onAjouter?: () => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      placeholder={placeholder}
      data-focus-key={focusKey}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !(e.shiftKey && onAjouter)) {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        } else if (e.key === "Enter" && e.shiftKey && onAjouter) {
          e.preventDefault();
          onAjouter();
        } else if (e.key === "Escape") {
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={`w-full rounded border border-transparent bg-transparent px-1 -mx-1 transition placeholder:text-muted-foreground/50 hover:border-border focus:border-primary focus:bg-background focus:outline-none ${className}`}
    />
  );
}

/** Champ montant : numérique uniquement, jamais de Shift+Entrée (bouton [+] dédié). */
function ChampNombre({
  value,
  onChange,
  label,
  className = "",
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={0}
      max={10_000_000}
      step={1}
      value={value}
      onChange={(e) => {
        const v = e.target.valueAsNumber;
        onChange(Number.isNaN(v) ? 0 : Math.max(0, Math.floor(v)));
      }}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === "Escape") (e.target as HTMLInputElement).blur();
      }}
      className={`w-full rounded border border-transparent bg-transparent px-1 -mx-1 transition hover:border-border focus:border-primary focus:bg-background focus:outline-none ${className}`}
    />
  );
}

/** Bouton discret d'ajout en fin de liste (tactile : pas de Shift+Entrée). */
function BoutonAjouter({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

/**
 * Éditeur de brouillon : le reçu lui-même devient le formulaire (bouton
 * « Modifier »), champs invisibles jusqu'au survol/focus, Shift+Entrée pour
 * ajouter dans les listes, boutons [+] là où ça n'a pas de sens au clavier.
 * Tout reste local jusqu'au téléchargement ou à l'enregistrement explicite ;
 * le dossier n'est jamais modifié. `initial` = officiel ou brouillon repris.
 */
export function EditeurBrouillon({
  dossier,
  initial,
  onAbandon,
  onEnregistre,
}: {
  dossier: Dossier;
  initial: RecuDonnees;
  onAbandon: () => void;
  onEnregistre: (nom: string, donnees: RecuDonnees) => Promise<void>;
}) {
  const [brouillon, setBrouillon] = useState<RecuDonnees>(initial);
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  // Mode édition : le reçu est le formulaire. Éteint = aperçu identique à l'officiel.
  const [enEdition, setEnEdition] = useState(true);
  const racine = useRef<HTMLDivElement>(null);
  const [focusDemande, setFocusDemande] = useState<string | null>(null);
  const { total, reste } = recuTotaux(brouillon);
  const ecart = recuEcartLedger(dossier, brouillon);
  const maj = (patch: Partial<RecuDonnees>) => {
    setErreur(null);
    setBrouillon((b) => ({ ...b, ...patch }));
  };

  // Après un ajout (Shift+Entrée ou [+]), le focus suit dans le nouveau champ.
  useEffect(() => {
    if (!focusDemande || !racine.current) return;
    racine.current.querySelector<HTMLElement>(`[data-focus-key="${focusDemande}"]`)?.focus();
    setFocusDemande(null);
  }, [focusDemande, brouillon]);

  const ajouterLigne = (apres: number) => {
    maj({
      lignes: [
        ...brouillon.lignes.slice(0, apres + 1),
        { libelle: "", montant: 0, date: null, encaisse: false },
        ...brouillon.lignes.slice(apres + 1),
      ],
    });
    setFocusDemande(`ligne-${apres + 1}`);
  };

  const ajouterPiece = () => {
    maj({
      pieces: [...brouillon.pieces, { label: "", source: "eiden", fourni: false }],
    });
    setFocusDemande(`piece-${brouillon.pieces.length}`);
  };

  const valide = (): string | null => {
    if (brouillon.lignes.some((l) => !l.libelle.trim()))
      return "Chaque ligne doit avoir un libellé.";
    if (brouillon.lignes.some((l) => !Number.isInteger(l.montant) || l.montant < 0))
      return "Chaque montant doit être un nombre entier positif.";
    if (!brouillon.clientNom.trim() || !brouillon.dossierTitre.trim())
      return "Le client et le dossier doivent avoir un libellé.";
    return null;
  };

  const enregistrer = async () => {
    const probleme =
      valide() ?? (!nom.trim() ? "Donnez un nom au brouillon pour l'enregistrer." : null);
    if (probleme) {
      setErreur(probleme);
      return;
    }
    setEnCours(true);
    try {
      await onEnregistre(nom.trim(), brouillon);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : String(err));
    } finally {
      setEnCours(false);
    }
  };

  const telecharger = () => {
    const probleme = valide();
    if (probleme) {
      setErreur(probleme);
      return;
    }
    void buildReceiptPdf(dossier.id, brouillon, ecart);
  };

  return (
    <div className="space-y-4" ref={racine}>
      <div className="rounded-xl border border-[var(--warn)] bg-[var(--warn-soft)] px-4 py-3 text-sm">
        <span className="font-semibold text-foreground">Brouillon — non enregistré.</span>{" "}
        <span className="text-muted-foreground">
          Modifications temporaires : le dossier n'est pas modifié. Téléchargez ou enregistrez avant
          de quitter, sinon tout est perdu.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant={enEdition ? "secondary" : "outline"}
          onClick={() => setEnEdition((v) => !v)}
        >
          <Pencil className="h-3.5 w-3.5" /> {enEdition ? "Terminer" : "Modifier"}
        </Button>
        <Button size="sm" onClick={telecharger}>
          <Download className="h-3.5 w-3.5" /> Télécharger le PDF modifié
        </Button>
        <Button size="sm" variant="outline" onClick={() => maj(defaultRecuDonnees(dossier))}>
          <RotateCcw className="h-3.5 w-3.5" /> Réinitialiser
        </Button>
        <Button size="sm" variant="ghost" onClick={onAbandon}>
          <X className="h-3.5 w-3.5" /> Abandonner
        </Button>
      </div>

      {enEdition && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Type
            <select
              value={brouillon.mode}
              onChange={(e) => maj({ mode: e.target.value as RecuDonnees["mode"] })}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground"
              aria-label="Type de reçu"
            >
              <option value="apres">Après paiement</option>
              <option value="avant">Avant paiement</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Checkbox
              checked={brouillon.afficherPieces}
              onCheckedChange={(v) => maj({ afficherPieces: v === true })}
            />
            Pièces
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Checkbox
              checked={brouillon.afficherReste}
              onCheckedChange={(v) => maj({ afficherReste: v === true })}
            />
            Reste à payer
          </label>
          <span className="text-xs text-muted-foreground">
            Total <strong className="text-foreground">{total} MAD</strong> · Reste{" "}
            <strong className="text-foreground">{reste} MAD</strong>
          </span>
          {ecart ? (
            <span className="rounded-full bg-[var(--warn-soft)] px-2.5 py-1 text-xs font-semibold text-foreground">
              Montants modifiés
            </span>
          ) : (
            <span className="rounded-full bg-[var(--ok-soft)] px-2.5 py-1 text-xs font-semibold text-foreground">
              Conforme au dossier
            </span>
          )}
        </div>
      )}

      {erreur && <p className="text-sm text-destructive">{erreur}</p>}

      {!enEdition ? (
        <ApercuRecu r={brouillon} ecart={ecart} />
      ) : (
        <div className="border border-border bg-card p-10">
          {ecart && (
            <div className="mb-6 rounded-xl border border-[var(--warn)] bg-[var(--warn-soft)] px-4 py-3 text-sm font-medium text-foreground">
              Brouillon — montants modifiés, sans valeur comptable. Seul le reçu officiel atteste
              les sommes encaissées.
            </div>
          )}
          <div className="flex items-start justify-between border-b border-border pb-6">
            <div>
              <img src={logoEidenVisa} alt="Eiden Visa" className="h-14 w-auto" />
            </div>
            <div className="text-right">
              <div className="ref text-muted-foreground">Reçu de paiement</div>
              <div className="ref mt-1 text-muted-foreground">
                Émis le{" "}
                <Champ
                  value={brouillon.emisLe}
                  maxLength={32}
                  onChange={(v) => maj({ emisLe: v })}
                  label="Date d'émission"
                  className="inline w-28 text-right"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-b border-border py-6 text-sm">
            <div>
              <div className="ref text-muted-foreground">Client</div>
              <div className="mt-1 font-medium text-foreground">
                <Champ
                  value={brouillon.clientNom}
                  maxLength={120}
                  onChange={(v) => maj({ clientNom: v })}
                  label="Nom du client"
                />
              </div>
              <div className="mt-0.5 text-muted-foreground">
                <Champ
                  value={brouillon.clientTelephone}
                  maxLength={120}
                  onChange={(v) => maj({ clientTelephone: v })}
                  label="Téléphone du client"
                />
              </div>
              <div className="text-muted-foreground">
                <Champ
                  value={brouillon.clientVille}
                  maxLength={120}
                  onChange={(v) => maj({ clientVille: v })}
                  label="Ville du client"
                />
              </div>
            </div>
            <div>
              <div className="ref text-muted-foreground">Dossier</div>
              <div className="mt-1 font-medium text-foreground">
                <Champ
                  value={brouillon.dossierTitre}
                  maxLength={160}
                  onChange={(v) => maj({ dossierTitre: v })}
                  label="Titre du dossier"
                />
              </div>
              <div className="mt-0.5 text-muted-foreground">
                <Champ
                  value={brouillon.pays}
                  maxLength={80}
                  onChange={(v) => maj({ pays: v })}
                  label="Pays de destination"
                />
              </div>
            </div>
          </div>

          {brouillon.afficherPieces && (
            <div className="border-b border-border py-6">
              <div className="ref mb-3 text-muted-foreground">Pièces du dossier</div>
              <ul className="space-y-1.5">
                {brouillon.pieces.map((piece, i) => {
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex items-start gap-2.5 text-sm",
                        piece.masque && "opacity-50",
                      )}
                    >
                      <Checkbox
                        checked={piece.fourni}
                        onCheckedChange={(v) =>
                          maj({
                            pieces: brouillon.pieces.map((x, j) =>
                              j === i ? { ...x, fourni: v === true } : x,
                            ),
                          })
                        }
                        aria-label="Pièce fournie"
                        className="mt-1"
                      />
                      <span
                        className={cn(
                          "flex-1",
                          piece.fourni ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        <Champ
                          value={piece.label}
                          maxLength={200}
                          onChange={(v) =>
                            maj({
                              pieces: brouillon.pieces.map((x, j) =>
                                j === i ? { ...x, label: v } : x,
                              ),
                            })
                          }
                          label="Libellé de la pièce"
                          focusKey={`piece-${i}`}
                          placeholder="Nouvelle pièce…"
                          onAjouter={() => {
                            maj({
                              pieces: [
                                ...brouillon.pieces.slice(0, i + 1),
                                { label: "", source: "eiden", fourni: false },
                                ...brouillon.pieces.slice(i + 1),
                              ],
                            });
                            setFocusDemande(`piece-${i + 1}`);
                          }}
                        />
                      </span>
                      <label className="flex items-center gap-1 text-xs whitespace-nowrap text-muted-foreground">
                        <Checkbox
                          checked={!piece.masque}
                          onCheckedChange={(v) =>
                            maj({
                              pieces: brouillon.pieces.map((x, j) =>
                                j === i ? { ...x, masque: v === true ? false : true } : x,
                              ),
                            })
                          }
                        />
                        Afficher
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2">
                <BoutonAjouter
                  onClick={ajouterPiece}
                  label="Ajouter une pièce (Maj+Entrée dans un libellé)"
                />
              </div>
            </div>
          )}

          {brouillon.mode === "apres" && (
            <div className="py-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="ref border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Libellé</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 text-right font-medium">Montant</th>
                    <th className="pb-2 w-16">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {brouillon.lignes
                    .map((l, i) => ({ l, i }))
                    .filter(({ l }) => l.encaisse)
                    .map(({ l, i }) => (
                      <tr key={i} className="border-b border-border/60">
                        <td className="py-2.5 pr-2 text-foreground">
                          <Champ
                            value={l.libelle}
                            maxLength={160}
                            onChange={(v) =>
                              maj({
                                lignes: brouillon.lignes.map((x, j) =>
                                  j === i ? { ...x, libelle: v } : x,
                                ),
                              })
                            }
                            label="Libellé de la ligne"
                            focusKey={`ligne-${i}`}
                            placeholder="Nouvelle ligne…"
                            onAjouter={() => ajouterLigne(i)}
                          />
                        </td>
                        <td className="py-2.5 pr-2 text-muted-foreground">
                          <Champ
                            value={l.date ?? ""}
                            maxLength={32}
                            onChange={(v) =>
                              maj({
                                lignes: brouillon.lignes.map((x, j) =>
                                  j === i ? { ...x, date: v.trim() || null } : x,
                                ),
                              })
                            }
                            label="Date de la ligne"
                            placeholder="—"
                          />
                        </td>
                        <td className="py-2.5 text-right font-medium text-foreground">
                          <ChampNombre
                            value={l.montant}
                            onChange={(v) =>
                              maj({
                                lignes: brouillon.lignes.map((x, j) =>
                                  j === i ? { ...x, montant: v } : x,
                                ),
                              })
                            }
                            label="Montant en MAD"
                            className="text-right"
                          />
                        </td>
                        <td className="py-2.5 pl-1">
                          <div className="flex items-center justify-end gap-1">
                            <Checkbox
                              checked={l.encaisse}
                              onCheckedChange={(v) =>
                                maj({
                                  lignes: brouillon.lignes.map((x, j) =>
                                    j === i ? { ...x, encaisse: v === true } : x,
                                  ),
                                })
                              }
                              aria-label="Ligne encaissée"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                maj({ lignes: brouillon.lignes.filter((_, j) => j !== i) })
                              }
                              aria-label="Supprimer la ligne"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {brouillon.lignes.filter((l) => l.encaisse).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
                        Aucun paiement encaissé à ce jour.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-2">
                <BoutonAjouter
                  onClick={() => ajouterLigne(brouillon.lignes.length - 1)}
                  label="Ajouter une ligne (Maj+Entrée dans un libellé)"
                />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm font-semibold">
                <span className="text-foreground">Total encaissé</span>
                <span className="num-display text-lg text-foreground">{total} MAD</span>
              </div>
              {brouillon.afficherReste && (
                <>
                  {brouillon.lignes
                    .map((l, i) => ({ l, i }))
                    .filter(({ l }) => !l.encaisse)
                    .map(({ l, i }) => (
                      <div
                        key={i}
                        className="mt-2 flex items-center justify-between gap-2 text-sm text-muted-foreground"
                      >
                        <span className="flex-1">
                          <Champ
                            value={l.libelle}
                            maxLength={160}
                            onChange={(v) =>
                              maj({
                                lignes: brouillon.lignes.map((x, j) =>
                                  j === i ? { ...x, libelle: v } : x,
                                ),
                              })
                            }
                            label="Libellé du reste à payer"
                            focusKey={`ligne-${i}`}
                            placeholder="Nouvelle ligne…"
                            onAjouter={() => ajouterLigne(i)}
                          />
                        </span>
                        <span className="flex items-center gap-1">
                          <ChampNombre
                            value={l.montant}
                            onChange={(v) =>
                              maj({
                                lignes: brouillon.lignes.map((x, j) =>
                                  j === i ? { ...x, montant: v } : x,
                                ),
                              })
                            }
                            label="Montant en MAD"
                            className="w-24 text-right"
                          />
                          <span>MAD</span>
                          <Checkbox
                            checked={l.encaisse}
                            onCheckedChange={(v) =>
                              maj({
                                lignes: brouillon.lignes.map((x, j) =>
                                  j === i ? { ...x, encaisse: v === true } : x,
                                ),
                              })
                            }
                            aria-label="Ligne encaissée"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              maj({ lignes: brouillon.lignes.filter((_, j) => j !== i) })
                            }
                            aria-label="Supprimer la ligne"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </span>
                      </div>
                    ))}
                  <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                    <span className="text-foreground">
                      {reste > 0 ? "Reste à payer" : "Reste à payer — dossier soldé"}
                    </span>
                    <span className="num-display text-lg text-foreground">{reste} MAD</span>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-6 border-t border-border pt-6 text-xs text-muted-foreground">
            <div>
              <div className="h-10 border-b border-border" />
              <div className="mt-1.5 font-medium text-foreground">
                <Champ
                  value={brouillon.signature}
                  maxLength={120}
                  onChange={(v) => maj({ signature: v })}
                  label="Signature"
                />
              </div>
              <div className="mt-0.5">
                <Champ
                  value={brouillon.mentionAccord}
                  maxLength={300}
                  onChange={(v) => maj({ mentionAccord: v })}
                  label="Mention d'accord"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <textarea
              value={brouillon.note}
              maxLength={2000}
              rows={3}
              onChange={(e) => maj({ note: e.target.value })}
              aria-label="Note de bas de page"
              className="w-full resize-y rounded-xl border border-transparent bg-transparent px-2 py-1 text-xs text-muted-foreground transition hover:border-border focus:border-primary focus:bg-background focus:text-foreground focus:outline-none"
            />
          </div>
        </div>
      )}

      {erreur && <p className="text-sm text-destructive">{erreur}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={nom}
          maxLength={80}
          onChange={(e) => {
            setErreur(null);
            setNom(e.target.value);
          }}
          placeholder="Nom du brouillon (ex. Remise 10 %)"
          aria-label="Nom du brouillon"
          className="max-w-xs"
        />
        <Button size="sm" variant="secondary" disabled={enCours} onClick={enregistrer}>
          {enCours ? "Enregistrement…" : "Enregistrer le brouillon"}
        </Button>
      </div>
    </div>
  );
}

/**
 * Brouillons enregistrés d'un dossier : voir (lecture seule), télécharger,
 * reprendre dans l'éditeur, supprimer (CEO). Les instantanés sont immuables :
 * reprendre + enregistrer crée une nouvelle version.
 */
export function ListeBrouillons({
  dossier,
  onReprendre,
}: {
  dossier: Dossier;
  onReprendre: (donnees: RecuDonnees) => void;
}) {
  const { brouillons, isLoading, supprimer } = useBrouillons(dossier.id);
  const { user } = useCurrentUser();
  const [apercuId, setApercuId] = useState<string | null>(null);
  const [suppressionId, setSuppressionId] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const apercus = brouillons.find((b) => b.id === apercuId) ?? null;
  const suppression = brouillons.find((b) => b.id === suppressionId) ?? null;
  const peutSupprimer = user?.role === "ceo";

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement des brouillons…</p>;
  }

  if (brouillons.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun brouillon enregistré.</p>;
  }

  return (
    <div className="space-y-2">
      {erreur && <p className="text-sm text-destructive">{erreur}</p>}
      <ul className="space-y-2">
        {brouillons.map((b) => {
          const { total } = recuTotaux(b.donnees);
          return (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{b.nom}</span>
                  {b.ecartLedger ? (
                    <span className="rounded-full bg-[var(--warn-soft)] px-2 py-0.5 text-xs font-semibold text-foreground">
                      Montants modifiés
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--ok-soft)] px-2 py-0.5 text-xs font-semibold text-foreground">
                      Conforme
                    </span>
                  )}
                </div>
                <div className="ref mt-0.5 text-muted-foreground">
                  {b.auteur ?? "Agent"} · {new Date(b.createdAt).toLocaleString("fr-FR")} · {total}{" "}
                  MAD encaissés
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Button type="button" size="sm" variant="ghost" onClick={() => setApercuId(b.id)}>
                  <Eye className="h-3.5 w-3.5" /> Voir
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => void buildReceiptPdf(dossier.id, b.donnees, b.ecartLedger)}
                >
                  <Download className="h-3.5 w-3.5" /> PDF
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onReprendre(b.donnees)}
                >
                  <Pencil className="h-3.5 w-3.5" /> Reprendre
                </Button>
                {peutSupprimer && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setSuppressionId(b.id)}
                    aria-label={`Supprimer ${b.nom}`}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <Dialog open={apercuId !== null} onOpenChange={(v) => !v && setApercuId(null)}>
        <DialogContent className="max-h-[90svh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{apercus?.nom ?? "Aperçu"}</DialogTitle>
          </DialogHeader>
          {apercus && <ApercuRecu r={apercus.donnees} ecart={apercus.ecartLedger} />}
          <DialogFooter>
            {apercus && (
              <Button
                size="sm"
                onClick={() =>
                  void buildReceiptPdf(dossier.id, apercus.donnees, apercus.ecartLedger)
                }
              >
                <Download className="h-3.5 w-3.5" /> Télécharger le PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={suppressionId !== null} onOpenChange={(v) => !v && setSuppressionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce brouillon ?</AlertDialogTitle>
            <AlertDialogDescription>
              « {suppression?.nom} » sera définitivement supprimé. Le dossier et le reçu officiel ne
              sont pas touchés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!suppressionId) return;
                try {
                  await supprimer(suppressionId);
                  setSuppressionId(null);
                } catch (err) {
                  setErreur(err instanceof Error ? err.message : String(err));
                }
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/**
 * Carte compacte pour la fiche dossier : compteur + accès à la page du reçu
 * (tout se passe là-bas : liste, aperçu, éditeur).
 */
export function CarteBrouillons({ dossierId }: { dossierId: string }) {
  const { brouillons, isLoading } = useBrouillons(dossierId);
  return (
    <Card className="panel">
      <CardContent className="flex flex-wrap items-center justify-between gap-2 py-4">
        <div className="text-sm">
          <span className="font-semibold text-foreground">
            Brouillons de reçu ({isLoading ? "…" : brouillons.length})
          </span>{" "}
          <span className="text-muted-foreground">
            — versions de travail enregistrées, le reçu officiel n'est jamais modifié.
          </span>
        </div>
        <Button size="sm" variant="outline" asChild>
          <Link to="/dossiers/$id/recu" params={{ id: dossierId }}>
            Ouvrir les reçus
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
