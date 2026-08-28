BEGIN;

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS evolution_reward_decided_at TIMESTAMPTZ;

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS evolution_seed_pdf_created_at TIMESTAMPTZ;

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS evolution_reward_revealed_at TIMESTAMPTZ;

-- Une évolution déjà accordée avant cette migration est considérée comme décidée.
-- Elle ne pourra donc pas faire l'objet d'un nouveau tirage.
UPDATE assessments
SET evolution_reward_decided_at = COALESCE(evolution_slot_unlocked_at, NOW()),
    evolution_reward_revealed_at = COALESCE(evolution_reward_revealed_at, evolution_slot_unlocked_at, NOW())
WHERE evolution_slot_unlocked = TRUE
  AND evolution_reward_decided_at IS NULL;

-- Les packages déjà lancés avant l'arrivée de cette règle ne sont pas retirés
-- au sort rétroactivement. La règle des 25 % s'applique aux prochains départs.
UPDATE assessments a
SET evolution_reward_decided_at = NOW()
WHERE a.evolution_reward_decided_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM generation_jobs gj
    WHERE gj.assessment_id = a.id
  );

UPDATE assessments a
SET evolution_reward_revealed_at = NOW()
WHERE a.evolution_slot_unlocked = TRUE
  AND a.evolution_reward_revealed_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM generation_jobs gj
    WHERE gj.assessment_id = a.id
  );

COMMIT;
