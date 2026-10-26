import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "../content";
import { useLangue } from "../i18n";
import { ouvrirPreferences } from "../lib/suivi";

const LIEN =
  "flex w-fit gap-2 rounded-sm transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const ICONE = "mt-0.5 size-3.5 shrink-0 text-eu-star";

export function Footer() {
  const { t } = useLangue();
  const I = t.infos;

  return (
    <footer className="bg-ink text-[12.5px] leading-[18px] font-medium text-white/85">
      <div className="container-page pt-5 pb-2.5 sm:pb-3.5">
        {/* Deux colonnes alignées en haut : locale/horaires à gauche, contact à droite. */}
        <div className="flex flex-col gap-3 sm:pe-4 lg:pe-6 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start xl:gap-x-6 xl:pe-0 min-[100rem]:pe-0">
          {/* Colonne gauche : localisation puis horaires */}
          <div className="flex flex-col gap-2">
            <a
              href={CONTACT.carte}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${I.adresse} : ${I.adresseComplete} (${I.carte})`}
              className={LIEN}
            >
              <MapPin aria-hidden="true" className={ICONE} />
              {I.adresseComplete}
            </a>
            <p className="flex gap-2">
              <Clock aria-hidden="true" className={ICONE} />
              <span className="sr-only">{`${I.horaires} : `}</span>
              <span className="flex flex-wrap items-center gap-x-2">
                <span>{I.horairesLignes[0]}</span>
                <span aria-hidden="true" className="hidden h-3 w-px bg-white/30 lg:block" />
                <span>{I.horairesLignes[1]}</span>
              </span>
            </p>
          </div>

          {/* Colonne droite : Instagram puis téléphone + email, alignés en haut */}
          <div className="flex flex-col gap-2 xl:items-end">
            <a
              href={CONTACT.instagramLien}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram : ${CONTACT.instagram}`}
              className={LIEN}
            >
              <svg
                aria-hidden="true"
                className={`${ICONE} shrink-0`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
              <span>{CONTACT.instagram}</span>
            </a>
            <ul className="flex flex-row gap-7">
              <li>
                <a
                  href={CONTACT.telephoneLien}
                  aria-label={`${I.telephone} : ${CONTACT.telephone}`}
                  className={LIEN}
                >
                  <Phone aria-hidden="true" className={ICONE} />
                  <span dir="ltr">{CONTACT.telephone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  aria-label={`${I.email} : ${CONTACT.email}`}
                  className={LIEN}
                >
                  <Mail aria-hidden="true" className={ICONE} />
                  <span dir="ltr">{CONTACT.email}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <span aria-hidden="true" className="mt-2 block h-px bg-white/10 sm:mt-3.5" />
        {/* Pages légales + réouverture du bandeau cookies. */}
        <nav
          aria-label={t.footer.juridique}
          className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11.5px] text-white/65"
        >
        <a href="/conditions" className="transition-colors hover:text-white">
          {t.footer.conditions}
        </a>
        <a href="/confidentialite" className="transition-colors hover:text-white">
          {t.footer.confidentialite}
        </a>
        <a href="/cookies" className="transition-colors hover:text-white">
          {t.footer.cookies}
        </a>
        <a href="/securite" className="transition-colors hover:text-white">
          {t.footer.securite}
        </a>
          <button
            type="button"
            onClick={ouvrirPreferences}
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            {t.footer.gererCookies}
          </button>
        </nav>
        <p className="mt-2 pe-20 text-center text-[11px] leading-4 whitespace-nowrap text-white/55 sm:mt-2.5 sm:pe-0">
          © {new Date().getFullYear()} EIDEN Visa. {t.footer.droits}
        </p>
        {/* Rattache l'entité à son groupe : les moteurs identifient « EIDEN Visa »
            comme une marque du groupe EIDEN GROUP (et non comme un site orphelin). */}
        <p className="mt-1 text-center text-[11px] leading-4 text-white/45">
          {t.footer.groupe}{" "}
          <a
            href="https://www.eiden-group.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            EIDEN GROUP
          </a>
        </p>
      </div>
    </footer>
  );
}
