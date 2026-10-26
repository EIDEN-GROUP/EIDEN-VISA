import { useState, useEffect } from "react";
import { useLangue } from "../i18n";
import { CONTACT } from "../content";
import { saveContact } from "../lib/save-contact";

type Champs = { nom: string; prenom: string; email: string; telephone: string; message: string };

type ChampProps = {
  id: string;
  autocomplete: string;
  placeholder: string;
  libelle: string;
  valeur: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  requis?: boolean;
  estArabe: boolean;
};

function Champ(props: ChampProps) {
  return (
    <div>
      <label htmlFor={props.id} className="mb-1.5 block text-[13px] font-bold text-ink-soft">
        {props.libelle}
        {props.requis && <span className="ms-0.5 text-brand">*</span>}
      </label>
      <input
        id={props.id}
        name={props.id}
        type={props.type ?? "text"}
        dir={props.type === "email" || props.type === "tel" ? "ltr" : props.estArabe ? "rtl" : "ltr"}
        autoComplete={props.autocomplete}
        autoCapitalize={props.type === "email" ? "none" : undefined}
        spellCheck={props.type !== "email"}
        inputMode={props.type === "email" ? "email" : props.type === "tel" ? "tel" : undefined}
        maxLength={props.type === "email" ? 160 : 120}
        value={props.valeur}
        onChange={props.onChange}
        required={props.requis}
        placeholder={props.placeholder}
        className="contact-field h-12 w-full rounded-xl bg-card px-4 text-start text-[15px] text-ink ring-1 ring-line transition focus:outline-none focus:ring-2 focus:ring-brand/45"
      />
    </div>
  );
}

export function ContactPage() {
  const { langue, t } = useLangue();
  const estArabe = langue === "ar";
  const [form, setForm] = useState<Champs>({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    message: "",
  });
  const [etat, setEtat] = useState<"idle" | "envoi" | "ok" | "err">("idle");
  const maj = (c: keyof Champs) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [c]: e.target.value }));
  useEffect(() => {
    const url = "https://visa.eiden-group.com/images/optimized/contact-agadir-banniere.webp";
    const titre = langue === "ar" ? "تواصل معنا | EIDEN Visa" : "Contactez-nous | EIDEN Visa";
    document.title = titre;
    const description = langue === "ar"
      ? "تواصل مع EIDEN Visa في أكادير للاستفسار عن خدمات إعداد ومراجعة ملفات التأشيرة."
      : "Contactez EIDEN Visa à Agadir pour découvrir nos services de préparation et de vérification de dossier de visa.";
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", titre);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", titre);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
    const og = document.querySelector('meta[property="og:image"]');
    if (og) og.setAttribute("content", url);
    const tw = document.querySelector('meta[name="twitter:image"]');
    if (tw) tw.setAttribute("content", url);
  }, [langue]);
  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim() || !form.telephone.trim() || !form.message.trim())
      return;
    setEtat("envoi");
    try {
      const enregistre = await saveContact({
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim(),
        typeVisa: "",
        depart: "",
        retour: "",
        destination: "",
        pack: "",
        ville: "",
        demandeurs: 1,
        langue,
        message: form.message.trim(),
        pageUrl: window.location.href,
        userAgent: window.navigator.userAgent,
      });
      if (!enregistre) throw new Error("Contact submission failed");
      setEtat("ok");
      setForm({ nom: "", prenom: "", email: "", telephone: "", message: "" });
    } catch {
      setEtat("err");
    }
  };

  return (
    <div className="bg-cream font-sans text-ink">
      <main id="contenu" className="relative overflow-x-clip">
        <section className="relative isolate overflow-hidden bg-[#0d0c0e] text-white">
          <img
            src="/images/optimized/contact-agadir-banniere.webp"
            alt={estArabe ? "تواصل مع EIDEN Visa في أكادير" : "Contacter EIDEN Visa à Agadir"}
            className="absolute inset-0 w-full h-full object-cover -z-10 opacity-60"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[#0d0c0e]/55 -z-9" />
          <div className="container-page relative flex min-h-[320px] items-end pt-44 pb-14">
            <div className="max-w-[720px]">
              <p className="eyebrow text-white/90">EIDEN Visa · Agadir</p>
              <h1 className="mt-3 font-serif text-[clamp(2.2rem,3.8vw,3.4rem)] leading-tight">
                {estArabe ? "اتصل بنا" : "Contactez-nous"}
              </h1>
              <p className="mt-3 text-[16px] leading-1.6 text-white/85">
                {estArabe ? "أكادير باي · +212 777 777 428 · visa@eiden-group.com" : "Agadir Bay · +212 777 777 428 · visa@eiden-group.com"}
              </p>
            </div>
          </div>
        </section>

        <section className="contact-layout mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="contact-cards grid gap-4 lg:col-start-1 lg:row-start-1">
            <a href={CONTACT.telephoneLien} className="rounded-2xl border border-line bg-white p-7 transition-shadow hover:shadow-lg">
              <p className="eyebrow text-brand">{t.infos.telephone}</p>
              <p className="mt-3 font-serif text-xl text-ink" dir="ltr">{CONTACT.telephone}</p>
            </a>
            <a href={`mailto:${CONTACT.email}`} className="rounded-2xl border border-line bg-white p-7 transition-shadow hover:shadow-lg">
              <p className="eyebrow text-brand">{t.infos.email}</p>
              <p className="mt-3 font-serif text-xl text-ink">{CONTACT.email}</p>
            </a>
            <a href={CONTACT.carte} target="_blank" rel="noopener" className="rounded-2xl border border-line bg-white p-7 transition-shadow hover:shadow-lg">
              <p className="eyebrow text-brand">{t.infos.adresse}</p>
              <p className="mt-3 font-serif text-xl text-ink">{t.infos.adresseCourte}</p>
              <span className="mt-3 inline-block text-[13px] text-brand">{t.infos.carte} →</span>
            </a>
          </div>

          <form
            lang={langue}
            dir={estArabe ? "rtl" : "ltr"}
            onSubmit={soumettre}
            className="contact-form rounded-2xl border border-line bg-white p-6 shadow-soft md:p-8 lg:col-start-2 lg:row-start-1 lg:row-span-3"
          >
            <p className="eyebrow text-brand">
              {estArabe ? "أرسل لنا رسالة" : "Nous envoyer un message"}
            </p>
            <h2 className="mt-2 font-serif text-2xl text-ink">
              {estArabe ? "نموذج التواصل" : "Formulaire de contact"}
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Champ estArabe={estArabe} id="contact-nom" autocomplete="family-name" placeholder={estArabe ? "مثال: العلوي" : "Ex. : El Aloui"} libelle={estArabe ? "الاسم العائلي" : "Nom"} valeur={form.nom} onChange={maj("nom")} requis />
              <Champ estArabe={estArabe} id="contact-prenom" autocomplete="given-name" placeholder={estArabe ? "مثال: مريم" : "Ex. : Mariam"} libelle={estArabe ? "الاسم الشخصي" : "Prénom"} valeur={form.prenom} onChange={maj("prenom")} requis />
              <Champ estArabe={estArabe} id="contact-email" autocomplete="email" placeholder="nom@exemple.com" libelle={estArabe ? "البريد الإلكتروني" : "E-mail"} valeur={form.email} onChange={maj("email")} type="email" requis />
              <Champ estArabe={estArabe} id="contact-tel" autocomplete="tel" placeholder="+212 6 00 00 00 00" libelle={estArabe ? "رقم الهاتف" : "Téléphone"} valeur={form.telephone} onChange={maj("telephone")} type="tel" requis />
            </div>
            <div className="mt-4">
              <label htmlFor="contact-message" className="mb-1.5 block text-[13px] font-bold text-ink-soft">
                {estArabe ? "الرسالة" : "Message"} <span className="ms-0.5 text-brand">*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                dir={estArabe ? "rtl" : "ltr"}
                required
                rows={5}
                maxLength={4000}
                value={form.message}
                onChange={maj("message")}
                placeholder={estArabe ? "اكتبوا رسالتكم هنا..." : "Écrivez votre message ici..."}
                className="contact-field min-h-32 w-full resize-y rounded-xl bg-card px-4 py-3 text-start text-[15px] leading-relaxed text-ink ring-1 ring-line transition focus:outline-none focus:ring-2 focus:ring-brand/45"
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={etat === "envoi"}
                className="inline-flex items-center gap-2 rounded-full bg-[#0d0c0e] px-8 py-3 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {etat === "envoi" ? "…" : estArabe ? "إرسال الرسالة" : "Envoyer le message"}
              </button>
              {etat === "ok" && (
                <span className="text-[14px] font-medium text-brand">
                  {estArabe ? "تم إرسال رسالتك. سنتواصل معك قريباً." : "Message envoyé. Nous vous recontactons bientôt."}
                </span>
              )}
              {etat === "err" && (
                <span className="text-[14px] font-medium text-brand">
                  {estArabe ? "حدث خطأ أثناء الإرسال. يُرجى المحاولة مجدداً." : "Une erreur est survenue. Réessayez."}
                </span>
              )}
            </div>
            <p className="mt-4 text-[12.5px] text-ink/60">
              {estArabe ? "يمكنك أيضاً الاتصال بنا على +212 777 777 428 أو مراسلتنا عبر visa@eiden-group.com" : "Vous pouvez aussi nous appeler au +212 777 777 428 ou écrire à visa@eiden-group.com."}
            </p>
            <p className="mt-4 text-[12.5px] leading-relaxed text-ink/60">
              {estArabe
                ? <>بإرسال هذا النموذج، توافقون على معالجة بياناتكم للرد على طلبكم. راجعوا <a className="underline underline-offset-2" href="/confidentialite/">سياسة الخصوصية</a>.</>
                : <>En envoyant ce formulaire, vous acceptez le traitement de vos données pour répondre à votre demande. Consultez notre <a className="underline underline-offset-2" href="/confidentialite/">politique de confidentialité</a>.</>}
            </p>
          </form>

          <div className="contact-hours rounded-2xl border border-line bg-white p-6 lg:col-start-1 lg:row-start-2">
            <p className="eyebrow text-brand">{t.infos.horaires}</p>
            <ul className="mt-3 space-y-1 text-[15px] text-ink/80">
              {t.infos.horairesLignes.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
            <p className="mt-4 text-[14px] text-ink/60">{t.infos.adresseComplete}</p>
          </div>

        </section>
      </main>
    </div>
  );
}
