import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Calendar, Target, Play, Send, ChevronDown, ChevronUp, Link2 } from 'lucide-react'

const DIFFICULTY_COLORS = {
  Beginner: '#4FB286',
  Intermediate: '#E8A33D',
  Advanced: '#EA4532'
}

export default function BuildLab() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeProj, setActiveProj] = useState(null) // projectId
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/projects')
        if (res.data?.success) setProjects(res.data.data)
      } catch (err) {
        console.error('Failed to load projects:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSubmitProject = async (e, projectId) => {
    e.preventDefault()
    if (!repoUrl.trim()) return

    setSubmitting(true)
    try {
      const res = await api.post(`/projects/${projectId}/submit`, { repoUrl, demoUrl })
      if (res.data?.success) {
        setSubmittedId(projectId)
        setRepoUrl('')
        setDemoUrl('')
        alert('Project submitted! +50 Credits and +10 Career Readiness points awarded.')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {[1,2].map(i => <div key={i} className="h-40 rounded-xl bg-white border border-slate-200 shimmer" />)}
    </div>
  )

  return (
    <div className="page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-[#EA4532] uppercase tracking-widest mb-1.5 font-bold">PROJECT HUB</p>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Bridge the gap between courses and real engineering. Build high-fidelity projects, submit for evaluation, and expand your portfolio.
          </p>
        </div>

        {/* Project List */}
        <div className="grid grid-cols-1 gap-4">
          {projects.map((proj) => {
            const color = DIFFICULTY_COLORS[proj.difficulty] || '#3895D2'
            const isSubmitted = submittedId === proj._id
            
            return (
              <div
                key={proj._id}
                className={`bg-white border rounded-xl p-6 transition-all ${
                  activeProj === proj._id
                    ? 'border-slate-300 shadow-sm'
                    : 'border-slate-200 hover:shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded border tracking-wider"
                        style={{
                          color,
                          borderColor: `${color}25`,
                          backgroundColor: `${color}08`,
                          fontSize: '10px'
                        }}>
                        {proj.difficulty?.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono font-semibold">
                        <Calendar size={12} strokeWidth={1.5} />
                        <span>Estimated: 4-6 hours</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#3895D2] text-xs font-mono font-semibold">
                        <Target size={12} strokeWidth={1.5} />
                        <span>+50 credits</span>
                      </div>
                    </div>
                    <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base mb-2">{proj.title}</h3>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4 font-medium">{proj.problemStatement}</p>
                    <div className="flex flex-wrap gap-2">
                      {proj.technology?.map(t => (
                        <span key={t} className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center md:flex-col md:items-end justify-between md:justify-center gap-3">
                    <button
                      onClick={() => setActiveProj(activeProj === proj._id ? null : proj._id)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-all border shadow-3xs ${
                        activeProj === proj._id
                          ? 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-white'
                          : 'bg-[#3895D2] text-white border-transparent hover:bg-[#2c7db5]'
                      }`}
                    >
                      {activeProj === proj._id ? (
                        <>
                          Close
                          <ChevronUp size={13} />
                        </>
                      ) : (
                        <>
                          Start Project
                          <ChevronDown size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Project Details Panel if expanded */}
                {activeProj === proj._id && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-6 page-enter">
                    <div>
                      <h4 className="font-heading font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">Project Milestones</h4>
                      <div className="space-y-3">
                        {proj.milestones?.map((m, idx) => (
                          <div key={idx} className="flex gap-4 p-3 bg-slate-50 border border-slate-200/60 rounded-lg">
                            <span className="font-mono text-[#3895D2] font-bold text-sm mt-0.5">0{m.order || idx + 1}</span>
                            <div>
                              <p className="text-slate-800 text-xs font-bold">{m.title}</p>
                              <p className="text-slate-500 text-xs mt-0.5 font-medium">{m.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submission Form */}
                    <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5">
                      <h4 className="font-heading font-bold text-slate-700 text-xs uppercase tracking-wider mb-4">Submit Evaluation Work</h4>
                      
                      {isSubmitted ? (
                        <div className="py-4 text-center text-[#4FB286] font-bold text-xs">
                          ✓ Project Submitted Successfully! Credit transaction completed.
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleSubmitProject(e, proj._id)} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Repository URL (Required)</label>
                              <input
                                type="url"
                                required
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://github.com/username/project"
                                className="w-full text-slate-900 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#3895D2]"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Live Demo URL (Optional)</label>
                              <input
                                type="url"
                                value={demoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://project.vercel.app"
                                className="w-full text-slate-900 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#3895D2]"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-lg text-xs font-bold transition-all shadow-3xs"
                          >
                            <Send size={12} />
                            {submitting ? 'Submitting...' : 'Submit Project'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
