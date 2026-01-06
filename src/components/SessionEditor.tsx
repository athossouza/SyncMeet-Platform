import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
    Box,
    Button,
    Paper,
    Stack,
    Divider,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material'
import {
    FormatBold as BoldIcon,
    FormatItalic as ItalicIcon,
    FormatListBulleted as ListIcon,
    FormatListNumbered as ListOrderedIcon,
    Title as HeadingIcon
} from '@mui/icons-material'

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
                    style: 'color: #1976d2; text-decoration: underline;', // Basic inline styles for links
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
                style: 'outline: none; min-height: 200px; padding: 16px; color: inherit;', // Basic inline styles
            },
        },
    })

    if (!editor) return null

    return (
        <Paper variant="outlined" sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            bgcolor: '#ffffff', // White document background
            color: '#1e293b', // Slate-800 text
            overflow: 'hidden'
        }}>
            {/* Toolbar */}
            <Box sx={{
                p: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: '#f8fafc', // Slate-50 for toolbar
                color: '#475569' // Slate-600 for icons
            }}>
                <ToggleButtonGroup
                    size="small"
                    aria-label="text formatting"
                    sx={{
                        '& .MuiToggleButton-root': {
                            color: '#64748b', // Slate-500
                            border: '1px solid #e2e8f0', // Slate-200
                            '&.Mui-selected': {
                                bgcolor: '#e2e8f0', // Slate-200
                                color: '#0f172a', // Slate-900
                                '&:hover': {
                                    bgcolor: '#cbd5e1', // Slate-300
                                }
                            },
                            '&:hover': {
                                bgcolor: '#f1f5f9', // Slate-100
                                color: '#334155', // Slate-700
                            }
                        }
                    }}
                >
                    <ToggleButton
                        value="bold"
                        selected={editor.isActive('bold')}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        aria-label="bold"
                    >
                        <BoldIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                        value="italic"
                        selected={editor.isActive('italic')}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        aria-label="italic"
                    >
                        <ItalicIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                        value="heading"
                        selected={editor.isActive('heading', { level: 3 })}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        aria-label="heading"
                    >
                        <HeadingIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                        value="bulletList"
                        selected={editor.isActive('bulletList')}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        aria-label="bullet list"
                    >
                        <ListIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton
                        value="orderedList"
                        selected={editor.isActive('orderedList')}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        aria-label="ordered list"
                    >
                        <ListOrderedIcon fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Editor Area */}
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {/* 
                   Document-like typography styles
                 */}
                <Box sx={{
                    p: 3,
                    minHeight: '300px',
                    typography: 'body1',
                    '& *': { color: 'inherit !important' }, // Force distinct color
                    '& h1, & h2, & h3, & h4, & h5, & h6': { color: '#0f172a !important', my: 2, fontWeight: 700 }, // Slate-900 headers
                    '& p': { mb: 2, lineHeight: 1.7 },
                    '& ul, & ol': { pl: 3, mb: 2 },
                    '& li': { mb: 0.5 },
                    '& strong, & b': { fontWeight: 'bold', color: '#0f172a !important' },
                    '& a': { color: '#2563eb !important', textDecoration: 'underline' }, // Blue-600 links
                    '& blockquote': { borderLeft: '4px solid #cbd5e1', pl: 2, color: '#475569 !important', fontStyle: 'italic' },
                    // Editor specific overrides to ensure it behaves well
                    '& .ProseMirror': { outline: 'none', minHeight: '100%' }
                }}>
                    <EditorContent editor={editor} />
                </Box>
            </Box>

            {/* Actions */}
            {!hideActions && (
                <>
                    <Divider />
                    <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ p: 2, bgcolor: '#f8fafc' }}>
                        <Button
                            variant="text"
                            onClick={onCancel}
                            sx={{ color: '#64748b', '&:hover': { color: '#0f172a', bgcolor: '#e2e8f0' } }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => onSave?.(editor.getHTML())}
                            sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }} // Slate-900 button
                        >
                            Salvar Alterações
                        </Button>
                    </Stack>
                </>
            )}
        </Paper>
    )
}
