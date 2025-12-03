import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Wallet, 
  Upload, 
  Copy, 
  Check, 
  AlertCircle,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

export function DepositPage() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();

  // Fetch payment settings
  const { data: paymentSettings } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const response = await fetch('/api/payments/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  // Create deposit mutation
  const createDeposit = useMutation({
    mutationFn: async (data: {
      amount: number;
      paymentMethod: string;
      transactionId?: string;
      paymentScreenshot?: string;
    }) => {
      const response = await fetch('/api/payments/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create deposit');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Deposit request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      // Reset form
      setAmount('');
      setTransactionId('');
      setScreenshot(null);
      setScreenshotPreview('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit deposit');
    },
  });

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(paymentSettings?.upiId || '');
    setCopied(true);
    toast.success('UPI ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(paymentSettings?.whatsappNumber || '');
    toast.success('WhatsApp number copied');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount < (paymentSettings?.minDeposit || 100)) {
      toast.error(`Minimum deposit amount is ₹${paymentSettings?.minDeposit || 100}`);
      return;
    }

    if (depositAmount > (paymentSettings?.maxDeposit || 100000)) {
      toast.error(`Maximum deposit amount is ₹${paymentSettings?.maxDeposit || 100000}`);
      return;
    }

    // Convert screenshot to base64 if uploaded
    let screenshotBase64 = '';
    if (screenshot) {
      screenshotBase64 = screenshotPreview;
    }

    createDeposit.mutate({
      amount: depositAmount,
      paymentMethod,
      transactionId: transactionId || undefined,
      paymentScreenshot: screenshotBase64 || undefined,
    });
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gold mb-2">Add Funds</h1>
        <p className="text-gold/70">Deposit money to your wallet securely</p>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-gold font-medium">Important Information</p>
            <ul className="text-gold/70 text-sm space-y-1">
              <li>• Deposits are processed within 5-10 minutes</li>
              <li>• You will receive a 5% bonus on every deposit</li>
              <li>• First deposit earns your referrer a bonus too!</li>
              <li>• Always upload payment screenshot for faster approval</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deposit Form */}
        <div className="lg:col-span-2 bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Amount Input */}
            <div>
              <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                Deposit Amount
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
              <p className="text-[#FFD700]/60 text-xs mt-2 font-medium">
                Min: ₹{paymentSettings?.minDeposit || 100} | Max: ₹{paymentSettings?.maxDeposit || 100000}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <p className="text-[#FFD700]/70 text-sm mb-3 font-medium">Quick Select</p>
              <div className="grid grid-cols-5 gap-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt.toString())}
                    className="px-2 py-3 bg-[#0A0E27]/60 border border-[#FFD700]/20 rounded-xl text-[#FFD700] hover:bg-premium-gold hover:text-[#0A0E27] hover:border-[#FFD700] hover:shadow-glow-gold transition-all text-sm font-bold"
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-6 border-2 rounded-2xl transition-all group relative overflow-hidden ${
                    paymentMethod === 'upi'
                      ? 'border-[#FFD700] bg-premium-gold shadow-glow-gold scale-[1.02]'
                      : 'border-[#FFD700]/20 bg-[#0A0E27]/40 hover:border-[#FFD700]/50'
                  }`}
                >
                  <div className={`relative z-10 flex flex-col items-center ${paymentMethod === 'upi' ? 'text-[#0A0E27]' : 'text-[#FFD700]'}`}>
                    <Smartphone className="w-8 h-8 mb-3" />
                    <p className="font-bold">UPI</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-6 border-2 rounded-2xl transition-all group relative overflow-hidden ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-[#FFD700] bg-premium-gold shadow-glow-gold scale-[1.02]'
                      : 'border-[#FFD700]/20 bg-[#0A0E27]/40 hover:border-[#FFD700]/50'
                  }`}
                >
                   <div className={`relative z-10 flex flex-col items-center ${paymentMethod === 'bank_transfer' ? 'text-[#0A0E27]' : 'text-[#FFD700]'}`}>
                    <CreditCard className="w-8 h-8 mb-3" />
                    <p className="font-bold">Bank Transfer</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                Transaction ID (Optional)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter your transaction ID"
                className="w-full bg-[#0A0E27]/80 border border-[#FFD700]/30 rounded-xl px-6 py-4 text-white placeholder-[#FFD700]/30 focus:outline-none focus:border-[#FFD700] focus:shadow-glow-gold transition-all"
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-[#FFD700] font-bold mb-3 uppercase tracking-wide text-sm">
                Payment Screenshot
              </label>
              <div className="border-2 border-dashed border-[#FFD700]/30 rounded-2xl p-8 text-center hover:border-[#FFD700] hover:bg-[#FFD700]/5 transition-all cursor-pointer relative group">
                {screenshotPreview ? (
                  <div className="space-y-4">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="max-h-64 mx-auto rounded-xl shadow-lg border border-[#FFD700]/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshot(null);
                        setScreenshotPreview('');
                      }}
                      className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-bold"
                    >
                      Remove Screenshot
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block w-full h-full">
                    <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-[#FFD700]" />
                    </div>
                    <p className="text-[#FFD700] font-bold text-lg mb-2">Click to upload screenshot</p>
                    <p className="text-[#FFD700]/50 text-sm">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={createDeposit.isPending}
              className="w-full py-5 bg-premium-gold text-[#0A0E27] rounded-xl font-black text-xl uppercase tracking-wide shadow-glow-gold hover:shadow-gold-glow-strong hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {createDeposit.isPending ? 'Submitting...' : 'Submit Deposit Request'}
            </button>
          </form>
        </div>

        {/* Payment Instructions */}
        <div className="space-y-6">
          {/* UPI Details */}
          <div className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-[#FFD700] font-bold mb-6 flex items-center gap-3 text-lg border-b border-[#FFD700]/10 pb-4">
              <div className="p-2 rounded-lg bg-[#FFD700]/10">
                <Smartphone className="w-5 h-5" />
              </div>
              UPI Payment
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[#FFD700]/60 text-xs uppercase tracking-wider font-bold mb-2">UPI ID</p>
                <div className="flex items-center gap-3 bg-[#0A0E27]/80 rounded-xl p-4 border border-[#FFD700]/10 group hover:border-[#FFD700]/30 transition-colors">
                  <code className="text-white flex-1 text-sm break-all font-mono">
                    {paymentSettings?.upiId || 'Loading...'}
                  </code>
                  <button
                    onClick={handleCopyUPI}
                    className="p-2 hover:bg-[#FFD700]/10 rounded-lg transition-all text-[#FFD700]"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Details */}
          <div className="bg-[#1A1F3A]/60 backdrop-blur-md border border-[#FFD700]/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-[#FFD700] font-bold mb-6 flex items-center gap-3 text-lg border-b border-[#FFD700]/10 pb-4">
              <div className="p-2 rounded-lg bg-green-500/10">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              WhatsApp Support
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-[#0A0E27]/80 rounded-xl p-4 border border-[#FFD700]/10 group hover:border-[#FFD700]/30 transition-colors">
                <code className="text-white flex-1 text-sm break-all font-mono">
                  {paymentSettings?.whatsappNumber || 'Loading...'}
                </code>
                <button
                  onClick={handleCopyWhatsApp}
                  className="p-2 hover:bg-[#FFD700]/10 rounded-lg transition-all text-[#FFD700]"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[#FFD700]/60 text-xs font-medium text-center bg-[#FFD700]/5 py-2 rounded-lg">
                Send your payment screenshot here for instant approval
              </p>
            </div>
          </div>

          {/* Bonus Info */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="font-bold mb-2 flex items-center gap-2 text-lg">
              <span className="text-2xl">🎁</span> Deposit Bonus
            </h3>
            <p className="text-white/90 text-sm leading-relaxed font-medium">
              Get <span className="text-[#FFD700] font-bold text-base">5% bonus</span> on every deposit! 
              Plus, complete wagering to unlock it to your main balance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}