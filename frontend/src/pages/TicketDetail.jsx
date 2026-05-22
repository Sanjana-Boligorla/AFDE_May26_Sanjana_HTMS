import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit2, Trash2, Save, X, RefreshCw, MessageSquare,
  AlertTriangle, User, Building, Tag, Calendar, ChevronDown, Send, Clock
} from 'lucide-react'
import { getTicket, updateTicket, deleteTicket, addComment, deleteComment } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import { Toast, useToast } from '../components/ui/Toast'

const CATEGORIES = ['VPN Issue','Password Reset','Software Installation','Laptop Issue','Email Access','Network Connectivity','Hardware Request']
const DEPARTMENTS = ['Engineering','HR','Finance','Operations','Marketing','Legal','Sales','IT','Product']
const STATUSES    = ['Open','In Progress','Resolved','Closed']
const PRIORITIES  = ['Low','Medium','High','Critical']

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
function formatTime(d) {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
function timeAgo(d) {
  const sec  = Math.floor((Date.now() - new Date(d)) / 1000)
  if (sec < 60)   return 'just now'
  if (sec < 3600) return `${Math.floor(sec/60)}m ago`
  if (sec < 86400)return `${Math.floor(sec/3600)}h ago`
  return `${Math.floor(sec/86400)}d ago`
}

export default function TicketDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { toast, show: showToast, hide: hideToast } = useToast()

  const [ticket,    setTicket]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [editing,   setEditing]   = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)

  // Quick-update (status + resolution notes)
  const [quickStatus, setQuickStatus]   = useState('')
  const [quickNotes,  setQuickNotes]    = useState('')
  const [savingQuick, setSavingQuick]   = useState(false)

  // Edit form
  const [editForm, setEditForm] = useState({})

  // Comments
  const [commentAuthor, setCommentAuthor] = useState('')
  const [commentText,   setCommentText]   = useState('')
  const [addingComment, setAddingComment] = useState(false)

  const loadTicket = async () => {
    setLoading(true); setError(null)
    try {
      const { data } = await getTicket(id)
      setTicket(data)
      setQuickStatus(data.status)
      setQuickNotes(data.resolution_notes || '')
      setEditForm({
        employee_name: data.employee_name,
        department:    data.department,
        issue_category:data.issue_category,
        description:   data.description,
        priority:      data.priority,
      })
    } catch (err) {
      setError(err?.response?.data?.detail || 'Ticket not found.')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadTicket() }, [id])

  const handleQuickSave = async () => {
    setSavingQuick(true)
    try {
      const { data } = await updateTicket(id, { status: quickStatus, resolution_notes: quickNotes })
      setTicket(prev => ({ ...prev, ...data }))
      showToast('Ticket updated successfully.')
    } catch { showToast('Failed to update ticket.', 'error') }
    finally { setSavingQuick(false) }
  }

  const handleEditSave = async () => {
    setSaving(true)
    try {
      const { data } = await updateTicket(id, editForm)
      setTicket(prev => ({ ...prev, ...data }))
      setEditing(false)
      showToast('Ticket details updated.')
    } catch { showToast('Failed to save changes.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ticket #${id}?`)) return
    setDeleting(true)
    try {
      await deleteTicket(id)
      navigate('/tickets', { replace: true })
    } catch { showToast('Failed to delete ticket.', 'error'); setDeleting(false) }
  }

  const handleAddComment = async () => {
    if (!commentAuthor.trim() || !commentText.trim()) {
      showToast('Please fill in both name and comment.', 'warning'); return
    }
    setAddingComment(true)
    try {
      const { data: newComment } = await addComment(id, { author: commentAuthor, comment_text: commentText })
      setTicket(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }))
      setCommentAuthor(''); setCommentText('')
      showToast('Comment added.')
    } catch { showToast('Failed to add comment.', 'error') }
    finally { setAddingComment(false) }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return
    try {
      await deleteComment(id, commentId)
      setTicket(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentId) }))
      showToast('Comment deleted.')
    } catch { showToast('Failed to delete comment.', 'error') }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" /></div>
  if (error)   return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertTriangle className="w-10 h-10 text-red-400" />
      <p className="text-slate-700 font-medium">{error}</p>
      <button onClick={() => navigate('/tickets')} className="btn-secondary">Back to Tickets</button>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Toast toast={toast} onClose={hideToast} />

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/tickets')} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(!editing)} className={editing ? 'btn-secondary text-indigo-600' : 'btn-secondary'}>
            {editing ? <><X className="w-4 h-4" /> Cancel Edit</> : <><Edit2 className="w-4 h-4" /> Edit Details</>}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger">
            {deleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">#{ticket.id}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">{ticket.issue_category}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{ticket.employee_name}</span>
              <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5" />{ticket.department}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Created {formatDate(ticket.created_at)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Updated {timeAgo(ticket.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form (inline, shown when editing) */}
      {editing && (
        <div className="card p-5 border-indigo-200 border-2">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Edit2 className="w-4 h-4 text-indigo-500" />Edit Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Employee Name</label>
              <input className="input-field" value={editForm.employee_name} onChange={e => setEditForm(p => ({...p, employee_name: e.target.value}))} />
            </div>
            <div>
              <label className="label">Department</label>
              <div className="relative">
                <select className="input-field appearance-none pr-8" value={editForm.department} onChange={e => setEditForm(p => ({...p, department: e.target.value}))}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label">Category</label>
              <div className="relative">
                <select className="input-field appearance-none pr-8" value={editForm.issue_category} onChange={e => setEditForm(p => ({...p, issue_category: e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label">Priority</label>
              <div className="relative">
                <select className="input-field appearance-none pr-8" value={editForm.priority} onChange={e => setEditForm(p => ({...p, priority: e.target.value}))}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea rows={3} className="input-field resize-none" value={editForm.description} onChange={e => setEditForm(p => ({...p, description: e.target.value}))} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={handleEditSave} disabled={saving} className="btn-primary">
              {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
          </div>
        </div>
      )}

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: description + resolution notes */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-slate-400" />Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {ticket.resolution_notes && (
            <div className="card p-5 border-green-200 bg-green-50/50">
              <h3 className="font-semibold text-green-800 mb-3">✓ Resolution Notes</h3>
              <p className="text-green-700 text-sm leading-relaxed whitespace-pre-wrap">{ticket.resolution_notes}</p>
            </div>
          )}
        </div>

        {/* Right: quick-update panel */}
        <div className="card p-5 h-fit">
          <h3 className="font-semibold text-slate-700 mb-4">Manage Ticket</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Status</label>
              <div className="relative">
                <select className="input-field appearance-none pr-8" value={quickStatus} onChange={e => setQuickStatus(e.target.value)}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="label">Resolution Notes</label>
              <textarea
                rows={4}
                className="input-field resize-none text-sm"
                placeholder="Add resolution notes…"
                value={quickNotes}
                onChange={e => setQuickNotes(e.target.value)}
              />
            </div>
            <button onClick={handleQuickSave} disabled={savingQuick} className="btn-primary w-full justify-center">
              {savingQuick ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Changes</>}
            </button>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-slate-700">Comments</h3>
          <span className="ml-1 text-xs bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
            {ticket.comments?.length || 0}
          </span>
        </div>

        {/* Comment list */}
        <div className="divide-y divide-slate-50">
          {(!ticket.comments || ticket.comments.length === 0) ? (
            <div className="px-5 py-8 text-center text-slate-400 text-sm">No comments yet. Be the first to add one.</div>
          ) : (
            ticket.comments.map(c => (
              <div key={c.id} className="px-5 py-4 group hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shrink-0">
                      {c.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-800">{c.author}</span>
                        <span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span>
                        <span className="text-xs text-slate-300">· {formatDate(c.created_at)} at {formatTime(c.created_at)}</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{c.comment_text}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 rounded transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add comment */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Add Comment</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name"
              value={commentAuthor}
              onChange={e => setCommentAuthor(e.target.value)}
              className="input-field text-sm"
            />
            <textarea
              rows={2}
              placeholder="Write a comment…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="input-field resize-none text-sm"
            />
            <div className="flex justify-end">
              <button onClick={handleAddComment} disabled={addingComment} className="btn-primary">
                {addingComment ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Posting…</> : <><Send className="w-4 h-4" />Post Comment</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
