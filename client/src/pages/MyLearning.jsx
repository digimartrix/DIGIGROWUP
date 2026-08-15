import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  BookOpen, Clock, PlayCircle, Trophy, Sparkles,
  ArrowRight, Video, FileText, CheckCircle2, Play
} from 'lucide-react'

export default function MyLearning() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'in_progress' | 'completed'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMyLearning()
  }, [])

  async function loadMyLearning() {
    setLoading(true)
    try {
      const res = await api.get('/courses/my-learning')
      setCourses(res.data || [])
    } catch (err) {
      console.error('Failed to load my learning progress:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleContinueLesson = async (courseId, nextLessonId) => {
    try {
      await api.post(`/courses/${courseId}/activate`)
      if (nextLessonId) {
        navigate(`/lesson/${nextLessonId}`)
      } else {
        navigate('/dashboard')
      }
    } catch {
      if (nextLessonId) navigate(`/lesson/${nextLessonId}`)
    }
  }

  const filtered = courses.filter(c => {
    if (filter === 'all') return true
    if (filter === 'completed') return c.progress === 100 || c.status === 'completed'
    if (filter === 'in_progress') return c.progress < 100 && c.status !== 'completed'
    return true
  })

  if (loading) return (
    <div className="space-y-4 page-enter">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-44 rounded-3xl bg-white border border-slate-200 shimmer" />
      ))}
    </div>
  )

  return (
    <div className="space-y-6 page-enter">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-600 uppercase tracking-widest font-bold text-[10px]">
              MY LEARNING JOURNEY
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
            Active Courses & Progress Center
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Pick up right where you left off. Watch video lectures or read chapter PDF guides at your own pace.
          </p>
        </div>

        <button
          onClick={() => navigate('/explore')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 flex-shrink-0"
        >
          <BookOpen size={14} />
          <span>Explore More Tracks</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit shadow-2xs">
        {[
          { id: 'all', label: 'All Courses', count: courses.length },
          { id: 'in_progress', label: 'In Progress', count: courses.filter(c => c.progress < 100).length },
          { id: 'completed', label: 'Completed', count: courses.filter(c => c.progress === 100).length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Courses List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-xs">
          <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-heading font-bold text-slate-800 text-lg mb-1">
            {filter === 'all' ? 'No Enrolled Courses Yet' : `No ${filter.replace('_', ' ')} courses`}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6">
            Explore our curated video and PDF engineering curriculum to start learning.
          </p>
          <button
            onClick={() => navigate('/explore')}
            className="px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Browse Course Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const course = item.course
            const progress = item.progress || 0
            const nextLesson = item.nextLesson
            return (
              <div
                key={item.enrollmentId}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
              >
                {/* Left Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      course.courseType === 'pdf'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-sky-50 text-[#3895D2] border border-sky-200'
                    }`}>
                      {course.courseType === 'pdf' ? '📄 PDF Course' : '🎥 Video Course'}
                    </span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-slate-600 text-xs font-semibold">{course.category}</span>
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="text-slate-500 text-xs font-mono">{course.difficulty}</span>
                    
                    {progress === 100 && (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                        <Trophy size={11} /> Mastered
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-bold text-slate-900 text-base md:text-lg mb-1.5 truncate group-hover:text-[#3895D2] transition-colors">
                    {course.title}
                  </h3>

                  {/* Dynamic Next Lesson Box */}
                  {nextLesson && (
                    <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 max-w-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                          {course.courseType === 'pdf' ? <FileText size={12} className="text-emerald-600" /> : <Play size={12} className="text-[#3895D2]" />}
                        </div>
                        <div className="min-w-0 text-xs">
                          <p className="text-slate-400 text-[10px] font-mono uppercase font-bold">Next Lesson</p>
                          <p className="font-bold text-slate-800 truncate">{nextLesson.title}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                        {nextLesson.moduleTitle}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mt-4 max-w-md">
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <span className="text-slate-500 font-medium">
                        {item.completedLessonsCount || 0} of {item.totalLessons || 0} completed
                      </span>
                      <span className={`font-black ${progress === 100 ? 'text-emerald-600' : 'text-[#3895D2]'}`}>
                        {progress}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          progress === 100 ? 'bg-emerald-500' : 'bg-[#3895D2]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex-shrink-0 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleContinueLesson(course._id, nextLesson?._id)}
                    className={`w-full md:w-auto px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 group-hover:scale-102 ${
                      progress === 100
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#3895D2] hover:bg-[#2c7db5] text-white'
                    }`}
                  >
                    <span>{progress === 100 ? 'Review Course' : 'Continue Learning'}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
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
