import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

export function GameRules() {
  const howToPlay = [
    'The game starts with one "Opening Card" dealt face up in the middle',
    'Players place bets on either "Andar" or "Bahar" before the timer runs out',
    'Cards are dealt alternately to "Andar" and "Bahar" sides',
    'The game ends when a card matching the value of the Opening Card appears',
    'If the matching card appears on the Andar side, Andar wins; vice versa for Bahar',
  ];

  const winningConditions = [
    'Winning side gets 1:1 payout minus 5% commission',
    'If the 5th card on either side matches the opening card, payout is 1:1',
    'If the opening card appears on the 4th position or earlier, payout is 1:1',
    'Special payout for 5th card: 4:1 (before commission)',
  ];

  const bettingPhases = [
    { phase: 'Round 1', time: '60 seconds', description: 'Initial betting phase with 60 seconds timer' },
    { phase: 'Round 2', time: '30 seconds', description: 'Second betting phase with 30 seconds timer' },
    { phase: 'Final Draw', time: '-', description: 'Continuous card dealing until winner is found' },
  ];

  return (
    <section id="gamerules" className="py-20 px-4 bg-gradient-to-br from-[#0F1635] via-[#0A0E27] to-[#0F1635]">
      <div className="container mx-auto max-w-6xl">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-12"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFF299] to-[#FFD700]">
            Andar Bahar Rules
          </span>
        </motion.h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 bg-[#1A1F3A]/80 border-[#FFD700]/20 backdrop-blur-md h-full">
              <h3 className="text-xl md:text-2xl font-bold text-[#FFD700] mb-6">How to Play</h3>
              <ul className="space-y-4">
                {howToPlay.map((step, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-[#FFD700] text-lg font-bold flex-shrink-0">•</span>
                    <span className="text-gray-300">{index + 1}. {step}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="p-6 bg-[#1A1F3A]/80 border-[#FFD700]/20 backdrop-blur-md h-full">
              <h3 className="text-xl md:text-2xl font-bold text-[#FFD700] mb-6">Winning Conditions</h3>
              <ul className="space-y-4">
                {winningConditions.map((condition, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-[#FFD700] text-lg font-bold flex-shrink-0">•</span>
                    <span className="text-gray-300">{condition}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="p-6 bg-[#1A1F3A]/80 border-[#FFD700]/20 backdrop-blur-md">
            <h3 className="text-xl md:text-2xl font-bold text-[#FFD700] mb-6 text-center">Betting Phases</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bettingPhases.map((phase, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 bg-[#0A0E27]/50 border border-[#FFD700]/20 rounded-xl hover:border-[#FFD700]/40 transition-all"
                >
                  <div className="text-2xl md:text-3xl text-[#FFD700] mb-3 font-bold">{phase.phase}</div>
                  <div className="text-white font-semibold mb-2">{phase.time}</div>
                  <p className="text-gray-400 text-sm">{phase.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default GameRules;
