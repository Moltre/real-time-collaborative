import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import { Progress } from '@/components/ui/progress';
import { HardDrive, Columns3, CreditCard, Files, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const LIMITS = {
  boards: 50,
  cards: 1000,
  files: 200,
  storageMb: 5120, // 5 GB
};

function formatSize(mb) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
}

export default function WorkspaceUsage() {
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace();
  const [stats, setStats] = useState({ boards: 0, cards: 0, files: 0, storageMb: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const filter = selectedWorkspaceId ? { workspace: selectedWorkspaceId } : {};
        const boardFilter = selectedWorkspaceId ? { workspace: selectedWorkspaceId } : {};
        const [boards, cards, files] = await Promise.all([
          base44.entities.Board.filter(boardFilter, '-updated_date', 500),
          base44.entities.Card.filter(filter, '-updated_date', 1000),
          base44.entities.SharedFile.filter(filter, '-updated_date', 500),
        ]);
        const storageMb = files.reduce((sum, f) => sum + (f.size || 0), 0) / (1024 * 1024);
        setStats({ boards: boards.length, cards: cards.length, files: files.length, storageMb });
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedWorkspaceId]);

  const meters = [
    { key: 'boards', label: 'Boards', value: stats.boards, limit: LIMITS.boards, icon: Columns3, color: 'text-indigo-600 bg-indigo-50' },
    { key: 'cards', label: 'Cards', value: stats.cards, limit: LIMITS.cards, icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
    { key: 'files', label: 'Shared Files', value: stats.files, limit: LIMITS.files, icon: Files, color: 'text-amber-600 bg-amber-50' },
    { key: 'storage', label: 'Storage Used', value: stats.storageMb, limit: LIMITS.storageMb, icon: HardDrive, color: 'text-rose-600 bg-rose-50', display: formatSize(stats.storageMb), limitDisplay: formatSize(LIMITS.storageMb) },
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        icon={HardDrive}
        title="Workspace Usage"
        description={selectedWorkspace ? `Account limits for ${selectedWorkspace.name}` : 'A visual overview of your account limits and usage.'}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 h-40 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {meters.map((m) => {
              const pct = Math.min(100, Math.round((m.value / m.limit) * 100));
              const near = pct >= 80;
              return (
                <div key={m.key} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', m.color)}>
                      <m.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.display || m.value} of {m.limitDisplay || m.limit}
                      </p>
                    </div>
                    <span className={cn('ml-auto text-sm font-semibold', near ? 'text-amber-600' : 'text-muted-foreground')}>
                      {pct}%
                    </span>
                  </div>
                  <Progress value={pct} className={cn(near && 'bg-amber-100')} />
                  {near && (
                    <p className="text-xs text-amber-600 mt-2">Approaching limit — consider archiving old items.</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Summary</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-2xl font-bold">{stats.boards}</p>
                <p className="text-xs text-muted-foreground">Boards</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.cards}</p>
                <p className="text-xs text-muted-foreground">Cards</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.files}</p>
                <p className="text-xs text-muted-foreground">Files</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatSize(stats.storageMb)}</p>
                <p className="text-xs text-muted-foreground">Storage</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}