import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Pencil, Trash2, Users, Columns3, CreditCard, AlertCircle, ArrowLeft } from 'lucide-react';
import BoardCard from '@/components/board/BoardCard';
import CreateBoardModal from '@/components/board/CreateBoardModal';
import MemberRow from '@/components/members/MemberRow';
import AddMemberModal from '@/components/members/AddMemberModal';
import EmptyState from '@/components/shared/EmptyState';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { BoardCardSkeleton, MemberRowSkeleton } from '@/components/shared/LoadingSkeleton';
import { toast } from '@/components/ui/use-toast';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { selectWorkspace, refreshWorkspaces } = useWorkspace();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editColor, setEditColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const tab = searchParams.get('tab') || 'overview';

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const ws = await base44.entities.Workspace.get(id);
      setWorkspace(ws);
      selectWorkspace(id);
      const [ms, bds, allLists, allCards] = await Promise.all([
        base44.entities.WorkspaceMember.filter({ workspace: id }),
        base44.entities.Board.filter({ workspace: id }),
        base44.entities.List.list('-position', 500),
        base44.entities.Card.list('-updated_date', 500),
      ]);
      setMembers(ms);
      setBoards(bds);
      setLists(allLists.filter((l) => bds.some((b) => b.id === l.board)));
      setCards(allCards.filter((c) => bds.some((b) => b.id === c.board)));
    } catch (err) {
      setError(err.message || 'Failed to load workspace');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const userMembership = members.find((m) => m.user === user?.id);
  const canManage = userMembership && (userMembership.role === 'OWNER' || userMembership.role === 'ADMIN');

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Workspace.update(id, {
        name: editName.trim(),
        description: editDesc.trim(),
        color: editColor,
      });
      toast({ title: 'Workspace updated' });
      setEditOpen(false);
      loadData();
      refreshWorkspaces();
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete all boards, lists, cards, members
      if (cards.length) await base44.entities.Card.deleteMany({ board: { $in: boards.map((b) => b.id) } });
      if (lists.length) await base44.entities.List.deleteMany({ board: { $in: boards.map((b) => b.id) } });
      if (boards.length) await base44.entities.Board.deleteMany({ workspace: id });
      if (members.length) await base44.entities.WorkspaceMember.deleteMany({ workspace: id });
      await base44.entities.Workspace.delete(id);
      toast({ title: 'Workspace deleted' });
      refreshWorkspaces();
      window.location.href = '/dashboard';
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const handleRemoveMember = async (member) => {
    try {
      await base44.entities.WorkspaceMember.delete(member.id);
      // Remove from workspace members
      const newMembers = (workspace.members || []).filter((uid) => uid !== member.user);
      await base44.entities.Workspace.update(id, { members: newMembers });
      // Cascade remove from boards, lists, cards
      if (boards.length) {
        const boardIds = boards.map((b) => b.id);
        await base44.entities.Board.updateMany({ workspace: id }, { $pull: { members: member.user } });
        await base44.entities.List.updateMany({ board: { $in: boardIds } }, { $pull: { members: member.user } });
        if (lists.length) {
          await base44.entities.Card.updateMany({ list: { $in: lists.map((l) => l.id) } }, { $pull: { members: member.user } });
        }
      }
      toast({ title: 'Member removed' });
      loadData();
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    }
  };

  const handleRoleChange = async (memberId, role) => {
    try {
      await base44.entities.WorkspaceMember.update(memberId, { role });
      toast({ title: 'Role updated' });
      loadData();
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <BoardCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="We couldn't load this workspace"
          description="Please try again or go back."
          action={
            <div className="flex gap-2">
              <Button onClick={loadData}>Try Again</Button>
              <Button variant="outline" asChild><Link to="/dashboard">Go Back</Link></Button>
            </div>
          }
        />
      </div>
    );
  }

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#ef4444'];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Link to="/dashboard" className="mt-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0"
            style={{ backgroundColor: workspace.color || '#6366f1' }}
          >
            {workspace.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">{workspace.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{workspace.description || 'No description'}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{members.length} members</span>
              <span className="flex items-center gap-1"><Columns3 className="w-3.5 h-3.5" />{boards.length} boards</span>
            </div>
          </div>
        </div>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { setEditName(workspace.name); setEditDesc(workspace.description || ''); setEditColor(workspace.color || '#6366f1'); setEditOpen(true); }}>
                <Pencil className="w-4 h-4 mr-2" />Edit Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />Delete Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="boards">Boards</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-2">
                <Columns3 className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold">{boards.length}</p>
              <p className="text-xs text-muted-foreground">Boards</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold">{cards.length}</p>
              <p className="text-xs text-muted-foreground">Total Cards</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold">{cards.filter((c) => c.completed).length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xl font-bold">{members.length}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Boards</h3>
            {boards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No boards yet. Create one in the Boards tab.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {boards.map((board) => {
                  const listCount = lists.filter((l) => l.board === board.id).length;
                  const cardCount = cards.filter((c) => c.board === board.id).length;
                  return (
                    <BoardCard
                      key={board.id}
                      board={board}
                      listCount={listCount}
                      cardCount={cardCount}
                      onRenamed={loadData}
                      onDeleted={loadData}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Boards */}
        <TabsContent value="boards" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">All Boards</h3>
            <Button size="sm" onClick={() => setCreateBoardOpen(true)} disabled={!canManage && userMembership?.role !== 'MEMBER'}>
              <Plus className="w-4 h-4 mr-1.5" />New Board
            </Button>
          </div>
          {boards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card">
              <EmptyState
                icon={Columns3}
                title="No boards yet"
                description="Create a board to start organizing your project."
                action={<Button onClick={() => setCreateBoardOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Create Board</Button>}
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => {
                const listCount = lists.filter((l) => l.board === board.id).length;
                const cardCount = cards.filter((c) => c.board === board.id).length;
                return (
                  <BoardCard
                    key={board.id}
                    board={board}
                    listCount={listCount}
                    cardCount={cardCount}
                    onRenamed={loadData}
                    onDeleted={loadData}
                  />
                );
              })}
            </div>
          )}
          <CreateBoardModal
            open={createBoardOpen}
            onClose={() => setCreateBoardOpen(false)}
            workspace={workspace}
            existingCount={boards.length}
            onCreated={loadData}
          />
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Members ({members.length})</h3>
            {canManage && (
              <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                <Plus className="w-4 h-4 mr-1.5" />Add Member
              </Button>
            )}
          </div>
          {members.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card">
              <EmptyState
                icon={Users}
                title="No members yet"
                description="Add team members to collaborate on this workspace."
                action={canManage && <Button onClick={() => setAddMemberOpen(true)}><Plus className="w-4 h-4 mr-1.5" />Add Member</Button>}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  canManage={canManage}
                  isSelf={m.user === user?.id}
                  onRemove={handleRemoveMember}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </div>
          )}
          <AddMemberModal
            open={addMemberOpen}
            onClose={() => setAddMemberOpen(false)}
            workspace={workspace}
            currentMembers={workspace.members}
            onAdded={loadData}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>Update your workspace details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ws-name">Workspace Name</Label>
              <Input id="edit-ws-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ws-desc">Description</Label>
              <Textarea id="edit-ws-desc" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: c, outline: editColor === c ? '2px solid hsl(var(--foreground))' : 'none', outlineOffset: '2px' }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete workspace?"
        description={`"${workspace.name}" and all its boards, lists, and cards will be permanently deleted.`}
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}