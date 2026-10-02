// Sauvegarde d'une demande rapide dans Supabase (table landing_contacts).
// Appelé en arrière-plan à l'envoi : ne lève jamais, ne bloque jamais WhatsApp.
// En cas d'absence de config ou d'échec réseau/RLS, retourne false et le flux
// WhatsApp existant reste la source de vérité.
import { supabaseContacts } from "./supabase";

export type ContactPayload = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  typeVisa: string;
  depart: string;
  retour: string;
  destination: string;
  pack: string;
  ville: string;
  demandeurs: number;
  langue: string;
  message: string;
  pageUrl: string;
  userAgent: string;
};

/** Plafonds alignés sur les CHECK SQL (schema.sql) : refusés en 400 si dépassés. */
const MAX = {
  nom: 120,
  prenom: 120,
  email: 160,
  telephone: 120,
  typeVisa: 32,
  depart: 32,
  retour: 32,
  destination: 32,
  pack: 32,
  ville: 120,
  langue: 8,
  message: 4000,
  pageUrl: 2000,
  userAgent: 1000,
} as const;

const coupe = (v: string, n: number) => (v.length > n ? null : v);

export async function saveContact(payload: ContactPayload): Promise<boolean> {
  try {
    const db = supabaseContacts();
    if (!db) return false;
    const ligne = {
      nom: coupe(payload.nom, MAX.nom),
      prenom: coupe(payload.prenom, MAX.prenom),
      email: coupe(payload.email, MAX.email),
      telephone: coupe(payload.telephone, MAX.telephone),
      type_visa: coupe(payload.typeVisa, MAX.typeVisa),
      depart: coupe(payload.depart, MAX.depart),
      retour: coupe(payload.retour, MAX.retour),
      destination: coupe(payload.destination, MAX.destination),
      pack: coupe(payload.pack, MAX.pack),
      ville: coupe(payload.ville, MAX.ville),
      demandeurs:
        Number.isInteger(payload.demandeurs) && payload.demandeurs >= 1 && payload.demandeurs <= 20
          ? payload.demandeurs
          : null,
      langue: coupe(payload.langue, MAX.langue),
      message: coupe(payload.message, MAX.message),
      page_url: coupe(payload.pageUrl, MAX.pageUrl),
      user_agent: coupe(payload.userAgent, MAX.userAgent),
    };
    if (Object.values(ligne).some((v) => v === null)) return false;
    const { error } = await db.from("landing_contacts").insert(ligne);
    return !error;
  } catch {
    return false;
  }
}
