import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import {
  Bell, AtSign, UserPlus, Calendar, MessageSquare, Info, CheckCheck, Trash2,
} from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';

const TYPE_CONFIG = {
  mention: { icon: AtSign, color: 'text-violet-600 bg-violet-50' },
  assignment: { icon: UserPlus, color: 'text-blue-600 bg-blue-50' },
  due_date: { icon: Calendar, color: 'text-amber-600 bg-amber-50' },
  comment: { icon: MessageSquare, color: 'text-emerald-600 bg-emerald-50' },
  member_added: { icon: UserPlus, color: 'text-green-600 bg-green-50' },
  system: { icon: Info, color: 'text-slate-600 bg-slate-100' },
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Notification.list('-created_date', 200);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <DashboardSkeleton />;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await base44.entities.Notification.bulkUpdate(unread.map((n) => ({ id: n.id, read: true })));
    load();
  };

  const markRead = async (n) => {
    if (n.read) return;
    await base44.entities.Notification.update(n.id, { read: true });
    load();
  };

  const remove = async (n) => {
    await base44.entities.Notification.delete(n.id);
    load();
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader icon={Bell} title="Notifications" description="Recent alerts — mentions, assignments, and approaching due dates.">
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead}>
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </PageHeader>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
        ].map((f) => (
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
          <EmptyState icon={Bell} title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'} description="You're all caught up!" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            return (
              <div
                key={n.id}
                className={cn('flex items-start gap-3 rounded-xl border p-4 transition-colors cursor-pointer', n.read ? 'border-border bg-card' : 'border-primary/20 bg-primary/5')}
                onClick={() => markRead(n)}
              >
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', cfg.color)}>
                  <cfg.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  {n.actor_name && <p className="text-xs text-muted-foreground mt-1">by {n.actor_name}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{moment(n.created_date).fromNow()}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); remove(n); }}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}