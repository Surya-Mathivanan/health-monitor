import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from 'date-fns';
import type { BMIStatus, VisceralFlag, Client, CallLog, Reminder } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date helpers ───────────────────────────────────────────────────────────

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  return format(new Date(date), fmt);
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function dueDateLabel(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isPast(d)) return `Overdue · ${formatDate(d)}`;
  return formatDate(d);
}

// ─── Health flag helpers ─────────────────────────────────────────────────────

export function getBMIStatusColor(status: BMIStatus) {
  const map: Record<BMIStatus, string> = {
    underweight: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    normal:      'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    overweight:  'text-amber-400 bg-amber-400/10 border-amber-400/20',
    obese:       'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return map[status] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/20';
}

export function getVisceralFlagColor(flag: VisceralFlag) {
  const map: Record<VisceralFlag, string> = {
    normal:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    high:     'text-amber-400 bg-amber-400/10 border-amber-400/20',
    very_high:'text-red-400 bg-red-400/10 border-red-400/20',
  };
  return map[flag] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/20';
}

export function getBMIStatusLabel(status: BMIStatus) {
  const map: Record<BMIStatus, string> = {
    underweight: 'Underweight',
    normal: 'Normal',
    overweight: 'Overweight',
    obese: 'Obese',
  };
  return map[status] ?? status;
}

export function getVisceralFlagLabel(flag: VisceralFlag) {
  const map: Record<VisceralFlag, string> = {
    normal: 'Normal',
    high: 'High',
    very_high: 'Very High',
  };
  return map[flag] ?? flag;
}

// ─── Call outcome helpers ────────────────────────────────────────────────────

export function getOutcomeColor(outcome: string) {
  const map: Record<string, string> = {
    connected: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    missed:    'text-red-400 bg-red-400/10 border-red-400/20',
    voicemail: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  };
  return map[outcome] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/20';
}

export function getOutcomeLabel(outcome: string) {
  return outcome.charAt(0).toUpperCase() + outcome.slice(1);
}

// ─── Engagement Score ────────────────────────────────────────────────────────

export function computeEngagementScore(params: {
  lastCallDaysAgo: number | null;
  lastReportDaysAgo: number | null;
  reminderCompletionRate: number; // 0–1
}): number {
  const { lastCallDaysAgo, lastReportDaysAgo, reminderCompletionRate } = params;

  const callScore = lastCallDaysAgo === null ? 0
    : lastCallDaysAgo <= 7 ? 40
    : lastCallDaysAgo <= 14 ? 25
    : lastCallDaysAgo <= 30 ? 10
    : 0;

  const reportScore = lastReportDaysAgo === null ? 0
    : lastReportDaysAgo <= 30 ? 35
    : lastReportDaysAgo <= 60 ? 20
    : lastReportDaysAgo <= 90 ? 10
    : 0;

  const reminderScore = Math.round(reminderCompletionRate * 25);
  return Math.min(100, callScore + reportScore + reminderScore);
}

export function getEngagementColor(score: number) {
  if (score >= 70) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (score >= 40) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
  return 'text-red-400 bg-red-400/10 border-red-400/20';
}

// ─── Initials ────────────────────────────────────────────────────────────────

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

// ─── BMI computation (client-side for immediate preview) ───────────────────

export function computeBMI(weight_kg: number, height_cm: number): number {
  const h = height_cm / 100;
  return parseFloat((weight_kg / (h * h)).toFixed(1));
}

export function computeBMIStatus(bmi: number): BMIStatus {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

export function computeVisceralFlag(level: number): VisceralFlag {
  if (level <= 9) return 'normal';
  if (level <= 14) return 'high';
  return 'very_high';
}

// ─── Reminder helpers ────────────────────────────────────────────────────────

export function getReminderStatusColor(status: string) {
  const map: Record<string, string> = {
    pending:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
    completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    snoozed:   'text-sky-400 bg-sky-400/10 border-sky-400/20',
  };
  return map[status] ?? 'text-slate-400 bg-slate-400/10 border-slate-400/20';
}
