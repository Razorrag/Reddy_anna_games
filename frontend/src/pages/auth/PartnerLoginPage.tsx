import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { usePartnerLogin } from '@/hooks/mutations/auth/usePartnerLogin';
import { toast } from 'sonner';

export default function PartnerLoginPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const partnerLogin = usePartnerLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await partnerLogin.mutateAsync(formData);
      toast.success('Welcome back, Partner!');
      setLocation('/partner/dashboard');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-royal-900 via-royal-800 to-royal-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
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
            <h1 className="text-2xl font-bold text-white">Partner Login</h1>
          </div>
          <p className="text-royal-300">Access your partner dashboard</p>
        </div>

        {/* Login Form */}
        <Card className="bg-royal-800/50 border-gold-500/20">
          <CardHeader>
            <CardTitle className="text-white">Welcome Back, Partner!</CardTitle>
            <CardDescription className="text-royal-300">
              Login to manage your referrals and track commissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone Number</Label>
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
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-royal-900/50 border-gold-500/20 text-white"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-royal-900 font-semibold"
                disabled={partnerLogin.isPending}
              >
                {partnerLogin.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Login to Dashboard'
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 space-y-3">
              <div className="text-center">
                <Link href="/partner/forgot-password">
                  <Button variant="link" className="text-gold-400 hover:text-gold-300 p-0 h-auto">
                    Forgot Password?
                  </Button>
                </Link>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gold-500/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-royal-800/50 text-royal-400">New Partner?</span>
                </div>
              </div>

              <Link href="/partner/register">
                <Button 
                  variant="outline" 
                  className="w-full border-gold-500/50 text-gold-400 hover:bg-gold-500/10"
                >
                  Register as Partner
                </Button>
              </Link>

              <div className="text-center pt-4 border-t border-gold-500/20">
                <p className="text-royal-400 text-sm mb-2">Looking to play?</p>
                <Link href="/login">
                  <Button variant="link" className="text-gold-400 hover:text-gold-300 p-0 h-auto">
                    Player Login →
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Benefits */}
        <div className="mt-6 text-center">
          <p className="text-royal-400 text-sm">
            Partner benefits: High commissions • Weekly payouts • Dedicated support
          </p>
        </div>
      </div>
    </div>
  );
}