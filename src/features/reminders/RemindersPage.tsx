import { useState, useCallback, useEffect } from 'react';
import { Bell, CheckCircle2, Clock, ChevronRight, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReminders, useCompleteReminder, useRealtimeReminders } from '@/hooks/useReminders';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { getReminderStatusColor, dueDateLabel } from '@/lib/utils';
import { isPast } from 'date-fns';
import type { ReminderStatus } from '@/types';
import { Pagination } from '@/components/ui/Pagination';

import { AddReminderModal } from './AddReminderModal';

type Filter = 'pending' | 'completed' | 'all';

export function RemindersPage() {
  const [filter, setFilter] = useState<Filter>('pending');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: reminders = [], isLoading } = useReminders(filter === 'all' ? undefined : filter as ReminderStatus);
  const completeReminder = useCompleteReminder();

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(reminders.length / itemsPerPage);
  const paginatedReminders = reminders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [filter]);

  // Realtime sync
  const onRealtimeUpdate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['reminders'] });
  }, [qc]);
  useRealtimeReminders(onRealtimeUpdate);

  const filterBtns: { key: Filter; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'completed', label: 'Completed' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reminders</h1>
          <p className="text-slate-400 text-sm mt-1">Manage follow-ups and scheduled tasks</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>Schedule Task</Button>
      </div>

      <AddReminderModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filterBtns.map(({ key, label }) => (
          <button
            key={key}
            id={`reminder-filter-${key}`}
            onClick={() => setFilter(key)}
            className={filter === key ? 'tab-btn-active' : 'tab-btn'}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-card h-24 animate-pulse" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <Card><CardContent className="text-center py-16">
          <Bell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No {filter === 'all' ? '' : filter} reminders</p>
          <p className="text-slate-600 text-sm mt-1">
            {filter === 'pending' ? 'All caught up — great work!' : 'Reminders will appear here'}
          </p>
        </CardContent></Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedReminders.map(r => {
              const overdue = r.status === 'pending' && isPast(new Date(r.due_at));
              return (
                <div
                  key={r.id}
                  className={`glass-card p-4 space-y-3 ${overdue ? 'border-red-500/30' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      overdue ? 'bg-red-400' : r.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-white text-sm">{r.title}</p>
                          {r.client && (
                            <button
                              onClick={() => navigate(`/clients/${(r as any).client?.id}`)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-0.5 transition-colors"
                            >
                              {(r as any).client?.full_name}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <span className={`status-badge flex-shrink-0 ${getReminderStatusColor(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className={`text-xs ${overdue ? 'text-red-400 font-medium' : 'text-slate-500'}`}>
                          {dueDateLabel(r.due_at)}
                        </span>
                      </div>
                      {r.notes && <p className="text-xs text-slate-400 mt-2 bg-slate-800/40 rounded-lg px-3 py-2">{r.notes}</p>}
                    </div>
                  </div>

                  {r.status === 'pending' && (
                    <div className="flex justify-end">
                      <Button
                        id={`complete-reminder-${r.id}`}
                        size="sm"
                        variant="secondary"
                        loading={completeReminder.isPending}
                        onClick={() => completeReminder.mutate(r.id)}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
