import { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Users, BookOpen, Bookmark, Shield, Award, Calendar, Trophy,
  ChevronRight, Activity, Search, RefreshCw, Trash2, UserCheck,
  ShieldCheck, AlertCircle, CheckCircle2, Clock, Filter, Layers,
  CreditCard, Sparkles, Plus, Edit2, Coins, ArrowUpRight, ArrowDownRight,
  ExternalLink, X
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'users' | 'courses' | 'logs'
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Users tab state
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')
  const [creditModalUser, setCreditModalUser] = useState(null)
  const [creditAmount, setCreditAmount] = useState(50)
  const [creditReason, setCreditReason] = useState('Community Contribution Award')

  // Courses tab state
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)

  // Logs tab state
  const [logs, setLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [logActionFilter, setLogActionFilter] = useState('all')
  const [logPage, setLogPage] = useState(1)
  const [logTotalPages, setLogTotalPages] = useState(1)

  // Toast message
  const [toast, setToast] = useState({ msg: '', isErr: false })

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
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
      showToast(err.response?.data?.message || 'Failed to load activity logs.', true)
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleRoleChange = async (userId, newRole, userName) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      showToast(`Updated ${userName}'s role to [${newRole.toUpperCase()}].`)
      fetchUsers()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change user role.', true)
    }
  }

  const handleAdjustCredits = async (e) => {
    e.preventDefault()
    if (!creditModalUser) return
    try {
      await api.put(`/admin/users/${creditModalUser._id}/credits`, {
        amount: creditAmount,
        reason: creditReason
      })
      showToast(`Successfully granted ${creditAmount} credits to ${creditModalUser.name}!`)
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
      await api.delete(`/admin/users/${userId}`)
      showToast(`Deleted user "${userName}".`)
      fetchUsers()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user.', true)
    }
  }

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete course "${title}"?`)) return
    try {
      await api.delete(`/admin/courses/${courseId}`)
      showToast(`Deleted course "${title}".`)
      fetchCourses()
      fetchStats()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete course.', true)
    }
  }

  const getActionBadge = (action) => {
    if (action.includes('COURSE') || action.includes('MODULE') || action.includes('LESSON')) {
      return 'bg-[#3895D2]/10 text-[#3895D2] border-[#3895D2]/30'
    }
    if (action.includes('REGISTER') || action.includes('LOGIN')) {
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
    }
    if (action.includes('ROLE')) {
      return 'bg-purple-500/10 text-purple-600 border-purple-500/30'
    }
    if (action.includes('CREDIT')) {
      return 'bg-amber-500/10 text-amber-600 border-amber-500/30'
    }
    if (action.includes('DELETE')) {
      return 'bg-rose-500/10 text-rose-600 border-rose-500/30'
    }
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const cardItems = stats ? [
    { label: 'Total Registered Users', value: stats.totalUsersCount || 0, icon: Users, color: '#3895D2', bg: 'bg-blue-50' },
    { label: 'Students', value: stats.studentsCount || 0, icon: UserCheck, color: '#4FB286', bg: 'bg-emerald-50' },
    { label: 'Instructors', value: stats.instructorsCount || 0, icon: BookOpen, color: '#E8A33D', bg: 'bg-amber-50' },
    { label: 'Administrators', value: stats.adminsCount || 0, icon: ShieldCheck, color: '#8B5CF6', bg: 'bg-purple-50' },
    { label: 'Published Courses', value: stats.coursesCount || 0, icon: Layers, color: '#3895D2', bg: 'bg-blue-50' },
    { label: 'Total Enrollments', value: stats.enrollmentsCount || 0, icon: Bookmark, color: '#EC4899', bg: 'bg-pink-50' },
    { label: 'Active Mentors', value: stats.mentorsCount || 0, icon: Shield, color: '#8B5CF6', bg: 'bg-purple-50' },
    { label: 'Live Events', value: stats.registrationsCount || 0, icon: Calendar, color: '#3895D2', bg: 'bg-blue-50' },
    { label: '24h Activity Events', value: stats.recentActivityCount || 0, icon: Activity, color: '#4FB286', bg: 'bg-emerald-50' },
  ] : []

  return (
    <div className="page-enter max-w-7xl mx-auto space-y-6 pb-16">
      {/* Toast Alert */}
      {toast.msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium border ${
          toast.isErr ? 'bg-[#0F172A] text-rose-400 border-rose-500/30' : 'bg-[#0F172A] text-emerald-400 border-emerald-500/30'
        }`}>
          {toast.isErr ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#EA4532] font-bold uppercase mb-2">
              <ShieldCheck size={14} />
              <span>PLATFORM GOVERNANCE & CONTROL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
              Administrator Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl font-medium">
              Inspect real-time MongoDB metrics, manage user role permissions, grant credits, and audit platform security logs.
            </p>
          </div>

          <button
            onClick={() => {
              fetchStats()
              if (activeTab === 'users') fetchUsers()
              if (activeTab === 'courses') fetchCourses()
              if (activeTab === 'logs') fetchLogs(1)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold font-heading transition-all shadow-md flex-shrink-0"
          >
            <RefreshCw size={14} />
            <span>Sync Live Data</span>
          </button>
        </div>
      </div>

      {/* Modern Segmented Navigation Tabs */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 inline-flex items-center gap-2 overflow-x-auto max-w-full">
        {[
          { id: 'overview', label: 'System Overview', count: stats?.totalUsersCount || 0, icon: Activity },
          { id: 'users', label: 'User Management', count: users.length || stats?.totalUsersCount || 0, icon: Users },
          { id: 'courses', label: 'Course Directory', count: courses.length || stats?.coursesCount || 0, icon: Layers },
          { id: 'logs', label: 'Live Audit Logs', count: logs.length || stats?.recentActivityCount || 0, icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-heading transition-all flex items-center gap-2.5 whitespace-nowrap ${
                isActive
                  ? 'bg-[#0F172A] text-white shadow-sm font-black'
                  : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60 font-bold'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#EA4532]' : 'text-slate-400'} />
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {loadingStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cardItems.map((c) => {
                  const Icon = c.icon
                  return (
                    <div
                      key={c.label}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="text-slate-500 font-mono uppercase tracking-wider mb-1 font-bold text-[10px]">
                          {c.label}
                        </p>
                        <p className="font-heading text-2xl font-black text-slate-900">{c.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                        <Icon size={22} style={{ color: c.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Course Popularity & Credits Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course Popularity */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 font-heading tracking-wide flex items-center gap-2">
                      <Trophy size={16} className="text-amber-500" />
                      <span>TOP ENROLLED COURSES</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-[#3895D2]">Live Data</span>
                  </div>

                  {stats?.coursePopularity?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4">No course enrollments recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats?.coursePopularity?.map((cp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-150">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#3895D2] flex items-center justify-center text-xs font-mono font-bold">
                              #{idx + 1}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{cp.title}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{cp.category}</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-2xs">
                            {cp.count} learners
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DigiCredits Ledger Summary */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-900 font-heading tracking-wide flex items-center gap-2">
                      <CreditCard size={16} className="text-[#3895D2]" />
                      <span>DIGICREDITS PLATFORM LEDGER</span>
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-600">Active Pool</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <p className="text-[10px] font-mono font-bold text-emerald-800 uppercase">TOTAL EARNED / BONUS</p>
                      <p className="text-xl font-black text-emerald-600 font-heading mt-1">+{stats?.creditsEarnedSum || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
                      <p className="text-[10px] font-mono font-bold text-rose-800 uppercase">TOTAL SPENT</p>
                      <p className="text-xl font-black text-rose-600 font-heading mt-1">-{stats?.creditsSpentSum || 0}</p>
                    </div>
                  </div>

                  {/* Recent 5 Transactions */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-mono uppercase font-bold text-slate-500">LATEST REAL-TIME TRANSACTIONS</p>
                    {stats?.recentTransactions?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No transactions recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {stats?.recentTransactions?.slice(0, 5).map((t) => (
                          <div key={t._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs border border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                t.type === 'SPEND' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {t.type === 'SPEND' ? '↓' : '↑'}
                              </span>
                              <div>
                                <span className="font-bold text-slate-800">{t.userName}</span>
                                <span className="text-slate-500 text-[11px] ml-1.5 truncate max-w-[180px] inline-block align-bottom">{t.reason}</span>
                              </div>
                            </div>
                            <span className={`font-mono font-bold ${t.type === 'SPEND' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {t.type === 'SPEND' ? '-' : '+'}{t.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">Platform User Directory ({users.length})</h3>
              <p className="text-xs text-slate-500 font-medium">Manage permissions, promote instructor/mentor roles, and adjust credit balances.</p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3895D2]"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="mentor">Mentors</option>
                <option value="admin">Administrators</option>
              </select>

              {/* Search input */}
              <div className="relative w-48 sm:w-60">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user name/email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
                />
              </div>
            </div>
          </div>

          {loadingUsers ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : users.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">No users found matching your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px]">
                    <th className="pb-3 pl-2">User Details</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Credits</th>
                    <th className="pb-3">Enrollments</th>
                    <th className="pb-3">Joined Date</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pl-2">
                        <p className="font-bold text-slate-900 text-xs">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                      </td>
                      <td className="py-3.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value, u.name)}
                          className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800"
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono font-bold text-[#3895D2]">{u.creditsBalance || 0}</span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-mono font-medium text-slate-700">{u.enrollmentCount || 0} courses</span>
                      </td>
                      <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-right pr-2 space-x-2">
                        <button
                          onClick={() => setCreditModalUser(u)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg font-bold text-[11px]"
                          title="Grant Credits"
                        >
                          + Credits
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COURSE DIRECTORY */}
      {activeTab === 'courses' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">Platform Course Directory ({courses.length})</h3>
              <p className="text-xs text-slate-500 font-medium">All published courses across all instructors with active enrollments.</p>
            </div>
          </div>

          {loadingCourses ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : courses.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">No courses published on the platform yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div key={c._id} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {c.category} · {c.difficulty}
                      </span>
                      <button
                        onClick={() => handleDeleteCourse(c._id, c.title)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Course"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <h4 className="font-heading font-bold text-slate-900 text-base mb-1">{c.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 font-medium mb-3">{c.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 pt-3 border-t border-slate-200">
                    <span>Instructor: <strong className="text-slate-900">{c.instructorName}</strong></span>
                    <span className="text-[#3895D2] font-black">{c.enrollmentsCount || 0} Enrolled</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">Real-Time Security & Activity Logs</h3>
              <p className="text-xs text-slate-500 font-medium">Immutable stream of platform events, registrations, updates, and transactions.</p>
            </div>

            <select
              value={logActionFilter}
              onChange={(e) => setLogActionFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3895D2]"
            >
              <option value="all">All Actions</option>
              <option value="USER_REGISTERED">User Registrations</option>
              <option value="USER_ROLE_CHANGED">Role Modifications</option>
              <option value="COURSE_CREATED">Course Created</option>
              <option value="QUIZ_COMPLETED">Quiz Completed</option>
              <option value="CREDITS_ADJUSTED">Credits Adjusted</option>
            </select>
          </div>

          {loadingLogs ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : logs.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">No activity logs recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {logs.map((log) => (
                <div key={log._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{log.userName || 'System Agent'}</span>
                      <span className="text-slate-600 ml-1.5">{log.target ? `→ ${log.target}` : ''}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: GRANT / ADJUST CREDITS */}
      {creditModalUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAdjustCredits} className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-bold text-slate-900 text-base">Grant Credits to {creditModalUser.name}</h3>
              <button type="button" onClick={() => setCreditModalUser(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount to Add (or negative to deduct)</label>
              <input
                type="number"
                required
                value={creditAmount}
                onChange={e => setCreditAmount(Number(e.target.value))}
                className="w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Note</label>
              <input
                type="text"
                required
                value={creditReason}
                onChange={e => setCreditReason(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setCreditModalUser(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#EA4532] text-white rounded-xl text-xs font-bold">Confirm Adjustment</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
