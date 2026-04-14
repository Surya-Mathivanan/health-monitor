import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAddClient, useWellnessPrograms } from '@/hooks/useClients';
import { useToast } from '@/components/ui/Toast';
import type { AddClientForm } from '@/types';

const schema = z.object({
  full_name: z.string().min(2, 'Name required'),
  mobile: z.string().min(7, 'Enter a valid mobile number'),
  age: z.coerce.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other']),
  height_cm: z.coerce.number().min(50).max(250),
  weight_kg: z.coerce.number().min(10).max(500),
  assigned_program_id: z.string().optional(),
});

export function AddClientModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: programs = [] } = useWellnessPrograms();
  const addClient = useAddClient();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddClientForm>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: AddClientForm) {
    try {
      const client = await addClient.mutateAsync(data);
      success('Client added', `${data.full_name} has been added successfully`);
      reset();
      onClose();
      navigate(`/clients/${client.id}`);
    } catch (e: any) {
      error('Failed to add client', e.message);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Add New Client"
      description="Enter the client's basic details to create their profile"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button form="add-client-form" type="submit" loading={isSubmitting} id="add-client-submit-btn">
            Create Profile
          </Button>
        </>
      }
    >
      <form id="add-client-form" onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input label="Full Name" placeholder="e.g. Priya Sharma" error={errors.full_name?.message} {...register('full_name')} />
        </div>
        <Input label="Mobile Number" placeholder="+91 98765 43210" error={errors.mobile?.message} {...register('mobile')} />
        <Input label="Age" type="number" placeholder="35" error={errors.age?.message} {...register('age')} />
        <Select
          label="Gender"
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ]}
          placeholder="Select gender"
          error={errors.gender?.message}
          {...register('gender')}
        />
        <Select
          label="Wellness Program"
          options={programs.map((p: any) => ({ value: p.id, label: p.name }))}
          placeholder="Select program (optional)"
          {...register('assigned_program_id')}
        />
        <Input label="Height (cm)" type="number" placeholder="165" error={errors.height_cm?.message} {...register('height_cm')} />
        <Input label="Weight (kg)" type="number" placeholder="70" error={errors.weight_kg?.message} {...register('weight_kg')} />
      </form>
    </Modal>
  );
}
