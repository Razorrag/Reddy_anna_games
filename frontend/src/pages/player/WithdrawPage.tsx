import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet, 
  ArrowUpRight, 
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const queryClient = useQueryClient();

  // Fetch user balance
  const { data: userData } = useQuery({
    queryKey: ['user-me'],
    queryFn: async () => {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    },
  });

  // Fetch withdrawal history
  const { data: withdrawals } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: async () => {
      const response = await fetch('/api/payments/withdrawals', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch withdrawals');
      return response.json();
    },
  });

  // Create withdrawal mutation
  const createWithdrawal = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/payments/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create withdrawal');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Withdrawal request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['user-me'] });
      // Reset form
      setAmount('');
      setUpiId('');
      setBankDetails({ accountName: '', accountNumber: '', ifscCode: '' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit withdrawal');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 500) {
      toast.error('Minimum withdrawal amount is ₹500');
      return;
    }

    const balance = parseFloat(userData?.user?.balance || '0');
    if (withdrawAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    const withdrawalData: any = {
      amount: withdrawAmount,
      withdrawalMethod,
    };

    if (withdrawalMethod === 'upi') {
      if (!upiId) {
        toast.error('Please enter your UPI ID');
        return;
      }
      withdrawalData.upiId = upiId;
    } else {
      if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
        toast.error('Please fill all bank details');
        return;
      }
      withdrawalData.bankAccountName = bankDetails.accountName;
      withdrawalData.bankAccountNumber = bankDetails.accountNumber;
      withdrawalData.bankIfscCode = bankDetails.ifscCode;
    }

    createWithdrawal.mutate(withdrawalData);
  };

  const availableBalance = parseFloat(userData?.user?.balance || '0');
  const quickAmounts = [500, 1000, 2000, 5000];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#FFD700] mb-2 uppercase tracking-wide drop-shadow-md">Withdraw Funds</h1>
          <p className="text-gray-300 text-lg">Request secure withdrawal to your bank or UPI</p>
        </div>
        
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-premium-gold via-[#FFD700] to-[#FFA500] rounded-2xl p-1 shadow-glow-gold transform hover:scale-105 transition-transform">
          <div className="bg-[#0A0E27]/90 rounded-xl p-6 flex items-center gap-6 backdrop-blur-sm">
            <div className="bg-[#FFD700]/20 p-3 rounded-full">
              <Wallet className="w-8 h-8 text-[#FFD700]" />
            </div>
            <div>
              <p className="text-[#FFD700]/80 text-sm font-bold uppercase tracking-wider mb-1">Available Balance</p>
              <p className="text-3xl font-black text-white">₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Amount Input */}
            <div>
              <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                Withdrawal Amount
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD700] text-xl font-bold">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-[#0A0E27]/80 border border-[#FFD700]/30 rounded-xl px-6 py-4 pl-10 text-xl text-white placeholder-[#FFD700]/30 focus:outline-none focus:border-[#FFD700] focus:shadow-glow-gold transition-all font-bold"
                  required
                />
              </div>
              <div className="flex justify-between mt-2 text-xs font-medium">
                <span className="text-[#FFD700]/60">Min: ₹500</span>
                <span className={`transition-colors ${availableBalance < parseFloat(amount || '0') ? 'text-red-400' : 'text-green-400'}`}>
                  Available: ₹{availableBalance.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <p className="text-[#FFD700]/70 text-sm mb-3 font-medium">Quick Select</p>
              <div className="grid grid-cols-4 gap-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    disabled={amt > availableBalance}
                    className="px-2 py-3 bg-[#0A0E27]/60 border border-[#FFD700]/20 rounded-xl text-[#FFD700] hover:bg-premium-gold hover:text-[#0A0E27] hover:border-[#FFD700] hover:shadow-glow-gold transition-all text-sm font-bold disabled:opacity-30 disabled:hover:bg-[#0A0E27]/60 disabled:hover:text-[#FFD700] disabled:cursor-not-allowed"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawal Method */}
            <div>
              <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                Withdrawal Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setWithdrawalMethod('upi')}
                  className={`p-6 border-2 rounded-2xl transition-all group relative overflow-hidden ${
                    withdrawalMethod === 'upi'
                      ? 'border-[#FFD700] bg-premium-gold shadow-glow-gold scale-[1.02]'
                      : 'border-[#FFD700]/20 bg-[#0A0E27]/40 hover:border-[#FFD700]/50'
                  }`}
                >
                  <div className={`relative z-10 flex flex-col items-center ${withdrawalMethod === 'upi' ? 'text-[#0A0E27]' : 'text-[#FFD700]'}`}>
                    <Smartphone className="w-8 h-8 mb-3" />
                    <p className="font-bold">UPI</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalMethod('bank_transfer')}
                  className={`p-6 border-2 rounded-2xl transition-all group relative overflow-hidden ${
                    withdrawalMethod === 'bank_transfer'
                      ? 'border-[#FFD700] bg-premium-gold shadow-glow-gold scale-[1.02]'
                      : 'border-[#FFD700]/20 bg-[#0A0E27]/40 hover:border-[#FFD700]/50'
                  }`}
                >
                  <div className={`relative z-10 flex flex-col items-center ${withdrawalMethod === 'bank_transfer' ? 'text-[#0A0E27]' : 'text-[#FFD700]'}`}>
                    <CreditCard className="w-8 h-8 mb-3" />
                    <p className="font-bold">Bank Transfer</p>
                  </div>
                </button>
              </div>
            </div>

            {/* UPI Details */}
            {withdrawalMethod === 'upi' && (
              <div className="animate-in fade-in slide-in-from-top-4">
                <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                  Your UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full bg-[#0A0E27]/80 border border-[#FFD700]/30 rounded-xl px-6 py-4 text-white placeholder-[#FFD700]/30 focus:outline-none focus:border-[#FFD700] focus:shadow-glow-gold transition-all"
                  required
                />
              </div>
            )}

            {/* Bank Details */}
            {withdrawalMethod === 'bank_transfer' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                <div>
                  <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                    placeholder="Enter account holder name"
                    className="w-full bg-[#0A0E27]/80 border border-[#FFD700]/30 rounded-xl px-6 py-4 text-white placeholder-[#FFD700]/30 focus:outline-none focus:border-[#FFD700] focus:shadow-glow-gold transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    className="w-full bg-[#0A0E27]/80 border border-[#FFD700]/30 rounded-xl px-6 py-4 text-white placeholder-[#FFD700]/30 focus:outline-none focus:border-[#FFD700] focus:shadow-glow-gold transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="Enter IFSC code"
                    className="w-full bg-[#0A0E27]/80 border border-[#FFD700]/30 rounded-xl px-6 py-4 text-white placeholder-[#FFD700]/30 focus:outline-none focus:border-[#FFD700] focus:shadow-glow-gold transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[#FFD700] font-bold">Important</p>
                  <ul className="text-[#FFD700]/70 text-sm space-y-1">
                    <li>• Withdrawals are processed within 24 hours</li>
                    <li>• Ensure your bank/UPI details are correct</li>
                    <li>• Amount will be deducted from your balance immediately</li>
                    <li>• Contact support if withdrawal is delayed</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Submit Button */}
            <button
              type="submit"
              disabled={createWithdrawal.isPending || availableBalance < 500}
              className="w-full py-5 bg-premium-gold text-[#0A0E27] rounded-xl font-black text-xl uppercase tracking-wide shadow-glow-gold hover:shadow-gold-glow-strong hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              <ArrowUpRight className="w-6 h-6" />
              {createWithdrawal.isPending ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 rounded-2xl p-6 shadow-xl h-fit">
          <h2 className="text-xl font-bold text-[#FFD700] mb-6 flex items-center gap-2 border-b border-[#FFD700]/10 pb-4">
            <Clock className="w-5 h-5" />
            Recent Withdrawals
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {withdrawals?.withdrawals?.length > 0 ? (
              withdrawals.withdrawals.map((withdrawal: any) => (
                <div
                  key={withdrawal.id}
                  className="p-4 bg-[#0A0E27]/60 rounded-xl border border-[#FFD700]/10 hover:border-[#FFD700]/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#0A0E27] p-1.5 rounded-lg">
                        {getStatusIcon(withdrawal.status)}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${getStatusColor(withdrawal.status).split(' ')[0]} bg-[#0A0E27]`}>
                        {withdrawal.status}
                      </span>
                    </div>
                    <p className="text-white font-bold text-lg">₹{withdrawal.amount}</p>
                  </div>
                  <div className="space-y-1 text-xs border-t border-white/5 pt-3 mt-3">
                    <p className="text-gray-400 flex justify-between">
                      <span>Method:</span>
                      <span className="text-[#FFD700] font-bold capitalize">{withdrawal.withdrawalMethod?.replace('_', ' ')}</span>
                    </p>
                    <p className="text-gray-500 flex justify-between">
                      <span>Date:</span>
                      <span>{new Date(withdrawal.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-[#0A0E27]/30 rounded-xl border border-dashed border-[#FFD700]/20">
                <Clock className="w-8 h-8 text-[#FFD700]/20 mx-auto mb-3" />
                <p className="text-[#FFD700]/40 font-medium">No withdrawal history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}