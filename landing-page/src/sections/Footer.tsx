import { Mail, Phone } from "lucide-react";
import { CONTACT } from "../content";
import { useLangue } from "../i18n";

/** Mini pied de page aux couleurs de la marque : logo, téléphone, e-mail, droits. */
export function Footer() {
  const { t } = useLangue();

  const liens = [
    {
      href: CONTACT.telephoneLien,
      label: t.footer.telephone,
      texte: CONTACT.telephone,
      Icone: Phone,
    },
    { href: `mailto:${CONTACT.email}`, label: t.footer.email, texte: CONTACT.email, Icone: Mail },
  ];

  return (
    <footer className="bg-brand text-white">
      {/* Marge de fin : les badges flottants (dock) occupent le coin bas, sur tous les écrans. */}
      <div className="container-page flex flex-col gap-5 py-2 pe-24 sm:pe-28 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <ul className="flex flex-col gap-3 text-[14.5px] font-semibold sm:flex-row sm:items-center sm:gap-8">
          {liens.map(({ href, label, texte, Icone }) => (
            <li key={href}>
              <a
                href={href}
                aria-label={`${label} : ${texte}`}
                className="group inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <span className="grid size-8 place-items-center rounded-full 5 transition-colors duration-300 group-hover:bg-white group-hover:text-brand">
                  <Icone className="size-4" strokeWidth={2} />
                </span>
                <span
                  dir="ltr"
                  className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1px]"
                >
                  {texte}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="text-[12.5px] text-white/75">
          © {new Date().getFullYear()} EIDEN Visa. {t.footer.droits}
        </p>
      </div>
    </footer>
  );
}
