import { useState, useEffect } from 'react';
import { ArrowLeft, Tag, Star, Archive, Trash2, Clock, MoreHorizontal, Pencil, X } from 'lucide-react';
import { TiptapEditor } from '../editor/TiptapEditor';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Note, Tag as TagType } from '../../types/notebooks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';

interface NoteEditorProps {
  note: Note | null;
  allTags: TagType[];
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

// Tag CRUD API helpers
async function createTag(name: string, color: string) {
  const res = await fetch('/api/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color })
  });
  return res.json();
}
async function updateTag(id: string, name: string, color: string) {
  const res = await fetch(`/api/tags/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color })
  });
  return res.json();
}
async function deleteTag(id: string) {
  await fetch(`/api/tags/${id}`, { method: 'DELETE' });
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
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#007aff');
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('#007aff');
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null);
  const [tagsState, setTagsState] = useState<TagType[]>(allTags);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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

  useEffect(() => { setTagsState(allTags); }, [allTags]);

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
    setDeleteDialogOpen(true);
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
            <div className="absolute right-4 mt-2 p-4 bg-card border rounded-2xl shadow-lg z-20 w-72">
              <div className="mb-3">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={e => setNewTagName(e.target.value)}
                    placeholder="Yeni etiket adı"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={24}
                  />
                  <input
                    type="color"
                    value={newTagColor}
                    onChange={e => setNewTagColor(e.target.value)}
                    className="w-8 h-8 rounded-full border-none"
                    style={{ background: 'none' }}
                  />
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={!newTagName.trim()}
                    onClick={async () => {
                      const tag = await createTag(newTagName.trim(), newTagColor);
                      setTagsState([...tagsState, tag]);
                      setNewTagName('');
                      setNewTagColor('#007aff');
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagsState.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1 bg-muted rounded-full px-2 py-1">
                    <Badge
                      variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={{ backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined }}
                      onClick={() => handleTagSelect(tag.id)}
                    >
                      {tag.name}
                    </Badge>
                    <button
                      className="p-1 hover:bg-accent rounded-full"
                      onClick={() => { setEditingTag(tag); setEditTagName(tag.name); setEditTagColor(tag.color); }}
                      title="Düzenle"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      className="p-1 hover:bg-accent rounded-full"
                      onClick={() => setDeleteTagId(tag.id)}
                      title="Sil"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
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

      {/* Etiket düzenleme modalı */}
      <Dialog open={!!editingTag} onOpenChange={open => { if (!open) setEditingTag(null); }}>
        <DialogContent className="rounded-2xl p-6 max-w-xs mx-auto bg-background">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">Etiketi Düzenle</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={editTagName}
            onChange={e => setEditTagName(e.target.value)}
            className="w-full mt-4 mb-4 px-4 py-2 rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={24}
          />
          <input
            type="color"
            value={editTagColor}
            onChange={e => setEditTagColor(e.target.value)}
            className="w-10 h-10 rounded-full border-none mx-auto mb-4"
            style={{ background: 'none' }}
          />
          <DialogFooter className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditingTag(null)}>
              İptal
            </Button>
            <Button
              onClick={async () => {
                if (editingTag) {
                  const updated = await updateTag(editingTag.id, editTagName, editTagColor);
                  setTagsState(tagsState.map(t => t.id === editingTag.id ? updated : t));
                  setEditingTag(null);
                }
              }}
              disabled={!editTagName.trim()}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Etiket silme onay modalı */}
      <Dialog open={!!deleteTagId} onOpenChange={open => { if (!open) setDeleteTagId(null); }}>
        <DialogContent className="rounded-2xl p-6 max-w-xs mx-auto bg-background">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">Etiketi Sil</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            Bu etiketi silmek istediğine emin misin? Notlardan da kaldırılacak.
          </div>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setDeleteTagId(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (deleteTagId) {
                  await deleteTag(deleteTagId);
                  setTagsState(tagsState.filter(t => t.id !== deleteTagId));
                  setDeleteTagId(null);
                }
              }}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Not silme onay modalı */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl p-6 max-w-xs mx-auto bg-background">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">Notu Sil</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-muted-foreground">
            Bu notu silmek istediğine emin misin? Bu işlem geri alınamaz.
          </div>
          <DialogFooter className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => { onDelete(note.id); setDeleteDialogOpen(false); }}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
