/**
 * CardHistory - Recent game results display
 * 
 * Shows recent game results with opening card in circular badges
 * Color: Red for Andar wins, Blue for Bahar wins
 * Order: Right to left (newest on right)
 * Clickable to show game details
 */

import React from 'react';
import { useGameHistory } from '@/hooks/queries/game/useGameHistory';

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
  // Fetch real game history from API
  const { data: historyData, isLoading } = useGameHistory({ limit: 6 });

  // Transform API data to GameResult format
  const recentResults: GameResult[] = React.useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    
    return historyData.map((game) => ({
      id: game.id,
      winner: game.winningSide,
      roundNumber: game.roundNumber,
      jokerCard: game.jokerCard,
      winningCard: game.winningCard
    }));
  }, [historyData]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full bg-gray-700/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

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