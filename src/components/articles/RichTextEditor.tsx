import { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconList,
  IconListNumbers,
  IconLink,
  IconPhoto,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconQuote,
} from '@tabler/icons-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = 'Write your article content here...',
  minHeight = '400px'
}: RichTextEditorProps) => {
  const [preview, setPreview] = useState(false);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.substring(0, start) + text + value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleImageInsert = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      insertAtCursor(`![Alt text](${url})\n\n`);
    }
  };

  const handleLinkInsert = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      insertMarkdown('[', `](${url})`);
    }
  };

  const renderPreview = () => {
    // Simple HTML conversion (for production, use a proper markdown parser like react-markdown)
    let html = value
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" style="max-width: 100%;" />')
      .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br />');
    
    html = '<p>' + html + '</p>';
    
    return <div className="prose max-w-none p-4" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted p-2 border-b flex flex-wrap gap-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertAtCursor('# ')}
          title="Heading 1"
        >
          <IconH1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertAtCursor('## ')}
          title="Heading 2"
        >
          <IconH2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertAtCursor('### ')}
          title="Heading 3"
        >
          <IconH3 className="h-4 w-4" />
        </Button>
        
        <div className="w-px bg-border mx-1" />
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('**', '**')}
          title="Bold"
        >
          <IconBold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('*', '*')}
          title="Italic"
        >
          <IconItalic className="h-4 w-4" />
        </Button>
        
        <div className="w-px bg-border mx-1" />
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertAtCursor('- ')}
          title="Bullet List"
        >
          <IconList className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertAtCursor('1. ')}
          title="Numbered List"
        >
          <IconListNumbers className="h-4 w-4" />
        </Button>
        
        <div className="w-px bg-border mx-1" />
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleLinkInsert}
          title="Insert Link"
        >
          <IconLink className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleImageInsert}
          title="Insert Image"
        >
          <IconPhoto className="h-4 w-4" />
        </Button>
        
        <div className="w-px bg-border mx-1" />
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertAtCursor('> ')}
          title="Quote"
        >
          <IconQuote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => insertMarkdown('`', '`')}
          title="Code"
        >
          <IconCode className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />
        
        <Button
          type="button"
          size="sm"
          variant={preview ? 'default' : 'ghost'}
          onClick={() => setPreview(!preview)}
        >
          {preview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {/* Editor / Preview Area */}
      {preview ? (
        <div className="min-h-[400px] bg-background">
          {renderPreview()}
        </div>
      ) : (
        <Textarea
          id="editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 rounded-none focus-visible:ring-0 font-mono text-sm resize-none"
          style={{ minHeight }}
          rows={20}
        />
      )}

      {/* Helper Text */}
      <div className="bg-muted p-2 text-xs text-muted-foreground border-t">
        <p>
          <strong>Markdown shortcuts:</strong> # Heading, **bold**, *italic*, [link](url), ![image](url), `code`, &gt; quote
        </p>
      </div>
    </div>
  );
};

export default RichTextEditor;

