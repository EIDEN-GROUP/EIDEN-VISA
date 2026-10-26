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

/** Send contact data only to the same-origin server endpoint. */
export async function saveContact(payload: ContactPayload): Promise<boolean> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return response.ok;
  } catch {
    return false;
  }
}
