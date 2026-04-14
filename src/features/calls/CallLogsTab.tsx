import { useState } from 'react';
import { Phone, PhoneCall, Clock, CheckCircle, Volume2, FileText } from 'lucide-react';
import { useCallLogs, useLogCall } from '@/hooks/useCalls';
import { CallEndedModal } from './CallEndedModal';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { getOutcomeColor, getOutcomeLabel, formatDateTime, formatRelative } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';

export function CallLogsTab({ clientId }: { clientId: string }) {
  const { data: logs = [], isLoading } = useCallLogs(clientId);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const paginatedLogs = logs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const outcomeIcon: Record<string, React.ReactNode> = {
    connected: <CheckCircle className="w-3.5 h-3.5" />,
    missed:    <PhoneCall className="w-3.5 h-3.5" />,
    voicemail: <Volume2 className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Call Logs</h2>
        <button
          id="log-call-manually-btn"
          onClick={() => setShowModal(true)}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" /> Log call manually
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="glass-card p-4 h-20" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card><CardContent className="text-center py-12">
          <Phone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No calls logged yet</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedLogs.map(log => (
              <div key={log.id} className="glass-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`status-badge ${getOutcomeColor(log.outcome)}`}>
                      {outcomeIcon[log.outcome]}
                      {getOutcomeLabel(log.outcome)}
                    </span>
                    {log.duration_seconds && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {Math.floor(log.duration_seconds / 60)}m {log.duration_seconds % 60}s
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">{formatRelative(log.called_at)}</span>
                </div>
                {log.discussion_notes && (
                  <p className="text-sm text-slate-300 bg-slate-800/40 rounded-lg p-3">{log.discussion_notes}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatDateTime(log.called_at)}</span>
                  {log.follow_up_required && <Badge variant="warning">Follow-up set</Badge>}
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <CallEndedModal open={showModal} onClose={() => setShowModal(false)} clientId={clientId} />
    </div>
  );
}
