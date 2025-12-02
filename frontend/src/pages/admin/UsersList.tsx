import { useState } from 'react';
import { Search, Filter, Download, UserPlus, Ban, CheckCircle, XCircle, Eye, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { useUsersQuery } from '@/hooks/queries/useUsersQuery';
import { useBulkUserActionMutation } from '@/hooks/mutations/useBulkUserActionMutation';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UsersFilters {
  search: string;
  status: 'all' | 'active' | 'suspended' | 'banned';
  verification: 'all' | 'verified' | 'pending' | 'rejected';
  sortBy: 'created_desc' | 'created_asc' | 'balance_desc' | 'balance_asc';
  page: number;
  limit: number;
}

export default function UsersList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UsersFilters>({
    search: '',
    status: 'all',
    verification: 'all',
    sortBy: 'created_desc',
    page: 1,
    limit: 20,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  const { data, isLoading, refetch } = useUsersQuery(filters);
  const bulkActionMutation = useBulkUserActionMutation();

  const users = data?.users || [];
  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  const handleFilterChange = (key: keyof UsersFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) {
      toast.error('Please select action and users');
      return;
    }

    try {
      await bulkActionMutation.mutateAsync({
        userIds: selectedUsers,
        action: bulkAction,
      });
      toast.success(`Action applied to ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setBulkAction('');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to apply bulk action');
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Phone', 'Name', 'Balance', 'Status', 'Verified', 'Created'].join(','),
      ...users.map(u => [
        u.id,
        u.phone,
        u.full_name || '-',
        u.balance,
        u.status,
        u.is_verified ? 'Yes' : 'No',
        format(new Date(u.created_at), 'yyyy-MM-dd HH:mm'),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      suspended: 'warning',
      banned: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getVerificationBadge = (isVerified: boolean, status?: string) => {
    if (isVerified) return <Badge variant="success">VERIFIED</Badge>;
    if (status === 'rejected') return <Badge variant="destructive">REJECTED</Badge>;
    if (status === 'pending') return <Badge variant="warning">PENDING</Badge>;
    return <Badge variant="default">NOT VERIFIED</Badge>;
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
            <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
            <p className="text-gray-400">Manage all registered users</p>
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
              onClick={() => navigate('/admin/users/create')}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#0A0E27]"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: data?.total || 0, color: 'cyan' },
            { label: 'Active', value: data?.stats?.active || 0, color: 'green' },
            { label: 'Suspended', value: data?.stats?.suspended || 0, color: 'yellow' },
            { label: 'Banned', value: data?.stats?.banned || 0, color: 'red' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4"
            >
              <div className="text-gray-400 text-sm mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold text-${stat.color}-400`}>
                {stat.value.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="grid grid-cols-5 gap-4">
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

            <Select value={filters.verification} onValueChange={(v) => handleFilterChange('verification', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(v) => handleFilterChange('sortBy', v)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest First</SelectItem>
                <SelectItem value="created_asc">Oldest First</SelectItem>
                <SelectItem value="balance_desc">Highest Balance</SelectItem>
                <SelectItem value="balance_asc">Lowest Balance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="text-cyan-400">
              {selectedUsers.length} user(s) selected
            </div>
            <div className="flex items-center gap-3">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate</SelectItem>
                  <SelectItem value="suspend">Suspend</SelectItem>
                  <SelectItem value="ban">Ban</SelectItem>
                  <SelectItem value="verify">Verify</SelectItem>
                  <SelectItem value="unverify">Unverify</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkActionMutation.isPending}
                className="bg-gradient-to-r from-cyan-500 to-blue-500"
              >
                Apply Action
              </Button>
              <Button
                onClick={() => setSelectedUsers([])}
                variant="outline"
                className="border-cyan-500/20 text-cyan-400"
              >
                Clear
              </Button>
            </div>
          </motion.div>
        )}

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-400 mb-2">No users found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={selectedUsers.length === users.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Phone</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Balance</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Verified</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Joined</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-white font-medium">{user.full_name || 'No Name'}</div>
                          <div className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{user.phone}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-cyan-400 font-medium">₹{user.balance.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                      <td className="px-4 py-3">
                        {getVerificationBadge(user.is_verified, user.verification_status)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
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
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, data?.total || 0)} of {data?.total || 0} users
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
      </motion.div>
    </div>
  );
}