/**
 * MobileTopBar - Enhanced top bar with round information and game details
 *
 * Features:
 * - Current round display (Round 1/2/3)
 * - Profile, Bonus, Wallet buttons
 * - Bonus shows cumulative total with lock icon if locked
 * - Royal theme with gold and navy colors
 */

import React from 'react';
import { User, Gift } from 'lucide-react';
import { useGame } from '@/hooks/useGame';
import { useAuth } from '@/hooks/useAuth';

interface MobileTopBarProps {
  className?: string;
  onWalletClick?: () => void;
  onProfileClick?: () => void;
  onBonusClick?: () => void;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({
  className = '',
  onWalletClick,
  onProfileClick,
  onBonusClick
}) => {
  const { gameState, currentRound } = useGame();
  const { user, balance } = useAuth();
  const displayBalance = balance || user?.mainBalance || 0;
  const roundNumber = currentRound?.roundNumber || 1;

  // Mock bonus data - will be replaced with actual bonus store
  const bonusInfo = {
    total: 5000,
    hasLocked: true,
    depositBonus: 3000,
    referralBonus: 2000,
    wageringProgress: 45,
    wageringRequired: 50000,
    wageringCompleted: 22500
  };

  const hasBonus = bonusInfo.total > 0;

  return (
    <div className={`bg-gradient-to-r from-navy-dark to-black border-b border-navy-light/30 ${className}`}>
      <div className="px-4 py-3">
        {/* Main Top Bar Layout */}
        <div className="flex justify-between items-center">
          {/* Left Side - Round Indicator */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {/* Round Indicator */}
              <div className={`
                px-3 py-1.5 rounded-full text-xs font-bold transition-all
                ${roundNumber === 1 ? 'bg-green-600 text-white shadow-lg shadow-green-500/50' : ''}
                ${roundNumber === 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50' : ''}
                ${roundNumber === 3 ? 'bg-red-600 text-white shadow-lg shadow-red-500/50' : ''}
              `}>
                R{roundNumber}
              </div>
            </div>
          </div>

          {/* Right Side - Profile, Bonus, Wallet */}
          <div className="flex items-center gap-2">
            {/* Profile Button */}
            <button
              onClick={onProfileClick}
              className="flex items-center justify-center w-9 h-9 bg-navy-light/80 border-2 border-navy-light rounded-full hover:bg-navy-light hover:border-gold/50 transition-all active:scale-95"
              aria-label="Profile"
            >
              <User className="w-5 h-5 text-gray-300" />
            </button>

            {/* Bonus Chip - Shows cumulative total (deposit + referral) */}
            {hasBonus && (
              <button
                onClick={onBonusClick}
                className={`flex items-center space-x-1.5 rounded-xl px-3 py-2 transition-all active:scale-95 shadow-lg ${
                  bonusInfo.hasLocked
                    ? 'bg-gradient-to-r from-yellow-500/30 to-orange-600/30 border-2 border-yellow-400 hover:from-yellow-500/40 hover:to-orange-600/40 hover:border-yellow-300 shadow-yellow-500/20'
                    : 'bg-gradient-to-r from-green-500/30 to-green-600/30 border-2 border-green-400 hover:from-green-500/40 hover:to-green-600/40 hover:border-green-300 shadow-green-500/20'
                }`}
                title={`Total Bonus: ₹${bonusInfo.total.toLocaleString('en-IN')}\nDeposit: ₹${bonusInfo.depositBonus.toLocaleString('en-IN')}${bonusInfo.hasLocked ? ' (Locked)' : ''}\nReferral: ₹${bonusInfo.referralBonus.toLocaleString('en-IN')}\n\nClick for details`}
              >
                <div className="flex flex-col items-start leading-tight -space-y-0.5">
                  {bonusInfo.hasLocked ? (
                    <>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-yellow-300/70 text-[9px] uppercase tracking-wide font-semibold">
                          Total Bonus
                        </span>
                      </div>
                      <span className="text-yellow-300 font-bold text-sm">
                        ₹{bonusInfo.total.toLocaleString('en-IN')}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <Gift className="w-3 h-3 text-green-300" />
                        <span className="text-green-300/70 text-[9px] uppercase tracking-wide font-semibold">
                          Total Bonus
                        </span>
                      </div>
                      <span className="text-green-300 font-bold text-sm">
                        ₹{bonusInfo.total.toLocaleString('en-IN')}
                      </span>
                    </>
                  )}
                </div>
              </button>
            )}

            {/* Wallet Chip - Always Visible Balance */}
            <button
              onClick={onWalletClick}
              className="flex items-center space-x-2 bg-gradient-to-r from-gold/30 to-gold/40 border-2 border-gold rounded-xl px-4 py-2 hover:from-gold/40 hover:to-gold/50 hover:border-gold/80 transition-all active:scale-95 shadow-lg shadow-gold/20"
            >
              {/* Wallet Icon */}
              <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
              <div className="flex flex-col leading-tight -space-y-0.5">
                <span className="text-gold font-bold text-base tracking-wide">
                  ₹{displayBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileTopBar;