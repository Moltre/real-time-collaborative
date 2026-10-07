import React from 'react';
import { cn } from '@/lib/utils';
import { Crown, Shield, User, Eye } from 'lucide-react';

const roleConfig = {
  OWNER: { label: 'Owner', icon: Crown, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ADMIN: { label: 'Admin', icon: Shield, className: 'bg-violet-50 text-violet-700 border-violet-200' },
  MEMBER: { label: 'Member', icon: User, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  VIEWER: { label: 'Viewer', icon: Eye, className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function RoleBadge({ role, showIcon = true, className }) {
  const config = roleConfig[role] || roleConfig.MEMBER;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border',
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
}