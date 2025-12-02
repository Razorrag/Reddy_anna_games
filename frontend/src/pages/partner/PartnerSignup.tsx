import { useState, FormEvent } from 'react'
import { Link, useLocation } from 'wouter'
import { Eye, EyeOff, Crown, AlertCircle, CheckCircle2, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePartnerSignup } from '@/hooks/mutations/auth/usePartnerSignup'
import { useAuthStore } from '@/store/authStore'

export default function PartnerSignup() {
  const [, setLocation] = useLocation()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const signupMutation = usePartnerSignup()
  const { isAuthenticated } = useAuthStore()

  // Redirect if already logged in
  if (isAuthenticated) {
    setLocation('/partner/dashboard')
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!phone || !name || !password || !confirmPassword) {
      setError('All fields except email are required')
      return
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    if (name.length < 3) {
      setError('Name must be at least 3 characters')
      return
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!acceptedTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    try {
      await signupMutation.mutateAsync({
        phone,
        name,
        ...(email && { email }),
        password,
      })
      // Success - redirect handled by mutation
      setLocation('/partner/dashboard')
    } catch (err: any) {
      const message = err.message || 'Signup failed'
      
      if (message.toLowerCase().includes('phone')) {
        setError('📱 This phone number is already registered')
      } else if (message.toLowerCase().includes('email')) {
        setError('📧 This email is already in use')
      } else if (message.toLowerCase().includes('network')) {
        setError('🌐 Network error. Please check your connection.')
      } else {
        setError(message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#2a1f0a] to-[#0A0E27] flex items-center justify-center p-4 py-8">
      {/* Animated gold background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#FFD700]/15 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-[#FFA500]/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-20 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="w-full max-w-4xl bg-black/50 border-[#FFD700]/40 backdrop-blur-sm relative z-10 shadow-2xl shadow-[#FFD700]/10">
        <CardHeader className="text-center pb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#FFD700]/30 animate-pulse">
            <Crown className="w-12 h-12 text-[#0A0E27]" />
          </div>
          <CardTitle className="text-4xl font-bold text-[#FFD700] mb-2">
            Become a Partner
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            Join our partner program and earn <Badge variant="gold" className="inline-flex">2% Commission</Badge> on every bet
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#FFD700] font-semibold">
                  Mobile Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="bg-black/40 border-[#FFD700]/40 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]"
                  required
                  maxLength={10}
                />
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#FFD700] font-semibold">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-black/40 border-[#FFD700]/40 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]"
                  required
                  minLength={3}
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#FFD700] font-semibold">
                  Email (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/40 border-[#FFD700]/40 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#FFD700] font-semibold">
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border-[#FFD700]/40 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700] pr-12"
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#FFD700] font-semibold">
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-black/40 border-[#FFD700]/40 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700] pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {confirmPassword && password === confirmPassword && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#FFD700]/40 bg-black/40 text-[#FFD700] focus:ring-[#FFD700]"
                />
                <Label htmlFor="terms" className="text-gray-300 text-sm cursor-pointer">
                  I accept the terms and conditions of the partner program
                </Label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="gold"
                className="w-full text-lg py-6 shadow-lg shadow-[#FFD700]/20"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-[#0A0E27] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Partner Account...
                  </div>
                ) : (
                  <>
                    <Crown className="w-5 h-5 mr-2" />
                    Become a Partner
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <span className="text-white/80 text-sm">
                  Already a partner?{' '}
                  <Link href="/partner/login">
                    <span className="text-[#FFD700] hover:text-[#FFA500] font-semibold cursor-pointer transition-colors">
                      Sign In
                    </span>
                  </Link>
                </span>
              </div>
            </form>

            {/* Right Column - Benefits */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-[#FFD700] mb-4">Partner Benefits</h3>
              
              <div className="space-y-3">
                <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <h4 className="text-[#FFD700] font-semibold">2% Commission</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Earn 2% commission on every bet placed by your referred players
                  </p>
                </div>

                <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <h4 className="text-[#FFD700] font-semibold">Unlimited Referrals</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    No limit on the number of players you can refer
                  </p>
                </div>

                <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-[#FFD700]" />
                    </div>
                    <h4 className="text-[#FFD700] font-semibold">Real-Time Tracking</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Track your earnings and player activity in real-time
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border border-[#FFD700]/30 rounded-lg p-4 mt-4">
                <p className="text-[#FFD700] text-sm text-center">
                  <strong>Note:</strong> Applications are reviewed within 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}