import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useClients } from '@/hooks/useClients';
import { useAddReminder } from '@/hooks/useReminders';
import { useToast } from '@/components/ui/Toast';
import type { AddReminderForm } from '@/types';

const schema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  due_at: z.string().min(1, 'Please select a date and time'),
  notes: z.string().optional(),
});

export function AddReminderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: clients = [] } = useClients(); // fetches all active clients
  const addReminder = useAddReminder();
  const { success, error } = useToast();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddReminderForm>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: AddReminderForm) {
    try {
      // Ensure the datetime is formatted correctly as ISO
      const isoDate = new Date(data.due_at).toISOString();
      await addReminder.mutateAsync({ ...data, due_at: isoDate });
      
      success('Task Scheduled', 'The reminder has been set successfully');
      reset();
      onClose();
    } catch (e: any) {
      error('Failed to schedule task', e.message);
    }
  }

  // Format clients for dropdown (prioritize mobile identity)
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.mobile} (${c.full_name})`
  }));

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Schedule Task"
      description="Set a specific date and time for a client follow-up or task."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button form="schedule-task-form" type="submit" loading={isSubmitting} id="schedule-task-submit-btn">
            Create Schedule
          </Button>
        </>
      }
    >
      <form id="schedule-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Client (Identified by Mobile Number)"
          options={clientOptions}
          placeholder="Select a client..."
          error={errors.client_id?.message}
          {...register('client_id')}
        />
        
        <Input 
          label="Task Title" 
          placeholder="e.g. Follow up on diet plan" 
          error={errors.title?.message} 
          {...register('title')} 
        />
        
        <Input 
          label="Date & Time" 
          type="datetime-local"
          error={errors.due_at?.message} 
          {...register('due_at')} 
        />
        
        <Textarea 
          label="Notes (Optional)" 
          placeholder="Any specific talking points..."
          rows={3}
          error={errors.notes?.message} 
          {...register('notes')} 
        />
      </form>
    </Modal>
  );
}
