-- NHA Digital Cloud : à coller dans Supabase > SQL Editor > Run

create type app_role as enum ('pending', 'admin', 'teacher', 'student', 'seller');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  role app_role not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create function public.is_staff() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher'))
$$;

create policy "voir son profil ou admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "admin modifie les roles" on public.profiles for update using (public.is_admin());

-- Le tout premier compte créé devient administrateur, les suivants sont « pending »
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, new.email, new.raw_user_meta_data->>'full_name',
    case when (select count(*) from public.profiles) = 0 then 'admin'::app_role else 'pending'::app_role end
  );
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_fcfa integer not null default 0,
  published boolean not null default false,
  author uuid not null default auth.uid() references auth.users,
  created_at timestamptz not null default now()
);
alter table public.courses enable row level security;

create policy "lire cours" on public.courses for select to authenticated
  using (published or author = auth.uid() or public.is_admin());
create policy "creer cours" on public.courses for insert to authenticated with check (public.is_staff());
create policy "modifier cours" on public.courses for update to authenticated using (author = auth.uid() or public.is_admin());
create policy "supprimer cours" on public.courses for delete to authenticated using (author = auth.uid() or public.is_admin());
