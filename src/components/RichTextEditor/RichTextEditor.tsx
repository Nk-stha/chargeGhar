"use client";

import React, { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiLink,
  FiCode,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiType,
  FiMinus,
} from "react-icons/fi";
import {
  LuStrikethrough,
  LuListOrdered,
  LuTextQuote,
  LuHeading1,
  LuHeading2,
  LuHeading3,
} from "react-icons/lu";
import styles from "./RichTextEditor.module.css";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  error?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  error = false,
}: RichTextEditorProps) {
  const [showHtml, setShowHtml] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.proseMirror,
      },
    },
  });

  const handleLinkInsert = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl || "https://");

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }, [editor]);

  if (!editor) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span>Loading editor...</span>
      </div>
    );
  }

  return (
    <div
      className={`${styles.editorWrapper} ${error ? styles.editorError : ""}`}
    >
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Text Style Group */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("bold") ? styles.active : ""}`}
            title="Bold"
          >
            <FiBold />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("italic") ? styles.active : ""}`}
            title="Italic"
          >
            <FiItalic />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("underline") ? styles.active : ""}`}
            title="Underline"
          >
            <FiUnderline />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("strike") ? styles.active : ""}`}
            title="Strikethrough"
          >
            <LuStrikethrough />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Heading Group */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("paragraph") && !editor.isActive("heading") ? styles.active : ""}`}
            title="Paragraph"
          >
            <FiType />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 1 }) ? styles.active : ""}`}
            title="Heading 1"
          >
            <LuHeading1 />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 2 }) ? styles.active : ""}`}
            title="Heading 2"
          >
            <LuHeading2 />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={`${styles.toolbarBtn} ${editor.isActive("heading", { level: 3 }) ? styles.active : ""}`}
            title="Heading 3"
          >
            <LuHeading3 />
          </button>
        </div>

        <div className={styles.divider} />

        {/* List & Block Group */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("bulletList") ? styles.active : ""}`}
            title="Bullet List"
          >
            <FiList />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("orderedList") ? styles.active : ""}`}
            title="Ordered List"
          >
            <LuListOrdered />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("blockquote") ? styles.active : ""}`}
            title="Blockquote"
          >
            <LuTextQuote />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`${styles.toolbarBtn} ${editor.isActive("codeBlock") ? styles.active : ""}`}
            title="Code Block"
          >
            <FiCode />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={styles.toolbarBtn}
            title="Horizontal Rule"
          >
            <FiMinus />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Alignment Group */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().setTextAlign("left").run()
            }
            className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "left" }) ? styles.active : ""}`}
            title="Align Left"
          >
            <FiAlignLeft />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
            className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "center" }) ? styles.active : ""}`}
            title="Align Center"
          >
            <FiAlignCenter />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().setTextAlign("right").run()
            }
            className={`${styles.toolbarBtn} ${editor.isActive({ textAlign: "right" }) ? styles.active : ""}`}
            title="Align Right"
          >
            <FiAlignRight />
          </button>
        </div>

        <div className={styles.divider} />

        {/* Link & Utility Group */}
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={handleLinkInsert}
            className={`${styles.toolbarBtn} ${editor.isActive("link") ? styles.active : ""}`}
            title="Insert Link"
          >
            <FiLink />
          </button>
        </div>

        {/* Right side: Undo/Redo + HTML toggle */}
        <div className={styles.toolbarRight}>
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={styles.toolbarBtn}
            title="Undo"
          >
            <FiCornerUpLeft />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={styles.toolbarBtn}
            title="Redo"
          >
            <FiCornerUpRight />
          </button>
          <button
            type="button"
            onClick={() => setShowHtml(!showHtml)}
            className={`${styles.toolbarBtn} ${styles.htmlToggle} ${showHtml ? styles.active : ""}`}
            title="Toggle HTML Preview"
          >
            {"</>"}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className={styles.editorContent} />

      {/* HTML Preview */}
      {showHtml && (
        <div className={styles.htmlPreview}>
          <div className={styles.htmlPreviewHeader}>
            <span>HTML Output</span>
          </div>
          <pre className={styles.htmlPreviewCode}>
            <code>{editor.getHTML()}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
