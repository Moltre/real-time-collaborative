import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw, CreditCard, CheckCircle2, Trash2, Search } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';

export default function ArchivedItems() {
  const { toast } = useToast();
  const [allCards, setAllCards] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('archived');
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [cardData, boardData] = await Promise.all([
          base44.entities.Card.list('-updated_date', 500),
          base44.entities.Board.list('-updated_date', 200),
        ]);
        setAllCards(cardData);
        setBoards(boardData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const boardName = (id) => boards.find((b) => b.id === id)?.name || 'Board';

  const restoreCard = async (card) => {
    await base44.entities.Card.update(card.id, { archived: false });
    setAllCards((prev) => prev.map((c) => c.id === card.id ? { ...c, archived: false } : c));
    toast({ title: 'Card restored', description: `"${card.title}" is back on the board.` });
  };

  const deleteCard = async (card) => {
    await base44.entities.Card.delete(card.id);
    setAllCards((prev) => prev.filter((c) => c.id !== card.id));
    toast({ title: 'Card permanently deleted' });
  };

  const archiveCard = async (card) => {
    await base44.entities.Card.update(card.id, { archived: true, completed: false });
    setAllCards((prev) => prev.map((c) => c.id === card.id ? { ...c, archived: true, completed: false } : c));
    toast({ title: 'Card archived' });
  };

  const archivedCards = allCards.filter((c) => c.archived && (!search || c.title?.toLowerCase().includes(search.toLowerCase())));
  const completedCards = allCards.filter((c) => c.completed && !c.archived && (!search || c.title?.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Archive} title="Archived Items" description="Restore archived cards or archive completed items you no longer need." />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('archived')}
          className={cn('flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors', tab === 'archived' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground')}
        >
          <Archive className="w-4 h-4" />
          Archived ({archivedCards.length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={cn('flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors', tab === 'completed' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground')}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed ({completedCards.length})
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full flex h-10 rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {tab === 'archived' && (
        archivedCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card">
            <EmptyState icon={Archive} title="No archived cards" description="Cards you archive will appear here for restoration." />
          </div>
        ) : (
          <div className="space-y-2">
            {archivedCards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{boardName(card.board)} · Archived {moment(card.updated_date).fromNow()}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => restoreCard(card)}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Restore
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteCard(card)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'completed' && (
        completedCards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card">
            <EmptyState icon={CheckCircle2} title="No completed cards" description="Completed cards that aren't archived yet will show here." />
          </div>
        ) : (
          <div className="space-y-2">
            {completedCards.map((card) => (
              <div key={card.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate line-through text-muted-foreground">{card.title}</p>
                  <p className="text-xs text-muted-foreground">{boardName(card.board)} · Completed {moment(card.updated_date).fromNow()}</p>
                </div>
                <Link to={`/boards/${card.board}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => archiveCard(card)}>
                  <Archive className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}