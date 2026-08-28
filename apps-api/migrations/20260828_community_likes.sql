BEGIN;

CREATE TABLE IF NOT EXISTS community_likes (
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (assessment_id, user_id)
);

CREATE INDEX IF NOT EXISTS community_likes_assessment_created_idx
  ON community_likes (assessment_id, created_at DESC);

COMMIT;
