import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { ChevronsUpDown, Plus, Check, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function WorkspaceSelector() {
  const { workspaces, selectedWorkspace, selectWorkspace, loading } = useWorkspace();
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2.5 p-2 rounded-lg border border-sidebar-border hover:bg-sidebar-accent transition-colors text-left">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: selectedWorkspace?.color || '#6366f1' }}
          >
            {selectedWorkspace?.name?.[0]?.toUpperCase() || <Building2 className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground leading-none">Workspace</p>
            <p className="text-sm font-medium truncate mt-0.5">
              {loading ? 'Loading...' : selectedWorkspace?.name || 'Select workspace'}
            </p>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel>Your workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.length === 0 && (
          <p className="px-2 py-3 text-sm text-muted-foreground">No workspaces yet</p>
        )}
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => {
              selectWorkspace(ws.id);
              navigate(`/workspaces/${ws.id}?tab=boards`);
            }}
            className="gap-2"
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: ws.color }}
            >
              {ws.name[0]?.toUpperCase()}
            </div>
            <span className="flex-1 truncate">{ws.name}</span>
            {ws.id === selectedWorkspace?.id && <Check className="w-4 h-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/workspaces')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}