# 🌿 LifeCare Wellness

**Comprehensive Client Health & Call Management System for Wellness Professionals**

A full-stack web application built with **React + Vite (TypeScript)**, **Tailwind CSS**, and **Supabase** — featuring real-time updates, Google OAuth, JWT authentication, health metrics tracking, call management, automated reminders, and a fully responsive mobile-first design.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 8 (TypeScript) |
| Styling | Tailwind CSS v3 + custom design tokens |
| Routing | React Router DOM v7 |
| State & Data | TanStack Query (React Query v5) |
| Forms & Validation | React Hook Form + Zod |
| Auth & Database | Supabase (PostgreSQL + Auth) |
| Charts | Recharts |
| Icons | Lucide React |
| Date Handling | date-fns |

---

## ✨ Features

### 🔐 Authentication
- **Google OAuth** — one-click sign in with Gmail
- **Email/Password** — traditional login + registration with email confirmation
- **JWT tokens** — fully managed by Supabase Auth; session is auto-refreshed
- Protected routes — unauthenticated users are redirected to login

### 📊 Dashboard
- **4 KPI cards** — Active Clients, Calls This Week, Follow-Ups Due Today, Reports This Month
- **Weekly call volume** bar chart (Recharts)
- **Due Today** reminder list with quick-complete button
- **Recent Activity** feed from the audit log

### 👤 Client Management
- Searchable, filterable client grid (by name, program, gender, status)
- **Add Client** slide-over form with full validation
- Client card shows name, program badge, engagement score, and last contact
- Real-time debounced search via Supabase `.ilike()` queries

### 📋 Client Profile (4 Tabs)
| Tab | Contents |
|---|---|
| Latest Report | Body composition metrics with auto-flagged status badges |
| Health History | Sortable table + multi-metric trend line chart |
| Call Logs | Outcome chips, duration, notes, follow-up indicator |
| Staff Notes | Pin/unpin notes, add/delete with timestamps |

### 🏋️ Health Tracking
Logs all 6 body composition metrics per client:
- Body Fat % · Visceral Fat · BMI · Resting BMR · Body Age · Skeletal Muscle Mass

**Auto-computed flags** (via Postgres trigger on INSERT):
- BMI Status: Underweight / Normal / Overweight / Obese
- Visceral Fat Flag: Normal / High / Very High

### 📞 Call Management
- **"Call Now"** button: opens native phone dialer on mobile, modal on desktop
- **Call Ended Modal**: log outcome (Connected / Missed / Voicemail), notes, duration
- **Follow-up reminder** toggle — set date/time + title directly from call modal

### 🔔 Reminders
- Full Reminders page with **Pending / Completed / All** filter tabs
- **Realtime sync** via Supabase Realtime — updates instantly across all logged-in staff
- Overdue reminders highlighted in red
- Complete button updates status with one click

### 📝 Staff Notes
- Add free-text notes per client
- **Pin important notes** to the top
- Edit/delete with author + timestamp shown

### 🔔 Notifications
- Bell icon with unread badge in the top bar
- Dropdown with full notification list
- Mark all as read button

### 📈 Engagement Score
- Computed 0-100 score per client based on:
  - Call frequency (last 7 / 14 / 30 days)
  - Report recency (last 30 / 60 / 90 days)
  - Reminder completion rate

### 🌙 Dark Mode
- Full dark/light mode toggle — stored in `localStorage`
- Respects system preference on first load

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Button, Card, Badge, Input, Modal, Toast
│   └── layout/       # AppLayout, Sidebar, TopBar, BottomNav
├── features/
│   ├── auth/         # LoginPage, AuthGuard, AuthCallback, AuthProvider
│   ├── dashboard/    # DashboardPage + KPI cards
│   ├── clients/      # ClientsPage + AddClientModal
│   ├── profile/      # ClientProfilePage (4 tabs)
│   ├── health/       # LatestReportTab + HealthHistoryTab
│   ├── calls/        # CallButton + CallEndedModal + CallLogsTab
│   ├── reminders/    # RemindersPage
│   ├── notes/        # StaffNotesTab
│   └── notifications/# NotificationBell
├── hooks/            # useClients, useHealthReports, useCalls, useReminders, etc.
├── lib/              # supabase.ts, queryClient.ts, utils.ts
├── types/            # All TypeScript interfaces matching DB schema
└── supabase/
    └── migrations/   # SQL scripts to run in Supabase
```

---

## 🗄️ Database Schema (9 Tables)

```
users              roles: admin | staff
clients            status: active | inactive
wellness_programs  name, description, target_metrics (JSONB)
health_reports     6 metrics + auto-computed bmi_status + visceral_flag
call_logs          outcome + notes + follow_up_required
reminders          status: pending | completed | snoozed (Realtime enabled)
staff_notes        is_pinned, author
notifications      type: follow_up | system (Realtime enabled)
audit_logs         full audit trail of all writes
```

All tables have **Row Level Security (RLS)** enabled.

---

## ⚙️ Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd "Health Monitor Web"
npm install
```

### 2. Set Up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration files **in order**:
   - `src/supabase/migrations/001_schema.sql`
   - `src/supabase/migrations/002_rls.sql`
   - `src/supabase/migrations/003_triggers.sql`
   - `src/supabase/migrations/004_seed.sql`

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in: Supabase Dashboard → Project Settings → API

### 4. Enable Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create an OAuth 2.0 Client ID (Web Application)
3. Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`
4. In Supabase Dashboard → Authentication → Providers → Enable Google
5. Paste your Google Client ID and Secret

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📱 Responsive Design

| Screen | Layout |
|---|---|
| Mobile < 640px | Bottom nav bar, card stacks, full-screen modals |
| Tablet 640–1024px | Condensed sidebar + scrollable tabs |
| Desktop > 1024px | Full sidebar with labels + split-pane profile |

---

## 🛡️ Security

- All Supabase credentials stored in `.env` (never committed to git)
- Row Level Security on every table — staff can only access their own data
- Admin role gets full access via `is_admin()` Postgres function
- JWT tokens auto-managed and refreshed by Supabase Auth

---

## 🚢 Deployment

### Frontend → Vercel

1. Push repo to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Deploy — Vercel auto-detects Vite

### Backend → Supabase (already live)
No additional deployment needed — Supabase manages the database, auth, and Realtime.

---

## 📄 License

MIT © LifeCare Wellness



```

-- Clear all app data AND all auth users
-- WARNING: This logs everyone out and removes all accounts permanently

TRUNCATE TABLE
  public.co_partner_invitations,
  public.audit_logs,
  public.notifications,
  public.staff_notes,
  public.reminders,
  public.call_logs,
  public.health_reports,
  public.clients,
  public.wellness_programs,
  public.users
CASCADE;

-- Delete all auth/login users
DELETE FROM auth.users;

```