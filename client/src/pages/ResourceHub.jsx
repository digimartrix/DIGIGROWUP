import { FileText, Download } from 'lucide-react'

const RESOURCES = [
  { id: '1', title: 'HTML5 Semantic Tag Cheat Sheet', type: 'PDF Document', size: '1.2 MB', cost: 0 },
  { id: '2', title: 'Interactive CSS Grid Grid Layout Guide', type: 'Interactive Manual', size: '2.5 MB', cost: 15 },
  { id: '3', title: 'JS Closures & Scope Scope Map Cheat Sheet', type: 'PDF Map', size: '840 KB', cost: 0 },
]

export default function ResourceHub() {
  return (
    <div className="p-6 page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">EDUCATIONAL MARKET</p>
          <p className="text-slate-500 text-xs md:text-sm">
            Unlock cheat sheets, design templates, reference maps, and starter code datasets to support your project implementations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RESOURCES.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-md p-6 hover:shadow-xs transition-all flex flex-col justify-between shadow-3xs">
              <div>
                <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-slate-400">
                  <FileText size={16} strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-bold text-slate-800 text-xs md:text-sm mb-1">{r.title}</h3>
                <p className="text-slate-400 font-mono" style={{ fontSize: '9px' }}>{r.type.toUpperCase()} · {r.size}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {r.cost === 0 ? 'FREE' : `${r.cost} credits`}
                </span>
                <button
                  onClick={() => alert(`Unlocked resource: ${r.title} successfully!`)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brandBlue text-white hover:bg-opacity-95 text-xs font-bold rounded transition-colors shadow-3xs"
                >
                  <Download size={12} strokeWidth={1.5} />
                  Get Access
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
