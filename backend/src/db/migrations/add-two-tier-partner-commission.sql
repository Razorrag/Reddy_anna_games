-- Migration: Add Two-Tier Partner Commission Structure
-- Date: 2024-12-01
-- Description: Upgrade partner system from simple 2% commission to two-tier structure (share_percentage × commission_rate)

-- Step 1: Add share_percentage column to partners table
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS share_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00;

COMMENT ON COLUMN partners.share_percentage IS 'Hidden multiplier applied to game profits (25-75%). Partner never sees this value.';

-- Step 2: Update commission_rate format (from 0.0200 to 10.00)
-- Convert existing 2% (0.0200) to new format 10.00
UPDATE partners 
SET commission_rate = 10.00 
WHERE commission_rate < 1.00;

-- If some partners already have the new format, keep them as is
COMMENT ON COLUMN partners.commission_rate IS 'Visible commission rate shown to partner (typically 10%). Applied to shown_profit.';

-- Step 3: Create partner_game_earnings table
CREATE TABLE IF NOT EXISTS partner_game_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_id UUID NOT NULL REFERENCES game_rounds(id) ON DELETE CASCADE,
  
  -- Real values (admin only - never exposed to partner)
  real_profit DECIMAL(12,2) NOT NULL,
  real_total_bets DECIMAL(12,2) NOT NULL,
  real_total_payouts DECIMAL(12,2) NOT NULL,
  
  -- Shown values (partner sees these - after share_percentage multiplier)
  shown_profit DECIMAL(12,2) NOT NULL,
  shown_total_bets DECIMAL(12,2) NOT NULL,
  shown_total_payouts DECIMAL(12,2) NOT NULL,
  
  -- Commission calculation snapshot
  share_percentage DECIMAL(5,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  earned_amount DECIMAL(10,2) NOT NULL,
  
  -- Metadata
  player_count INTEGER NOT NULL DEFAULT 0,
  status transaction_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT positive_real_profit CHECK (real_profit >= 0),
  CONSTRAINT positive_earned_amount CHECK (earned_amount >= 0)
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS partner_game_earnings_partner_id_idx ON partner_game_earnings(partner_id);
CREATE INDEX IF NOT EXISTS partner_game_earnings_round_id_idx ON partner_game_earnings(round_id);
CREATE INDEX IF NOT EXISTS partner_game_earnings_status_idx ON partner_game_earnings(status);
CREATE INDEX IF NOT EXISTS partner_game_earnings_created_at_idx ON partner_game_earnings(created_at DESC);

-- Step 5: Add comments for documentation
COMMENT ON TABLE partner_game_earnings IS 'Per-game commission tracking with two-tier calculation. Stores both real and shown values.';
COMMENT ON COLUMN partner_game_earnings.real_profit IS 'Actual house profit from game (admin only)';
COMMENT ON COLUMN partner_game_earnings.shown_profit IS 'Profit shown to partner = real_profit × share_percentage';
COMMENT ON COLUMN partner_game_earnings.earned_amount IS 'Partner commission = shown_profit × commission_rate';
COMMENT ON COLUMN partner_game_earnings.share_percentage IS 'Snapshot of partner share_percentage at time of game';
COMMENT ON COLUMN partner_game_earnings.commission_rate IS 'Snapshot of partner commission_rate at time of game';

-- Step 6: Create function to calculate partner commission automatically
CREATE OR REPLACE FUNCTION calculate_partner_commission_two_tier(
  p_partner_id UUID,
  p_round_id UUID,
  p_real_profit DECIMAL,
  p_real_bets DECIMAL,
  p_real_payouts DECIMAL,
  p_player_count INTEGER
) RETURNS UUID AS $$
DECLARE
  v_share_percentage DECIMAL(5,2);
  v_commission_rate DECIMAL(5,2);
  v_shown_profit DECIMAL(12,2);
  v_shown_bets DECIMAL(12,2);
  v_shown_payouts DECIMAL(12,2);
  v_earned_amount DECIMAL(10,2);
  v_game_id UUID;
  v_earning_id UUID;
BEGIN
  -- Get partner rates
  SELECT share_percentage, commission_rate 
  INTO v_share_percentage, v_commission_rate
  FROM partners 
  WHERE id = p_partner_id;
  
  -- Get game_id from round
  SELECT game_id INTO v_game_id FROM game_rounds WHERE id = p_round_id;
  
  -- Calculate shown values (apply share_percentage multiplier)
  v_shown_profit := p_real_profit * (v_share_percentage / 100.0);
  v_shown_bets := p_real_bets * (v_share_percentage / 100.0);
  v_shown_payouts := p_real_payouts * (v_share_percentage / 100.0);
  
  -- Calculate earned amount (apply commission_rate to shown_profit)
  v_earned_amount := v_shown_profit * (v_commission_rate / 100.0);
  
  -- Insert earning record
  INSERT INTO partner_game_earnings (
    partner_id, game_id, round_id,
    real_profit, real_total_bets, real_total_payouts,
    shown_profit, shown_total_bets, shown_total_payouts,
    share_percentage, commission_rate, earned_amount,
    player_count, status
  ) VALUES (
    p_partner_id, v_game_id, p_round_id,
    p_real_profit, p_real_bets, p_real_payouts,
    v_shown_profit, v_shown_bets, v_shown_payouts,
    v_share_percentage, v_commission_rate, v_earned_amount,
    p_player_count, 'pending'
  ) RETURNING id INTO v_earning_id;
  
  -- Update partner totals
  UPDATE partners 
  SET 
    total_commission = total_commission + v_earned_amount,
    pending_commission = pending_commission + v_earned_amount,
    updated_at = NOW()
  WHERE id = p_partner_id;
  
  RETURN v_earning_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_partner_commission_two_tier IS 'Calculate and record partner commission using two-tier structure';

-- Step 7: Grant permissions (adjust role name as needed)
-- GRANT SELECT, INSERT ON partner_game_earnings TO your_app_user;
-- GRANT EXECUTE ON FUNCTION calculate_partner_commission_two_tier TO your_app_user;

-- Migration complete
-- Next steps:
-- 1. Update bet.service.ts to call this function after round completion
-- 2. Update partner.service.ts to fetch from partner_game_earnings
-- 3. Ensure partner APIs only expose shown_* values, never real_* values