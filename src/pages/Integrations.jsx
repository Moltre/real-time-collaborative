import React, { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Plug, Slack, Calendar, Github, Mail, MessageSquare, Figma,
  Cloud, BookOpen, Bug, Zap, Check, ExternalLink, Search, HardDrive, Boxes,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INTEGRATIONS = [
  { name: 'Slack', icon: Slack, color: '#611f69', category: 'Communication', description: 'Get instant notifications and updates in your Slack channels.', connected: false },
  { name: 'Google Calendar', icon: Calendar, color: '#4285f4', category: 'Productivity', description: 'Sync card due dates with your Google Calendar.', connected: false },
  { name: 'GitHub', icon: Github, color: '#181717', category: 'Development', description: 'Link commits, PRs, and issues to your cards automatically.', connected: true },
  { name: 'Gmail', icon: Mail, color: '#ea4335', category: 'Communication', description: 'Turn emails into cards and send updates from your board.', connected: false },
  { name: 'Discord', icon: MessageSquare, color: '#5865f2', category: 'Communication', description: 'Receive workspace activity alerts in your Discord server.', connected: false },
  { name: 'Figma', icon: Figma, color: '#f24e1e', category: 'Design', description: 'Embed Figma designs directly into your card descriptions.', connected: false },
  { name: 'Trello', icon: Boxes, color: '#0079bf', category: 'Productivity', description: 'Import boards and cards from Trello into your workspace.', connected: false },
  { name: 'Google Drive', icon: Cloud, color: '#0f9d58', category: 'Storage', description: 'Attach Drive files to cards and sync attachments.', connected: true },
  { name: 'Notion', icon: BookOpen, color: '#000000', category: 'Productivity', description: 'Connect Notion pages and databases to your boards.', connected: false },
  { name: 'Jira', icon: Bug, color: '#0052cc', category: 'Development', description: 'Sync issues and sprints between Jira and your Kanban boards.', connected: false },
  { name: 'Zapier', icon: Zap, color: '#ff4a00', category: 'Automation', description: 'Automate workflows with 5,000+ apps through Zapier triggers.', connected: false },
  { name: 'Microsoft Teams', icon: MessageSquare, color: '#5059c9', category: 'Communication', description: 'Get board updates and manage cards from Teams channels.', connected: false },
];

const CATEGORIES = ['All', 'Communication', 'Productivity', 'Development', 'Design', 'Storage', 'Automation'];

export default function Integrations() {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = integrations.filter((i) => {
    if (category !== 'All' && i.category !== category) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggle = (name) => {
    const int = integrations.find((i) => i.name === name);
    setIntegrations((prev) => prev.map((i) => i.name === name ? { ...i, connected: !i.connected } : i));
    toast({
      title: int.connected ? 'Integration disconnected' : 'Integration connected',
      description: int.connected ? `${name} has been disconnected.` : `${name} is now connected to your workspace.`,
    });
  };

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader icon={Plug} title="Integration Hub" description="Connect external services to your workspace for enhanced productivity.">
        <span className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">{connectedCount} connected</span>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations..."
            className="w-full flex h-10 rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn('px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors', category === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((int) => (
          <div key={int.name} className="rounded-xl border border-border bg-card p-5 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${int.color}15` }}
              >
                <int.icon className="w-5 h-5" style={{ color: int.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{int.name}</h3>
                <span className="text-xs text-muted-foreground">{int.category}</span>
              </div>
              {int.connected && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4 flex-1">{int.description}</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={int.connected ? 'outline' : 'default'}
                className="flex-1"
                onClick={() => toggle(int.name)}
              >
                {int.connected ? 'Disconnect' : 'Connect'}
              </Button>
              <Button size="sm" variant="ghost">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Plug className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No integrations found.</p>
        </div>
      )}
    </div>
  );
}