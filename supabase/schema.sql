-- =========================================================
-- CLUEGG — skema database Supabase
-- Jalankan sekali di Supabase: SQL Editor > New query > tempel > Run.
--
-- Prinsip:
--   * Data seminimal mungkin: nama detektif + progres belajar.
--     Email & kata sandi dikelola Supabase Auth (tabel auth.users),
--     kata sandi tidak pernah tersimpan dalam bentuk asli.
--   * Row Level Security (RLS): setiap pengguna HANYA bisa membaca
--     dan mengubah barisnya sendiri. Karena itu anon/publishable key
--     aman ditaruh di js/config.js.
-- =========================================================

-- ---------- Profil detektif ----------
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  detective_name text not null check (char_length(detective_name) between 2 and 30),
  created_at     timestamptz not null default now()
);

-- ---------- Progres per kasus ----------
create table if not exists public.progress (
  user_id        uuid not null references auth.users (id) on delete cascade,
  case_id        text not null check (case_id in ('parabola', 'gelombang', 'arsip')),
  clues          smallint[] not null default '{}',
  solved         boolean not null default false,
  misses         integer not null default 0 check (misses >= 0),
  opened_at      timestamptz,
  solved_at      timestamptz,
  updated_at     timestamptz not null default now(),
  primary key (user_id, case_id)
);

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

drop policy if exists "profil: baca milik sendiri"   on public.profiles;
drop policy if exists "profil: ubah milik sendiri"   on public.profiles;
drop policy if exists "progres: baca milik sendiri"  on public.progress;
drop policy if exists "progres: tambah milik sendiri" on public.progress;
drop policy if exists "progres: ubah milik sendiri"  on public.progress;
drop policy if exists "progres: hapus milik sendiri" on public.progress;

create policy "profil: baca milik sendiri" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profil: ubah milik sendiri" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "progres: baca milik sendiri" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "progres: tambah milik sendiri" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "progres: ubah milik sendiri" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "progres: hapus milik sendiri" on public.progress
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------- Profil dibuat otomatis saat mendaftar ----------
-- Nama detektif dikirim dari form daftar sebagai metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nama text := left(trim(coalesce(new.raw_user_meta_data ->> 'detective_name', '')), 30);
begin
  if char_length(nama) < 2 then
    nama := 'Detektif';
  end if;
  insert into public.profiles (id, detective_name) values (new.id, nama);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Hapus akun sendiri (dipakai tombol "Hapus akun" di dashboard) ----------
-- Menghapus baris di auth.users; profil & progres ikut terhapus (on delete cascade).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Belum masuk';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
