import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import { Input } from '@/components/ui/input';
import EmptyState from '@/components/shared/EmptyState';
import { Search, Columns3, CreditCard, Layers, ArrowRight } from 'lucide-react';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [ws, bds, crds] = await Promise.all([
          base44.entities.Workspace.list('-updated_date', 200),
          base44.entities.Board.list('-updated_date', 500),
          base44.entities.Card.list('-updated_date', 500),
        ]);
        setWorkspaces(ws);
        setBoards(bds);
        setCards(crds);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return { workspaces: [], boards: [], cards: [] };
    const q = query.toLowerCase();
    return {
      workspaces: workspaces.filter((w) => w.name?.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q)),
      boards: boards.filter((b) => b.name?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)),
      cards: cards.filter((c) => c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q) || (c.labels || []).some((l) => l.toLowerCase().includes(q))),
    };
  }, [query, workspaces, boards, cards]);

  const totalCount = results.workspaces.length + results.boards.length + results.cards.length;

  const handleSearch = () => setSearched(true);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Search} title="Global Search" description="Search across all your workspaces, boards, and cards." />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search workspaces, boards, cards, labels..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-9 h-11 text-base"
          autoFocus
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : !query.trim() ? (
        <EmptyState
          icon={Search}
          title="Start typing to search"
          description="Find workspaces, boards, cards, and labels instantly."
        />
      ) : searched || query.length >= 2 ? (
        totalCount === 0 ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`Nothing matched "${query}". Try a different search term.`}
          />
        ) : (
          <div className="space-y-6">
            {results.workspaces.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />Workspaces ({results.workspaces.length})
                </h3>
                <div className="space-y-2">
                  {results.workspaces.map((ws) => (
                    <Link key={ws.id} to={`/workspaces/${ws.id}`} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: ws.color || '#6366f1' }}>
                          {ws.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{ws.name}</p>
                          {ws.description && <p className="text-xs text-muted-foreground truncate">{ws.description}</p>}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.boards.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Columns3 className="w-3.5 h-3.5" />Boards ({results.boards.length})
                </h3>
                <div className="space-y-2">
                  {results.boards.map((b) => (
                    <Link key={b.id} to={`/boards/${b.id}`} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (b.color || '#6366f1') + '20' }}>
                          <Columns3 className="w-4 h-4" style={{ color: b.color || '#6366f1' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{b.name}</p>
                          {b.description && <p className="text-xs text-muted-foreground truncate">{b.description}</p>}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.cards.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />Cards ({results.cards.length})
                </h3>
                <div className="space-y-2">
                  {results.cards.slice(0, 20).map((c) => (
                    <Link key={c.id} to={`/boards/${c.board}`} className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.title}</p>
                        {c.description && <p className="text-xs text-muted-foreground truncate">{c.description}</p>}
                        {(c.labels || []).length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {c.labels.slice(0, 4).map((l, i) => (
                              <span key={i} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{l}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                  {results.cards.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">Showing 20 of {results.cards.length} results</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">Keep typing to search...</p>
      )}
    </div>
  );
}