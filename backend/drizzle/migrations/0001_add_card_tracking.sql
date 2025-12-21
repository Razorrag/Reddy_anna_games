-- Migration: Add Card Tracking System for Real Stream Integration
-- Version: 0001
-- Date: 2025-12-19
-- Description: Adds game_cards table and enhances game_rounds with card sequence tracking

-- Create game_cards table for tracking each dealt card
CREATE TABLE IF NOT EXISTS game_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
    card VARCHAR(4) NOT NULL, -- Format: "KH" (King of Hearts), "AS" (Ace of Spades)
    side VARCHAR(6) NOT NULL CHECK (side IN ('andar', 'bahar')),
    position INTEGER NOT NULL, -- Sequence order (1st, 2nd, 3rd...)
    is_winning_card BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for game_cards
CREATE INDEX IF NOT EXISTS game_cards_game_id_idx ON game_cards(game_id);
CREATE INDEX IF NOT EXISTS game_cards_round_id_idx ON game_cards(round_id);
CREATE INDEX IF NOT EXISTS game_cards_position_idx ON game_cards(position);
CREATE INDEX IF NOT EXISTS game_cards_side_idx ON game_cards(side);
CREATE INDEX IF NOT EXISTS game_cards_winning_idx ON game_cards(is_winning_card) WHERE is_winning_card = true;

-- Add card sequence tracking columns to game_rounds
ALTER TABLE game_rounds 
ADD COLUMN IF NOT EXISTS current_card_position INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS expected_next_side VARCHAR(6) DEFAULT 'bahar' CHECK (expected_next_side IN ('andar', 'bahar')),
ADD COLUMN IF NOT EXISTS cards_dealt INTEGER NOT NULL DEFAULT 0;

-- Add comment documentation
COMMENT ON TABLE game_cards IS 'Tracks each card dealt during a game round from the live stream';
COMMENT ON COLUMN game_cards.card IS 'Card value in format: rank + suit (e.g., "KH", "10S", "AD")';
COMMENT ON COLUMN game_cards.side IS 'Which side the card was dealt to: andar or bahar';
COMMENT ON COLUMN game_cards.position IS 'Sequential position of card in the round (1, 2, 3...)';
COMMENT ON COLUMN game_cards.is_winning_card IS 'True if this card matched the opening card and won the round';

COMMENT ON COLUMN game_rounds.current_card_position IS 'Current position in card dealing sequence';
COMMENT ON COLUMN game_rounds.expected_next_side IS 'Which side should receive the next card (bahar or andar)';
COMMENT ON COLUMN game_rounds.cards_dealt IS 'Total number of cards dealt in this round';

-- Verify migration
DO $$
BEGIN
    -- Check if game_cards table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'game_cards') THEN
        RAISE EXCEPTION 'Migration failed: game_cards table not created';
    END IF;
    
    -- Check if columns were added
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'game_rounds' AND column_name = 'current_card_position'
    ) THEN
        RAISE EXCEPTION 'Migration failed: current_card_position column not added';
    END IF;
    
    RAISE NOTICE 'Migration 0001_add_card_tracking completed successfully';
END $$;