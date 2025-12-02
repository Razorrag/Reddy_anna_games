import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Gift,
  Lock,
  Unlock,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  IndianRupee,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserBonuses } from '@/hooks/queries/bonus/useUserBonuses';
import { useUnlockBonus } from '@/hooks/mutations/bonus/useUnlockBonus';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Bonuses() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { data: bonuses, isLoading } = useUserBonuses(user?.id || '');
  const unlockBonus = useUnlockBonus();

  const [selectedBonus, setSelectedBonus] = useState<string | null>(null);

  const handleUnlockBonus = async (bonusId: string) => {
    if (!user?.id) return;

    try {
      await unlockBonus.mutateAsync({
        userId: user.id,
        bonusId,
      });

      toast.success('Bonus unlocked and credited to main balance!');
      setSelectedBonus(null);
    } catch (error) {
      toast.error('Failed to unlock bonus');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </Badge>
        );
      case 'locked':
        return (
          <Badge variant="secondary" className="gap-1">
            <Lock className="w-3 h-3" />
            Locked
          </Badge>
        );
      case 'unlocked':
        return (
          <Badge variant="neon" className="gap-1">
            <Unlock className="w-3 h-3" />
            Unlocked
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive" className="gap-1">
            <Clock className="w-3 h-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      signup: <Badge variant="gold">Signup Bonus</Badge>,
      referral: <Badge variant="neon">Referral Bonus</Badge>,
      deposit: <Badge variant="success">Deposit Bonus</Badge>,
      loyalty: <Badge variant="gold">Loyalty Bonus</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge>{type}</Badge>;
  };

  const calculateProgress = (wagered: number, required: number) => {
    return Math.min((wagered / required) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading bonuses...</div>
      </div>
    );
  }

  const activeBonuses = bonuses?.filter((b) => b.status === 'active' || b.status === 'locked') || [];
  const completedBonuses = bonuses?.filter((b) => b.status === 'unlocked' || b.status === 'expired') || [];

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/user/wallet')}
              className="text-white hover:text-[#FFD700]"
            >
              ← Back
            </Button>
            <Gift className="w-8 h-8 text-[#FFD700]" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Bonuses</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-[#FFD700]/10 to-[#00F5FF]/10 border-[#FFD700]/30 p-6 mb-8">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-[#FFD700] flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">How Bonuses Work</h3>
                <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
                  <li>Bonuses are credited to your bonus balance</li>
                  <li>Complete wagering requirements to unlock bonuses</li>
                  <li>Wagering requirement: Total bets must equal bonus amount × multiplier</li>
                  <li>Once unlocked, bonus amount is transferred to main balance</li>
                  <li>Bonuses expire after the validity period</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Active Bonuses */}
        {activeBonuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FFD700]" />
              Active Bonuses
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeBonuses.map((bonus) => {
                const progress = calculateProgress(bonus.wageredAmount, bonus.wageringRequirement);
                const isUnlockable = bonus.status === 'locked' && progress >= 100;

                return (
                  <Card
                    key={bonus.id}
                    className={`bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-2 transition-all ${
                      isUnlockable
                        ? 'border-[#FFD700] shadow-lg shadow-[#FFD700]/20'
                        : 'border-[#FFD700]/30'
                    } p-6`}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          {getTypeBadge(bonus.type)}
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <IndianRupee className="w-5 h-5" />
                            {bonus.amount.toLocaleString('en-IN')}
                          </h3>
                        </div>
                        {getStatusBadge(bonus.status)}
                      </div>

                      {/* Description */}
                      {bonus.description && (
                        <p className="text-gray-400 text-sm">{bonus.description}</p>
                      )}

                      {/* Wagering Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Wagering Progress</span>
                          <span className="text-white font-semibold">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-[#0A0E27]/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className={`h-full ${
                              progress >= 100
                                ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500]'
                                : 'bg-gradient-to-r from-[#00F5FF] to-[#00D4E5]'
                            }`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>₹{bonus.wageredAmount.toLocaleString('en-IN')} wagered</span>
                          <span>₹{bonus.wageringRequirement.toLocaleString('en-IN')} required</span>
                        </div>
                      </div>

                      {/* Expiry Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Expires: {format(new Date(bonus.expiresAt), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      {/* Unlock Button */}
                      {isUnlockable && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button
                            variant="gold"
                            onClick={() => handleUnlockBonus(bonus.id)}
                            disabled={unlockBonus.isPending}
                            className="w-full gap-2"
                          >
                            <Unlock className="w-4 h-4" />
                            {unlockBonus.isPending ? 'Unlocking...' : 'Unlock Bonus'}
                          </Button>
                        </motion.div>
                      )}

                      {/* Keep Playing Message */}
                      {!isUnlockable && bonus.status === 'locked' && (
                        <div className="flex items-center gap-2 p-3 bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-[#00F5FF] flex-shrink-0" />
                          <p className="text-xs text-[#00F5FF]">
                            Wager ₹
                            {(bonus.wageringRequirement - bonus.wageredAmount).toLocaleString('en-IN')}{' '}
                            more to unlock
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Completed Bonuses */}
        {completedBonuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Completed Bonuses
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedBonuses.map((bonus) => (
                <Card
                  key={bonus.id}
                  className="bg-[#1a1f3a] border-[#FFD700]/20 p-6 opacity-75"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        {getTypeBadge(bonus.type)}
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <IndianRupee className="w-5 h-5" />
                          {bonus.amount.toLocaleString('en-IN')}
                        </h3>
                      </div>
                      {getStatusBadge(bonus.status)}
                    </div>

                    {bonus.description && (
                      <p className="text-gray-400 text-sm">{bonus.description}</p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Completed on</span>
                      <span className="text-white">
                        {format(new Date(bonus.unlockedAt || bonus.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* No Bonuses */}
        {!bonuses || bonuses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-12">
              <div className="text-center">
                <Gift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No bonuses yet</p>
                <p className="text-gray-500 text-sm mb-6">
                  Start playing or refer friends to earn bonuses
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="gold"
                    onClick={() => setLocation('/game')}
                    className="gap-2"
                  >
                    Start Playing
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLocation('/user/referrals')}
                    className="gap-2 border-[#FFD700]/30"
                  >
                    Refer Friends
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Summary Stats */}
        {bonuses && bonuses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FFD700]/10 rounded-lg">
                  <Gift className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Bonuses</p>
                  <p className="text-2xl font-bold text-white">{bonuses.length}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Unlocked</p>
                  <p className="text-2xl font-bold text-white">
                    {bonuses.filter((b) => b.status === 'unlocked').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#00F5FF]/10 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-[#00F5FF]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Earned</p>
                  <p className="text-2xl font-bold text-white flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {bonuses
                      .filter((b) => b.status === 'unlocked')
                      .reduce((sum, b) => sum + b.amount, 0)
                      .toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}