-- Eiden Visa — table des demandes de la landing page (DemandeRapide).
-- À exécuter une fois dans Supabase : Dashboard > SQL Editor > New query.
-- Le navigateur insère avec la clé anon (INSERT seul) ; la lecture BMS passe
-- par la fonction serverless /api/contacts-feed (clé service_role, jamais exposée).

create table if not exists public.landing_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom text not null default '',
  prenom text not null default '',
  email text not null default '',
  telephone text not null default '',
  type_visa text not null default '',
  depart text not null default '',
  retour text not null default '',
  destination text not null default '',
  pack text not null default '',
  ville text not null default '',
  demandeurs integer not null default 1,
  langue text not null default 'fr',
  message text not null default '',
  page_url text not null default '',
  user_agent text not null default ''
);

alter table public.landing_contacts enable row level security;

-- Le navigateur (rôle anon) peut INSÉRER les demandes, rien d'autre :
-- pas de SELECT / UPDATE / DELETE pour anon (la lecture BMS utilise service_role).
drop policy if exists "anon_insert" on public.landing_contacts;
create policy "anon_insert"
  on public.landing_contacts
  for insert
  to anon
  with check (true);

create index if not exists landing_contacts_created_at_idx
  on public.landing_contacts (created_at desc);
