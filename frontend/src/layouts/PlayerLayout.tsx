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

export function PlayerLayout({ children }: PlayerLayoutProps) {
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
    <div className="min-h-screen bg-royal-gradient">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-royal-darker/95 backdrop-blur-sm border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gold hover:bg-royal-medium"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <Link href="/dashboard">
                <a className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gold-gradient rounded-full flex items-center justify-center">
                    <span className="text-royal-darkest font-bold text-xl">RA</span>
                  </div>
                  <span className="text-gold font-display text-xl font-bold hidden sm:block">
                    Reddy Anna
                  </span>
                </a>
              </Link>
            </div>

            {/* Balance Display */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-royal-medium/50 px-4 py-2 rounded-lg border border-gold/20">
                <Wallet size={20} className="text-gold" />
                <div className="text-right">
                  <div className="text-xs text-gray-400">Balance</div>
                  <div className="text-gold font-bold">₹{totalBalance.toFixed(2)}</div>
                </div>
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-md text-gold hover:bg-royal-medium">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-2 rounded-md text-gold hover:bg-royal-medium">
                    <div className="w-8 h-8 bg-gold-gradient rounded-full flex items-center justify-center">
                      <span className="text-royal-darkest font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.phone}</div>
                    </div>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-royal-medium border-gold/20">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <a className="flex items-center gap-2 text-gold">
                        <Settings size={16} />
                        Profile Settings
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gold/20" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-error hover:bg-error/10"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Mobile Balance Display */}
        <div className="sm:hidden px-4 pb-3">
          <div className="flex items-center justify-center gap-2 bg-royal-medium/50 px-4 py-2 rounded-lg border border-gold/20">
            <Wallet size={18} className="text-gold" />
            <div className="text-center">
              <span className="text-xs text-gray-400 mr-2">Balance:</span>
              <span className="text-gold font-bold">₹{totalBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-royal-darker/50 border-r border-gold/20">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gold text-royal-darkest font-medium'
                        : 'text-gold hover:bg-royal-medium'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </a>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-royal-darker border-r border-gold/20">
              <nav className="p-4 space-y-2 mt-16">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  return (
                    <Link key={item.path} href={item.path}>
                      <a
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-gold text-royal-darkest font-medium'
                            : 'text-gold hover:bg-royal-medium'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon size={20} />
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-royal-darker border-t border-gold/20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 Reddy Anna Gaming. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="/support">
                <a className="hover:text-gold transition-colors">Support</a>
              </Link>
              <Link href="/terms">
                <a className="hover:text-gold transition-colors">Terms</a>
              </Link>
              <Link href="/privacy">
                <a className="hover:text-gold transition-colors">Privacy</a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}