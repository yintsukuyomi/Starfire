import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, Folder, Tag, NoteVersion } from '@/types/notebooks';
import { toast } from 'sonner';

const API_URL = 'http://localhost:3001/api';

// Helper function to generate a version summary
const generateChangeSummary = (oldNote: Partial<Note>, newNote: Partial<Note>): string => {
  const changes: string[] = [];
  
  if (oldNote.title !== newNote.title) {
    changes.push('title updated');
  }
  
  if (oldNote.content !== newNote.content) {
    changes.push('content updated');
  }
  
  if (JSON.stringify(oldNote.tags) !== JSON.stringify(newNote.tags)) {
    changes.push('tags updated');
  }
  
  if (oldNote.folderId !== newNote.folderId) {
    changes.push('folder changed');
  }
  
  if (oldNote.isArchived !== newNote.isArchived) {
    changes.push(newNote.isArchived ? 'archived' : 'unarchived');
  }
  
  if (oldNote.isPinned !== newNote.isPinned) {
    changes.push(newNote.isPinned ? 'pinned' : 'unpinned');
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
  versions: Record<string, NoteVersion[]>;
  isLoading: boolean;
  
  // Actions
  setNotes: (notes: Note[]) => void;
  setFolders: (folders: Folder[]) => void;
  setTags: (tags: Tag[]) => void;
  setSelectedNoteId: (id: string | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTagIds: (ids: string[]) => void;
  
  // CRUD Operations
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<string>;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFolder: (id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  
  // Versioning
  getNoteVersions: (noteId: string) => NoteVersion[];
  restoreVersion: (version: NoteVersion) => Promise<void>;
  
  // Helpers
  getNoteById: (id: string) => Note | undefined;
  getFolderById: (id: string) => Folder | undefined;
  getTagById: (id: string) => Tag | undefined;
  getNotesByFolder: (folderId: string | null) => Note[];
  getNotesByTag: (tagId: string) => Note[];
  searchNotes: (query: string) => Note[];
  
  // Initialization
  initialize: () => Promise<void>;
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
  isLoading: false,
  
  // State setters
  setNotes: (notes) => set({ notes }),
  setFolders: (folders) => set({ folders }),
  setTags: (tags) => set({ tags }),
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTagIds: (ids) => set({ selectedTagIds: ids }),
  
  // CRUD Operations
  addNote: async (note) => {
    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });
      
      if (!response.ok) throw new Error('Failed to create note');
      
      const newNote = await response.json();
      set((state) => ({ notes: [...state.notes, newNote] }));
      return newNote.id;
    } catch (error) {
      toast.error('Failed to create note');
      throw error;
    }
  },
  
  updateNote: async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update note');
      
      const updatedNote = await response.json();
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? { ...note, ...updatedNote } : note
        ),
      }));
    } catch (error) {
      toast.error('Failed to update note');
      throw error;
    }
  },
  
  deleteNote: async (id) => {
    try {
      const response = await fetch(`${API_URL}/trash/move-to-trash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'note', id }),
      });
      
      if (!response.ok) throw new Error('Failed to delete note');
      
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
      }));
    } catch (error) {
      toast.error('Failed to delete note');
      throw error;
    }
  },
  
  addFolder: async (folder) => {
    try {
      const response = await fetch(`${API_URL}/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folder),
      });
      
      if (!response.ok) throw new Error('Failed to create folder');
      
      const newFolder = await response.json();
      set((state) => ({ folders: [...state.folders, newFolder] }));
    } catch (error) {
      toast.error('Failed to create folder');
      throw error;
    }
  },
  
  updateFolder: async (id, updates) => {
    try {
      const response = await fetch(`${API_URL}/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update folder');
      
      const updatedFolder = await response.json();
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === id ? { ...folder, ...updatedFolder } : folder
        ),
      }));
    } catch (error) {
      toast.error('Failed to update folder');
      throw error;
    }
  },
  
  deleteFolder: async (id) => {
    try {
      const response = await fetch(`${API_URL}/trash/move-to-trash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'folder', id }),
      });
      
      if (!response.ok) throw new Error('Failed to delete folder');
      
      set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== id),
      }));
    } catch (error) {
      toast.error('Failed to delete folder');
      throw error;
    }
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
  
  restoreVersion: async (version) => {
    try {
      const response = await fetch(`${API_URL}/notes/${version.noteId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId: version.id }),
      });
      
      if (!response.ok) throw new Error('Failed to restore version');
      
      const restoredNote = await response.json();
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === version.noteId ? restoredNote : note
        ),
      }));
    } catch (error) {
      toast.error('Failed to restore version');
      throw error;
    }
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
  
  // Initialization
  initialize: async () => {
    set({ isLoading: true });
    try {
      const [notesRes, foldersRes, tagsRes] = await Promise.all([
        fetch(`${API_URL}/notes`),
        fetch(`${API_URL}/folders`),
        fetch(`${API_URL}/tags`),
      ]);

      if (!notesRes.ok || !foldersRes.ok || !tagsRes.ok) {
        throw new Error('Failed to fetch initial data');
      }

      const [notes, folders, tags] = await Promise.all([
        notesRes.json(),
        foldersRes.json(),
        tagsRes.json(),
      ]);

      set({ notes, folders, tags, isLoading: false });
    } catch (error) {
      toast.error('Failed to initialize data');
      set({ isLoading: false });
    }
  },
}));
