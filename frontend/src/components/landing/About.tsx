import { motion } from 'framer-motion';
import { Check, TrendingUp, Users, Shield, Zap, Lock, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function About() {
  const benefits = [
    { icon: Shield, title: 'Licensed & Regulated', description: 'Fully licensed gaming platform with strict compliance to Indian regulations' },
    { icon: Lock, title: 'Secure Transactions', description: 'Bank-level encryption and multiple payment options for your safety' },
    { icon: Clock, title: '24/7 Customer Support', description: 'Dedicated support team available round the clock to assist you' },
    { icon: Check, title: 'Fair Play Guaranteed', description: 'Certified random number generators ensure completely fair gameplay' },
  ];

  const features = [
    { icon: TrendingUp, title: 'Live Statistics', description: 'Real-time game statistics and betting trends to help you make informed decisions' },
    { icon: Zap, title: 'Easy to Use', description: 'Intuitive interface designed for players of all skill levels' },
    { icon: Lock, title: 'Secure & Private', description: 'Your data and transactions are protected with advanced security measures' },
  ];

  return (
    <section id="about" className="py-20 px-4 bg-gradient-to-br from-[#0A0E27] via-[#0F1635] to-[#0A0E27]">
      <div className="container mx-auto max-w-6xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-12"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700]">
            About Raju Gari Kossu
          </span>
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">India's Premier Andar Bahar Platform</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Welcome to Raju Gari Kossu, the most trusted and exciting Andar Bahar gaming platform in India. 
              We bring you the authentic casino experience with cutting-edge technology, ensuring fair play, 
              security, and endless entertainment.
            </p>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Founded with a vision to revolutionize online gaming in India, Raju Gari Kossu combines traditional 
              Andar Bahar gameplay with modern digital innovation. Our platform is designed for both beginners 
              and experienced players, offering a seamless and immersive gaming experience.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center p-4 bg-[#1A1F3A]/60 border-[#FFD700]/20 backdrop-blur-sm">
                <div className="text-3xl font-bold text-[#FFD700] mb-2">100K+</div>
                <div className="text-gray-300 text-sm">Active Players</div>
              </Card>
              <Card className="text-center p-4 bg-[#1A1F3A]/60 border-[#FFD700]/20 backdrop-blur-sm">
                <div className="text-3xl font-bold text-[#FFD700] mb-2">24/7</div>
                <div className="text-gray-300 text-sm">Live Games</div>
              </Card>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 bg-[#1A1F3A]/80 border-[#FFD700]/20 backdrop-blur-md">
              <h4 className="text-xl md:text-2xl font-bold text-[#FFD700] mb-6">Why Choose Raju Gari Kossu?</h4>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-[#0A0E27]" />
                    </div>
                    <div>
                      <h5 className="text-white font-semibold mb-1">{benefit.title}</h5>
                      <p className="text-gray-400 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 bg-[#1A1F3A]/60 border-[#FFD700]/20 backdrop-blur-sm hover:border-[#FFD700]/40 transition-all text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-[#0A0E27]" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;
