-- ============================================================
-- Montnexus CMS — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- BLOG POSTS TABLE
-- ============================================================
create table public.blog_posts (
  id               uuid          primary key default uuid_generate_v4(),
  title            text          not null,
  slug             text          not null unique,
  content          text          not null default '',
  excerpt          text          not null default '',
  cover_image_url  text,
  tags             text[]        not null default '{}',
  status           text          not null default 'draft'
                   check (status in ('draft', 'published', 'scheduled')),
  scheduled_at     timestamptz,
  meta_title       text,
  meta_description text,
  og_image_url     text,
  social_posts     jsonb         default '{}',
  views            int           not null default 0,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now()
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row
  execute procedure public.update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.blog_posts enable row level security;

-- Public users can only read published posts
create policy "Public read published posts"
  on public.blog_posts
  for select
  using (status = 'published');

-- Authenticated users (admin) have full access
create policy "Authenticated full access"
  on public.blog_posts
  for all
  using (auth.role() = 'authenticated');

-- ============================================================
-- VIEWS INCREMENT FUNCTION (called from BlogPost page)
-- ============================================================
create or replace function public.increment_views(post_slug text)
returns void as $$
begin
  update public.blog_posts
  set views = views + 1
  where slug = post_slug and status = 'published';
end;
$$ language plpgsql security definer;

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index blog_posts_slug_idx on public.blog_posts (slug);
create index blog_posts_status_idx on public.blog_posts (status);
create index blog_posts_created_at_idx on public.blog_posts (created_at desc);
create index blog_posts_scheduled_at_idx on public.blog_posts (scheduled_at)
  where status = 'scheduled';
