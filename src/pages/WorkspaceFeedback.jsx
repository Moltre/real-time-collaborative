import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { MessageSquare, Bug, Lightbulb, Heart, HelpCircle, Plus, Send } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const TYPES = [
  { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600 bg-red-50' },
  { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-amber-600 bg-amber-50' },
  { value: 'praise', label: 'Praise', icon: Heart, color: 'text-pink-600 bg-pink-50' },
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-600 bg-blue-50' },
];

const STATUS_STYLES = {
  open: 'bg-blue-50 text-blue-700',
  in_review: 'bg-amber-50 text-amber-700',
  resolved: 'bg-emerald-50 text-emerald-700',
  closed: 'bg-muted text-muted-foreground',
};

export default function WorkspaceFeedback() {
  const { user } = useAuth();
  const { workspaces, selectedWorkspaceId } = useWorkspace();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: 'feature', subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const ws = workspaces.find((w) => w.id === selectedWorkspaceId);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Feedback.filter({ user: user.id }, '-created_date', 100);
        setFeedbackList(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      const created = await base44.entities.Feedback.create({
        user: user.id,
        user_name: user.full_name || user.email,
        type: form.type,
        subject: form.subject.trim(),
        description: form.description.trim(),
        workspace: ws?.id,
        workspace_name: ws?.name,
        status: 'open',
        priority: 'medium',
      });
      setFeedbackList([created, ...feedbackList]);
      setForm({ type: 'feature', subject: '', description: '' });
      setOpen(false);
      toast({ title: 'Feedback submitted', description: 'Thank you! We will review it shortly.' });
    } catch (err) {
      toast({ title: 'Failed to submit', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader icon={MessageSquare} title="Workspace Feedback" description="Report bugs or suggest features for the platform.">
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Feedback
        </Button>
      </PageHeader>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState
            icon={MessageSquare}
            title="No feedback yet"
            description="Share a bug report, feature idea, or question with the team."
            action={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1.5" />New Feedback</Button>}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {feedbackList.map((fb) => {
            const typeConfig = TYPES.find((t) => t.value === fb.type) || TYPES[1];
            const Icon = typeConfig.icon;
            return (
              <div key={fb.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', typeConfig.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold truncate">{fb.subject}</p>
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap', STATUS_STYLES[fb.status] || STATUS_STYLES.open)}>
                        {fb.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{fb.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="font-medium uppercase">{typeConfig.label}</span>
                      {fb.workspace_name && <span>· {fb.workspace_name}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogDescription>
              {ws ? `Feedback for "${ws.name}"` : 'Share your thoughts with the platform team.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, type: t.value })}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                        form.type === t.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-accent'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-subject">Subject</Label>
              <Input id="fb-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required placeholder="Brief summary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-desc">Description</Label>
              <Textarea id="fb-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required placeholder="Provide details..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                <Send className="w-4 h-4 mr-1.5" />
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}