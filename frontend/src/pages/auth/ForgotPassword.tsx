import { useState, FormEvent } from 'react'
import { Link } from 'wouter'
import { ArrowLeft, Send, AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useForgotPassword } from '@/hooks/mutations/auth/useForgotPassword'

export default function ForgotPassword() {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const forgotPasswordMutation = useForgotPassword()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!phone) {
      setError('Please enter your mobile number')
      return
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    try {
      await forgotPasswordMutation.mutateAsync({ phone })
      setSuccess(true)
    } catch (err: any) {
      const message = err.message || 'Request failed'
      
      if (message.toLowerCase().includes('not found')) {
        setError('❌ No account found with this phone number')
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
        <CardHeader className="text-center pb-6">
          {!success ? (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FFD700]/20">
                <MessageCircle className="w-10 h-10 text-[#0A0E27]" />
              </div>
              <CardTitle className="text-3xl font-bold text-[#FFD700] mb-2">
                Reset Password
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter your mobile number to receive password reset instructions via WhatsApp
              </CardDescription>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-400 mb-2">
                Request Sent!
              </CardTitle>
              <CardDescription className="text-gray-400">
                Password reset instructions have been sent to your WhatsApp
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone Number Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#FFD700] font-semibold">
                  Registered Mobile Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your 10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="bg-black/30 border-[#FFD700]/30 text-white placeholder:text-gray-400 focus:border-[#FFD700] focus:ring-[#FFD700]"
                  required
                  maxLength={10}
                  autoComplete="tel"
                  autoFocus
                />
              </div>

              {/* Info Box */}
              <div className="bg-[#00F5FF]/5 border border-[#00F5FF]/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-[#00F5FF] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#00F5FF] text-sm font-semibold mb-1">
                      WhatsApp Password Reset
                    </p>
                    <p className="text-gray-400 text-sm">
                      You will receive a message on WhatsApp with instructions to reset your password. Please ensure your WhatsApp is active.
                    </p>
                  </div>
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
                variant="neon"
                className="w-full text-lg py-6"
                disabled={forgotPasswordMutation.isPending}
              >
                {forgotPasswordMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending Request...
                  </div>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Reset Instructions
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center pt-2">
                <Link href="/auth/login">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-semibold mb-2">
                      Reset instructions sent to +91 {phone}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Please check your WhatsApp for a message from our support team with password reset instructions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-lg p-4">
                <h4 className="text-[#FFD700] font-semibold mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-400 text-sm">
                  <li>Open the WhatsApp message from our support team</li>
                  <li>Follow the instructions to reset your password</li>
                  <li>Return to the login page and sign in with your new password</li>
                </ol>
              </div>

              {/* Didn't receive? */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Didn't receive the message?
                </p>
                <Button
                  onClick={() => {
                    setSuccess(false)
                    setPhone('')
                  }}
                  variant="outline"
                  className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
                >
                  Try Again
                </Button>
              </div>

              {/* Back to Login */}
              <div className="text-center pt-2 border-t border-gray-700">
                <Link href="/auth/login">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-gray-400 hover:text-white mt-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}