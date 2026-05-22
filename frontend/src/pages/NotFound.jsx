import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 shadow-inner">
        <span className="text-5xl font-black text-indigo-300">404</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h1>
      <p className="text-slate-500 text-sm max-w-sm mb-8">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <button onClick={() => navigate('/')} className="btn-primary">
          <Home className="w-4 h-4" /> Dashboard
        </button>
        <button onClick={() => navigate('/search')} className="btn-secondary">
          <Search className="w-4 h-4" /> Search
        </button>
      </div>
    </div>
  )
}
