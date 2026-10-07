import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Monitor } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const EVENT_TYPES = [
  { key: 'assignments', label: 'Card Assignments', description: 'When a card is assigned to you' },
  { key: 'invites', label: 'Workspace Invites', description: 'When you are invited to a workspace' },
  { key: 'mentions', label: 'Mentions', description: 'When you are mentioned in a card or comment' },
  { key: 'due_dates', label: 'Due Date Reminders', description: 'Reminders before a card is due' },
  { key: 'comments', label: 'Comments', description: 'When someone comments on your card' },
];

export default function NotificationPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const existing = await base44.entities.NotificationPreference.filter({ user: user.id });
        if (existing.length > 0) {
          setPrefs(existing[0]);
        } else {
          setPrefs({ user: user.id });
        }
      } catch {
        setPrefs({ user: user.id });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const toggle = (field) => {
    setPrefs((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (prefs.id) {
        await base44.entities.NotificationPreference.update(prefs.id, prefs);
      } else {
        const created = await base44.entities.NotificationPreference.create(prefs);
        setPrefs(created);
      }
      toast({ title: 'Preferences saved' });
    } catch (err) {
      toast({ title: 'Failed to save', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6"><div className="h-8 w-48 bg-muted rounded animate-pulse" /></div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader icon={Bell} title="Notification Preferences" description="Choose which events trigger email or in-app alerts." />

      <div className="space-y-6 mt-6">
        {/* Email section */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Email Notifications</h3>
          </div>
          <div className="divide-y divide-border">
            {EVENT_TYPES.map((evt) => (
              <div key={`email_${evt.key}`} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium">{evt.label}</p>
                  <p className="text-xs text-muted-foreground">{evt.description}</p>
                </div>
                <Switch
                  checked={!!prefs[`email_${evt.key}`]}
                  onCheckedChange={() => toggle(`email_${evt.key}`)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* In-app section */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">In-App Notifications</h3>
          </div>
          <div className="divide-y divide-border">
            {EVENT_TYPES.map((evt) => (
              <div key={`in_app_${evt.key}`} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium">{evt.label}</p>
                  <p className="text-xs text-muted-foreground">{evt.description}</p>
                </div>
                <Switch
                  checked={prefs[`in_app_${evt.key}`] !== false}
                  onCheckedChange={() => toggle(`in_app_${evt.key}`)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}