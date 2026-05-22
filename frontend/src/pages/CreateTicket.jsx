import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, X, AlertCircle, CheckCircle, User, Building, Tag, AlignLeft, ChevronDown } from 'lucide-react'
import { createTicket } from '../services/api'

const CATEGORIES = ['VPN Issue','Password Reset','Software Installation','Laptop Issue','Email Access','Network Connectivity','Hardware Request']
const DEPARTMENTS = ['Engineering','HR','Finance','Operations','Marketing','Legal','Sales','IT','Product']
const PRIORITIES  = [
  { value: 'Low',      desc: 'Minor issue, no urgency',         color: 'border-slate-300 text-slate-600' },
  { value: 'Medium',   desc: 'Normal business impact',          color: 'border-blue-400 text-blue-600'   },
  { value: 'High',     desc: 'Significant impact on work',      color: 'border-orange-400 text-orange-600'},
  { value: 'Critical', desc: 'System down or data loss risk',   color: 'border-red-500 text-red-600'     },
]

const INIT = { employee_name: '', department: '', issue_category: '', description: '', priority: 'Medium' }

function FieldError({ msg }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{msg}</p>
}

export default function CreateTicket() {
  const navigate = useNavigate()
  const [form,       setForm]       = useState(INIT)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success,    setSuccess]    = useState(false)

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.employee_name.trim())   e.employee_name  = 'Employee name is required'
    else if (form.employee_name.trim().length < 2) e.employee_name = 'Name must be at least 2 characters'
    if (!form.department)             e.department     = 'Please select a department'
    if (!form.issue_category)         e.issue_category = 'Please select a category'
    if (!form.description.trim())     e.description    = 'Description is required'
    else if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSubmitting(true)
    try {
      await createTicket(form)
      setSuccess(true)
      setTimeout(() => navigate('/tickets'), 1800)
    } catch (err) {
      setErrors({ submit: err?.response?.data?.detail || 'Failed to create ticket. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Ticket Created!</h2>
        <p className="text-slate-500 text-sm">Redirecting to ticket list…</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} noValidate>
        <div className="card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5">
            <h2 className="text-white font-bold text-lg">New Support Ticket</h2>
            <p className="text-indigo-200 text-sm mt-0.5">Fill in the details below to submit your request</p>
          </div>

          <div className="p-6 space-y-5">
            {errors.submit && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {errors.submit}
              </div>
            )}

            {/* Employee name */}
            <div>
              <label className="label">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Employee Name <span className="text-red-500">*</span></span>
              </label>
              <input
                type="text"
                value={form.employee_name}
                onChange={e => set('employee_name', e.target.value)}
                placeholder="e.g. Alice Johnson"
                className={`input-field ${errors.employee_name ? 'border-red-400 ring-red-400 focus:ring-red-400' : ''}`}
              />
              <FieldError msg={errors.employee_name} />
            </div>

            {/* Department + Category row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Department <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={form.department}
                    onChange={e => set('department', e.target.value)}
                    className={`input-field appearance-none pr-8 ${errors.department ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select…</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <FieldError msg={errors.department} />
              </div>

              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Issue Category <span className="text-red-500">*</span></span>
                </label>
                <div className="relative">
                  <select
                    value={form.issue_category}
                    onChange={e => set('issue_category', e.target.value)}
                    className={`input-field appearance-none pr-8 ${errors.issue_category ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <FieldError msg={errors.issue_category} />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label">
                <span className="flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5" /> Description <span className="text-red-500">*</span></span>
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe the issue in detail…"
                className={`input-field resize-none ${errors.description ? 'border-red-400' : ''}`}
              />
              <div className="flex items-center justify-between mt-1">
                <FieldError msg={errors.description} />
                <span className={`text-xs ml-auto ${form.description.length < 10 ? 'text-slate-400' : 'text-green-600'}`}>
                  {form.description.length} chars
                </span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="label">Priority Level</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRIORITIES.map(({ value, desc, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('priority', value)}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-150 ${
                      form.priority === value
                        ? `${color} bg-white shadow-sm scale-105`
                        : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className="text-sm font-semibold">{value}</p>
                    <p className="text-xs mt-0.5 opacity-70 leading-snug">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onClick={() => navigate('/tickets')} className="btn-secondary">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary min-w-36 justify-center">
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                : <><Send className="w-4 h-4" /> Submit Ticket</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
