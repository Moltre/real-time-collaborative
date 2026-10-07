import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { BarChart3, TrendingUp, CheckCircle2, Clock, Users } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart, Line,
} from 'recharts';

const PRIORITY_COLORS = { LOW: '#94a3b8', MEDIUM: '#6366f1', HIGH: '#f59e0b', URGENT: '#ef4444' };

export default function Analytics() {
  const { workspaces, selectedWorkspaceId } = useWorkspace();
  const [cards, setCards] = useState([]);
  const [boards, setBoards] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [cardData, boardData, msData] = await Promise.all([
          base44.entities.Card.list('-created_date', 500),
          base44.entities.Board.list('-updated_date', 200),
          base44.entities.WorkspaceMember.list('-created_date', 500),
        ]);
        setCards(cardData);
        setBoards(boardData);
        setMembers(msData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const ws = workspaces.find((w) => w.id === selectedWorkspaceId);
  const wsBoardIds = useMemo(
    () => (ws ? boards.filter((b) => b.workspace === ws.id).map((b) => b.id) : null),
    [ws, boards]
  );
  const filteredCards = useMemo(() => {
    const active = cards.filter((c) => !c.archived);
    if (!wsBoardIds) return active;
    return active.filter((c) => wsBoardIds.includes(c.board));
  }, [cards, wsBoardIds]);

  if (loading) return <DashboardSkeleton />;

  const activeCards = filteredCards.filter((c) => !c.archived);
  const completed = activeCards.filter((c) => c.completed).length;
  const open = activeCards.filter((c) => !c.completed).length;
  const completionRate = activeCards.length > 0 ? Math.round((completed / activeCards.length) * 100) : 0;

  const statusData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Open', value: open, color: '#6366f1' },
  ];

  const priorityData = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => ({
    name: p,
    count: activeCards.filter((c) => c.priority === p).length,
  }));

  // Cards created over last 7 days
  const trendData = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().slice(0, 10);
    const created = activeCards.filter((c) => c.created_date?.slice(0, 10) === dayStr).length;
    const done = activeCards.filter((c) => c.completed && c.updated_date?.slice(0, 10) === dayStr).length;
    trendData.push({ day: day.toLocaleDateString('en', { weekday: 'short' }), created, completed: done });
  }

  // Productivity by member
  const memberProductivity = members
    .filter((m) => !wsBoardIds || m.workspace === ws.id)
    .map((m) => ({
      name: (m.user_name || 'Unknown').split(' ')[0],
      completed: activeCards.filter((c) => c.assignedTo === m.user && c.completed).length,
      open: activeCards.filter((c) => c.assignedTo === m.user && !c.completed).length,
    }))
    .filter((m) => m.completed + m.open > 0)
    .slice(0, 8);

  const stats = [
    { label: 'Total Cards', value: activeCards.length, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-green-600 bg-green-50' },
    { label: 'Open', value: open, icon: Clock, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
      <PageHeader
        icon={BarChart3}
        title="Workspace Analytics"
        description={ws ? `Insights for ${ws.name}` : 'Insights across all your workspaces'}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {activeCards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={BarChart3} title="No data to analyze" description="Create cards and boards to see analytics." />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Completion pie */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Card Completion</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority bar */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Cards by Priority</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={PRIORITY_COLORS[entry.name]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Trend line */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Productivity Trend (7 days)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Member productivity */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-4">Productivity by Member</h3>
            {memberProductivity.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Users className="w-8 h-8 opacity-40" />
                  <p>No assigned cards yet</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={memberProductivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="open" stackId="a" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}