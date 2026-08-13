import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SegmentedGauge from '../components/SegmentedGauge'
import api from '../lib/api'
import {
  BookOpen, ArrowRight, AlertTriangle, Target, TrendingUp, CheckCircle2,
  ChevronRight, Layers, Clock, BarChart3
} from 'lucide-react'

function NextActionCard({ nextAction }) {
  const navigate = useNavigate()
  if (!nextAction) return (
    <div className="bg-white border border-slate-200 rounded-md p-6">
      <p className="text-slate-500 text-xs md:text-sm">
        No assessment attempts yet — complete a quiz in your Learning Library to see recommended next steps.
      </p>
    </div>
  )

  const actionMeta = {
    CRITICAL: { icon: AlertTriangle, color: '#D97706', btnBg: 'bg-[#3895D2]', label: 'SKILL REVIEW' },
    PRACTICE: { icon: Target, color: '#0284C7', btnBg: 'bg-[#3895D2]', label: 'PRACTICE PROTOCOL' },
    ASSESS:   { icon: TrendingUp, color: '#3895D2', btnBg: 'bg-[#3895D2]', label: 'ASSESSMENT MODE' },
    ADVANCE:  { icon: CheckCircle2, color: '#10B981', btnBg: 'bg-[#10B981]', label: 'ADVANCEMENT READY' },
  }
  const meta = actionMeta[nextAction.action] || actionMeta.PRACTICE
  const Icon = meta.icon

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 relative shadow-xs hover:shadow-md transition-all duration-300 border-l-4" style={{ borderLeftColor: meta.color }}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0"
            style={{ borderColor: `${meta.color}30`, backgroundColor: `${meta.color}12` }}>
            <Icon size={18} strokeWidth={1.5} style={{ color: meta.color }} />
          </div>
          <div className="min-w-0">
            <span className="font-mono block mb-1.5 font-bold"
              style={{ color: meta.color, letterSpacing: '0.08em', fontSize: '10px', textTransform: 'uppercase' }}>
              RECOMMENDED NEXT STEP · {meta.label}
            </span>
            <p className="text-slate-850 text-sm leading-relaxed font-bold">{nextAction.cta}</p>
            {nextAction.estTime && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock size={11} strokeWidth={1.5} className="text-slate-400" />
                <span className="font-mono text-xs text-slate-405 font-semibold">~{nextAction.estTime} min estimated</span>
              </div>
            )}
          </div>
        </div>
        {nextAction.deepLink && (
          <button
            onClick={() => navigate(nextAction.deepLink)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white transition-all shadow-3xs hover:bg-opacity-90 ${meta.btnBg}`}
          >
            CONTINUE <ArrowRight size={12} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [mastery, setMastery] = useState([])
  const [nextAction, setNextAction] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [masteryRes, nextRes, courseRes] = await Promise.all([
          api.get(`/mastery/${user.id}`),
          api.get(`/next-action/next-action/${user.id}`),
          api.get('/courses/enrolled'),
        ])
        setMastery(masteryRes.data || [])
        const na = nextRes.data
        setNextAction(na?.topic ? na : null)
        setCourse(courseRes.data || null)
      } catch {
        // Handle empty account
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  const completedCount = course?.completedLessons?.length || 0
  const totalLessons = course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const firstIncomplete = course?.modules
    ?.flatMap(m => m.lessons || [])
    ?.find(l => !course.completedLessons?.map(String).includes(String(l._id)))

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 rounded-md bg-white border border-slate-200 shimmer" />)}
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 page-enter">
      
      {/* Center column */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Welcome Section & Quick Navigation Triggers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs text-emerald-600 uppercase tracking-widest font-bold" style={{ fontSize: '10px' }}>ECOSYSTEM ACTIVE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
              Good morning, {user?.name?.split(' ')[0]}
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">Your next best learning action is ready.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {firstIncomplete && (
              <button 
                onClick={() => navigate(`/lesson/${firstIncomplete._id}`)} 
                className="px-4 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Continue Learning
              </button>
            )}
            <button 
              onClick={() => navigate('/code-arena')} 
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              Practice Lab
            </button>
            <button 
              onClick={() => navigate('/community')} 
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              Community Space
            </button>
          </div>
        </div>

        {/* Learning Health Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Lessons Completed', value: completedCount, unit: `/ ${totalLessons || '—'}`, color: '#10B981', bg: 'border-l-emerald-500' },
            { label: 'Course Progress', value: `${progressPct}`, unit: '%', color: '#3895D2', bg: 'border-l-[#3895D2]' },
            { label: 'Topics Tracked', value: mastery.length, unit: 'topics', color: '#0284C7', bg: 'border-l-sky-500' },
          ].map(({ label, value, unit, color, bg }) => (
            <div key={label} className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all border-l-4 ${bg}`}>
              <p className="text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold text-[10px]">{label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-2xl font-black" style={{ color }}>{value}</span>
                <span className="text-slate-500 text-xs font-bold">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Next Best Action */}
        <div className="space-y-3">
          <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Target size={14} className="text-[#3895D2]" />
            <span>Recommended Next Step</span>
          </h3>
          <NextActionCard nextAction={nextAction} />
        </div>

        {/* Continue Learning */}
        <div className="space-y-3">
          <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <BookOpen size={14} className="text-[#3895D2]" />
            <span>Continue Learning</span>
          </h3>
          {course ? (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-slate-400 uppercase tracking-widest mb-1 text-[10px] font-bold">ACTIVE COURSE</p>
                  <h4 className="font-heading font-bold text-slate-900 text-base">{course.title}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-slate-600 text-xs font-semibold">{course.category}</span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-slate-500 text-xs font-mono">{course.difficulty}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-heading text-2xl font-black text-[#3895D2]">{progressPct}</span>
                  <span className="text-slate-400 text-xs font-bold">%</span>
                  <p className="text-slate-400 text-[10px] uppercase font-mono mt-0.5 font-bold">complete</p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {course.modules?.map((mod) => {
                  const modCompleted = (mod.lessons || []).filter(l =>
                    (course.completedLessons || []).map(String).includes(String(l._id))
                  ).length
                  return (
                    <div key={mod._id} className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <Layers size={14} className="text-[#3895D2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-900 text-xs sm:text-sm font-bold truncate leading-none mb-1.5">{mod.title}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-slate-500 font-mono text-[10px]">{modCompleted}/{(mod.lessons || []).length} lessons</p>
                            {mod.lessons?.[0] && (
                              <button onClick={() => navigate(`/lesson/${mod.lessons[0]._id}`)}
                                className="text-[#3895D2] hover:underline text-[11px] font-bold transition-colors">
                                Start lesson →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {mod.quizId && (
                        <button
                          onClick={() => navigate(`/quiz/${mod.quizId}`)}
                          className="text-slate-700 hover:text-[#3895D2] text-xs font-bold flex items-center gap-1 transition-all border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 hover:bg-white"
                        >
                          Quiz <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {firstIncomplete && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/lesson/${firstIncomplete._id}`)}
                    className="flex items-center gap-2 text-[#3895D2] text-xs md:text-sm font-bold hover:gap-2.5 transition-all group"
                  >
                    Resume: {firstIncomplete.title}
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <p className="text-slate-500 text-xs md:text-sm">
                No enrolled course found. Browse the catalog to register.
              </p>
              <button
                onClick={() => navigate('/explore')}
                className="mt-3 text-[#3895D2] text-xs md:text-sm font-bold hover:underline"
              >
                Browse catalog →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right rail — Skill Mastery gauges */}
      <div className="w-full lg:w-[300px] flex-shrink-0">
        <div className="space-y-4">
          <h3 className="text-xs font-heading font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <BarChart3 size={14} className="text-[#3895D2]" />
            <span>Skill Mastery</span>
          </h3>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            {mastery.length > 0 ? (
              mastery.map((m) => (
                <SegmentedGauge key={m.topic} topic={m.topic} score={m.score} />
              ))
            ) : (
              <div className="py-6 text-center">
                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <BarChart3 size={14} />
                </div>
                <p className="text-slate-600 text-xs font-bold">No skill mastery data yet.</p>
                <p className="text-slate-400 text-[10px] mt-1">Complete a quiz in your Learning Library to start tracking.</p>
              </div>
            )}
          </div>

          {mastery.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <p className="text-slate-500 font-mono uppercase tracking-widest mb-1.5 text-[10px] font-bold">OVERALL SKILL MASTERY</p>
              <div className="flex items-baseline gap-1">
                <span className={`font-heading text-3xl font-black ${
                  Math.round(mastery.reduce((a, b) => a + b.score, 0) / mastery.length) >= 80 ? 'text-emerald-600' : 'text-[#3895D2]'
                }`}>
                  {Math.round(mastery.reduce((a, b) => a + b.score, 0) / mastery.length)}
                </span>
                <span className="text-slate-400 text-base font-bold">%</span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 font-medium">Avg across {mastery.length} topics</p>
            </div>
          )}
        </div>
      </div>
      
    </div>
  )
}
