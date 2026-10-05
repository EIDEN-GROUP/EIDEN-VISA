import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "../content";
import { useLangue } from "../i18n";

const LIEN =
  "inline-flex items-center gap-2 rounded-sm whitespace-nowrap transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const ICONE = "size-3.5 shrink-0 text-eu-star";

/**
 * Barre d'informations au-dessus du header (marine) : téléphone, e-mail, horaires, adresse.
 * Écrans larges : une ligne fixe. En dessous de 1280 px, tout ne tient pas : la ligne
 * défile en boucle (pause au survol et au focus). Repliée dès que la page défile.
 */
export function Topbar({ repliee }: { repliee: boolean }) {
  const { t } = useLangue();
  const I = t.infos;

  // `copie` : second exemplaire du défilement, purement visuel (hors tabulation).
  const elements = (copie = false) => {
    const tab = copie ? -1 : undefined;
    return {
      telephone: (
        <li key="telephone">
          <a
            href={CONTACT.telephoneLien}
            tabIndex={tab}
            aria-label={`${I.telephone} : ${CONTACT.telephone}`}
            className={LIEN}
          >
            <Phone aria-hidden="true" className={ICONE} />
            <span dir="ltr">{CONTACT.telephone}</span>
          </a>
        </li>
      ),
      email: (
        <li key="email">
          <a
            href={`mailto:${CONTACT.email}`}
            tabIndex={tab}
            aria-label={`${I.email} : ${CONTACT.email}`}
            className={LIEN}
          >
            <Mail aria-hidden="true" className={ICONE} />
            <span dir="ltr">{CONTACT.email}</span>
          </a>
        </li>
      ),
      horaires: (
        <li key="horaires" className="inline-flex items-center gap-2 whitespace-nowrap">
          <Clock aria-hidden="true" className={ICONE} />
          <span className="sr-only">{`${I.horaires} : `}</span>
          {I.horairesLignes[0]}
          <span aria-hidden="true" className="h-3 w-px bg-white/30" />
          {I.horairesLignes[1]}
        </li>
      ),
      adresse: (
        <li key="adresse">
          <a
            href={CONTACT.carte}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={tab}
            title={I.adresseComplete}
            aria-label={`${I.adresse} : ${I.adresseComplete} (${I.carte})`}
            className={LIEN}
          >
            <MapPin aria-hidden="true" className={ICONE} />
            {I.adresseCourte}
          </a>
        </li>
      ),
    };
  };
  const fixe = elements();

  return (
    <div
      inert={repliee}
      className={`grid bg-ink text-[12px] font-medium text-white/85 transition-[grid-template-rows] duration-500 ${
        repliee ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
      }`}
    >
      <div className="overflow-hidden">
        {/* Même retrait de début que la ligne du logo. */}
        <div className="container-page hidden h-[var(--topbar-h)] items-center justify-between gap-6 ps-[4.25rem] xl:flex">
          <ul aria-label={I.titre} className="flex items-center gap-6">
            {fixe.telephone}
            {fixe.email}
          </ul>
          <ul className="flex items-center gap-6">
            {fixe.horaires}
            {fixe.adresse}
          </ul>
        </div>

        <div className="topbar-defile flex h-[var(--topbar-h)] xl:hidden">
          {[false, true].map((copie) => (
            <ul
              key={String(copie)}
              aria-label={copie ? undefined : I.titre}
              aria-hidden={copie || undefined}
              className="topbar-piste flex min-w-full shrink-0 items-center justify-around gap-9 pe-9"
            >
              {Object.values(elements(copie))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
