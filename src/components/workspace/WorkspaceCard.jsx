import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Columns3, ArrowRight } from 'lucide-react';

export default function WorkspaceCard({ workspace, memberCount = 0, boardCount = 0, onOpen }) {
  return (
    <div className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
          style={{ backgroundColor: workspace.color || '#6366f1' }}
        >
          {workspace.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{workspace.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Owner: {workspace.owner_name || 'You'}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
        {workspace.description || 'No description provided.'}
      </p>
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </span>
        <span className="flex items-center gap-1.5">
          <Columns3 className="w-3.5 h-3.5" />
          {boardCount} {boardCount === 1 ? 'board' : 'boards'}
        </span>
      </div>
      <Button
        asChild
        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
        variant="outline"
      >
        <Link to={`/workspaces/${workspace.id}?tab=boards`}>
          Open Workspace
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </Button>
    </div>
  );
}