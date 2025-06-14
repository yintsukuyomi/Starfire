import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note, Tag, NoteVersion } from '@/types/notebooks';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { History, X, Plus, Tag as TagIcon } from 'lucide-react';
import { VersionHistory } from './VersionHistory';
import { useNotebookStore } from '@/hooks/useNotebookStore';

// Move generateChangeSummary here since it's not in a separate file
const generateChangeSummary = (oldNote: Partial<Note>, newNote: Partial<Note>): string => {
  const changes: string[] = [];
  
  if (oldNote.title !== newNote.title) {
    changes.push('title updated');
  }
  
  if (oldNote.content !== newNote.content) {
    changes.push('content modified');
  }
  
  if (JSON.stringify(oldNote.tags) !== JSON.stringify(newNote.tags)) {
    changes.push('tags updated');
  }
  
  if (oldNote.folderId !== newNote.folderId) {
    changes.push('folder changed');
  }
  
  if (oldNote.isPinned !== newNote.isPinned) {
    changes.push(newNote.isPinned ? 'pinned' : 'unpinned');
  }
  
  if (oldNote.isArchived !== newNote.isArchived) {
    changes.push(newNote.isArchived ? 'archived' : 'unarchived');
  }
  
  return changes.length > 0 ? changes.join(', ') : 'no changes detected';
};

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
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
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
    
    // Update the note with the restored version
    const updates = {
      title: version.title,
      content: version.content,
      tags: [...version.tags],
      folderId: version.folderId ?? null, // Ensure folderId is either string or null
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

  // Update available tags when allTags or selectedTagIds change
  useEffect(() => {
    setAvailableTags(
      allTags.filter((tag) => !selectedTagIds.includes(tag.id))
    );
  }, [allTags, selectedTagIds]);

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

  const handleAddTag = () => {
    if (tagInput.trim()) {
      const tagName = tagInput.trim();
      const existingTag = availableTags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
      
      if (existingTag) {
        if (!selectedTagIds.includes(existingTag.id)) {
          setSelectedTagIds([...selectedTagIds, existingTag.id]);
        }
      } else {
        const newTag = { id: `tag-${Date.now()}`, name: tagName, color: 'gray' };
        setAvailableTags([...availableTags, newTag]);
        setSelectedTagIds([...selectedTagIds, newTag.id]);
      }
      
      setTagInput('');
      setIsTagInputVisible(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
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
      // In a real app, you would save the new tag to your database
      // and then add it to the selected tags
      setAvailableTags(prev => [...prev, newTag]);
      setSelectedTagIds(prev => [...prev, newTag.id]);
    }
    
    setTagInput('');
    setIsTagInputVisible(false);
  }, [tagInput, allTags, selectedTagIds, setSelectedTagIds, setAvailableTags]);

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
      <div className="border-b p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
            ← Back
          </Button>
          <h1 className="text-xl font-semibold">Notebooks</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVersionHistory(true)}
            className="ml-2 text-muted-foreground hover:text-foreground"
            title="View version history"
          >
            <History className="h-4 w-4 mr-1" />
            <span className="text-xs">v{note.version}</span>
          </Button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => note && onDelete(note.id)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 px-0"
          />
          
          <div className="flex flex-wrap items-center gap-2">
            {selectedTagIds.map((tagId) => {
              const tag = allTags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge
                  key={tagId}
                  className="flex items-center gap-1"
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
                  className="h-8 w-32"
                  autoFocus
                />
                <Button 
                  type="button" 
                  size="sm"
                  onClick={handleCreateNewTag}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTagInput('');
                    setIsTagInputVisible(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={() => setIsTagInputVisible(true)}
              >
                <TagIcon className="h-3.5 w-3.5" />
                Add Tag
              </Button>
            )}
          </div>
          
          <div className="mt-4 flex-1 overflow-auto">
            <TiptapEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing your note here..."
              className="h-full"
            />
          </div>
          
          <div className="border-t p-2 text-xs text-muted-foreground text-right">
            Last updated: {new Date(note.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="Start writing your note here..."
          className="h-full"
        />
      </div>
      
      <div className="border-t p-2 text-xs text-muted-foreground text-right">
        Last updated: {new Date(note.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
