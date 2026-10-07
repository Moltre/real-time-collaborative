import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import PriorityBadge from '@/components/shared/PriorityBadge';
import LabelBadge from '@/components/shared/LabelBadge';
import moment from 'moment';

export default function KanbanCard({ card, onClick, isDragging, members = [] }) {
  const dueDate = card.dueDate ? moment(card.dueDate) : null;
  const isOverdue = dueDate && dueDate.isBefore(moment(), 'day') && !card.completed;
  const isCompleted = card.completed;
  const isDueSoon = dueDate && !isOverdue && !isCompleted && dueDate.isBefore(moment().add(2, 'days'), 'day');

  const assignee = members.find((m) => m.user === card.assignedTo);
  const assigneeName = card.assignee_name || assignee?.user_name || '';
  const assigneeInitials = assigneeName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-lg border border-border bg-card p-3 space-y-2 cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all',
        isDragging && 'shadow-lg border-primary/40 opacity-90 rotate-1'
      )}
    >
      {card.labels && card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.labels.slice(0, 3).map((label) => (
            <LabelBadge key={label} label={label} />
          ))}
          {card.labels.length > 3 && (
            <span className="text-xs text-muted-foreground">+{card.labels.length - 3}</span>
          )}
        </div>
      )}
      <p className="text-sm font-medium text-foreground leading-snug">{card.title}</p>
      {card.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={card.priority} />
          {dueDate && (
            <span
              className={cn(
                'inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded',
                isCompleted
                  ? 'bg-emerald-50 text-emerald-600'
                  : isOverdue
                  ? 'bg-red-50 text-red-600'
                  : isDueSoon
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-slate-50 text-slate-500'
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : isOverdue ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Calendar className="w-3 h-3" />
              )}
              {dueDate.format('MMM D')}
            </span>
          )}
        </div>
        {assigneeInitials && (
          <Avatar className="w-6 h-6 border border-border">
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {assigneeInitials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}