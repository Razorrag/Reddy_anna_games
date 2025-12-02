import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { LogOut, Settings, Wallet, Gift, Menu, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function GameHeader() {
  const [, setLocation] = useLocation()
  const { user, logout } = useAuthStore()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = () => {
    logout()
    setLocation('/auth/login')
  }

  if (!user) return null

  const totalBalance = (user.mainBalance || 0) + (user.bonusBalance || 0)

  return (
    <header className="bg-gradient-to-r from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] border-b border-[#FFD700]/20 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[#0A0E27] font-bold text-xl">AB</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-[#FFD700]">Andar Bahar</h1>
              <p className="text-gray-400 text-sm">Live Game</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {/* Balance Display */}
            <div className="flex items-center gap-4">
              {/* Main Balance */}
              <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-[#FFD700]/30">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#FFD700]" />
                  <div>
                    <p className="text-gray-400 text-xs">Main Balance</p>
                    <p className="text-[#FFD700] font-bold text-lg">
                      ₹{(user.mainBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bonus Balance */}
              {user.bonusBalance > 0 && (
                <div className="bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-purple-500/30">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-gray-400 text-xs">Bonus</p>
                      <p className="text-purple-400 font-bold text-lg">
                        ₹{(user.bonusBalance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-right">
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-gray-400 text-sm">{user.phone}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation('/profile')}
                className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="gold"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in">
            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#FFD700]/30">
                <p className="text-gray-400 text-xs mb-1">Main Balance</p>
                <p className="text-[#FFD700] font-bold">
                  ₹{(user.mainBalance || 0).toLocaleString()}
                </p>
              </div>
              {user.bonusBalance > 0 && (
                <div className="bg-purple-500/20 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-500/30">
                  <p className="text-gray-400 text-xs mb-1">Bonus</p>
                  <p className="text-purple-400 font-bold">
                    ₹{(user.bonusBalance || 0).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#FFD700]/30">
              <p className="text-white font-semibold">{user.name}</p>
              <p className="text-gray-400 text-sm">{user.phone}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMobileMenu(false)
                  setLocation('/profile')
                }}
                className="border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700]/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="gold"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}