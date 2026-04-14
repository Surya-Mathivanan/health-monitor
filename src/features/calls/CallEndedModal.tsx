import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PhoneOff, Phone, Volume2, PhoneCall, Bell } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useLogCall } from '@/hooks/useCalls';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import type { CallEndedForm, CallOutcome } from '@/types';

const schema = z.object({
  outcome: z.enum(['connected', 'missed', 'voicemail']),
  duration_seconds: z.coerce.number().optional(),
  discussion_notes: z.string().optional(),
  follow_up_required: z.boolean(),
  follow_up_due_at: z.string().optional(),
  follow_up_title: z.string().optional(),
  follow_up_notes: z.string().optional(),
});

const outcomes: { value: CallOutcome; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'connected', label: 'Connected', icon: <Phone className="w-4 h-4" />, color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' },
  { value: 'missed',    label: 'Missed',    icon: <PhoneOff className="w-4 h-4" />, color: 'border-red-500/50 bg-red-500/10 text-red-400' },
  { value: 'voicemail', label: 'Voicemail', icon: <Volume2 className="w-4 h-4" />, color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
];

export function CallEndedModal({ open, onClose, clientId }: { open: boolean; onClose: () => void; clientId: string }) {
  const logCall = useLogCall();
  const { success, error } = useToast();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<CallEndedForm>({
    resolver: zodResolver(schema),
    defaultValues: { outcome: 'connected', follow_up_required: false },
  });

  const outcome = watch('outcome');
  const followUpRequired = watch('follow_up_required');

  async function onSubmit(data: CallEndedForm) {
    try {
      await logCall.mutateAsync({ clientId, form: data });
      success('Call logged', 'Call details have been saved');
      reset();
      onClose();
    } catch (e: any) {
      error('Failed to log call', e.message);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Call Ended"
      description="Log the outcome and any discussion notes"
      size="md"
      bottomSheet
      footer={
        <>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button form="call-ended-form" type="submit" loading={isSubmitting} id="save-call-btn">
            Save Call Log
          </Button>
        </>
      }
    >
      <form id="call-ended-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Outcome selector */}
        <div>
          <label className="form-label">Call Outcome</label>
          <div className="grid grid-cols-3 gap-2">
            {outcomes.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setValue('outcome', o.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 text-sm font-medium',
                  outcome === o.value ? o.color : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                )}
              >
                {o.icon}
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <Input
          label="Duration (seconds)"
          type="number"
          placeholder="e.g. 180 (3 mins)"
          {...register('duration_seconds')}
        />

        {/* Notes */}
        <Textarea
          label="Discussion Notes"
          placeholder="What was discussed? Any key points to remember…"
          rows={3}
          {...register('discussion_notes')}
        />

        {/* Follow-up toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
          <Bell className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Set Follow-up Reminder</p>
            <p className="text-xs text-slate-500">Schedule a reminder to follow up with this client</p>
          </div>
          <button
            type="button"
            onClick={() => setValue('follow_up_required', !followUpRequired)}
            className={cn(
              'w-11 h-6 rounded-full border transition-all duration-200 relative',
              followUpRequired
                ? 'bg-emerald-500 border-emerald-500'
                : 'bg-slate-700 border-slate-600'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
              followUpRequired && 'translate-x-5'
            )} />
          </button>
        </div>

        {/* Follow-up details */}
        {followUpRequired && (
          <div className="space-y-3 pl-4 border-l-2 border-amber-500/30 animate-slide-down">
            <Input
              label="Follow-up Date & Time"
              type="datetime-local"
              error={errors.follow_up_due_at?.message}
              min={new Date().toISOString().slice(0, 16)}
              {...register('follow_up_due_at')}
            />
            <Input
              label="Reminder Title"
              placeholder="e.g. Follow-up call — weight check"
              {...register('follow_up_title')}
            />
            <Textarea
              label="Reminder Notes"
              placeholder="Any context for the follow-up..."
              rows={2}
              {...register('follow_up_notes')}
            />
          </div>
        )}
      </form>
    </Modal>
  );
}
