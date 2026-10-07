import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw, CreditCard, Trash2, Search } from 'lucide-react';
import moment from 'moment';

export default function TaskArchive() {
  const { toast } = useToast();
  const [cards, setCards] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [cardData, boardData] = await Promise.all([
          base44.entities.Card.list('-updated_date', 500),
          base44.entities.Board.list('-updated_date', 200),
        ]);
        setCards(cardData);
        setBoards(boardData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const boardName = (id) => boards.find((b) => b.id === id)?.name || 'Board';

  const restore = async (card) => {
    await base44.entities.Card.update(card.id, { archived: false });
    setCards((prev) => prev.filter((c) => c.id !== card.id));
    toast({ title: 'Card restored', description: `"${card.title}" is back on the board.` });
  };

  const remove = async (card) => {
    await base44.entities.Card.delete(card.id);
    setCards((prev) => prev.filter((c) => c.id !== card.id));
    toast({ title: 'Card permanently deleted' });
  };

  const archived = cards.filter(
    (c) => c.archived && (!search || c.title?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Archive} title="Task Archive" description="All archived cards. Restore anything you need or permanently remove it." />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search archived cards..."
          className="w-full flex h-10 rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {archived.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState
            icon={Archive}
            title="Nothing archived"
            description="Cards you archive will appear here. You can restore them to the board any time."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {archived.map((card) => (
            <div key={card.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{card.title}</p>
                <p className="text-xs text-muted-foreground">
                  <Link to={`/boards/${card.board}`} className="hover:underline">{boardName(card.board)}</Link>
                  {' · '}Archived {moment(card.updated_date).fromNow()}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => restore(card)}>
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Restore
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(card)} className="text-destructive hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}