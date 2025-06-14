import { useState, useEffect } from 'react';
import { Note } from '@/types/notebooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onSearch: (query: string) => void;
}

export function NoteList({
  notes,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onSearch,
}: NoteListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);
  
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const truncate = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };
  
  return (
    <div className="flex flex-col h-full border-r w-80">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Notes</h2>
          <Button size="sm" onClick={onCreateNote}>
            New Note
          </Button>
        </div>
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {notes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notes found
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  'p-4 cursor-pointer hover:bg-accent/50 transition-colors',
                  selectedNoteId === note.id && 'bg-accent'
                )}
                onClick={() => onSelectNote(note.id)}
              >
                <h3 className="font-medium line-clamp-1">{note.title || 'Untitled Note'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {truncate(note.content.replace(/<[^>]*>/g, ''), 100)}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(note.updatedAt)}
                  </span>
                  {note.tags.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {note.tags.length} tags
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
