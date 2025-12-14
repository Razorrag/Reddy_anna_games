import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Gamepad2,
  UserCog,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';
import { AdminNotificationPanel } from '@/components/admin/AdminNotificationPanel';
import { useNotificationStore } from '@/stores/notificationStore';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const navigationItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Users', icon: Users, path: '/admin/users' },
  { label: 'Deposits', icon: CreditCard, path: '/admin/deposits', badge: 5 },
  { label: 'Withdrawals', icon: CreditCard, path: '/admin/withdrawals', badge: 3 },
  { label: 'Payment History', icon: FileText, path: '/admin/payments' },
  { label: 'Game Control', icon: Gamepad2, path: '/admin/game-control' },
  { label: 'Bets Monitor', icon: Target, path: '/admin/bets' },
  { label: 'Game Settings', icon: Settings, path: '/admin/game-settings' },
  { label: 'Game History', icon: FileText, path: '/admin/game-history' },
  { label: 'Partners', icon: UserCog, path: '/admin/partners' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Financial Reports', icon: FileText, path: '/admin/financial-reports' },
  { label: 'System Settings', icon: Settings, path: '/admin/settings' }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount, setIsOpen } = useNotificationStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    setLocation('/admin/login');
    return null;
  }

  // Only allow admin users
  if (user.role !== 'admin') {
    setLocation('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    setLocation('/admin/login');
  };

  const getBreadcrumbs = () => {
    const paths = location.split('/').filter(Boolean);
    return paths.map((path: string, index: number) => ({
      label: path.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      path: '/' + paths.slice(0, index + 1).join('/')
    }));
  };

  const breadcrumbs = getBreadcrumbs();
  const currentPage = navigationItems.find(item => item.path === location);

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Sidebar - Desktop */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#1a1f3a] border-r border-cyan-500/30 transition-all duration-300 z-40 hidden lg:block ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-cyan-500/30">
          {sidebarOpen ? (
            <Link href="/admin">
              <a className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Reddy Anna
              </span>
              </a>
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <a className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-[#0f1432]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                {sidebarOpen && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {!sidebarOpen && item.badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                    {item.badge}
                  </div>
                )}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1a1f3a] border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/10 transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 left-0 h-full w-64 bg-[#1a1f3a] border-r border-cyan-500/30 z-50 lg:hidden"
            >
              {/* Mobile Logo */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-cyan-500/30">
                <Link href="/admin">
                  <a className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Reddy Anna
                  </span>
                  </a>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="p-4 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;

                  return (
                    <Link key={item.path} href={item.path}>
                      <a
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-[#0f1432]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="h-16 bg-[#1a1f3a] border-b border-cyan-500/30 flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500" />}
                <Link href={crumb.path}>
                  <a className={`${
                    index === breadcrumbs.length - 1
                      ? 'text-cyan-400 font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {crumb.label}
                  </a>
                </Link>
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-[#0A0E27] border-cyan-500/30"
              />
            </div>

            {/* Notifications */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>

            {/* Admin Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-cyan-500/30">
              <div className="hidden md:block text-right">
                <p className="text-white font-medium text-sm">{user?.name || 'Admin'}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                {(user?.name || 'A')[0].toUpperCase()}
              </div>
            </div>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-red-500/30 hover:border-red-500 hover:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content - with right padding for notification panel when open */}
        <main className="min-h-[calc(100vh-4rem)] relative pr-0 lg:pr-0">
          {children}
        </main>
        
        {/* Admin Notification Panel - Slides in from right, doesn't overlap content */}
        <AdminNotificationPanel />

        {/* Footer */}
        <footer className="bg-[#1a1f3a] border-t border-cyan-500/30 py-4 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              2024 Reddy Anna. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/admin/help">
                <a className="text-gray-400 hover:text-cyan-400">Help & Support</a>
              </Link>
              <Link href="/admin/docs">
                <a className="text-gray-400 hover:text-cyan-400">Documentation</a>
              </Link>
              <Link href="/admin/privacy">
                <a className="text-gray-400 hover:text-cyan-400">Privacy Policy</a>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}