import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import {
  Activity as ActivityIcon, PlusCircle, CheckCircle2, ArrowLeftRight, Archive,
  ListPlus, Columns3, UserPlus, UserMinus, MessageSquare, Upload, FileText,
} from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  card_created: { icon: PlusCircle, color: 'text-blue-600 bg-blue-50' },
  card_completed: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  card_moved: { icon: ArrowLeftRight, color: 'text-violet-600 bg-violet-50' },
  card_archived: { icon: Archive, color: 'text-slate-600 bg-slate-100' },
  list_created: { icon: ListPlus, color: 'text-cyan-600 bg-cyan-50' },
  board_created: { icon: Columns3, color: 'text-indigo-600 bg-indigo-50' },
  member_joined: { icon: UserPlus, color: 'text-green-600 bg-green-50' },
  member_added: { icon: UserPlus, color: 'text-green-600 bg-green-50' },
  member_removed: { icon: UserMinus, color: 'text-red-600 bg-red-50' },
  comment_added: { icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
  file_uploaded: { icon: Upload, color: 'text-purple-600 bg-purple-50' },
};

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Activity.list('-created_date', 200);
        setActivities(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const filtered = filter === 'all' ? activities : activities.filter((a) => {
    if (filter === 'cards') return a.type.startsWith('card');
    if (filter === 'members') return a.type.startsWith('member');
    if (filter === 'boards') return a.type === 'board_created' || a.type === 'list_created';
    return true;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'cards', label: 'Cards' },
    { key: 'members', label: 'Members' },
    { key: 'boards', label: 'Boards' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader icon={ActivityIcon} title="Activity Feed" description="A chronological history of changes across your workspaces." />

      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn('px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors', filter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={ActivityIcon} title="No activity yet" description="Actions across your workspaces will appear here." />
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {filtered.map((act) => {
              const cfg = TYPE_CONFIG[act.type] || { icon: FileText, color: 'text-slate-600 bg-slate-100' };
              return (
                <div key={act.id} className="relative flex gap-4">
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-background', cfg.color)}>
                    <cfg.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm">
                        <span className="font-semibold">{act.actor_name || 'Someone'}</span>
                        <span className="text-muted-foreground"> {act.description}</span>
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{moment(act.created_date).fromNow()}</span>
                    </div>
                    {(act.board_name || act.workspace_name) && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {act.board_name && <span className="bg-muted px-2 py-0.5 rounded-md">{act.board_name}</span>}
                        {act.workspace_name && <span>in {act.workspace_name}</span>}
                      </div>
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