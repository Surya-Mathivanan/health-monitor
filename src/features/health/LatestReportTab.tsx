import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Activity, AlertTriangle } from 'lucide-react';
import { useLatestHealthReport, useLogHealthReport } from '@/hooks/useHealthReports';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import {
  getBMIStatusColor, getBMIStatusLabel,
  getVisceralFlagColor, getVisceralFlagLabel,
  computeBMI, computeBMIStatus, computeVisceralFlag, formatDate
} from '@/lib/utils';
import type { Client, HealthReportForm } from '@/types';

const schema = z.object({
  body_fat_pct: z.coerce.number().min(1).max(75, 'Enter a valid body fat %'),
  visceral_fat: z.coerce.number().min(1).max(59, 'Enter a valid visceral fat level'),
  bmi: z.coerce.number().min(10).max(60),
  resting_bmr: z.coerce.number().min(500).max(5000),
  body_age: z.coerce.number().min(10).max(120),
  skeletal_muscle_mass: z.coerce.number().min(1).max(100),
  recorded_at: z.string().min(1, 'Date required'),
});

function MetricCard({ label, value, unit, colorClass, flag }: {
  label: string; value: number; unit: string; colorClass?: string; flag?: string;
}) {
  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-slate-500 text-sm pb-0.5">{unit}</p>
      </div>
      {flag && (
        <span className={`status-badge mt-2 ${colorClass}`}>{flag}</span>
      )}
    </div>
  );
}

export function LatestReportTab({ clientId, client }: { clientId: string; client: Client }) {
  const [showForm, setShowForm] = useState(false);
  const { data: report, isLoading } = useLatestHealthReport(clientId);
  const logReport = useLogHealthReport();
  const { success, error } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HealthReportForm>({
    resolver: zodResolver(schema),
    defaultValues: { recorded_at: new Date().toISOString().slice(0, 16) },
  });

  async function onSubmit(data: HealthReportForm) {
    try {
      await logReport.mutateAsync({ clientId, form: data });
      success('Report logged', 'Health report saved successfully');
      reset();
      setShowForm(false);
    } catch (e: any) {
      error('Failed to save', e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">Latest Health Report</h2>
        <Button id="log-health-report-btn" size="sm" onClick={() => setShowForm(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Log Report
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-pulse">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-800/40 rounded-xl h-24" />
          ))}
        </div>
      ) : !report ? (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No health reports yet</p>
            <p className="text-slate-600 text-sm mt-1">Log the first body composition report for this client</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Recorded on {formatDate(report.recorded_at, 'MMMM d, yyyy')}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <MetricCard label="Body Fat" value={report.body_fat_pct} unit="%" />
            <MetricCard
              label="Visceral Fat"
              value={report.visceral_fat}
              unit="level"
              colorClass={getVisceralFlagColor(report.visceral_flag)}
              flag={getVisceralFlagLabel(report.visceral_flag)}
            />
            <MetricCard
              label="BMI"
              value={report.bmi}
              unit=""
              colorClass={getBMIStatusColor(report.bmi_status)}
              flag={getBMIStatusLabel(report.bmi_status)}
            />
            <MetricCard label="Resting BMR" value={report.resting_bmr} unit="kcal" />
            <MetricCard label="Body Age" value={report.body_age} unit="yrs"
              colorClass={report.body_age > client.age + 5 ? 'text-red-400 bg-red-400/10 border-red-400/20' : undefined}
              flag={report.body_age > client.age + 5 ? 'High' : undefined}
            />
            <MetricCard label="Skeletal Muscle" value={report.skeletal_muscle_mass} unit="kg" />
          </div>
        </>
      )}

      {/* Log Report Modal */}
      <Modal
        open={showForm}
        onClose={() => { reset(); setShowForm(false); }}
        title="Log Health Report"
        description="Enter body composition measurements for this client"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => { reset(); setShowForm(false); }}>Cancel</Button>
            <Button form="health-report-form" type="submit" loading={isSubmitting}>Save Report</Button>
          </>
        }
      >
        <form id="health-report-form" onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
          <Input label="Recording Date" type="datetime-local" error={errors.recorded_at?.message} {...register('recorded_at')} />
          <Input label="Body Fat (%)" type="number" step="0.1" placeholder="e.g. 22.5" error={errors.body_fat_pct?.message} {...register('body_fat_pct')} hint="Normal: 10–25% (men), 18–32% (women)" />
          <Input label="Visceral Fat (level)" type="number" step="0.1" placeholder="e.g. 7" error={errors.visceral_fat?.message} {...register('visceral_fat')} hint="Normal: 1–9, High: 10–14, Very High: 15+" />
          <Input label="BMI" type="number" step="0.1" placeholder="e.g. 24.5" error={errors.bmi?.message} {...register('bmi')} hint="Normal: 18.5–24.9" />
          <Input label="Resting BMR (kcal)" type="number" placeholder="e.g. 1650" error={errors.resting_bmr?.message} {...register('resting_bmr')} />
          <Input label="Body Age (years)" type="number" placeholder="e.g. 32" error={errors.body_age?.message} {...register('body_age')} />
          <Input label="Skeletal Muscle Mass (kg)" type="number" step="0.1" placeholder="e.g. 28.4" error={errors.skeletal_muscle_mass?.message} {...register('skeletal_muscle_mass')} />
        </form>
      </Modal>
    </div>
  );
}
