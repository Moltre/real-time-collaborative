import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import PriorityBadge from '@/components/shared/PriorityBadge';
import { ListTodo, Circle, Clock, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';

export default function MyTasks() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('status');

  useEffect(() => {
    (async () => {
      try {
        const [cardsData, boardsData] = await Promise.all([
          base44.entities.Card.list('-updated_date', 500),
          base44.entities.Board.list('-updated_date', 200),
        ]);
        setCards(cardsData.filter((c) => c.assignedTo === user.id && !c.archived));
        setBoards(boardsData);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

  if (loading) return <DashboardSkeleton />;

  const boardName = (boardId) => boards.find((b) => b.id === boardId)?.name || 'Board';
  const boardColor = (boardId) => boards.find((b) => b.id === boardId)?.color || '#6366f1';

  const isOverdue = (c) => c.dueDate && !c.completed && moment(c.dueDate).isBefore(moment(), 'day');

  const groups = groupBy === 'status'
    ? [
        { key: 'todo', label: 'To Do', icon: Circle, color: 'text-slate-500', items: cards.filter((c) => !c.completed) },
        { key: 'done', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500', items: cards.filter((c) => c.completed) },
      ]
    : [
        { key: 'overdue', label: 'Overdue', icon: AlertCircle, color: 'text-red-500', items: cards.filter(isOverdue) },
        { key: 'today', label: 'Due Today', icon: Clock, color: 'text-amber-500', items: cards.filter((c) => c.dueDate && moment(c.dueDate).isSame(moment(), 'day') && !c.completed) },
        { key: 'upcoming', label: 'Upcoming', icon: Calendar, color: 'text-blue-500', items: cards.filter((c) => c.dueDate && moment(c.dueDate).isAfter(moment(), 'day') && !c.completed) },
        { key: 'nodue', label: 'No Due Date', icon: ListTodo, color: 'text-slate-400', items: cards.filter((c) => !c.dueDate && !c.completed) },
        { key: 'done', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500', items: cards.filter((c) => c.completed) },
      ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader
        icon={ListTodo}
        title="My Tasks"
        description="All cards assigned to you across every workspace."
      >
        <div className="flex rounded-lg border border-border p-0.5 bg-card">
          <button
            onClick={() => setGroupBy('status')}
            className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-colors', groupBy === 'status' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            By Status
          </button>
          <button
            onClick={() => setGroupBy('dueDate')}
            className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-colors', groupBy === 'dueDate' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
          >
            By Due Date
          </button>
        </div>
      </PageHeader>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={ListTodo} title="No tasks assigned to you" description="Cards assigned to you will appear here." />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.filter((g) => g.items.length > 0).map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-2 mb-3">
                <group.icon className={cn('w-4 h-4', group.color)} />
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">{group.label}</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{group.items.length}</span>
              </div>
              <div className="space-y-2">
                {group.items.map((card) => (
                  <Link
                    key={card.id}
                    to={`/boards/${card.board}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:shadow-sm hover:border-primary/30 transition-all"
                  >
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: boardColor(card.board) }} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium truncate', card.completed && 'line-through text-muted-foreground')}>
                        {card.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{boardName(card.board)}</p>
                    </div>
                    {card.dueDate && (
                      <span className={cn('text-xs font-medium px-2 py-1 rounded-md', isOverdue(card) ? 'bg-red-50 text-red-600' : 'bg-muted text-muted-foreground')}>
                        {moment(card.dueDate).format('MMM D')}
                      </span>
                    )}
                    <PriorityBadge priority={card.priority} />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}