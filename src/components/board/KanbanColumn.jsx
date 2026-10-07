import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MoreHorizontal, Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import KanbanCard from './KanbanCard';
import { cn } from '@/lib/utils';

export default function KanbanColumn({
  list,
  cards,
  members,
  onCardClick,
  onAddCard,
  onRenameList,
  onDeleteList,
  isViewer,
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);

  const handleRenameSubmit = () => {
    if (editName.trim() && editName !== list.name) {
      onRenameList(list.id, editName.trim());
    }
    setEditing(false);
  };

  return (
    <Draggable draggableId={list.id} index={list.index} isDragDisabled={isViewer}>
      {(dragProvided, dragSnapshot) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          className={cn(
            'w-72 shrink-0 rounded-xl border border-border bg-muted/40 flex flex-col max-h-[calc(100vh-12rem)]',
            dragSnapshot.isDragging && 'shadow-xl rotate-1'
          )}
        >
          {/* Column header */}
          <div
            {...dragProvided.dragHandleProps}
            className="flex items-center justify-between px-3 py-2.5 border-b border-border cursor-grab active:cursor-grabbing"
          >
            {editing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                autoFocus
                className="h-7 text-sm font-semibold"
              />
            ) : (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                <span
                  className="text-sm font-semibold text-foreground truncate"
                  onDoubleClick={() => {
                    setEditName(list.name);
                    setEditing(true);
                  }}
                >
                  {list.name}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                  {cards.length}
                </span>
              </div>
            )}
            {!editing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditName(list.name);
                      setEditing(true);
                    }}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onAddCard(list.id)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Card
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteList(list.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Cards */}
          <Droppable droppableId={list.id} type="card" direction="vertical">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  'flex-1 overflow-y-auto scrollbar-thin p-2 space-y-2 min-h-[40px] transition-colors',
                  snapshot.isDraggingOver && 'bg-primary/5'
                )}
              >
                {cards.map((card, index) => (
                  <Draggable
                    key={card.id}
                    draggableId={card.id}
                    index={index}
                    isDragDisabled={isViewer}
                  >
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        onClick={() => onCardClick(card)}
                      >
                        <KanbanCard
                          card={card}
                          members={members}
                          isDragging={dragSnapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add card button */}
          <div className="p-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => onAddCard(list.id)}
              disabled={isViewer}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Card
            </Button>
          </div>
        </div>
      )}
    </Draggable>
  );
}