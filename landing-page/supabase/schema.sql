-- Eiden Visa   table des demandes de la landing page (DemandeRapide).
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
-- pas de SELECT / UPDATE / DELETE pour anon (la lecture BMS utilise service_role
-- via /api/contacts-feed, jamais la clé anon).
drop policy if exists "anon_insert" on public.landing_contacts;
create policy "anon_insert"
  on public.landing_contacts
  for insert
  to anon
  with check (
    char_length(nom) <= 120
    and char_length(prenom) <= 120
    and char_length(email) <= 160
    and char_length(telephone) <= 120
    and char_length(type_visa) <= 32
    and char_length(depart) <= 32
    and char_length(retour) <= 32
    and char_length(destination) <= 32
    and char_length(pack) <= 32
    and char_length(ville) <= 120
    and char_length(langue) <= 8
    and char_length(message) <= 4000
    and char_length(page_url) <= 2000
    and char_length(user_agent) <= 1000
  );

-- Ceinture : même avec une autre politique future, anon ne lit/écrit que l'INSERT.
revoke all on public.landing_contacts from anon, public;
grant insert on public.landing_contacts to anon;

create index if not exists landing_contacts_created_at_idx
  on public.landing_contacts (created_at desc);

-- Rétention (13 mois) : à exécuter périodiquement avec service_role
-- (cron Supabase ou tâche planifiée), jamais avec la clé anon.
-- delete from public.landing_contacts where created_at < now() - interval '13 months';
