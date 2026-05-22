import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

const styles = {
  success: { bar: 'bg-green-500', bg: 'bg-green-50 border-green-200 text-green-800', Icon: CheckCircle,  icon: 'text-green-500' },
  error:   { bar: 'bg-red-500',   bg: 'bg-red-50 border-red-200 text-red-800',       Icon: XCircle,      icon: 'text-red-500'   },
  warning: { bar: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200 text-amber-800', Icon: AlertTriangle, icon: 'text-amber-500' },
}

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null
  const s = styles[toast.type] || styles.success

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg min-w-72 max-w-sm ${s.bg}`}>
      <div className={`w-1 self-stretch rounded-full ${s.bar}`} />
      <s.Icon className={`w-5 h-5 mt-0.5 shrink-0 ${s.icon}`} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const show = (message, type = 'success') => setToast({ message, type })
  const hide = () => setToast(null)
  return { toast, show, hide }
}
