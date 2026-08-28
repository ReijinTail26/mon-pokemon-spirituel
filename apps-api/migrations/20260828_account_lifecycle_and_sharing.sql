BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS public_share_token VARCHAR(96);

CREATE UNIQUE INDEX IF NOT EXISTS assessments_public_share_token_uidx
  ON assessments(public_share_token)
  WHERE public_share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS assessments_user_active_created_idx
  ON assessments(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS assessments_public_active_created_idx
  ON assessments(visibility, created_at DESC)
  WHERE deleted_at IS NULL;

COMMIT;
