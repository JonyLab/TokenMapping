-- Run this once in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/_/sql/new

-- ── PROJECTS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own projects"
  ON public.projects
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── TOKEN MAPPINGS TABLE (per project) ───────────────────────
CREATE TABLE IF NOT EXISTS public.token_mappings (
  project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  levels     JSONB NOT NULL DEFAULT '[]',
  tokens     JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.token_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mappings"
  ON public.token_mappings
  FOR ALL
  USING  (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_id AND p.user_id = auth.uid()
  ));
