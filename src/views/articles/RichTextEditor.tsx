import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import CodeBlock from "@tiptap/extension-code-block";
import Heading, { type Level } from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { BubbleMenu } from "@tiptap/react/menus";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code,
  Heading1,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Save,
  Underline as UnderlineIcon,
} from "lucide-react";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export default function RichTextEditor({
  value,
  onChange,
  onSave,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      CodeBlock,
      Placeholder.configure({ placeholder: "Type / for commands..." }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value || "<p>✨ Start writing something amazing...</p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // ✅ update form field on every change
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  const addImage = () => {
    const imageUrl = prompt("Enter image URL");
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
  };

  const setLink = () => {
    const url = prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const applyHeading = (level: number) => {
    editor
      .chain()
      .focus()
      .toggleHeading({ level: level as Level })
      .run();
  };

  // make full height

  return (
    <div className="w-full h-full mx-auto border rounded-xl p-4 shadow-sm bg-white">
      {/* ✅ Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {/* 🔽 Heading Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type={"button"}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Heading1 size={16} /> Heading <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <DropdownMenuItem
                key={level}
                onClick={() => applyHeading(level)}
                className={
                  editor.isActive("heading", { level })
                    ? "bg-gray-100 font-medium"
                    : ""
                }
              >
                H{level}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 🔽 Alignment Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type={"button"}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <AlignLeft size={16} /> Align <ChevronDown size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft size={16} className="mr-2" /> Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter size={16} className="mr-2" /> Center
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight size={16} className="mr-2" /> Right
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
            >
              <AlignJustify size={16} className="mr-2" /> Justify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="h-6" />

        {/* 🔤 Basic text actions */}
        <Button
          type={"button"}
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-gray-200" : ""}
        >
          <Bold size={16} />
        </Button>
        <Button
          type={"button"}
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-gray-200" : ""}
        >
          <Italic size={16} />
        </Button>
        <Button
          type={"button"}
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-gray-200" : ""}
        >
          <UnderlineIcon size={16} />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* 📜 Lists */}
        <Button
          type={"button"}
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-gray-200" : ""}
        >
          <List size={16} />
        </Button>
        <Button
          type={"button"}
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-gray-200" : ""}
        >
          <ListOrdered size={16} />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* 🖼️ Code, Link, Image */}
        <Button
          type={"button"}
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-gray-200" : ""}
        >
          <Code size={16} />
        </Button>
        <Button type={"button"} variant="outline" size="icon" onClick={setLink}>
          <LinkIcon size={16} />
        </Button>
        <Button
          type={"button"}
          variant="outline"
          size="icon"
          onClick={addImage}
        >
          <ImageIcon size={16} />
        </Button>
        <Button type={"button"} variant="outline" size="icon" onClick={onSave}>
          <Save size={16} />
        </Button>
      </div>

      {/* ✅ Inline Bubble Menu for quick actions */}
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "bottom" }}
          className="flex gap-1 bg-white shadow-md p-2 rounded-lg border"
        >
          <Button
            type={"button"}
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-gray-200" : ""}
          >
            <Bold size={16} />
          </Button>
          <Button
            type={"button"}
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-gray-200" : ""}
          >
            <Italic size={16} />
          </Button>
          <Button
            type={"button"}
            size="icon"
            variant="ghost"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? "bg-gray-200" : ""}
          >
            <UnderlineIcon size={16} />
          </Button>
        </BubbleMenu>
      )}

      {/* ✅ Editor */}
      <div
        className="border rounded-lg p-3 min-h-[250px] tiptap focus-within:ring-2 focus-within:ring-gray-300 transition"
        style={{ height: "calc(100% - 50px)" }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
