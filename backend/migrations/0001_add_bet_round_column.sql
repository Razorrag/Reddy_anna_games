-- Migration: Add betRound column to bets table
-- This column tracks which round (1 or 2) each bet was placed in
-- Required for correct Round 2 Bahar payout calculation

-- Add the column (allow NULL temporarily for existing data)
ALTER TABLE bets 
ADD COLUMN bet_round INTEGER;

-- Update existing bets to have a default round of 1
-- (assumes existing bets without round info were placed in Round 1)
UPDATE bets 
SET bet_round = 1 
WHERE bet_round IS NULL;

-- Make the column NOT NULL now that all rows have values
ALTER TABLE bets 
ALTER COLUMN bet_round SET NOT NULL;

-- Add a check constraint to ensure round is 1 or 2 (or 3+ for future rounds)
ALTER TABLE bets 
ADD CONSTRAINT bet_round_check CHECK (bet_round >= 1 AND bet_round <= 3);

-- Create an index for faster queries filtering by bet_round
CREATE INDEX idx_bets_bet_round ON bets(bet_round);

-- Verify the migration
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bets' AND column_name = 'bet_round';