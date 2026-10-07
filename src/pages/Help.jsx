import React, { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import {
  HelpCircle, Rocket, Columns3, CreditCard, Users, Settings, Search,
  ChevronDown, BookOpen, Lightbulb, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    icon: Rocket,
    title: 'Getting Started',
    color: 'text-blue-600 bg-blue-50',
    articles: [
      { q: 'How do I create my first workspace?', a: 'Click "Create Workspace" on the dashboard or workspaces page. Give it a name, pick a color, and you\'re ready to add boards and invite members.' },
      { q: 'How do I invite team members?', a: 'Open a workspace, go to the Members tab, and click "Add Member." Enter their email and choose a role (Admin, Member, or Viewer). They\'ll receive an invitation to join.' },
      { q: 'What are the different roles?', a: 'Owner has full control. Admins can manage members and settings. Members can create and edit boards. Viewers have read-only access and cannot drag cards or create items.' },
    ],
  },
  {
    icon: Columns3,
    title: 'Boards & Lists',
    color: 'text-violet-600 bg-violet-50',
    articles: [
      { q: 'How do I create a board?', a: 'Inside a workspace, go to the Boards tab and click "Create Board." You can also apply a template from the Templates page to start with pre-built lists.' },
      { q: 'Can I reorder lists?', a: 'Yes! Drag a list by its header to reorder it horizontally. You need at least Member role — Viewers cannot drag.' },
      { q: 'How do I delete a list?', a: 'Click the menu (⋯) on the list header and select "Delete." This removes the list and all cards inside it permanently.' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Cards',
    color: 'text-amber-600 bg-amber-50',
    articles: [
      { q: 'How do I move a card between lists?', a: 'Simply drag the card to another column. The change saves automatically and updates for all workspace members.' },
      { q: 'How do I assign a card?', a: 'Click on a card to open its details, then use the "Assignee" dropdown to pick a workspace member. Assigned cards appear on the My Tasks page.' },
      { q: 'Can I set due dates and priorities?', a: 'Yes — open any card and set a due date and priority (Low, Medium, High, Urgent). Overdue cards are highlighted in red on the board and calendar.' },
      { q: 'How do labels work?', a: 'Labels are color-coded tags you can add to cards for categorization. Add them from the card details modal. Use the board search bar to filter by label.' },
    ],
  },
  {
    icon: Users,
    title: 'Team & Collaboration',
    color: 'text-emerald-600 bg-emerald-50',
    articles: [
      { q: 'How do I see who\'s working on what?', a: 'Visit the Team Directory page to see all members, their roles, and how many open tasks they have. The Analytics page shows productivity by member.' },
      { q: 'Can I track all my tasks in one place?', a: 'Yes! The My Tasks page shows every card assigned to you across all workspaces, grouped by status or due date.' },
    ],
  },
  {
    icon: Settings,
    title: 'Settings & Account',
    color: 'text-slate-600 bg-slate-100',
    articles: [
      { q: 'How do I change my name?', a: 'Go to Settings → Profile, update your full name, and click "Save Changes."' },
      { q: 'How do I reset my password?', a: 'On the login page, click "Forgot password" and enter your email. You\'ll receive a reset link. You can also reset from Settings → Account.' },
    ],
  },
  {
    icon: Shield,
    title: 'Security & Privacy',
    color: 'text-red-600 bg-red-50',
    articles: [
      { q: 'Who can see my workspace data?', a: 'Only workspace members can access your boards and cards. Row-Level Security ensures users cannot see workspaces they don\'t belong to.' },
      { q: 'What happens when I delete a workspace?', a: 'Deleting a workspace removes all its boards, lists, and cards permanently. This action cannot be undone.' },
    ],
  },
];

export default function Help() {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const filteredSections = SECTIONS.map((section) => ({
    ...section,
    articles: section.articles.filter(
      (a) => !search || a.q.toLowerCase().includes(search.toLowerCase()) || a.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.articles.length > 0);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto animate-fade-in">
      <PageHeader icon={HelpCircle} title="Help Center" description="Documentation on how to use Kanban features and manage your workspace." />

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the help center..."
          className="w-full flex h-11 rounded-lg border border-input bg-card pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-6">
        {filteredSections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', section.color)}>
                <section.icon className="w-4 h-4" />
              </div>
              <h2 className="font-semibold">{section.title}</h2>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {section.articles.map((article, i) => {
                const key = `${section.title}-${i}`;
                const isOpen = open === key;
                return (
                  <div key={key} className={cn(i !== 0 && 'border-t border-border')}>
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                    >
                      <span className="font-medium text-sm">{article.q}</span>
                      <ChevronDown className={cn('w-4 h-4 text-muted-foreground shrink-0 transition-transform', isOpen && 'rotate-180')} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                        {article.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredSections.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No articles match your search.</p>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">Still need help?</p>
          <p className="text-sm text-muted-foreground mt-1">Check the Templates page for ready-to-use board structures, or explore the Analytics page for insights into your team\'s productivity.</p>
        </div>
      </div>
    </div>
  );
}