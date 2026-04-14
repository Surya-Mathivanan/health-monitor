import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, User, Phone, Activity } from 'lucide-react';
import { useClients, useWellnessPrograms } from '@/hooks/useClients';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AddClientModal } from './AddClientModal';
import { getEngagementColor, getInitials, formatRelative } from '@/lib/utils';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useCallback(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay])();
  return debouncedValue;
}

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const debouncedSearch = useDebounce(search);
  const { data: clients = [], isLoading } = useClients(debouncedSearch, filters);
  const { data: programs = [] } = useWellnessPrograms();
  const navigate = useNavigate();

  return (
    <>
      <LoadingOverlay isLoading={isLoading} message="Loading clients..." />
      <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-slate-400 text-sm mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''} found</p>
        </div>
        <Button id="add-client-btn" onClick={() => setShowAddModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Client
        </Button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            id="client-search"
            placeholder="Search clients by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button variant="outline" size="md" onClick={() => setShowFilters(f => !f)} leftIcon={<Filter className="w-4 h-4" />}>
          Filter
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass-card p-4 grid sm:grid-cols-3 gap-4 animate-slide-down">
          <div>
            <label className="form-label">Gender</label>
            <select
              className="form-input"
              value={filters.gender || ''}
              onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="form-label">Program</label>
            <select
              className="form-input"
              value={filters.program || ''}
              onChange={e => setFilters(f => ({ ...f, program: e.target.value }))}
            >
              <option value="">All Programs</option>
              {programs.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={filters.status || ''}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            className="sm:col-span-3 text-xs text-slate-500 hover:text-red-400 text-left transition-colors"
            onClick={() => setFilters({})}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Client Grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse space-y-3">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-700/50 rounded" />
                  <div className="h-3 w-24 bg-slate-700/30 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-20">
          <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No clients found</p>
          <p className="text-slate-600 text-sm mt-1">Try adjusting your search or add a new client</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div
              key={client.id}
              id={`client-card-${client.id}`}
              className="glass-card-hover p-5 cursor-pointer"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl brand-gradient-bg flex items-center justify-center text-white font-bold flex-shrink-0">
                  {getInitials(client.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white truncate">{client.full_name}</p>
                    <Badge variant={client.status === 'active' ? 'success' : 'default'}>
                      {client.status}
                    </Badge>
                  </div>
                  {client.assigned_program && (
                    <p className="text-xs text-emerald-400 mt-1">{(client.assigned_program as any).name}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
                    <Phone className="w-3 h-3" />
                    <span>{client.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-slate-500">{client.gender} · {client.age}y</span>
                    {client.engagement_score !== undefined && (
                      <span className={`status-badge text-[10px] ${getEngagementColor(client.engagement_score)}`}>
                        Score: {client.engagement_score}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddClientModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
    </>
  );
}
