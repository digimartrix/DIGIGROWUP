import { useNavigate } from 'react-router-dom'
import { Zap, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center p-8">
      <div className="mb-6">
        <span className="font-mono text-7xl font-bold text-panel-border">404</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} strokeWidth={1.5} className="text-amber" />
        <span className="font-heading text-text font-semibold">Digimartrix Learning</span>
      </div>
      <h1 className="text-xl font-heading font-bold text-text mb-2">Page not found</h1>
      <p className="text-muted text-sm mb-8 max-w-xs">
        This route doesn't exist. Navigate back to your Learning Command Center to continue learning.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 bg-amber hover:bg-amber-dim text-white font-semibold px-5 py-3 rounded text-sm transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Command Center
      </button>
    </div>
  )
}
