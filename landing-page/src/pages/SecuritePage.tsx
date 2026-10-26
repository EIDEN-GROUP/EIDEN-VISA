import { html as securiteHtml } from "./securite-content";
import { html as securiteHtmlAr } from "./securite-content-ar";
import { LegalPage } from "./LegalPage";

export function SecuritePage() {
  return (
    <LegalPage
      slug="securite"
      titre="Sécurité et protection des données"
      titreAr="الأمن وحماية البيانات"
      lead="Mesures de protection et signalement responsable"
      leadAr="تدابير الحماية والإبلاغ المسؤول"
      html={securiteHtml}
      htmlAr={securiteHtmlAr}
    />
  );
}
