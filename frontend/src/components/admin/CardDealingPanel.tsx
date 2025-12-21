import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface CardDealingPanelProps {
  roundNumber: number;
  phase: 'betting' | 'dealing' | 'completed';
  usedCards: Card[];
  andarCards: Card[];
  baharCards: Card[];
  roundId: string;
  openingCard?: string;
}

function CardDealingPanel({
  roundNumber,
  phase,
  usedCards,
  andarCards,
  baharCards,
  roundId,
  openingCard
}: CardDealingPanelProps) {
  const { emit } = useWebSocket();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [nextSide, setNextSide] = useState<'andar' | 'bahar'>('bahar');
  const [dealingInProgress, setDealingInProgress] = useState(false);

  // Calculate next expected side based on cards dealt
  useEffect(() => {
    const totalCards = andarCards.length + baharCards.length;
    // Bahar always first (odd positions), Andar second (even positions)
    setNextSide(totalCards % 2 === 0 ? 'bahar' : 'andar');
  }, [andarCards.length, baharCards.length]);

  // Generate card deck
  const suits = [
    { symbol: '♠', name: 'spades', color: 'black' },
    { symbol: '♥', name: 'hearts', color: 'red' },
    { symbol: '♦', name: 'diamonds', color: 'red' },
    { symbol: '♣', name: 'clubs', color: 'black' }
  ];

  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const allCards: Card[] = suits.flatMap(suit =>
    ranks.map((rank, index) => ({
      id: `${rank}-${suit.name}`,
      suit: suit.name as 'spades' | 'hearts' | 'diamonds' | 'clubs',
      rank,
      value: index + 1,
      color: suit.color as 'red' | 'black',
      display: `${rank}${suit.symbol}`
    }))
  );

  const handleCardSelect = (card: Card) => {
    // Prevent selection during betting phase
    if (phase === 'betting') {
      toast.warning('⏳ Wait for betting timer to complete!');
      return;
    }

    if (dealingInProgress) return;

    // Round 3: Instant card drop (no confirmation)
    if (roundNumber === 3) {
      handleInstantDeal(card);
      return;
    }

    // Rounds 1 & 2: Select card for confirmation
    setSelectedCard(card);
    toast.info(`Selected for ${nextSide.toUpperCase()}: ${card.display}`);
  };

  const handleInstantDeal = async (card: Card) => {
    setDealingInProgress(true);
    const position = andarCards.length + baharCards.length + 1;

    try {
      emit('admin:deal_card', {
        roundId,
        card: card.display,
        side: nextSide,
        position
      });

      toast.success(`🎴 ${card.display} → ${nextSide.toUpperCase()}`);

      setTimeout(() => {
        setDealingInProgress(false);
      }, 500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to deal card');
      setDealingInProgress(false);
    }
  };

  const handleDealCard = async () => {
    if (!selectedCard) {
      toast.error('Please select a card to deal!');
      return;
    }

    setDealingInProgress(true);
    const position = andarCards.length + baharCards.length + 1;

    try {
      emit('admin:deal_card', {
        roundId,
        card: selectedCard.display,
        side: nextSide,
        position
      });

      toast.success(`🎴 Dealing ${selectedCard.display} to ${nextSide.toUpperCase()}...`);

      // Clear selection
      setSelectedCard(null);

      setTimeout(() => {
        setDealingInProgress(false);
      }, 500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to deal card');
      setDealingInProgress(false);
    }
  };

  const handleClearSelection = () => {
    if (selectedCard) {
      setSelectedCard(null);
      toast.info('Card selection cleared');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      {/* Header with Instructions */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-3">Card Dealing Panel</h3>
        
        {/* Phase-specific Instructions */}
        <div className={`rounded-lg p-3 border-2 ${
          phase === 'betting' 
            ? 'bg-yellow-500/10 border-yellow-500/50' 
            : 'bg-blue-500/10 border-blue-500/50'
        }`}>
          <div className="text-sm text-gray-200 text-center font-medium">
            {phase === 'betting' ? (
              <span className="text-yellow-400">⏳ Betting in Progress - Cards Locked</span>
            ) : roundNumber === 3 ? (
              <span className="text-cyan-400">🔥 Round 3: Click card → Instant drop to {nextSide.toUpperCase()} → Auto-alternates</span>
            ) : (
              <span className="text-blue-400">🃏 Click card → Deal to {nextSide.toUpperCase()} → Winner checked → Next side</span>
            )}
          </div>
        </div>
      </div>

      {/* Opening Card Display */}
      {openingCard && (
        <div className="mb-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-2 border-amber-500 rounded-lg p-4 text-center">
          <div className="text-xs text-gray-300 mb-1">🎴 Opening Card</div>
          <div className="text-4xl font-bold text-white">
            {openingCard}
          </div>
        </div>
      )}

      {/* Card Grid */}
      <div className="bg-black/30 rounded-lg p-4 mb-4">
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
                  const isSelected = roundNumber < 3 && selectedCard?.id === card.id;
                  const isUsed = usedCards.some(usedCard => usedCard.id === card.id);
                  const isDisabled = dealingInProgress || isUsed || phase === 'betting';

                  return (
                    <motion.button
                      key={card.id}
                      onClick={() => !isUsed && handleCardSelect(card)}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { scale: 1.05 } : {}}
                      whileTap={!isDisabled ? { scale: 0.95 } : {}}
                      className={`
                        aspect-[2/3] rounded-lg text-2xl font-bold transition-all duration-300 flex items-center justify-center relative
                        ${isSelected
                          ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-black border-2 border-white shadow-lg shadow-amber-500/50 animate-pulse'
                          : isUsed
                          ? 'bg-gray-800/50 border-2 border-gray-600 opacity-30 cursor-not-allowed'
                          : 'bg-black/60 hover:bg-gray-900 border-2 border-white/20 hover:border-amber-500/50'
                        }
                        ${isSelected 
                          ? '' 
                          : isUsed
                          ? 'text-gray-600'
                          : (card.color === 'red' ? 'text-red-400' : 'text-yellow-400')
                        }
                        ${dealingInProgress && !isUsed ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      title={
                        isUsed 
                          ? '❌ Card already used' 
                          : dealingInProgress 
                          ? 'Dealing in progress' 
                          : `${card.rank} of ${card.suit}`
                      }
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
      <div className="flex gap-3 mb-4">
        <Button
          onClick={handleClearSelection}
          disabled={!selectedCard || dealingInProgress}
          variant="outline"
          className="flex-1 border-orange-500/30 text-orange-400"
        >
          ↩️ Clear
        </Button>

        {/* Deal button for Rounds 1 & 2 */}
        {phase === 'dealing' && roundNumber < 3 && (
          <Button
            onClick={handleDealCard}
            disabled={!selectedCard || dealingInProgress}
            className="flex-[2] bg-gradient-to-r from-blue-500 to-cyan-500"
          >
            {dealingInProgress ? '⏳ Dealing...' : `🎴 Deal to ${nextSide.toUpperCase()}`}
          </Button>
        )}

        {/* Info display for Round 3 */}
        {roundNumber === 3 && phase === 'dealing' && (
          <div className="flex-[2] px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 text-purple-300 rounded-lg text-sm font-bold text-center flex items-center justify-center">
            🎴 Click any card to deal instantly
          </div>
        )}
      </div>

      {/* Selected Card Display (Rounds 1 & 2) */}
      {roundNumber < 3 && selectedCard && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-blue-500/20 to-red-500/20 rounded-lg p-4 border-2 border-amber-500/50 text-center"
        >
          <div className="text-sm text-gray-300 mb-2">Next Card: {nextSide.toUpperCase()}</div>
          <div className={`text-7xl font-bold ${selectedCard.color === 'red' ? 'text-red-500' : 'text-white'}`}>
            {selectedCard.display}
          </div>
        </motion.div>
      )}

      {/* Dealt Cards Display */}
      {(andarCards.length > 0 || baharCards.length > 0) && (
        <div className="mt-4 bg-black/30 rounded-xl p-4">
          <div className="text-sm font-semibold text-gray-400 mb-3">Recently Dealt Cards</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  Bahar ({baharCards.length})
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {baharCards.slice(-5).map((card, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1 bg-white rounded text-sm font-bold ${
                      card.color === 'red' ? 'text-red-600' : 'text-black'
                    }`}
                  >
                    {card.display}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                  Andar ({andarCards.length})
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {andarCards.slice(-5).map((card, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1 bg-white rounded text-sm font-bold ${
                      card.color === 'red' ? 'text-red-600' : 'text-black'
                    }`}
                  >
                    {card.display}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .grid-cols-13 {
          grid-template-columns: repeat(13, minmax(0, 1fr));
        }
      `}</style>
    </div>
  );
}

export { CardDealingPanel };
export default CardDealingPanel;