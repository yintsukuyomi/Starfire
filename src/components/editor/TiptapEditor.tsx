import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { cn } from '../../lib/utils';
import { useState } from 'react';
import { Button } from '../ui';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[300px] text-base leading-relaxed',
        style: 'font-size: 16px;', // Prevent iOS zoom
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <MobileToolbar editor={editor} />
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Mobile-optimized toolbar
const MobileToolbar = ({ editor }: { editor: any }) => {
  const [showMore, setShowMore] = useState(false);

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('Enter the URL of the image:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const primaryTools = [
    {
      icon: 'B',
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
      className: 'font-bold',
    },
    {
      icon: 'I',
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
      className: 'italic',
    },
    {
      icon: 'H1',
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive('heading', { level: 1 }),
      className: 'font-bold text-xs',
    },
    {
      icon: '•',
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList'),
    },
    {
      icon: '☑',
      action: () => editor.chain().focus().toggleTaskList().run(),
      active: editor.isActive('taskList'),
    },
  ];

  const secondaryTools = [
    {
      icon: 'U',
      action: () => editor.chain().focus().toggleUnderline().run(),
      active: editor.isActive('underline'),
      className: 'underline',
    },
    {
      icon: 'H2',
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading', { level: 2 }),
      className: 'font-bold text-xs',
    },
    {
      icon: '1.',
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList'),
    },
    {
      icon: '🔗',
      action: setLink,
      active: editor.isActive('link'),
    },
    {
      icon: '🖼️',
      action: addImage,
      active: false,
    },
    {
      icon: '🖍️',
      action: () => editor.chain().focus().toggleHighlight().run(),
      active: editor.isActive('highlight'),
    },
  ];

  return (
    <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-10">
      {/* Primary toolbar - always visible */}
      <div className="flex items-center justify-between p-2 overflow-x-auto">
        <div className="flex items-center space-x-1">
          {primaryTools.map((tool, index) => (
            <button
              key={index}
              onClick={tool.action}
              className={cn(
                'flex items-center justify-center h-10 w-10 rounded-md text-sm transition-colors touch-manipulation',
                tool.active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                tool.className
              )}
            >
              {tool.icon}
            </button>
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMore(!showMore)}
          className="h-10 px-3"
        >
          {showMore ? 'Less' : 'More'}
        </Button>
      </div>
      
      {/* Secondary toolbar - expandable */}
      {showMore && (
        <div className="flex items-center space-x-1 p-2 border-t overflow-x-auto">
          {secondaryTools.map((tool, index) => (
            <button
              key={index}
              onClick={tool.action}
              className={cn(
                'flex items-center justify-center h-10 w-10 rounded-md text-sm transition-colors touch-manipulation',
                tool.active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
                tool.className
              )}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
