import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search, Filter, Plus, MoreHorizontal, Pencil, Trash2, AlertCircle, ArrowLeft, X, CreditCard, LayoutTemplate,
} from 'lucide-react';
import KanbanColumn from '@/components/board/KanbanColumn';
import CreateListModal from '@/components/board/CreateListModal';
import CreateCardModal from '@/components/board/CreateCardModal';
import CardDetailsModal from '@/components/board/CardDetailsModal';
import SaveAsTemplateModal from '@/components/board/SaveAsTemplateModal';
import EmptyState from '@/components/shared/EmptyState';
import { KanbanColumnSkeleton } from '@/components/shared/LoadingSkeleton';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { toast } from '@/components/ui/use-toast';
import moment from 'moment';

export default function BoardPage() {
  const { boardId } = useParams();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [createCardForList, setCreateCardForList] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [editBoardName, setEditBoardName] = useState('');
  const [editBoardDesc, setEditBoardDesc] = useState('');
  const [savingBoard, setSavingBoard] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState(false);
  const [renamingList, setRenamingList] = useState(null);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const b = await base44.entities.Board.get(boardId);
      setBoard(b);
      const [lsts, crds, mems] = await Promise.all([
        base44.entities.List.filter({ board: boardId }),
        base44.entities.Card.filter({ board: boardId }),
        base44.entities.WorkspaceMember.filter({ workspace: b.workspace }),
      ]);
      setLists(lsts.sort((a, b) => (a.position || 0) - (b.position || 0)));
      setCards(crds);
      setMembers(mems);
    } catch (err) {
      setError(err.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const userMembership = members.find((m) => m.user === user?.id);
  const isViewer = userMembership?.role === 'VIEWER';

  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = c.title?.toLowerCase().includes(q);
        const matchDesc = c.description?.toLowerCase().includes(q);
        const matchLabels = c.labels?.some((l) => l.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchLabels) return false;
      }
      if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'ALL' && c.assignedTo !== assigneeFilter) return false;
      return true;
    });
  }, [cards, search, priorityFilter, assigneeFilter]);

  const cardsByList = useMemo(() => {
    const map = {};
    lists.forEach((l) => { map[l.id] = []; });
    filteredCards
      .slice()
      .sort((a, b) => (a.position || 0) - (b.position || 0))
      .forEach((c) => {
        if (map[c.list]) map[c.list].push(c);
      });
    return map;
  }, [lists, filteredCards]);

  const hasFilters = search || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL';

  const handleDragEnd = async (result) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    if (hasFilters) return; // Don't allow drag when filters are active

    if (type === 'list') {
      // Reorder lists
      const newLists = [...lists];
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      const reordered = newLists.map((l, i) => ({ ...l, position: i }));
      setLists(reordered);
      try {
        await base44.entities.List.bulkUpdate(reordered.map((l) => ({ id: l.id, position: l.position })));
      } catch (err) {
        toast({ title: 'Failed to reorder lists', variant: 'destructive' });
        setLists(lists);
      }
      return;
    }

    // Card move
    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;
    const movedCard = cards.find((c) => c.id === draggableId);
    if (!movedCard) return;

    // Build new arrays for source and dest
    const sourceCards = cards
      .filter((c) => c.list === sourceListId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
    const destCards = sourceListId === destListId
      ? [...sourceCards]
      : cards.filter((c) => c.list === destListId).sort((a, b) => (a.position || 0) - (b.position || 0));

    sourceCards.splice(source.index, 1);
    const updatedMoved = { ...movedCard, list: destListId };
    if (sourceListId === destListId) {
      sourceCards.splice(destination.index, 0, updatedMoved);
    } else {
      destCards.splice(destination.index, 0, updatedMoved);
    }

    const finalSource = sourceCards.map((c, i) => ({ ...c, position: i }));
    const finalDest = sourceListId === destListId ? finalSource : destCards.map((c, i) => ({ ...c, position: i }));

    // Optimistic update
    const cardsMap = new Map(cards.map((c) => [c.id, c]));
    finalSource.forEach((c) => cardsMap.set(c.id, c));
    if (sourceListId !== destListId) finalDest.forEach((c) => cardsMap.set(c.id, c));
    setCards(Array.from(cardsMap.values()));

    try {
      const updates = [];
      if (sourceListId !== destListId) {
        updates.push({ id: movedCard.id, list: destListId, position: destination.index });
      }
      finalSource.forEach((c) => {
        if (c.id !== movedCard.id || sourceListId === destListId) {
          updates.push({ id: c.id, position: c.position, ...(sourceListId === destListId && c.id === movedCard.id ? { list: destListId } : {}) });
        }
      });
      if (sourceListId !== destListId) {
        finalDest.forEach((c) => {
          if (c.id !== movedCard.id) updates.push({ id: c.id, position: c.position });
        });
      }
      await base44.entities.Card.bulkUpdate(updates);
      toast({ title: 'Card moved' });
    } catch (err) {
      toast({ title: 'Failed to move card', variant: 'destructive' });
      setCards(cards);
    }
  };

  const handleAddCard = async (card) => {
    setCards((prev) => [...prev, card]);
  };

  const handleCardUpdated = () => {
    loadData();
  };

  const handleCardDeleted = () => {
    loadData();
  };

  const handleRenameList = async (listId, newName) => {
    setRenamingList(listId);
    try {
      await base44.entities.List.update(listId, { name: newName });
      setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, name: newName } : l)));
      toast({ title: 'List renamed' });
    } catch (err) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setRenamingList(null);
    }
  };

  const handleDeleteList = async (listId) => {
    try {
      // Delete cards in the list first
      const listCards = cards.filter((c) => c.list === listId);
      if (listCards.length) await base44.entities.Card.deleteMany({ list: listId });
      await base44.entities.List.delete(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      setCards((prev) => prev.filter((c) => c.list !== listId));
      toast({ title: 'List deleted' });
    } catch (err) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleListCreated = (list) => {
    setLists((prev) => [...prev, list].sort((a, b) => (a.position || 0) - (b.position || 0)));
  };

  const handleEditBoardSave = async (e) => {
    e.preventDefault();
    setSavingBoard(true);
    try {
      await base44.entities.Board.update(boardId, { name: editBoardName.trim(), description: editBoardDesc.trim() });
      toast({ title: 'Board updated' });
      setBoard({ ...board, name: editBoardName, description: editBoardDesc });
      setEditBoardOpen(false);
    } catch (err) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSavingBoard(false);
    }
  };

  const handleDeleteBoard = async () => {
    setDeletingBoard(true);
    try {
      if (cards.length) await base44.entities.Card.deleteMany({ board: boardId });
      if (lists.length) await base44.entities.List.deleteMany({ board: boardId });
      await base44.entities.Board.delete(boardId);
      toast({ title: 'Board deleted' });
      window.location.href = `/workspaces/${board.workspace}?tab=boards`;
    } catch (err) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    } finally {
      setDeletingBoard(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setPriorityFilter('ALL');
    setAssigneeFilter('ALL');
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(4)].map((_, i) => <KanbanColumnSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="We couldn't load this board"
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

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Board Header */}
      <div className="border-b border-border bg-card px-4 md:px-6 py-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Link to={`/workspaces/${board.workspace}?tab=boards`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight truncate flex items-center gap-2">
                {board.name}
                <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  {cards.length} cards
                </span>
              </h1>
              {board.description && (
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{board.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Member avatars */}
            <div className="hidden sm:flex -space-x-2">
              {members.slice(0, 4).map((m) => {
                const name = m.user_name || m.user_email?.split('@')[0] || 'U';
                const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <Avatar key={m.id} className="w-8 h-8 border-2 border-card">
                    <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {members.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                  +{members.length - 4}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setEditBoardName(board.name); setEditBoardDesc(board.description || ''); setEditBoardOpen(true); }}>
                  <Pencil className="w-4 h-4 mr-2" />Edit Board
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSaveTemplateOpen(true)}>
                  <LayoutTemplate className="w-4 h-4 mr-2" />Save as Template
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteBoardOpen(true)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />Delete Board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[130px] h-8 text-sm">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[140px] h-8 text-sm">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Assignees</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.user} value={m.user}>
                  {m.user_name || m.user_email?.split('@')[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-sm">
              <X className="w-3.5 h-3.5 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {lists.length === 0 && !loading ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={Plus}
              title="No lists yet"
              description="Create your first list to start adding cards."
            />
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="lists" type="list" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex gap-4 p-4 md:p-6 overflow-x-auto kanban-scroll h-full items-start"
                >
                  {lists.map((list, index) => (
                    <KanbanColumn
                      key={list.id}
                      list={{ ...list, index }}
                      cards={cardsByList[list.id] || []}
                      members={members}
                      onCardClick={(card) => setEditingCard(card)}
                      onAddCard={(listId) => setCreateCardForList(listId)}
                      onRenameList={handleRenameList}
                      onDeleteList={handleDeleteList}
                      isViewer={isViewer}
                    />
                  ))}
                  {provided.placeholder}
                  <CreateListModal
                    boardId={boardId}
                    members={board.members || [user?.id]}
                    existingCount={lists.length}
                    onCreated={handleListCreated}
                    isViewer={isViewer}
                  />
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Modals */}
      <CreateCardModal
        open={!!createCardForList}
        onClose={() => setCreateCardForList(null)}
        listId={createCardForList}
        boardId={boardId}
        members={members}
        listMembers={lists.find((l) => l.id === createCardForList)?.members || [user?.id]}
        onCreated={handleAddCard}
      />

      <CardDetailsModal
        open={!!editingCard}
        onClose={() => setEditingCard(null)}
        card={editingCard}
        members={members}
        onUpdated={handleCardUpdated}
        onDeleted={handleCardDeleted}
      />

      {/* Edit Board Dialog */}
      <Dialog open={editBoardOpen} onOpenChange={setEditBoardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBoardSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eb-name">Board Name</Label>
              <Input id="eb-name" value={editBoardName} onChange={(e) => setEditBoardName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eb-desc">Description</Label>
              <Input id="eb-desc" value={editBoardDesc} onChange={(e) => setEditBoardDesc(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditBoardOpen(false)} disabled={savingBoard}>Cancel</Button>
              <Button type="submit" disabled={savingBoard}>{savingBoard ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteBoardOpen}
        onClose={() => setDeleteBoardOpen(false)}
        onConfirm={handleDeleteBoard}
        title="Delete board?"
        description={`"${board.name}" and all its lists and cards will be permanently deleted.`}
        confirmText="Delete"
        loading={deletingBoard}
      />

      <SaveAsTemplateModal
        open={saveTemplateOpen}
        onClose={() => setSaveTemplateOpen(false)}
        board={board}
        lists={lists}
        cards={cards}
      />
    </div>
  );
}