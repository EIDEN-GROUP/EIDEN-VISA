import { html as conditionsHtml } from "./conditions-content";
import { html as conditionsHtmlAr } from "./conditions-content-ar";
import { LegalPage } from "./LegalPage";

export function ConditionsPage() {
  return (
    <LegalPage
      slug="conditions"
      titre="Conditions d'utilisation"
      titreAr="شروط الاستخدام"
      lead="Accompagnement visa Schengen depuis le Maroc"
      leadAr="مواكبة إعداد طلبات تأشيرة شنغن من المغرب"
      html={conditionsHtml}
      htmlAr={conditionsHtmlAr}
    />
  );
}
