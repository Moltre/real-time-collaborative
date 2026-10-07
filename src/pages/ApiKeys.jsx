import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Plus, Copy, Trash2, Loader2, Check, Code } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import moment from 'moment';

function genKey() {
  const rand = (crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)).replace(/-/g, '');
  return `rtc_sk_${rand.slice(0, 32)}`;
}

const SAMPLE = `curl -X GET https://api.your-app.com/v1/cards \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

export default function ApiKeys() {
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = async () => {
    if (!selectedWorkspaceId) { setLoading(false); return; }
    try {
      const data = await base44.entities.ApiKey.filter({ workspace: selectedWorkspaceId }, '-created_date', 100);
      setKeys(data);
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
      const created = await base44.entities.ApiKey.create({
        name: name.trim(),
        key: genKey(),
        workspace: selectedWorkspace.id,
        workspace_name: selectedWorkspace.name,
        workspace_members: selectedWorkspace.members || [],
        status: 'active',
      });
      setKeys((prev) => [created, ...prev]);
      setName('');
      toast({ title: 'API key generated', description: 'Copy it now — you will not see the full key again after refresh.' });
    } catch (err) {
      toast({ title: 'Could not generate key', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (k) => {
    await base44.entities.ApiKey.update(k.id, { status: 'revoked' });
    setKeys((prev) => prev.map((x) => (x.id === k.id ? { ...x, status: 'revoked' } : x)));
    toast({ title: 'Key revoked' });
  };

  const remove = async (k) => {
    await base44.entities.ApiKey.delete(k.id);
    setKeys((prev) => prev.filter((x) => x.id !== k.id));
    toast({ title: 'Key deleted' });
  };

  const copy = (val, id) => {
    navigator.clipboard?.writeText(val);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const mask = (k) => `${k.slice(0, 10)}••••••••${k.slice(-4)}`;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Key} title="API Documentation" description="Generate and manage API keys to build custom integrations with your workspace." />

      {!selectedWorkspace ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={Key} title="No workspace selected" description="Choose a workspace to manage its API keys." />
        </div>
      ) : (
        <>
          <form onSubmit={create} className="rounded-xl border border-border bg-card p-5 space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="key-name">Key Name</Label>
              <Input id="key-name" placeholder="e.g. Production integration" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Generate Key
            </Button>
          </form>

          {loading ? (
            <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
          ) : keys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card">
              <EmptyState icon={Key} title="No API keys yet" description="Generate a key above to start authenticating API requests." />
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {keys.map((k) => (
                <div key={k.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground')}>
                      <Key className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{k.name}</p>
                      <p className="text-xs text-muted-foreground">Created {moment(k.created_date).fromNow()}</p>
                    </div>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', k.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground')}>
                      {k.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-md px-3 py-2">
                    <code className="flex-1 text-xs font-mono truncate">{mask(k.key)}</code>
                    <button onClick={() => copy(k.key, k.id)} className="text-muted-foreground hover:text-foreground">
                      {copied === k.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {k.status === 'active' && (
                      <Button size="sm" variant="outline" onClick={() => revoke(k)}>Revoke</Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(k)}>
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Quick Start</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Use your API key in the Authorization header to access workspace resources:</p>
            <pre className="bg-muted/60 rounded-md p-4 text-xs font-mono overflow-x-auto"><code>{SAMPLE}</code></pre>
          </div>
        </>
      )}
    </div>
  );
}