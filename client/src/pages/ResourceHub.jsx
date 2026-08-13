import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  FileText, Download, Sparkles, Search, Filter,
  CheckCircle2, AlertCircle, BookOpen, Code2, Layers,
  ExternalLink, X, Eye, FileCode, Lock, Unlock
} from 'lucide-react'

const RESOURCES_DATA = [
  {
    id: 'res-1',
    title: 'HTML5 Semantic Elements & SEO Architecture Cheat Sheet',
    category: 'Cheat Sheets',
    type: 'PDF Guide',
    size: '1.4 MB',
    cost: 0,
    downloads: 1420,
    tags: ['HTML5', 'SEO', 'Accessibility'],
    desc: 'Master full semantic landmark tagging (<main>, <article>, <section>, <header>, <nav>) and ARIA accessibility roles for production grade web standards.',
    previewContent: `# HTML5 Semantic Elements Cheat Sheet

## Essential Landmark Tags:
- \`<header>\`: Container for introductory content or navigational links.
- \`<nav>\`: Defines navigation links block.
- \`<main>\`: Dominant content of the <body>. Unique per document.
- \`<article>\`: Self-contained composition in a document.
- \`<section>\`: Standalone section with thematic grouping.
- \`<footer>\`: Footer for its nearest sectioning content.

## Best Practice SEO Rules:
1. Exactly one <h1> element per page for crawler ranking.
2. Always provide descriptive alt text on non-decorative images.
3. Use aria-label on interactive icon buttons.`
  },
  {
    id: 'res-2',
    title: 'CSS Grid & Flexbox Modern Layout Blueprint Manual',
    category: 'Cheat Sheets',
    type: 'Interactive Manual',
    size: '2.8 MB',
    cost: 15,
    downloads: 890,
    tags: ['CSS3', 'Grid', 'Flexbox', 'Responsive'],
    desc: 'Deep-dive visual diagrams for auto-fit vs auto-fill, minmax(), subgrid, dynamic fluid clamping, and aspect-ratio CSS utilities.',
    previewContent: `# Modern CSS Layouts Manual

## CSS Grid Essentials:
\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}
\`\`\`

## Dynamic Fluid Typography:
\`\`\`css
h1 {
  font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem);
}
\`\`\``
  },
  {
    id: 'res-3',
    title: 'JavaScript Asynchronous Execution & Closures Map',
    category: 'Cheat Sheets',
    type: 'PDF Reference',
    size: '950 KB',
    cost: 0,
    downloads: 2100,
    tags: ['JavaScript', 'Async', 'Event Loop', 'Closures'],
    desc: 'Visual mental models explaining the Call Stack, Web APIs, Microtask Queue (Promises), Macrotask Queue (setTimeout), and Lexical Scope bindings.',
    previewContent: `# JS Event Loop & Async Execution

## Microtasks vs Macrotasks:
- **Microtask Queue:** Promise.then(), queueMicrotask(), MutationObserver (Runs immediately after call stack empties).
- **Macrotask Queue:** setTimeout, setInterval, setImmediate, I/O events.

## Lexical Closures Pattern:
\`\`\`javascript
function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    getValue: () => count
  };
}
\`\`\``
  },
  {
    id: 'res-4',
    title: 'Full Stack React + Node.js Production Starter Template',
    category: 'Starters & Boilerplates',
    type: 'ZIP Repository',
    size: '4.2 MB',
    cost: 30,
    downloads: 650,
    tags: ['React', 'Node.js', 'Express', 'JWT', 'MongoDB'],
    desc: 'Production-ready starter boilerplate featuring Vite, React Router, TailwindCSS, Express REST API, JWT authentication, and MongoDB Mongoose schemas.',
    previewContent: `# Production React + Node Starter

## Included Architecture:
- client/ (Vite + React 18 + TailwindCSS)
- server/ (Express + Mongoose + JWT auth + helmet + cors)
- Pre-configured ESLint, Prettier, and Vercel serverless deployment config.`
  },
  {
    id: 'res-5',
    title: 'System Design & High-Concurrency Architecture Blueprint',
    category: 'System Design',
    type: 'Architecture Map',
    size: '3.6 MB',
    cost: 45,
    downloads: 1200,
    tags: ['System Design', 'Redis', 'Kafka', 'Caching', 'Load Balancer'],
    desc: 'Scalable system designs for rate limiters, distributed caching with Redis, event-driven messaging with Kafka, and database sharding strategies.',
    previewContent: `# High-Concurrency Architecture

## Key Design Patterns:
1. **Cache-Aside Pattern:** Check Redis cache -> If miss, fetch from DB -> Write to Cache with TTL.
2. **Token Bucket Rate Limiting:** Prevent DDoS & endpoint abuse.
3. **Database Read Replicas:** Scale heavy read loads across multiple secondary nodes.`
  },
  {
    id: 'res-6',
    title: 'Frontend Technical Interview Question Bank (Top 100)',
    category: 'Interview Kits',
    type: 'PDF & Code Bank',
    size: '2.1 MB',
    cost: 20,
    downloads: 3400,
    tags: ['Interviews', 'FAANG', 'React', 'Algorithms'],
    desc: 'Curated list of the top 100 coding questions, machine coding rounds, and behavioral scenarios asked at top tech companies.',
    previewContent: `# Top 100 Frontend Interview Questions

## Core Topics Covered:
1. Custom Promise.all and Promise.race implementations.
2. Debounce and Throttle functions from scratch.
3. Deep Clone utility with circular reference handling.
4. Virtual DOM diffing & React Fiber architecture.`
  }
]

export default function ResourceHub() {
  const { user } = useAuth()
  const [resources, setResources] = useState(RESOURCES_DATA)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [unlockedResources, setUnlockedResources] = useState(() => {
    const saved = localStorage.getItem('UNLOCKED_RESOURCES')
    return saved ? JSON.parse(saved) : ['res-1', 'res-3']
  })
  const [previewModal, setPreviewModal] = useState(null)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  useEffect(() => {
    async function loadResources() {
      try {
        const res = await api.get('/resources')
        if (res.data?.success && res.data.data?.length > 0) {
          const dbRes = res.data.data.map(r => ({
            id: r._id,
            title: r.title,
            category: r.type === 'PDF' ? 'Cheat Sheets' : (r.type === 'Code' ? 'Starters & Boilerplates' : 'Cheat Sheets'),
            type: r.type || 'Guide',
            size: '1.5 MB',
            cost: r.creditsCost || 0,
            downloads: 120,
            tags: ['Instructor Upload', r.type || 'Resource'],
            desc: r.description || 'Verified engineering learning asset provided by instructor.',
            previewContent: `# ${r.title}\n\n${r.description || 'Downloadable developer asset.'}\n\nDownload Link: ${r.downloadUrl || 'Available on request'}`
          }))
          setResources([...dbRes, ...RESOURCES_DATA])
        }
      } catch (err) {
        console.warn('Using base resources:', err.message)
      }
    }
    loadResources()
  }, [])

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  const categories = ['All', 'Cheat Sheets', 'Starters & Boilerplates', 'System Design', 'Interview Kits']

  const handleUnlockOrDownload = (resource) => {
    const isUnlocked = unlockedResources.includes(resource.id) || resource.cost === 0

    if (isUnlocked) {
      // Simulate instant download
      const blob = new Blob([resource.previewContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${resource.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`
      a.click()
      URL.revokeObjectURL(url)
      showToast(`Downloading "${resource.title}"...`)
    } else {
      // Unlock using DigiCredits
      const currentBalance = user?.creditsBalance || 285
      if (currentBalance < resource.cost) {
        showToast(`Insufficient credits! You need ${resource.cost} DigiCredits.`, true)
        return
      }

      const updated = [...unlockedResources, resource.id]
      setUnlockedResources(updated)
      localStorage.setItem('UNLOCKED_RESOURCES', JSON.stringify(updated))
      showToast(`🎉 Unlocked "${resource.title}" for ${resource.cost} DigiCredits!`)
    }
  }

  const filtered = resources.filter((r) => {
    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCat && matchesSearch
  })

  return (
    <div className="page-enter max-w-6xl space-y-6 pb-16">
      {/* Toast Alert */}
      {toast.msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium border ${
          toast.isErr ? 'bg-[#0F172A] text-rose-400 border-rose-500/30' : 'bg-[#0F172A] text-emerald-400 border-emerald-500/30'
        }`}>
          {toast.isErr ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 relative max-h-[85vh] flex flex-col animate-scale-up">
            <button
              onClick={() => setPreviewModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X size={18} />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold text-[#3895D2] uppercase tracking-widest">{previewModal.type}</span>
              <h2 className="font-heading font-black text-slate-850 text-lg md:text-xl mt-0.5">
                {previewModal.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{previewModal.desc}</p>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-100 p-4.5 rounded-xl font-mono text-xs leading-relaxed border border-slate-800">
              <pre className="whitespace-pre-wrap">{previewModal.previewContent}</pre>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-xs font-mono font-bold text-slate-600">
                {previewModal.cost === 0 ? 'FREE DOWNLOAD' : `${previewModal.cost} DigiCredits`}
              </span>
              <button
                onClick={() => {
                  handleUnlockOrDownload(previewModal)
                  setPreviewModal(null)
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold font-heading transition-all shadow-xs"
              >
                <Download size={14} />
                <span>{unlockedResources.includes(previewModal.id) || previewModal.cost === 0 ? 'Download Markdown / PDF' : `Unlock for ${previewModal.cost} Credits`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] text-[#3895D2] uppercase tracking-widest mb-1 font-bold">DEVELOPER ASSET VAULT</p>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-850">
            Educational Resource Hub
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5 font-medium">
            Download cheat sheets, starter templates, system architecture blueprints, and interview prep kits.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white text-slate-900 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none focus:border-[#3895D2] shadow-2xs"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((res) => {
          const isUnlocked = unlockedResources.includes(res.id) || res.cost === 0

          return (
            <div
              key={res.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:border-[#3895D2]/40 transition-all group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {res.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{res.size}</span>
                </div>

                <h3 className="font-heading font-bold text-slate-850 text-sm md:text-base leading-snug mb-2 group-hover:text-[#3895D2] transition-colors">
                  {res.title}
                </h3>

                <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4 font-medium">
                  {res.desc}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {res.tags.map((t, i) => (
                    <span key={i} className="text-[9px] font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-black text-slate-850">
                    {res.cost === 0 ? 'FREE' : `${res.cost} Credits`}
                  </span>
                  <p className="text-[9px] font-mono text-slate-400">{res.downloads} downloads</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewModal(res)}
                    title="Quick Preview"
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-all"
                  >
                    <Eye size={14} />
                  </button>

                  <button
                    onClick={() => handleUnlockOrDownload(res)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-heading transition-all shadow-xs ${
                      isUnlocked
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#3895D2] hover:bg-[#2c7db5] text-white'
                    }`}
                  >
                    {isUnlocked ? <Download size={13} /> : <Unlock size={13} />}
                    <span>{isUnlocked ? 'Download' : 'Unlock'}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
