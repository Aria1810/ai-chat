-- Run once in Supabase SQL Editor before deploying the product upgrade.
alter table public.characters add column if not exists cover_url text;
alter table public.characters add column if not exists opening_message text;
alter table public.characters add column if not exists output_settings text;
alter table public.characters add column if not exists is_published boolean not null default true;
alter table public.users add column if not exists is_admin boolean not null default false;

create table if not exists public.user_personas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text, gender text, age text, background text, personality text, preferences text,
  updated_at timestamptz not null default now()
);
create table if not exists public.character_comments (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.characters(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create table if not exists public.model_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id uuid references public.characters(id) on delete set null,
  provider text not null, model text not null,
  input_tokens integer not null default 0, output_tokens integer not null default 0,
  cost_usd numeric(12, 8) not null default 0, created_at timestamptz not null default now()
);
create index if not exists character_comments_character_created_idx on public.character_comments(character_id, created_at desc);
create index if not exists model_usage_user_created_idx on public.model_usage(user_id, created_at desc);

alter table public.user_personas enable row level security;
alter table public.character_comments enable row level security;
alter table public.model_usage enable row level security;
create or replace function public.is_platform_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.users where auth_id = auth.uid() and is_admin = true) $$;
create policy "Users manage their own persona" on public.user_personas for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Anyone can read comments" on public.character_comments for select to authenticated using (true);
create policy "Users add their own comments" on public.character_comments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users or admins remove comments" on public.character_comments for delete to authenticated using ((select auth.uid()) = user_id or public.is_platform_admin());
create policy "Users view their own usage" on public.model_usage for select to authenticated using ((select auth.uid()) = user_id or public.is_platform_admin());

-- The chat route writes usage with SUPABASE_SERVICE_ROLE_KEY. Keep this key server-only;
-- do not expose it through NEXT_PUBLIC_* variables.

-- After your account has logged in, run once with its Auth user UUID:
-- update public.users set is_admin = true where auth_id = '<YOUR_AUTH_USER_UUID>';
