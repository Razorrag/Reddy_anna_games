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
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1E40AF]/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-[#00F5FF]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md bg-[#1A1F3A]/80 border-[#FFD700]/30 backdrop-blur-md relative z-10 shadow-2xl shadow-black/50">
        <CardHeader className="text-center pb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FFD700]/20 ring-4 ring-[#0A0E27]/50">
            <LogIn className="w-12 h-12 text-[#0A0E27]" />
          </div>
          <CardTitle className="text-3xl font-bold text-[#FFD700] mb-2 drop-shadow-sm">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg font-medium">
            Sign in to continue your winning streak
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
                className="bg-[#0A0E27]/50 border-[#FFD700]/30 text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-[#FFD700] h-12 text-lg"
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
                  className="bg-[#0A0E27]/50 border-[#FFD700]/30 text-white placeholder:text-gray-500 focus:border-[#FFD700] focus:ring-[#FFD700] pr-12 h-12 text-lg"
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
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="premium-gold"
              className="w-full text-lg py-6"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-[#0A0E27] border-t-transparent rounded-full animate-spin mr-2"></div>
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
            <div className="text-center pt-4">
              <span className="text-gray-300">
                Don't have an account?{' '}
                <Link href="/signup">
                  <span className="text-[#FFD700] hover:text-[#FFA500] font-bold cursor-pointer transition-colors underline underline-offset-4">
                    Sign Up Now
                  </span>
                </Link>
              </span>
            </div>

            {/* Partner Login Link */}
            <div className="text-center pt-2 border-t border-[#FFD700]/10 mt-4">
              <Link href="/partner/login">
                <span className="text-[#00F5FF] hover:text-[#00D4FF] text-sm font-medium cursor-pointer transition-colors flex items-center justify-center gap-1 hover:gap-2 transition-all">
                  Partner Login <span className="text-lg">→</span>
                </span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}