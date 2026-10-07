import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Plus, Trash2, Loader2, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PRIORITIES = [
  { value: '', label: 'Any priority' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

export default function SavedFilters() {
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace();
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!selectedWorkspaceId) { setLoading(false); return; }
    try {
      const data = await base44.entities.SavedFilter.filter({ workspace: selectedWorkspaceId }, '-created_date', 100);
      setFilters(data);
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
      const created = await base44.entities.SavedFilter.create({
        name: name.trim(),
        priority,
        assignee: assignee.trim(),
        search: search.trim(),
        workspace: selectedWorkspace.id,
        workspace_name: selectedWorkspace.name,
        workspace_members: selectedWorkspace.members || [],
      });
      setFilters((prev) => [created, ...prev]);
      setName('');
      setPriority('');
      setAssignee('');
      setSearch('');
      toast({ title: 'Filter saved' });
    } catch (err) {
      toast({ title: 'Could not save filter', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (f) => {
    await base44.entities.SavedFilter.delete(f.id);
    setFilters((prev) => prev.filter((x) => x.id !== f.id));
    toast({ title: 'Filter deleted' });
  };

  const criteria = (f) => {
    const parts = [];
    if (f.priority) parts.push(`Priority: ${f.priority}`);
    if (f.assignee) parts.push(`Assignee: ${f.assignee}`);
    if (f.search) parts.push(`Search: "${f.search}"`);
    return parts.length ? parts.join(' · ') : 'All cards';
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Filter} title="Saved Filters" description="Save custom card filters and quickly toggle between work views." />

      {!selectedWorkspace ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={Filter} title="No workspace selected" description="Choose a workspace to manage saved filters." />
        </div>
      ) : (
        <>
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-5 space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Filter Name</Label>
              <Input id="filter-name" placeholder="e.g. Urgent this week" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue placeholder="Any priority" /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Input placeholder="Name or email" value={assignee} onChange={(e) => setAssignee(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Title text" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
            </div>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Save Filter
            </Button>
          </form>

          {loading ? (
            <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
          ) : filters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card">
              <EmptyState icon={Filter} title="No saved filters" description="Save a filter above to quickly recall a specific card view." />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filters.map((f) => (
                <div key={f.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Filter className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{f.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{criteria(f)}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(f)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}