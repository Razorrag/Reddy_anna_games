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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gold mb-2">Withdraw Funds</h1>
        <p className="text-gold/70">Request withdrawal to your bank or UPI</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gold/70 mb-1">Available Balance</p>
            <p className="text-4xl font-bold text-gold">₹{availableBalance.toFixed(2)}</p>
          </div>
          <Wallet className="w-16 h-16 text-gold/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdrawal Form */}
        <div className="lg:col-span-2 bg-royal-medium border border-gold/20 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-gold font-medium mb-2">
                Withdrawal Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-royal-dark border border-gold/30 rounded-lg px-4 py-3 pl-8 text-gold placeholder-gold/30 focus:outline-none focus:border-gold/50"
                  required
                />
              </div>
              <p className="text-gold/50 text-sm mt-2">
                Minimum: ₹500 | Available: ₹{availableBalance.toFixed(2)}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <p className="text-gold/70 text-sm mb-2">Quick Select</p>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    disabled={amt > availableBalance}
                    className="px-3 py-2 bg-royal-dark border border-gold/20 rounded-lg text-gold hover:border-gold/50 hover:bg-royal-dark/80 transition-all text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawal Method */}
            <div>
              <label className="block text-gold font-medium mb-3">
                Withdrawal Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWithdrawalMethod('upi')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    withdrawalMethod === 'upi'
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/20 hover:border-gold/40'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-gold mx-auto mb-2" />
                  <p className="text-gold font-medium">UPI</p>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalMethod('bank_transfer')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    withdrawalMethod === 'bank_transfer'
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/20 hover:border-gold/40'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-gold mx-auto mb-2" />
                  <p className="text-gold font-medium">Bank Transfer</p>
                </button>
              </div>
            </div>

            {/* UPI Details */}
            {withdrawalMethod === 'upi' && (
              <div>
                <label className="block text-gold font-medium mb-2">
                  Your UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full bg-royal-dark border border-gold/30 rounded-lg px-4 py-3 text-gold placeholder-gold/30 focus:outline-none focus:border-gold/50"
                  required
                />
              </div>
            )}

            {/* Bank Details */}
            {withdrawalMethod === 'bank_transfer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gold font-medium mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                    placeholder="Enter account holder name"
                    className="w-full bg-royal-dark border border-gold/30 rounded-lg px-4 py-3 text-gold placeholder-gold/30 focus:outline-none focus:border-gold/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gold font-medium mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    placeholder="Enter account number"
                    className="w-full bg-royal-dark border border-gold/30 rounded-lg px-4 py-3 text-gold placeholder-gold/30 focus:outline-none focus:border-gold/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gold font-medium mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="Enter IFSC code"
                    className="w-full bg-royal-dark border border-gold/30 rounded-lg px-4 py-3 text-gold placeholder-gold/30 focus:outline-none focus:border-gold/50"
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
                  <p className="text-gold font-medium">Important</p>
                  <ul className="text-gold/70 text-sm space-y-1">
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
              className="w-full py-4 bg-gradient-to-r from-gold to-gold/80 text-royal-dark rounded-xl font-bold text-lg hover:from-gold/90 hover:to-gold/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-5 h-5" />
              {createWithdrawal.isPending ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="bg-royal-medium border border-gold/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gold mb-4">Recent Withdrawals</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {withdrawals?.withdrawals?.length > 0 ? (
              withdrawals.withdrawals.map((withdrawal: any) => (
                <div
                  key={withdrawal.id}
                  className="p-4 bg-royal-dark/50 rounded-lg border border-gold/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(withdrawal.status)}
                      <span className={`text-sm px-2 py-1 rounded border ${getStatusColor(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </div>
                    <p className="text-gold font-bold">₹{withdrawal.amount}</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-gold/70">
                      Method: <span className="text-gold capitalize">{withdrawal.withdrawalMethod?.replace('_', ' ')}</span>
                    </p>
                    <p className="text-gold/50">
                      {new Date(withdrawal.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gold/50">
                <p>No withdrawal history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}