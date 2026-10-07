import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, Crown } from 'lucide-react';
import RoleBadge from '@/components/shared/RoleBadge';
import moment from 'moment';

export default function MemberRow({ member, canManage, onRemove, onRoleChange, isSelf }) {
  const name = member.user_name || member.user_email?.split('@')[0] || 'Member';
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <Avatar className="w-10 h-10 border border-border">
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">{name}</p>
          {isSelf && <span className="text-xs text-muted-foreground">(You)</span>}
          {member.role === 'OWNER' && <Crown className="w-3.5 h-3.5 text-amber-500" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">{member.user_email}</p>
      </div>
      <div className="hidden sm:block text-xs text-muted-foreground">
        {moment(member.created_date).format('MMM D, YYYY')}
      </div>
      <div className="flex items-center gap-2">
        {canManage && member.role !== 'OWNER' ? (
          <Select
            value={member.role}
            onValueChange={(role) => onRoleChange(member.id, role)}
          >
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <RoleBadge role={member.role} />
        )}
      </div>
      {canManage && member.role !== 'OWNER' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onRemove(member)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}