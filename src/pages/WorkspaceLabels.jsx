import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#14b8a6', '#f97316', '#64748b'];

export default function WorkspaceLabels() {
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace();
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!selectedWorkspaceId) { setLoading(false); return; }
    try {
      const data = await base44.entities.Label.filter({ workspace: selectedWorkspaceId }, '-created_date', 200);
      setLabels(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedWorkspaceId]);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedWorkspace) return;
    setSaving(true);
    try {
      const created = await base44.entities.Label.create({
        name: name.trim(),
        color,
        workspace: selectedWorkspace.id,
        workspace_name: selectedWorkspace.name,
        workspace_members: selectedWorkspace.members || [],
      });
      setLabels((prev) => [created, ...prev]);
      setName('');
      setColor(COLORS[0]);
      toast({ title: 'Label created' });
    } catch (err) {
      toast({ title: 'Could not create label', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (label) => {
    await base44.entities.Label.delete(label.id);
    setLabels((prev) => prev.filter((l) => l.id !== label.id));
    toast({ title: 'Label deleted' });
  };

  const rename = async (label, newName) => {
    if (!newName.trim() || newName === label.name) return;
    await base44.entities.Label.update(label.id, { name: newName.trim() });
    setLabels((prev) => prev.map((l) => (l.id === label.id ? { ...l, name: newName.trim() } : l)));
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Tag} title="Workspace Labels" description="Maintain consistent labels across every board in this workspace." />

      {!selectedWorkspace ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={Tag} title="No workspace selected" description="Choose a workspace to manage its labels." />
        </div>
      ) : (
        <>
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-5 space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input placeholder="Label name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
              <Button type="submit" disabled={saving || !name.trim()}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Label
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={cn('w-7 h-7 rounded-full transition-transform', color === c && 'ring-2 ring-offset-2 ring-foreground scale-110')} style={{ backgroundColor: c }}>
                  {color === c && <Check className="w-3.5 h-3.5 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </form>

          {loading ? (
            <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
          ) : labels.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card">
              <EmptyState icon={Tag} title="No labels yet" description="Create your first label above to start categorizing cards consistently." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                  <input
                    defaultValue={label.name}
                    onBlur={(e) => rename(label, e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium outline-none focus:border-b focus:border-border"
                  />
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(label)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}