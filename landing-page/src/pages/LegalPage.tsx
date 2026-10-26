import { useEffect } from "react";
import { useLangue } from "../i18n";

interface LegalPageProps {
  slug?: string;
  titre: string;
  titreAr: string;
  lead?: string;
  leadAr?: string;
  html: string;
  htmlAr: string;
  derniereMiseAJour?: string;
}

function LegalPage({ slug, titre, titreAr, lead, leadAr, html, htmlAr, derniereMiseAJour = "26 octobre 2026" }: LegalPageProps) {
  const { langue } = useLangue();
  const estArabe = langue === "ar";
  const titreAffiche = estArabe ? titreAr : titre;
  const leadAffiche = estArabe ? leadAr : lead;
  const htmlAffiche = estArabe ? htmlAr : html;

  useEffect(() => {
    document.title = `${titreAffiche} | EIDEN Visa`;
  }, [titreAffiche]);

  return (
    <div className="legal-page" lang={langue} dir={estArabe ? "rtl" : "ltr"}>
      <header className="legal-page-header">
        <p className="legal-breadcrumb"><a href="/">{estArabe ? "الرئيسية" : "Accueil"}</a><span aria-hidden="true"> / </span>{titreAffiche}</p>
        <h1>{titreAffiche}</h1>
        {leadAffiche && <p className="legal-page-lead">{leadAffiche}</p>}
        <p className="legal-updated">{estArabe ? "آخر تحديث:" : "Dernière mise à jour :"} {estArabe ? "26 أكتوبر 2026" : derniereMiseAJour}</p>
      </header>
      <article className="legal-page-main" aria-label={titreAffiche} data-page={slug} dangerouslySetInnerHTML={{ __html: htmlAffiche }} />
    </div>
  );
}

export { LegalPage };
