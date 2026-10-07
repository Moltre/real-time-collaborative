import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

export default function CreateListModal({ boardId, members, existingCount = 0, onCreated, isViewer }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const list = await base44.entities.List.create({
        board: boardId,
        name: name.trim(),
        position: existingCount,
        members: members || [user.id],
      });
      toast({ title: 'List created', description: name });
      setName('');
      setOpen(false);
      onCreated?.(list);
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (isViewer) return null;

  if (!open) {
    return (
      <div className="w-72 shrink-0">
        <Button
          variant="outline"
          className="w-full justify-start border-dashed text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add List
        </Button>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0 rounded-xl border border-border bg-muted/40 p-3 animate-scale-in">
      <form onSubmit={handleCreate} className="space-y-2">
        <Input
          placeholder="Enter list name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="h-9"
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={loading || !name.trim()}>
            {loading ? 'Adding...' : 'Add List'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false);
              setName('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}