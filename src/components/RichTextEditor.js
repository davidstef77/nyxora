"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

const DEFAULT_PLACEHOLDER = "Scrie conținutul articolului aici...";

const toolbarButtonClasses = "px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-white transition";

function ProductInsertControls({ products = [], onInsert }) {
  const [selectedSlug, setSelectedSlug] = useState("");

  const options = useMemo(() => (
    products.map((p) => ({ slug: p.slug, name: p.name || p.title || p.slug }))
  ), [products]);

  const handleInsert = useCallback(() => {
    console.log('Product insert button clicked, selectedSlug:', selectedSlug);
    if (!selectedSlug) {
      console.log('No selected slug, returning');
      return;
    }
    const product = products.find((p) => p.slug === selectedSlug);
    console.log('Found product:', product);
    if (!product) {
      console.log('Product not found, returning');
      return;
    }
    console.log('Calling onInsert with product:', product);
    onInsert?.(product);
  }, [selectedSlug, onInsert, products]);

  useEffect(() => {
    if (!selectedSlug && options.length) {
      setSelectedSlug(options[0].slug);
    }
  }, [options, selectedSlug]);

  if (!options.length) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <label className="text-xs uppercase tracking-wide text-white/70">Produs recomandat:</label>
      <select
        className="bg-white/10 border border-white/10 rounded-md px-2 py-1 text-white text-sm"
        value={selectedSlug}
        onChange={(ev) => setSelectedSlug(ev.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.slug} value={opt.slug}>{opt.name}</option>
        ))}
      </select>
      <button type="button" className={toolbarButtonClasses} onClick={handleInsert}>
        Adaugă produs la listă
      </button>
    </div>
  );
}

export default function RichTextEditor({ value = "", onChange, products = [], placeholder, onInsertProduct }) {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true }
      }),
      Underline,
      Image,
      Placeholder.configure({
        placeholder: placeholder || DEFAULT_PLACEHOLDER
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    }
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // keep external value in sync if changed (e.g., loading an existing blog)
  useEffect(() => {
    if (!editor || !isMounted) return;
    const currentHTML = editor.getHTML();
    if ((value || "") !== currentHTML) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor, isMounted]);

  const runCommand = useCallback((command) => {
    if (!editor) return;
    command(editor);
  }, [editor]);

  const handleAttachProduct = useCallback((product) => {
    if (!product || !onInsertProduct) return;
    onInsertProduct(product);
  }, [onInsertProduct]);

  const promptForImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Introduceți URL-ul imaginii");
    if (!url) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rich-text-editor">
      <div className="flex flex-wrap gap-2 mb-3">
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().toggleBold().run())}><strong>B</strong></button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().toggleItalic().run())}><em>I</em></button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().toggleUnderline().run())}><span style={{ textDecoration: "underline" }}>U</span></button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().toggleStrike().run())}><span style={{ textDecoration: "line-through" }}>S</span></button>
        <span className="w-px h-6 bg-white/10" />
        {[1, 2, 3].map((level) => (
          <button
            type="button"
            key={`h-${level}`}
            className={toolbarButtonClasses}
            onClick={() => runCommand((ed) => ed.chain().focus().toggleHeading({ level }).run())}
          >
            H{level}
          </button>
        ))}
        <span className="w-px h-6 bg-white/10" />
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().toggleBulletList().run())}>• Lista</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().toggleOrderedList().run())}>1. Lista</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().toggleBlockquote().run())}>❝ Citat</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().setHorizontalRule().run())}>─ Linie</button>
        <span className="w-px h-6 bg-white/10" />
        <button type="button" className={toolbarButtonClasses} onClick={promptForImage}>🖼️ Imagine</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run())}>▦ Tabel</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().addColumnAfter().run())}>+Col</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().addRowAfter().run())}>+Row</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().deleteColumn().run())}>-Col</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().deleteRow().run())}>-Row</button>
        <button type="button" className={toolbarButtonClasses} onClick={() => runCommand((ed) => ed.chain().focus().deleteTable().run())}>Șterge tabel</button>
      </div>

      {onInsertProduct && (
        <div className="mb-3">
          <ProductInsertControls products={products} onInsert={handleAttachProduct} />
          <p className="text-xs text-white/60 mt-1">Produsul selectat va fi adăugat listei dedicate articolului și afișat separat de conținut.</p>
        </div>
      )}

      <div className="rich-text-editor__surface">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
