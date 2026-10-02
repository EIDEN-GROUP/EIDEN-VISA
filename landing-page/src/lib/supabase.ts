// Client Supabase (navigateur uniquement) pour la landing page.
// N'utilise que la clé ANON publique : la RLS n'autorise que l'INSERT,
// la lecture des demandes est impossible depuis le navigateur.
// Retourne null quand Supabase n'est pas configuré : l'envoi WhatsApp
// continue alors de fonctionner seul (dégradation gracieuse).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function supabaseContacts(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anon) {
    client = null;
    return client;
  }
  client = createClient(url, anon);
  return client;
}
