import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { cn } from '@/lib/utils';

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
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TaskList,
      TaskItem,
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
        class: 'prose dark:prose-invert max-w-none focus:outline-none p-4',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('rounded-lg border bg-background', className)}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} placeholder={placeholder} className="min-h-[300px]" />
    </div>
  );
}

const EditorToolbar = ({ editor }: { editor: any }) => {
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

  return (
    <div className="border-b p-2 flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('bold') ? 'bg-accent' : ''
        )}
        title="Bold"
      >
        <span className="font-bold">B</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('italic') ? 'bg-accent' : ''
        )}
        title="Italic"
      >
        <span className="italic">I</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('underline') ? 'bg-accent' : ''
        )}
        title="Underline"
      >
        <span className="underline">U</span>
      </button>
      <div className="border-l border-border mx-1"></div>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''
        )}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''
        )}
        title="Heading 2"
      >
        H2
      </button>
      <div className="border-l border-border mx-1"></div>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('bulletList') ? 'bg-accent' : ''
        )}
        title="Bullet List"
      >
        •
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('orderedList') ? 'bg-accent' : ''
        )}
        title="Ordered List"
      >
        1.
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('taskList') ? 'bg-accent' : ''
        )}
        title="Task List"
      >
        ☑
      </button>
      <div className="border-l border-border mx-1"></div>
      <button
        onClick={setLink}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('link') ? 'bg-accent' : ''
        )}
        title="Add Link"
      >
        🔗
      </button>
      <button
        onClick={addImage}
        className="p-2 rounded hover:bg-accent"
        title="Add Image"
      >
        🖼️
      </button>
      <div className="border-l border-border mx-1"></div>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''
        )}
        title="Align Left"
      >
        ≡
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''
        )}
        title="Align Center"
      >
        ≡
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''
        )}
        title="Align Right"
      >
        ≡
      </button>
      <div className="border-l border-border mx-1"></div>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={cn(
          'p-2 rounded hover:bg-accent',
          editor.isActive('highlight') ? 'bg-accent' : ''
        )}
        title="Highlight"
      >
        🖍️
      </button>
      <input
        type="color"
        onInput={(event: any) =>
          editor.chain().focus().setColor(event.target.value).run()
        }
        value={editor.getAttributes('textStyle').color || '#000000'}
        className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer"
        title="Text Color"
      />
    </div>
  );
};
