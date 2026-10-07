import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import RoleBadge from '@/components/shared/RoleBadge';
import { Users, Mail, CreditCard, Building2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function Team() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [cards, setCards] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [ms, cardData, wsData] = await Promise.all([
          base44.entities.WorkspaceMember.list('-created_date', 500),
          base44.entities.Card.list('-updated_date', 500),
          base44.entities.Workspace.list('-created_date', 200),
        ]);
        setMemberships(ms);
        setCards(cardData.filter((c) => !c.archived));
        setWorkspaces(wsData);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  // Dedupe by user id
  const userMap = new Map();
  memberships.forEach((m) => {
    if (!userMap.has(m.user)) {
      userMap.set(m.user, {
        id: m.user,
        name: m.user_name || 'Unknown',
        email: m.user_email || '',
        roles: [],
        workspaces: [],
        openCards: 0,
      });
    }
    const entry = userMap.get(m.user);
    entry.roles.push(m.role);
    entry.workspaces.push(m.workspace_name || 'Workspace');
  });

  cards.forEach((c) => {
    if (c.assignedTo && !c.completed && userMap.has(c.assignedTo)) {
      userMap.get(c.assignedTo).openCards++;
    }
  });

  let team = Array.from(userMap.values());
  if (search) {
    const q = search.toLowerCase();
    team = team.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }
  team.sort((a, b) => a.name.localeCompare(b.name));

  const topRole = (roles) => {
    if (roles.includes('OWNER')) return 'OWNER';
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('MEMBER')) return 'MEMBER';
    return 'VIEWER';
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader icon={Users} title="Team Directory" description="All members across your workspaces with roles and current assignments." />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search members by name or email..."
        className="w-full max-w-md mb-6 flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />

      {team.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={Users} title="No team members found" description="Invite members to your workspaces to see them here." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => (
            <div key={member.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{member.name}</h3>
                  <RoleBadge role={topRole(member.roles)} />
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{member.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{member.workspaces.length} workspace{member.workspaces.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="w-3.5 h-3.5 shrink-0" />
                  <span>{member.openCards} open task{member.openCards !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}