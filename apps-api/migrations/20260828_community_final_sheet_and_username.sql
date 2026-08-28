BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(24);
ALTER TABLE users ADD COLUMN IF NOT EXISTS username_updated_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_uidx
  ON users (LOWER(username))
  WHERE username IS NOT NULL AND deleted_at IS NULL;

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS final_sheet_filename TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS final_sheet_mime_type VARCHAR(64);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS final_sheet_size_bytes BIGINT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS final_sheet_uploaded_at TIMESTAMPTZ;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS community_published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS assessments_community_public_idx
  ON assessments (community_published_at DESC)
  WHERE visibility = 'PUBLIC'
    AND deleted_at IS NULL
    AND final_sheet_filename IS NOT NULL;

COMMIT;
