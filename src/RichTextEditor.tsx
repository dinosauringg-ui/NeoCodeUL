import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextareaNode } from './TextareaExtension';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HexColorPicker } from 'react-colorful';
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link2, Image as ImageIcon, Palette, Table as TableIcon, Trash2, Rows, Columns, Eye, Columns2, Code, X } from 'lucide-react';

export default function RichTextEditor({ value, onChange, darkMode }: { value: string, onChange: (val: string) => void, darkMode: boolean }) {
  const [isClient, setIsClient] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'visual' | 'html' | 'split'>('split');
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => { 
    setIsClient(true); 
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextareaNode,
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full border border-stone-300 dark:border-stone-700 my-2',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-stone-300 dark:border-stone-700',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-stone-300 dark:border-stone-700 px-4 py-2 font-bold bg-stone-100 dark:bg-stone-800',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-stone-300 dark:border-stone-700 px-4 py-2',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      let html = editor.getHTML();
      // Replace some tags with more basic ones for neopets
      html = html.replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>');
      html = html.replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>');
      // For images, we just leave them as standard <img>
      onChange(html);
    },
  });

  // Re-sync value from outside if it changes completely (e.g. clear)
  React.useEffect(() => {
    if (editor) {
      if (value === '') {
        editor.commands.setContent('');
      } else {
        const currentHtml = editor.getHTML().replace(/<strong>/g, '<b>').replace(/<\/strong>/g, '</b>').replace(/<em>/g, '<i>').replace(/<\/em>/g, '</i>');
        if (value !== currentHtml && document.activeElement?.id !== 'rich-text-editor-content') {
           editor.commands.setContent(value, { emitUpdate: false });
        }
      }
    }
  }, [value, editor]);

  if (!isClient || !editor) return null;

  const btnClass = `p-1.5 rounded-lg transition-all ${darkMode ? 'text-stone-400 hover:bg-stone-800 hover:text-white' : 'text-stone-500 hover:bg-stone-200 hover:text-stone-900'}`;
  const activeClass = darkMode ? 'bg-stone-800 text-white shadow-inner' : 'bg-red-100 text-red-900 shadow-inner';

  return (
    <div className={`border rounded-xl flex flex-col overflow-hidden transition-colors ${darkMode ? 'border-stone-800/50 bg-stone-950/50' : 'border-stone-200/50 bg-white/60'} backdrop-blur-md shadow-inner`}>
      <div className={`flex flex-wrap gap-1 p-2 border-b ${darkMode ? 'border-stone-800/50 bg-stone-900/30' : 'border-stone-200/50 bg-stone-50/50'}`}>
        
        {viewMode !== 'html' && (
          <div className="flex flex-wrap gap-1 items-center">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={`${btnClass} ${editor.isActive('bold') ? activeClass : ''}`} title="Bold"><Bold size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`${btnClass} ${editor.isActive('italic') ? activeClass : ''}`} title="Italic"><Italic size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`${btnClass} ${editor.isActive('underline') ? activeClass : ''}`} title="Underline"><UnderlineIcon size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`${btnClass} ${editor.isActive('strike') ? activeClass : ''}`} title="Strikethrough"><Strikethrough size={14} /></button>
            <div className={`w-px h-6 my-auto mx-1 ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`} />
            
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`${btnClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : ''}`} title="Heading"><Heading1 size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`${btnClass} ${editor.isActive('bulletList') ? activeClass : ''}`} title="Bullet List"><List size={14} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`${btnClass} ${editor.isActive('orderedList') ? activeClass : ''}`} title="Numbered List"><ListOrdered size={14} /></button>
            <div className={`w-px h-6 my-auto mx-1 hidden sm:block ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`} />
            
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`${btnClass} hidden sm:flex ${editor.isActive({ textAlign: 'left' }) ? activeClass : ''}`} title="Align Left"><AlignLeft size={14} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`${btnClass} hidden sm:flex ${editor.isActive({ textAlign: 'center' }) ? activeClass : ''}`} title="Align Center"><AlignCenter size={14} /></button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`${btnClass} hidden sm:flex ${editor.isActive({ textAlign: 'right' }) ? activeClass : ''}`} title="Align Right"><AlignRight size={14} /></button>
            <div className={`w-px h-6 my-auto mx-1 ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`} />
            
            <button onClick={() => {
              const url = window.prompt('URL');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }} className={`${btnClass} ${editor.isActive('link') ? activeClass : ''}`} title="Add Link"><Link2 size={14} /></button>
            <button onClick={() => {
              const url = window.prompt('Image URL');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }} className={`${btnClass}`} title="Add Image"><ImageIcon size={14} /></button>
            <div className={`w-px h-6 my-auto mx-1 ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`} />
            
            <div className="relative flex items-center">
              <button 
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`${btnClass} w-6 h-6 p-0.5 flex items-center justify-center`} 
                title="Text Color"
              >
                <div className="w-full h-full rounded shadow-inner border border-stone-200/20" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
              </button>
              {showColorPicker && mounted && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onPointerDown={(e) => { e.preventDefault(); setShowColorPicker(false); }} />
                  <div
                    onPointerDown={(e) => e.preventDefault()}
                    className={`relative z-10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border ${darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'} animate-in zoom-in-95 duration-200`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Text Color</span>
                      <button onClick={() => setShowColorPicker(false)} className="text-stone-400 hover:text-red-500 transition-colors p-1 bg-stone-100 hover:bg-red-50 rounded-full">
                        <X size={12} />
                      </button>
                    </div>
                    <HexColorPicker color={editor.getAttributes('textStyle').color || '#000000'} onChange={(color) => editor.commands.setColor(color)} />
                    <div className={`mt-4 pt-3 border-t flex gap-2 ${darkMode ? 'border-stone-800' : 'border-stone-100'}`}>
                      <input 
                        type="text"
                        value={editor.getAttributes('textStyle').color || '#000000'}
                        onChange={(e) => editor.commands.setColor(e.target.value)}
                        className={`flex-1 text-[11px] font-mono p-2 rounded-lg border outline-none text-center uppercase tracking-wider ${darkMode ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
                      />
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
            <div className={`w-px h-6 my-auto mx-1 ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`} />
            
            <button onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: false }).run()} className={`${btnClass}`} title="Insert Table">
              <TableIcon size={14} />
            </button>
          </div>
        )}

        <div className={`flex ${darkMode ? 'bg-black/40 shadow-inner' : 'bg-black/5'} p-0.5 rounded-lg ml-auto`}>
          <button onClick={() => setViewMode('visual')} className={`${btnClass} px-2 flex items-center gap-1.5 ${viewMode === 'visual' ? activeClass : ''}`} title="Visual View">
            <Eye size={12} /> <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Visual</span>
          </button>
          <button onClick={() => setViewMode('split')} className={`${btnClass} px-2 flex items-center gap-1.5 ${viewMode === 'split' ? activeClass : ''}`} title="Split View">
            <Columns2 size={12} /> <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Split</span>
          </button>
          <button onClick={() => setViewMode('html')} className={`${btnClass} px-2 flex items-center gap-1.5 ${viewMode === 'html' ? activeClass : ''}`} title="Code View">
            <Code size={12} /> <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Code</span>
          </button>
        </div>
      </div>
      
      {viewMode !== 'html' && editor.isActive('table') && (
        <div className={`flex flex-wrap gap-1 p-2 border-b text-[10px] items-center ${darkMode ? 'border-stone-800/50 bg-stone-800/30' : 'border-stone-200/50 bg-stone-100/50'}`}>
          <span className={`font-black uppercase tracking-widest mx-1 opacity-50 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>Table Settings</span>
          <button onClick={() => editor.chain().focus().addColumnBefore().run()} className={`${btnClass} flex items-center gap-1`}><Columns size={12} /> +Col Before</button>
          <button onClick={() => editor.chain().focus().addColumnAfter().run()} className={`${btnClass} flex items-center gap-1`}><Columns size={12} /> +Col After</button>
          <button onClick={() => editor.chain().focus().deleteColumn().run()} className={`${btnClass} flex items-center gap-1 text-red-500`}><Trash2 size={12} /> Col</button>
          <div className={`w-px h-4 my-auto mx-1 ${darkMode ? 'bg-stone-700' : 'bg-stone-300'}`} />
          <button onClick={() => editor.chain().focus().addRowBefore().run()} className={`${btnClass} flex items-center gap-1`}><Rows size={12} /> +Row Before</button>
          <button onClick={() => editor.chain().focus().addRowAfter().run()} className={`${btnClass} flex items-center gap-1`}><Rows size={12} /> +Row After</button>
          <button onClick={() => editor.chain().focus().deleteRow().run()} className={`${btnClass} flex items-center gap-1 text-red-500`}><Trash2 size={12} /> Row</button>
          <div className={`w-px h-4 my-auto mx-1 ${darkMode ? 'bg-stone-700' : 'bg-stone-300'}`} />
          <button onClick={() => editor.chain().focus().deleteTable().run()} className={`${btnClass} flex items-center gap-1 text-red-500`}><Trash2 size={12} /> Table</button>
        </div>
      )}

      <div className={`flex flex-col md:flex-row min-h-[250px] divide-y md:divide-y-0 md:divide-x ${darkMode ? 'divide-stone-800/50' : 'divide-stone-200/50'}`}>
        {viewMode !== 'html' && (
          <div id="rich-text-editor-content" className={`flex-1 ${viewMode === 'split' ? 'w-full md:w-1/2' : 'w-full'}`}>
            <EditorContent 
              editor={editor} 
              className={`p-4 outline-none prose prose-sm max-w-none ${darkMode ? 'prose-invert prose-stone' : 'prose-stone'} [&_.ProseMirror]:min-h-[250px] [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:my-1 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-stone-300 [&_td]:dark:border-stone-700 [&_th]:border [&_th]:border-stone-300 [&_th]:dark:border-stone-700 [&_td]:p-2 [&_th]:p-2`} 
            />
          </div>
        )}
        
        {viewMode !== 'visual' && (
          <textarea 
            id="html-editor-textarea"
            value={value}
            onChange={(e) => {
               onChange(e.target.value);
            }}
            className={`flex-1 p-4 font-mono text-[10px] resize-none outline-none leading-relaxed ${viewMode === 'split' ? 'w-full md:w-1/2 border-t md:border-t-0' : 'w-full'} ${darkMode ? 'bg-stone-950/30 text-stone-300' : 'bg-stone-50/50 text-stone-700'}`}
            placeholder="Write raw HTML here..."
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
