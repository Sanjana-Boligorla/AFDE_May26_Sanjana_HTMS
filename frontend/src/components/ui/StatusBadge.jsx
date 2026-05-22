const config = {
  'Open':        { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   ring: 'ring-blue-200' },
  'In Progress': { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-500',  ring: 'ring-amber-200' },
  'Resolved':    { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  ring: 'ring-green-200' },
  'Closed':      { bg: 'bg-slate-100', text: 'text-slate-600',  dot: 'bg-slate-400',  ring: 'ring-slate-200' },
}

export default function StatusBadge({ status }) {
  const c = config[status] || config['Open']
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${c.bg} ${c.text} ${c.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  )
}
