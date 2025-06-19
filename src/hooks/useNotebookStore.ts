import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, Folder, Tag, NoteVersion } from '@/types/notebooks';
import { toast } from 'sonner';

// Add API_URL definition
const API_URL = import.meta.env.VITE_API_URL || '';

// Mock data for fallback
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Notebooks',
    content: '<p>This is your first note! Start writing your thoughts here.</p>',
    tags: [],
    folderId: null,
    isArchived: false,
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: '2',
    title: 'Getting Started',
    content: '<p>Here are some tips to get you started with the notebook feature:</p><ul><li>Create folders to organize your notes</li><li>Use tags to categorize content</li><li>Pin important notes</li></ul>',
    tags: [],
    folderId: null,
    isArchived: false,
    isPinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  },
];

const mockFolders: Folder[] = [
  {
    id: '1',
    name: 'Personal',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Work',
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTags: Tag[] = [
  {
    id: '1',
    name: 'Important',
    color: '#ff6b6b',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ideas',
    color: '#4ecdc4',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  setNotes: (notes: Note[]) => void;
  setFolders: (folders: Folder[]) => void;
  setTags: (tags: Tag[]) => void;
  setSelectedNoteId: (id: string | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTagIds: (ids: string[]) => void;
  clearError: () => void;
  
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
  loadNotes: () => Promise<void>;
}

const useNotebookStore = create<NotebookState>((set, get) => ({
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
  isInitialized: false,
  error: null,
  
  // State setters
  setNotes: (notes) => set({ notes }),
  setFolders: (folders) => set({ folders }),
  setTags: (tags) => set({ tags }),
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),
  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTagIds: (ids) => set({ selectedTagIds: ids }),
  clearError: () => set({ error: null }),
  
  // CRUD Operations
  addNote: async (note) => {
    const newNote: Note = {
      ...note,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };
    
    set((state) => {
      const updatedNotes = [...state.notes, newNote];
      localStorage.setItem('starfire-notes', JSON.stringify(updatedNotes));
      return { notes: updatedNotes };
    });
    
    return newNote.id;
  },
  
  updateNote: async (id, updates) => {
    set((state) => {
      const updatedNotes = state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      );
      localStorage.setItem('starfire-notes', JSON.stringify(updatedNotes));
      return { notes: updatedNotes };
    });
  },
  
  deleteNote: async (id) => {
    set((state) => {
      const updatedNotes = state.notes.filter((note) => note.id !== id);
      localStorage.setItem('starfire-notes', JSON.stringify(updatedNotes));
      return { notes: updatedNotes };
    });
  },
  
  addFolder: async (folder) => {
    const newFolder: Folder = {
      ...folder,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => {
      const updatedFolders = [...state.folders, newFolder];
      localStorage.setItem('starfire-folders', JSON.stringify(updatedFolders));
      return { folders: updatedFolders };
    });
  },
  
  updateFolder: async (id, updates) => {
    set((state) => {
      const updatedFolders = state.folders.map((folder) =>
        folder.id === id
          ? { ...folder, ...updates, updatedAt: new Date().toISOString() }
          : folder
      );
      localStorage.setItem('starfire-folders', JSON.stringify(updatedFolders));
      return { folders: updatedFolders };
    });
  },
  
  deleteFolder: async (id) => {
    set((state) => {
      const updatedFolders = state.folders.filter((folder) => folder.id !== id);
      localStorage.setItem('starfire-folders', JSON.stringify(updatedFolders));
      return { folders: updatedFolders };
    });
  },
  
  addTag: async (tag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTag: Tag = {
      id: uuidv4(),
      ...tag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      tags: [...state.tags, newTag],
    }));
  },

  updateTag: async (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>>) => {
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id
          ? { ...tag, ...updates, updatedAt: new Date().toISOString() }
          : tag
      ),
    }));
  },

  deleteTag: async (id: string) => {
    set((state) => ({
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
    set({ isLoading: true, error: null });
    try {
      const [notesRes, foldersRes, tagsRes] = await Promise.all([
        fetch(`${API_URL}/notes`).catch(() => null),
        fetch(`${API_URL}/folders`).catch(() => null),
        fetch(`${API_URL}/tags`).catch(() => null),
      ]);
      let notes = [];
      let folders = [];
      let tags = [];
      if (notesRes?.ok && foldersRes?.ok && tagsRes?.ok) {
        notes = await notesRes.json();
        folders = await foldersRes.json();
        tags = await tagsRes.json();
      }
      // Eğer API'dan gelen veri yoksa veya boşsa localStorage'dan yükle
      if (!notes?.length || !folders?.length || !tags?.length) {
        const savedNotes = localStorage.getItem('starfire-notes');
        const savedFolders = localStorage.getItem('starfire-folders');
        const savedTags = localStorage.getItem('starfire-tags');
        notes = savedNotes ? JSON.parse(savedNotes) : mockNotes;
        folders = savedFolders ? JSON.parse(savedFolders) : mockFolders;
        tags = savedTags ? JSON.parse(savedTags) : mockTags;
      }
      set({
        notes,
        folders,
        tags,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      if (!notes?.length || !folders?.length || !tags?.length) {
        toast.info('Working offline - your data is saved locally');
      }
    } catch (error) {
      console.warn('⚠️ API not available, using fallback data and local storage');
      const savedNotes = localStorage.getItem('starfire-notes');
      const savedFolders = localStorage.getItem('starfire-folders');
      const savedTags = localStorage.getItem('starfire-tags');
      const notes = savedNotes ? JSON.parse(savedNotes) : mockNotes;
      const folders = savedFolders ? JSON.parse(savedFolders) : mockFolders;
      const tags = savedTags ? JSON.parse(savedTags) : mockTags;
      if (!savedNotes) localStorage.setItem('starfire-notes', JSON.stringify(mockNotes));
      if (!savedFolders) localStorage.setItem('starfire-folders', JSON.stringify(mockFolders));
      if (!savedTags) localStorage.setItem('starfire-tags', JSON.stringify(mockTags));
      set({
        notes,
        folders,
        tags,
        isLoading: false,
        isInitialized: true,
        error: 'Working offline - data saved locally',
      });
      toast.info('Working offline - your data is saved locally');
    }
  },

  loadNotes: async () => {
    const state = get();
    if (state.isLoading) return;
    set({ isLoading: true });
    try {
      const [notesRes, foldersRes, tagsRes] = await Promise.all([
        fetch('/api/notes'),
        fetch('/api/folders'),
        fetch('/api/tags'),
      ]);
      let notes = [];
      let folders = [];
      let tags = [];
      if (notesRes.ok && foldersRes.ok && tagsRes.ok) {
        notes = await notesRes.json();
        folders = await foldersRes.json();
        tags = await tagsRes.json();
      }
      // Eğer API'dan gelen veri yoksa veya boşsa localStorage'dan yükle
      if (!notes?.length || !folders?.length || !tags?.length) {
        const savedNotes = localStorage.getItem('starfire-notes');
        const savedFolders = localStorage.getItem('starfire-folders');
        const savedTags = localStorage.getItem('starfire-tags');
        notes = savedNotes ? JSON.parse(savedNotes) : [];
        folders = savedFolders ? JSON.parse(savedFolders) : [];
        tags = savedTags ? JSON.parse(savedTags) : [];
      }
      set({ notes, folders, tags, isLoading: false });
    } catch (error) {
      console.warn('⚠️ API not available, using fallback data and local storage');
      // Fallback to localStorage
      const savedNotes = localStorage.getItem('starfire-notes');
      const savedFolders = localStorage.getItem('starfire-folders');
      const savedTags = localStorage.getItem('starfire-tags');
      set({
        notes: savedNotes ? JSON.parse(savedNotes) : [],
        folders: savedFolders ? JSON.parse(savedFolders) : [],
        tags: savedTags ? JSON.parse(savedTags) : [],
        isLoading: false
      });
    }
  },
}));

export { useNotebookStore };
