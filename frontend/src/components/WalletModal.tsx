/**
 * WalletModal - Complete Payment Flow
 * 
 * Full deposit/withdrawal system with:
 * - Payment request creation in database
 * - Payment details capture (UPI/Bank/Mobile)
 * - Admin WhatsApp integration
 * - Bonus calculation display
 */

import { X, Wallet, ArrowDownToLine, ArrowUpFromLine, Gift, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuthStore, useUserBalance } from "@/store/authStore";
import { api } from "@/lib/api";
import { getPaymentWhatsAppNumberAsync, createWhatsAppUrl } from "@/lib/whatsapp-helper";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { user } = useAuthStore();
  const { totalBalance } = useUserBalance();
  const [amount, setAmount] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [upiId, setUpiId] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [bonusInfo, setBonusInfo] = useState<{ depositBonus: number; referralBonus: number; totalBonus: number } | null>(null);

  // Get balance from store
  const displayBalance = totalBalance;

  // Fetch bonus info when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchBonusInfo();
    }
  }, [isOpen]);

  const fetchBonusInfo = async () => {
    try {
      const response = await api.get('/user/bonus-info');
      if (response.data?.success) {
        setBonusInfo(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bonus info:', error);
    }
  };

  if (!isOpen) return null;

  const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = async () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Validate payment details ONLY for withdrawal
      if (activeTab === 'withdraw') {
        if (paymentMethod === 'UPI' && !upiId.trim()) {
          alert('Please enter your UPI ID');
          setIsLoading(false);
          return;
        }
        if ((paymentMethod === 'PhonePe' || paymentMethod === 'GPay' || paymentMethod === 'Paytm') && !mobileNumber.trim()) {
          alert('Please enter your Mobile Number');
          setIsLoading(false);
          return;
        }
        if (paymentMethod === 'Bank Transfer' && (!accountNumber.trim() || !ifscCode.trim() || !accountName.trim())) {
          alert('Please fill in all bank details');
          setIsLoading(false);
          return;
        }
      }

      // Payment details based on method
      const paymentDetails: Record<string, string> = {};
      if (activeTab === 'withdraw') {
        if (paymentMethod === 'UPI') {
          paymentDetails.upiId = upiId;
        } else if (paymentMethod === 'PhonePe' || paymentMethod === 'GPay' || paymentMethod === 'Paytm') {
          paymentDetails.mobileNumber = mobileNumber;
        } else if (paymentMethod === 'Bank Transfer') {
          paymentDetails.accountNumber = accountNumber;
          paymentDetails.ifscCode = ifscCode;
          paymentDetails.accountName = accountName;
        }
      }

      // Create payment request
      const response = await api.post('/payment-requests', {
        amount: numAmount,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails,
        requestType: activeTab === 'deposit' ? 'deposit' : 'withdrawal'
      });

      if (response.data?.success) {
        // Fetch admin WhatsApp number
        const adminNumber = await getPaymentWhatsAppNumberAsync();
        
        if (!adminNumber) {
          alert('WhatsApp number not configured. Please contact support.');
          setIsLoading(false);
          return;
        }
        
        let whatsappMessage = '';
        
        if (activeTab === 'deposit') {
          whatsappMessage = `Hello! I want to deposit ₹${numAmount.toLocaleString('en-IN')} to my account.\n\nPayment Method: ${paymentMethod}`;
        } else {
          whatsappMessage = `Hello! I want to withdraw ₹${numAmount.toLocaleString('en-IN')}.\n\n`;
          whatsappMessage += `Payment Details:\n`;
          whatsappMessage += `Mode: ${paymentMethod}\n`;
          
          if (paymentMethod === 'UPI') {
            whatsappMessage += `UPI ID: ${upiId}\n`;
          } else if (paymentMethod === 'PhonePe' || paymentMethod === 'GPay' || paymentMethod === 'Paytm') {
            whatsappMessage += `Mobile: ${mobileNumber}\n`;
          } else if (paymentMethod === 'Bank Transfer') {
            whatsappMessage += `Account: ${accountNumber}\n`;
            whatsappMessage += `IFSC: ${ifscCode}\n`;
            whatsappMessage += `Name: ${accountName}\n`;
          }
          
          whatsappMessage += `\nRequest ID: ${response.data.requestId || 'N/A'}`;
        }
        
        const whatsappUrl = createWhatsAppUrl(adminNumber, whatsappMessage);
        
        // Show success message
        const successMessage = activeTab === 'deposit'
          ? `✅ Deposit request submitted!\n\n💰 Amount: ₹${numAmount.toLocaleString('en-IN')}\n🎁 You'll receive 5% bonus on approval!\n\nOpening WhatsApp to complete your request...`
          : `✅ Withdrawal request submitted!\n\n💰 Amount: ₹${numAmount.toLocaleString('en-IN')}\n⏳ Processing within 24 hours\n\nOpening WhatsApp to send payment details...`;
        
        alert(successMessage);
        
        // Open WhatsApp
        try {
          const opened = window.open(whatsappUrl, '_blank');
          if (!opened || opened.closed || typeof opened.closed === 'undefined') {
            window.location.href = whatsappUrl;
          }
        } catch {
          window.location.href = whatsappUrl;
        }
        
        // Clear form and close modal
        setAmount("");
        setUpiId('');
        setMobileNumber('');
        setAccountNumber('');
        setIfscCode('');
        setAccountName('');
        onClose();
      } else {
        alert(`Failed to submit ${activeTab} request: ${response.data?.error || 'Unknown error'}`);
      }
    } catch (error: unknown) {
      console.error(`${activeTab} request failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to submit ${activeTab} request: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-violet-900 via-blue-900 to-indigo-900 border border-[#FFD100]/30 rounded-xl max-w-md w-full shadow-2xl shadow-[#FFD100]/20 my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#FFD100]/30 bg-black/40">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-[#FFD100]" />
            <h2 className="text-2xl font-bold text-[#FFD100]">Wallet</h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="text-[#FFD100] hover:text-yellow-300 hover:bg-[#FFD100]/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Balance Display */}
        <div className="p-6 border-b border-[#FFD100]/30 bg-gradient-to-br from-[#FFD100]/10 to-transparent">
          <div className="text-center">
            <div className="text-sm text-white/60 mb-2">Current Balance</div>
            <div className="text-4xl font-bold text-[#FFD100]">
              ₹{displayBalance.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Bonus Information */}
        {bonusInfo && bonusInfo.totalBonus > 0 && (
          <div className="p-4 border-b border-[#FFD100]/30 bg-gradient-to-br from-green-500/10 to-blue-500/10">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
                  <Gift className="w-3 h-3" />
                  Deposit Bonus
                </div>
                <div className="text-lg font-bold text-green-400">
                  ₹{bonusInfo.depositBonus.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-white/60 mb-1">
                  <TrendingUp className="w-3 h-3" />
                  Referral Bonus
                </div>
                <div className="text-lg font-bold text-blue-400">
                  ₹{bonusInfo.referralBonus.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#FFD100]/30">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'deposit'
                ? 'bg-green-500/20 text-green-400 border-b-2 border-green-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-5 h-5" />
              Deposit
            </div>
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors ${
              activeTab === 'withdraw'
                ? 'bg-red-500/20 text-red-400 border-b-2 border-red-400'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUpFromLine className="w-5 h-5" />
              Withdraw
            </div>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm text-white/80 mb-2">Enter Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD100] font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-black/50 border border-[#FFD100]/30 rounded-lg pl-10 pr-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-[#FFD100]/60 transition-colors"
                  min="0"
                />
              </div>
              {activeTab === 'withdraw' && amount && parseInt(amount) > displayBalance && (
                <div className="text-red-400 text-sm mt-2">Insufficient balance</div>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <label className="block text-sm text-white/80 mb-3">Quick Select</label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    className="bg-[#FFD100]/10 hover:bg-[#FFD100]/20 border border-[#FFD100]/30 rounded-lg py-2 px-3 text-[#FFD100] font-semibold text-sm transition-colors"
                  >
                    ₹{(value / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm text-white/80 mb-2">
                {activeTab === 'deposit' ? 'Payment Method (How you will pay)' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-black/50 border border-[#FFD100]/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FFD100]/60 transition-colors"
              >
                <option value="UPI">UPI</option>
                <option value="PhonePe">PhonePe</option>
                <option value="GPay">Google Pay</option>
                <option value="Paytm">Paytm</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Payment Details (Withdrawal Only) */}
            {activeTab === 'withdraw' && (
              <div className="space-y-4 border border-[#FFD100]/20 rounded-lg p-4 bg-black/30">
                <div className="text-sm text-[#FFD100] font-semibold mb-3">Payment Details</div>
                
                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-sm text-white/80 mb-2">UPI ID *</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full bg-black/50 border border-[#FFD100]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD100]/60 transition-colors"
                    />
                  </div>
                )}

                {(paymentMethod === 'PhonePe' || paymentMethod === 'GPay' || paymentMethod === 'Paytm') && (
                  <div>
                    <label className="block text-sm text-white/80 mb-2">Mobile Number *</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full bg-black/50 border border-[#FFD100]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD100]/60 transition-colors"
                    />
                  </div>
                )}

                {paymentMethod === 'Bank Transfer' && (
                  <>
                    <div>
                      <label className="block text-sm text-white/80 mb-2">Account Number *</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="1234567890"
                        className="w-full bg-black/50 border border-[#FFD100]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD100]/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-2">IFSC Code *</label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="SBIN0001234"
                        className="w-full bg-black/50 border border-[#FFD100]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD100]/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/80 mb-2">Account Holder Name *</label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-black/50 border border-[#FFD100]/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#FFD100]/60 transition-colors"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !amount || parseInt(amount) <= 0 || (activeTab === 'withdraw' && parseInt(amount) > displayBalance)}
              className={`w-full py-6 text-lg font-bold rounded-lg transition-all ${
                activeTab === 'deposit'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  {activeTab === 'deposit' ? (
                    <>
                      <ArrowDownToLine className="w-5 h-5 mr-2" />
                      Request Deposit ₹{amount || '0'}
                    </>
                  ) : (
                    <>
                      <ArrowUpFromLine className="w-5 h-5 mr-2" />
                      Request Withdraw ₹{amount || '0'}
                    </>
                  )}
                </>
              )}
            </Button>

            {/* Info Text */}
            <div className="text-center text-xs text-white/50">
              {activeTab === 'deposit' 
                ? 'Deposits are instant and secure. You\'ll receive 5% bonus!'
                : 'Withdrawals are processed within 24 hours'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletModal;
