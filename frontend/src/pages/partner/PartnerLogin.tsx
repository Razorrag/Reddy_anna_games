import { useState, FormEvent } from 'react'
import { Link, useLocation } from 'wouter'
import { Eye, EyeOff, Crown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePartnerLogin } from '@/hooks/mutations/auth/usePartnerLogin'
import { useAuthStore } from '@/store/authStore'

export default function PartnerLogin() {
  const [, setLocation] = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const loginMutation = usePartnerLogin()
  const { isAuthenticated } = useAuthStore()

  // Redirect if already logged in
  if (isAuthenticated) {
    setLocation('/partner/dashboard')
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }

    try {
      await loginMutation.mutateAsync({ username, password })
      // Success - redirect handled by mutation
      setLocation('/partner/dashboard')
    } catch (err: any) {
      const message = err.message || 'Login failed'
      
      if (message.includes('ACCOUNT_BLOCKED')) {
        setError('🚫 Partner account blocked. Please contact support.')
      } else if (message.toLowerCase().includes('not approved')) {
        setError('⏳ Your partner application is pending approval.')
      } else if (message.toLowerCase().includes('invalid')) {
        setError('❌ Invalid phone number or password')
      } else if (message.toLowerCase().includes('network')) {
        setError('🌐 Network error. Please check your connection.')
      } else {
        setError(message)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#2a1f0a] to-[#0A0E27] flex items-center justify-center p-4">
      {/* Animated gold background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#FFD700]/15 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-[#FFA500]/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-20 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="w-full max-w-md bg-black/50 border-[#FFD700]/40 backdrop-blur-sm relative z-10 shadow-2xl shadow-[#FFD700]/10">
        <CardHeader className="text-center pb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#FFD700]/30 animate-pulse">
            <Crown className="w-12 h-12 text-[#0A0E27]" />
          </div>
          <CardTitle className="text-4xl font-bold text-[#FFD700] mb-2">
            Partner Portal
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg">
            Sign in to access your partner dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#FFD700] font-semibold text-base">
                Partner Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your partner username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/40 border-[#FFD700]/40 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700] h-12"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#FFD700] font-semibold text-base">
                  Password
                </Label>
                <Link href="/partner/forgot-password">
                  <Button
                    type="button"
                    variant="link"
                    className="text-[#FFD700] hover:text-[#FFA500] text-sm p-0 h-auto font-normal"
                  >
                    Forgot Password?
                  </Button>
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black/40 border-[#FFD700]/40 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700] h-12 pr-12"
                  required
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
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
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-[#0A0E27] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Sign In as Partner
                </>
              )}
            </Button>

            {/* Info Box */}
            <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg p-4">
              <p className="text-[#FFD700] text-sm text-center">
                <strong>Partner Benefits:</strong>
                <br />
                Earn 2% commission on all player bets
              </p>
            </div>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <span className="text-white/80">
                Not a partner yet?{' '}
                <Link href="/partner/signup">
                  <span className="text-[#FFD700] hover:text-[#FFA500] font-semibold cursor-pointer transition-colors">
                    Apply Now
                  </span>
                </Link>
              </span>
            </div>

            {/* Player Login Link */}
            <div className="text-center pt-1 border-t border-gray-700 mt-4 pt-4">
              <Link href="/auth/login">
                <span className="text-[#00F5FF] hover:text-[#00D4FF] text-sm cursor-pointer transition-colors">
                  ← Back to Player Login
                </span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}