/**
 * CardHistory - Recent game results display
 * 
 * Shows recent game results with opening card in circular badges
 * Color: Red for Andar wins, Blue for Bahar wins
 * Order: Right to left (newest on right)
 * Clickable to show game details
 */

import React from 'react';

interface GameResult {
  id: string;
  winner: 'andar' | 'bahar';
  roundNumber: number;
  jokerCard: string;
  winningCard?: string;
}

interface CardHistoryProps {
  onHistoryClick?: () => void;
  onGameClick?: (gameId: string) => void;
  className?: string;
}

const CardHistory: React.FC<CardHistoryProps> = ({
  onGameClick,
  className = ''
}) => {
  // Mock recent results - will be replaced with actual API data
  const recentResults: GameResult[] = [
    { id: '1', winner: 'andar', roundNumber: 1, jokerCard: 'A♠' },
    { id: '2', winner: 'bahar', roundNumber: 2, jokerCard: 'K♥' },
    { id: '3', winner: 'andar', roundNumber: 1, jokerCard: '7♦' },
    { id: '4', winner: 'bahar', roundNumber: 3, jokerCard: 'Q♣' },
    { id: '5', winner: 'andar', roundNumber: 2, jokerCard: '10♠' },
    { id: '6', winner: 'bahar', roundNumber: 1, jokerCard: 'J♥' },
  ];

  // Extract card rank without suit
  const getCardRank = (card: string): string => {
    if (!card) return '?';
    return card.replace(/[♠♥♦♣]/g, '').trim() || '?';
  };

  const handleGameClick = (game: GameResult) => {
    if (onGameClick) {
      onGameClick(game.id);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Recent Results - Right to Left (newest on right) */}
      <div className="flex items-center gap-2 flex-1">
        <div className="flex gap-2 flex-row-reverse overflow-hidden">
          {recentResults.slice(0, 6).map((result) => (
            <button
              key={result.id}
              onClick={() => handleGameClick(result)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                shadow-lg cursor-pointer hover:scale-110 active:scale-95
                transition-all duration-300 ease-out
                ${result.winner === 'andar' 
                  ? 'bg-[#A52A2A] text-gold border-2 border-red-400 hover:border-red-300' 
                  : 'bg-[#01073b] text-gold border-2 border-blue-400 hover:border-blue-300'
                }
              `}
              title={`Opening: ${result.jokerCard} | Winner: ${result.winner.toUpperCase()} | Round ${result.roundNumber}`}
            >
              {getCardRank(result.jokerCard)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CardHistory);