import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  Clock, Globe, Code, Cpu, Database,
  ArrowRight, ShieldCheck, Sparkles, AlertCircle,
  CheckCircle2, Video, FileText, Search, BookOpen,
  Users, Check, X, Layers
} from 'lucide-react'

export default function Explore() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [courses, setCourses] = useState([])
  const [enrolledIds, setEnrolledIds] = useState([])
  const [creditsBalance, setCreditsBalance] = useState(user?.creditsBalance || 0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All') // 'All' | 'video' | 'pdf'
  const [difficultyFilter, setDifficultyFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Course Details Modal
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [coursesRes, enrolledRes, balanceRes] = await Promise.allSettled([
        api.get('/courses'),
        api.get('/courses/enrolled-list'),
        api.get('/credits/balance'),
      ])

      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data || [])
      if (enrolledRes.status === 'fulfilled') {
        const ids = (enrolledRes.value.data || []).map(e => e.courseId?.toString() || e.toString())
        setEnrolledIds(ids)
      }
      if (balanceRes.status === 'fulfilled') setCreditsBalance(balanceRes.value.data?.balance ?? user?.creditsBalance ?? 0)
    } catch (err) {
      console.error('Failed to load courses:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = async (courseId) => {
    setLoadingDetails(true)
    try {
      const res = await api.get(`/courses/${courseId}`)
      setSelectedCourseDetails(res.data)
    } catch {
      showToast('Failed to load course details.', true)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleEnroll = async (course) => {
    setSubmitting(course._id)
    try {
      const isEnrolled = enrolledIds.includes(course._id.toString())
      if (isEnrolled) {
        await api.post(`/courses/${course._id}/activate`)
        navigate('/dashboard')
        return
      }

      const cost = Number(course.creditsCost || 0)
      if (cost > 0 && creditsBalance < cost) {
        showToast(`Insufficient credits! You have ${creditsBalance} DigiCredits, but this course requires ${cost} credits. Complete challenges or quizzes to earn more!`, true)
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
      if (selectedCourseDetails?._id === course._id) {
        setSelectedCourseDetails(null)
      }
      navigate('/my-learning')
    } catch (err) {
      showToast(err.response?.data?.message || 'Enrollment failed.', true)
    } finally {
      setSubmitting(null)
    }
  }

  // Filtered list
  const filteredCourses = courses.filter(c => {
    if (categoryFilter !== 'All' && c.category?.toLowerCase() !== categoryFilter.toLowerCase()) return false
    if (typeFilter !== 'All' && c.courseType !== typeFilter) return false
    if (difficultyFilter !== 'All' && c.difficulty !== difficultyFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = c.title?.toLowerCase().includes(q)
      const matchesDesc = c.description?.toLowerCase().includes(q)
      const matchesCat = c.category?.toLowerCase().includes(q)
      if (!matchesTitle && !matchesDesc && !matchesCat) return false
    }
    return true
  })

  return (
    <div className="space-y-6 page-enter">
      
      {/* Toast Notification */}
      {toast.msg && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs ${
          toast.isErr ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.isErr ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-600" />}
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast({ msg: '', isErr: false })} className="text-xs opacity-70">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-600 uppercase tracking-widest font-bold text-[10px]">
              VERIFIED ENGINEERING CURRICULUM
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-slate-900 tracking-tight">
            Explore Learning Tracks
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium max-w-xl">
            Choose from industry-vetted <strong>🎥 Video Lecture Tracks</strong> and in-depth <strong>📄 PDF Handbooks</strong> with integrated AI tutoring.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-sky-50 border border-sky-100 px-4 py-2.5 rounded-2xl flex-shrink-0">
          <Sparkles size={18} className="text-[#3895D2]" />
          <div>
            <p className="text-[10px] font-mono uppercase font-bold text-slate-500">Your DigiCredits</p>
            <p className="font-heading font-black text-base text-[#3895D2]">{creditsBalance} Credits</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses, skills, frameworks, or topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none focus:border-[#3895D2]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Delivery Type Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto justify-between">
              {[
                { id: 'All', label: 'All Formats' },
                { id: 'video', label: '🎥 Videos' },
                { id: 'pdf', label: '📄 PDFs' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    typeFilter === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase font-bold mr-1">Category:</span>
          {['All', 'Web Development', 'Mobile App Dev', 'Data Science & AI', 'Cloud & DevOps', 'Cybersecurity', 'UI/UX Design'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 rounded-3xl bg-white border border-slate-200 shimmer" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <BookOpen size={36} className="text-slate-400 mx-auto mb-3" />
          <h4 className="font-heading font-bold text-slate-800 text-base">No matching courses</h4>
          <p className="text-slate-500 text-xs mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map(course => {
            const isEnrolled = enrolledIds.includes(course._id.toString())
            return (
              <div
                key={course._id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Thumbnail / Header */}
                  <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white">
                        {course.courseType === 'pdf' ? <FileText size={40} className="text-emerald-400 opacity-80" /> : <Video size={40} className="text-sky-400 opacity-80" />}
                      </div>
                    )}

                    {/* Delivery Format Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
                        course.courseType === 'pdf'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#3895D2] text-white'
                      }`}>
                        {course.courseType === 'pdf' ? <FileText size={11} /> : <Video size={11} />}
                        <span>{course.courseType === 'pdf' ? 'PDF Course' : 'Video Course'}</span>
                      </span>
                    </div>

                    {/* Cost Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-black/60 backdrop-blur-xs text-white">
                        {course.creditsCost > 0 ? `${course.creditsCost} Credits` : 'Free Track'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mb-1.5">
                      <span className="font-bold text-slate-700">{course.category}</span>
                      <span>·</span>
                      <span>{course.difficulty}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {course.estimatedDuration || `${course.estimatedHours || 10}h`}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-slate-900 text-base leading-snug mb-1.5 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2 mb-3">
                      {course.description}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="truncate max-w-[150px]">By <strong>{course.instructorName}</strong></span>
                      <span className="font-mono text-[11px]">{course.moduleCount || 0} modules · {course.lessonCount || 0} lessons</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDetails(course._id)}
                    className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all text-center"
                  >
                    View Syllabus
                  </button>

                  <button
                    onClick={() => handleEnroll(course)}
                    disabled={submitting === course._id}
                    className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                      isEnrolled
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#3895D2] hover:bg-[#2c7db5] text-white'
                    }`}
                  >
                    {isEnrolled ? (
                      <>
                        <Check size={13} />
                        <span>Continue</span>
                      </>
                    ) : (
                      <>
                        <span>Enroll Now</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          COURSE DETAILS & SYLLABUS MODAL
      ══════════════════════════════════════════════ */}
      {selectedCourseDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    selectedCourseDetails.courseType === 'pdf' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-[#3895D2]'
                  }`}>
                    {selectedCourseDetails.courseType === 'pdf' ? '📄 PDF Document Track' : '🎥 Video Lecture Track'}
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-slate-500 text-xs font-semibold">{selectedCourseDetails.category}</span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-slate-500 text-xs font-mono">{selectedCourseDetails.difficulty}</span>
                </div>
                <h3 className="font-heading font-black text-slate-900 text-xl">
                  {selectedCourseDetails.title}
                </h3>
                <p className="text-slate-500 text-xs font-medium mt-1">
                  Instructor: <strong>{selectedCourseDetails.instructorName}</strong> · Estimated Duration: {selectedCourseDetails.estimatedDuration || '10 hours'}
                </p>
              </div>
              <button onClick={() => setSelectedCourseDetails(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              <div>
                <h4 className="font-heading font-bold text-slate-900 text-sm mb-1.5">About this Track</h4>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  {selectedCourseDetails.description}
                </p>
              </div>

              {/* Objectives */}
              {selectedCourseDetails.learningObjectives?.length > 0 && (
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm mb-2">What you will learn</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedCourseDetails.learningObjectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Syllabus Breakdown */}
              <div>
                <h4 className="font-heading font-bold text-slate-900 text-sm mb-3">Curriculum Syllabus</h4>
                <div className="space-y-3">
                  {(selectedCourseDetails.modules || []).map((mod, idx) => (
                    <div key={mod._id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-100/70 flex items-center justify-between font-heading font-bold text-xs text-slate-800">
                        <span>Module {idx + 1}: {mod.title}</span>
                        <span className="font-mono text-slate-500 font-normal">{(mod.lessons || []).length} lessons</span>
                      </div>
                      <div className="divide-y divide-slate-200/50 p-2">
                        {(mod.lessons || []).map(l => (
                          <div key={l._id} className="py-1.5 px-2 flex items-center justify-between text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              {selectedCourseDetails.courseType === 'pdf' ? <FileText size={13} className="text-emerald-600" /> : <Video size={13} className="text-[#3895D2]" />}
                              <span>{l.title}</span>
                            </div>
                            {l.duration > 0 && (
                              <span className="font-mono text-[11px] text-slate-400">{Math.round(l.duration / 60)} min</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Access Cost</p>
                <p className="font-heading font-black text-slate-900 text-base">
                  {selectedCourseDetails.creditsCost > 0 ? `${selectedCourseDetails.creditsCost} DigiCredits` : 'Free Track'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedCourseDetails(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                >
                  Close
                </button>
                <button
                  onClick={() => handleEnroll(selectedCourseDetails)}
                  className="px-6 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>{enrolledIds.includes(selectedCourseDetails._id) ? 'Continue Course' : 'Enroll & Start Learning'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
