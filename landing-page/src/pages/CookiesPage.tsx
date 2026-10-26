import { html as cookiesHtml } from "./cookies-content";
import { html as cookiesHtmlAr } from "./cookies-content-ar";
import { LegalPage } from "./LegalPage";

export function CookiesPage() {
  return (
    <LegalPage
      slug="cookies"
      titre="Politique des cookies"
      titreAr="سياسة ملفات تعريف الارتباط"
      lead="Vos choix de traceurs et la gestion de vos préférences"
      leadAr="اختياراتكم بشأن أدوات التتبع وإدارة تفضيلاتكم"
      html={cookiesHtml}
      htmlAr={cookiesHtmlAr}
    />
  );
}
