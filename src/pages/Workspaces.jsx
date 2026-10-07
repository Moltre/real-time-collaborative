import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Plus, Building2, AlertCircle } from 'lucide-react';
import WorkspaceCard from '@/components/workspace/WorkspaceCard';
import { WorkspaceCardSkeleton } from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal';

export default function Workspaces() {
  const { workspaces, loading, refreshWorkspaces } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [ms, bds] = await Promise.all([
          base44.entities.WorkspaceMember.list('-created_date', 500),
          base44.entities.Board.list('-created_date', 200),
        ]);
        setMemberships(ms);
        setBoards(bds);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all your collaborative workspaces.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Create Workspace
        </Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <WorkspaceCardSkeleton key={i} />)}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState
            icon={Building2}
            title="Create your first workspace"
            description="Workspaces help you organize projects, boards and team members in one place."
            action={<Button onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Create Workspace</Button>}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => {
            const memberCount = memberships.filter((m) => m.workspace === ws.id).length;
            const boardCount = boards.filter((b) => b.workspace === ws.id).length;
            return (
              <WorkspaceCard
                key={ws.id}
                workspace={ws}
                memberCount={memberCount}
                boardCount={boardCount}
              />
            );
          })}
        </div>
      )}

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}