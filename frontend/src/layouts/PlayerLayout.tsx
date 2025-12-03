import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  Gamepad2,
  Wallet,
  History,
  Gift,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlayerLayoutProps {
  children: ReactNode;
}

export default function PlayerLayout({ children }: PlayerLayoutProps) {
  const [location, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  // Redirect admins and partners to their dashboards
  if (user.role === 'admin') {
    navigate('/admin');
    return null;
  }
  if (user.role === 'partner') {
    navigate('/partner/dashboard');
    return null;
  }

  const totalBalance = user.mainBalance + user.bonusBalance;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Gamepad2, label: 'Play Game', path: '/game' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: History, label: 'Transactions', path: '/transactions' },
    { icon: Gift, label: 'Bonuses', path: '/bonuses' },
    { icon: Users, label: 'Referrals', path: '/referral' },
    { icon: History, label: 'Game History', path: '/history' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E27] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1E40AF]/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-[#00F5FF]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#0A0E27]/80 backdrop-blur-md border-b border-[#FFD700]/20 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <Link href="/dashboard">
                <a className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center shadow-lg shadow-[#FFD700]/20 group-hover:scale-105 transition-transform">
                    <span className="text-[#0A0E27] font-bold text-xl">RG</span>
                  </div>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700] font-display text-xl font-bold hidden sm:block tracking-wide">
                    Raju Gari Kossu
                  </span>
                </a>
              </Link>
            </div>

            {/* Balance Display */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3 bg-[#1A1F3A]/60 px-5 py-2 rounded-full border border-[#FFD700]/30 shadow-inner">
                <div className="bg-[#FFD700]/10 p-1.5 rounded-full">
                  <Wallet size={18} className="text-[#FFD700]" />
                </div>
                <div className="text-right leading-tight">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Total Balance</div>
                  <div className="text-[#FFD700] font-bold text-lg">₹{totalBalance.toLocaleString()}</div>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-full text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors border border-transparent hover:border-[#FFD700]/20">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0A0E27] animate-pulse"></span>
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full text-[#FFD700] hover:bg-[#FFD700]/10 border border-transparent hover:border-[#FFD700]/20 transition-all">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center ring-2 ring-[#0A0E27]">
                      <span className="text-[#0A0E27] font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-bold text-white">{user.name}</div>
                      <div className="text-xs text-[#FFD700]/80">ID: {user.phone.slice(-4)}</div>
                    </div>
                    <ChevronDown size={16} className="opacity-50" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[#1A1F3A]/95 backdrop-blur-md border-[#FFD700]/20 text-white p-2 shadow-xl">
                  <div className="px-2 py-3 mb-2 border-b border-[#FFD700]/10 md:hidden">
                    <div className="text-sm font-bold text-white">{user.name}</div>
                    <div className="text-xs text-[#FFD700]/80">{user.phone}</div>
                  </div>
                  <DropdownMenuItem asChild className="focus:bg-[#FFD700]/10 focus:text-[#FFD700] cursor-pointer rounded-md">
                    <Link href="/profile">
                      <a className="flex items-center gap-3 w-full">
                        <Settings size={18} />
                        Profile Settings
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#FFD700]/10" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-md"
                  >
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Balance Display */}
        <div className="sm:hidden px-4 pb-4">
          <div className="flex items-center justify-between bg-[#1A1F3A]/60 px-4 py-3 rounded-xl border border-[#FFD700]/30 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFD700]/10 p-2 rounded-full">
                <Wallet size={20} className="text-[#FFD700]" />
              </div>
              <span className="text-sm text-gray-300 font-medium">Balance</span>
            </div>
            <span className="text-[#FFD700] font-bold text-xl">₹{totalBalance.toLocaleString()}</span>
          </div>
        </div>
      </nav>

      <div className="flex relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 min-h-[calc(100vh-5rem)] bg-[#0A0E27]/50 backdrop-blur-sm border-r border-[#FFD700]/10 pt-6 sticky top-20">
          <nav className="px-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0A0E27] font-bold shadow-lg shadow-[#FFD700]/20 transform scale-[1.02]'
                        : 'text-gray-300 hover:bg-[#FFD700]/10 hover:text-[#FFD700] hover:pl-5'
                    }`}
                  >
                    <Icon size={22} className={isActive ? 'text-[#0A0E27]' : 'text-[#FFD700] group-hover:scale-110 transition-transform'} />
                    <span className="text-sm tracking-wide">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0A0E27]"></div>}
                  </a>
                </Link>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-8 left-0 right-0 px-6">
            <div className="bg-gradient-to-br from-[#1A1F3A] to-[#0A0E27] p-4 rounded-xl border border-[#FFD700]/20 text-center">
              <div className="text-[#FFD700] text-xs font-bold uppercase tracking-wider mb-2">Need Help?</div>
              <Link href="/support">
                <Button variant="outline" size="sm" className="w-full border-[#FFD700]/30 text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0A0E27]">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0A0E27] border-r border-[#FFD700]/20 shadow-2xl">
              <div className="p-6 flex items-center justify-between border-b border-[#FFD700]/10">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] font-bold text-xl">
                  Menu
                </span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <nav className="p-4 space-y-2 mt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <a
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0A0E27] font-bold shadow-lg'
                            : 'text-gray-300 hover:bg-[#FFD700]/10 hover:text-[#FFD700]'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon size={22} className={isActive ? 'text-[#0A0E27]' : 'text-[#FFD700]'} />
                        <span>{item.label}</span>
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[100vw] overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#0A0E27]/90 border-t border-[#FFD700]/10 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div>
              <p className="text-gray-400 text-sm">
                2025 <span className="text-[#FFD700] font-bold">Raju Gari Kossu</span>. All rights reserved.
              </p>
              <p className="text-gray-600 text-xs mt-1">India's Most Trusted Gaming Platform</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/support">
                <a className="hover:text-[#FFD700] transition-colors">Support</a>
              </Link>
              <Link href="/terms">
                <a className="hover:text-[#FFD700] transition-colors">Terms</a>
              </Link>
              <Link href="/privacy">
                <a className="hover:text-[#FFD700] transition-colors">Privacy</a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}