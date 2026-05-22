import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Ticket, CircleDot, Clock, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, RefreshCw, ArrowRight
} from 'lucide-react'
import { getStats } from '../services/api'
import StatCard from '../components/ui/StatCard'
import StatusBadge from '../components/ui/StatusBadge'
import PriorityBadge from '../components/ui/PriorityBadge'

function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-700">Failed to load dashboard</p>
        <p className="text-sm text-slate-500 mt-1">{message}</p>
      </div>
      <button onClick={onRetry} className="btn-secondary">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  })
}

function PriorityBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const barColors = {
    red: 'bg-red-500', orange: 'bg-orange-500',
    blue: 'bg-blue-500', slate: 'bg-slate-400'
  }
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-16 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${barColors[color]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-slate-700 w-6 text-right">{count}</span>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const navigate              = useNavigate()

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await getStats()
      setStats(data)
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  if (loading) return <Spinner />
  if (error)   return <ErrorState message={error} onRetry={fetchStats} />

  const byStatus   = stats.by_status   || {}
  const byPriority = stats.by_priority || {}
  const recent     = stats.recent_tickets || []

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Good day, Sanjana! 👋</h2>
            <p className="text-indigo-200 text-sm mt-1">
              Here's what's happening with your support queue today.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">{stats.total} Total Tickets</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="col-span-2 lg:col-span-1 xl:col-span-1">
          <StatCard label="Total"       value={stats.total}                icon={Ticket}      color="indigo" />
        </div>
        <StatCard label="Open"          value={byStatus['Open'] || 0}       icon={CircleDot}   color="blue"   />
        <StatCard label="In Progress"   value={byStatus['In Progress'] || 0} icon={Clock}       color="amber"  />
        <StatCard label="Resolved"      value={byStatus['Resolved'] || 0}   icon={CheckCircle} color="green"  />
        <StatCard label="Closed"        value={byStatus['Closed'] || 0}     icon={XCircle}     color="slate"  />
        <StatCard label="Critical"      value={byPriority['Critical'] || 0} icon={AlertTriangle} color="red"  sublabel="Needs attention" />
      </div>

      {/* Priority breakdown + Recent tickets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Priority breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Priority Breakdown
          </h3>
          <div className="space-y-3">
            <PriorityBar label="Critical" count={byPriority['Critical'] || 0} total={stats.total} color="red" />
            <PriorityBar label="High"     count={byPriority['High'] || 0}     total={stats.total} color="orange" />
            <PriorityBar label="Medium"   count={byPriority['Medium'] || 0}   total={stats.total} color="blue" />
            <PriorityBar label="Low"      count={byPriority['Low'] || 0}      total={stats.total} color="slate" />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-red-50 rounded-lg py-2">
                <p className="text-red-600 font-bold text-lg">{byPriority['Critical'] || 0}</p>
                <p className="text-red-500 text-xs">Critical</p>
              </div>
              <div className="bg-orange-50 rounded-lg py-2">
                <p className="text-orange-600 font-bold text-lg">{byPriority['High'] || 0}</p>
                <p className="text-orange-500 text-xs">High</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent tickets */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Recent Tickets
            </h3>
            <button
              onClick={() => navigate('/tickets')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recent.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">No tickets yet.</div>
            ) : (
              recent.map(ticket => (
                <div
                  key={ticket.id}
                  className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-400">#{ticket.id}</span>
                        <span className="text-sm font-medium text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                          {ticket.employee_name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{ticket.issue_category} · {ticket.department}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {formatDate(ticket.created_at)} at {formatTime(ticket.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open',        count: byStatus['Open'] || 0,        color: 'bg-blue-500',   light: 'bg-blue-50',  text: 'text-blue-700'  },
          { label: 'In Progress', count: byStatus['In Progress'] || 0,  color: 'bg-amber-500',  light: 'bg-amber-50', text: 'text-amber-700' },
          { label: 'Resolved',    count: byStatus['Resolved'] || 0,    color: 'bg-green-500',  light: 'bg-green-50', text: 'text-green-700' },
          { label: 'Closed',      count: byStatus['Closed'] || 0,      color: 'bg-slate-400',  light: 'bg-slate-50', text: 'text-slate-600' },
        ].map(({ label, count, color, light, text }) => (
          <div
            key={label}
            className={`${light} rounded-xl p-4 border border-slate-100 cursor-pointer hover:shadow-md transition-all`}
            onClick={() => navigate(`/tickets?status=${encodeURIComponent(label)}`)}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${text}`}>{count}</p>
            <p className="text-xs text-slate-400 mt-1">
              {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}% of total
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}
