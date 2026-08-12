import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import {
  ChevronRight, Clock, Globe, Code, Cpu, Database, Bookmark,
  ArrowRight, ShieldCheck, CreditCard, Sparkles, AlertCircle,
  CheckCircle2, Terminal
} from 'lucide-react'

const ICON_MAP = {
  'Web Development': Globe,
  'Web Development Fundamentals': Globe,
  'React & Modern Frontend': Code,
  'Node.js & REST APIs': Database,
  'System Design Fundamentals': Cpu,
}

const COLOR_MAP = {
  'Web Development': '#3895D2',
  'Web Development Fundamentals': '#3895D2',
  'React & Modern Frontend': '#E8A33D',
  'Node.js & REST APIs': '#4FB286',
  'System Design Fundamentals': '#EA4532',
}

const DIFFICULTY_COLORS = {
  Beginner: '#4FB286',
  Intermediate: '#E8A33D',
  Advanced: '#EA4532',
}

export default function Explore() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [activeCourseId, setActiveCourseId] = useState(null)
  const [creditsBalance, setCreditsBalance] = useState(user?.creditsBalance || 245)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [allRes, listRes, activeRes, balanceRes] = await Promise.allSettled([
        api.get('/courses'),
        api.get('/courses/enrolled-list'),
        api.get('/courses/enrolled'),
        api.get('/credits/balance'),
      ])

      if (allRes.status === 'fulfilled') setCourses(allRes.value.data || [])
      if (listRes.status === 'fulfilled') setEnrolledIds((listRes.value.data || []).map(e => e.courseId))
      if (activeRes.status === 'fulfilled') setActiveCourseId(activeRes.value.data?._id || null)
      if (balanceRes.status === 'fulfilled') setCreditsBalance(balanceRes.value.data?.balance ?? 245)
    } catch (err) {
      console.error('Failed to load courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (course, isEnrolled) => {
    setSubmitting(course._id)
    try {
      if (isEnrolled) {
        await api.post(`/courses/${course._id}/activate`)
        navigate('/dashboard')
      } else {
        const cost = Number(course.creditsCost !== undefined ? course.creditsCost : 50)
        if (cost > 0 && creditsBalance < cost) {
          showToast(`Insufficient credits! You have ${creditsBalance} DigiCredits, but this course requires ${cost} credits. Complete challenges in Code Arena to earn more!`, true)
          setSubmitting(null)
          return
        }

        const res = await api.post(`/courses/${course._id}/enroll`)
        showToast(res.data?.message || 'Course unlocked successfully!')
        if (res.data?.creditsBalance !== undefined) {
          setCreditsBalance(res.data.creditsBalance)
        }
        if (refreshUser) refreshUser()
        await loadData()
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed.', true)
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-64 rounded-xl bg-slate-800/40 border border-slate-800 shimmer animate-pulse" />)}
    </div>
  )

  return (
    <div className="page-enter max-w-6xl space-y-8 pb-16">
      {/* Toast Alert */}
      {toast.msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium border ${
          toast.isErr ? 'bg-[#0F172A] text-rose-400 border-rose-500/30' : 'bg-[#0F172A] text-emerald-400 border-emerald-500/30'
        }`}>
          {toast.isErr ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Info with Live Credits Wallet */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#3895D2]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#3895D2] font-bold uppercase mb-2">
            <Sparkles size={14} />
            <span>COURSE CATALOG & CREDIT STORE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
            Explore Specialized Tracks
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
            Use your earned DigiCredits to unlock professional full-stack, AI, and cloud computing tracks.
          </p>
        </div>

        {/* Live Credits Balance Tag */}
        <div className="relative z-10 bg-[#1E293B] border border-slate-700 rounded-xl p-4 flex items-center gap-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#3895D2]/20 border border-[#3895D2]/40 flex items-center justify-center text-[#3895D2]">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Your Available Credits</p>
            <p className="font-mono text-xl font-black text-white">
              {creditsBalance} <span className="text-xs text-[#3895D2]">CREDITS</span>
            </p>
          </div>
          <Link
            to="/code-arena"
            className="text-[11px] font-mono font-bold text-[#4FB286] bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            <Terminal size={12} />
            <span>Earn +</span>
          </Link>
        </div>
      </div>

      {/* Course Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const Icon = ICON_MAP[course.title] || Globe
          const color = COLOR_MAP[course.title] || '#3895D2'
          const isEnrolled = enrolledIds.includes(course._id)
          const isActive = activeCourseId === course._id
          const cost = Number(course.creditsCost !== undefined ? course.creditsCost : 50)

          return (
            <div
              key={course._id}
              className={`bg-[#0F172A] border rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between border-l-4 relative group`}
              style={{ borderLeftColor: color, borderColor: isActive ? '#EA4532' : '#1E293B' }}
            >
              {/* Header status bar tags */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                {/* Credits Cost Pill */}
                <span className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase border flex items-center gap-1 ${
                  cost === 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[#3895D2]/10 text-[#3895D2] border-[#3895D2]/30'
                }`}>
                  <CreditCard size={11} />
                  <span>{cost === 0 ? 'FREE STARTER' : `${cost} CREDITS`}</span>
                </span>

                {isActive ? (
                  <span className="flex items-center gap-1 bg-[#EA4532]/10 border border-[#EA4532]/25 rounded-full px-2.5 py-1 text-[#EA4532] font-mono text-[10px] uppercase font-bold tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA4532] animate-pulse" />
                    Active Track
                  </span>
                ) : isEnrolled ? (
                  <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-1 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                    <Bookmark size={11} fill="currentColor" />
                    Unlocked
                  </span>
                ) : null}
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 border transition-transform duration-300 group-hover:scale-105"
                  style={{ 
                    borderColor: `${color}30`, 
                    backgroundColor: `${color}15`,
                  }}
                >
                  <Icon size={20} strokeWidth={1.5} style={{ color }} />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    {course.category || 'General'}
                  </span>
                  <span 
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded border"
                    style={{
                      color: DIFFICULTY_COLORS[course.difficulty] || '#4FB286',
                      borderColor: `${DIFFICULTY_COLORS[course.difficulty] || '#4FB286'}30`,
                      backgroundColor: `${DIFFICULTY_COLORS[course.difficulty] || '#4FB286'}10`,
                    }}
                  >
                    {course.difficulty?.toUpperCase()}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-white text-lg mb-2 group-hover:text-[#3895D2] transition-colors pr-24">
                  {course.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {course.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6 pt-4 border-t border-slate-800/80 bg-[#0B0F19]/60 flex flex-col justify-end space-y-4">
                <div className="flex items-center justify-between text-slate-500 font-mono text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    <span>{course.estimatedHours || 10} hours estimated</span>
                  </div>
                  {isEnrolled ? (
                    <span className="text-emerald-400 text-[11px] font-bold">✓ Ready in Dashboard</span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Requires {cost} credits</span>
                  )}
                </div>

                {isActive ? (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-[#3895D2] hover:bg-[#3895D2]/90 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Study Active Track</span>
                    <ArrowRight size={14} />
                  </button>
                ) : isEnrolled ? (
                  <button
                    onClick={() => handleAction(course, true)}
                    disabled={submitting !== null}
                    className="w-full bg-[#1E293B] hover:bg-slate-700 text-white border border-slate-700 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span>Switch to Active Track</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(course, false)}
                    disabled={submitting !== null}
                    className="w-full bg-[#EA4532] hover:bg-[#EA4532]/90 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting === course._id ? (
                      'Processing...'
                    ) : cost === 0 ? (
                      <>
                        <span>Enroll Free →</span>
                      </>
                    ) : (
                      <>
                        <span>Unlock for {cost} Credits →</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
