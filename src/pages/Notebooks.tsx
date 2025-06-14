import { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { useNotebookStore } from '@/hooks/useNotebookStore';
import { Note, Folder, Tag } from '@/types/notebooks';
import { NoteList } from '@/components/notebooks/NoteList';
import { NoteEditor } from '@/components/notebooks/NoteEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FolderPlus, Search, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Notebooks() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false);
  
  // Get state and actions from our store
  const {
    notes,
    folders,
    tags,
    selectedNoteId,
    selectedFolderId,
    filteredNotes,
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
  
  // Handle creating a new note
  const handleCreateNewNote = useCallback(() => {
    const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      title: '',
      content: '',
      tags: [],
      folderId: selectedFolderId || null, // Changed from undefined to null to match type
      isArchived: false,
      isPinned: false,
    };
    
    const createdNoteId = addNote(newNote);
    setSelectedNoteId(createdNoteId);
    setIsCreatingNewNote(true);
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
      }
    }
  }, [deleteNote, selectedNoteId, setSelectedNoteId]);
  
  // Handle creating a new folder
  const handleCreateNewFolder = useCallback(() => {
    const name = window.prompt('Enter folder name:');
    if (name) {
      addFolder({
        name,
        parentId: null, // Changed from undefined to null to match type
      });
    }
  }, [addFolder]);
  
  // Update search query in store when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setStoreSearchQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, setStoreSearchQuery]);
  
  // Memoize the note list to prevent unnecessary re-renders
  const memoizedNoteList = useMemo(() => (
    <NoteList
      notes={displayedNotes}  // Removed function call since displayedNotes is already a value
      selectedNoteId={selectedNoteId}
      onSelectNote={(id: string) => {
        setSelectedNoteId(id);
        setIsMobileMenuOpen(false);
      }}
      onCreateNote={handleCreateNewNote}
      onSearch={setSearchQuery}
    />
  ), [displayedNotes, selectedNoteId, handleCreateNewNote, setSelectedNoteId, setIsMobileMenuOpen, setSearchQuery]);
  
  // Memoize the note editor to prevent unnecessary re-renders
  const memoizedNoteEditor = useMemo(() => (
    selectedNote ? (
      <NoteEditor
        note={selectedNote}
        allTags={tags}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        onBack={() => setSelectedNoteId(null)}
      />
    ) : (
      <div className="flex-1 flex items-center justify-center bg-muted/50">
        <div className="text-center p-8 max-w-md">
          <h3 className="text-lg font-medium mb-2">No note selected</h3>
          <p className="text-muted-foreground text-sm">
            Select a note from the list or create a new one to get started.
          </p>
          <Button className="mt-4" onClick={handleCreateNewNote}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Note
          </Button>
        </div>
      </div>
    )
  ), [selectedNote, tags, handleSaveNote, handleDeleteNote, handleCreateNewNote]);
  
  // Auto-select the first note when in mobile view and no note is selected
  useEffect(() => {
    if (window.innerWidth < 768 && notes.length > 0 && !selectedNoteId && !isCreatingNewNote) {
      setSelectedNoteId(notes[0].id);
    }
  }, [notes, selectedNoteId, isCreatingNewNote, setSelectedNoteId]);
  
  // Add a resize listener to handle mobile/desktop transitions
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && selectedNoteId) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedNoteId]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Notebooks</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleCreateNewFolder}>
            <FolderPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Folder</span>
          </Button>
          <Button size="sm" onClick={handleCreateNewNote}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Note</span>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile when editor is open */}
        <div
          className={cn(
            'flex flex-col border-r w-full md:w-80 bg-background md:flex',
            isMobileMenuOpen ? 'flex' : 'hidden md:flex',
            selectedNoteId && 'hidden md:flex'
          )}
        >
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {/* Folders */}
            <div className="p-2">
              <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">FOLDERS</h3>
              <div className="space-y-1">
                <button
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded text-sm flex items-center',
                    !selectedFolderId ? 'bg-accent' : 'hover:bg-accent/50'
                  )}
                  onClick={() => setSelectedFolderId(undefined)}
                >
                  <span>All Notes</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {notes.filter((n: Note) => !n.folderId).length}
                  </span>
                </button>
                
                {folders.map((folder: Folder) => (
                  <button
                    key={folder.id}
                    className={cn(
                      'w-full text-left px-2 py-1.5 rounded text-sm flex items-center',
                      selectedFolderId === folder.id ? 'bg-accent' : 'hover:bg-accent/50'
                    )}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    <span>{folder.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {notes.filter((n: Note) => n.folderId === folder.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Tags */}
            <div className="p-2 border-t">
              <h3 className="px-2 py-1 text-xs font-medium text-muted-foreground">TAGS</h3>
              <div className="space-y-1">
                {tags.map((tag: Tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center px-2 py-1.5 rounded text-sm hover:bg-accent/50 cursor-pointer"
                  >
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {notes.filter((n: Note) => n.tags.includes(tag.id)).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
        
        {/* Note List - Hidden on mobile when editor is open */}
        <div
          className={cn(
            'flex flex-col border-r w-full md:w-80 bg-background',
            selectedNoteId ? 'hidden md:flex' : 'flex'
          )}
        >
          {memoizedNoteList}
        </div>
        
        {/* Note Editor */}
        <div className={cn('flex-1 flex flex-col', !selectedNoteId && 'hidden md:flex')}>
          {memoizedNoteEditor}
        </div>
      </div>
    </div>
  );
}
