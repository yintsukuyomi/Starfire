import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotebookStore } from '../hooks/useNotebookStore';
import { Note, Folder, Tag } from '../types/notebooks';
import {
  FolderPlus,
  Plus,
  Search,
  Grid,
  List,
  Tag as TagIcon,
  Folder as FolderIcon,
  MoreHorizontal,
  ArrowLeft,
  X,
  ChevronRight,
  Star,
  Archive,
  Trash2,
  Clock,
  Filter,
  Sun,
  Moon,
  User
} from 'lucide-react';
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '../components/ui/dialog';
import { TiptapEditor } from '../components/editor/TiptapEditor';
import { toast } from 'sonner';

export default function Notebooks() {
  const navigate = useNavigate();
  const {
    notes,
    folders,
    tags,
    addNote,
    updateNote,
    deleteNote,
    addFolder,
    updateFolder,
    deleteFolder,
    loadNotes,
  } = useNotebookStore();

  const [viewMode, setViewMode] = useState<'folder' | 'note' | 'edit' | 'notes'>('folder');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickNoteOpen, setQuickNoteOpen] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [swipedNoteId, setSwipedNoteId] = useState<string | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [swipeDeltaX, setSwipeDeltaX] = useState<number>(0);
  const [moveNoteId, setMoveNoteId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'note' | 'folder'; id: string } | null>(null);
  const [viewDeleteDialogOpen, setViewDeleteDialogOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initData = async () => {
      if (!mounted) return;
      
      try {
        setIsLoading(true);
        setError(null);
        await loadNotes();
      } catch (err) {
        if (mounted) {
          setError('Failed to load data');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Only load once
    if (notes.length === 0 && folders.length === 0 && tags.length === 0) {
      initData();
    } else {
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array

  // Keyboard shortcut: N
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !quickNoteOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setQuickNoteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [quickNoteOpen]);

  // Kısayol: / ile arama inputuna odaklan
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading notebooks...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || note.tags?.includes(selectedTag);
    const matchesFolder = !currentFolder || note.folderId === currentFolder;
    return matchesSearch && matchesTag && matchesFolder;
  });

  const handleBack = () => {
    if (viewMode === 'edit') {
      setViewMode('note');
    } else if (viewMode === 'note') {
      setViewMode('folder');
      setSelectedNote(null);
    } else if (currentFolder) {
      setCurrentFolder(null);
    }
  };

  const handleCreateFolder = async () => {
    setNewFolderDialogOpen(true);
  };

  const handleConfirmCreateFolder = async () => {
    if (newFolderName.trim()) {
      await addFolder({
        name: newFolderName.trim(),
        parentId: currentFolder,
      });
      setNewFolderName('');
      setNewFolderDialogOpen(false);
    }
  };

  const handleRenameFolder = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const name = prompt('Enter new folder name:', folder.name);
    if (name && name !== folder.name) {
      await updateFolder(folder.id, { name });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (confirm('Are you sure you want to delete this folder?')) {
      await deleteFolder(folderId);
    }
  };

  const handleCreateNote = async () => {
    const newNoteId: string = await addNote({
      title: '',
      content: '',
      folderId: currentFolder,
      tags: [],
      isArchived: false,
      isPinned: false,
    });
    const newNote = notes.find(note => note.id === newNoteId);
    if (!newNote) {
      console.error('Failed to find the newly created note.');
      return;
    }
    setSelectedNote(newNote);
    setViewMode('edit');
  };

  const handleSaveNote = async (note: Note) => {
    await updateNote(note.id, {
      title: note.title,
      content: note.content,
      tags: note.tags
    });
    setViewMode('note');
  };

  const confirmDeleteNote = (noteId: string) => setDeleteDialog({ type: 'note', id: noteId });
  const handleDeleteNoteConfirmed = async () => {
    if (deleteDialog?.type === 'note') {
      await deleteNote(deleteDialog.id);
      setSelectedNote(null);
      setViewMode('folder');
      setDeleteDialog(null);
    }
  };

  const confirmDeleteFolder = (folderId: string) => setDeleteDialog({ type: 'folder', id: folderId });
  const handleDeleteFolderConfirmed = async () => {
    if (deleteDialog?.type === 'folder') {
      await deleteFolder(deleteDialog.id);
      setDeleteDialog(null);
    }
  };

  const handleSaveFolder = async (folder: Folder) => {
    await updateFolder(folder.id, {
      name: folder.name,
    });
    setEditingFolder(null);
  };

  const handleQuickSave = async () => {
    if (!quickTitle.trim() && !quickContent.trim()) {
      toast.error('Başlık veya içerik girin!');
      return;
    }
    const newNoteId = await addNote({
      title: quickTitle.trim() || 'Untitled Note',
      content: quickContent,
      folderId: currentFolder,
      tags: quickTags,
      isArchived: false,
      isPinned: false,
    });
    setQuickNoteOpen(false);
    setQuickTitle('');
    setQuickContent('');
    setQuickTags([]);
    toast.success('Not eklendi!');
    // İstersen yeni notu otomatik seçebilirsin:
    // const newNote = notes.find(note => note.id === newNoteId);
    // if (newNote) { setSelectedNote(newNote); setViewMode('note'); }
  };

  // Modern iOS App Bar
  const appBar = (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur border-b border-border shadow-none">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <FolderIcon className="w-7 h-7 text-primary" />
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {currentFolder
              ? folders.find(f => f.id === currentFolder)?.name || 'Klasör'
              : 'Notebooks'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCreateNote}
          title="Yeni Not (N)"
          className="rounded-full bg-ios-blue/90 text-white hover:bg-ios-blue shadow-ios"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>
    </header>
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
          selectedFolderId={currentFolder}
          onSelectFolder={(id) => {
            setCurrentFolder(id);
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
          {currentFolder && (
            <FolderIcon className="h-5 w-5 text-muted-foreground" />
          )}
          <h2 className="text-lg font-semibold">
            {currentFolder
              ? folders.find(f => f.id === currentFolder)?.name
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
        {false ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNote(note);
                  setViewMode('edit');
                }}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left"
              >
                <h3 className="font-medium line-clamp-1 mb-2">
                  {note.title || 'Untitled Note'}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {(note.content.replace(/<[^>]*>/g, '').slice(0, 100) || 'No content') + (note.content.replace(/<[^>]*>/g, '').length > 100 ? '...' : '')}
                </p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tagId) => {
                      const tag = tags.find(t => t.id === tagId);
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
            {filteredNotes.map((note) => {
              const isSwiped = swipedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  className={
                    'relative rounded-2xl bg-card shadow-ios transition-all duration-200' +
                    (isSwiped ? ' ring-2 ring-ios-blue/60' : '')
                  }
                  style={{
                    transform: isSwiped && Math.abs(swipeDeltaX) > 30 ? `translateX(-90px)` : 'none',
                    minHeight: 72,
                  }}
                  onTouchStart={e => {
                    setSwipeStartX(e.touches[0].clientX);
                    setSwipedNoteId(note.id);
                  }}
                  onTouchMove={e => {
                    if (swipedNoteId === note.id && swipeStartX !== null) {
                      setSwipeDeltaX(e.touches[0].clientX - swipeStartX);
                    }
                  }}
                  onTouchEnd={() => {
                    if (Math.abs(swipeDeltaX) > 60) {
                      setSwipedNoteId(note.id);
                    } else {
                      setSwipedNoteId(null);
                    }
                    setSwipeStartX(null);
                    setSwipeDeltaX(0);
                  }}
                >
                  {/* Swipe aksiyonları */}
                  {isSwiped && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 z-10">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full shadow"
                        onClick={() => confirmDeleteNote(note.id)}
                      >
                        Sil
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full shadow"
                        onClick={() => setMoveNoteId(note.id)}
                      >
                        Taşı
                      </Button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedNote(note);
                      setViewMode('edit');
                    }}
                    className={
                      'w-full flex flex-col items-start p-4 rounded-2xl text-left bg-transparent focus:outline-none'
                    }
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <h3 className="font-semibold text-base line-clamp-1">
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
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                      {(note.content.replace(/<[^>]*>/g, '').slice(0, 100) || 'No content') + (note.content.replace(/<[^>]*>/g, '').length > 100 ? '...' : '')}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.tags.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId);
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
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  if (viewMode === 'edit' && selectedNote) {
    return (
      <NoteEditor
        note={selectedNote}
        allTags={tags}
        onSave={async (noteData) => {
          await updateNote(selectedNote.id, noteData);
          setViewMode('note');
        }}
        onDelete={handleDeleteNoteConfirmed}
        onBack={() => setViewMode('note')}
      />
    );
  }

  if (viewMode === 'note' && selectedNote) {
    return (
      <div className="h-full flex flex-col">
        {/* Modern sticky sub-header for note view */}
        <div className="sticky top-[64px] z-30 bg-background/80 border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="p-2 text-muted-foreground hover:text-primary transition-colors">←</button>
            <span className="text-lg font-semibold">{selectedNote?.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('edit')}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewDeleteDialogOpen(true)}
              className="text-red-500"
            >
              Delete
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <div className="prose max-w-none">
            <h1 className="text-2xl font-bold">{selectedNote?.title}</h1>
            <div className="mt-4">
              {selectedNote?.tags?.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId);
                return tag ? (
                  <span
                    key={tagId}
                    className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ) : null;
              })}
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Last updated: {selectedNote ? new Date(selectedNote.updatedAt).toLocaleString() : ''}
            </div>
            <div
              className="mt-4"
              dangerouslySetInnerHTML={{ __html: selectedNote?.content || '' }}
            />
          </div>
        </div>
        {/* Not silme onay modalı (sadece bu ekranda) */}
        <Dialog open={viewDeleteDialogOpen} onOpenChange={setViewDeleteDialogOpen}>
          <DialogContent className="rounded-2xl p-6 max-w-xs mx-auto bg-background">
            <DialogHeader>
              <DialogTitle className="text-center text-lg font-semibold">Notu Sil</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center text-muted-foreground">
              Bu notu silmek istediğine emin misin? Bu işlem geri alınamaz.
            </div>
            <DialogFooter className="flex gap-2 justify-end mt-4">
              <Button variant="ghost" onClick={() => setViewDeleteDialogOpen(false)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  await handleDeleteNoteConfirmed();
                  setViewDeleteDialogOpen(false);
                }}
              >
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      {appBar}
      <div className="h-full flex flex-col bg-background text-foreground">
        {/* Search and filter */}
        <div className="p-0 px-4 pt-4 pb-2 bg-background text-foreground">
          <div className="relative mb-3">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Notlarda ara... (/ ile hızlı erişim)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 rounded-xl bg-muted border-none shadow focus:ring-2 focus:ring-ios-blue text-base placeholder:font-normal placeholder:text-muted-foreground"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-sm font-medium text-foreground">Etiketler</label>
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-muted border-none shadow focus:ring-2 focus:ring-ios-blue text-base text-foreground"
            >
              <option value="">Tüm etiketler</option>
              {tags.map((tag: Tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-background text-foreground">
          {/* Yeni Klasör butonu */}
          <div className="flex items-center justify-between px-6 pt-2 pb-2">
            <span className="font-semibold text-lg text-foreground">Klasörler</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCreateFolder}
              className="h-9 rounded-full bg-ios-blue/90 text-white hover:bg-ios-blue shadow-ios px-4"
            >
              <FolderPlus className="h-5 w-5 mr-2" />
              <span>Yeni Klasör</span>
            </Button>
          </div>
          <div className="space-y-2 px-4 pb-4">
            {folders
              .filter((folder) => folder.parentId === currentFolder)
              .map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between rounded-2xl bg-card shadow-ios px-5 py-3 mb-1 hover:bg-accent/60 transition-colors cursor-pointer"
                  onClick={() => setCurrentFolder(folder.id)}
                >
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">📁</span>
                    <span className="font-medium text-base">{folder.name}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); confirmDeleteFolder(folder.id); }}
                    className="text-red-500 hover:text-red-700 rounded-full px-2 py-1 text-sm"
                  >
                    Sil
                  </button>
                </div>
              ))}
          </div>
          <div className="pt-2 pb-4 px-4">
            <span className="font-semibold text-lg text-foreground">Notlar</span>
          </div>
          <div className="space-y-3 px-4 pb-8">
            {filteredNotes.map((note) => {
              const isSwiped = swipedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  className={
                    'relative rounded-2xl bg-card shadow-ios transition-all duration-200' +
                    (isSwiped ? ' ring-2 ring-ios-blue/60' : '')
                  }
                  style={{
                    transform: isSwiped && Math.abs(swipeDeltaX) > 30 ? `translateX(-90px)` : 'none',
                    minHeight: 72,
                  }}
                  onTouchStart={e => {
                    setSwipeStartX(e.touches[0].clientX);
                    setSwipedNoteId(note.id);
                  }}
                  onTouchMove={e => {
                    if (swipedNoteId === note.id && swipeStartX !== null) {
                      setSwipeDeltaX(e.touches[0].clientX - swipeStartX);
                    }
                  }}
                  onTouchEnd={() => {
                    if (Math.abs(swipeDeltaX) > 60) {
                      setSwipedNoteId(note.id);
                    } else {
                      setSwipedNoteId(null);
                    }
                    setSwipeStartX(null);
                    setSwipeDeltaX(0);
                  }}
                >
                  {/* Swipe aksiyonları */}
                  {isSwiped && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 z-10">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-full shadow"
                        onClick={() => confirmDeleteNote(note.id)}
                      >
                        Sil
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-full shadow"
                        onClick={() => setMoveNoteId(note.id)}
                      >
                        Taşı
                      </Button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedNote(note);
                      setViewMode('edit');
                    }}
                    className={
                      'w-full flex flex-col items-start p-4 rounded-2xl text-left bg-transparent focus:outline-none'
                    }
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <h3 className="font-semibold text-base line-clamp-1">
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
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                      {(note.content.replace(/<[^>]*>/g, '').slice(0, 100) || 'No content') + (note.content.replace(/<[^>]*>/g, '').length > 100 ? '...' : '')}
                    </p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.tags.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId);
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* iOS tarzı yeni klasör dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent className="rounded-2xl p-6 max-w-xs mx-auto bg-background">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">Yeni Klasör</DialogTitle>
          </DialogHeader>
          <input
            autoFocus
            type="text"
            placeholder="Klasör adı"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            className="w-full mt-4 mb-6 px-4 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={32}
          />
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setNewFolderDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleConfirmCreateFolder} disabled={!newFolderName.trim()}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Notu başka klasöre taşı modalı */}
      <Dialog open={!!moveNoteId} onOpenChange={open => { if (!open) setMoveNoteId(null); }}>
        <DialogContent className="rounded-2xl p-6 max-w-xs mx-auto bg-background">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">Notu Taşı</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {folders.length === 0 && (
              <div className="text-center text-muted-foreground py-4">Hiç klasör yok</div>
            )}
            {folders.map(folder => (
              <button
                key={folder.id}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                onClick={async () => {
                  if (moveNoteId) {
                    await updateNote(moveNoteId, { folderId: folder.id });
                    setMoveNoteId(null);
                  }
                }}
              >
                <span className="mr-2">📁</span>{folder.name}
              </button>
            ))}
            <button
              className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={async () => {
                if (moveNoteId) {
                  await updateNote(moveNoteId, { folderId: null });
                  setMoveNoteId(null);
                }
              }}
            >
              <span className="mr-2">📄</span>Klasörsüz (ana dizin)
            </button>
          </div>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setMoveNoteId(null)}>
              İptal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* iOS tarzı silme onay modalı */}
      <Dialog open={!!deleteDialog} onOpenChange={open => { if (!open) setDeleteDialog(null); }}>
        <DialogContent className="rounded-2xl p-6 max-w-xs mx-auto bg-background">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              {deleteDialog?.type === 'note' ? 'Notu Sil' : 'Klasörü Sil'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            {deleteDialog?.type === 'note'
              ? 'Bu notu silmek istediğine emin misin? Bu işlem geri alınamaz.'
              : 'Bu klasörü silmek istediğine emin misin? İçindeki tüm notlar da silinecek.'}
          </div>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setDeleteDialog(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={deleteDialog?.type === 'note' ? handleDeleteNoteConfirmed : handleDeleteFolderConfirmed}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Add named export
export { Notebooks };
