import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotebookStore } from '../hooks/useNotebookStore';
import { Note, Folder, Tag } from '../types/notebooks';
import { NoteList } from '../components/notebooks/NoteList';
import { NoteEditor } from '../components/notebooks/NoteEditor';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Plus, FolderPlus, Search, Menu, X, Filter } from 'lucide-react';
import { cn } from '../lib/utils';

type ViewMode = 'folders' | 'notes' | 'editor';

export function Notebooks() {
  const [viewMode, setViewMode] = useState<ViewMode>('folders');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get state and actions from our store
  const {
    notes,
    folders,
    tags,
    selectedNoteId,
    selectedFolderId,
    setSelectedNoteId,
    setSelectedFolderId,
    setSearchQuery: setStoreSearchQuery,
    addNote,
    updateNote,
    deleteNote,
    addFolder,
  } = useNotebookStore();
  
  // Filter notes based on search query and selected folder
  const displayedNotes = useMemo(() => {
    if (searchQuery) {
      return notes.filter(
        (note: Note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } else if (selectedFolderId) {
      return notes.filter((note: Note) => note.folderId === selectedFolderId);
    } else {
      return notes.filter((note: Note) => !note.folderId);
    }
  }, [notes, searchQuery, selectedFolderId]);
  
  const selectedNote = useMemo(() => 
    notes.find((note) => note.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );
  
  // Auto navigation logic for mobile
  useEffect(() => {
    if (selectedNoteId && viewMode !== 'editor') {
      setViewMode('editor');
    }
  }, [selectedNoteId, viewMode]);
  
  // Handle creating a new note
  const handleCreateNewNote = useCallback(() => {
    const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      title: '',
      content: '',
      tags: [],
      folderId: selectedFolderId || null,
      isArchived: false,
      isPinned: false,
    };
    
    const createdNoteId = addNote(newNote);
    setSelectedNoteId(createdNoteId);
    setViewMode('editor');
  }, [addNote, selectedFolderId, setSelectedNoteId]);
  
  // Handle saving a note
  const handleSaveNote = useCallback((updates: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    if (!selectedNoteId) return;
    updateNote(selectedNoteId, updates);
  }, [selectedNoteId, updateNote]);
  
  // Handle deleting a note
  const handleDeleteNote = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(id);
      if (selectedNoteId === id) {
        setSelectedNoteId(null);
        setViewMode('notes');
      }
    }
  }, [deleteNote, selectedNoteId, setSelectedNoteId]);
  
  // Handle creating a new folder
  const handleCreateNewFolder = useCallback(() => {
    const name = window.prompt('Enter folder name:');
    if (name) {
      addFolder({
        name,
        parentId: null,
      });
    }
  }, [addFolder]);
  
  // Handle folder selection
  const handleFolderSelect = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
    setViewMode('notes');
    setSelectedNoteId(null);
  }, [setSelectedFolderId, setSelectedNoteId]);
  
  // Handle note selection
  const handleNoteSelect = useCallback((noteId: string) => {
    setSelectedNoteId(noteId);
    setViewMode('editor');
  }, [setSelectedNoteId]);
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    if (viewMode === 'editor') {
      setSelectedNoteId(null);
      setViewMode('notes');
    } else if (viewMode === 'notes') {
      setViewMode('folders');
    }
  }, [viewMode, setSelectedNoteId]);
  
  // Update search query in store when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setStoreSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, setStoreSearchQuery]);

  // Mobile header component
  const MobileHeader = () => (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b safe-top">
      <div className="flex items-center justify-between p-3 min-h-[56px]">
        <div className="flex items-center space-x-2 flex-1">
          {(viewMode === 'notes' || viewMode === 'editor') && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold truncate">
            {viewMode === 'folders' ? 'Notebooks' : 
             viewMode === 'notes' ? (selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name || 'Notes' : 'All Notes') :
             selectedNote?.title || 'Edit Note'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-1">
          {viewMode === 'folders' && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowFilters(!showFilters)}
                className={cn("h-10 w-10", showFilters && "bg-accent")}
              >
                <Filter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCreateNewFolder} className="h-10 w-10">
                <FolderPlus className="h-5 w-5" />
              </Button>
            </>
          )}
          {(viewMode === 'folders' || viewMode === 'notes') && (
            <Button size="sm" onClick={handleCreateNewNote} className="h-10">
              <Plus className="h-4 w-4 mr-1" />
              Note
            </Button>
          )}
        </div>
      </div>
      
      {/* Search bar - show on folders and notes view */}
      {(viewMode === 'folders' || viewMode === 'notes') && (
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground transform -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-10 h-10 text-base bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              inputMode="search"
            />
          </div>
        </div>
      )}
    </div>
  );

  // Folders view (mobile-first)
  const FoldersView = () => (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* All Notes */}
          <button
            className={cn(
              'w-full text-left p-4 rounded-lg flex items-center justify-between touch-manipulation transition-colors',
              !selectedFolderId ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'
            )}
            onClick={() => handleFolderSelect(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                📝
              </div>
              <span className="font-medium">All Notes</span>
            </div>
            <span className="text-sm opacity-70">
              {notes.filter((n: Note) => !n.folderId).length}
            </span>
          </button>
          
          {/* Folders */}
          {folders.map((folder: Folder) => (
            <button
              key={folder.id}
              className={cn(
                'w-full text-left p-4 rounded-lg flex items-center justify-between touch-manipulation transition-colors',
                selectedFolderId === folder.id ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-accent'
              )}
              onClick={() => handleFolderSelect(folder.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  📁
                </div>
                <span className="font-medium">{folder.name}</span>
              </div>
              <span className="text-sm opacity-70">
                {notes.filter((n: Note) => n.folderId === folder.id).length}
              </span>
            </button>
          ))}
          
          {/* Tags */}
          {tags.length > 0 && (
            <>
              <div className="pt-6 pb-2">
                <h3 className="text-sm font-medium text-muted-foreground px-2">TAGS</h3>
              </div>
              {tags.map((tag: Tag) => (
                <div
                  key={tag.id}
                  className="flex items-center p-3 rounded-lg bg-card hover:bg-accent cursor-pointer touch-manipulation transition-colors"
                >
                  <span
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-medium flex-1">{tag.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {notes.filter((n: Note) => n.tags.includes(tag.id)).length}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Notes view (mobile-optimized)
  const NotesView = () => (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {displayedNotes.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">No notes found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Create your first note to get started'}
              </p>
              <Button onClick={handleCreateNewNote}>
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            </div>
          ) : (
            displayedNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 cursor-pointer hover:bg-accent/50 touch-manipulation transition-colors active:bg-accent"
                onClick={() => handleNoteSelect(note.id)}
              >
                <h3 className="font-medium line-clamp-1 mb-1">{note.title || 'Untitled Note'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  {note.tags.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {note.tags.length} tag{note.tags.length !== 1 ? 's' : ''}
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

  // Editor view
  const EditorView = () => (
    <div className="flex-1 flex flex-col">
      {selectedNote ? (
        <NoteEditor
          note={selectedNote}
          allTags={tags}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onBack={handleBack}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">✏️</div>
            <h3 className="text-lg font-medium mb-2">No note selected</h3>
            <p className="text-muted-foreground text-sm">
              Select a note to edit or create a new one
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <MobileHeader />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'folders' && <FoldersView />}
        {viewMode === 'notes' && <NotesView />}
        {viewMode === 'editor' && <EditorView />}
      </div>
      
      {/* Bottom safe area */}
      <div className="safe-bottom" />
    </div>
  );
}
