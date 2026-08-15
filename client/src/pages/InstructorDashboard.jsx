import { useState, useEffect } from 'react'
import api from '../lib/api'
import CourseBuilder from '../components/CourseBuilder'
import {
  BookOpen, Plus, Trash2, Edit3, ChevronRight,
  FileText, HelpCircle, Layers, CheckCircle2, AlertCircle,
  Eye, Sparkles, Clock, BarChart2, Video, Download,
  Calendar, ExternalLink, X, Users, Send, TrendingUp, Check
} from 'lucide-react'

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('courses') // 'courses' | 'events' | 'resources' | 'projects'
  
  // Instructor Stats & Courses
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    pendingCourses: 0,
    totalStudents: 0,
    avgCompletion: 0,
  })
  const [courses, setCourses] = useState([])
  const [courseFilter, setCourseFilter] = useState('all') // 'all' | 'published' | 'draft' | 'submitted'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Course Builder Modal State
  const [builderOpen, setBuilderOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  // Analytics Modal State
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Enrolled Students Modal State
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [studentsList, setStudentsList] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [activeCourseTitle, setActiveCourseTitle] = useState('')

  // Events, Resources, Projects State
  const [events, setEvents] = useState([])
  const [resources, setResources] = useState([])
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetchInstructorData()
    fetchEvents()
    fetchResources()
    fetchProjects()
  }, [])

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setError(msg)
      setTimeout(() => setError(''), 4000)
    } else {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  const fetchInstructorData = async () => {
    setLoading(true)
    try {
      const [statsRes, coursesRes] = await Promise.all([
        api.get('/instructor/stats'),
        api.get('/instructor/courses'),
      ])
      setStats(statsRes.data || {})
      setCourses(coursesRes.data || [])
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load instructor courses.', true)
    } finally {
      setLoading(false)
    }
  }

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events')
      setEvents(data || [])
    } catch { /* ignore */ }
  }

  const fetchResources = async () => {
    try {
      const { data } = await api.get('/resources')
      setResources(data || [])
    } catch { /* ignore */ }
  }

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects')
      setProjects(data || [])
    } catch { /* ignore */ }
  }

  // Open Course Builder to Create Course
  const handleOpenCreateCourse = () => {
    setSelectedCourseId(null)
    setBuilderOpen(true)
  }

  // Open Course Builder to Edit Curriculum
  const handleOpenEditCourse = (courseId) => {
    setSelectedCourseId(courseId)
    setBuilderOpen(true)
  }

  // Open Analytics Modal
  const handleOpenAnalytics = async (course) => {
    setActiveCourseTitle(course.title)
    setAnalyticsOpen(true)
    setLoadingAnalytics(true)
    try {
      const { data } = await api.get(`/instructor/courses/${course._id}/analytics`)
      setAnalyticsData(data)
    } catch (err) {
      showToast('Failed to load course analytics.', true)
      setAnalyticsOpen(false)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  // Open Enrolled Students Modal
  const handleOpenStudents = async (course) => {
    setActiveCourseTitle(course.title)
    setStudentsOpen(true)
    setLoadingStudents(true)
    try {
      const { data } = await api.get(`/instructor/courses/${course._id}/students`)
      setStudentsList(data || [])
    } catch (err) {
      showToast('Failed to load enrolled learners.', true)
      setStudentsOpen(false)
    } finally {
      setLoadingStudents(false)
    }
  }

  // Submit Course for Review
  const handleSubmitCourse = async (courseId) => {
    try {
      await api.post(`/instructor/courses/${courseId}/submit`)
      showToast('Course submitted for Admin review!')
      fetchInstructorData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit course.', true)
    }
  }

  // Delete Course
  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return
    try {
      await api.delete(`/instructor/courses/${courseId}`)
      showToast(`Course "${title}" deleted successfully.`)
      fetchInstructorData()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete course.', true)
    }
  }

  const filteredCourses = courses.filter(c => {
    if (courseFilter === 'all') return true
    if (courseFilter === 'published') return c.status === 'published'
    if (courseFilter === 'draft') return c.status === 'draft'
    if (courseFilter === 'submitted') return ['submitted', 'under_review'].includes(c.status)
    return true
  })

  return (
    <div className="space-y-6 page-enter">
      
      {/* Toast Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 text-xs">Dismiss</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-600 uppercase tracking-widest font-bold text-[10px]">
              INSTRUCTOR AUTHORING PORTAL
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
            Instructor Studio & Curriculum Management
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Design video courses, author PDF guides, manage syllabus trees, and track learner completion.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleOpenCreateCourse}
            className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs flex items-center gap-2 flex-shrink-0"
          >
            <Sparkles size={16} className="text-indigo-600" />
            <span>AI PDF to Course</span>
          </button>

          <button
            onClick={handleOpenCreateCourse}
            className="px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-2 flex-shrink-0"
          >
            <Plus size={16} />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Real-time Instructor Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total Courses', value: stats.totalCourses || courses.length, color: '#3895D2', bg: 'border-l-[#3895D2]' },
          { label: 'Published', value: stats.publishedCourses || 0, color: '#10B981', bg: 'border-l-emerald-500' },
          { label: 'Drafts', value: stats.draftCourses || 0, color: '#64748B', bg: 'border-l-slate-400' },
          { label: 'Total Students', value: stats.totalStudents || 0, color: '#0284C7', bg: 'border-l-sky-500' },
          { label: 'Avg Completion', value: `${stats.avgCompletion || 0}%`, color: '#10B981', bg: 'border-l-emerald-500' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs border-l-4 ${bg}`}>
            <p className="text-slate-500 font-mono uppercase tracking-widest text-[10px] font-bold mb-1">{label}</p>
            <span className="font-heading text-2xl font-black" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Tabs Navigation (Courses, Events, Resources, Projects) */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1.5">
        {[
          { id: 'courses', label: 'Courses', icon: BookOpen, count: courses.length },
          { id: 'events', label: 'Live Events', icon: Calendar, count: events.length },
          { id: 'resources', label: 'Resources', icon: FileText, count: resources.length },
          { id: 'projects', label: 'Projects', icon: Layers, count: projects.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Icon size={15} />
            <span>{label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeTab === id ? 'bg-slate-100 text-slate-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB 1: COURSES MANAGEMENT & DIRECTORY
      ══════════════════════════════════════════════ */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          
          {/* Status Filters */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-2xs">
              {[
                { id: 'all', label: 'All Courses' },
                { id: 'published', label: 'Published' },
                { id: 'draft', label: 'Drafts' },
                { id: 'submitted', label: 'Pending Review' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setCourseFilter(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    courseFilter === id ? 'bg-[#0F172A] text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <span className="text-xs font-medium text-slate-500">
              Showing {filteredCourses.length} of {courses.length} courses
            </span>
          </div>

          {/* Courses Table / Cards */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 shimmer" />
              ))}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
              <BookOpen size={36} className="text-slate-400 mx-auto mb-3" />
              <h4 className="font-heading font-bold text-slate-800 text-base">No courses found</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                {courseFilter === 'all'
                  ? "You haven't created any courses yet. Start by building your first video lecture track or PDF document guide."
                  : `No courses match the "${courseFilter}" status filter.`}
              </p>
              {courseFilter === 'all' && (
                <button
                  onClick={handleOpenCreateCourse}
                  className="mt-4 px-5 py-2 bg-[#3895D2] text-white rounded-xl text-xs font-bold hover:bg-[#2c7db5] shadow-xs"
                >
                  + Create Your First Course
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredCourses.map((c) => (
                <div
                  key={c._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail & Course Info */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 overflow-hidden">
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                      ) : c.courseType === 'pdf' ? (
                        <FileText size={24} className="text-emerald-600" />
                      ) : (
                        <Video size={24} className="text-[#3895D2]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          c.courseType === 'pdf'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-50 text-[#3895D2] border border-sky-200'
                        }`}>
                          {c.courseType === 'pdf' ? '📄 PDF Course' : '🎥 Video Course'}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'submitted'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : c.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {c.status}
                        </span>

                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-slate-500 text-xs font-semibold">{c.category}</span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-slate-500 text-xs font-mono">{c.difficulty}</span>
                      </div>

                      <h4 className="font-heading font-bold text-slate-900 text-base leading-tight truncate">
                        {c.title}
                      </h4>

                      {c.rejectionReason && (
                        <p className="text-rose-600 text-xs mt-1 font-medium bg-rose-50 p-2 rounded-lg border border-rose-100">
                          Rejection feedback: {c.rejectionReason}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-slate-500 text-xs font-mono mt-2 flex-wrap">
                        <span>{c.moduleCount || 0} {c.courseType === 'pdf' ? 'chapters' : 'modules'}</span>
                        <span>{c.lessonCount || 0} {c.courseType === 'pdf' ? 'documents' : 'lessons'}</span>
                        <span className="text-slate-800 font-bold">{c.enrolledStudentsCount || 0} learners</span>
                        <span className="text-emerald-600 font-bold">{c.avgCompletion || 0}% avg progress</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleOpenEditCourse(c._id)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Edit3 size={13} />
                      <span>Edit Curriculum</span>
                    </button>

                    <button
                      onClick={() => handleOpenAnalytics(c)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      <BarChart2 size={13} className="text-[#3895D2]" />
                      <span>Analytics</span>
                    </button>

                    <button
                      onClick={() => handleOpenStudents(c)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                    >
                      <Users size={13} className="text-emerald-600" />
                      <span>Students ({c.enrolledStudentsCount || 0})</span>
                    </button>

                    {c.status === 'draft' || c.status === 'rejected' ? (
                      <button
                        onClick={() => handleSubmitCourse(c._id)}
                        className="px-3.5 py-2 bg-[#3895D2]/10 hover:bg-[#3895D2]/20 text-[#3895D2] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Send size={13} />
                        <span>Submit</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleDeleteCourse(c._id, c.title)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB 2, 3, 4: EVENTS, RESOURCES, PROJECTS
      ══════════════════════════════════════════════ */}
      {activeTab !== 'courses' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <h4 className="font-heading font-bold text-slate-900 text-base mb-4 capitalize">
            Active {activeTab}
          </h4>
          <p className="text-slate-500 text-xs">
            Manage your live workshops, downloadable study guides, and ecosystem projects.
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          COURSE BUILDER MODAL
      ══════════════════════════════════════════════ */}
      <CourseBuilder
        isOpen={builderOpen}
        onClose={() => setBuilderOpen(false)}
        initialCourseId={selectedCourseId}
        onSaved={fetchInstructorData}
      />

      {/* ══════════════════════════════════════════════
          REAL COURSE ANALYTICS MODAL
      ══════════════════════════════════════════════ */}
      {analyticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h4 className="font-heading font-black text-slate-900 text-base sm:text-lg">
                  Course Analytics: {activeCourseTitle}
                </h4>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Real-time learner engagement and completion metrics</p>
              </div>
              <button onClick={() => setAnalyticsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {loadingAnalytics ? (
                <div className="text-center py-12 text-slate-400 text-xs animate-pulse">Calculating metrics...</div>
              ) : analyticsData ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
                      <p className="text-sky-800 text-[10px] font-mono font-bold uppercase">Enrollments</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{analyticsData.totalEnrollments || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <p className="text-amber-800 text-[10px] font-mono font-bold uppercase">Active Learners</p>
                      <p className="text-2xl font-black text-slate-900 mt-1">{analyticsData.activeStudents || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <p className="text-emerald-800 text-[10px] font-mono font-bold uppercase">Completed</p>
                      <p className="text-2xl font-black text-emerald-700 mt-1">{analyticsData.completedStudents || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                      <p className="text-indigo-800 text-[10px] font-mono font-bold uppercase">Avg Progress</p>
                      <p className="text-2xl font-black text-indigo-700 mt-1">{analyticsData.avgProgress || 0}%</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-heading font-bold text-slate-900 text-sm mb-3">Lesson-by-Lesson Completion Funnel</h5>
                    <div className="space-y-2">
                      {(analyticsData.lessonBreakdown || []).map((l, idx) => (
                        <div key={l.lessonId} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                            <span className="font-bold text-slate-800 truncate">{l.title}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-[#3895D2] h-full" style={{ width: `${l.completionRate}%` }} />
                            </div>
                            <span className="font-mono font-bold text-slate-700 w-12 text-right">{l.completionRate}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setAnalyticsOpen(false)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ENROLLED STUDENTS MODAL
      ══════════════════════════════════════════════ */}
      {studentsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <h4 className="font-heading font-black text-slate-900 text-base sm:text-lg">
                  Enrolled Learners: {activeCourseTitle}
                </h4>
                <p className="text-slate-500 text-xs font-medium mt-0.5">Individual progress and engagement tracking</p>
              </div>
              <button onClick={() => setStudentsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {loadingStudents ? (
                <div className="text-center py-12 text-slate-400 text-xs animate-pulse">Loading learners...</div>
              ) : studentsList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No students currently enrolled in this track.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {studentsList.map((st) => (
                    <div key={st.enrollmentId} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center font-mono font-bold text-[#3895D2] flex-shrink-0">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading font-bold text-slate-900 text-xs sm:text-sm truncate">{st.name}</p>
                          <p className="text-slate-400 text-[11px] truncate">{st.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <span className={`font-mono font-black text-xs sm:text-sm ${
                            st.progress === 100 ? 'text-emerald-600' : 'text-[#3895D2]'
                          }`}>
                            {st.progress}%
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {st.status === 'completed' ? 'Completed' : 'In Progress'}
                          </p>
                        </div>

                        <div className="w-20 sm:w-28 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${st.progress === 100 ? 'bg-emerald-500' : 'bg-[#3895D2]'}`}
                            style={{ width: `${st.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 flex-shrink-0">
              <button onClick={() => setStudentsOpen(false)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
