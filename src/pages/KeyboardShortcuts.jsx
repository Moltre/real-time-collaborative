import React, { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Keyboard, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SHORTCUT_SECTIONS = [
  {
    title: 'Global Navigation',
    shortcuts: [
      { keys: ['G', 'D'], description: 'Go to Dashboard' },
      { keys: ['G', 'W'], description: 'Go to Workspaces' },
      { keys: ['G', 'T'], description: 'Go to My Tasks' },
      { keys: ['G', 'C'], description: 'Go to Calendar' },
      { keys: ['G', 'A'], description: 'Go to Analytics' },
      { keys: ['/'], description: 'Focus global search' },
      { keys: ['?'], description: 'Open this shortcuts page' },
    ],
  },
  {
    title: 'Board Actions',
    shortcuts: [
      { keys: ['N'], description: 'Create a new card in the first list' },
      { keys: ['B'], description: 'Create a new list' },
      { keys: ['F'], description: 'Focus the card search bar' },
      { keys: ['X'], description: 'Clear all active filters' },
      { keys: ['Esc'], description: 'Close open dialog or modal' },
    ],
  },
  {
    title: 'Card Actions',
    shortcuts: [
      { keys: ['Enter'], description: 'Open card details (when focused)' },
      { keys: ['E'], description: 'Edit card title (when card is open)' },
      { keys: ['L'], description: 'Add a label to the card' },
      { keys: ['A'], description: 'Assign the card to a member' },
      { keys: ['D'], description: 'Set a due date' },
      { keys: ['C'], description: 'Archive the card' },
      { keys: ['Space'], description: 'Toggle card completion' },
    ],
  },
  {
    title: 'Workspace',
    shortcuts: [
      { keys: ['Shift', 'N'], description: 'Create a new board' },
      { keys: ['Shift', 'I'], description: 'Invite a member' },
      { keys: ['Shift', 'T'], description: 'Open Templates page' },
    ],
  },
];

function KeyCap({ k }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md border border-border bg-muted text-xs font-semibold text-foreground shadow-sm">
      {k}
    </kbd>
  );
}

export default function KeyboardShortcuts() {
  const [query, setQuery] = useState('');

  const filtered = SHORTCUT_SECTIONS.map((section) => ({
    ...section,
    shortcuts: section.shortcuts.filter(
      (s) => s.description.toLowerCase().includes(query.toLowerCase()) || s.keys.some((k) => k.toLowerCase().includes(query.toLowerCase()))
    ),
  })).filter((section) => section.shortcuts.length > 0);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader icon={Keyboard} title="Keyboard Shortcuts" description="Quick actions to speed up your workflow." />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Filter shortcuts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-6">
        {filtered.map((section) => (
          <div key={section.title} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/50">
              <h3 className="font-semibold text-sm">{section.title}</h3>
            </div>
            <div className="divide-y divide-border">
              {section.shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-foreground">{s.description}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, j) => (
                      <React.Fragment key={j}>
                        {j > 0 && <span className="text-muted-foreground text-xs mx-0.5">+</span>}
                        <KeyCap k={k} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No shortcuts match "{query}".</p>
        )}
      </div>
    </div>
  );
}