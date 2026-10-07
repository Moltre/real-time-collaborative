import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';

export default function AddMemberModal({ open, onClose, workspace, currentMembers, onAdded }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      // Check if already a member
      const existing = await base44.entities.WorkspaceMember.filter({
        workspace: workspace.id,
        user_email: email.trim().toLowerCase(),
      });
      if (existing.length > 0) {
        toast({ title: 'Already a member', description: 'This user is already in the workspace.', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Try to find the user by email
      let userId = null;
      let userName = email.split('@')[0];
      try {
        const users = await base44.entities.User.list();
        const foundUser = users.find((u) => u.email === email.trim().toLowerCase());
        if (foundUser) {
          userId = foundUser.id;
          userName = foundUser.full_name || foundUser.email;
        }
      } catch (e) {
        // If we can't list users, we'll add by email only
      }

      const newMembers = [...(workspace.members || []), userId].filter(Boolean);

      // Create WorkspaceMember record
      await base44.entities.WorkspaceMember.create({
        user: userId || email.trim(),
        user_email: email.trim().toLowerCase(),
        user_name: userName,
        workspace: workspace.id,
        workspace_name: workspace.name,
        role,
        workspace_members: newMembers.length > 0 ? newMembers : [user.id],
        workspace_owner: workspace.owner,
      });

      // Update workspace members if we found a real user
      if (userId) {
        await base44.entities.Workspace.update(workspace.id, {
          members: [...(workspace.members || []), userId],
        });

        // Cascade to boards, lists, cards
        const boards = await base44.entities.Board.filter({ workspace: workspace.id });
        if (boards.length > 0) {
          const boardIds = boards.map((b) => b.id);
          await base44.entities.Board.updateMany(
            { workspace: workspace.id },
            { $addToSet: { members: userId } }
          );
          await base44.entities.List.updateMany(
            { board: { $in: boardIds } },
            { $addToSet: { members: userId } }
          );
          const lists = await base44.entities.List.filter({ board: { $in: boardIds } });
          if (lists.length > 0) {
            const listIds = lists.map((l) => l.id);
            await base44.entities.Card.updateMany(
              { list: { $in: listIds } },
              { $addToSet: { members: userId } }
            );
          }
        }
      }

      toast({ title: 'Member added', description: `${email} has been added as ${role.toLowerCase()}.` });
      setEmail('');
      setRole('MEMBER');
      onAdded?.();
      onClose();
    } catch (err) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Member
          </DialogTitle>
          <DialogDescription>
            Invite a team member to "{workspace?.name}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="member-email">Email Address</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin — Manage members & boards</SelectItem>
                <SelectItem value="MEMBER">Member — Create & edit cards</SelectItem>
                <SelectItem value="VIEWER">Viewer — Read-only access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !email.trim()}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}