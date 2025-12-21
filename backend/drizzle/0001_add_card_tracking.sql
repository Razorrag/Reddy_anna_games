-- Migration: Add card tracking for real stream integration
-- Created: 2025-12-19

-- Create game_cards table to track real stream cards
CREATE TABLE IF NOT EXISTS "game_cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" uuid NOT NULL,
	"round_id" uuid NOT NULL,
	"card" varchar(4) NOT NULL,
	"side" varchar(6) NOT NULL,
	"position" integer NOT NULL,
	"is_winning_card" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Add indexes for game_cards
CREATE INDEX IF NOT EXISTS "game_cards_game_id_idx" ON "game_cards" ("game_id");
CREATE INDEX IF NOT EXISTS "game_cards_round_id_idx" ON "game_cards" ("round_id");
CREATE INDEX IF NOT EXISTS "game_cards_position_idx" ON "game_cards" ("position");

-- Add foreign keys for game_cards
ALTER TABLE "game_cards" ADD CONSTRAINT "game_cards_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "game_cards" ADD CONSTRAINT "game_cards_round_id_game_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "game_rounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- Add card tracking fields to game_rounds
ALTER TABLE "game_rounds" ADD COLUMN IF NOT EXISTS "current_card_position" integer DEFAULT 0 NOT NULL;
ALTER TABLE "game_rounds" ADD COLUMN IF NOT EXISTS "expected_next_side" varchar(6) DEFAULT 'bahar';
ALTER TABLE "game_rounds" ADD COLUMN IF NOT EXISTS "cards_dealt" integer DEFAULT 0 NOT NULL;

-- Comments for documentation
COMMENT ON TABLE "game_cards" IS 'Tracks real stream cards dealt in each round for integrity';
COMMENT ON COLUMN "game_cards"."card" IS 'Card format: rank+suit (e.g., KH, AS, 10D)';
COMMENT ON COLUMN "game_cards"."side" IS 'Which side the card was dealt to: andar or bahar';
COMMENT ON COLUMN "game_cards"."position" IS 'Sequential order of card dealing (1, 2, 3...)';
COMMENT ON COLUMN "game_rounds"."current_card_position" IS 'Current position in card sequence';
COMMENT ON COLUMN "game_rounds"."expected_next_side" IS 'Next expected side for card dealing validation';
COMMENT ON COLUMN "game_rounds"."cards_dealt" IS 'Total number of cards dealt in this round';