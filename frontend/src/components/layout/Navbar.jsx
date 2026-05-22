import { useNavigate, useLocation, useMatch } from 'react-router-dom'
import { PlusCircle, Bell } from 'lucide-react'

export default function Navbar() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const isDetail     = useMatch('/tickets/:id')

  let title, sub
  if (pathname === '/')               { title = 'Dashboard';    sub = 'Overview of all support tickets' }
  else if (pathname === '/tickets')   { title = 'All Tickets';  sub = 'Browse and manage support tickets' }
  else if (pathname === '/tickets/new'){ title = 'New Ticket';  sub = 'Submit a new support request' }
  else if (isDetail)                  { title = 'Ticket Detail'; sub = `Viewing ticket #${isDetail.params.id}` }
  else if (pathname === '/search')    { title = 'Search';       sub = 'Search across all tickets' }
  else                                { title = 'Helpdesk';     sub = '' }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-500">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <button onClick={() => navigate('/tickets/new')} className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          New Ticket
        </button>
      </div>
    </header>
  )
}
