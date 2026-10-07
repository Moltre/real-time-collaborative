import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/lib/WorkspaceContext';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder, Plus, Trash2, Loader2, Columns3, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function BoardFolders() {
  const { selectedWorkspace, selectedWorkspaceId } = useWorkspace();
  const [folders, setFolders] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!selectedWorkspaceId) { setLoading(false); return; }
    try {
      const [folderData, boardData] = await Promise.all([
        base44.entities.BoardFolder.filter({ workspace: selectedWorkspaceId }, '-created_date', 100),
        base44.entities.Board.filter({ workspace: selectedWorkspaceId }, '-updated_date', 200),
      ]);
      setFolders(folderData);
      setBoards(boardData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedWorkspaceId]);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim() || !selectedWorkspace) return;
    setSaving(true);
    try {
      const created = await base44.entities.BoardFolder.create({
        name: name.trim(),
        workspace: selectedWorkspace.id,
        workspace_name: selectedWorkspace.name,
        workspace_members: selectedWorkspace.members || [],
      });
      setFolders((prev) => [created, ...prev]);
      setName('');
      toast({ title: 'Folder created' });
    } catch (err) {
      toast({ title: 'Could not create folder', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (folder) => {
    await base44.entities.BoardFolder.delete(folder.id);
    setFolders((prev) => prev.filter((f) => f.id !== folder.id));
    toast({ title: 'Folder deleted' });
  };

  const toggleBoard = async (folder, boardId) => {
    const current = folder.boards || [];
    const next = current.includes(boardId) ? current.filter((b) => b !== boardId) : [...current, boardId];
    await base44.entities.BoardFolder.update(folder.id, { boards: next });
    setFolders((prev) => prev.map((f) => (f.id === folder.id ? { ...f, boards: next } : f)));
  };

  const boardName = (id) => boards.find((b) => b.id === id)?.name || 'Board';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={Folder} title="Board Folders" description="Group related boards into folders to keep your workspace organized." />

      {!selectedWorkspace ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={Folder} title="No workspace selected" description="Choose a workspace to manage board folders." />
        </div>
      ) : (
        <>
          <form onSubmit={create} className="flex gap-3 mb-8">
            <Input placeholder="Folder name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              New Folder
            </Button>
          </form>

          {loading ? (
            <div className="h-32 bg-muted/40 rounded-xl animate-pulse" />
          ) : folders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card">
              <EmptyState icon={Folder} title="No folders yet" description="Create a folder above, then add boards to it for easy grouping." />
            </div>
          ) : (
            <div className="space-y-4">
              {folders.map((folder) => (
                <div key={folder.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
                    <Folder className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm flex-1">{folder.name}</h3>
                    <span className="text-xs text-muted-foreground">{(folder.boards || []).length} boards</span>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(folder)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="p-3">
                    {(folder.boards || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground px-2 py-3">No boards in this folder yet. Add some below.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(folder.boards || []).map((bid) => (
                          <span key={bid} className="inline-flex items-center gap-1.5 bg-muted rounded-md pl-2 pr-1 py-1 text-xs">
                            <Columns3 className="w-3 h-3 text-muted-foreground" />
                            <Link to={`/boards/${bid}`} className="hover:underline">{boardName(bid)}</Link>
                            <button onClick={() => toggleBoard(folder, bid)} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
                      {boards.filter((b) => !(folder.boards || []).includes(b.id)).slice(0, 8).map((b) => (
                        <button key={b.id} onClick={() => toggleBoard(folder, b.id)} className="text-xs border border-dashed border-border rounded-md px-2 py-1 text-muted-foreground hover:text-foreground hover:border-foreground/30">
                          + {b.name}
                        </button>
                      ))}
                      {boards.filter((b) => !(folder.boards || []).includes(b.id)).length === 0 && (
                        <span className="text-xs text-muted-foreground px-1">All boards are in this folder.</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}