import { Route, Switch } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Layouts
import PlayerLayout from './layouts/PlayerLayout';
import AdminLayout from './layouts/AdminLayout';
import PartnerLayout from './layouts/PartnerLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AdminLogin from './pages/auth/AdminLogin';
import PartnerLoginPage from './pages/auth/PartnerLoginPage';
import PartnerSignupPage from './pages/auth/PartnerSignupPage';

// Player Pages
import { GameRoomPage } from './pages/player/GameRoomPage';
import { DashboardPage } from './pages/player/DashboardPage';
import { ProfilePage } from './pages/player/ProfilePage';
import { WalletPage } from './pages/player/WalletPage';
import { TransactionsPage } from './pages/player/TransactionsPage';
import { BonusesPage } from './pages/player/BonusesPage';
import { ReferralPage } from './pages/player/ReferralPage';
import { GameHistoryPage } from './pages/player/GameHistoryPage';
import { DepositPage } from './pages/player/DepositPage';
import { WithdrawPage } from './pages/player/WithdrawPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminGameControlPage } from './pages/admin/AdminGameControlPage';
import { AdminDepositsPage } from './pages/admin/AdminDepositsPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminBonusesPage } from './pages/admin/AdminBonusesPage';
import { AdminPartnersPage } from './pages/admin/AdminPartnersPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminGameHistoryPage } from './pages/admin/AdminGameHistoryPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminUserDetailsPage } from './pages/admin/AdminUserDetailsPage';
import { AdminPartnerDetailsPage } from './pages/admin/AdminPartnerDetailsPage';
import { AdminStreamSettingsPage } from './pages/admin/AdminStreamSettingsPage';

// Partner Pages
import { PartnerDashboardPage } from './pages/partner/PartnerDashboardPage';
import { PartnerProfilePage } from './pages/partner/PartnerProfilePage';
import { PartnerPlayersPage } from './pages/partner/PartnerPlayersPage';
import { PartnerWithdrawalsPage } from './pages/partner/PartnerWithdrawalsPage';
import { PartnerCommissionsPage } from './pages/partner/PartnerCommissionsPage';
import { PartnerGameHistoryPage } from './pages/partner/PartnerGameHistoryPage';

// 404 Page
import NotFoundPage from './pages/NotFoundPage';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <div className="min-h-screen bg-royal-gradient">
        {/* Toast notifications with royal theme */}
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'bg-royal-medium border-gold/30 text-gold',
            duration: 4000,
          }}
        />

        {/* Routing */}
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/partner/login" component={PartnerLoginPage} />
          <Route path="/partner/signup" component={PartnerSignupPage} />

          {/* Player Routes - Protected with PlayerLayout */}
          <Route path="/game">
            {() => (
              <PlayerLayout>
                <GameRoomPage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/dashboard">
            {() => (
              <PlayerLayout>
                <DashboardPage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/profile">
            {() => (
              <PlayerLayout>
                <ProfilePage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/wallet">
            {() => (
              <PlayerLayout>
                <WalletPage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/transactions">
            {() => (
              <PlayerLayout>
                <TransactionsPage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/bonuses">
            {() => (
              <PlayerLayout>
                <BonusesPage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/referral">
            {() => (
              <PlayerLayout>
                <ReferralPage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/history">
            {() => (
              <PlayerLayout>
                <GameHistoryPage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/deposit">
            {() => (
              <PlayerLayout>
                <DepositPage />
              </PlayerLayout>
            )}
          </Route>
          <Route path="/withdraw">
            {() => (
              <PlayerLayout>
                <WithdrawPage />
              </PlayerLayout>
            )}
          </Route>

          {/* Admin Routes - Protected with AdminLayout */}
          <Route path="/admin">
            {() => (
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/users">
            {() => (
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/users/:id">
            {(params) => (
              <AdminLayout>
                <AdminUserDetailsPage userId={params.id} />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/game-control">
            {() => (
              <AdminLayout>
                <AdminGameControlPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/deposits">
            {() => (
              <AdminLayout>
                <AdminDepositsPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/withdrawals">
            {() => (
              <AdminLayout>
                <AdminWithdrawalsPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/bonuses">
            {() => (
              <AdminLayout>
                <AdminBonusesPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/partners">
            {() => (
              <AdminLayout>
                <AdminPartnersPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/partners/:id">
            {(params) => (
              <AdminLayout>
                <AdminPartnerDetailsPage partnerId={params.id} />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/analytics">
            {() => (
              <AdminLayout>
                <AdminAnalyticsPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/reports">
            {() => (
              <AdminLayout>
                <AdminReportsPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/game-history">
            {() => (
              <AdminLayout>
                <AdminGameHistoryPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/transactions">
            {() => (
              <AdminLayout>
                <AdminTransactionsPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/settings">
            {() => (
              <AdminLayout>
                <AdminSettingsPage />
              </AdminLayout>
            )}
          </Route>
          <Route path="/admin/stream-settings">
            {() => (
              <AdminLayout>
                <AdminStreamSettingsPage />
              </AdminLayout>
            )}
          </Route>

          {/* Partner Routes - Protected with PartnerLayout */}
          <Route path="/partner/dashboard">
            {() => (
              <PartnerLayout>
                <PartnerDashboardPage />
              </PartnerLayout>
            )}
          </Route>
          <Route path="/partner/profile">
            {() => (
              <PartnerLayout>
                <PartnerProfilePage />
              </PartnerLayout>
            )}
          </Route>
          <Route path="/partner/players">
            {() => (
              <PartnerLayout>
                <PartnerPlayersPage />
              </PartnerLayout>
            )}
          </Route>
          <Route path="/partner/withdrawals">
            {() => (
              <PartnerLayout>
                <PartnerWithdrawalsPage />
              </PartnerLayout>
            )}
          </Route>
          <Route path="/partner/commissions">
            {() => (
              <PartnerLayout>
                <PartnerCommissionsPage />
              </PartnerLayout>
            )}
          </Route>
          <Route path="/partner/history">
            {() => (
              <PartnerLayout>
                <PartnerGameHistoryPage />
              </PartnerLayout>
            )}
          </Route>

          {/* 404 - Catch all */}
          <Route component={NotFoundPage} />
        </Switch>
        </div>

        {/* React Query DevTools - Only in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;