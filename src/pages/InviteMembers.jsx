import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Clock, X, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import moment from 'moment';

const ROLES = [
  { value: 'ADMIN', label: 'Admin — Manage members & boards' },
  { value: 'MEMBER', label: 'Member — Create & edit cards' },
  { value: 'VIEWER', label: 'Viewer — Read-only access' },
];

export default function InviteMembers() {
  const { user } = useAuth();
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [sending, setSending] = useState(false);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!selectedWorkspaceId) { setLoading(false); return; }
    try {
      const data = await base44.entities.Invitation.filter({ workspace: selectedWorkspaceId }, '-created_date', 100);
      setInvites(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedWorkspaceId]);

  const send = async (e) => {
    e.preventDefault();
    if (!email.trim() || !selectedWorkspace) return;
    setSending(true);
    try {
      await base44.entities.Invitation.create({
        email: email.trim().toLowerCase(),
        workspace: selectedWorkspace.id,
        workspace_name: selectedWorkspace.name,
        invitedBy: user.id,
        role,
        status: 'PENDING',
        token: Math.random().toString(36).slice(2) + Date.now().toString(36),
      });
      try { await base44.users.inviteUser(email.trim().toLowerCase(), 'user'); } catch { /* may already exist */ }
      toast({ title: 'Invitation sent', description: `An invite was sent to ${email}.` });
      setEmail('');
      load();
    } catch (err) {
      toast({ title: 'Could not send invite', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const revoke = async (inv) => {
    await base44.entities.Invitation.update(inv.id, { status: 'REVOKED' });
    setInvites((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: 'REVOKED' } : i)));
    toast({ title: 'Invitation revoked' });
  };

  const pending = invites.filter((i) => i.status === 'PENDING');

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader icon={UserPlus} title="Invite Members" description={selectedWorkspace ? `Send invitations to join "${selectedWorkspace.name}".` : 'Select a workspace to invite members.'} />

      {!selectedWorkspace ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={UserPlus} title="No workspace selected" description="Choose a workspace from the sidebar to send invitations." />
        </div>
      ) : (
        <>
          <form onSubmit={send} className="rounded-xl border border-border bg-card p-5 space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="invite-email" type="email" placeholder="colleague@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={sending || !email.trim()}>
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Send Invitation
            </Button>
          </form>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Pending Invitations ({pending.length})
            </h3>
            {loading ? (
              <div className="h-24 bg-muted/40 rounded-xl animate-pulse" />
            ) : pending.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card">
                <EmptyState icon={Mail} title="No pending invitations" description="Invitations you send will appear here until accepted." />
              </div>
            ) : (
              <div className="space-y-2">
                {pending.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">{inv.role} · Sent {moment(inv.created_date).fromNow()}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => revoke(inv)}>
                      <X className="w-3.5 h-3.5 mr-1.5" /> Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}