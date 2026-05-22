import { useState, useEffect } from 'react'
import {
  BarChart2, TrendingUp, CheckCircle2, Clock, Users,
  Tag, AlertTriangle, RefreshCw, Calendar
} from 'lucide-react'
import {
  getAnalyticsOverview,
  getCategorySummary,
  getPriorityDistribution,
  getDeptSummary,
  getResolutionTrends,
  getMonthlyVolume,
} from '../services/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n, dec = 1) {
  if (n === null || n === undefined) return '—'
  return Number(n).toFixed(dec)
}

function pct(val, total) {
  if (!total) return 0
  return Math.round((val / total) * 100)
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ h = 'h-4', w = 'w-full', extra = '' }) {
  return <div className={`${h} ${w} bg-slate-200 rounded animate-pulse ${extra}`} />
}

function KpiSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <Skeleton h="h-3" w="w-24" />
      <Skeleton h="h-8" w="w-32" />
      <Skeleton h="h-3" w="w-20" />
    </div>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color = 'indigo' }) {
  const colorMap = {
    indigo : { bg: 'bg-indigo-50', icon: 'text-indigo-600', val: 'text-indigo-700' },
    green  : { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700'  },
    amber  : { bg: 'bg-amber-50',  icon: 'text-amber-600',  val: 'text-amber-700'  },
    rose   : { bg: 'bg-rose-50',   icon: 'text-rose-600',   val: 'text-rose-700'   },
    sky    : { bg: 'bg-sky-50',    icon: 'text-sky-600',    val: 'text-sky-700'    },
    violet : { bg: 'bg-violet-50', icon: 'text-violet-600', val: 'text-violet-700' },
  }
  const c = colorMap[color] || colorMap.indigo
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.val}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0 ml-3`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  )
}

// ── Horizontal Bar Chart ──────────────────────────────────────────────────────

function HBar({ label, value, max, colorClass = 'bg-indigo-500', badge }) {
  const pctVal = max ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3 group">
      <span className="w-36 text-xs text-slate-600 truncate shrink-0" title={label}>{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`${colorClass} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${pctVal}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-slate-700 shrink-0">{value}</span>
      {badge && <span className="w-14 text-right text-xs text-slate-400 shrink-0">{badge}</span>}
    </div>
  )
}

// ── Priority Ring (donut-style using conic-gradient) ─────────────────────────

const PRIORITY_COLORS = {
  Critical : { ring: '#ef4444', badge: 'bg-red-100 text-red-700'    },
  High     : { ring: '#f97316', badge: 'bg-orange-100 text-orange-700' },
  Medium   : { ring: '#3b82f6', badge: 'bg-blue-100 text-blue-700'   },
  Low      : { ring: '#94a3b8', badge: 'bg-slate-100 text-slate-600' },
}

function PriorityRing({ data }) {
  if (!data || !data.length) return null
  const total = data.reduce((s, d) => s + d.ticket_count, 0)

  // Build conic-gradient stops
  let cumulative = 0
  const stops = data.map(d => {
    const start = cumulative
    cumulative += (d.ticket_count / total) * 360
    const color = PRIORITY_COLORS[d.priority]?.ring || '#6366f1'
    return `${color} ${start}deg ${cumulative}deg`
  })
  const gradient = `conic-gradient(${stops.join(', ')})`

  return (
    <div className="flex flex-col items-center gap-6 py-2">
      {/* Ring */}
      <div className="relative w-40 h-40 shrink-0">
        <div
          className="w-40 h-40 rounded-full"
          style={{ background: gradient }}
        />
        <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{total}</p>
            <p className="text-xs text-slate-400">tickets</p>
          </div>
        </div>
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 w-full">
        {data.map(d => {
          const c = PRIORITY_COLORS[d.priority] || { badge: 'bg-slate-100 text-slate-600' }
          return (
            <div key={d.priority} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: PRIORITY_COLORS[d.priority]?.ring || '#6366f1' }}
              />
              <span className="text-xs text-slate-600 truncate">{d.priority}</span>
              <span className={`ml-auto text-xs font-semibold px-1.5 py-0.5 rounded ${c.badge}`}>
                {d.percentage}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Resolution Bucket Badge ───────────────────────────────────────────────────

function BucketBadge({ bucket }) {
  if (!bucket) return <span className="text-slate-400">—</span>
  const map = {
    'Fast'      : 'bg-green-100 text-green-700',
    'Normal'    : 'bg-blue-100 text-blue-700',
    'Slow'      : 'bg-amber-100 text-amber-700',
    'Very Slow' : 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[bucket] || 'bg-slate-100 text-slate-600'}`}>
      {bucket}
    </span>
  )
}

// ── Section Wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <Icon className="w-4 h-4 text-indigo-500" />
        <h2 className="font-semibold text-slate-800 text-sm">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AnalyticsDashboard() {
  const [overview,    setOverview]    = useState(null)
  const [categories,  setCategories]  = useState([])
  const [priorities,  setPriorities]  = useState([])
  const [departments, setDepartments] = useState([])
  const [trends,      setTrends]      = useState([])
  const [monthly,     setMonthly]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [refreshing,  setRefreshing]  = useState(false)

  async function fetchAll(showRefresh = false) {
    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const [ov, cat, pri, dept, trend, mon] = await Promise.all([
        getAnalyticsOverview(),
        getCategorySummary(),
        getPriorityDistribution(),
        getDeptSummary(),
        getResolutionTrends(),
        getMonthlyVolume(),
      ])

      setOverview(ov.data)
      setCategories(cat.data)
      setPriorities(pri.data)
      setDepartments(dept.data)
      setTrends(trend.data)
      setMonthly(mon.data)
    } catch (err) {
      setError('Failed to load analytics. Make sure the ETL pipeline has been run and the backend is running.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">Analytics Unavailable</h3>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => fetchAll()}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const maxCat  = categories[0]?.ticket_count  || 1
  const maxDept = departments[0]?.ticket_count || 1

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            Historical Analytics
          </h1>
          {overview && !loading && (
            <p className="text-slate-500 text-sm mt-0.5">
              {overview.date_range_start} → {overview.date_range_end} &nbsp;·&nbsp;
              {overview.total_historical.toLocaleString()} tickets
            </p>
          )}
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <KpiSkeleton key={i} />)}
        </div>
      ) : overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard icon={BarChart2}    label="Total Tickets"       value={overview.total_historical.toLocaleString()}            color="indigo" />
          <KpiCard icon={CheckCircle2} label="Resolved"            value={overview.total_resolved.toLocaleString()}              color="green"  sub={`${overview.resolution_rate_pct}% rate`} />
          <KpiCard icon={Clock}        label="Avg Resolution"      value={overview.avg_resolution_hours ? `${fmt(overview.avg_resolution_hours)}h` : '—'} color="amber" />
          <KpiCard icon={TrendingUp}   label="Fastest Resolved"    value={overview.fastest_resolution_hrs ? `${fmt(overview.fastest_resolution_hrs)}h` : '—'} color="sky" />
          <KpiCard icon={Users}        label="Departments"         value={overview.unique_departments}                           color="violet" />
          <KpiCard icon={Tag}          label="Issue Categories"    value={overview.unique_categories}                            color="rose"   />
        </div>
      )}

      {/* Row 2: Category bar chart + Priority ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <Section title="Tickets by Category" icon={Tag} className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h="h-4" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map(c => (
                <HBar
                  key={c.issue_category}
                  label={c.issue_category}
                  value={c.ticket_count}
                  max={maxCat}
                  colorClass="bg-indigo-500"
                  badge={`${c.resolution_rate_pct}%`}
                />
              ))}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3">Badge = resolution rate</p>
        </Section>

        <Section title="Priority Distribution" icon={AlertTriangle}>
          {loading ? (
            <div className="flex justify-center py-8"><Skeleton h="h-40" w="w-40" extra="rounded-full" /></div>
          ) : (
            <PriorityRing data={priorities} />
          )}
        </Section>
      </div>

      {/* Row 3: Department table + Resolution trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Section title="Department Summary" icon={Users}>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h="h-5" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase">Dept</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase text-right">Tickets</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase text-right">Resolved</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase text-right">Rate</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase text-right">Avg hrs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {departments.map(d => (
                    <tr key={d.department} className="hover:bg-slate-50">
                      <td className="py-2 text-slate-700 font-medium">{d.department}</td>
                      <td className="py-2 text-right text-slate-600">{d.ticket_count}</td>
                      <td className="py-2 text-right text-slate-600">{d.resolved_count}</td>
                      <td className="py-2 text-right">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          d.resolution_rate_pct >= 80 ? 'bg-green-100 text-green-700' :
                          d.resolution_rate_pct >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {d.resolution_rate_pct}%
                        </span>
                      </td>
                      <td className="py-2 text-right text-slate-500 text-xs">{fmt(d.avg_resolution_hours)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Resolution Trends (Monthly)" icon={TrendingUp}>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h="h-5" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase">Month</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase text-right">Total</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase text-right">Resolved</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase text-right">Rate</th>
                    <th className="pb-2 font-semibold text-slate-500 text-xs uppercase text-right">Avg hrs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {trends.map(t => (
                    <tr key={t.created_month} className="hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-700">{t.created_month}</td>
                      <td className="py-2 text-right text-slate-600">{t.ticket_count}</td>
                      <td className="py-2 text-right text-slate-600">{t.resolved_count}</td>
                      <td className="py-2 text-right">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                          pct(t.resolved_count, t.ticket_count) >= 80 ? 'bg-green-100 text-green-700' :
                          pct(t.resolved_count, t.ticket_count) >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {pct(t.resolved_count, t.ticket_count)}%
                        </span>
                      </td>
                      <td className="py-2 text-right text-slate-500 text-xs">{fmt(t.avg_resolution_hours)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* Row 4: Monthly Volume stacked bar */}
      <Section title="Monthly Ticket Volume by Status" icon={Calendar}>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h="h-6" />)}</div>
        ) : (
          <div className="space-y-2.5">
            {/* Legend */}
            <div className="flex items-center gap-5 mb-4 flex-wrap">
              {[
                { label: 'Open',        color: 'bg-blue-400'   },
                { label: 'In Progress', color: 'bg-amber-400'  },
                { label: 'Resolved',    color: 'bg-green-400'  },
                { label: 'Closed',      color: 'bg-slate-400'  },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-sm ${l.color}`} />
                  <span className="text-xs text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
            {monthly.map(m => {
              const maxVol = Math.max(...monthly.map(x => x.ticket_count)) || 1
              const barPct = (m.ticket_count / maxVol) * 100
              return (
                <div key={m.created_month} className="flex items-center gap-3">
                  <span className="w-16 text-xs text-slate-500 shrink-0">{m.created_month}</span>
                  <div className="flex-1 flex h-5 rounded overflow-hidden bg-slate-100" style={{ maxWidth: `${barPct}%` }}>
                    {m.open_count        > 0 && <div className="bg-blue-400"  style={{ flex: m.open_count }} />}
                    {m.in_progress_count > 0 && <div className="bg-amber-400" style={{ flex: m.in_progress_count }} />}
                    {m.resolved_count    > 0 && <div className="bg-green-400" style={{ flex: m.resolved_count }} />}
                    {m.closed_count      > 0 && <div className="bg-slate-400" style={{ flex: m.closed_count }} />}
                  </div>
                  <span className="w-8 text-xs text-slate-600 font-semibold shrink-0">{m.ticket_count}</span>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* Priority avg resolution table */}
      <Section title="Priority — Avg Resolution Time" icon={Clock}>
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="h-5" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {priorities.map(p => {
              const c = PRIORITY_COLORS[p.priority] || { ring: '#6366f1', badge: 'bg-slate-100 text-slate-600' }
              return (
                <div key={p.priority} className="rounded-lg border border-slate-100 p-4 text-center">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
                    style={{ background: c.ring + '22', color: c.ring }}
                  >
                    {p.priority}
                  </span>
                  <p className="text-2xl font-bold text-slate-800">
                    {p.avg_resolution_hours ? `${fmt(p.avg_resolution_hours)}h` : '—'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{p.ticket_count} tickets</p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${p.percentage}%`,
                        background: c.ring,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{p.percentage}% of total</p>
                </div>
              )
            })}
          </div>
        )}
      </Section>

    </div>
  )
}
