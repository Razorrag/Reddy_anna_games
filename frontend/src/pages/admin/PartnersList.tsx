import { useState } from 'react';
import { Search, Download, RefreshCw, Eye, Users, DollarSign, TrendingUp, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { usePartnersQuery } from '@/hooks/queries/usePartnersQuery';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PartnerFilters {
  search: string;
  status: 'all' | 'active' | 'suspended' | 'banned';
  sortBy: 'created_desc' | 'created_asc' | 'earnings_desc' | 'referrals_desc';
  page: number;
  limit: number;
}

export default function PartnersList() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<PartnerFilters>({
    search: '',
    status: 'all',
    sortBy: 'created_desc',
    page: 1,
    limit: 20,
  });

  const { data, isLoading, refetch } = usePartnersQuery(filters);

  const partners = data?.partners || [];
  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  const handleFilterChange = (key: keyof PartnerFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Phone', 'Name', 'Status', 'Referrals', 'Active Users', 'Total Earnings', 'Pending', 'Joined'].join(','),
      ...partners.map((p: any) => [
        p.id,
        p.phone,
        p.full_name || '-',
        p.status,
        p.stats?.total_referrals || 0,
        p.stats?.active_referrals || 0,
        p.stats?.total_earnings || 0,
        p.stats?.pending_earnings || 0,
        format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `partners-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      suspended: 'warning',
      banned: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] via-[#1a1f3a] to-[#0A0E27] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Partners Management</h1>
            <p className="text-gray-400">Manage all registered partners and their commissions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-cyan-500/20 text-cyan-400"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="border-cyan-500/20 text-cyan-400"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              onClick={() => setLocation('/admin/partners/create')}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0A0E27]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Partner
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Partners', value: data?.total || 0, icon: Users, color: 'cyan' },
            { label: 'Active', value: data?.stats?.active || 0, icon: Users, color: 'green' },
            { label: 'Total Referrals', value: data?.stats?.total_referrals || 0, icon: TrendingUp, color: 'amber' },
            { label: 'Total Earnings', value: `₹${(data?.stats?.total_earnings || 0).toFixed(2)}`, icon: DollarSign, color: 'blue' },
            { label: 'Pending Payouts', value: `₹${(data?.stats?.pending_payouts || 0).toFixed(2)}`, icon: DollarSign, color: 'yellow' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">{stat.label}</div>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div className={`text-2xl font-bold text-${stat.color}-400`}>
                {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search by phone, name, or ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest First</SelectItem>
                <SelectItem value="created_asc">Oldest First</SelectItem>
                <SelectItem value="earnings_desc">Highest Earnings</SelectItem>
                <SelectItem value="referrals_desc">Most Referrals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Partners Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-400 mb-2">No partners found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Partner</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Phone</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Referrals</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Active Users</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Total Earnings</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Pending</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {partners.map((partner: any) => (
                    <tr key={partner.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white font-medium">{partner.full_name || 'No Name'}</div>
                          <div className="text-xs text-gray-400">ID: {partner.id.slice(0, 8)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{partner.phone}</td>
                      <td className="px-4 py-3">{getStatusBadge(partner.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-cyan-400 font-bold">
                          {partner.stats?.total_referrals || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-green-400 font-medium">
                          {partner.stats?.active_referrals || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-blue-400 font-bold text-lg">
                          ₹{(partner.stats?.total_earnings || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-amber-400 font-medium">
                          ₹{(partner.stats?.pending_earnings || 0).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {format(new Date(partner.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => navigate(`/admin/partners/${partner.id}`)}
                          size="sm"
                          variant="ghost"
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, data?.total || 0)} of {data?.total || 0} partners
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={filters.page === 1}
                variant="outline"
                size="sm"
                className="border-white/10 text-white"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    onClick={() => setFilters(prev => ({ ...prev, page }))}
                    variant={filters.page === page ? 'default' : 'outline'}
                    size="sm"
                    className={filters.page === page
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'border-white/10 text-white'
                    }
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={filters.page === totalPages}
                variant="outline"
                size="sm"
                className="border-white/10 text-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Performers</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Most Referrals</div>
              <div className="text-white font-medium">
                {data?.topPerformers?.most_referrals?.full_name || 'N/A'}
              </div>
              <div className="text-cyan-400 text-sm">
                {data?.topPerformers?.most_referrals?.referrals || 0} referrals
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Highest Earnings</div>
              <div className="text-white font-medium">
                {data?.topPerformers?.highest_earnings?.full_name || 'N/A'}
              </div>
              <div className="text-green-400 text-sm">
                ₹{(data?.topPerformers?.highest_earnings?.earnings || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Most Active Users</div>
              <div className="text-white font-medium">
                {data?.topPerformers?.most_active?.full_name || 'N/A'}
              </div>
              <div className="text-amber-400 text-sm">
                {data?.topPerformers?.most_active?.active_users || 0} active
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}