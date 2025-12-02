import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { usePartnerRegister } from '@/hooks/mutations/auth/usePartnerRegister';
import { toast } from 'sonner';

export default function PartnerSignupPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const partnerRegister = usePartnerRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    try {
      await partnerRegister.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      });
      toast.success('Partner account created successfully!');
      setLocation('/partner/dashboard');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const benefits = [
    'Earn up to 2.5% commission on all referrals',
    'Weekly automated payouts to your account',
    'Real-time dashboard to track earnings',
    'Dedicated partner support team',
    'Marketing materials and promotional tools',
    'Lifetime recurring commissions'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-royal-900 via-royal-800 to-royal-900 px-4 py-12">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center space-x-2 mb-4 cursor-pointer">
              <Sparkles className="h-10 w-10 text-gold-400" />
              <span className="text-3xl font-bold text-gold-400">Reddy Anna</span>
            </div>
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <TrendingUp className="h-6 w-6 text-gold-400" />
            <h1 className="text-2xl font-bold text-white">Become a Partner</h1>
          </div>
          <p className="text-royal-300">Join our partnership program and earn generous commissions</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Benefits Card */}
          <Card className="bg-royal-800/50 border-gold-500/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Partner Benefits</CardTitle>
              <CardDescription className="text-royal-300">
                Everything you get as a Reddy Anna partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-gold-400 flex-shrink-0 mt-0.5" />
                    <span className="text-royal-200">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 p-4 bg-gold-500/10 border border-gold-500/20 rounded-lg">
                <h3 className="text-gold-400 font-semibold mb-2">Commission Structure</h3>
                <p className="text-royal-300 text-sm">
                  Earn 2.5% commission on every bet placed by your referred players. 
                  For example, if your referrals bet ₹1,00,000, you earn ₹2,500!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <Card className="bg-royal-800/50 border-gold-500/20">
            <CardHeader>
              <CardTitle className="text-white">Create Partner Account</CardTitle>
              <CardDescription className="text-royal-300">
                Fill in your details to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-royal-900/50 border-gold-500/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 9999999999"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-royal-900/50 border-gold-500/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address (Optional)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-royal-900/50 border-gold-500/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-royal-900/50 border-gold-500/20 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="bg-royal-900/50 border-gold-500/20 text-white"
                    required
                  />
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                    className="border-gold-500/20 data-[state=checked]:bg-gold-500 mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-royal-300 text-sm leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms">
                      <span className="text-gold-400 hover:text-gold-300">Partner Terms & Conditions</span>
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy">
                      <span className="text-gold-400 hover:text-gold-300">Privacy Policy</span>
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-royal-900 font-semibold"
                  disabled={partnerRegister.isPending}
                >
                  {partnerRegister.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Partner Account'
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gold-500/20">
                  <p className="text-royal-400 text-sm mb-2">Already have a partner account?</p>
                  <Link href="/partner/login">
                    <Button variant="link" className="text-gold-400 hover:text-gold-300 p-0 h-auto">
                      Login to Dashboard →
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-royal-400 text-sm">
            Questions about the partner program?{' '}
            <Link href="/contact">
              <span className="text-gold-400 hover:text-gold-300 cursor-pointer">Contact us</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}