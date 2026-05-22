import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, Eye, AlertTriangle } from 'lucide-react'
import { searchTickets } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SearchPage() {
  const navigate     = useNavigate()
  const inputRef     = useRef(null)
  const [q,         setQ]         = useState('')
  const [results,   setResults]   = useState([])
  const [total,     setTotal]     = useState(0)
  const [loading,   setLoading]   = useState(false)
  const [searched,  setSearched]  = useState(false)
  const [error,     setError]     = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!q.trim()) return
    setLoading(true); setError(null); setSearched(true)
    try {
      const { data } = await searchTickets(q.trim())
      setResults(data.tickets)
      setTotal(data.total)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Search failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Search bar */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-slate-700 mb-4">Search Tickets</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by employee, category, description…"
              className="input-field pl-10 text-base py-2.5"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading || !q.trim()} className="btn-primary px-6">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-400">Searches across employee name, department, category, description, and resolution notes.</p>
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="card p-6 flex items-center gap-3 text-red-700 bg-red-50">
          <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {!loading && searched && !error && (
        <>
          <div className="px-1">
            <p className="text-sm text-slate-500">
              Found <span className="font-semibold text-slate-700">{total}</span> result{total !== 1 ? 's' : ''} for{' '}
              <span className="font-semibold text-indigo-600">"{q}"</span>
            </p>
          </div>

          {results.length === 0 ? (
            <div className="card p-10 flex flex-col items-center gap-3 text-center">
              <Search className="w-10 h-10 text-slate-200" />
              <p className="text-slate-500 font-medium">No tickets match your search.</p>
              <p className="text-sm text-slate-400">Try different keywords or check the spelling.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map(ticket => (
                      <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                        <td className="px-4 py-3.5"><span className="text-xs font-mono text-slate-400">#{ticket.id}</span></td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{ticket.employee_name}</p>
                          <p className="text-xs text-slate-400">{ticket.department}</p>
                        </td>
                        <td className="px-4 py-3.5"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{ticket.issue_category}</span></td>
                        <td className="px-4 py-3.5"><PriorityBadge priority={ticket.priority} /></td>
                        <td className="px-4 py-3.5"><StatusBadge status={ticket.status} /></td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{formatDate(ticket.created_at)}</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => navigate(`/tickets/${ticket.id}`)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
