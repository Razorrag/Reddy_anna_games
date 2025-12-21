/**
 * RoundTransition - Shows round progression notification
 * 
 * Displays when moving from Round 1 → Round 2 or Round 2 → Round 3
 * Non-blocking toast-style notification
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { toast } from 'sonner';

export const RoundTransition: React.FC = () => {
  const { roundNumber } = useGameStore();
  const [showTransition, setShowTransition] = useState(false);
  const [prevRound, setPrevRound] = useState(roundNumber);
  const [transitionMessage, setTransitionMessage] = useState('');

  useEffect(() => {
    if (roundNumber !== prevRound && roundNumber > 1) {
      setShowTransition(true);
      setPrevRound(roundNumber);
      
      // Set message based on round
      let message = '';
      if (roundNumber === 2) {
        message = 'Place additional bets!';
        toast.info('Round 2 - Place additional bets!', {
          duration: 3000,
        });
      } else if (roundNumber === 3) {
        message = 'Continuous dealing until winner!';
        toast.info('Round 3 - Continuous dealing until winner!', {
          duration: 3000,
        });
      }
      
      setTransitionMessage(message);
      
      // Auto-hide after 3 seconds
      setTimeout(() => setShowTransition(false), 3000);
    }
  }, [roundNumber, prevRound]);

  return (
    <AnimatePresence>
      {showTransition && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full px-4"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 rounded-xl shadow-2xl border-2 border-amber-300">
            <div className="text-white font-bold text-xl text-center mb-1">
              Moving to Round {roundNumber}!
            </div>
            <div className="text-white/90 text-sm text-center">
              {transitionMessage}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RoundTransition;