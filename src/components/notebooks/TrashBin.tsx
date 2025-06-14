import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';

interface TrashItem {
  id: string;
  type: 'note' | 'folder' | 'tag';
  originalId: string;
  data: any;
  deletedAt: string;
  expiresAt: string;
}

export function TrashBin() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrashItems();
  }, []);

  const fetchTrashItems = async () => {
    try {
      const response = await fetch('/api/trash');
      if (!response.ok) {
        throw new Error('Failed to fetch trash items');
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching trash items:', error);
      toast.error('Failed to fetch trash items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await fetch(`/api/trash/restore/${id}`, { method: 'POST' });
      toast.success('Item restored successfully');
      fetchTrashItems();
    } catch (error) {
      toast.error('Failed to restore item');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/trash/${id}`, { method: 'DELETE' });
      toast.success('Item permanently deleted');
      fetchTrashItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'note':
        return '📝';
      case 'folder':
        return '📁';
      case 'tag':
        return '🏷️';
      default:
        return '📦';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No items in trash
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="p-4 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-card rounded-lg border"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{getItemIcon(item.type)}</div>
              <div>
                <h3 className="font-medium">
                  {item.data.title || item.data.name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDistanceToNow(new Date(item.deletedAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestore(item.id)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 