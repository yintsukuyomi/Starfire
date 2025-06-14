import { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Star, Archive, Trash2, Clock, MoreHorizontal } from 'lucide-react';
import { TiptapEditor } from '../editor/TiptapEditor';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Note, Tag as TagType } from '../../types/notebooks';

interface NoteEditorProps {
  note: Note | null;
  allTags: TagType[];
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function NoteEditor({
  note,
  allTags,
  onSave,
  onDelete,
  onBack,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags || []);
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isArchived, setIsArchived] = useState(note?.isArchived || false);
  const [showTagMenu, setShowTagMenu] = useState(false);

  // Update state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags);
      setIsPinned(note.isPinned);
      setIsArchived(note.isArchived);
    }
  }, [note]);

  const handleSave = () => {
    if (!note) return;
    
    onSave({
      title,
      content,
      tags: selectedTags,
      folderId: note.folderId,
      isArchived,
      isPinned,
    });
  };

  const handleDelete = () => {
    if (!note) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  if (!note) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b safe-top">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Note"
                className="text-xl font-semibold bg-transparent border-none outline-none w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPinned(!isPinned)}
                className={cn(
                  "h-8 w-8",
                  isPinned && "text-yellow-500"
                )}
              >
                <Star className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsArchived(!isArchived)}
                className={cn(
                  "h-8 w-8",
                  isArchived && "text-muted-foreground"
                )}
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-8 w-8 text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTagMenu(!showTagMenu)}
              className="h-8"
            >
              <Tag className="h-4 w-4 mr-2" />
              Tags
            </Button>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagId) => {
                const tag = allTags.find(t => t.id === tagId);
                return tag ? (
                  <Badge
                    key={tagId}
                    variant="outline"
                    className="cursor-pointer"
                    style={{ backgroundColor: tag.color }}
                    onClick={() => handleRemoveTag(tagId)}
                  >
                    {tag.name}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          {/* Tag menu */}
          {showTagMenu && (
            <div className="absolute right-4 mt-2 p-2 bg-card border rounded-lg shadow-lg z-20">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{ backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined }}
                    onClick={() => handleTagSelect(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing..."
          className="h-full"
        />
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t safe-bottom">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last edited {new Date(note.updatedAt).toLocaleString()}</span>
          </div>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
}
