import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Lock, LogOut, Building2, Mail, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

export default function Settings() {
  const { user, logout } = useAuth();
  const { workspaces, selectedWorkspace } = useWorkspace();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [saving, setSaving] = useState(false);

  const name = user?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: fullName });
      toast({ title: 'Profile updated', description: 'Your name has been saved.' });
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Profile</h2>
        </div>
        <Separator />
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-name">Full Name</Label>
            <Input
              id="settings-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={user?.email || ''} disabled className="pl-9 bg-muted/50" />
            </div>
            <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
          </div>
          <Button type="submit" disabled={saving || fullName === (user?.full_name || '')}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </form>
      </section>

      {/* Account */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Account</h2>
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Change Password</p>
            <p className="text-xs text-muted-foreground">Reset your password via email.</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/forgot-password">Reset Password</Link>
          </Button>
        </div>
        <Separator />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Log Out</p>
            <p className="text-xs text-muted-foreground">Sign out of your account on this device.</p>
          </div>
          <Button variant="destructive" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </section>

      {/* Workspace */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Workspace</h2>
        </div>
        <Separator />
        <div>
          <p className="text-sm font-medium mb-1">Current Workspace</p>
          {selectedWorkspace ? (
            <div className="flex items-center gap-2 mt-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: selectedWorkspace.color || '#6366f1' }}
              >
                {selectedWorkspace.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{selectedWorkspace.name}</p>
                <p className="text-xs text-muted-foreground">{selectedWorkspace.description || 'No description'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No workspace selected.</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Your Workspaces ({workspaces.length})</p>
          <div className="space-y-2">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                to={`/workspaces/${ws.id}?tab=boards`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: ws.color || '#6366f1' }}
                >
                  {ws.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm">{ws.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-sm font-medium mb-1">Workspace Preferences</p>
          <p className="text-xs text-muted-foreground">Advanced preferences will be available in a future update.</p>
        </div>
      </section>
    </div>
  );
}