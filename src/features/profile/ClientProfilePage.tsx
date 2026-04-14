import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, User, Activity, FileText, MessageSquare,
  Calendar, Ruler, Weight, ChevronRight, Menu, MoreVertical
} from 'lucide-react';
import { useClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getInitials } from '@/lib/utils';
import { ProfileTabSidebar } from '@/components/layout/ProfileTabSidebar';
import { LatestReportTab } from '@/features/health/LatestReportTab';
import { HealthHistoryTab } from '@/features/health/HealthHistoryTab';
import { CallLogsTab } from '@/features/calls/CallLogsTab';
import { StaffNotesTab } from '@/features/notes/StaffNotesTab';
import { CallButton } from '@/features/calls/CallButton';

type Tab = 'report' | 'history' | 'calls' | 'notes';

const tabs = [
  { id: 'report' as Tab, label: 'Latest Report', icon: Activity },
  { id: 'history' as Tab, label: 'Health History', icon: FileText },
  { id: 'calls' as Tab, label: 'Call Logs', icon: Phone },
  { id: 'notes' as Tab, label: 'Staff Notes', icon: MessageSquare },
];

export function ClientProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('report');
  const [showTabSidebar, setShowTabSidebar] = useState(false);
  const { data: client, isLoading } = useClient(id);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6 animate-fade-in">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-24 bg-slate-700/50 rounded" />
          <div className="glass-card p-6 space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-700/50" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 bg-slate-700/50 rounded" />
                <div className="h-4 w-32 bg-slate-700/30 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4 lg:p-6 text-center py-20">
        <p className="text-slate-400">Client not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/clients')}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      {/* Profile tab sidebar for mobile */}
      <ProfileTabSidebar
        open={showTabSidebar}
        onClose={() => setShowTabSidebar(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Back */}
      <button
        onClick={() => navigate('/clients')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      {/* Profile header card */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl brand-gradient-bg flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-brand">
            {getInitials(client.full_name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-3 justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">{client.full_name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={client.status === 'active' ? 'success' : 'default'}>{client.status}</Badge>
                  {client.assigned_program && (
                    <Badge variant="gold">{(client.assigned_program as any).name}</Badge>
                  )}
                  <Badge variant="silver" className="capitalize">{client.gender}</Badge>
                </div>
              </div>
              <CallButton client={client} />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: Phone, label: 'Mobile', value: client.mobile },
                { icon: User, label: 'Age', value: `${client.age} years` },
                { icon: Ruler, label: 'Height', value: `${client.height_cm} cm` },
                { icon: Weight, label: 'Weight', value: `${client.weight_kg} kg` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-800/40 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">{label}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Desktop view with horizontal tabs + Mobile menu button */}
      <div className="flex items-center justify-between lg:justify-start gap-3">
        {/* Desktop tabs (hidden on mobile) */}
        <div className="hidden lg:flex tab-row">
          {tabs.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              id={`tab-${tabId}`}
              onClick={() => setActiveTab(tabId)}
              className={activeTab === tabId ? 'tab-btn-active' : 'tab-btn'}
            >
              <span className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile tab display + More button */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Current tab label */}
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">{tabs.find(t => t.id === activeTab)?.label}</span>
          </div>

          {/* More button */}
          <button
            onClick={() => setShowTabSidebar(true)}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-700/50 rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowTabSidebar(true)}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-700/50 rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
           <button
            onClick={() => setShowTabSidebar(true)}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-slate-700/50 rounded-lg transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'report'   && <LatestReportTab clientId={id} client={client} />}
        {activeTab === 'history'  && <HealthHistoryTab clientId={id} />}
        {activeTab === 'calls'    && <CallLogsTab clientId={id} />}
        {activeTab === 'notes'    && <StaffNotesTab clientId={id} />}
      </div>
    </div>
  );
}
