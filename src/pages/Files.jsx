import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { Files as FilesIcon, Download, FileText, Image, FileSpreadsheet, FileCode, Search } from 'lucide-react';
import moment from 'moment';
import { cn } from '@/lib/utils';

function fileIcon(type) {
  if (!type) return FileText;
  if (type.startsWith('image')) return Image;
  if (type.includes('sheet') || type.includes('csv')) return FileSpreadsheet;
  if (type.includes('code') || type.includes('json')) return FileCode;
  return FileText;
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.SharedFile.list('-created_date', 200);
        setFiles(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const types = ['all', ...new Set(files.map((f) => f.file_type).filter(Boolean))];
  let filtered = files;
  if (typeFilter !== 'all') filtered = filtered.filter((f) => f.file_type === typeFilter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((f) => f.name?.toLowerCase().includes(q) || f.card_title?.toLowerCase().includes(q) || f.board_name?.toLowerCase().includes(q));
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animate-fade-in">
      <PageHeader icon={FilesIcon} title="Shared Files" description="All documents and attachments uploaded to cards across your workspace." />

      {files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card">
          <EmptyState icon={FilesIcon} title="No files shared yet" description="Files attached to cards will appear here for easy retrieval." />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full flex h-10 rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {types.map((t) => <option key={t} value={t}>{t === 'all' ? 'All Types' : t}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No files match your search" />
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {filtered.map((file, i) => {
                const Icon = fileIcon(file.file_type);
                return (
                  <div key={file.id} className={cn('flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors', i !== 0 && 'border-t border-border')}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {file.card_title && <span className="truncate">{file.card_title}</span>}
                        {file.board_name && <span>· {file.board_name}</span>}
                        {file.uploaded_by_name && <span>· by {file.uploaded_by_name}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">{formatSize(file.size)}</span>
                    <span className="text-xs text-muted-foreground hidden md:block">{moment(file.created_date).format('MMM D')}</span>
                    {file.file_url && (
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}