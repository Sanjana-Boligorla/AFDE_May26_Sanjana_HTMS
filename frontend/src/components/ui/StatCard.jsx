export default function StatCard({ label, value, icon: Icon, color, sublabel }) {
  const colors = {
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600',  border: 'border-indigo-200',  icon: 'bg-indigo-100' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-200',    icon: 'bg-blue-100' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   icon: 'bg-amber-100' },
    green:   { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-200',   icon: 'bg-green-100' },
    red:     { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     icon: 'bg-red-100' },
    slate:   { bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   icon: 'bg-slate-100' },
  }
  const c = colors[color] || colors.indigo

  return (
    <div className={`card p-5 border-l-4 ${c.border} hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value ?? '—'}</p>
          {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.icon}`}>
            <Icon className={`w-6 h-6 ${c.text}`} />
          </div>
        )}
      </div>
    </div>
  )
}
