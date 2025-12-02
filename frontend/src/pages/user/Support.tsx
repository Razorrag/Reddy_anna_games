import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  MessageSquare,
  Send,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { useSubmitSupportTicket } from '@/hooks/mutations/support/useSubmitSupportTicket';
import { toast } from 'sonner';

const WHATSAPP_NUMBER = '+919876543210';
const SUPPORT_EMAIL = 'support@reddyanna.com';

const FAQ_ITEMS = [
  {
    question: 'How do I deposit money?',
    answer: 'Go to Wallet > Deposit, enter amount, contact us on WhatsApp, make payment via UPI/Bank Transfer, and share screenshot. Balance credited within 5 minutes.',
  },
  {
    question: 'How long does withdrawal take?',
    answer: 'Withdrawals are processed within 24 hours. Ensure you have completed KYC verification and meet minimum withdrawal amount of ₹1,000.',
  },
  {
    question: 'What is wagering requirement?',
    answer: 'Wagering requirement is the total amount you need to bet to unlock bonus money. For example, ₹100 bonus with 10x wagering requires ₹1,000 in total bets.',
  },
  {
    question: 'How does referral bonus work?',
    answer: 'Share your referral code with friends. When they sign up and make their first deposit, you both get ₹100 bonus instantly.',
  },
  {
    question: 'Can I change my phone number?',
    answer: 'Phone number cannot be changed for security reasons. Contact support if you need assistance with account access.',
  },
  {
    question: 'How to verify my account?',
    answer: 'Go to Account Verification page, upload ID proof, address proof, and selfie. Verification is completed within 24-48 hours.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We support UPI, Bank Transfer, and all major payment apps via WhatsApp-based manual processing for security.',
  },
  {
    question: 'Are there any deposit/withdrawal fees?',
    answer: 'No fees for deposits or withdrawals. However, your payment provider may charge their own fees.',
  },
];

export default function Support() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const submitTicket = useSubmitSupportTicket();

  const [ticketForm, setTicketForm] = useState({
    subject: '',
    message: '',
  });
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = async () => {
    if (!user?.id) return;

    if (!ticketForm.subject || !ticketForm.message) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      await submitTicket.mutateAsync({
        userId: user.id,
        subject: ticketForm.subject,
        message: ticketForm.message,
      });

      toast.success('Support ticket submitted! We will respond within 24 hours.');
      setTicketForm({ subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to submit ticket');
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Hi, I need support.\nUser ID: ${user?.id}\nName: ${user?.name}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#2a2f4a] border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/game')}
              className="text-white hover:text-[#FFD700]"
            >
              ← Back
            </Button>
            <HelpCircle className="w-8 h-8 text-[#FFD700]" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Support & Help</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className="bg-gradient-to-br from-green-600 to-green-700 border-0 p-6 cursor-pointer hover:scale-105 transition-transform"
              onClick={handleWhatsAppContact}
            >
              <div className="flex items-center justify-between mb-4">
                <Phone className="w-8 h-8 text-white" />
                <ExternalLink className="w-5 h-5 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">WhatsApp Support</h3>
              <p className="text-white/80 text-sm mb-3">Get instant help via WhatsApp</p>
              <p className="text-white font-mono text-sm">{WHATSAPP_NUMBER}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card
              className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] border-0 p-6 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <Mail className="w-8 h-8 text-[#0A0E27]" />
                <ExternalLink className="w-5 h-5 text-[#0A0E27]/70" />
              </div>
              <h3 className="text-lg font-semibold text-[#0A0E27] mb-2">Email Support</h3>
              <p className="text-[#0A0E27]/80 text-sm mb-3">Send us an email</p>
              <p className="text-[#0A0E27] font-mono text-sm break-all">{SUPPORT_EMAIL}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#00F5FF] to-[#00D4E5] border-0 p-6">
              <div className="flex items-center justify-between mb-4">
                <MessageSquare className="w-8 h-8 text-[#0A0E27]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0A0E27] mb-2">Support Ticket</h3>
              <p className="text-[#0A0E27]/80 text-sm mb-3">Submit a detailed ticket below</p>
              <p className="text-[#0A0E27] text-sm">Response within 24 hours</p>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h3>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQs..."
                  className="pl-10"
                />
              </div>

              {/* FAQ List */}
              <div className="space-y-3">
                {filteredFaqs.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No FAQs found</p>
                ) : (
                  filteredFaqs.map((faq, index) => (
                    <div
                      key={index}
                      className="bg-[#2a2f4a] rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-[#2a2f4a]/80 transition-colors"
                      >
                        <span className="text-white font-medium pr-4">{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#FFD700] flex-shrink-0" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </motion.div>

          {/* Support Ticket Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Submit Support Ticket</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-white">Subject</Label>
                  <Input
                    id="subject"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white">Message</Label>
                  <textarea
                    id="message"
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Describe your issue in detail..."
                    rows={8}
                    className="w-full mt-1 px-3 py-2 bg-[#2a2f4a] border border-[#FFD700]/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50"
                  />
                </div>

                <div className="bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-lg p-4">
                  <p className="text-[#00F5FF] text-sm">
                    💡 <strong>Tip:</strong> Include relevant details like transaction IDs, screenshots,
                    or error messages to help us resolve your issue faster.
                  </p>
                </div>

                <Button
                  variant="gold"
                  onClick={handleSubmitTicket}
                  disabled={!ticketForm.subject || !ticketForm.message || submitTicket.isPending}
                  className="w-full gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
                </Button>

                <p className="text-gray-400 text-xs text-center">
                  We typically respond within 24 hours. For urgent matters, contact us on WhatsApp.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-[#1a1f3a] border-[#FFD700]/30 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/user/transactions')}
                className="justify-start border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                View Transaction History
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/user/verification')}
                className="justify-start border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                Account Verification
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/user/settings')}
                className="justify-start border-[#FFD700]/30 hover:border-[#FFD700]"
              >
                Account Settings
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}