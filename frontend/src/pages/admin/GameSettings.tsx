import { useState, useEffect } from 'react';
import { Save, RotateCcw, Settings as SettingsIcon, DollarSign, Clock, Percent, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useGameSettingsQuery } from '@/hooks/queries/useGameSettingsQuery';
import { useUpdateGameSettingsMutation } from '@/hooks/mutations/useUpdateGameSettingsMutation';
import { toast } from 'sonner';

interface GameSettings {
  // Betting Limits
  min_bet_amount: number;
  max_bet_amount: number;
  max_total_bet_per_user: number;
  
  // Time Settings
  betting_duration: number;
  round_duration: number;
  break_between_rounds: number;
  
  // Commission & Payouts
  house_edge: number;
  partner_commission_rate: number;
  payout_multiplier: number;
  
  // Game Rules
  max_players_per_round: number;
  min_players_to_start: number;
  auto_start_enabled: boolean;
  
  // Stream Settings
  stream_url: string;
  loop_video_url: string;
  stream_enabled: boolean;
  
  // Features
  bonus_enabled: boolean;
  referral_enabled: boolean;
  maintenance_mode: boolean;
}

export default function GameSettings() {
  const { data: settings, isLoading } = useGameSettingsQuery();
  const updateMutation = useUpdateGameSettingsMutation();
  
  const [formData, setFormData] = useState<GameSettings>({
    min_bet_amount: 100,
    max_bet_amount: 100000,
    max_total_bet_per_user: 500000,
    betting_duration: 30,
    round_duration: 300,
    break_between_rounds: 10,
    house_edge: 2,
    partner_commission_rate: 2,
    payout_multiplier: 1.98,
    max_players_per_round: 1000,
    min_players_to_start: 1,
    auto_start_enabled: true,
    stream_url: '',
    loop_video_url: '',
    stream_enabled: true,
    bonus_enabled: true,
    referral_enabled: true,
    maintenance_mode: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: keyof GameSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData(settings);
      setHasChanges(false);
      toast.info('Changes reset to saved values');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Game Settings</h1>
            <p className="text-gray-400">Configure game parameters and rules</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="border-white/10 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Changes
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || updateMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>

        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4"
          >
            <div className="text-amber-400 font-medium">
              ⚠️ You have unsaved changes. Click "Save Settings" to apply them.
            </div>
          </motion.div>
        )}

        {/* Betting Limits */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Betting Limits</h3>
              <p className="text-sm text-gray-400">Configure minimum and maximum bet amounts</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Minimum Bet (₹)</label>
              <Input
                type="number"
                min="1"
                value={formData.min_bet_amount}
                onChange={(e) => handleChange('min_bet_amount', parseFloat(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum amount per bet</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Maximum Bet (₹)</label>
              <Input
                type="number"
                min="1"
                value={formData.max_bet_amount}
                onChange={(e) => handleChange('max_bet_amount', parseFloat(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum amount per bet</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Max Total Bet per User (₹)</label>
              <Input
                type="number"
                min="1"
                value={formData.max_total_bet_per_user}
                onChange={(e) => handleChange('max_total_bet_per_user', parseFloat(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum total bet per round</p>
            </div>
          </div>
        </div>

        {/* Time Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Time Settings</h3>
              <p className="text-sm text-gray-400">Configure round and betting durations</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Betting Duration (seconds)</label>
              <Input
                type="number"
                min="10"
                max="120"
                value={formData.betting_duration}
                onChange={(e) => handleChange('betting_duration', parseInt(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Time allowed for placing bets</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Round Duration (seconds)</label>
              <Input
                type="number"
                min="60"
                max="600"
                value={formData.round_duration}
                onChange={(e) => handleChange('round_duration', parseInt(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum time for entire round</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Break Between Rounds (seconds)</label>
              <Input
                type="number"
                min="5"
                max="60"
                value={formData.break_between_rounds}
                onChange={(e) => handleChange('break_between_rounds', parseInt(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Cooldown before next round</p>
            </div>
          </div>
        </div>

        {/* Commission & Payouts */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Percent className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Commission & Payouts</h3>
              <p className="text-sm text-gray-400">Configure house edge and commission rates</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">House Edge (%)</label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.house_edge}
                onChange={(e) => handleChange('house_edge', parseFloat(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Platform profit percentage</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Partner Commission (%)</label>
              <Input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.partner_commission_rate}
                onChange={(e) => handleChange('partner_commission_rate', parseFloat(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Commission paid to partners</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Payout Multiplier</label>
              <Input
                type="number"
                min="1"
                max="2"
                step="0.01"
                value={formData.payout_multiplier}
                onChange={(e) => handleChange('payout_multiplier', parseFloat(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Winning amount multiplier</p>
            </div>
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Game Rules</h3>
              <p className="text-sm text-gray-400">Configure player limits and game behavior</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Max Players per Round</label>
              <Input
                type="number"
                min="1"
                max="10000"
                value={formData.max_players_per_round}
                onChange={(e) => handleChange('max_players_per_round', parseInt(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum concurrent players</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Min Players to Start</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.min_players_to_start}
                onChange={(e) => handleChange('min_players_to_start', parseInt(e.target.value))}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum players required to start</p>
            </div>

            <div className="col-span-2">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <div className="text-white font-medium">Auto-Start Rounds</div>
                  <div className="text-sm text-gray-400">Automatically start new rounds</div>
                </div>
                <Switch
                  checked={formData.auto_start_enabled}
                  onCheckedChange={(checked) => handleChange('auto_start_enabled', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stream Settings */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Stream Settings</h3>
              <p className="text-sm text-gray-400">Configure video streaming URLs</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Live Stream URL</label>
              <Input
                type="url"
                placeholder="wss://stream.example.com/live"
                value={formData.stream_url}
                onChange={(e) => handleChange('stream_url', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">WebSocket URL for live stream</p>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Loop Video URL</label>
              <Input
                type="url"
                placeholder="https://cdn.example.com/loop.mp4"
                value={formData.loop_video_url}
                onChange={(e) => handleChange('loop_video_url', e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
              <p className="text-xs text-gray-500 mt-1">Video shown between rounds</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <div className="text-white font-medium">Enable Streaming</div>
                <div className="text-sm text-gray-400">Show live video to players</div>
              </div>
              <Switch
                checked={formData.stream_enabled}
                onCheckedChange={(checked) => handleChange('stream_enabled', checked)}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Feature Toggles</h3>
              <p className="text-sm text-gray-400">Enable or disable platform features</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <div className="text-white font-medium">Bonus System</div>
                <div className="text-sm text-gray-400">Enable signup and referral bonuses</div>
              </div>
              <Switch
                checked={formData.bonus_enabled}
                onCheckedChange={(checked) => handleChange('bonus_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <div className="text-white font-medium">Referral System</div>
                <div className="text-sm text-gray-400">Enable user referral program</div>
              </div>
              <Switch
                checked={formData.referral_enabled}
                onCheckedChange={(checked) => handleChange('referral_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div>
                <div className="text-white font-medium">Maintenance Mode</div>
                <div className="text-sm text-red-400">Disable all game operations</div>
              </div>
              <Switch
                checked={formData.maintenance_mode}
                onCheckedChange={(checked) => handleChange('maintenance_mode', checked)}
              />
            </div>
          </div>
        </div>

        {/* Save Button (Bottom) */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-6 flex justify-center"
          >
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              Save All Settings
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}