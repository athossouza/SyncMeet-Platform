import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Button } from './ui/button'
import { Bold, Italic, List, ListOrdered, Heading3 } from 'lucide-react'

interface SessionEditorProps {
    content: string
    onSave?: (html: string) => void
    onCancel?: () => void
    onChange?: (html: string) => void
    hideActions?: boolean
}

export default function SessionEditor({ content, onSave, onCancel, onChange, hideActions = false }: SessionEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 hover:text-blue-500 underline',
                },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getHTML())
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate prose-lg focus:outline-none max-w-none min-h-[200px] text-slate-900',
            },
        },
    })

    if (!editor) return null

    return (
        <div className="w-full h-full flex flex-col gap-4 border rounded-md border-input bg-white p-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-2 border-b border-blue-100/50">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}
                    type="button"
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}
                    type="button"
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}
                    type="button"
                >
                    <Heading3 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-slate-200 mx-1" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}
                    type="button"
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-blue-100 text-blue-700' : 'text-slate-600'}
                    type="button"
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto max-h-[300px]">
                <EditorContent editor={editor} />
            </div>

            {/* Actions */}
            {!hideActions && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-blue-100/50">
                    <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-700">
                        Cancelar
                    </Button>
                    <Button onClick={() => onSave?.(editor.getHTML())} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                        Salvar Alterações
                    </Button>
                </div>
            )}
        </div>
    )
}
