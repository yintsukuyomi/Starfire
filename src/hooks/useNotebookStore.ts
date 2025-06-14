import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, Folder, Tag, NoteVersion } from '@/types/notebooks';

// Helper function to generate a version summary
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

interface NotebookState {
  // State
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  searchQuery: string;
  selectedTagIds: string[];
  versions: Record<string, NoteVersion[]>; // noteId -> versions[]
  
  // Actions
  setNotes: (notes: Note[]) => void;
  setFolders: (folders: Folder[]) => void;
  setTags: (tags: Tag[]) => void;
  setSelectedNoteId: (id: string | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTagIds: (ids: string[]) => void;
  
  // CRUD Operations
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => string;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>>) => void;
  deleteNote: (id: string) => void;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFolder: (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteFolder: (id: string) => void;
  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteTag: (id: string) => void;
  
  // Versioning
  getNoteVersions: (noteId: string) => NoteVersion[];
  restoreVersion: (version: NoteVersion) => void;
  
  // Helpers
  getNoteById: (id: string) => Note | undefined;
  getFolderById: (id: string) => Folder | undefined;
  getTagById: (id: string) => Tag | undefined;
  getNotesByFolder: (folderId: string | null) => Note[];
  getNotesByTag: (tagId: string) => Note[];
  searchNotes: (query: string) => Note[];
}

export const useNotebookStore = create<NotebookState>((set, get) => ({
  // Initial state
  notes: [],
  folders: [],
  tags: [],
  selectedNoteId: null,
  selectedFolderId: null,
  searchQuery: '',
  selectedTagIds: [],
  versions: {},
  
  // Setters
  setNotes: (notes) => set({ notes }),
  setFolders: (folders) => set({ folders }),
  setTags: (tags) => set({ tags }),
  setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
  setSelectedFolderId: (selectedFolderId) => set({ selectedFolderId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedTagIds: (selectedTagIds) => set({ selectedTagIds }),
  
  // CRUD Operations
  addNote: (note) => {
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    
    // Create initial version
    const initialVersion: NoteVersion = {
      id: uuidv4(),
      noteId: newNote.id,
      title: newNote.title,
      content: newNote.content,
      tags: [...newNote.tags],
      folderId: newNote.folderId,
      isArchived: newNote.isArchived,
      isPinned: newNote.isPinned,
      version: 1,
      updatedAt: newNote.updatedAt,
      updatedBy: 'system',
      changeSummary: 'Initial version',
    };
    
    set((state) => ({
      notes: [...state.notes, newNote],
      versions: {
        ...state.versions,
        [newNote.id]: [initialVersion],
      },
    }));
    
    return newNote.id;
  },
  
  updateNote: (id, updates) => {
    set((state) => {
      const noteToUpdate = state.notes.find((n) => n.id === id);
      if (!noteToUpdate) return state;
      
      const updatedNote = {
        ...noteToUpdate,
        ...updates,
        updatedAt: new Date().toISOString(),
        version: noteToUpdate.version + 1,
      };
      
      // Create new version if there are actual changes
      const changeSummary = generateChangeSummary(noteToUpdate, updatedNote);
      if (changeSummary !== 'no changes detected') {
        const newVersion: NoteVersion = {
          id: uuidv4(),
          noteId: id,
          title: updatedNote.title,
          content: updatedNote.content,
          tags: [...updatedNote.tags],
          folderId: updatedNote.folderId,
          isArchived: updatedNote.isArchived,
          isPinned: updatedNote.isPinned,
          version: updatedNote.version,
          updatedAt: updatedNote.updatedAt,
          updatedBy: 'user',
          changeSummary,
        };
        
        return {
          notes: state.notes.map((note) =>
            note.id === id ? updatedNote : note
          ),
          versions: {
            ...state.versions,
            [id]: [
              ...(state.versions[id] || []),
              newVersion,
            ].sort((a, b) => b.version - a.version).slice(0, 50), // Keep last 50 versions
          },
        };
      }
      
      return {
        notes: state.notes.map((note) =>
          note.id === id ? updatedNote : note
        ),
      };
    });
  },
  
  deleteNote: (id) => {
    set((state) => {
      const newVersions = { ...state.versions };
      delete newVersions[id];
      
      return {
        notes: state.notes.filter((note) => note.id !== id),
        versions: newVersions,
      };
    });
  },
  
  addFolder: (folder) => {
    const newFolder: Folder = {
      ...folder,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      folders: [...state.folders, newFolder],
    }));
  },
  
  updateFolder: (id, updates) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id
          ? {
              ...folder,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : folder
      ),
    }));
  },
  
  deleteFolder: (id) => {
    // Move notes to root folder before deleting
    set((state) => ({
      notes: state.notes.map((note) =>
        note.folderId === id ? { ...note, folderId: null } : note
      ),
      folders: state.folders.filter((folder) => folder.id !== id),
    }));
  },
  
  addTag: (tag) => {
    const newTag: Tag = {
      ...tag,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      tags: [...state.tags, newTag],
    }));
  },
  
  updateTag: (id, updates) => {
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id
          ? {
              ...tag,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : tag
      ),
    }));
  },
  
  deleteTag: (id) => {
    // Remove tag from notes before deleting
    set((state) => ({
      notes: state.notes.map((note) => ({
        ...note,
        tags: note.tags.filter((tagId) => tagId !== id),
      })),
      tags: state.tags.filter((tag) => tag.id !== id),
    }));
  },
  
  // Versioning
  getNoteVersions: (noteId) => {
    return get().versions[noteId] || [];
  },
  
  restoreVersion: (version) => {
    const { noteId } = version;
    const state = get();
    
    const noteToUpdate = state.notes.find((n) => n.id === noteId);
    if (!noteToUpdate) return;
    
    // Create a new version when restoring
    const restoredVersion: NoteVersion = {
      ...version,
      id: uuidv4(),
      version: noteToUpdate.version + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: 'user',
      changeSummary: `Restored from version ${version.version}`,
    };
    
    // Update the note with the restored version
    const updatedNote: Note = {
      ...noteToUpdate,
      title: version.title,
      content: version.content,
      tags: [...version.tags],
      folderId: version.folderId ?? null,
      isArchived: version.isArchived,
      isPinned: version.isPinned,
      version: restoredVersion.version,
      updatedAt: restoredVersion.updatedAt,
    };
    
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId ? updatedNote : note
      ),
      versions: {
        ...state.versions,
        [noteId]: [
          ...(state.versions[noteId] || []),
          restoredVersion,
        ].sort((a, b) => b.version - a.version).slice(0, 50),
      },
    }));
  },
  
  // Helper methods
  getNoteById: (id) => {
    return get().notes.find((note) => note.id === id);
  },
  
  getFolderById: (id) => {
    return get().folders.find((folder) => folder.id === id);
  },
  
  getTagById: (id) => {
    return get().tags.find((tag) => tag.id === id);
  },
  
  getNotesByFolder: (folderId) => {
    return get().notes.filter((note) => note.folderId === folderId);
  },
  
  getNotesByTag: (tagId) => {
    return get().notes.filter((note) => note.tags.includes(tagId));
  },
  
  searchNotes: (query) => {
    const q = query.toLowerCase();
    return get().notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
    );
  },
}));
