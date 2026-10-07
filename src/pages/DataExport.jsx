import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import { Download, FileJson, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
}

export default function DataExport() {
  const { workspaces, selectedWorkspaceId } = useWorkspace();
  const [boards, setBoards] = useState([]);
  const [lists, setLists] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [done, setDone] = useState(null);

  const ws = workspaces.find((w) => w.id === selectedWorkspaceId);

  useEffect(() => {
    if (!ws) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      try {
        const [bds, allLists, allCards] = await Promise.all([
          base44.entities.Board.filter({ workspace: ws.id }),
          base44.entities.List.list('-position', 500),
          base44.entities.Card.list('-updated_date', 500),
        ]);
        setBoards(bds);
        setLists(allLists.filter((l) => bds.some((b) => b.id === l.board)));
        setCards(allCards.filter((c) => bds.some((b) => b.id === c.board)));
      } finally {
        setLoading(false);
      }
    })();
  }, [ws]);

  const buildExportData = () => ({
    workspace: { id: ws.id, name: ws.name, description: ws.description, members: ws.members },
    boards: boards.map((b) => ({ id: b.id, name: b.name, description: b.description, color: b.color })),
    lists: lists.map((l) => ({ id: l.id, board: l.board, name: l.name, position: l.position })),
    cards: cards.map((c) => ({
      id: c.id,
      board: c.board,
      list: c.list,
      title: c.title,
      description: c.description,
      priority: c.priority,
      dueDate: c.dueDate,
      labels: (c.labels || []).join('; '),
      completed: c.completed,
      archived: c.archived,
    })),
  });

  const handleExport = async (format) => {
    if (!ws) {
      toast({ title: 'Select a workspace first', variant: 'destructive' });
      return;
    }
    setExporting(format);
    try {
      const data = buildExportData();
      const stamp = new Date().toISOString().slice(0, 10);
      const baseName = `${ws.name.replace(/\s+/g, '_')}_${stamp}`;

      if (format === 'json') {
        downloadFile(JSON.stringify(data, null, 2), `${baseName}.json`, 'application/json');
      } else {
        const csv = toCSV(data.cards);
        downloadFile(csv, `${baseName}_cards.csv`, 'text/csv');
      }
      setDone(format);
      setTimeout(() => setDone(null), 2500);
      toast({ title: 'Export ready', description: `${format.toUpperCase()} file downloaded.` });
    } catch (err) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    } finally {
      setExporting(null);
    }
  };

  const stats = [
    { label: 'Boards', value: boards.length },
    { label: 'Lists', value: lists.length },
    { label: 'Cards', value: cards.length },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader icon={Download} title="Data Export" description="Download your workspace and board data for external analysis." />

      {!ws ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm p-4">
          Select a workspace in the sidebar to export its data.
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleExport('json')}
              disabled={exporting !== null}
              className="rounded-xl border border-border bg-card p-5 text-left hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                {done === 'json' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <FileJson className="w-5 h-5" />}
              </div>
              <h3 className="font-semibold text-sm mb-1">JSON Format</h3>
              <p className="text-xs text-muted-foreground mb-3">Complete workspace data including boards, lists, and all card details.</p>
              <span className="text-xs font-medium text-primary">
                {exporting === 'json' ? 'Exporting...' : done === 'json' ? 'Downloaded!' : 'Download JSON'}
              </span>
            </button>

            <button
              onClick={() => handleExport('csv')}
              disabled={exporting !== null}
              className="rounded-xl border border-border bg-card p-5 text-left hover:shadow-md transition-shadow disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                {done === 'csv' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <FileSpreadsheet className="w-5 h-5" />}
              </div>
              <h3 className="font-semibold text-sm mb-1">CSV Format</h3>
              <p className="text-xs text-muted-foreground mb-3">Card-level spreadsheet for analysis in Excel or Google Sheets.</p>
              <span className="text-xs font-medium text-primary">
                {exporting === 'csv' ? 'Exporting...' : done === 'csv' ? 'Downloaded!' : 'Download CSV'}
              </span>
            </button>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              The export includes all boards, lists, and cards from <span className="font-medium text-foreground">{ws.name}</span>.
              Card data includes titles, descriptions, priorities, due dates, labels, and completion status. File attachments are not included in the export.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}