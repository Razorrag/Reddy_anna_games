import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  TrendingUp,
  Calendar,
  IndianRupee,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useUserReferrals } from '@/hooks/queries/referral/useUserReferrals';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { format } from 'date-fns';

const REFERRAL_BONUS = 100; // ₹100 per referral
const BASE_URL = window.location.origin;

export default function Referrals() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { data: referralData, isLoading } = useUserReferrals(user?.id || '');

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = user?.referralCode || '';
  const referralLink = `${BASE_URL}/signup?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    toast.success('Referral code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Reddy Anna Gaming',
          text: `Use my referral code ${referralCode} and get ₹${REFERRAL_BONUS} bonus!`,
          url: referralLink,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(
      `🎮 Join Reddy Anna Gaming and get ₹${REFERRAL_BONUS} bonus!\n\nUse my referral code: ${referralCode}\n\nSign up here: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading referral data...</div>
      </div>
    );
  }

  const referrals = referralData?.referrals || [];
  const stats = referralData?.stats || {
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
  };

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/game')}
              className="text-white hover:text-[#FFD700]"
            >
              ← Back
            </Button>
            <Users className="w-8 h-8 text-[#FFD700]" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Referral Program</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-0 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0A0E27]/20 rounded-lg">
                  <Users className="w-6 h-6 text-[#0A0E27]" />
                </div>
                <div>
                  <p className="text-sm text-[#0A0E27]/70 font-medium">Total Referrals</p>
                  <p className="text-3xl font-bold text-[#0A0E27]">{stats.totalReferrals}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-[#00F5FF] to-[#00D4E5] border-0 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#0A0E27]/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-[#0A0E27]" />
                </div>
                <div>
                  <p className="text-sm text-[#0A0E27]/70 font-medium">Active Users</p>
                  <p className="text-3xl font-bold text-[#0A0E27]">{stats.activeReferrals}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-[#FFD700]/30 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#FFD700]/10 rounded-lg">
                  <IndianRupee className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-sm text-gray-400 font-medium">Total Earnings</p>
                  <p className="text-3xl font-bold text-white flex items-center gap-1">
                    <IndianRupee className="w-6 h-6" />
                    {stats.totalEarnings.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Referral Code Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-[#FFD700]/30 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-6 h-6 text-[#FFD700]" />
              <h2 className="text-2xl font-bold text-white">Your Referral Code</h2>
            </div>

            <div className="space-y-6">
              {/* Referral Code */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Referral Code</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={referralCode}
                      readOnly
                      className="pr-12 text-xl font-bold text-center tracking-wider"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyCode}
                        className="h-auto p-2"
                      >
                        {copiedCode ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Referral Link</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input value={referralLink} readOnly className="pr-12" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        className="h-auto p-2"
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button variant="gold" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Link
                </Button>
                <Button
                  onClick={handleShareWhatsApp}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  Share on WhatsApp
                </Button>
              </div>

              {/* Info Box */}
              <Card className="bg-[#00F5FF]/10 border-[#00F5FF]/30 p-4">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-[#00F5FF] flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="text-white font-medium">How it works:</p>
                    <ul className="text-gray-400 space-y-1 list-disc list-inside">
                      <li>Share your referral code or link with friends</li>
                      <li>They sign up using your code</li>
                      <li>They get ₹{REFERRAL_BONUS} signup bonus</li>
                      <li>You get ₹{REFERRAL_BONUS} when they make their first deposit</li>
                      <li>Both bonuses are credited instantly</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </motion.div>

        {/* Referrals Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 overflow-hidden">
            <div className="p-6 border-b border-[#FFD700]/20">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FFD700]" />
                Your Referrals ({referrals.length})
              </h3>
            </div>

            {referrals.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-2">No referrals yet</p>
                <p className="text-gray-500 text-sm mb-6">
                  Start inviting friends to earn rewards
                </p>
                <Button variant="gold" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Your Code
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#FFD700]/20 hover:bg-[#2a2f4a]/50">
                      <TableHead className="text-[#FFD700]">Name</TableHead>
                      <TableHead className="text-[#FFD700]">Phone</TableHead>
                      <TableHead className="text-[#FFD700]">Status</TableHead>
                      <TableHead className="text-[#FFD700]">Joined Date</TableHead>
                      <TableHead className="text-[#FFD700]">Bonus Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral: any) => (
                      <TableRow
                        key={referral.id}
                        className="border-[#FFD700]/10 hover:bg-[#2a2f4a]/50"
                      >
                        <TableCell className="text-white font-medium">{referral.name}</TableCell>
                        <TableCell className="text-gray-400">{referral.phone}</TableCell>
                        <TableCell>
                          {referral.status === 'active' ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-400">
                          {format(new Date(referral.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {referral.bonusEarned ? (
                            <div className="flex items-center gap-1 text-green-500 font-semibold">
                              <IndianRupee className="w-4 h-4" />
                              {REFERRAL_BONUS.toLocaleString('en-IN')}
                            </div>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Earnings Breakdown */}
        {referrals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Earned Bonuses</span>
                  <span className="text-white font-semibold">
                    {referrals.filter((r: any) => r.bonusEarned).length} × ₹{REFERRAL_BONUS}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pending Bonuses</span>
                  <span className="text-white font-semibold">
                    {referrals.filter((r: any) => !r.bonusEarned).length} × ₹{REFERRAL_BONUS}
                  </span>
                </div>
                <div className="border-t border-[#FFD700]/20 pt-3 flex items-center justify-between">
                  <span className="text-white font-semibold">Total Earnings</span>
                  <span className="text-[#FFD700] font-bold text-xl flex items-center gap-1">
                    <IndianRupee className="w-5 h-5" />
                    {stats.totalEarnings.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Tips to Earn More</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700] mt-1">•</span>
                  <span>Share your code on social media platforms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700] mt-1">•</span>
                  <span>Invite friends and family to join</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700] mt-1">•</span>
                  <span>Encourage referred users to make their first deposit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FFD700] mt-1">•</span>
                  <span>The more they play, the more you both earn</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}