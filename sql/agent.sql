-- À exécuter dans l'éditeur SQL du projet Supabase choisi.
-- Table exclusivement accessible au backend via la clé service_role.
create table if not exists public.drcloud_social_state (
  id text primary key,
  token_ciphertext text,
  token_expires_at timestamptz,
  snapshot jsonb,
  strategy jsonb,
  last_run_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.drcloud_social_state enable row level security;
-- Ne créer AUCUNE politique autorisant anon / authenticated.
revoke all on public.drcloud_social_state from anon, authenticated;
