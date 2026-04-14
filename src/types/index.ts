// ─── Database Row Types ─────────────────────────────────────────────────────

export type UserRole = 'admin' | 'staff';
export type ClientStatus = 'active' | 'inactive';
export type CallOutcome = 'connected' | 'missed' | 'voicemail';
export type ReminderStatus = 'pending' | 'completed' | 'snoozed';
export type BMIStatus = 'underweight' | 'normal' | 'overweight' | 'obese';
export type VisceralFlag = 'normal' | 'high' | 'very_high';
export type NotificationType = 'follow_up' | 'system';
export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: UserRole;
  // Doctor/Advisor profile details
  position?: string;
  personal_number?: string;
  degree?: string;
  experience?: string;
  created_at: string;
}

export interface WellnessProgram {
  id: string;
  name: string;
  description: string;
  target_metrics: Record<string, unknown>;
  created_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  mobile: string;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  assigned_program_id?: string;
  assigned_program?: WellnessProgram;
  created_by: string;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
  // Computed
  engagement_score?: number;
  last_contact?: string;
}

export interface HealthReport {
  id: string;
  client_id: string;
  recorded_at: string;
  body_fat_pct: number;
  visceral_fat: number;
  bmi: number;
  resting_bmr: number;
  body_age: number;
  skeletal_muscle_mass: number;
  bmi_status: BMIStatus;
  visceral_flag: VisceralFlag;
  logged_by: string;
  created_at: string;
}

export interface CallLog {
  id: string;
  client_id: string;
  client?: Pick<Client, 'id' | 'full_name' | 'mobile'>;
  called_by: string;
  caller?: Pick<UserProfile, 'id' | 'display_name'>;
  called_at: string;
  duration_seconds?: number;
  outcome: CallOutcome;
  discussion_notes?: string;
  follow_up_required: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  client_id: string;
  client?: Pick<Client, 'id' | 'full_name'>;
  assigned_to: string;
  due_at: string;
  title: string;
  notes?: string;
  status: ReminderStatus;
  linked_call_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffNote {
  id: string;
  client_id: string;
  author_id: string;
  author?: Pick<UserProfile, 'id' | 'display_name' | 'avatar_url'>;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor?: Pick<UserProfile, 'id' | 'display_name'>;
  action: string;
  table_name: string;
  record_id: string;
  changed_fields?: Record<string, unknown>;
  created_at: string;
}

// ─── Dashboard KPI Types ────────────────────────────────────────────────────

export interface DashboardKPIs {
  total_active_clients: number;
  calls_this_week: number;
  follow_ups_due_today: number;
  reports_this_month: number;
}

// ─── Form Types ─────────────────────────────────────────────────────────────

export interface AddClientForm {
  full_name: string;
  mobile: string;
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  assigned_program_id?: string;
}

export interface HealthReportForm {
  body_fat_pct: number;
  visceral_fat: number;
  bmi: number;
  resting_bmr: number;
  body_age: number;
  skeletal_muscle_mass: number;
  recorded_at: string;
}

export interface CallEndedForm {
  outcome: CallOutcome;
  duration_seconds?: number;
  discussion_notes?: string;
  follow_up_required: boolean;
  follow_up_due_at?: string;
  follow_up_title?: string;
  follow_up_notes?: string;
}

export interface AddReminderForm {
  client_id: string;
  title: string;
  due_at: string;
  notes?: string;
}
