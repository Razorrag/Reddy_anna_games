import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  IndianRupee,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserWallet } from '@/hooks/queries/user/useUserWallet';
import { useRequestDeposit } from '@/hooks/mutations/payment/useRequestDeposit';
import { useRequestWithdrawal } from '@/hooks/mutations/payment/useRequestWithdrawal';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '+919876543210'; // System WhatsApp number
const MIN_DEPOSIT = 500;
const MIN_WITHDRAWAL = 1000;

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const { data: wallet, isLoading } = useUserWallet(user?.id || '');
  const requestDeposit = useRequestDeposit();
  const requestWithdrawal = useRequestWithdrawal();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  const quickAmounts = [500, 1000, 2500, 5000, 10000, 25000];

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(WHATSAPP_NUMBER);
    setCopiedWhatsApp(true);
    toast.success('WhatsApp number copied!');
    setTimeout(() => setCopiedWhatsApp(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I want to deposit ₹${depositAmount} to my gaming account.\nUser ID: ${user?.id}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleDepositRequest = async () => {
    if (!user?.id) return;

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount < MIN_DEPOSIT) {
      toast.error(`Minimum deposit amount is ₹${MIN_DEPOSIT}`);
      return;
    }

    try {
      await requestDeposit.mutateAsync({
        userId: user.id,
        amount,
        method: 'whatsapp',
      });

      toast.success('Deposit request submitted! Please contact us on WhatsApp.');
      setDepositAmount('');
      handleOpenWhatsApp();
    } catch (error) {
      toast.error('Failed to submit deposit request');
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!user?.id || !wallet) return;

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount < MIN_WITHDRAWAL) {
      toast.error(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL}`);
      return;
    }

    if (amount > wallet.mainBalance) {
      toast.error('Insufficient balance');
      return;
    }

    if (!upiId || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    try {
      await requestWithdrawal.mutateAsync({
        userId: user.id,
        amount,
        method: 'upi',
        upiId,
      });

      toast.success('Withdrawal request submitted! We will process it within 24 hours.');
      setWithdrawalAmount('');
      setUpiId('');
    } catch (error) {
      toast.error('Failed to submit withdrawal request');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Loading wallet...</div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-white">Wallet not found</div>
      </div>
    );
  }

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
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Wallet</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <WalletIcon className="w-8 h-8 text-[#0A0E27]" />
                <Badge variant="secondary" className="bg-[#0A0E27]/20">Main</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#0A0E27]/70 font-medium">Main Balance</p>
                <p className="text-3xl font-bold text-[#0A0E27] flex items-center gap-1">
                  <IndianRupee className="w-6 h-6" />
                  {wallet.mainBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-[#00F5FF] to-[#00D4E5] border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <Plus className="w-8 h-8 text-[#0A0E27]" />
                <Badge variant="secondary" className="bg-[#0A0E27]/20">Bonus</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-[#0A0E27]/70 font-medium">Bonus Balance</p>
                <p className="text-3xl font-bold text-[#0A0E27] flex items-center gap-1">
                  <IndianRupee className="w-6 h-6" />
                  {wallet.bonusBalance.toLocaleString('en-IN')}
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#1a1f3a] to-[#2a2f4a] border-[#FFD700]/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <WalletIcon className="w-8 h-8 text-white" />
                <Badge variant="secondary">Total</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-400 font-medium">Total Balance</p>
                <p className="text-3xl font-bold text-white flex items-center gap-1">
                  <IndianRupee className="w-6 h-6" />
                  {(wallet.mainBalance + wallet.bonusBalance).toLocaleString('en-IN')}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Deposit & Withdrawal Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1a1f3a]">
              <TabsTrigger value="deposit" className="gap-2">
                <ArrowDownLeft className="w-4 h-4" />
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdrawal" className="gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Withdrawal
              </TabsTrigger>
            </TabsList>

            {/* Deposit Tab */}
            <TabsContent value="deposit" className="space-y-6">
              <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Deposit Funds</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Add money to your wallet via WhatsApp. Minimum deposit: ₹{MIN_DEPOSIT}
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deposit-amount" className="text-white">Amount</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={`Min ₹${MIN_DEPOSIT}`}
                      className="mt-1"
                      min={MIN_DEPOSIT}
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div>
                    <Label className="text-white mb-2 block">Quick Amount</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {quickAmounts.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          onClick={() => setDepositAmount(amount.toString())}
                          className="border-[#FFD700]/30 hover:border-[#FFD700] hover:bg-[#FFD700]/10"
                        >
                          ₹{amount.toLocaleString('en-IN')}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* WhatsApp Instructions */}
                  <Card className="bg-[#2a2f4a] border-[#00F5FF]/30 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#00F5FF] flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm">
                        <p className="text-white font-medium">How to deposit:</p>
                        <ol className="text-gray-400 space-y-1 list-decimal list-inside">
                          <li>Click "Request Deposit" below</li>
                          <li>Contact us on WhatsApp</li>
                          <li>Make payment via UPI/Bank Transfer</li>
                          <li>Share payment screenshot on WhatsApp</li>
                          <li>Balance will be credited within 5 minutes</li>
                        </ol>
                      </div>
                    </div>
                  </Card>

                  <div className="flex gap-3">
                    <Button
                      variant="gold"
                      onClick={handleDepositRequest}
                      disabled={!depositAmount || parseFloat(depositAmount) < MIN_DEPOSIT || requestDeposit.isPending}
                      className="flex-1 gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {requestDeposit.isPending ? 'Processing...' : 'Request Deposit'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCopyWhatsApp}
                      className="gap-2 border-[#FFD700]/30 hover:border-[#FFD700]"
                    >
                      {copiedWhatsApp ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      {WHATSAPP_NUMBER}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Withdrawal Tab */}
            <TabsContent value="withdrawal" className="space-y-6">
              <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Withdraw Funds</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Withdraw from your main balance to UPI. Minimum: ₹{MIN_WITHDRAWAL}
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdrawal-amount" className="text-white">Amount</Label>
                    <div className="relative mt-1">
                      <Input
                        id="withdrawal-amount"
                        type="number"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        placeholder={`Min ₹${MIN_WITHDRAWAL}`}
                        max={wallet.mainBalance}
                        min={MIN_WITHDRAWAL}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWithdrawalAmount(wallet.mainBalance.toString())}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto py-1 text-[#FFD700] hover:text-[#FFD700]/80"
                      >
                        Max
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Available: ₹{wallet.mainBalance.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="upi-id" className="text-white">UPI ID</Label>
                    <Input
                      id="upi-id"
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="mt-1"
                    />
                  </div>

                  {/* Withdrawal Info */}
                  <Card className="bg-[#2a2f4a] border-[#00F5FF]/30 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#00F5FF] flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm">
                        <p className="text-white font-medium">Withdrawal Policy:</p>
                        <ul className="text-gray-400 space-y-1 list-disc list-inside">
                          <li>Processing time: Within 24 hours</li>
                          <li>Only main balance can be withdrawn</li>
                          <li>Bonus balance cannot be withdrawn directly</li>
                          <li>Complete wagering requirements to unlock bonuses</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Button
                    variant="gold"
                    onClick={handleWithdrawalRequest}
                    disabled={
                      !withdrawalAmount ||
                      !upiId ||
                      parseFloat(withdrawalAmount) < MIN_WITHDRAWAL ||
                      parseFloat(withdrawalAmount) > wallet.mainBalance ||
                      requestWithdrawal.isPending
                    }
                    className="w-full gap-2"
                  >
                    <Minus className="w-4 h-4" />
                    {requestWithdrawal.isPending ? 'Processing...' : 'Request Withdrawal'}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card
            className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 cursor-pointer hover:border-[#FFD700] transition-colors"
            onClick={() => setLocation('/user/transactions')}
          >
            <h4 className="text-lg font-semibold text-white mb-2">Transaction History</h4>
            <p className="text-gray-400 text-sm">View all deposits and withdrawals</p>
          </Card>

          <Card
            className="bg-[#1a1f3a] border-[#FFD700]/30 p-6 cursor-pointer hover:border-[#FFD700] transition-colors"
            onClick={() => setLocation('/user/bonuses')}
          >
            <h4 className="text-lg font-semibold text-white mb-2">Bonus Management</h4>
            <p className="text-gray-400 text-sm">Check your active bonuses</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}