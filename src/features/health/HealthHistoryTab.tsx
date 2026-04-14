import { useState } from 'react';
import { useHealthReports } from '@/hooks/useHealthReports';
import { Card, CardContent } from '@/components/ui/Card';
import { Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';
import { formatDate } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-xs space-y-1">
        <p className="text-slate-300 font-medium mb-2">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function HealthHistoryTab({ clientId }: { clientId: string }) {
  const { data: reports = [], isLoading } = useHealthReports(clientId);

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const paginatedReports = reports.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const chartData = [...reports].reverse().map(r => ({
    date: formatDate(r.recorded_at, 'MMM d'),
    BMI: r.bmi,
    'Body Fat %': r.body_fat_pct,
    'Visceral Fat': r.visceral_fat,
    'Muscle Mass': r.skeletal_muscle_mass,
  }));

  if (isLoading) return <div className="glass-card h-64 animate-pulse" />;

  if (reports.length === 0) {
    return (
      <Card><CardContent className="text-center py-12">
        <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No historical data yet</p>
        <p className="text-slate-600 text-sm mt-1">Log health reports to see trends over time</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                {['Date', 'Body Fat', 'Visceral', 'BMI', 'BMR', 'Body Age', 'Muscle'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 font-medium uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map(r => (
                <tr key={r.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{formatDate(r.recorded_at, 'MMM d, yy')}</td>
                  <td className="px-4 py-3 text-white">{r.body_fat_pct}%</td>
                  <td className="px-4 py-3 text-white">{r.visceral_fat}</td>
                  <td className="px-4 py-3 text-white">{r.bmi}</td>
                  <td className="px-4 py-3 text-white">{r.resting_bmr}</td>
                  <td className="px-4 py-3 text-white">{r.body_age}</td>
                  <td className="px-4 py-3 text-white">{r.skeletal_muscle_mass}kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pb-4"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>

      {/* Line Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardContent>
            <p className="font-semibold text-white mb-4">Trend Chart</p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Line type="monotone" dataKey="BMI" stroke="#10B981" strokeWidth={2} dot={{ r: 3, fill: '#10B981' }} />
                <Line type="monotone" dataKey="Body Fat %" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 3, fill: '#0EA5E9' }} />
                <Line type="monotone" dataKey="Visceral Fat" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3, fill: '#F59E0B' }} />
                <Line type="monotone" dataKey="Muscle Mass" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: '#8B5CF6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
