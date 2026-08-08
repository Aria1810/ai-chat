-- Run once in Supabase SQL Editor before deploying the product upgrade.
alter table public.characters add column if not exists cover_url text;
alter table public.characters add column if not exists opening_message text;
alter table public.characters add column if not exists output_settings text;
alter table public.characters add column if not exists is_published boolean not null default true;
alter table public.characters add column if not exists chat_style text;
alter table public.characters add column if not exists author_intro_html text;
alter table public.characters add column if not exists default_cognition text;
alter table public.characters add column if not exists adversity_response text;
alter table public.characters add column if not exists author_note text;
alter table public.characters add column if not exists approval_status text not null default 'approved' check (approval_status in ('pending', 'approved', 'rejected'));
alter table public.messages add column if not exists conversation_id uuid;
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
create index if not exists messages_conversation_created_idx on public.messages(user_id, character_id, conversation_id, created_at);

alter table public.user_personas enable row level security;
alter table public.character_comments enable row level security;
alter table public.model_usage enable row level security;
alter table public.users enable row level security;
create or replace function public.is_platform_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.users where auth_id = auth.uid() and is_admin = true) $$;
drop policy if exists "Users manage their own persona" on public.user_personas;
drop policy if exists "Anyone can read comments" on public.character_comments;
drop policy if exists "Users add their own comments" on public.character_comments;
drop policy if exists "Users or admins remove comments" on public.character_comments;
drop policy if exists "Users view their own usage" on public.model_usage;
drop policy if exists "Users manage their own profile" on public.users;
create policy "Users manage their own persona" on public.user_personas for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Anyone can read comments" on public.character_comments for select to authenticated using (true);
create policy "Users add their own comments" on public.character_comments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users or admins remove comments" on public.character_comments for delete to authenticated using ((select auth.uid()) = user_id or public.is_platform_admin());
create policy "Users view their own usage" on public.model_usage for select to authenticated using ((select auth.uid()) = user_id or public.is_platform_admin());
create policy "Users manage their own profile" on public.users for all to authenticated using ((select auth.uid()) = auth_id) with check ((select auth.uid()) = auth_id);
drop policy if exists "Admins review characters" on public.characters;
create policy "Admins review characters" on public.characters for update to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());

-- Favorites / likes were originally created with RLS enabled but without policies.
-- Keep the relationship unique and accessible only to its owner.
create unique index if not exists favorites_user_character_unique on public.favorites(user_id, character_id);
create unique index if not exists likes_user_character_unique on public.likes(user_id, character_id);
drop policy if exists "Users manage their own favorites" on public.favorites;
drop policy if exists "Users manage their own likes" on public.likes;
create policy "Users manage their own favorites" on public.favorites for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage their own likes" on public.likes for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- The chat route writes usage with SUPABASE_SERVICE_ROLE_KEY. Keep this key server-only;
-- do not expose it through NEXT_PUBLIC_* variables.

-- After your account has logged in, run once with its Auth user UUID:
-- update public.users set is_admin = true where auth_id = '<YOUR_AUTH_USER_UUID>';
