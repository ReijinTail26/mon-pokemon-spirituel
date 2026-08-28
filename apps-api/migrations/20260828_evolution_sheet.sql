BEGIN;

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS evolution_slot_unlocked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS evolution_slot_unlocked_at TIMESTAMPTZ;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS evolution_sheet_filename TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS evolution_sheet_mime_type VARCHAR(64);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS evolution_sheet_size_bytes BIGINT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS evolution_sheet_uploaded_at TIMESTAMPTZ;

COMMIT;
