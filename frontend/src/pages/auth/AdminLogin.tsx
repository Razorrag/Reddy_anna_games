import { useState, FormEvent } from 'react'
import { Link, useLocation } from 'wouter'
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useLogin } from '@/hooks/mutations/auth/useLogin'
import { useAuthStore } from '@/store/authStore'

export default function AdminLogin() {
  const [, setLocation] = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const loginMutation = useLogin()
  const { isAuthenticated, user } = useAuthStore()

  // Redirect if already logged in as admin
  if (isAuthenticated && user?.role === 'admin') {
    setLocation('/admin')
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
      // Use username for admin login (not phone)
      await loginMutation.mutateAsync({ username, password })
      
      // Check if user is admin after login
      const currentUser = useAuthStore.getState().user
      if (currentUser?.role === 'admin') {
        setLocation('/admin')
      } else {
        setError('Access denied. Admin credentials required.')
        // Logout non-admin user
        useAuthStore.getState().logout()
      }
    } catch (err: any) {
      const message = err.message || 'Login failed'
      
      if (message.includes('ACCOUNT_BLOCKED')) {
        setError('🚫 Account blocked. Please contact support.')
      } else if (message.toLowerCase().includes('invalid')) {
        setError('❌ Invalid username or password')
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
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1E40AF]/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-red-600/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md bg-[#1A1F3A]/80 border-red-500/30 backdrop-blur-md relative z-10 shadow-2xl shadow-black/50">
        <CardHeader className="text-center pb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/20 ring-4 ring-[#0A0E27]/50">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-500 mb-2 drop-shadow-sm">
            Admin Access
          </CardTitle>
          <CardDescription className="text-gray-300 text-lg font-medium">
            Secure administrator login
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-red-400 font-semibold">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#0A0E27]/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 h-12 text-lg"
                required
                autoComplete="username"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-red-400 font-semibold">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#0A0E27]/50 border-red-500/30 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pr-12 h-12 text-lg"
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
              className="w-full text-lg py-6 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold shadow-lg shadow-red-600/20"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Authenticating...
                </div>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Admin Login
                </>
              )}
            </Button>

            {/* Back to Player Login */}
            <div className="text-center pt-4 border-t border-red-500/10 mt-4">
              <Link href="/login">
                <span className="text-gray-300 hover:text-white text-sm cursor-pointer transition-colors flex items-center justify-center gap-1">
                  <span>←</span> Back to Player Login
                </span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}