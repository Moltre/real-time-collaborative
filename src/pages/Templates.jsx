import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  LayoutTemplate, Code2, Megaphone, ShoppingCart, Palette, Package, Briefcase, Users, Sparkles, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  Code2, Megaphone, ShoppingCart, Palette, Package, Briefcase, Users, Sparkles, LayoutTemplate,
};

const BUILTIN_TEMPLATES = [
  {
    name: 'Kanban Board',
    description: 'A classic 3-column Kanban board for tracking work.',
    category: 'general',
    icon: 'LayoutTemplate',
    color: '#6366f1',
    lists: ['To Do', 'In Progress', 'Done'],
  },
  {
    name: 'Software Sprint',
    description: 'Plan and track a development sprint from backlog to review.',
    category: 'engineering',
    icon: 'Code2',
    color: '#0ea5e9',
    lists: ['Backlog', 'Sprint Planning', 'In Progress', 'Code Review', 'Testing', 'Done'],
  },
  {
    name: 'Marketing Campaign',
    description: 'Manage a marketing campaign from planning to launch.',
    category: 'marketing',
    icon: 'Megaphone',
    color: '#ec4899',
    lists: ['Ideation', 'Content Brief', 'In Production', 'Review', 'Scheduled', 'Published'],
  },
  {
    name: 'Sales Pipeline',
    description: 'Track deals through every stage of your sales funnel.',
    category: 'sales',
    icon: 'ShoppingCart',
    color: '#f59e0b',
    lists: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
  },
  {
    name: 'Design Process',
    description: 'Move design work from research to handoff.',
    category: 'design',
    icon: 'Palette',
    color: '#8b5cf6',
    lists: ['Research', 'Wireframes', 'Visual Design', 'Prototype', 'Review', 'Handoff'],
  },
  {
    name: 'Product Roadmap',
    description: 'Plan product features across discovery and delivery.',
    category: 'product',
    icon: 'Package',
    color: '#10b981',
    lists: ['Discovery', 'Spec', 'In Progress', 'Beta', 'Launched'],
  },
  {
    name: 'Onboarding',
    description: 'Onboard new hires with a structured checklist.',
    category: 'hr',
    icon: 'Users',
    color: '#14b8a6',
    lists: ['Pre-arrival', 'Day 1', 'Week 1', 'Month 1', 'Completed'],
  },
  {
    name: 'Project Tracker',
    description: 'A general project tracker with phases and milestones.',
    category: 'operations',
    icon: 'Briefcase',
    color: '#64748b',
    lists: ['Planning', 'Design', 'Execution', 'Testing', 'Launch'],
  },
];

export default function Templates() {
  const { user } = useAuth();
  const { workspaces, selectedWorkspaceId, refreshWorkspaces } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customTemplates, setCustomTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyTemplate, setApplyTemplate] = useState(null);
  const [boardName, setBoardName] = useState('');
  const [applying, setApplying] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', description: '', lists: 'Backlog, To Do, Done' });

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Template.list('-created_date', 100);
        setCustomTemplates(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const ws = workspaces.find((w) => w.id === selectedWorkspaceId);
  const allTemplates = [
    ...BUILTIN_TEMPLATES.map((t) => ({ ...t, isCustom: false, id: `builtin-${t.name}` })),
    ...customTemplates.map((t) => ({ ...t, isCustom: true, id: t.id, icon: t.icon || 'LayoutTemplate' })),
  ];

  const handleApply = async () => {
    if (!ws) {
      toast({ title: 'Select a workspace first', description: 'Choose a workspace from the sidebar.', variant: 'destructive' });
      return;
    }
    setApplying(true);
    try {
      const board = await base44.entities.Board.create({
        workspace: ws.id,
        name: boardName || applyTemplate.name,
        description: applyTemplate.description,
        createdBy: user.id,
        color: applyTemplate.color || '#6366f1',
        members: ws.members || [],
      });
      const lists = applyTemplate.lists || [];
      await base44.entities.List.bulkCreate(
        lists.map((name, i) => ({ board: board.id, name, position: i, members: ws.members || [] }))
      );
      toast({ title: 'Board created', description: `"${board.name}" is ready with ${lists.length} lists.` });
      setApplyTemplate(null);
      setBoardName('');
      navigate(`/boards/${board.id}`);
    } catch (err) {
      toast({ title: 'Failed to create board', description: err.message, variant: 'destructive' });
    } finally {
      setApplying(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.lists.trim()) {
      toast({ title: 'Name and lists are required', variant: 'destructive' });
      return;
    }
    try {
      const created = await base44.entities.Template.create({
        name: newTemplate.name,
        description: newTemplate.description,
        category: 'general',
        icon: 'LayoutTemplate',
        lists: newTemplate.lists.split(',').map((s) => s.trim()).filter(Boolean),
        isCustom: true,
      });
      setCustomTemplates([created, ...customTemplates]);
      setNewTemplate({ name: '', description: '', lists: 'Backlog, To Do, Done' });
      setCreateOpen(false);
      toast({ title: 'Template saved' });
    } catch (err) {
      toast({ title: 'Failed to save template', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader icon={LayoutTemplate} title="Templates" description="Pre-built Kanban board templates to jumpstart your workflow.">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Template
        </Button>
      </PageHeader>

      {!ws && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 mb-4">
          Tip: Select a workspace in the sidebar before applying a template — the new board will be created there.
        </div>
      )}

      {allTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={LayoutTemplate} title="No templates yet" description="Create a custom template or use a built-in one." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTemplates.map((tpl) => {
            const Icon = ICON_MAP[tpl.icon] || LayoutTemplate;
            return (
              <div key={tpl.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: tpl.color || '#6366f1' }}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{tpl.name}</h3>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{tpl.category}</span>
                  </div>
                  {tpl.isCustom && <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">CUSTOM</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-3 flex-1">{tpl.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(tpl.lists || []).slice(0, 4).map((list, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md">{list}</span>
                  ))}
                  {(tpl.lists || []).length > 4 && <span className="text-xs text-muted-foreground px-1 py-1">+{(tpl.lists || []).length - 4}</span>}
                </div>
                {(tpl.labels || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(tpl.labels || []).slice(0, 5).map((label, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">{label}</span>
                    ))}
                    {(tpl.labels || []).length > 5 && <span className="text-xs text-muted-foreground px-1 py-1">+{(tpl.labels || []).length - 5}</span>}
                  </div>
                )}
                {(!tpl.labels || tpl.labels.length === 0) && <div className="mb-4" />}
                <Button size="sm" variant="outline" onClick={() => { setApplyTemplate(tpl); setBoardName(tpl.name); }}>
                  Use Template
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply dialog */}
      <Dialog open={!!applyTemplate} onOpenChange={(o) => !o && setApplyTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply "{applyTemplate?.name}"</DialogTitle>
            <DialogDescription>
              This will create a new board{ws ? ` in "${ws.name}"` : ''} with {applyTemplate?.lists?.length || 0} lists.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="tpl-board-name">Board Name</Label>
            <Input id="tpl-board-name" value={boardName} onChange={(e) => setBoardName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApplyTemplate(null)}>Cancel</Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? 'Creating...' : 'Create Board'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create custom template dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Custom Template</DialogTitle>
            <DialogDescription>Save your own reusable board structure.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tpl-name">Template Name</Label>
              <Input id="tpl-name" value={newTemplate.name} onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="e.g. Bug Triage" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-desc">Description</Label>
              <Input id="tpl-desc" value={newTemplate.description} onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })} placeholder="What is this template for?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-lists">Lists (comma-separated)</Label>
              <Input id="tpl-lists" value={newTemplate.lists} onChange={(e) => setNewTemplate({ ...newTemplate, lists: e.target.value })} placeholder="Backlog, To Do, Done" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}