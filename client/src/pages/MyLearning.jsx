import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { BookOpen, Clock, PlayCircle, Trophy, Sparkles } from 'lucide-react'

export default function MyLearning() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [allRes, listRes] = await Promise.all([
          api.get('/courses'),
          api.get('/courses/enrolled-list')
        ])

        const enrolledMap = new Map((listRes.data || []).map(e => [e.courseId, e]))
        const enrolledCourses = (allRes.data || [])
          .filter(c => enrolledMap.has(c._id))
          .map(c => ({
            ...c,
            enrollment: enrolledMap.get(c._id)
          }))

        setCourses(enrolledCourses)
      } catch (err) {
        console.error('Failed to load my learning progress:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const resumeCourse = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/activate`)
      navigate('/dashboard')
    } catch (err) {
      alert('Failed to set active course.')
    }
  }

  if (loading) return (
    <div className="space-y-4">
      {[1,2].map(i => <div key={i} className="h-44 rounded-xl bg-white border border-slate-200 shimmer" />)}
    </div>
  )

  return (
    <div className="page-enter">
      <div className="mb-6">
        <p className="font-mono text-[10px] text-[#3895D2] uppercase tracking-widest mb-1.5 font-bold">MY LEARNING SPACE</p>
        <p className="text-slate-500 text-xs md:text-sm">
          Track progress across all your enrolled tracks. Click continue on any course to load its path onto your Learning Command Center.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-xl shadow-xs">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-4" strokeWidth={1} />
          <h3 className="font-heading font-bold text-slate-800 text-lg mb-2">No Enrolled Courses Yet</h3>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-6">
            Explore DigiLearning's real-time catalog to start your full-stack, design, or blockchain learning journey.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-lg text-xs font-bold transition-all shadow-3xs"
          >
            Browse Course Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {courses.map((c) => {
            const progress = c.enrollment?.status === 'completed' ? 100 : 35 // fallback progress indicator
            return (
              <div 
                key={c._id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 bg-[#3895D2]/10 border border-[#3895D2]/25 text-[#3895D2] rounded uppercase tracking-wider">
                      {c.category}
                    </span>
                    {progress === 100 && (
                      <span className="flex items-center gap-1 font-mono text-[9px] font-bold px-2 py-0.5 bg-[#4FB286]/10 border border-[#4FB286]/25 text-[#4FB286] rounded uppercase tracking-wider">
                        <Trophy size={10} /> Completed
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-slate-800 text-base md:text-lg mb-2.5 truncate pr-8 group-hover:text-[#3895D2] transition-colors">
                    {c.title}
                  </h3>
                  
                  {/* Progress bar */}
                  <div className="flex items-center gap-3 max-w-md">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progress}%`,
                          backgroundColor: progress === 100 ? '#4FB286' : '#3895D2'
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-600">{progress}%</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-4 flex-shrink-0 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono text-xs font-semibold px-2">
                    <Clock size={14} />
                    <span>{c.estimatedHours || 10} hours total</span>
                  </div>

                  <button
                    onClick={() => resumeCourse(c._id)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-lg text-xs font-bold transition-all shadow-3xs"
                  >
                    <PlayCircle size={15} />
                    Resume Track
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
