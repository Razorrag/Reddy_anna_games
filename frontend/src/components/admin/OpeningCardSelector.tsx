import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { toast } from 'sonner';

interface Card {
  id: string;
  suit: 'spades' | 'hearts' | 'diamonds' | 'clubs';
  rank: string;
  value: number;
  color: 'red' | 'black';
  display: string;
}

interface OpeningCardSelectorProps {
  usedCards?: Card[];
  onCardSelect?: (card: Card) => void;
  gameId: string;
}

function OpeningCardSelector({ usedCards = [], onCardSelect, gameId }: OpeningCardSelectorProps) {
  const { emit } = useWebSocket();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bettingDuration, setBettingDuration] = useState<number>(30);
  const [isStarting, setIsStarting] = useState(false);

  // Generate all 52 cards
  const suits = [
    { symbol: '♠', name: 'spades', color: 'black' },
    { symbol: '♥', name: 'hearts', color: 'red' },
    { symbol: '♦', name: 'diamonds', color: 'red' },
    { symbol: '♣', name: 'clubs', color: 'black' }
  ];

  const ranks = [
    { display: 'A', value: 1 },
    { display: '2', value: 2 },
    { display: '3', value: 3 },
    { display: '4', value: 4 },
    { display: '5', value: 5 },
    { display: '6', value: 6 },
    { display: '7', value: 7 },
    { display: '8', value: 8 },
    { display: '9', value: 9 },
    { display: '10', value: 10 },
    { display: 'J', value: 11 },
    { display: 'Q', value: 12 },
    { display: 'K', value: 13 }
  ];

  const allCards: Card[] = suits.flatMap(suit =>
    ranks.map(rank => ({
      id: `${rank.display}-${suit.name}`,
      suit: suit.name as 'spades' | 'hearts' | 'diamonds' | 'clubs',
      rank: rank.display,
      value: rank.value,
      color: suit.color as 'red' | 'black',
      display: `${rank.display}${suit.symbol}`
    }))
  );

  const handleCardSelect = (card: Card) => {
    if (selectedCard) return; // Prevent selecting again once chosen
    setSelectedCard(card);
    onCardSelect?.(card);
    toast.info(`Selected: ${card.display}`);
  };

  const handleStartGame = async () => {
    if (!selectedCard || isStarting) return;
    
    setIsStarting(true);
    try {
      // Send opening card to backend via WebSocket
      emit('admin:create_round', {
        gameId,
        openingCard: selectedCard.display
      });
      
      toast.success(`Game started with opening card: ${selectedCard.display}`);
      setShowConfirmModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start game');
    } finally {
      setTimeout(() => setIsStarting(false), 1500);
    }
  };

  const handleClearSelection = () => {
    setSelectedCard(null);
    toast.info('Selection cleared');
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-3xl">🎴</span>
        Select Opening Card
      </h2>

      {/* Card Grid */}
      <div className="bg-black/30 rounded-lg p-4 mb-4">
        {/* Cards organized by suit - 13 cards per row */}
        {suits.map(suit => (
          <div key={suit.name} className="mb-3 last:mb-0">
            <div className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span className={`text-2xl ${suit.color === 'red' ? 'text-red-500' : 'text-yellow-400'}`}>
                {suit.symbol}
              </span>
              <span className="text-gray-400 uppercase text-xs tracking-wider">{suit.name}</span>
            </div>

            <div className="grid grid-cols-13 gap-1">
              {allCards
                .filter(card => card.suit === suit.name)
                .map(card => {
                  const isCurrentlySelected = selectedCard?.id === card.id;
                  const isUsed = usedCards.some(usedCard => usedCard.id === card.id);
                  const isDisabled = isUsed || (!!selectedCard && !isCurrentlySelected);

                  return (
                    <motion.button
                      key={card.id}
                      onClick={() => !isDisabled && handleCardSelect(card)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.05 } : {}}
                      whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      className={`
                        aspect-[2/3] rounded-lg text-2xl font-bold transition-all duration-300 flex items-center justify-center relative
                        ${isCurrentlySelected
                          ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-black border-2 border-white shadow-lg shadow-amber-500/50 animate-pulse'
                          : isUsed
                          ? 'bg-gray-800/50 border-2 border-gray-600 opacity-30 cursor-not-allowed'
                          : (!!selectedCard && !isCurrentlySelected)
                          ? 'bg-gray-800/50 border-2 border-gray-600 opacity-30 cursor-not-allowed'
                          : 'bg-black/60 hover:bg-gray-900 border-2 border-white/20 hover:border-amber-500/50'
                        }
                        ${isCurrentlySelected 
                          ? '' 
                          : isUsed
                          ? 'text-gray-600'
                          : (!!selectedCard && !isCurrentlySelected)
                          ? 'text-gray-600'
                          : (card.color === 'red' ? 'text-red-400' : 'text-yellow-400')
                        }
                      `}
                      title={isUsed ? '❌ Card already used' : `${card.rank} of ${card.suit}`}
                    >
                      {isUsed ? (
                        <>
                          {card.display}
                          <span className="absolute inset-0 flex items-center justify-center text-red-500 text-4xl font-black">✗</span>
                        </>
                      ) : (
                        card.display
                      )}
                    </motion.button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleClearSelection}
          disabled={!selectedCard}
          variant="outline"
          className="flex-1 border-white/20"
        >
          🗑️ Clear Selection
        </Button>
        <Button
          onClick={() => setShowConfirmModal(true)}
          disabled={!selectedCard}
          className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          ✅ Start Round 1
        </Button>
      </div>

      {/* Selected Card Display */}
      {selectedCard && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl p-6 border-2 border-amber-500/50 text-center"
        >
          <div className="text-sm text-gray-300 mb-3">🎴 Selected Opening Card</div>
          <div className={`text-8xl font-bold ${selectedCard.color === 'red' ? 'text-red-500' : 'text-white'}`}>
            {selectedCard.display}
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && selectedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-amber-500"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-bold text-amber-400 mb-6 text-center">
              🎲 Start Game Confirmation
            </h3>

            <div className="bg-black/50 rounded-xl p-6 mb-6 text-center">
              <div className="text-gray-400 text-sm mb-3">Opening Card</div>
              <div className={`text-7xl font-bold mb-3 ${selectedCard.color === 'red' ? 'text-red-500' : 'text-white'}`}>
                {selectedCard.display}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2 font-medium">
                Round 1 Betting Duration (seconds)
              </label>
              <Input
                type="number"
                value={bettingDuration}
                onChange={(e) => setBettingDuration(Math.max(10, Math.min(300, parseInt(e.target.value) || 30)))}
                min="10"
                max="300"
                className="bg-black/40 border-amber-500/30 text-white text-center text-xl font-bold"
              />
              <div className="text-gray-500 text-xs mt-1 text-center">
                Range: 10-300 seconds
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2 text-blue-400 text-xs">
                <span className="text-lg">ℹ️</span>
                <div>
                  <span className="font-semibold">Note:</span> Players will have {bettingDuration} seconds to place bets in Round 1
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="outline"
                className="flex-1 border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartGame}
                disabled={isStarting}
                className="flex-[2] bg-gradient-to-r from-green-500 to-emerald-500"
              >
                {isStarting ? '⏳ Starting...' : '🚀 Start Game!'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <style>{`
        .grid-cols-13 {
          grid-template-columns: repeat(13, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
}

export { OpeningCardSelector };
export default OpeningCardSelector;