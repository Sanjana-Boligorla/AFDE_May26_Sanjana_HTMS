const config = {
  'Low':      { bg: 'bg-slate-100', text: 'text-slate-600',  icon: '▼' },
  'Medium':   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: '●' },
  'High':     { bg: 'bg-orange-50', text: 'text-orange-700', icon: '▲' },
  'Critical': { bg: 'bg-red-50',    text: 'text-red-700',    icon: '⚠' },
}

export default function PriorityBadge({ priority }) {
  const c = config[priority] || config['Medium']
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className="text-xs">{c.icon}</span>
      {priority}
    </span>
  )
}
