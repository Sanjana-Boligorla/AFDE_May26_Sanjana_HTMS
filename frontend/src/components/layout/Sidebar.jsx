import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, PlusCircle, Search,
  Headphones, ChevronRight, BarChart2
} from 'lucide-react'

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/tickets',      icon: ClipboardList,   label: 'All Tickets' },
  { to: '/tickets/new',  icon: PlusCircle,      label: 'New Ticket'  },
  { to: '/search',       icon: Search,          label: 'Search'      },
  { to: '/analytics',    icon: BarChart2,        label: 'Analytics'   },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg">
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Helpdesk</p>
            <p className="text-slate-400 text-xs">Ticket Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Menu</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">Sanjana</p>
            <p className="text-slate-500 text-xs truncate">IT Support</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
