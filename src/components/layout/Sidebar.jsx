import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useWorkspace } from '@/lib/WorkspaceContext';
import WorkspaceSelector from './WorkspaceSelector';
import UserMenu from './UserMenu';
import {
  LayoutDashboard, Columns3, Users, User, Settings, ListTodo, Activity, BarChart3,
  Bell, LayoutTemplate, Calendar, Files, Archive, Plug, HelpCircle, CreditCard,
  Search, Keyboard, MessageSquare, Download, Activity as ActivityIcon, Settings2,
  HardDrive, Shield, UserPlus, Tag, Folder, Key, Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function Logo() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-4 hover:opacity-80 transition-opacity">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
          <rect x="3" y="3" width="8" height="8" rx="2" opacity="0.95" />
          <rect x="13" y="3" width="8" height="8" rx="2" opacity="0.65" />
          <rect x="3" y="13" width="8" height="8" rx="2" opacity="0.65" />
          <rect x="13" y="13" width="8" height="8" rx="2" opacity="0.95" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-sm leading-none text-foreground">RTC Workspace</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Collaborative</p>
      </div>
    </Link>
  );
}

function NavItems({ onNavigate }) {
  const { selectedWorkspaceId } = useWorkspace();
  const location = useLocation();

  const sections = [
    {
      title: 'Navigation',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
        { label: 'My Tasks', icon: ListTodo, to: '/my-tasks' },
        { label: 'Calendar', icon: Calendar, to: '/calendar' },
      ],
    },
    {
      title: 'Workspace',
      items: [
        {
          label: 'Boards',
          icon: Columns3,
          to: selectedWorkspaceId ? `/workspaces/${selectedWorkspaceId}?tab=boards` : null,
        },
        {
          label: 'Members',
          icon: Users,
          to: selectedWorkspaceId ? `/workspaces/${selectedWorkspaceId}?tab=members` : null,
        },
        { label: 'Team Directory', icon: Users, to: '/team' },
        { label: 'Invite Members', icon: UserPlus, to: '/invite-members' },
        { label: 'Workspace Labels', icon: Tag, to: '/workspace-labels' },
        { label: 'Analytics', icon: BarChart3, to: '/analytics' },
        { label: 'Activity Feed', icon: Activity, to: '/activity-feed' },
      ],
    },
    {
      title: 'Tools',
      items: [
        { label: 'Templates', icon: LayoutTemplate, to: '/templates' },
        { label: 'Global Search', icon: Search, to: '/search' },
        { label: 'Shared Files', icon: Files, to: '/files' },
        { label: 'Data Export', icon: Download, to: '/export' },
        { label: 'Board Folders', icon: Folder, to: '/board-folders' },
        { label: 'Saved Filters', icon: Filter, to: '/saved-filters' },
        { label: 'Task Archive', icon: Archive, to: '/archive' },
        { label: 'Integrations', icon: Plug, to: '/integrations' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Notifications', icon: Bell, to: '/notifications' },
        { label: 'Notif. Preferences', icon: Settings2, to: '/notifications-settings' },
        { label: 'Feedback', icon: MessageSquare, to: '/feedback' },
        { label: 'Billing', icon: CreditCard, to: '/billing' },
        { label: 'System Status', icon: ActivityIcon, to: '/status' },
        { label: 'Shortcuts', icon: Keyboard, to: '/shortcuts' },
        { label: 'Profile', icon: User, to: '/profile' },
        { label: 'Security', icon: Shield, to: '/security' },
        { label: 'API Keys', icon: Key, to: '/api-keys' },
        { label: 'Usage Limits', icon: HardDrive, to: '/usage-limits' },
        { label: 'Help Center', icon: HelpCircle, to: '/help-center' },
        { label: 'Settings', icon: Settings, to: '/settings' },
      ],
    },
  ];

  const isActive = (to) => {
    if (!to) return false;
    const path = to.split('?')[0];
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path === '/settings' && location.pathname === '/settings') return true;
    if (path.startsWith('/workspaces/') && location.pathname.startsWith('/workspaces/')) {
      const tab = new URLSearchParams(location.search).get('tab');
      const itemTab = to.includes('tab=boards') ? 'boards' : to.includes('tab=members') ? 'members' : null;
      if (itemTab) return tab === itemTab;
    }
    return location.pathname === path;
  };

  return (
    <nav className="px-3 space-y-4">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {section.title}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const active = isActive(item.to);
              const disabled = !item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to || '#'}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
                    disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground'
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({ onNavigate }) {
  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <Logo />
      <div className="px-3 pb-3">
        <WorkspaceSelector />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <NavItems onNavigate={onNavigate} />
      </div>
      <UserMenu />
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside className="hidden md:flex w-64 shrink-0">
        <SidebarContent />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent onNavigate={onClose} />
        </SheetContent>
      </Sheet>
    </>
  );
}