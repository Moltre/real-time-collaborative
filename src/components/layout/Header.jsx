import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useWorkspace } from '@/lib/WorkspaceContext';

function getPageTitle(pathname) {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname === '/workspaces') return 'Workspaces';
  if (pathname.startsWith('/workspaces/')) return 'Workspace';
  if (pathname.startsWith('/boards/')) return 'Board';
  if (pathname === '/settings') return 'Settings';
  return 'RTC Workspace';
}

export default function Header({ onMenuClick }) {
  const location = useLocation();
  const { selectedWorkspace } = useWorkspace();
  const title = getPageTitle(location.pathname);

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-sm flex items-center gap-3 px-4 md:px-6 shrink-0 z-10">
      <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onMenuClick}>
        <Menu className="w-5 h-5" />
      </Button>

      <div className="hidden md:block">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <h1 className="md:hidden font-semibold text-base">{title}</h1>

      <div className="flex-1" />

      <div className="relative hidden lg:block w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          readOnly
        />
      </div>

      <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
      </Button>
    </header>
  );
}