import { useGameStore } from '@/store/gameStore'
import { Card as CardType } from '@/types'
import { Sparkles } from 'lucide-react'

// Card suits symbols
const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

interface CardDisplayProps {
  card: CardType
  isJoker?: boolean
  isWinner?: boolean
  delay?: number
}

function CardDisplay({ card, isJoker = false, isWinner = false, delay = 0 }: CardDisplayProps) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'

  return (
    <div
      className={`
        relative w-20 h-28 rounded-lg shadow-xl
        transform transition-all duration-500
        ${isJoker ? 'scale-110 ring-4 ring-[#FFD700]' : ''}
        ${isWinner ? 'scale-125 ring-4 ring-green-400 animate-bounce' : ''}
        animate-fade-in-up
      `}
      style={{
        animationDelay: `${delay}ms`,
        backgroundImage: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
      }}
    >
      {/* Card content */}
      <div className="absolute inset-0 p-2 flex flex-col">
        {/* Top-left corner */}
        <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
          {card.value}
        </div>
        <div className={`text-2xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {SUIT_SYMBOLS[card.suit as keyof typeof SUIT_SYMBOLS]}
        </div>

        {/* Center suit */}
        <div className="flex-1 flex items-center justify-center">
          <div className={`text-4xl ${isRed ? 'text-red-600' : 'text-black'}`}>
            {SUIT_SYMBOLS[card.suit as keyof typeof SUIT_SYMBOLS]}
          </div>
        </div>

        {/* Bottom-right corner (rotated) */}
        <div className="text-right transform rotate-180">
          <div className={`text-2xl font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
            {card.value}
          </div>
          <div className={`text-2xl ${isRed ? 'text-red-600' : 'text-black'}`}>
            {SUIT_SYMBOLS[card.suit as keyof typeof SUIT_SYMBOLS]}
          </div>
        </div>
      </div>

      {/* Joker indicator */}
      {isJoker && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FFD700] rounded-full flex items-center justify-center shadow-lg border-2 border-[#0A0E27]">
          <Sparkles className="w-4 h-4 text-[#0A0E27]" />
        </div>
      )}

      {/* Winner glow */}
      {isWinner && (
        <div className="absolute inset-0 bg-green-400/20 rounded-lg animate-pulse"></div>
      )}
    </div>
  )
}

export function GameTable() {
  const { currentRound, dealtCards } = useGameStore()

  const jokerCard = currentRound?.jokerCard
    ? JSON.parse(currentRound.jokerCard) as CardType
    : null

  const winningCard = currentRound?.winningCard
    ? JSON.parse(currentRound.winningCard) as CardType
    : null

  const winningSide = currentRound?.winingSide

  return (
    <div className="w-full bg-gradient-to-br from-green-800 via-green-700 to-green-900 rounded-xl p-6 shadow-2xl border-4 border-[#FFD700]/30 relative overflow-hidden">
      {/* Table pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
        }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Joker Card Section */}
        <div className="text-center mb-8">
          <h3 className="text-[#FFD700] font-bold text-xl mb-4 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Joker Card
          </h3>
          <div className="flex justify-center">
            {jokerCard ? (
              <CardDisplay card={jokerCard} isJoker={true} />
            ) : (
              <div className="w-20 h-28 rounded-lg bg-black/30 border-2 border-dashed border-white/30 flex items-center justify-center">
                <span className="text-white/50 text-xs">Waiting...</span>
              </div>
            )}
          </div>
        </div>

        {/* Andar & Bahar Sections */}
        <div className="grid grid-cols-2 gap-8">
          {/* Andar Side */}
          <div>
            <div className={`
              text-center mb-4 px-4 py-2 rounded-lg
              ${winningSide === 'andar'
                ? 'bg-green-500 text-white font-bold'
                : 'bg-red-600/80 text-white'
              }
            `}>
              <h4 className="text-lg font-bold">ANDAR</h4>
            </div>
            <div className="flex flex-wrap gap-2 justify-center min-h-[120px] p-2 bg-black/20 rounded-lg">
              {dealtCards
                .filter(c => c.side === 'andar')
                .map((cardData, index) => (
                  <CardDisplay
                    key={index}
                    card={cardData.card}
                    isWinner={winningCard?.value === cardData.card.value && winningCard?.suit === cardData.card.suit}
                    delay={index * 100}
                  />
                ))}
              {dealtCards.filter(c => c.side === 'andar').length === 0 && (
                <div className="text-white/50 text-sm flex items-center justify-center w-full">
                  No cards yet
                </div>
              )}
            </div>
          </div>

          {/* Bahar Side */}
          <div>
            <div className={`
              text-center mb-4 px-4 py-2 rounded-lg
              ${winningSide === 'bahar'
                ? 'bg-green-500 text-white font-bold'
                : 'bg-blue-600/80 text-white'
              }
            `}>
              <h4 className="text-lg font-bold">BAHAR</h4>
            </div>
            <div className="flex flex-wrap gap-2 justify-center min-h-[120px] p-2 bg-black/20 rounded-lg">
              {dealtCards
                .filter(c => c.side === 'bahar')
                .map((cardData, index) => (
                  <CardDisplay
                    key={index}
                    card={cardData.card}
                    isWinner={winningCard?.value === cardData.card.value && winningCard?.suit === cardData.card.suit}
                    delay={index * 100}
                  />
                ))}
              {dealtCards.filter(c => c.side === 'bahar').length === 0 && (
                <div className="text-white/50 text-sm flex items-center justify-center w-full">
                  No cards yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Round Status */}
        {currentRound && (
          <div className="mt-6 text-center">
            <div className="inline-block px-4 py-2 bg-black/40 backdrop-blur-sm rounded-lg border border-[#FFD700]/30">
              <p className="text-white text-sm">
                Round #{currentRound.roundNumber} •{' '}
                <span className="text-[#FFD700] font-semibold">
                  {currentRound.status === 'betting' && 'Place Your Bets'}
                  {currentRound.status === 'dealing' && 'Cards Being Dealt'}
                  {currentRound.status === 'complete' && winningSide && `${winningSide.toUpperCase()} Wins!`}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}