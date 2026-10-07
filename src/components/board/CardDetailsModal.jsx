import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Save, Loader2, User, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';
import LabelBadge, { LABEL_OPTIONS } from '@/components/shared/LabelBadge';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function CardDetailsModal({ open, onClose, card, members = [], onUpdated, onDeleted }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
      setPriority(card.priority || 'MEDIUM');
      setAssignee(card.assignedTo || '');
      setDueDate(card.dueDate || '');
      setLabels(card.labels || []);
      setCompleted(card.completed || false);
    }
  }, [card]);

  if (!card) return null;

  const toggleLabel = (label) => {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const assigneeMember = members.find((m) => m.user === assignee);
      await base44.entities.Card.update(card.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedTo: assignee || '',
        assignee_name: assigneeMember?.user_name || '',
        dueDate: dueDate || '',
        labels,
        completed,
      });
      toast({ title: 'Card updated', description: title });
      onUpdated?.();
      onClose();
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.Card.delete(card.id);
      toast({ title: 'Card deleted' });
      onDeleted?.();
      setDeleteOpen(false);
      onClose();
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="animate-scale-in max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-due">Due Date</Label>
                <Input
                  id="edit-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.user} value={m.user}>
                      {m.user_name || m.user_email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Labels</Label>
              <div className="flex flex-wrap gap-2">
                {LABEL_OPTIONS.map((label) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleLabel(label)}
                    className={cn(
                      'transition-all',
                      labels.includes(label) ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                    )}
                  >
                    <LabelBadge label={label} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-completed"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <Label htmlFor="edit-completed" className="text-sm font-normal cursor-pointer">
                Mark as completed
              </Label>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Created by {card.created_by || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {moment(card.created_date).format('MMM D, YYYY')}
              </span>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
                className="mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Close
              </Button>
              <Button type="submit" disabled={saving || !title.trim()}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete card?"
        description={`"${card.title}" will be permanently deleted.`}
        confirmText="Delete"
        loading={deleting}
      />
    </>
  );
}