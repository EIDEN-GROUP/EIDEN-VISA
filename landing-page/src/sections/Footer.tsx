import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "../content";
import { useLangue } from "../i18n";
import { oublierConsentement } from "../lib/suivi";

const LIEN =
  "flex w-fit gap-2 rounded-sm transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const ICONE = "mt-0.5 size-3.5 shrink-0 text-eu-star";

export function Footer() {
  const { t } = useLangue();
  const I = t.infos;

  return (
    <footer className="bg-ink text-[12.5px] leading-[18px] font-medium text-white/85">
      <div className="container-page pt-5 pb-2.5 sm:pb-3.5">
        <div className="sm:pe-[15.5rem] lg:pe-[15rem] xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end xl:gap-x-8 xl:pe-[4.5rem] min-[100rem]:pe-0">
          <a
            href={CONTACT.carte}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${I.adresse} : ${I.adresseComplete} (${I.carte})`}
            className={`${LIEN} xl:col-span-2`}
          >
            <MapPin aria-hidden="true" className={ICONE} />
            {I.adresseComplete}
          </a>

          <p className="mt-2 flex gap-2">
            <Clock aria-hidden="true" className={ICONE} />
            <span className="sr-only">{`${I.horaires} : `}</span>
            <span className="flex flex-wrap items-center gap-x-2">
              <span>{I.horairesLignes[0]}</span>
              <span aria-hidden="true" className="hidden h-3 w-px bg-white/30 lg:block" />
              <span>{I.horairesLignes[1]}</span>
            </span>
          </p>

          <ul className="mt-[60px] flex flex-col gap-0.5 sm:mt-1.5 sm:flex-row sm:flex-wrap sm:gap-x-7 sm:gap-y-1.5 xl:mt-0 xl:justify-self-end">
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

        <span aria-hidden="true" className="mt-2 block h-px bg-white/10 sm:mt-3.5" />
        {/* Pages légales statiques (`public/*.html`) + réouverture du bandeau cookies. */}
        <nav
          aria-label={t.footer.juridique}
          className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11.5px] text-white/65"
        >
          <a href="/conditions.html" className="transition-colors hover:text-white">
            {t.footer.conditions}
          </a>
          <a href="/confidentialite.html" className="transition-colors hover:text-white">
            {t.footer.confidentialite}
          </a>
          <a href="/cookies.html" className="transition-colors hover:text-white">
            {t.footer.cookies}
          </a>
          <a href="/securite.html" className="transition-colors hover:text-white">
            {t.footer.securite}
          </a>
          <button
            type="button"
            onClick={() => {
              oublierConsentement();
              window.location.reload();
            }}
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            {t.footer.gererCookies}
          </button>
        </nav>
        <p className="mt-2 pe-20 text-center text-[11px] leading-4 whitespace-nowrap text-white/55 sm:mt-2.5 sm:pe-0">
          © {new Date().getFullYear()} EIDEN Visa. {t.footer.droits}
        </p>
      </div>
    </footer>
  );
}
