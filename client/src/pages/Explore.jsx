import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  ChevronRight, Clock, Globe, Code, Cpu, Database, Bookmark, ArrowRight, ShieldCheck
} from 'lucide-react'

const ICON_MAP = {
  'Web Development Fundamentals': Globe,
  'React & Modern Frontend': Code,
  'Node.js & REST APIs': Database,
  'System Design Fundamentals': Cpu,
}

const COLOR_MAP = {
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
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [activeCourseId, setActiveCourseId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [allRes, listRes, activeRes] = await Promise.all([
          api.get('/courses'),
          api.get('/courses/enrolled-list'),
          api.get('/courses/enrolled'),
        ])
        setCourses(allRes.data || [])
        setEnrolledIds((listRes.data || []).map(e => e.courseId))
        setActiveCourseId(activeRes.data?._id || null)
      } catch (err) {
        console.error('Failed to load courses:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAction = async (courseId, isEnrolled) => {
    setSubmitting(courseId)
    try {
      if (isEnrolled) {
        await api.post(`/courses/${courseId}/activate`)
      } else {
        await api.post(`/courses/${courseId}/enroll`)
      }
      navigate('/dashboard')
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.')
    } finally {
      setSubmitting(null)
    }
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-md bg-white border border-slate-200 shimmer" />)}
    </div>
  )

  return (
    <div className="page-enter">
      {/* Header Info */}
      <div className="mb-8">
        <p className="font-mono text-[10px] text-[#EA4532] uppercase tracking-widest mb-1.5 font-bold">COURSE CATALOG</p>
        <p className="text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed">
          Select a specialized track. Once enrolled, the curriculum structure, exercises, and quizzes will map instantly to your learning command center.
        </p>
      </div>

      {/* Course Catalog Grid (Premium Next-Level Layout Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {courses.map((course) => {
          const Icon = ICON_MAP[course.title] || Globe
          const color = COLOR_MAP[course.title] || '#3895D2'
          const isEnrolled = enrolledIds.includes(course._id)
          const isActive = activeCourseId === course._id

          return (
            <div
              key={course._id}
              className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1.5 transform transition-all duration-300 flex flex-col justify-between border-l-4 relative group`}
              style={{ borderLeftColor: color, borderColor: isActive ? '#EA4532' : '#E2E8F0' }}
            >
              
              {/* Header status bar tags */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                {isActive ? (
                  <span className="flex items-center gap-1 bg-[#EA4532]/10 border border-[#EA4532]/25 rounded-full px-2.5 py-0.5 text-[#EA4532] font-mono text-[9px] uppercase font-bold tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EA4532] animate-pulse" />
                    Active Track
                  </span>
                ) : isEnrolled ? (
                  <span className="flex items-center gap-1 bg-[#3895D2]/10 border border-[#3895D2]/25 rounded-full px-2.5 py-0.5 text-[#3895D2] font-mono text-[9px] uppercase font-bold tracking-wider">
                    <Bookmark size={10} fill="currentColor" />
                    Enrolled
                  </span>
                ) : null}
              </div>

              {/* Card Body */}
              <div className="p-6">
                
                {/* Course Icon Badge wrapper (glowing background matching brand color) */}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 border transition-transform duration-300 group-hover:scale-105"
                  style={{ 
                    borderColor: `${color}25`, 
                    backgroundColor: `${color}08`,
                    boxShadow: `0 0 12px ${color}10` 
                  }}
                >
                  <Icon size={20} strokeWidth={1.5} style={{ color }} />
                </div>

                <h3 className="font-heading font-bold text-slate-850 text-base md:text-lg mb-2.5 pr-20 group-hover:text-slate-900 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-550 text-xs md:text-sm leading-relaxed mb-6 font-medium">
                  {course.description}
                </p>
              </div>

              {/* Card Footer Details & Actions */}
              <div className="px-6 pb-6 pt-4 border-t border-slate-50 bg-slate-50/50 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-slate-500 font-mono text-xs font-semibold">
                    <Clock size={13} strokeWidth={1.5} className="text-slate-400" />
                    <span>{course.estimatedHours || 10} hours estimated</span>
                  </div>
                  
                  <span 
                    className="font-mono text-[9px] font-bold px-2 py-0.5 rounded border tracking-wider"
                    style={{
                      color: DIFFICULTY_COLORS[course.difficulty],
                      borderColor: `${DIFFICULTY_COLORS[course.difficulty]}30`,
                      backgroundColor: `${DIFFICULTY_COLORS[course.difficulty]}10`,
                    }}
                  >
                    {course.difficulty?.toUpperCase()}
                  </span>
                </div>

                {isActive ? (
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-[#3895D2] hover:bg-[#2c7db5] text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-3xs flex items-center justify-center gap-2 group/btn"
                  >
                    Study Active Track
                    <ArrowRight size={13} strokeWidth={2} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(course._id, isEnrolled)}
                    disabled={submitting !== null}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-3xs ${
                      isEnrolled
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 hover:border-slate-350'
                        : 'bg-[#3895D2] hover:bg-[#2c7db5] text-white'
                    }`}
                  >
                    {submitting === course._id ? (
                      'Processing...'
                    ) : isEnrolled ? (
                      <>
                        <ShieldCheck size={13} />
                        Activate & Study Track
                      </>
                    ) : (
                      <>
                        Enroll in Track
                        <ChevronRight size={13} />
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
