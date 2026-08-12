import { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Users, BookOpen, Bookmark, Shield, Award, Calendar, Trophy,
  ChevronRight, Activity, Search, RefreshCw, Trash2, UserCheck,
  ShieldCheck, AlertCircle, CheckCircle2, Clock, Filter, Layers,
  CreditCard, Sparkles
} from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'users' | 'logs'
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Users tab state
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userSearch, setUserSearch] = useState('')

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

  const getActionBadge = (action) => {
    if (action.includes('COURSE') || action.includes('MODULE') || action.includes('LESSON')) {
      return 'bg-[#3895D2]/10 text-[#3895D2] border-[#3895D2]/30'
    }
    if (action.includes('REGISTER') || action.includes('LOGIN')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }
    if (action.includes('ROLE')) {
      return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    }
    if (action.includes('QUIZ')) {
      return 'bg-[#E8A33D]/10 text-[#E8A33D] border-[#E8A33D]/30'
    }
    if (action.includes('DELETE')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    }
    return 'bg-slate-800 text-slate-300 border-slate-700'
  }

  const cardItems = stats ? [
    { label: 'Total Registered Users', value: stats.totalUsersCount || 0, icon: Users, color: '#3895D2' },
    { label: 'Students', value: stats.studentsCount || 0, icon: UserCheck, color: '#4FB286' },
    { label: 'Instructors', value: stats.instructorsCount || 0, icon: BookOpen, color: '#E8A33D' },
    { label: 'Administrators', value: stats.adminsCount || 0, icon: ShieldCheck, color: '#8B5CF6' },
    { label: 'Published Courses', value: stats.coursesCount || 0, icon: Layers, color: '#3895D2' },
    { label: 'Total Enrollments', value: stats.enrollmentsCount || 0, icon: Bookmark, color: '#EC4899' },
    { label: 'Active Mentors', value: stats.mentorsCount || 0, icon: Shield, color: '#8B5CF6' },
    { label: 'Certificates Issued', value: stats.certificatesCount || 0, icon: Award, color: '#EA4532' },
    { label: '24h Activity Events', value: stats.recentActivityCount || 0, icon: Activity, color: '#4FB286' },
  ] : []

  return (
    <div className="page-enter max-w-7xl mx-auto space-y-8 pb-16">
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
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#EA4532]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#EA4532] font-bold uppercase mb-2">
              <ShieldCheck size={14} />
              <span>PLATFORM GOVERNANCE & CONTROL</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
              Administrator Command Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Inspect real-time system metrics, manage user role permissions, and audit platform security logs.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-[#1E293B] p-1.5 rounded-xl border border-slate-700 flex-shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-[#EA4532] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              System Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-[#EA4532] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'logs'
                  ? 'bg-[#EA4532] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Audit Logs
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {loadingStats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-28 rounded-xl bg-slate-800/40 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cardItems.map((c) => {
                  const Icon = c.icon
                  return (
                    <div
                      key={c.label}
                      className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all duration-300 flex items-center justify-between border-l-4"
                      style={{ borderLeftColor: c.color }}
                    >
                      <div>
                        <p className="text-slate-400 font-mono uppercase tracking-widest mb-1.5 font-bold" style={{ fontSize: '9px' }}>
                          {c.label}
                        </p>
                        <p className="font-mono text-2xl font-black text-white">{c.value}</p>
                      </div>
                      <div
                        className="w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: `${c.color}30`, backgroundColor: `${c.color}15` }}
                      >
                        <Icon size={18} style={{ color: c.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Course Popularity & Credits Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Popularity */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-mono uppercase font-bold text-white tracking-wider flex items-center gap-2">
                    <Trophy size={16} className="text-[#E8A33D]" />
                    <span>Top Enrolled Courses</span>
                  </h3>
                  <div className="space-y-3">
                    {stats?.coursePopularity?.length === 0 ? (
                      <p className="text-xs text-slate-500">No enrollment records found.</p>
                    ) : (
                      stats?.coursePopularity?.map((cp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#1E293B]/60 border border-slate-800">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-xs font-bold text-[#3895D2]">#{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{cp.title}</p>
                              <p className="text-[10px] font-mono text-slate-400">{cp.category}</p>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            {cp.count} learners
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Credits Ecosystem Activity */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-mono uppercase font-bold text-white tracking-wider flex items-center gap-2">
                    <CreditCard size={16} className="text-[#3895D2]" />
                    <span>DigiCredits Ledger Summary</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1E293B]/60 border border-slate-800 p-4 rounded-xl">
                      <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Earned / Bonus</p>
                      <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
                        +{stats?.creditsEarnedSum || 0}
                      </p>
                    </div>
                    <div className="bg-[#1E293B]/60 border border-slate-800 p-4 rounded-xl">
                      <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Spent</p>
                      <p className="text-2xl font-black font-mono text-[#EA4532] mt-1">
                        -{stats?.creditsSpentSum || 0}
                      </p>
                    </div>
                  </div>
                  
                  {/* Recent Transactions List */}
                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Latest 5 Transactions</p>
                    {stats?.recentTransactions?.slice(0, 5).map((t) => (
                      <div key={t._id} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800/80">
                        <span className="text-slate-300 truncate max-w-[200px]">{t.description || 'Credit Adjustment'}</span>
                        <span className={`font-mono font-bold ${t.type === 'SPEND' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {t.type === 'SPEND' ? `-${t.amount}` : `+${t.amount}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter / Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#EA4532]"
                />
              </div>
              <button
                onClick={fetchUsers}
                className="bg-[#EA4532] hover:bg-[#EA4532]/90 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
              >
                Search
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">Role Filter:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EA4532]"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={fetchUsers}
                title="Refresh user list"
                className="p-2 bg-[#1E293B] hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                <RefreshCw size={14} className={loadingUsers ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {loadingUsers ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-[#EA4532] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono">LOADING USER DIRECTORY...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Users size={36} className="mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-white text-sm">No users matched your search filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1E293B] text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Current Role</th>
                      <th className="py-3.5 px-4">Enrollments</th>
                      <th className="py-3.5 px-4">Credits</th>
                      <th className="py-3.5 px-4">Joined</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs">
                              {u.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-bold text-white">{u.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value, u.name)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase border bg-transparent focus:outline-none cursor-pointer ${
                              u.role === 'admin'
                                ? 'text-[#EA4532] border-[#EA4532]/40 bg-[#EA4532]/10'
                                : u.role === 'instructor'
                                ? 'text-[#E8A33D] border-[#E8A33D]/40 bg-[#E8A33D]/10'
                                : u.role === 'mentor'
                                ? 'text-[#8B5CF6] border-[#8B5CF6]/40 bg-[#8B5CF6]/10'
                                : 'text-[#4FB286] border-[#4FB286]/40 bg-[#4FB286]/10'
                            }`}
                          >
                            <option value="student" className="bg-[#0F172A] text-white">Student</option>
                            <option value="instructor" className="bg-[#0F172A] text-white">Instructor</option>
                            <option value="mentor" className="bg-[#0F172A] text-white">Mentor</option>
                            <option value="admin" className="bg-[#0F172A] text-white">Admin</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{u.enrollmentCount || 0}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{u.creditsBalance || 0}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            title="Delete User"
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6 animate-fade-in">
          {/* Filter header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase text-slate-400 font-bold">Filter Action:</span>
              <select
                value={logActionFilter}
                onChange={(e) => setLogActionFilter(e.target.value)}
                className="bg-[#1E293B] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#EA4532]"
              >
                <option value="all">All Events</option>
                <option value="COURSE_CREATED">Course Created</option>
                <option value="COURSE_UPDATED">Course Updated</option>
                <option value="COURSE_DELETED">Course Deleted</option>
                <option value="LESSON_CREATED">Lesson Created</option>
                <option value="QUIZ_SUBMITTED">Quiz Submitted</option>
                <option value="USER_REGISTERED">User Registered</option>
                <option value="USER_LOGGED_IN">User Login</option>
                <option value="USER_ROLE_CHANGED">User Role Changed</option>
              </select>
            </div>

            <button
              onClick={() => fetchLogs(1)}
              className="flex items-center gap-2 bg-[#1E293B] hover:bg-slate-700 text-slate-300 text-xs font-bold px-3 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              <RefreshCw size={14} className={loadingLogs ? 'animate-spin' : ''} />
              <span>Refresh Log Stream</span>
            </button>
          </div>

          {/* Logs Stream Container */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {loadingLogs ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-[#EA4532] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-mono">FETCHING AUDIT LOG STREAM...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Activity size={36} className="mx-auto text-slate-600 mb-2" />
                <p className="font-semibold text-white text-sm">No activity logs recorded yet.</p>
                <p className="text-xs text-slate-500 mt-1">Actions taken by users, instructors, and admins will stream here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {logs.map((log) => (
                  <div key={log._id} className="p-4 hover:bg-slate-800/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <span className={`px-2.5 py-1 rounded-md font-mono text-[10px] font-bold uppercase border flex-shrink-0 ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate">
                          <span className="font-bold text-[#3895D2]">{log.userName}</span>
                          <span className="text-slate-400 font-mono text-[11px] ml-1.5">[{log.userRole}]</span>
                          {log.target && <span className="text-slate-300 ml-2">→ {log.target}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] flex-shrink-0">
                      <Clock size={13} />
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {logTotalPages > 1 && (
              <div className="p-4 bg-[#1E293B]/60 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Page {logPage} of {logTotalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={logPage <= 1}
                    onClick={() => fetchLogs(logPage - 1)}
                    className="px-3 py-1 bg-[#0F172A] border border-slate-700 rounded disabled:opacity-40 hover:text-white"
                  >
                    Previous
                  </button>
                  <button
                    disabled={logPage >= logTotalPages}
                    onClick={() => fetchLogs(logPage + 1)}
                    className="px-3 py-1 bg-[#0F172A] border border-slate-700 rounded disabled:opacity-40 hover:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
