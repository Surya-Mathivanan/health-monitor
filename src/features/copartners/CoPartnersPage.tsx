import { useState } from 'react';
import {
  Users2, UserPlus, Mail, Lock, User, X, ChevronRight,
  ArrowLeft, Eye, EyeOff, Trash2, Search, Shield,
  Clock, CheckCircle2, XCircle, Send,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCoPartners, useSentPendingInvitations, useReceivedInvitations,
  useCoPartnerClients, useInviteCoPartner,
  useRemoveCoPartner, useAcceptInvitation, useDeclineInvitation,
  type CoPartner, type CoPartnerInvitation,
} from '@/hooks/useCoPartners';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { formatRelative } from '@/lib/utils';
import type { Client } from '@/types';

// ─── Schemas ──────────────────────────────────────────────────────────────────
const inviteSchema = z.object({
  email: z.string().email('Enter a valid email'),
  display_name: z.string().optional(),
});
type InviteForm = z.infer<typeof inviteSchema>;

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({ onClose }: { onClose: () => void }) {
  const [apiError, setApiError] = useState('');
  
  const form = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });
  const inviteCoPartner = useInviteCoPartner();

  async function handleSubmit(data: InviteForm) {
    setApiError('');
    try {
      await inviteCoPartner.mutateAsync({
        email: data.email,
        display_name: data.display_name,
      });
      onClose();
    } catch (e: any) {
      setApiError(e?.message ?? 'Failed to send invitation.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Co-Partner</h2>
              <p className="text-xs text-slate-400">Invite someone to manage clients with you</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400">
            {apiError}
          </div>
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <Input
            id="invite-email"
            label="Email Address"
            type="email"
            placeholder="partner@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={form.formState.errors.email?.message}
            {...form.register('email')}
          />
          <Input
            id="invite-name"
            label="Full Name (Optional)"
            type="text"
            placeholder="Jane Doe"
            leftIcon={<User className="w-4 h-4" />}
            error={form.formState.errors.display_name?.message}
            {...form.register('display_name')}
          />
          <p className="text-xs text-slate-400 mb-2">
            If they are already registered, they will receive an in-app notification. If they are new, they will receive an email to create their account.
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={form.formState.isSubmitting || inviteCoPartner.isPending} leftIcon={<Send className="w-4 h-4" />}>
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Received Invitations Banner ──────────────────────────────────────────────
function ReceivedInvitationsBanner() {
  const { data: invitations = [] } = useReceivedInvitations();
  const accept = useAcceptInvitation();
  const decline = useDeclineInvitation();

  if (!invitations.length) return null;

  return (
    <div className="space-y-3">
      {invitations.map(inv => (
        <div key={inv.id} className="glass-card p-4 border border-violet-500/30 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Partner Request Received</p>
              <p className="text-sm text-slate-300 mt-0.5">
                <span className="text-violet-400 font-medium">{(inv.inviter as any)?.display_name ?? 'Someone'}</span>
                {' '}wants you to be their co-partner.
              </p>
              <p className="text-xs text-slate-500 mt-1">{formatRelative(inv.created_at)}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              variant="danger"
              className="flex-1"
              loading={decline.isPending}
              onClick={() => decline.mutate(inv.id)}
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
            >
              Decline
            </Button>
            <Button
              size="sm"
              className="flex-1"
              loading={accept.isPending}
              onClick={() => accept.mutate(inv.id)}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Accept
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Client detail for a partner ──────────────────────────────────────────────
function CoPartnerDetail({ partner, onBack }: { partner: CoPartner; onBack: () => void }) {
  const { data: clients = [], isLoading } = useCoPartnerClients(partner.id);
  const [search, setSearch] = useState('');
  const filtered = clients.filter(c => c.full_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-fade-in space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Co-Partners
      </button>
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center text-xl font-bold">
          {(partner.display_name ?? 'P').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-white">{partner.display_name}</h2>
          <p className="text-slate-400 text-sm">{partner.email}</p>
          <p className="text-slate-500 text-xs mt-0.5">Joined {formatRelative(partner.created_at)}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-violet-400">{partner.client_count}</p>
          <p className="text-slate-400 text-xs">clients</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Clients of {partner.display_name?.split(' ')[0]}</CardTitle>
            <Badge variant="info">{clients.length} total</Badge>
          </div>
          {clients.length > 5 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
                placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}
          {isLoading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-14 rounded-xl bg-slate-800/50 animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">{search ? 'No clients match your search.' : 'No clients yet.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((c: Client) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-violet-500/30 transition-all">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-sm font-bold">
                    {c.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.full_name}</p>
                    <p className="text-xs text-slate-400">{c.gender} · Age {c.age} · {c.mobile}</p>
                  </div>
                  <Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function CoPartnersPage() {
  const { data: partners = [], isLoading } = useCoPartners();
  const { data: pending = [] } = useSentPendingInvitations();
  const removeMutation = useRemoveCoPartner();

  const [showModal, setShowModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<CoPartner | null>(null);
  const [search, setSearch] = useState('');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  if (selectedPartner) {
    return (
      <div className="p-4 lg:p-6">
        <CoPartnerDetail partner={selectedPartner} onBack={() => setSelectedPartner(null)} />
      </div>
    );
  }

  const filtered = partners.filter(p =>
    p.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalClients = partners.reduce((s, p) => s + p.client_count, 0);

  return (
    <>
      {showModal && <InviteModal onClose={() => setShowModal(false)} />}
      <LoadingOverlay isLoading={isLoading} message="Loading co-partners..." />

      <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-violet-400" /> Co-Partners
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage and supervise your co-partners</p>
          </div>
          <Button id="add-copartner-btn" onClick={() => setShowModal(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
            Add Co-Partner
          </Button>
        </div>

        {/* Incoming partner requests */}
        <ReceivedInvitationsBanner />

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="kpi-card">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-2">
              <Users2 className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-white">{partners.length}</p>
            <p className="text-slate-400 text-sm mt-0.5">Active Partners</p>
          </div>
          <div className="kpi-card">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2">
              <User className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-white">{totalClients}</p>
            <p className="text-slate-400 text-sm mt-0.5">Clients Under Partners</p>
          </div>
          <div className="kpi-card col-span-2 lg:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-white">{pending.length}</p>
            <p className="text-slate-400 text-sm mt-0.5">Pending Requests</p>
          </div>
        </div>

        {/* Pending invitations sent */}
        {pending.length > 0 && (
          <Card>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <CardTitle>Pending Requests</CardTitle>
                <Badge variant="warning">{pending.length}</Badge>
              </div>
              <div className="space-y-2">
                {pending.map((inv: CoPartnerInvitation) => (
                  <div key={inv.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-amber-500/20">
                    <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{inv.invitee_email}</p>
                      <p className="text-xs text-slate-400">Waiting for their response · {formatRelative(inv.created_at)}</p>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(inv.id)}
                      className="p-1.5 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Cancel invitation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active partners list */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>All Co-Partners</CardTitle>
              <Badge variant="info">{partners.length} active</Badge>
            </div>

            {partners.length > 3 && (
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition"
                  placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
                />
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mx-auto mb-4">
                  <Users2 className="w-8 h-8" />
                </div>
                <h3 className="text-white font-semibold mb-1">No co-partners yet</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {search ? 'No co-partners match your search.' : 'Add your first co-partner to get started.'}
                </p>
                {!search && (
                  <Button onClick={() => setShowModal(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
                    Add Co-Partner
                  </Button>
                )}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="space-y-3">
                {filtered.map(partner =>
                  confirmRemoveId === partner.invitation_id ? (
                    <div key={partner.id} className="glass-card p-4 border border-red-500/30 flex items-center gap-4 animate-slide-up">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">
                          Remove <span className="text-red-400">{partner.display_name}</span>?
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">They will no longer be your co-partner.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setConfirmRemoveId(null)}>Cancel</Button>
                        <Button size="sm" variant="danger" loading={removeMutation.isPending} onClick={() => { removeMutation.mutate(partner.invitation_id); setConfirmRemoveId(null); }}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div key={partner.id} className="glass-card p-5 flex items-center gap-4 hover:border-violet-500/30 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {(partner.display_name ?? 'P').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{partner.display_name}</p>
                        <p className="text-slate-400 text-sm truncate">{partner.email}</p>
                        <p className="text-slate-500 text-xs mt-0.5">Added {formatRelative(partner.created_at)}</p>
                      </div>
                      <div className="text-center flex-shrink-0 px-3">
                        <p className="text-2xl font-bold text-violet-400">{partner.client_count}</p>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider">clients</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedPartner(partner)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                          View
                        </Button>
                        <button
                          onClick={() => setConfirmRemoveId(partner.invitation_id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
