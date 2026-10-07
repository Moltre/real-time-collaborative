import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowRight, ArrowUp, Flame } from 'lucide-react';

const priorityConfig = {
  LOW: { label: 'Low', icon: ArrowDown, className: 'bg-slate-100 text-slate-600' },
  MEDIUM: { label: 'Medium', icon: ArrowRight, className: 'bg-blue-50 text-blue-600' },
  HIGH: { label: 'High', icon: ArrowUp, className: 'bg-orange-50 text-orange-600' },
  URGENT: { label: 'Urgent', icon: Flame, className: 'bg-red-50 text-red-600' },
};

export default function PriorityBadge({ priority, className }) {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}