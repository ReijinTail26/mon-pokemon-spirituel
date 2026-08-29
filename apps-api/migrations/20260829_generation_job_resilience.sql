BEGIN;

ALTER TABLE generation_jobs
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS locked_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS heartbeat_at timestamp with time zone;

ALTER TABLE generation_jobs
  DROP CONSTRAINT IF EXISTS generation_jobs_attempt_count_check;

ALTER TABLE generation_jobs
  ADD CONSTRAINT generation_jobs_attempt_count_check
  CHECK (attempt_count >= 0 AND max_attempts >= 1 AND attempt_count <= max_attempts);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_claim
  ON generation_jobs (status, created_at)
  WHERE status = 'FINALIZING';

-- Les traitements qui étaient actifs avant cette migration ne doivent pas
-- être repris automatiquement après un incident mémoire.
UPDATE generation_jobs
SET
  status = 'FAILED',
  current_step = 'deliverables_interrupted',
  error_code = 'GENERATION_INTERRUPTED',
  error_message = 'Génération interrompue avant la mise en place du mécanisme de reprise sécurisé.',
  completed_at = NOW(),
  updated_at = NOW(),
  locked_at = NULL,
  heartbeat_at = NULL
WHERE status = 'FINALIZING';

COMMIT;
