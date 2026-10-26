import nodemailer from "nodemailer";

declare const process: { env: Record<string, string | undefined> };

type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
};
type Payload = {
  nom: string; prenom: string; email: string; telephone: string;
  typeVisa: string; depart: string; retour: string; destination: string; pack: string; ville: string;
  demandeurs: number; langue: string; message: string; pageUrl: string; userAgent: string;
};

const LIMITS = { nom: 120, prenom: 120, email: 160, telephone: 120, typeVisa: 32, depart: 32, retour: 32, destination: 32, pack: 32, ville: 120, langue: 8, message: 4000, pageUrl: 2000, userAgent: 1000 };
const REQUIRED = ["nom", "prenom", "email", "telephone", "langue", "message", "pageUrl", "userAgent"] as const;
const requests = new Map<string, { minute: number; count: number }>();

function header(req: Req, key: string): string {
  const value = req.headers[key] ?? req.headers[key.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function validPayload(value: unknown): value is Payload {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  for (const [key, max] of Object.entries(LIMITS)) {
    if (typeof data[key] !== "string" || (data[key] as string).length > max) return false;
  }
  if (REQUIRED.some((key) => !(data[key] as string).trim())) return false;
  if (!Number.isInteger(data.demandeurs) || (data.demandeurs as number) < 1 || (data.demandeurs as number) > 20) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((data.email as string).trim());
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

function rateLimited(req: Req): boolean {
  const address = header(req, "x-forwarded-for").split(",")[0]?.trim() || header(req, "x-real-ip") || "unknown";
  const minute = Math.floor(Date.now() / 60_000);
  const state = requests.get(address);
  if (!state || state.minute !== minute) requests.set(address, { minute, count: 1 });
  else state.count += 1;
  if (requests.size > 5000) for (const [key, value] of requests) if (value.minute < minute - 1) requests.delete(key);
  return (requests.get(address)?.count ?? 0) > 5;
}

export default async function handler(req: Req, res: Res): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const origin = header(req, "origin");
  const host = header(req, "x-forwarded-host") || header(req, "host");
  if (origin && host) {
    try { if (new URL(origin).host !== host) { res.status(403).json({ error: "Forbidden" }); return; } }
    catch { res.status(403).json({ error: "Forbidden" }); return; }
  }
  if (rateLimited(req)) { res.status(429).json({ error: "Too many requests" }); return; }
  if (!validPayload(req.body)) { res.status(400).json({ error: "Invalid form data" }); return; }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_USER, SMTP_PASS } = process.env;
  const smtpHost = process.env.SMTP_HOST || "smtp.hostinger.com";
  const smtpPort = Number(process.env.SMTP_PORT || "465");
  const adminEmail = process.env.CONTACT_ADMIN_EMAIL;
  const fromEmail = process.env.SMTP_FROM || SMTP_USER;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SMTP_USER || !SMTP_PASS || !adminEmail || !fromEmail || ![465, 587].includes(smtpPort)) {
    res.status(503).json({ error: "Contact service unavailable" });
    return;
  }

  const payload = req.body;
  const name = `${payload.prenom.trim()} ${payload.nom.trim()}`;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(payload.email.trim());
  const safePhone = escapeHtml(payload.telephone.trim());
  const safeMessage = escapeHtml(payload.message.trim()).replace(/\r?\n/g, "<br>");
  const ligne = {
    nom: payload.nom.trim(), prenom: payload.prenom.trim(), email: payload.email.trim(), telephone: payload.telephone.trim(),
    type_visa: payload.typeVisa, depart: payload.depart, retour: payload.retour, destination: payload.destination,
    pack: payload.pack, ville: payload.ville, demandeurs: payload.demandeurs,
    langue: payload.langue, message: payload.message.trim(), page_url: payload.pageUrl, user_agent: payload.userAgent,
  };
  try {
    const database = await fetch(`${SUPABASE_URL}/rest/v1/landing_contacts`, {
      method: "POST",
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(ligne),
      signal: AbortSignal.timeout(8000),
    });
    if (!database.ok) { res.status(502).json({ error: "Contact could not be saved" }); return; }

    const transporter = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
    const french = payload.langue !== "ar";
    const isDossier = Boolean(payload.typeVisa || payload.destination || payload.pack);
    const label = isDossier ? (french ? "Nouvelle demande de dossier" : "طلب ملف جديد") : (french ? "Nouveau message de contact" : "رسالة تواصل جديدة");
    const subjectAdmin = `${label} - ${name.replace(/[\r\n]/g, " ")}`;
    const subjectUser = french
      ? (isDossier ? "Votre demande de dossier a bien été reçue | EIDEN Visa" : "Nous avons bien reçu votre message | EIDEN Visa")
      : (isDossier ? "تم استلام طلبكم | EIDEN Visa" : "تم استلام رسالتكم | EIDEN Visa");
    const bg = "#f4f1eb";
    const navy = "#0d1b2a";
    const red = "#a91b2b";
    const cardStyle = "width:100%;max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e7e2d9;border-radius:18px;overflow:hidden";
    const headerHtml = `<tr><td style="background:${navy};padding:28px 32px;border-bottom:4px solid ${red}"><div style="font:700 12px Arial,sans-serif;letter-spacing:2px;color:#e8c65a">EIDEN VISA · AGADIR</div><div style="font:700 24px Georgia,serif;color:#ffffff;margin-top:10px">${escapeHtml(label)}</div></td></tr>`;
    const footerHtml = `<tr><td style="padding:20px 32px;background:#faf9f6;color:#707780;font:12px/1.6 Arial,sans-serif">EIDEN Visa · Agadir Bay, Technopole 1, Agadir<br><a style="color:${red}" href="mailto:visa@eiden-group.com">visa@eiden-group.com</a></td></tr>`;
    const shell = (content: string, lang: string, direction: string) => `<!doctype html><html lang="${lang}" dir="${direction}"><body style="margin:0;background:${bg};padding:28px 12px;font-family:Arial,sans-serif;color:#263442"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;margin:0 auto"><tr><td><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${cardStyle}">${headerHtml}<tr><td style="padding:28px 32px">${content}</td></tr>${footerHtml}</table></td></tr></table></body></html>`;
    const row = (title: string, content: string) => `<tr><td style="padding:10px 0;border-bottom:1px solid #eee9e1;vertical-align:top;width:34%;font:700 13px Arial,sans-serif;color:#68727d">${escapeHtml(title)}</td><td style="padding:10px 0;border-bottom:1px solid #eee9e1;font:14px/1.6 Arial,sans-serif;color:#192735">${content}</td></tr>`;
    const rows = [
      row(french ? "Nom" : "الاسم", safeName),
      row(french ? "E-mail" : "البريد الإلكتروني", `<a style="color:${red}" href="mailto:${safeEmail}">${safeEmail}</a>`),
      row(french ? "Téléphone" : "الهاتف", safePhone),
      row(isDossier ? (french ? "Résumé de la demande" : "ملخص الطلب") : (french ? "Message" : "الرسالة"), safeMessage),
    ].join("");
    const bodyAdmin = shell(`<p style="margin:0 0 20px;font:15px/1.65 Arial,sans-serif">${french ? "Une demande vient d’être envoyée depuis le site." : "تم إرسال طلب جديد عبر الموقع."}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table><p style="margin:22px 0 0;font:13px Arial,sans-serif;color:#727b84">${french ? "Répondez directement à cet e-mail pour contacter le demandeur." : "للرد على صاحب الطلب، استخدموا زر الرد على هذا البريد."}</p>`, french ? "fr" : "ar", french ? "ltr" : "rtl");
    const userIntro = french
      ? (isDossier ? "Nous avons reçu votre demande de dossier. Notre équipe l’examinera et vous répondra dès que possible." : "Nous avons bien reçu votre message. Notre équipe vous répondra dès que possible.")
      : (isDossier ? "توصلنا بطلبكم لإعداد الملف. سيقوم فريقنا بمراجعته والرد عليكم في أقرب وقت ممكن." : "توصلنا برسالتكم. سيجيبكم فريقنا في أقرب وقت ممكن.");
    const bodyUser = shell(`<p style="margin:0 0 14px;font:16px/1.7 Arial,sans-serif">${french ? `Bonjour ${safeName},` : `مرحباً ${safeName}،`}</p><p style="margin:0 0 20px;font:15px/1.8 Arial,sans-serif">${userIntro}</p><div style="padding:16px 18px;border-radius:12px;background:#f8f6f1;border-left:3px solid ${red};font:14px/1.8 Arial,sans-serif;white-space:pre-line">${safeMessage}</div><p style="margin:22px 0 0;font:13px/1.7 Arial,sans-serif;color:#68727d">${french ? "Cet e-mail confirme uniquement la réception de votre demande ; il ne vaut pas acceptation d’une prestation." : "يؤكد هذا البريد استلام طلبكم فقط، ولا يعني قبول تقديم خدمة."}</p>`, french ? "fr" : "ar", french ? "ltr" : "rtl");
    const textAdmin = `${label}\n${name}\n${payload.email}\n${payload.telephone}\n\n${payload.message}`;
    const textUser = french ? `Bonjour ${name},\n\n${userIntro}\n\n${payload.message}\n\nEIDEN Visa · Agadir` : `مرحباً ${name}،\n\n${userIntro}\n\n${payload.message}\n\nEIDEN Visa · Agadir`;
    await Promise.all([
      transporter.sendMail({ from: fromEmail, to: adminEmail, replyTo: payload.email.trim(), subject: subjectAdmin, html: bodyAdmin, text: textAdmin }),
      transporter.sendMail({ from: fromEmail, to: payload.email.trim(), replyTo: adminEmail, subject: subjectUser, html: bodyUser, text: textUser }),
    ]);
    res.status(200).json({ ok: true });
  } catch {
    res.status(502).json({ error: "Contact delivery failed" });
  }
}
