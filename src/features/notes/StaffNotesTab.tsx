import { useState } from 'react';
import { Pin, Trash2, MessageSquare } from 'lucide-react';
import { useStaffNotes, useAddNote, useTogglePinNote, useDeleteNote } from '@/hooks/useStaffNotes';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { formatRelative, getInitials } from '@/lib/utils';
import { Pagination } from '@/components/ui/Pagination';

export function StaffNotesTab({ clientId }: { clientId: string }) {
  const [content, setContent] = useState('');
  const { data: notes = [], isLoading } = useStaffNotes(clientId);
  const addNote = useAddNote();
  const togglePin = useTogglePinNote();
  const deleteNote = useDeleteNote();
  const { success, error } = useToast();

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(notes.length / itemsPerPage);
  const paginatedNotes = notes.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  async function handleAdd() {
    if (!content.trim()) return;
    try {
      await addNote.mutateAsync({ clientId, content: content.trim() });
      setContent('');
      success('Note added');
    } catch (e: any) {
      error('Failed to add note', e.message);
    }
  }

  return (
    <div className="space-y-4">
      {/* New note input */}
      <div className="glass-card p-4 space-y-3">
        <Textarea
          label="Add a Note"
          placeholder="Write a note about this client — goals, observations, or anything relevant…"
          rows={3}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            id="add-note-btn"
            size="sm"
            onClick={handleAdd}
            loading={addNote.isPending}
            disabled={!content.trim()}
          >
            Add Note
          </Button>
        </div>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array(2).fill(0).map((_, i) => <div key={i} className="glass-card h-24" />)}
        </div>
      ) : notes.length === 0 ? (
        <Card><CardContent className="text-center py-12">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No notes yet</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedNotes.map(note => (
              <div
                key={note.id}
                className={`glass-card p-4 ${note.is_pinned ? 'border-amber-500/30' : ''}`}
              >
                {note.is_pinned && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-medium mb-2">
                    <Pin className="w-3 h-3" /> Pinned
                  </div>
                )}
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-white">
                      {getInitials((note.author as any)?.display_name || 'U')}
                    </div>
                    <span>{(note.author as any)?.display_name}</span>
                    <span>·</span>
                    <span>{formatRelative(note.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin.mutate({ id: note.id, is_pinned: !note.is_pinned, clientId })}
                      className={`p-1.5 rounded-lg transition-colors ${note.is_pinned ? 'text-amber-400 hover:text-amber-300' : 'text-slate-600 hover:text-amber-400'}`}
                      title={note.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this note?')) deleteNote.mutate({ id: note.id, clientId });
                      }}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

    </div>
  );
}
