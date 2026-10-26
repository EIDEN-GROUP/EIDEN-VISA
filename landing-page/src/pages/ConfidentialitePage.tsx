import { html as confidentialiteHtml } from "./confidentialite-content";
import { html as confidentialiteHtmlAr } from "./confidentialite-content-ar";
import { LegalPage } from "./LegalPage";

export function ConfidentialitePage() {
  return (
    <LegalPage
      slug="confidentialite"
      titre="Politique de confidentialité"
      titreAr="سياسة الخصوصية"
      lead="Vos données personnelles et vos droits - loi marocaine 09-08"
      leadAr="بياناتكم الشخصية وحقوقكم - القانون المغربي 09-08"
      html={confidentialiteHtml}
      htmlAr={confidentialiteHtmlAr}
    />
  );
}
