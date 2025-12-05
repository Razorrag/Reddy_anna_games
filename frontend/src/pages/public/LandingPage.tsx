import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Trophy,
  ChevronRight,
  Play,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { LanguageSelector, About, GameRules, WhatsAppFloatButton } from '@/components/landing';

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // Auth-aware landing: redirect authenticated users to their home
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = (user as any).role || 'player';
      if (role === 'admin' || role === 'super_admin') {
        setLocation('/admin');
      } else if (role === 'partner') {
        setLocation('/partner/dashboard');
      } else {
        setLocation('/game');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const features = [
    {
      icon: Zap,
      title: 'Ultra-Fast Gaming',
      description: 'Experience lightning-fast gameplay with ultra-low latency streaming'
    },
    {
      icon: Shield,
      title: 'Secure & Fair',
      description: 'Provably fair games with bank-grade security for your peace of mind'
    },
    {
      icon: TrendingUp,
      title: 'High Payouts',
      description: 'Industry-leading payout rates with instant withdrawals'
    },
    {
      icon: Users,
      title: 'Partner Program',
      description: 'Earn generous commissions by referring players to our platform'
    }
  ];

  const games = [
    {
      name: 'Andar Bahar',
      players: '2.5K+',
      image: '🎴',
      status: 'Live'
    },
    {
      name: 'Teen Patti',
      players: 'Coming Soon',
      image: '🃏',
      status: 'Soon'
    },
    {
      name: 'Roulette',
      players: 'Coming Soon',
      image: '🎰',
      status: 'Soon'
    }
  ];

  const stats = [
    { label: 'Active Players', value: '10K+' },
    { label: 'Games Played', value: '1M+' },
    { label: 'Total Payouts', value: '₹50Cr+' },
    { label: 'Win Rate', value: '98.5%' }
  ];

  return (
    <div className="min-h-screen bg-[#0A0E27] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1E40AF]/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-[#00F5FF]/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E27]/80 backdrop-blur-lg border-b border-[#FFD700]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-2 rounded-lg shadow-lg shadow-[#FFD700]/20">
                <Sparkles className="h-6 w-6 text-[#0A0E27]" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700] drop-shadow-sm">
                Raju Gari Kossu
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link href="/login">
                <Button variant="ghost" className="text-[#FFD700] hover:text-[#FFA500] hover:bg-[#FFD700]/10 font-medium transition-colors">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="premium-gold" className="h-10 px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
              Experience the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700] animate-shine">
                Ultimate Royal Gaming
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join India's most trusted platform for real-time gaming. Instant payouts, 
              live streaming, and premium 24/7 support.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button variant="premium-gold" size="xl" className="text-lg px-8 shadow-glow-gold">
                  Start Playing Now
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/partner/signup">
                <Button size="xl" variant="outline" className="text-lg border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10 hover:text-[#FFF299] font-semibold shadow-glow-royal">
                  Become a Partner
                  <TrendingUp className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="bg-[#1A1F3A]/60 border-[#FFD700]/20 p-6 backdrop-blur-sm hover:border-[#FFD700]/40 transition-all hover:-translate-y-1 duration-300 group shadow-lg hover:shadow-glow-royal">
                <div className="text-3xl font-bold text-[#FFD700] mb-2 group-hover:scale-110 transition-transform drop-shadow-md">{stat.value}</div>
                <div className="text-gray-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <span className="w-12 h-1 bg-premium-gold rounded-full"></span>
              Popular Games
              <span className="w-12 h-1 bg-premium-gold rounded-full"></span>
            </h2>
            <p className="text-gray-400 text-lg">
              Play your favorite games with live dealers and real-time action
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-[#1A1F3A]/80 border-[#FFD700]/20 p-8 hover:border-[#FFD700]/50 transition-all cursor-pointer group hover:shadow-glow-royal relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-premium-gold opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="text-7xl mb-6 text-center transform group-hover:scale-110 transition-transform duration-500 filter drop-shadow-lg">
                    {game.image}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 text-center group-hover:text-[#FFD700] transition-colors">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between bg-[#0A0E27]/50 p-3 rounded-lg mb-6 border border-[#FFD700]/10">
                    <span className="text-gray-300 font-medium">
                      {game.players} Players
                    </span>
                    {game.status === 'Live' ? (
                      <span className="flex items-center text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-1 rounded border border-[#10B981]/20">
                        <span className="w-2 h-2 bg-[#10B981] rounded-full mr-2 animate-pulse"></span>
                        LIVE
                      </span>
                    ) : (
                      <span className="text-gray-500 font-medium bg-gray-800/50 px-2 py-1 rounded">Coming Soon</span>
                    )}
                  </div>
                  {game.status === 'Live' && (
                    <Link href="/signup">
                      <Button variant="premium-gold" className="w-full">
                        <Play className="mr-2 h-5 w-5 fill-current" />
                        Play Now
                      </Button>
                    </Link>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Raju Gari Kossu?
            </h2>
            <p className="text-royal-300">
              The most trusted and feature-rich gaming platform in India
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-royal-800/50 border-gold-500/20 p-6 text-center hover:border-gold-500/40 transition-all">
                  <feature.icon className="h-12 w-12 text-gold-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-royal-300">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <About />

      {/* Game Rules Section */}
      <GameRules />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gold-600 to-gold-500">
        <div className="container mx-auto text-center">
          <Trophy className="h-16 w-16 text-royal-900 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-royal-900 mb-4">
            Ready to Win Big?
          </h2>
          <p className="text-royal-800 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of winners on India's most trusted gaming platform.
            Start playing instantly with fast payouts!
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-royal-900 hover:bg-royal-800 text-gold-400 font-semibold text-lg px-8">
              Start Playing Now
              <Star className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-royal-950 border-t border-gold-500/20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-gold-400" />
                <span className="text-xl font-bold text-gold-400">Raju Gari Kossu</span>
              </div>
              <p className="text-royal-400">
                India's premier real-time gaming platform with instant payouts and live streaming.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/games" className="text-royal-400 hover:text-gold-400">Games</Link></li>
                <li><Link href="/about" className="text-royal-400 hover:text-gold-400">About Us</Link></li>
                <li><Link href="/contact" className="text-royal-400 hover:text-gold-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-royal-400 hover:text-gold-400">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-royal-400 hover:text-gold-400">Privacy Policy</Link></li>
                <li><Link href="/responsible-gaming" className="text-royal-400 hover:text-gold-400">Responsible Gaming</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-royal-400 hover:text-gold-400">Help Center</Link></li>
                <li><Link href="/faq" className="text-royal-400 hover:text-gold-400">FAQ</Link></li>
                <li><a href="mailto:support@reddyanna.com" className="text-royal-400 hover:text-gold-400">support@reddyanna.com</a></li>
                <li>
                  <a
                    href="https://wa.me/YOUR_WHATSAPP_NUMBER"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-royal-400 hover:text-gold-400 flex items-center gap-2"
                  >
                    <span className="text-green-500">📱</span> WhatsApp Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gold-500/20 mt-8 pt-8 text-center text-royal-400">
            <p>&copy; 2024 Raju Gari Kossu Gaming. All rights reserved.</p>
            <p className="mt-2 text-sm">Play responsibly. 18+ only.</p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <WhatsAppFloatButton />
    </div>
  );
}