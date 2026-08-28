BEGIN;

CREATE TABLE IF NOT EXISTS generation_selection_history (
  id BIGSERIAL PRIMARY KEY,
  assessment_id UUID NOT NULL,
  selection_kind VARCHAR(32) NOT NULL,
  scope_key VARCHAR(128) NOT NULL,
  selected_id VARCHAR(255) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT generation_selection_history_kind_check
    CHECK (selection_kind IN ('MORPHOLOGY', 'VISUAL_SEED', 'BACKGROUND')),

  CONSTRAINT generation_selection_history_assessment_kind_unique
    UNIQUE (assessment_id, selection_kind)
);

CREATE INDEX IF NOT EXISTS idx_generation_selection_history_recent
  ON generation_selection_history (selection_kind, scope_key, id DESC);

CREATE INDEX IF NOT EXISTS idx_generation_selection_history_assessment
  ON generation_selection_history (assessment_id);

COMMIT;
