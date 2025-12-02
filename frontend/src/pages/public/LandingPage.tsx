import { Link } from 'wouter';
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

export default function LandingPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-royal-900 via-royal-800 to-royal-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-royal-900/80 backdrop-blur-lg border-b border-gold-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-gold-400" />
              <span className="text-2xl font-bold text-gold-400">Reddy Anna</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gold-400 hover:text-gold-300">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-royal-900 font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Experience the
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
                Ultimate Gaming Platform
              </span>
            </h1>
            <p className="text-xl text-royal-200 mb-8 max-w-2xl mx-auto">
              Join thousands of players in real-time gaming with instant payouts, 
              live streaming, and the most exciting games.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-royal-900 font-semibold text-lg px-8">
                  Start Playing Now
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/partner/register">
                <Button size="lg" variant="outline" className="border-gold-500 text-gold-400 hover:bg-gold-500/10">
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
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="bg-royal-800/50 border-gold-500/20 p-6">
                <div className="text-3xl font-bold text-gold-400 mb-2">{stat.value}</div>
                <div className="text-royal-300">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 bg-royal-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Popular Games
            </h2>
            <p className="text-royal-300">
              Play your favorite games with live dealers and real-time action
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-royal-800/50 border-gold-500/20 p-6 hover:border-gold-500/40 transition-all cursor-pointer group">
                  <div className="text-6xl mb-4 text-center group-hover:scale-110 transition-transform">
                    {game.image}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 text-center">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-royal-300">
                      {game.players}
                    </span>
                    {game.status === 'Live' ? (
                      <span className="flex items-center text-green-400">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        Live
                      </span>
                    ) : (
                      <span className="text-royal-400">Coming Soon</span>
                    )}
                  </div>
                  {game.status === 'Live' && (
                    <Link href="/register">
                      <Button className="w-full mt-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-royal-900">
                        <Play className="mr-2 h-4 w-4" />
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
              Why Choose Reddy Anna?
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gold-600 to-gold-500">
        <div className="container mx-auto text-center">
          <Trophy className="h-16 w-16 text-royal-900 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-royal-900 mb-4">
            Ready to Win Big?
          </h2>
          <p className="text-royal-800 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of winners on India's most trusted gaming platform. 
            Get ₹100 welcome bonus on signup!
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-royal-900 hover:bg-royal-800 text-gold-400 font-semibold text-lg px-8">
              Claim Your Bonus Now
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
                <span className="text-xl font-bold text-gold-400">Reddy Anna</span>
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
              </ul>
            </div>
          </div>
          <div className="border-t border-gold-500/20 mt-8 pt-8 text-center text-royal-400">
            <p>&copy; 2024 Reddy Anna Gaming. All rights reserved.</p>
            <p className="mt-2 text-sm">Play responsibly. 18+ only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}