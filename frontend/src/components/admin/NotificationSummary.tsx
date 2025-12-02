import React from 'react';
import { NotificationSummary as NotificationSummaryType } from './types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';

interface NotificationSummaryProps {
  summary: NotificationSummaryType | null;
}

export const NotificationSummary: React.FC<NotificationSummaryProps> = ({ summary }) => {
  const [, setLocation] = useLocation();

  if (!summary) return null;

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const summaryCards = [
    {
      icon: '💵',
      label: 'Pending Deposits',
      count: summary.deposits.count,
      color: 'bg-blue-500/10 border-blue-500/30',
      textColor: 'text-blue-400',
      latest: summary.deposits.latest,
      onClick: () => setLocation('/admin/payments?tab=deposits'),
    },
    {
      icon: '💸',
      label: 'Pending Withdrawals',
      count: summary.withdrawals.count,
      color: 'bg-orange-500/10 border-orange-500/30',
      textColor: 'text-orange-400',
      latest: summary.withdrawals.latest,
      onClick: () => setLocation('/admin/payments?tab=withdrawals'),
    },
    {
      icon: '🎰',
      label: 'Active Games',
      count: summary.activeGames,
      color: 'bg-purple-500/10 border-purple-500/30',
      textColor: 'text-purple-400',
      onClick: () => setLocation('/admin/game'),
    },
    {
      icon: '👤',
      label: 'New Signups',
      count: summary.newSignups,
      color: 'bg-green-500/10 border-green-500/30',
      textColor: 'text-green-400',
      onClick: () => setLocation('/admin/users'),
    },
    {
      icon: '🤝',
      label: 'Partner Applications',
      count: summary.partnerPending,
      color: 'bg-indigo-500/10 border-indigo-500/30',
      textColor: 'text-indigo-400',
      onClick: () => setLocation('/admin/partners?status=pending'),
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gold uppercase tracking-wide px-2">
        Quick Stats
      </h3>
      {summaryCards.map((card, index) => (
        <Card
          key={index}
          onClick={card.onClick}
          className={`${card.color} border-2 p-3 cursor-pointer hover:scale-105 transition-all duration-200`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{card.icon}</span>
              <div>
                <p className="text-xs text-gray-400">{card.label}</p>
                {card.latest && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatAmount(card.latest.amount)} • {card.latest.time}
                  </p>
                )}
              </div>
            </div>
            <Badge variant="secondary" className={`${card.textColor} text-lg font-bold`}>
              {card.count}
            </Badge>
          </div>
        </Card>
      ))}

      {/* System Health */}
      <Card className="bg-black/20 border-2 border-gray-500/30 p-3 mt-4">
        <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase">System Health</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Status</span>
            <Badge 
              variant={summary.systemHealth === 'healthy' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {summary.systemHealth === 'healthy' ? '✅ Healthy' : '⚠️ Warning'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Connections</span>
            <span className="text-white font-medium">🔌 {summary.websocketConnections}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Error Rate</span>
            <span className="text-white font-medium">
              {summary.errorRate < 1 ? '✅' : '⚠️'} {summary.errorRate.toFixed(2)}%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};