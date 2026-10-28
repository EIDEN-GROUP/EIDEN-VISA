import { useEffect } from "react";
import { useLangue } from "../i18n";
import { definirSeo } from "../lib/seo";

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

function LegalPage({
  slug,
  titre,
  titreAr,
  lead,
  leadAr,
  html,
  htmlAr,
  derniereMiseAJour = "26 octobre 2026",
}: LegalPageProps) {
  const { langue } = useLangue();
  const estArabe = langue === "ar";
  const titreAffiche = estArabe ? titreAr : titre;
  const leadAffiche = estArabe ? leadAr : lead;
  const htmlAffiche = estArabe ? htmlAr : html;

  useEffect(() => {
    const descriptions: Record<string, string> = {
      conditions:
        "Consultez les conditions des services d’accompagnement visa proposés par EIDEN Visa à Agadir, prestataire privé indépendant.",
      confidentialite:
        "Comment EIDEN Visa collecte, utilise, conserve et protège vos données personnelles conformément à la loi marocaine 09-08.",
      cookies:
        "Découvrez les cookies utilisés sur le site EIDEN Visa et gérez vos préférences de consentement à tout moment.",
      securite:
        "Mesures de sécurité du site EIDEN Visa et moyens de signaler une vulnérabilité ou une tentative d’usurpation.",
    };
    const descriptionsAr: Record<string, string> = {
      conditions:
        "اطلعوا على شروط خدمات مواكبة طلبات التأشيرة التي تقدمها EIDEN Visa، وهي جهة خاصة مستقلة في أكادير.",
      confidentialite:
        "تعرفوا على كيفية جمع EIDEN Visa لبياناتكم الشخصية واستخدامها وحفظها وحمايتها وفق القانون المغربي 09-08.",
      cookies:
        "تعرفوا على ملفات تعريف الارتباط المستخدمة في موقع EIDEN Visa وكيفية إدارة اختيارات الموافقة في أي وقت.",
      securite: "إجراءات أمان موقع EIDEN Visa وطريقة الإبلاغ عن ثغرة أمنية أو محاولة انتحال.",
    };
    definirSeo({
      titre: `${titreAffiche} | EIDEN Visa`,
      description:
        (estArabe ? descriptionsAr : descriptions)[slug ?? ""] ?? leadAffiche ?? titreAffiche,
      url: `/${slug ?? "conditions"}`,
    });
  }, [estArabe, leadAffiche, slug, titreAffiche]);

  return (
    <div className="legal-page" lang={langue} dir={estArabe ? "rtl" : "ltr"}>
      <header className="legal-page-header">
        <p className="legal-breadcrumb">
          <a href="/">{estArabe ? "الرئيسية" : "Accueil"}</a>
          <span aria-hidden="true"> / </span>
          {titreAffiche}
        </p>
        <h1>{titreAffiche}</h1>
        {leadAffiche && <p className="legal-page-lead">{leadAffiche}</p>}
        <p className="legal-updated">
          {estArabe ? "آخر تحديث:" : "Dernière mise à jour :"}{" "}
          {estArabe ? "26 أكتوبر 2026" : derniereMiseAJour}
        </p>
      </header>
      <article
        className="legal-page-main"
        aria-label={titreAffiche}
        data-page={slug}
        dangerouslySetInnerHTML={{ __html: htmlAffiche }}
      />
    </div>
  );
}

export { LegalPage };
