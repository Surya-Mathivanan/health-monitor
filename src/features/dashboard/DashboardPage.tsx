import { useState } from 'react';
import { Users, Phone, Clock, FileText, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useDashboardKPIs, useWeeklyCallData, useDueTodayReminders, useRecentActivity } from '@/hooks/useDashboard';
import { useCompleteReminder } from '@/hooks/useReminders';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelative, dueDateLabel } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';

function KPICard({ icon: Icon, label, value, color, subtitle }: {
  icon: React.ElementType; label: string; value: number; color: string; subtitle?: string;
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <TrendingUp className="w-4 h-4 text-emerald-400/50" />
      </div>
      <div>
        <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
        <p className="text-slate-400 text-sm mt-0.5">{label}</p>
        {subtitle && <p className="text-slate-600 text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-3 py-2 text-sm">
        <p className="text-slate-300">{label}</p>
        <p className="text-emerald-400 font-semibold">{payload[0].value} calls</p>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const { data: kpis, isLoading: kpiLoading } = useDashboardKPIs();
  const { data: weeklyData = [] } = useWeeklyCallData();
  const { data: dueToday = [] } = useDueTodayReminders();
  const { data: activity = [] } = useRecentActivity();
  const completeReminder = useCompleteReminder();

  const [activityPage, setActivityPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(activity.length / itemsPerPage);
  const paginatedActivity = activity.slice((activityPage - 1) * itemsPerPage, activityPage * itemsPerPage);

  return (
    <>
      <LoadingOverlay isLoading={kpiLoading} message="Loading dashboard..." />
      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back — here's your wellness overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="kpi-card animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-slate-700/50" />
              <div className="space-y-2">
                <div className="h-8 w-16 bg-slate-700/50 rounded" />
                <div className="h-3 w-24 bg-slate-700/30 rounded" />
              </div>
            </div>
          ))
        ) : (
          <>
            <KPICard icon={Users} label="Active Clients" value={kpis?.total_active_clients ?? 0}
              color="bg-emerald-500/15 text-emerald-400" />
            <KPICard icon={Phone} label="Calls This Week" value={kpis?.calls_this_week ?? 0}
              color="bg-sky-500/15 text-sky-400" />
            <KPICard icon={Clock} label="Follow-ups Today" value={kpis?.follow_ups_due_today ?? 0}
              color="bg-amber-500/15 text-amber-400" />
            <KPICard icon={FileText} label="Reports This Month" value={kpis?.reports_this_month ?? 0}
              color="bg-blue-500/15 text-blue-400" />
          </>
        )}
      </div>

      {/* Charts + Due Today */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Call Chart */}
        <Card className="lg:col-span-2">
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Weekly Call Volume</CardTitle>
              <Badge variant="info">This week</Badge>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                <Bar dataKey="calls" fill="url(#callGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#0EA5E9" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Due Today */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Due Today</CardTitle>
              <Badge variant="warning">{dueToday.length}</Badge>
            </div>
            {dueToday.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                <p className="text-slate-500 text-sm">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueToday.map(r => (
                  <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/40">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{r.title}</p>
                      <p className="text-xs text-slate-400">{(r as any).client?.full_name}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeReminder.mutate(r.id)}
                      loading={completeReminder.isPending}
                    >
                      Done
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-emerald-400" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          {activity.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No recent activity</p>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedActivity.map(a => (
                  <div key={a.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300">
                        <span className="font-medium text-white">{(a as any).actor?.display_name ?? 'System'}</span>
                        {' '}{a.action} in <span className="text-emerald-400">{a.table_name}</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 flex-shrink-0">{formatRelative(a.created_at)}</p>
                  </div>
                ))}
              </div>
              <Pagination currentPage={activityPage} totalPages={totalPages} onPageChange={setActivityPage} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
