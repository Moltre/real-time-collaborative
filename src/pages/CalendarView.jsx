import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import PriorityBadge from '@/components/shared/PriorityBadge';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView() {
  const [cards, setCards] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(moment());

  useEffect(() => {
    (async () => {
      try {
        const [cardData, boardData] = await Promise.all([
          base44.entities.Card.list('-updated_date', 500),
          base44.entities.Board.list('-updated_date', 200),
        ]);
        setCards(cardData.filter((c) => !c.archived && c.dueDate));
        setBoards(boardData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const boardName = (id) => boards.find((b) => b.id === id)?.name || '';
  const boardColor = (id) => boards.find((b) => b.id === id)?.color || '#6366f1';

  const monthStart = currentMonth.clone().startOf('month');
  const monthEnd = currentMonth.clone().endOf('month');
  const startDay = monthStart.day();
  const days = [];
  const gridStart = monthStart.clone().subtract(startDay, 'days');
  for (let i = 0; i < 42; i++) {
    days.push(gridStart.clone().add(i, 'days'));
  }

  const cardsByDate = useMemo(() => {
    const map = {};
    cards.forEach((c) => {
      if (!c.dueDate) return;
      const key = c.dueDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [cards]);

  if (loading) return <DashboardSkeleton />;

  const today = moment().format('YYYY-MM-DD');

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader icon={CalIcon} title="Calendar" description="All cards with due dates on a monthly view." />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{currentMonth.format('MMMM YYYY')}</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrentMonth(currentMonth.clone().subtract(1, 'month'))} className="p-2 rounded-lg border border-border hover:bg-accent transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentMonth(moment())} className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-accent transition-colors">
            Today
          </button>
          <button onClick={() => setCurrentMonth(currentMonth.clone().add(1, 'month'))} className="p-2 rounded-lg border border-border hover:bg-accent transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={CalIcon} title="No cards with due dates" description="Set due dates on your cards to see them on the calendar." />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayStr = day.format('YYYY-MM-DD');
              const dayCards = cardsByDate[dayStr] || [];
              const isToday = dayStr === today;
              const inMonth = day.isSame(currentMonth, 'month');
              return (
                <div
                  key={i}
                  className={cn('min-h-[100px] border-b border-r border-border p-1.5', !inMonth && 'bg-muted/30', i % 7 === 6 && 'border-r-0')}
                >
                  <div className={cn('text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full', isToday ? 'bg-primary text-primary-foreground' : inMonth ? 'text-foreground' : 'text-muted-foreground/50')}>
                    {day.format('D')}
                  </div>
                  <div className="space-y-1">
                    {dayCards.slice(0, 3).map((card) => (
                      <Link
                        key={card.id}
                        to={`/boards/${card.board}`}
                        className="block text-xs rounded-md px-1.5 py-1 truncate text-white hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: boardColor(card.board) }}
                        title={card.title}
                      >
                        {card.title}
                      </Link>
                    ))}
                    {dayCards.length > 3 && (
                      <p className="text-xs text-muted-foreground px-1.5">+{dayCards.length - 3} more</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}