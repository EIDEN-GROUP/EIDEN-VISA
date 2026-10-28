-- CRM pipeline stage on existing dossiers.
-- Safe to run more than once. Existing and newly inserted dossiers start in Lead.
BEGIN;

ALTER TABLE public.dossiers
  ADD COLUMN IF NOT EXISTS crm_stage text NOT NULL DEFAULT 'lead';

CREATE INDEX IF NOT EXISTS dossiers_crm_stage_created_at_idx
  ON public.dossiers (crm_stage, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'dossiers_crm_stage_check'
      AND conrelid = 'public.dossiers'::regclass
  ) THEN
    ALTER TABLE public.dossiers
      ADD CONSTRAINT dossiers_crm_stage_check
      CHECK (crm_stage IN (
        'lead', 'call_back', 'proposal', 'appointment',
        'follow_up', 'negotiation', 'won', 'lost'
      ));
  END IF;
END
$$;

COMMIT;
