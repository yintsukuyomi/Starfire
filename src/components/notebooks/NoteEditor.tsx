import { useState, useEffect, useCallback } from 'react';
import { Note, Tag, NoteVersion } from '../../types/notebooks';
import { TiptapEditor } from '../editor/TiptapEditor';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { History, X, Plus, Tag as TagIcon, ArrowLeft } from 'lucide-react';
import { VersionHistory } from './VersionHistory';
import { useNotebookStore } from '../../hooks/useNotebookStore';

interface NoteEditorProps {
  note: Note | null;
  allTags: Tag[];
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
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isTagInputVisible, setIsTagInputVisible] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  
  // Get version history from the store
  const { getNoteVersions, restoreVersion } = useNotebookStore();
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  
  // Load versions when the note changes
  useEffect(() => {
    if (note) {
      const noteVersions = getNoteVersions(note.id);
      setVersions(noteVersions);
    }
  }, [note, getNoteVersions]);

  // Handle restoring a version
  const handleRestoreVersion = (version: NoteVersion) => {
    if (!note) return;
    
    const updates = {
      title: version.title,
      content: version.content,
      tags: [...version.tags],
      folderId: version.folderId ?? null,
      isArchived: version.isArchived,
      isPinned: version.isPinned,
    };
    
    onSave(updates);
    setShowVersionHistory(false);
  };

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTagIds([...note.tags]);
    } else {
      setTitle('');
      setContent('');
      setSelectedTagIds([]);
    }
  }, [note]);

  const handleSave = () => {
    if (!note) return;
    
    onSave({
      title: title || 'Untitled Note',
      content,
      tags: selectedTagIds,
      folderId: note.folderId,
      isArchived: note.isArchived,
      isPinned: note.isPinned,
    });
  };

  const handleCreateNewTag = useCallback(() => {
    const tagName = tagInput.trim();
    if (!tagName) return;
    
    const existingTag = allTags.find(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    );
    
    if (existingTag) {
      if (!selectedTagIds.includes(existingTag.id)) {
        setSelectedTagIds(prev => [...prev, existingTag.id]);
      }
    } else {
      const now = new Date().toISOString();
      const newTag: Tag = {
        id: `tag-${Date.now()}`,
        name: tagName,
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
        createdAt: now,
        updatedAt: now,
      };
      setSelectedTagIds(prev => [...prev, newTag.id]);
    }
    
    setTagInput('');
    setIsTagInputVisible(false);
  }, [tagInput, allTags, selectedTagIds]);

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
  };

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a note to edit or create a new one</p>
      </div>
    );
  }
  
  // Show version history if enabled
  if (showVersionHistory) {
    return (
      <VersionHistory
        versions={versions}
        currentVersion={note.version}
        onRestore={handleRestoreVersion}
        onClose={() => setShowVersionHistory(false)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Mobile-optimized header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        {/* Title and actions */}
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVersionHistory(true)}
                className="h-8 w-8"
                title="Version history"
              >
                <History className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">v{note.version}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSave}
                className="h-8"
              >
                Save
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(note.id)}
                className="h-8 w-8 text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Title input - mobile optimized */}
          <Input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent text-base"
            style={{ fontSize: '16px' }} // Prevent iOS zoom
          />
          
          {/* Tags - mobile optimized */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedTagIds.map((tagId) => {
              const tag = allTags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge
                  key={tagId}
                  className="flex items-center gap-1 text-xs"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tagId);
                    }}
                  />
                </Badge>
              );
            })}
            
            {isTagInputVisible ? (
              <div className="flex items-center gap-1">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateNewTag()}
                  placeholder="Tag name"
                  className="h-7 w-24 text-xs"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
                <Button 
                  type="button" 
                  size="xs"
                  onClick={handleCreateNewTag}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setTagInput('');
                    setIsTagInputVisible(false);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="h-7"
                onClick={() => setIsTagInputVisible(true)}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                Tag
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Editor - Mobile optimized */}
      <div className="flex-1 overflow-hidden">
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note here..."
          className="h-full border-0"
        />
      </div>
      
      {/* Footer - Mobile optimized */}
      <div className="border-t p-2 text-xs text-muted-foreground text-center bg-background/95 backdrop-blur safe-bottom">
        Last updated: {new Date(note.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
