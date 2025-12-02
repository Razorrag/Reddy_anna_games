import { useState, FormEvent } from 'react'
import { Link, useLocation } from 'wouter'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '@/hooks/mutations/auth/useLogin'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const [, setLocation] = useLocation()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const loginMutation = useLogin()
  const { isAuthenticated } = useAuthStore()

  // Redirect if already logged in
  if (isAuthenticated) {
    setLocation('/game')
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!phone || !password) {
      setError('Please enter both phone number and password')
      return
    }

    try {
      await loginMutation.mutateAsync({ phone, password })
      // Success - redirect handled by mutation
      setLocation('/game')
    } catch (err: any) {
      const message = err.message || 'Login failed'
      
      if (message.includes('ACCOUNT_BLOCKED')) {
        setError('🚫 Account blocked. Please contact support.')
      } else if (message.toLowerCase().includes('suspended')) {
        setError('⚠️ Account suspended. You can view the game but cannot place bets.')
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-20 w-24 h-24 bg-[#00F5FF]/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <Card className="w-full max-w-md bg-black/40 border-[#FFD700]/30 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FFD700]/20">
            <LogIn className="w-10 h-10 text-[#0A0E27]" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#FFD700] mb-2">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            Sign in to play Andar Bahar
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#FFD700] font-semibold">
                Mobile Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-black/30 border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]"
                required
                autoComplete="tel"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#FFD700] font-semibold">
                  Password
                </Label>
                <Link href="/auth/forgot-password">
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
                  className="bg-black/30 border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700] pr-12"
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
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
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
              className="w-full text-lg py-6"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-[#0A0E27] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <span className="text-white/80">
                Don't have an account?{' '}
                <Link href="/auth/signup">
                  <span className="text-[#FFD700] hover:text-[#FFA500] font-semibold cursor-pointer transition-colors">
                    Sign Up
                  </span>
                </Link>
              </span>
            </div>

            {/* Partner Login Link */}
            <div className="text-center pt-1">
              <Link href="/partner/login">
                <span className="text-[#00F5FF] hover:text-[#00D4FF] text-sm cursor-pointer transition-colors">
                  Partner Login →
                </span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}