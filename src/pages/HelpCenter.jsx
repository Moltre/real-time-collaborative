import React, { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { HelpCircle, BookOpen, Lightbulb, Search } from 'lucide-react';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const SECTIONS = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    color: 'text-indigo-600 bg-indigo-50',
    items: [
      { q: 'How do I create my first board?', a: 'Open a workspace, click "New Board", give it a name, and start adding lists. Lists represent stages; cards represent tasks that move between them.' },
      { q: 'What is a workspace?', a: 'A workspace groups related boards and members. You can be a member of multiple workspaces, and each keeps its own boards, members, and activity.' },
      { q: 'How do I invite teammates?', a: 'Open the workspace, go to the Members tab, and click "Invite". Enter their email and choose a role. They will receive an invitation to join.' },
    ],
  },
  {
    icon: BookOpen,
    title: 'Managing Cards',
    color: 'text-emerald-600 bg-emerald-50',
    items: [
      { q: 'How do I assign a card to someone?', a: 'Open the card, click the assignee field, and pick a workspace member. You can also add multiple members to a card.' },
      { q: 'Can I set due dates and priorities?', a: 'Yes. Each card supports a due date and a priority (Low, Medium, High, Urgent). These show up on the Calendar and My Tasks pages.' },
      { q: 'How does drag-and-drop work?', a: 'Grab a card and drag it between lists or reorder it within a list. Changes save automatically and sync to everyone on the board.' },
      { q: 'What happens when I archive a card?', a: 'Archived cards are removed from the board but kept in the Task Archive. You can restore them any time from the Archive page.' },
    ],
  },
  {
    icon: BookOpen,
    title: 'Workspace & Team',
    color: 'text-amber-600 bg-amber-50',
    items: [
      { q: 'What are the member roles?', a: 'Owner has full control, Admin can manage members and settings, Member can create and edit cards, Viewer can only read boards.' },
      { q: 'How do I change a member role?', a: 'Go to the workspace Members tab, open a member row, and select a new role. Only Owners and Admins can change roles.' },
      { q: 'Can I see who did what?', a: 'The Activity Feed records every change — cards created, moved, completed, members added, and more — with timestamps and the member who did it.' },
    ],
  },
];

const FAQS = [
  { q: 'Can I export my data?', a: 'Yes. The Data Export page lets you download your workspace and board data as JSON or CSV for external analysis or backup.' },
  { q: 'Are there templates I can use?', a: 'The Templates page has built-in templates for common workflows. You can also save any of your boards as a custom template to reuse later.' },
  { q: 'How do notifications work?', a: 'You get in-app alerts for assignments, mentions, and due dates. Visit Notification Preferences to choose which events also send you an email.' },
  { q: 'Is my data secure?', a: 'Each workspace isolates its data, and members only see boards they belong to. Check the Security page to review your recent login sessions.' },
];

const TIPS = [
  'Press B to jump to boards, T for My Tasks, and / to open Global Search.',
  'Use labels to color-code cards by theme — they carry over when you save a board as a template.',
  'Archive finished cards instead of deleting them so you can always restore them later.',
  'Set due dates on cards to make the Calendar View and My Tasks page more useful.',
  'Save your best board as a template so new projects start with the right structure.',
];

export default function HelpCenter() {
  const [search, setSearch] = useState('');

  const filtered = SECTIONS.map((s) => ({
    ...s,
    items: s.items.filter(
      (it) =>
        it.q.toLowerCase().includes(search.toLowerCase()) ||
        it.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader icon={HelpCircle} title="Help Center" description="Documentation, FAQs, and tips for managing your workspaces and tasks." />

      {/* Search */}
      <div className="relative mt-6 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search the help center..."
          className="w-full flex h-10 rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <h3 className="font-semibold text-sm">Quick Tips</h3>
        </div>
        <ul className="space-y-2">
          {TIPS.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-amber-600 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Documentation sections */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No results for "{search}".</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', section.color)}>
                  <section.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold">{section.title}</h3>
              </div>
              <div className="rounded-xl border border-border bg-card px-5">
                <Accordion type="single" collapsible>
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} value={`${section.title}-${i}`}>
                      <AccordionTrigger>{item.q}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* General FAQ */}
      {!search && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold">Frequently Asked Questions</h3>
          </div>
          <div className="rounded-xl border border-border bg-card px-5">
            <Accordion type="single" collapsible>
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      )}
    </div>
  );
}