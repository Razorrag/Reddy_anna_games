import { useState } from 'react';
import { X, Send, DollarSign, CreditCard, MessageCircle, HelpCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPhone?: string;
  userId?: string;
}

type RequestType = 'withdrawal' | 'deposit' | 'support' | 'balance' | 'signup';

export function WhatsAppModal({ isOpen, onClose, userPhone, userId }: WhatsAppModalProps) {
  const [requestType, setRequestType] = useState<RequestType | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get WhatsApp number from environment
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '919876543210';

  if (!isOpen) return null;

  const getDefaultMessage = () => {
    const baseInfo = userId ? `\n\nUser ID: ${userId}` : '';
    const phoneInfo = userPhone ? `\nPhone: ${userPhone}` : '';
    
    switch (requestType) {
      case 'withdrawal':
        return `I would like to withdraw ₹${amount || '___'} from my account.${baseInfo}${phoneInfo}`;
      case 'deposit':
        return `I would like to deposit ₹${amount || '___'} to my account.${baseInfo}${phoneInfo}`;
      case 'balance':
        return `I would like to check my current balance.${baseInfo}${phoneInfo}`;
      case 'support':
        return `I need assistance with my account.${baseInfo}${phoneInfo}`;
      case 'signup':
        return 'I would like to create a new account to start playing.';
      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    if (!requestType) return;

    setIsSubmitting(true);

    try {
      const finalMessage = message || getDefaultMessage();
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
      
      // Open WhatsApp with pre-filled message
      window.open(whatsappUrl, '_blank');
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        resetForm();
      }, 500);
    } catch (error) {
      console.error('WhatsApp request error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRequestType(null);
    setAmount('');
    setMessage('');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const requestOptions = [
    {
      type: 'withdrawal' as RequestType,
      icon: DollarSign,
      title: 'Withdrawal Request',
      description: 'Withdraw money from your account',
      colorClass: 'hover:border-red-500 hover:bg-red-500/10',
      iconBg: 'bg-red-500/20 group-hover:bg-red-500',
      iconColor: 'text-red-400 group-hover:text-white',
    },
    {
      type: 'deposit' as RequestType,
      icon: CreditCard,
      title: 'Deposit Request',
      description: 'Add money to your account',
      colorClass: 'hover:border-green-500 hover:bg-green-500/10',
      iconBg: 'bg-green-500/20 group-hover:bg-green-500',
      iconColor: 'text-green-400 group-hover:text-white',
    },
    {
      type: 'balance' as RequestType,
      icon: MessageCircle,
      title: 'Balance Inquiry',
      description: 'Check your current balance',
      colorClass: 'hover:border-blue-500 hover:bg-blue-500/10',
      iconBg: 'bg-blue-500/20 group-hover:bg-blue-500',
      iconColor: 'text-blue-400 group-hover:text-white',
    },
    {
      type: 'support' as RequestType,
      icon: HelpCircle,
      title: 'Support Request',
      description: 'Get help with any issue',
      colorClass: 'hover:border-purple-500 hover:bg-purple-500/10',
      iconBg: 'bg-purple-500/20 group-hover:bg-purple-500',
      iconColor: 'text-purple-400 group-hover:text-white',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-[#1A1F3A] border-[#FFD700]/20 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="relative border-b border-[#FFD700]/20 p-6">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-[#FFD700]">Contact Admin</h2>
          <p className="text-gray-400 mt-1">Select a request type to send a message via WhatsApp</p>
        </div>

        <div className="p-6">
          {!requestType ? (
            // Request Type Selection
            <div className="space-y-3">
              {requestOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.type}
                    onClick={() => setRequestType(option.type)}
                    className={`w-full flex items-center gap-4 p-4 border-2 border-[#FFD700]/20 rounded-xl transition-all group ${option.colorClass}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${option.iconBg}`}>
                      <Icon className={`w-6 h-6 ${option.iconColor}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white">{option.title}</div>
                      <div className="text-sm text-gray-400">{option.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            // Request Form
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRequestType(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ← Back
                </Button>
                <span className="text-sm text-gray-400">
                  {requestType === 'withdrawal' && 'Withdrawal Request'}
                  {requestType === 'deposit' && 'Deposit Request'}
                  {requestType === 'balance' && 'Balance Inquiry'}
                  {requestType === 'support' && 'Support Request'}
                </span>
              </div>

              {(requestType === 'withdrawal' || requestType === 'deposit') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (₹) *
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0A0E27] border-[#FFD700]/30 text-white"
                    min="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: ₹100
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  placeholder={getDefaultMessage()}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full min-h-[100px] bg-[#0A0E27] border border-[#FFD700]/30 text-white rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                />
              </div>

              <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-3">
                <p className="text-sm text-[#FFD700]">
                  <strong>Note:</strong> This will open WhatsApp on your device with a pre-filled message to the admin.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || ((requestType === 'withdrawal' || requestType === 'deposit') && !amount)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  'Opening WhatsApp...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Open WhatsApp
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default WhatsAppModal;
