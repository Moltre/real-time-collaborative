import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Columns3, CreditCard, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import WorkspaceCard from '@/components/workspace/WorkspaceCard';
import { DashboardSkeleton, WorkspaceCardSkeleton, BoardCardSkeleton } from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import CreateWorkspaceModal from '@/components/workspace/CreateWorkspaceModal';
import moment from 'moment';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user } = useAuth();
  const { workspaces, loading: wsLoading, refreshWorkspaces } = useWorkspace();
  const [boards, setBoards] = useState([]);
  const [cards, setCards] = useState([]);
  const [lists, setLists] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadData = async () => {
    setError(null);
    setLoading(true);
    try {
      const [boardsData, cardsData, listsData, msData] = await Promise.all([
        base44.entities.Board.list('-updated_date', 100),
        base44.entities.Card.list('-updated_date', 200),
        base44.entities.List.list('-created_date', 500),
        base44.entities.WorkspaceMember.list('-created_date', 500),
      ]);
      setBoards(boardsData);
      setCards(cardsData);
      setLists(listsData);
      setMemberships(msData);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || wsLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="Something went wrong"
          description="We couldn't load your dashboard. Please try again."
          action={<Button onClick={loadData}>Try Again</Button>}
        />
      </div>
    );
  }

  const openCards = cards.filter((c) => !c.completed).length;
  const completedCards = cards.filter((c) => c.completed).length;
  const recentBoards = boards.slice(0, 6);
  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  const stats = [
    { label: 'Workspaces', value: workspaces.length, icon: Building2, color: 'text-violet-600 bg-violet-50' },
    { label: 'Boards', value: boards.length, icon: Columns3, color: 'text-blue-600 bg-blue-50' },
    { label: 'Open Cards', value: openCards, icon: CreditCard, color: 'text-amber-600 bg-amber-50' },
    { label: 'Completed', value: completedCards, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {getGreeting()}, {userName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening across your workspaces.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 md:p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Workspaces */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Workspaces</h2>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Workspace
          </Button>
        </div>
        {workspaces.length === 0 ? (
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
      </section>

      {/* Recent Boards */}
      {recentBoards.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Recent Boards</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBoards.map((board) => {
              const ws = workspaces.find((w) => w.id === board.workspace);
              const listCount = lists.filter((l) => l.board === board.id).length;
              const cardCount = cards.filter((c) => c.board === board.id).length;
              return (
                <Link
                  key={board.id}
                  to={`/boards/${board.id}`}
                  className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: board.color || '#6366f1' }}
                    >
                      <Columns3 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{board.name}</h3>
                      <p className="text-xs text-muted-foreground">{ws?.name || 'Workspace'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex gap-3">
                      <span>{listCount} lists</span>
                      <span>{cardCount} cards</span>
                    </div>
                    <span>Updated {moment(board.updated_date).fromNow()}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <CreateWorkspaceModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}