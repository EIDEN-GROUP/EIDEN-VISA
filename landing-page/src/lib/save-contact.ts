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

export async function saveContact(payload: ContactPayload): Promise<boolean> {
  try {
    const db = supabaseContacts();
    if (!db) return false;
    const { error } = await db.from("landing_contacts").insert({
      nom: payload.nom,
      prenom: payload.prenom,
      email: payload.email,
      telephone: payload.telephone,
      type_visa: payload.typeVisa,
      depart: payload.depart,
      retour: payload.retour,
      destination: payload.destination,
      pack: payload.pack,
      ville: payload.ville,
      demandeurs: payload.demandeurs,
      langue: payload.langue,
      message: payload.message,
      page_url: payload.pageUrl,
      user_agent: payload.userAgent,
    });
    return !error;
  } catch {
    return false;
  }
}
