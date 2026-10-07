import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Pencil, Trash2, Columns3, CreditCard, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import moment from 'moment';

export default function BoardCard({ board, listCount = 0, cardCount = 0, onRenamed, onDeleted }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [renameName, setRenameName] = useState(board.name);
  const [renameDesc, setRenameDesc] = useState(board.description || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleRename = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Board.update(board.id, {
        name: renameName.trim(),
        description: renameDesc.trim(),
      });
      toast({ title: 'Board renamed', description: renameName });
      onRenamed?.();
      setRenameOpen(false);
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Delete lists and cards belonging to this board
      const lists = await base44.entities.List.filter({ board: board.id });
      const cards = await base44.entities.Card.filter({ board: board.id });
      if (cards.length) await base44.entities.Card.deleteMany({ board: board.id });
      if (lists.length) await base44.entities.List.deleteMany({ board: board.id });
      await base44.entities.Board.delete(board.id);
      toast({ title: 'Board deleted', description: board.name });
      onDeleted?.();
      setDeleteOpen(false);
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: board.color || '#6366f1' }}
          >
            <Columns3 className="w-5 h-5" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setRenameName(board.name);
                  setRenameDesc(board.description || '');
                  setRenameOpen(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h3 className="font-semibold text-foreground mb-1">{board.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
          {board.description || 'No description provided.'}
        </p>
        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Columns3 className="w-3.5 h-3.5" />
            {listCount} {listCount === 1 ? 'list' : 'lists'}
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            {cardCount} {cardCount === 1 ? 'card' : 'cards'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {moment(board.created_date).format('MMM D')}
          </span>
          <Button asChild size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground">
            <Link to={`/boards/${board.id}`}>Open Board</Link>
          </Button>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rename-board">Board Name</Label>
              <Input
                id="rename-board"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rename-desc">Description</Label>
              <Input
                id="rename-desc"
                value={renameDesc}
                onChange={(e) => setRenameDesc(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRenameOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !renameName.trim()}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete board?"
        description={`"${board.name}" and all its lists and cards will be permanently deleted.`}
        confirmText="Delete"
        loading={deleting}
      />
    </>
  );
}