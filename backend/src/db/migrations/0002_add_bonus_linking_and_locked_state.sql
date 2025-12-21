-- Migration: Add bonus linking and locked state support
-- This migration implements the legacy bonus system behavior where:
-- 1. Referral bonuses are created in a "locked" state
-- 2. Referral bonuses are linked to deposit bonuses
-- 3. Referral bonuses unlock when the linked deposit bonus completes wagering

-- Add 'locked' status to bonus_status enum
ALTER TYPE bonus_status ADD VALUE IF NOT EXISTS 'locked';

-- Add linked_bonus_id column to user_bonuses table
ALTER TABLE user_bonuses 
ADD COLUMN IF NOT EXISTS linked_bonus_id UUID;

-- Add index for linked_bonus_id for better query performance
CREATE INDEX IF NOT EXISTS user_bonuses_linked_bonus_idx 
ON user_bonuses(linked_bonus_id);

-- Add comment explaining the column
COMMENT ON COLUMN user_bonuses.linked_bonus_id IS 
'References the deposit bonus ID that this referral bonus is linked to. Referral bonuses are unlocked when their linked deposit bonus completes wagering.';

-- Update existing referral bonuses to be in 'locked' state if they were 'active'
-- This ensures consistency with the new system
UPDATE user_bonuses 
SET status = 'locked' 
WHERE bonus_type = 'referral' 
  AND status = 'active' 
  AND completed_at IS NULL;

-- Add a check constraint to ensure only referral bonuses can have linked_bonus_id
ALTER TABLE user_bonuses 
ADD CONSTRAINT check_linked_bonus_only_for_referral 
CHECK (
  (bonus_type = 'referral' AND linked_bonus_id IS NOT NULL) OR
  (bonus_type != 'referral' AND linked_bonus_id IS NULL)
);

-- Create a function to automatically unlock referral bonuses when deposit bonus completes
CREATE OR REPLACE FUNCTION unlock_linked_referral_bonuses()
RETURNS TRIGGER AS $$
BEGIN
  -- When a deposit bonus is completed, unlock all linked referral bonuses
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.bonus_type = 'deposit' THEN
    UPDATE user_bonuses
    SET status = 'active'
    WHERE linked_bonus_id = NEW.id
      AND bonus_type = 'referral'
      AND status = 'locked';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically unlock referral bonuses
DROP TRIGGER IF EXISTS trigger_unlock_referral_bonuses ON user_bonuses;
CREATE TRIGGER trigger_unlock_referral_bonuses
  AFTER UPDATE ON user_bonuses
  FOR EACH ROW
  EXECUTE FUNCTION unlock_linked_referral_bonuses();

-- Add comments for documentation
COMMENT ON FUNCTION unlock_linked_referral_bonuses() IS 
'Automatically unlocks (changes status from locked to active) referral bonuses when their linked deposit bonus completes wagering requirements.';

COMMENT ON TRIGGER trigger_unlock_referral_bonuses ON user_bonuses IS 
'Trigger that automatically unlocks referral bonuses when the deposit bonus they are linked to completes its wagering requirements.';