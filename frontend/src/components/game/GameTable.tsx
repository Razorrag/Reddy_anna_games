import { useGameStore } from '@/store/gameStore'
import { Card as CardType } from '@/types'
import { Sparkles, Trophy, Crown } from 'lucide-react'

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
        relative w-24 h-36 rounded-xl shadow-2xl
        transform transition-all duration-500 hover:scale-110 hover:-translate-y-2
        ${isJoker ? 'scale-110 ring-4 ring-premium-gold shadow-glow-gold z-20' : 'z-10'}
        ${isWinner ? 'scale-125 ring-4 ring-green-500 shadow-[0_0_30px_rgba(34,197,94,0.6)] z-30 animate-bounce' : ''}
        animate-card-deal
      `}
      style={{
        animationDelay: `${delay}ms`,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      }}
    >
      {/* Card Gloss Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-xl pointer-events-none"></div>

      {/* Card content */}
      <div className="absolute inset-0 p-3 flex flex-col justify-between font-display">
        {/* Top-left corner */}
        <div className={`text-3xl font-bold leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {card.value}
          <div className="text-xl mt-1">{SUIT_SYMBOLS[card.suit as keyof typeof SUIT_SYMBOLS]}</div>
        </div>

        {/* Center suit */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className={`text-7xl ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {SUIT_SYMBOLS[card.suit as keyof typeof SUIT_SYMBOLS]}
          </div>
        </div>

        {/* Bottom-right corner (rotated) */}
        <div className="text-right transform rotate-180">
          <div className={`text-3xl font-bold leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
            {card.value}
            <div className="text-xl mt-1">{SUIT_SYMBOLS[card.suit as keyof typeof SUIT_SYMBOLS]}</div>
          </div>
        </div>
      </div>

      {/* Joker indicator */}
      {isJoker && (
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-premium-gold rounded-full flex items-center justify-center shadow-lg border-2 border-[#0A0E27] animate-pulse-gold">
          <Crown className="w-5 h-5 text-[#0A0E27]" />
        </div>
      )}

      {/* Winner Badge */}
      {isWinner && (
        <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse">
          <Trophy className="w-5 h-5 text-white" />
        </div>
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
    <div className="w-full relative rounded-3xl overflow-hidden shadow-2xl border-8 border-[#3D2C1E] bg-[#1a472a]">
      {/* Felt Texture Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>

      {/* Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)] pointer-events-none"></div>

      {/* Gold Trim Inner Border */}
      <div className="absolute inset-2 border border-[#FFD700]/30 rounded-2xl pointer-events-none"></div>

      {/* Main content */}
      <div className="relative z-10 p-8 min-h-[600px] flex flex-col">
        {/* Header / Joker Section */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative">
            {/* Joker Platform */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-premium-royal rounded-full blur-xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="px-6 py-2 bg-[#0A0E27]/80 backdrop-blur-md rounded-full border border-[#FFD700]/50 shadow-glow-gold">
                <h3 className="text-[#FFD700] font-bold text-lg flex items-center gap-2 uppercase tracking-wider">
                  <Crown className="w-5 h-5 text-[#FFD700]" />
                  Joker Card
                </h3>
              </div>
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                {jokerCard ? (
                  <CardDisplay card={jokerCard} isJoker={true} />
                ) : (
                  <div className="w-24 h-36 rounded-xl bg-[#0A0E27]/40 border-2 border-dashed border-[#FFD700]/30 flex items-center justify-center">
                    <div className="text-center p-2">
                      <Sparkles className="w-8 h-8 text-[#FFD700]/30 mx-auto mb-2 animate-pulse" />
                      <span className="text-[#FFD700]/50 text-xs font-bold uppercase tracking-wide">Waiting</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game Board - Andar / Bahar */}
        <div className="grid grid-cols-2 gap-12 flex-1">
          {/* Andar Side */}
          <div className="relative group">
            {/* Zone Header */}
            <div className={`
              relative z-20 mx-auto w-max -mb-5 px-8 py-3 rounded-full shadow-lg transform transition-all duration-500
              ${winningSide === 'andar'
                ? 'bg-premium-gold text-[#0A0E27] scale-110 shadow-glow-gold ring-4 ring-[#FFD700]/20'
                : 'bg-[#EF4444] text-white shadow-[0_4px_14px_rgba(239,68,68,0.4)]'
              }
            `}>
              <h4 className="text-xl font-black tracking-widest uppercase flex items-center gap-2">
                Andar
                {winningSide === 'andar' && <Trophy className="w-5 h-5 animate-bounce" />}
              </h4>
            </div>

            {/* Card Zone */}
            <div className={`
              h-full rounded-3xl border-2 p-8 pt-12 transition-all duration-500 relative overflow-hidden
              ${winningSide === 'andar' 
                ? 'bg-[#EF4444]/10 border-[#EF4444] shadow-[inset_0_0_50px_rgba(239,68,68,0.2)]' 
                : 'bg-black/20 border-white/10 hover:bg-black/30'
              }
            `}>
              <div className="flex flex-wrap content-start justify-center gap-4 min-h-[200px]">
                {dealtCards
                  .filter(c => c.side === 'andar')
                  .map((cardData, index) => (
                    <CardDisplay
                      key={index}
                      card={cardData.card}
                      isWinner={winningCard?.value === cardData.card.value && winningCard?.suit === cardData.card.suit}
                      delay={index * 150}
                    />
                  ))}
                
                {dealtCards.filter(c => c.side === 'andar').length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center opacity-20">
                      <div className="text-6xl font-black text-white mb-2">A</div>
                      <div className="text-sm font-bold text-white uppercase tracking-widest">Andar Zone</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bahar Side */}
          <div className="relative group">
            {/* Zone Header */}
            <div className={`
              relative z-20 mx-auto w-max -mb-5 px-8 py-3 rounded-full shadow-lg transform transition-all duration-500
              ${winningSide === 'bahar'
                ? 'bg-premium-gold text-[#0A0E27] scale-110 shadow-glow-gold ring-4 ring-[#FFD700]/20'
                : 'bg-[#3B82F6] text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)]'
              }
            `}>
              <h4 className="text-xl font-black tracking-widest uppercase flex items-center gap-2">
                Bahar
                {winningSide === 'bahar' && <Trophy className="w-5 h-5 animate-bounce" />}
              </h4>
            </div>

            {/* Card Zone */}
            <div className={`
              h-full rounded-3xl border-2 p-8 pt-12 transition-all duration-500 relative overflow-hidden
              ${winningSide === 'bahar' 
                ? 'bg-[#3B82F6]/10 border-[#3B82F6] shadow-[inset_0_0_50px_rgba(59,130,246,0.2)]' 
                : 'bg-black/20 border-white/10 hover:bg-black/30'
              }
            `}>
              <div className="flex flex-wrap content-start justify-center gap-4 min-h-[200px]">
                {dealtCards
                  .filter(c => c.side === 'bahar')
                  .map((cardData, index) => (
                    <CardDisplay
                      key={index}
                      card={cardData.card}
                      isWinner={winningCard?.value === cardData.card.value && winningCard?.suit === cardData.card.suit}
                      delay={index * 150}
                    />
                  ))}

                {dealtCards.filter(c => c.side === 'bahar').length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center opacity-20">
                      <div className="text-6xl font-black text-white mb-2">B</div>
                      <div className="text-sm font-bold text-white uppercase tracking-widest">Bahar Zone</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Round Status Footer */}
        {currentRound && (
          <div className="mt-8 text-center relative z-30">
            <div className={`
              inline-flex items-center gap-4 px-8 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-500
              ${winningSide 
                ? 'bg-premium-gold border-[#FFD700] scale-110' 
                : 'bg-[#0A0E27]/90 border-[#FFD700]/30'
              }
            `}>
              <div className="text-left">
                <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${winningSide ? 'text-[#0A0E27]/70' : 'text-gray-400'}`}>
                  Round #{currentRound.roundNumber}
                </div>
                <div className={`text-2xl font-black uppercase tracking-wide ${winningSide ? 'text-[#0A0E27]' : 'text-[#FFD700]'}`}>
                  {currentRound.status === 'betting' && 'Place Your Bets'}
                  {currentRound.status === 'dealing' && 'Dealing Cards...'}
                  {currentRound.status === 'complete' && winningSide && `${winningSide} Wins!`}
                </div>
              </div>
              {winningSide && (
                <div className="w-12 h-12 bg-[#0A0E27] rounded-full flex items-center justify-center animate-bounce">
                  <Trophy className="w-6 h-6 text-[#FFD700]" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}