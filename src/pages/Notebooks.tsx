import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderPlus, 
  Plus, 
  Search, 
  Grid, 
  List, 
  Tag,
  Folder,
  MoreHorizontal,
  ArrowLeft,
  X,
  ChevronRight,
  Star,
  Archive,
  Trash2,
  Clock,
  Filter
} from 'lucide-react';
import { useNotebookStore } from '../hooks/useNotebookStore';
import { NoteList } from '../components/notebooks/NoteList';
import { NoteEditor } from '../components/notebooks/NoteEditor';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';
import { PageLayout } from './PageLayout';
import { FolderList } from '@/components/notebooks/FolderList';
import { FolderDialog } from '@/components/notebooks/FolderDialog';
import { TrashBin } from '@/components/notebooks/TrashBin';

type ViewMode = 'folders' | 'notes' | 'editor' | 'trash';

export function Notebooks() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('folders');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'grid'>('list');
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  
  const {
    notes,
    folders,
    tags,
    getNoteById,
    getFolderById,
    getTagById,
    getNotesByFolder,
    getNotesByTag,
    searchNotes,
    addNote,
    updateNote,
    deleteNote,
    addFolder,
    updateFolder,
    deleteFolder,
    isLoading,
    initialize,
  } = useNotebookStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Filter notes based on current selection
  const filteredNotes = () => {
    let result = notes;
    
    if (selectedFolderId) {
      result = getNotesByFolder(selectedFolderId);
    }
    
    if (selectedTagIds.length > 0) {
      result = result.filter(note => 
        selectedTagIds.every(tagId => note.tags.includes(tagId))
      );
    }
    
    if (searchQuery) {
      result = searchNotes(searchQuery);
    }
    
    return result;
  };

  const handleCreateNote = () => {
    const newNoteId = addNote({
      title: 'Untitled Note',
      content: '',
      tags: [],
      folderId: selectedFolderId,
      isArchived: false,
      isPinned: false,
    });
    setSelectedNoteId(newNoteId);
    setViewMode('editor');
  };

  const handleCreateFolder = () => {
    setEditingFolderId(null);
    setFolderDialogOpen(true);
  };

  const handleSaveFolder = (name: string) => {
    if (editingFolderId) {
      updateFolder(editingFolderId, { name });
    } else {
      addFolder({
        name,
        parentId: selectedFolderId,
      });
    }
  };

  const handleRenameFolder = (id: string) => {
    const folder = folders.find(f => f.id === id);
    if (folder) {
      setEditingFolderId(id);
      setFolderDialogOpen(true);
    }
  };

  const handleDeleteFolder = (id: string) => {
    // Move notes to parent folder or root
    const folder = folders.find(f => f.id === id);
    const notesInFolder = notes.filter(note => note.folderId === id);
    
    notesInFolder.forEach(note => {
      updateNote(note.id, {
        folderId: folder?.parentId || null,
      });
    });
    
    deleteFolder(id);
  };

  const handleSaveNote = (updates: any) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, updates);
    }
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setSelectedNoteId(null);
    setViewMode('notes');
  };

  const handleBack = () => {
    if (viewMode === 'editor') {
      setViewMode('notes');
    } else if (viewMode === 'notes') {
      setViewMode('folders');
    }
  };

  // Mobile-optimized header
  const MobileHeader = () => (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          {viewMode === 'editor' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-semibold">
            {viewMode === 'trash' ? 'Trash Bin' : 'Notebooks'}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {viewMode !== 'trash' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('trash')}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
          {viewMode === 'trash' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('folders')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Folders view
  const FoldersView = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateFolder}
          className="h-8"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <FolderList
          folders={folders.map(folder => ({
            ...folder,
            noteCount: notes.filter(note => note.folderId === folder.id).length,
          }))}
          selectedFolderId={selectedFolderId}
          onSelectFolder={(id) => {
            setSelectedFolderId(id);
            setViewMode('notes');
          }}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
        />
      </ScrollArea>
    </div>
  );

  // Notes view
  const NotesView = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectedFolderId && (
            <Folder className="h-5 w-5 text-muted-foreground" />
          )}
          <h2 className="text-lg font-semibold">
            {selectedFolderId
              ? getFolderById(selectedFolderId)?.name
              : 'All Notes'}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateNote}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        {viewType === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredNotes().map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setViewMode('editor');
                }}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
              >
                <h3 className="font-medium line-clamp-1 mb-2">
                  {note.title || 'Untitled Note'}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.content.replace(/<[^>]*>/g, '')}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tagId) => {
                      const tag = getTagById(tagId);
                      return tag ? (
                        <Badge
                          key={tagId}
                          variant="outline"
                          className="text-xs"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes().map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNoteId(note.id);
                  setViewMode('editor');
                }}
                className="w-full p-4 rounded-lg hover:bg-accent/50 transition-colors text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium line-clamp-1">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {note.isPinned && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {note.content.replace(/<[^>]*>/g, '')}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tagId) => {
                      const tag = getTagById(tagId);
                      return tag ? (
                        <Badge
                          key={tagId}
                          variant="outline"
                          className="text-xs"
                          style={{ backgroundColor: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // Editor view
  const EditorView = () => {
    const note = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;
    if (!note) return null;

    return (
      <div className="h-full flex flex-col">
        <NoteEditor
          note={note}
          allTags={tags}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onBack={handleBack}
        />
      </div>
    );
  };

  if (viewMode === 'trash') {
    return (
      <div className="h-full flex flex-col">
        <MobileHeader />
        <TrashBin />
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="h-full flex flex-col bg-background">
        <MobileHeader />
        
        <div className="flex-1 overflow-hidden">
          {viewMode === 'folders' && <FoldersView />}
          {viewMode === 'notes' && <NotesView />}
          {viewMode === 'editor' && <EditorView />}
        </div>
      </div>
      
      <FolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onSubmit={handleSaveFolder}
        initialName={editingFolderId ? folders.find(f => f.id === editingFolderId)?.name : ''}
        title={editingFolderId ? 'Rename Folder' : 'New Folder'}
      />
    </PageLayout>
  );
}
