import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'operations', label: 'Operations' },
  { value: 'hr', label: 'HR' },
];

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#ef4444'];

export default function SaveAsTemplateModal({ open, onClose, board, lists, cards, onSaved }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  const listNames = useMemo(() => lists.map((l) => l.name).filter(Boolean), [lists]);
  const labels = useMemo(() => {
    const set = new Set();
    cards.forEach((c) => (c.labels || []).forEach((l) => l && set.add(l)));
    return Array.from(set);
  }, [cards]);

  React.useEffect(() => {
    if (open && board) {
      setName(board.name ? `${board.name} Template` : '');
      setDescription(board.description || '');
      setColor(board.color || '#6366f1');
    }
  }, [open, board]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || listNames.length === 0) return;
    setSaving(true);
    try {
      const created = await base44.entities.Template.create({
        name: name.trim(),
        description: description.trim(),
        category,
        icon: 'LayoutTemplate',
        color,
        lists: listNames,
        labels,
        source_board: board?.id,
        isCustom: true,
      });
      toast({ title: 'Template saved', description: `"${created.name}" is now available in your Templates page.` });
      onSaved?.(created);
      onClose();
    } catch (err) {
      toast({ title: 'Failed to save template', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Board as Template</DialogTitle>
          <DialogDescription>
            Capture this board's list structure and labels so you can spin up similar projects instantly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tpl-name">Template Name</Label>
            <Input id="tpl-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tpl-desc">Description</Label>
            <Textarea id="tpl-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: c, outline: color === c ? '2px solid hsl(var(--foreground))' : 'none', outlineOffset: '2px' }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Lists ({listNames.length})</Label>
            <div className="flex flex-wrap gap-1.5">
              {listNames.map((l, i) => (
                <span key={i} className="text-xs bg-muted px-2 py-1 rounded-md">{l}</span>
              ))}
              {listNames.length === 0 && <span className="text-xs text-muted-foreground">No lists on this board</span>}
            </div>
          </div>
          {labels.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Labels ({labels.length})</Label>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((l, i) => (
                  <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">{l}</span>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || !name.trim() || listNames.length === 0}>
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}