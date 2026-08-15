import { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Users, BookOpen, Shield, Award, Calendar, Trophy,
  ChevronRight, Activity, Search, RefreshCw, Trash2, UserCheck,
  ShieldCheck, AlertCircle, CheckCircle2, Clock, Filter, Layers,
  Sparkles, Plus, Edit2, Coins, ArrowUpRight, ArrowDownRight,
  ExternalLink, X, Send, Eye, Check, Video, FileText
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'reviews' | 'courses' | 'users' | 'logs'
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Pending Reviews Tab State
  const [pendingCourses, setPendingCourses] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)
  const [previewCourse, setPreviewCourse] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [rejectModalCourse, setRejectModalCourse] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('Please ensure all video/document links are accessible and syllabus is complete.')

  // Users Tab State
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [creditModalUser, setCreditModalUser] = useState(null)
  const [creditAmount, setCreditAmount] = useState(50)
  const [creditReason, setCreditReason] = useState('Community Contribution Award')

  // Courses Tab State
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Logs Tab State
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logActionFilter, setLogActionFilter] = useState('all')
  const [logPage, setLogPage] = useState(1)
  const [logTotalPages, setLogTotalPages] = useState(1)

  // Toast
  const [toast, setToast] = useState({ msg: '', isErr: false })

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  useEffect(() => {
    fetchStats()
    fetchPendingCourses()
  }, [])

  useEffect(() => {
    if (activeTab === 'reviews') fetchPendingCourses()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'courses') fetchCourses()
    if (activeTab === 'logs') fetchLogs(1)
  }, [activeTab, userRoleFilter, logActionFilter])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const res = await api.get('/admin/overview')
      if (res.data?.success) setStats(res.data.data)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load system metrics.', true)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchPendingCourses = async () => {
    setLoadingPending(true)
    try {
      const res = await api.get('/admin/courses/pending')
      setPendingCourses(res.data || [])
    } catch (err) {
      showToast('Failed to load pending course reviews.', true)
    } finally {
      setLoadingPending(false)
    }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const params = {}
      if (userRoleFilter !== 'all') params.role = userRoleFilter
      if (userSearch.trim()) params.search = userSearch.trim()
      const res = await api.get('/admin/users', { params })
      setUsers(res.data || [])
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load user accounts.', true)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchCourses = async () => {
    setLoadingCourses(true)
    try {
      const res = await api.get('/admin/courses')
      setCourses(res.data || [])
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load courses.', true)
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchLogs = async (page = 1) => {
    setLoadingLogs(true)
    try {
      const params = { page, limit: 25 }
      if (logActionFilter !== 'all') params.action = logActionFilter
      const res = await api.get('/admin/logs', { params })
      setLogs(res.data?.logs || [])
      setLogPage(res.data?.page || 1)
      setLogTotalPages(res.data?.pages || 1)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load audit logs.', true)
    } finally {
      setLoadingLogs(false)
    }
  }

  // Course Review Actions
  const handleOpenPreview = async (courseId) => {
    setLoadingPreview(true)
    try {
      const res = await api.get(`/admin/courses/${courseId}/preview`)
      setPreviewCourse(res.data)
    } catch (err) {
      showToast('Failed to load course preview.', true)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleApproveCourse = async (courseId, title) => {
    try {
      await api.put(`/admin/courses/${courseId}/approve`)
      showToast(`🎉 "${title}" has been APPROVED and published to Explore Tracks!`)
      fetchPendingCourses()
      fetchStats()
      if (previewCourse?._id === courseId) setPreviewCourse(null)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve course.', true)
    }
  }

  const handleRejectCourse = async () => {
    if (!rejectModalCourse) return
    try {
      await api.put(`/admin/courses/${rejectModalCourse._id}/reject`, { rejectionReason })
      showToast(`Course "${rejectModalCourse.title}" rejected with feedback.`)
      setRejectModalCourse(null)
      fetchPendingCourses()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject course.', true)
    }
  }

  const handleToggleCourseStatus = async (courseId, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'unpublished' : 'published'
    try {
      await api.put(`/admin/courses/${courseId}/status`, { status: nextStatus })
      showToast(`Course status changed to "${nextStatus}".`)
      fetchCourses()
      fetchStats()
    } catch (err) {
      showToast('Failed to toggle status.', true)
    }
  }

  // User Actions
  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole })
      showToast(res.data?.message || 'Role updated successfully.')
      fetchUsers()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user role.', true)
    }
  }

  const handleAdjustCredits = async (e) => {
    e.preventDefault()
    if (!creditModalUser) return
    try {
      const res = await api.put(`/admin/users/${creditModalUser._id}/credits`, {
        amount: creditAmount,
        reason: creditReason
      })
      showToast(res.data?.message || 'Credits adjusted successfully.')
      setCreditModalUser(null)
      fetchUsers()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to adjust credits.', true)
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return
    try {
      const res = await api.delete(`/admin/users/${userId}`)
      showToast(res.data?.message || 'User deleted.')
      fetchUsers()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user.', true)
    }
  }

  return (
    <div className="space-y-6 page-enter">
      
      {/* Toast Notification */}
      {toast.msg && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs ${
          toast.isErr
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.isErr ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-600" />}
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast({ msg: '', isErr: false })} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-emerald-600 uppercase tracking-widest font-bold text-[10px]">
              ADMINISTRATION COMMAND & MODERATION
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 tracking-tight">
            Platform Operations & Course Review Center
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
            Moderate submitted curriculum, govern accounts, monitor real-time credit transactions, and audit security events.
          </p>
        </div>

        <button
          onClick={() => { fetchStats(); fetchPendingCourses(); }}
          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 flex-shrink-0"
        >
          <RefreshCw size={14} className={loadingStats ? 'animate-spin text-[#3895D2]' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 5 Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          { label: 'Total Students', value: stats?.studentsCount ?? 0, color: '#3895D2', bg: 'border-l-[#3895D2]' },
          { label: 'Total Instructors', value: stats?.instructorsCount ?? 0, color: '#0284C7', bg: 'border-l-sky-500' },
          { label: 'Published Courses', value: stats?.publishedCoursesCount ?? 0, color: '#10B981', bg: 'border-l-emerald-500' },
          { label: 'Pending Reviews', value: stats?.pendingReviewsCount ?? pendingCourses.length, color: '#F59E0B', bg: 'border-l-amber-500' },
          { label: 'Total Users', value: stats?.totalUsersCount ?? 0, color: '#6366F1', bg: 'border-l-indigo-500' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs border-l-4 ${bg}`}>
            <p className="text-slate-500 font-mono uppercase tracking-widest text-[10px] font-bold mb-1">{label}</p>
            <span className="font-heading text-2xl font-black" style={{ color }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Tab Selector */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 flex flex-wrap gap-1.5">
        {[
          { id: 'overview', label: 'Ecosystem Overview', icon: Activity },
          { id: 'reviews', label: 'Course Review Queue', icon: ShieldCheck, badge: pendingCourses.length },
          { id: 'courses', label: 'Course Catalog', icon: BookOpen, count: stats?.coursesCount || courses.length },
          { id: 'users', label: 'User Management', icon: Users, count: stats?.totalUsersCount || users.length },
          { id: 'logs', label: 'Audit Stream', icon: Shield },
        ].map(({ id, label, icon: Icon, count, badge }) => (
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
            {badge !== undefined && badge > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white animate-pulse">
                {badge}
              </span>
            )}
            {count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === id ? 'bg-slate-100 text-slate-800' : 'bg-slate-200 text-slate-600'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TAB: COURSE REVIEW & MODERATION QUEUE
      ══════════════════════════════════════════════ */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck size={18} className="text-amber-500" />
              <span>Pending Course Submissions for Moderation</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {pendingCourses.length} course(s) awaiting approval
            </span>
          </div>

          {loadingPending ? (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl shimmer" />)}
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs">
              <CheckCircle2 size={36} className="text-emerald-500 mx-auto mb-3" />
              <h4 className="font-heading font-bold text-slate-800 text-base">Review Queue is Clear!</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                No instructor course submissions are currently awaiting review. New submissions will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingCourses.map(course => (
                <div
                  key={course._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
                      {course.courseType === 'pdf' ? <FileText size={24} /> : <Video size={24} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Review
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-[#3895D2] border border-sky-200">
                          {course.courseType === 'pdf' ? '📄 PDF Course' : '🎥 Video Course'}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-slate-500 text-xs font-semibold">{course.category}</span>
                      </div>

                      <h4 className="font-heading font-bold text-slate-900 text-base truncate">
                        {course.title}
                      </h4>
                      <p className="text-slate-500 text-xs font-medium line-clamp-1 mt-0.5">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-4 text-slate-500 text-xs font-mono mt-2 flex-wrap">
                        <span>Instructor: <strong className="text-slate-800">{course.instructorName}</strong></span>
                        <span>{course.moduleCount || 0} modules</span>
                        <span>{course.lessonCount || 0} lessons</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => handleOpenPreview(course._id)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>Preview Course</span>
                    </button>
                    <button
                      onClick={() => handleApproveCourse(course._id, course.title)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Approve & Publish</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectModalCourse(course)
                        setRejectionReason('Please ensure all video/document links are accessible and syllabus is complete.')
                      }}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200 flex items-center gap-1.5"
                    >
                      <X size={14} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: COURSE CATALOG MANAGEMENT
      ══════════════════════════════════════════════ */}
      {activeTab === 'courses' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading font-bold text-slate-900 text-base">Course Governance Directory</h3>
            <span className="text-xs text-slate-500 font-mono">{courses.length} registered tracks</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Course Title & Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Instructor</th>
                  <th className="p-4">Content</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <p className="font-heading font-bold text-slate-900 text-xs sm:text-sm">{course.title}</p>
                      <span className="text-slate-400 text-[11px]">{course.category} · {course.difficulty}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        course.courseType === 'pdf' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-[#3895D2]'
                      }`}>
                        {course.courseType === 'pdf' ? '📄 PDF' : '🎥 Video'}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{course.instructorName}</p>
                      <p className="text-slate-400 text-[11px]">{course.instructorEmail}</p>
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {course.moduleCount || 0} modules · {course.lessonCount || 0} lessons
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        course.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : course.status === 'submitted'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : course.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleCourseStatus(course._id, course.status)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          course.status === 'published'
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {course.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: USER MANAGEMENT
      ══════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchUsers()}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white w-full sm:w-64"
              />
              <button
                onClick={fetchUsers}
                className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {['all', 'student', 'instructor', 'admin', 'mentor'].map(r => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    userRoleFilter === r ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Credits</th>
                  <th className="p-3">Enrollments</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <p className="font-heading font-bold text-slate-900">{u.name}</p>
                      <p className="text-slate-400 text-[11px]">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={e => handleChangeRole(u._id, e.target.value)}
                        className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold capitalize outline-none"
                      >
                        {['student', 'instructor', 'mentor', 'admin'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 font-mono font-bold text-[#3895D2]">
                      {u.creditsBalance || 0}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {u.enrollmentCount || 0} courses
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setCreditModalUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 text-[#3895D2] font-bold text-xs hover:bg-sky-100"
                      >
                        + Credits
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: OVERVIEW & AUDIT LOGS
      ══════════════════════════════════════════════ */}
      {(activeTab === 'overview' || activeTab === 'logs') && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h4 className="font-heading font-bold text-slate-900 text-base">Platform Activity & Audit Logs</h4>
          <div className="divide-y divide-slate-100">
            {(stats?.recentTransactions || []).map(tx => (
              <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{tx.userName} ({tx.userEmail})</p>
                  <p className="text-slate-500 text-[11px]">{tx.reason}</p>
                </div>
                <div className="text-right font-mono">
                  <span className={`font-bold ${tx.type === 'EARN' ? 'text-emerald-600' : 'text-[#3895D2]'}`}>
                    {tx.type === 'EARN' ? '+' : '-'}{tx.amount} credits
                  </span>
                  <p className="text-[10px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          COURSE PREVIEW MODAL
      ══════════════════════════════════════════════ */}
      {previewCourse && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-[#3895D2] text-[10px] font-bold uppercase">
                  {previewCourse.courseType === 'pdf' ? '📄 PDF Track' : '🎥 Video Track'}
                </span>
                <h4 className="font-heading font-black text-slate-900 text-lg mt-1">
                  {previewCourse.title}
                </h4>
                <p className="text-slate-500 text-xs font-medium">By {previewCourse.instructorName} · {previewCourse.category} · {previewCourse.difficulty}</p>
              </div>
              <button onClick={() => setPreviewCourse(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-4">
              <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {previewCourse.description}
              </p>

              <h5 className="font-heading font-bold text-slate-900 text-sm">Syllabus & Modules Inspector</h5>
              <div className="space-y-3">
                {(previewCourse.modules || []).map((m, mIdx) => (
                  <div key={m._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="px-4 py-2.5 bg-slate-50 font-heading font-bold text-xs text-slate-800 flex items-center gap-2">
                      <span className="font-mono text-slate-400">#{mIdx + 1}</span>
                      <span>{m.title}</span>
                    </div>
                    <div className="divide-y divide-slate-100 p-2">
                      {(m.lessons || []).map((l, lIdx) => (
                        <div key={l._id} className="py-2 px-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {previewCourse.courseType === 'pdf' ? <FileText size={14} className="text-emerald-600" /> : <Video size={14} className="text-[#3895D2]" />}
                            <span className="font-bold text-slate-800">{l.title}</span>
                          </div>
                          {l.contentUrl && (
                            <a
                              href={l.contentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#3895D2] font-bold text-xs flex items-center gap-1 hover:underline"
                            >
                              <span>Inspect Content</span>
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setPreviewCourse(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Close Preview
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const c = previewCourse
                    setPreviewCourse(null)
                    setRejectModalCourse(c)
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100"
                >
                  Reject with Feedback
                </button>
                <button
                  onClick={() => handleApproveCourse(previewCourse._id, previewCourse.title)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Approve & Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          REJECT REASON MODAL
      ══════════════════════════════════════════════ */}
      {rejectModalCourse && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-md shadow-2xl">
            <h4 className="font-heading font-bold text-slate-900 text-base mb-2">
              Reject Course Submission
            </h4>
            <p className="text-slate-500 text-xs mb-4">
              Provide constructive feedback to the instructor explaining required revisions.
            </p>

            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white resize-none"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModalCourse(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCourse}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-xs"
              >
                Send Rejection Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          CREDITS ADJUSTMENT MODAL
      ══════════════════════════════════════════════ */}
      {creditModalUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-md shadow-2xl">
            <h4 className="font-heading font-bold text-slate-900 text-base mb-1">
              Adjust DigiCredits: {creditModalUser.name}
            </h4>
            <p className="text-slate-500 text-xs mb-4">Current Balance: {creditModalUser.creditsBalance || 0} credits</p>

            <form onSubmit={handleAdjustCredits} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Adjustment Amount (+ or -)</label>
                <input
                  type="number"
                  required
                  value={creditAmount}
                  onChange={e => setCreditAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={creditReason}
                  onChange={e => setCreditReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreditModalUser(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3895D2] text-white rounded-xl text-xs font-bold"
                >
                  Apply Credits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
