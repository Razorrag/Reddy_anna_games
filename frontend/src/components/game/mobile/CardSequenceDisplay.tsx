/**
 * CardSequenceDisplay - Real-time card sequence viewer
 * 
 * Shows cards as they're dealt from the live stream:
 * - Andar cards on left
 * - Opening card in center
 * - Bahar cards on right
 * - Highlights winning card
 */

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface CardSequenceDisplayProps {
  className?: string;
}

const CardSequenceDisplay: React.FC<CardSequenceDisplayProps> = ({
  className = ''
}) => {
  const {
    openingCard,
    andarCards,
    baharCards,
    winningCard
  } = useGameStore();

  const isWinningCard = (card: string) => {
    if (!winningCard) return false;
    // Compare rank only (ignore suit)
    const cardRank = card.slice(0, -1);
    const winRank = winningCard.slice(0, -1);
    return cardRank === winRank;
  };

  // Parse card to get color
  const getCardColor = (card: string) => {
    const suit = card.slice(-1);
    return ['♥', '♦'].includes(suit) ? 'red' : 'black';
  };

  return (
    <div className={`card-sequence-display bg-black/40 backdrop-blur-sm ${className}`}>
      <div className="grid grid-cols-3 gap-3 p-3">
        {/* Andar Cards (Left) */}
        <div className="flex flex-col gap-2">
          <div className="text-amber-400 text-xs font-bold text-center uppercase">
            Andar
          </div>
          <div className="space-y-2 min-h-[60px]">
            <AnimatePresence>
              {andarCards.map((card, index) => (
                <motion.div
                  key={`andar-${index}`}
                  initial={{ opacity: 0, x: -20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`
                    bg-white rounded-md p-2 text-center font-bold text-lg
                    shadow-lg
                    ${isWinningCard(card) 
                      ? 'ring-4 ring-yellow-400 shadow-yellow-400/50 animate-pulse' 
                      : ''
                    }
                    ${getCardColor(card.display) === 'red' ? 'text-red-600' : 'text-black'}
                  `}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{card.display}</span>
                    {isWinningCard(card.display) && (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {andarCards.length > 0 && (
            <div className="text-[10px] text-gray-400 text-center">
              {andarCards.length} card{andarCards.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Opening Card (Center) */}
        <div className="flex flex-col gap-2">
          <div className="text-gold text-xs font-bold text-center uppercase">
            Opening
          </div>
          <div className="min-h-[60px] flex items-center justify-center">
            {openingCard ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-gradient-to-br from-gold/30 to-gold/50 rounded-md p-3 text-center font-bold text-xl text-gold border-2 border-gold/50 shadow-lg shadow-gold/30"
              >
                {openingCard}
              </motion.div>
            ) : (
              <div className="text-gold/30 text-xl font-bold">?</div>
            )}
          </div>
        </div>

        {/* Bahar Cards (Right) */}
        <div className="flex flex-col gap-2">
          <div className="text-blue-400 text-xs font-bold text-center uppercase">
            Bahar
          </div>
          <div className="space-y-2 min-h-[60px]">
            <AnimatePresence>
              {baharCards.map((card, index) => (
                <motion.div
                  key={`bahar-${index}`}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`
                    bg-white rounded-md p-2 text-center font-bold text-lg
                    shadow-lg
                    ${isWinningCard(card) 
                      ? 'ring-4 ring-yellow-400 shadow-yellow-400/50 animate-pulse' 
                      : ''
                    }
                    ${getCardColor(card.display) === 'red' ? 'text-red-600' : 'text-black'}
                  `}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{card.display}</span>
                    {isWinningCard(card.display) && (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {baharCards.length > 0 && (
            <div className="text-[10px] text-gray-400 text-center">
              {baharCards.length} card{baharCards.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Card Count Summary */}
      {(andarCards.length > 0 || baharCards.length > 0) && (
        <div className="flex justify-around text-xs text-gray-400 px-4 pb-2 border-t border-white/10">
          <span>A: {andarCards.length}</span>
          <span>Total: {andarCards.length + baharCards.length}</span>
          <span>B: {baharCards.length}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(CardSequenceDisplay);