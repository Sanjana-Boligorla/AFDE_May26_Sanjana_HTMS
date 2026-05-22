import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Filter, X, Eye, Trash2, RefreshCw, AlertTriangle, PlusCircle, ChevronDown } from 'lucide-react'
import { getTickets, searchTickets, deleteTicket } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'
import { Toast, useToast } from '../components/ui/Toast'

const CATEGORIES = ['VPN Issue','Password Reset','Software Installation','Laptop Issue','Email Access','Network Connectivity','Hardware Request']
const STATUSES   = ['Open','In Progress','Resolved','Closed']
const PRIORITIES = ['Low','Medium','High','Critical']

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none input-field pr-8 min-w-36 text-slate-600"
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

export default function TicketList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast, show: showToast, hide: hideToast } = useToast()
  const searchRef = useRef(null)

  const [tickets,  setTickets]  = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [deleting, setDeleting] = useState(null)

  const [q,        setQ]        = useState(searchParams.get('q') || '')
  const [status,   setStatus]   = useState(searchParams.get('status') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [priority, setPriority] = useState(searchParams.get('priority') || '')

  const hasFilters = q || status || category || priority

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let data
      if (q.trim()) {
        const res = await searchTickets(q.trim())
        let results = res.data.tickets
        if (status)   results = results.filter(t => t.status === status)
        if (category) results = results.filter(t => t.issue_category === category)
        if (priority) results = results.filter(t => t.priority === priority)
        data = { tickets: results, total: results.length }
      } else {
        const params = {}
        if (status)   params.status   = status
        if (category) params.category = category
        if (priority) params.priority = priority
        const res = await getTickets(params)
        data = res.data
      }
      setTickets(data.tickets)
      setTotal(data.total)
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [q, status, category, priority])

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(fetchData, q ? 400 : 0)
    return () => clearTimeout(t)
  }, [fetchData, q])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm(`Delete ticket #${id}? This action cannot be undone.`)) return
    setDeleting(id)
    try {
      await deleteTicket(id)
      setTickets(prev => prev.filter(t => t.id !== id))
      setTotal(prev => prev - 1)
      showToast('Ticket deleted successfully.')
    } catch {
      showToast('Failed to delete ticket.', 'error')
    } finally {
      setDeleting(null)
    }
  }

  const clearFilters = () => {
    setQ(''); setStatus(''); setCategory(''); setPriority('')
    searchRef.current && (searchRef.current.value = '')
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <Toast toast={toast} onClose={hideToast} />

      {/* Filter bar */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search tickets…"
              defaultValue={q}
              onChange={e => setQ(e.target.value)}
              className="input-field pl-9"
            />
          </div>
          <FilterSelect value={status}   onChange={setStatus}   options={STATUSES}   placeholder="All Statuses" />
          <FilterSelect value={category} onChange={setCategory} options={CATEGORIES} placeholder="All Categories" />
          <FilterSelect value={priority} onChange={setPriority} options={PRIORITIES} placeholder="All Priorities" />
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary gap-1 text-slate-500">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
          <button onClick={fetchData} className="btn-secondary p-2" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : 'text-slate-400'}`} />
          </button>
          <button onClick={() => navigate('/tickets/new')} className="btn-primary ml-auto">
            <PlusCircle className="w-4 h-4" /> New Ticket
          </button>
        </div>
      </div>

      {/* Results summary */}
      {!loading && !error && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{tickets.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{total}</span> ticket{total !== 1 ? 's' : ''}
            {hasFilters && <span className="text-indigo-600"> (filtered)</span>}
          </p>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <p className="text-slate-600 font-medium">{error}</p>
            <button onClick={fetchData} className="btn-secondary">Retry</button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <Filter className="w-10 h-10 text-slate-200" />
            <p className="text-slate-500 font-medium">No tickets found</p>
            {hasFilters && <button onClick={clearFilters} className="btn-secondary text-sm">Clear filters</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-slate-400">#{ticket.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{ticket.employee_name}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-slate-500">{ticket.department}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded-md">{ticket.issue_category}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-slate-500 text-xs">{formatDate(ticket.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/tickets/${ticket.id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => handleDelete(ticket.id, e)}
                          disabled={deleting === ticket.id}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          {deleting === ticket.id
                            ? <RefreshCw className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
