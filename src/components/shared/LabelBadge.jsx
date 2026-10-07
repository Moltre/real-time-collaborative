import React from 'react';
import { cn } from '@/lib/utils';

export const LABEL_OPTIONS = [
  'Frontend',
  'Backend',
  'Bug',
  'Design',
  'Research',
  'Urgent',
  'Testing',
  'Documentation',
];

const labelColors = {
  Frontend: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Backend: 'bg-blue-50 text-blue-700 border-blue-200',
  Bug: 'bg-red-50 text-red-700 border-red-200',
  Design: 'bg-violet-50 text-violet-700 border-violet-200',
  Research: 'bg-amber-50 text-amber-700 border-amber-200',
  Urgent: 'bg-rose-50 text-rose-700 border-rose-200',
  Testing: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Documentation: 'bg-slate-100 text-slate-700 border-slate-200',
};

export function getLabelColor(label) {
  return labelColors[label] || 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function LabelBadge({ label, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
        getLabelColor(label),
        className
      )}
    >
      {label}
    </span>
  );
}