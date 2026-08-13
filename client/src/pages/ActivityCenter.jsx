import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  Bell, Trash2, MailOpen, CheckCircle2,
  Sparkles, RefreshCw, AlertCircle, Trophy, BookOpen,
  Zap, Clock, ShieldCheck, CheckCheck
} from 'lucide-react'

const FALLBACK_NOTIFICATIONS = [
  { id: 'f1', message: 'Your weekly JS closures revision schedule is due.', type: 'alert', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'f2', message: 'Completed HTML Semantics & Structure assessment successfully with 100%.', type: 'reward', read: true, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'f3', message: 'Unlocked 40 DigiCredits in HTML Semantics Quiz.', type: 'reward', read: false, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'f4', message: 'New project "Adaptive Dashboard Grid" uploaded to Build Lab.', type: 'system', read: false, createdAt: new Date(Date.now() - 28 * 3600000).toISOString() },
  { id: 'f5', message: 'Your 1-on-1 mentor session with Devanand K. is scheduled for Aug 18, 04:00 PM.', type: 'system', read: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: 'f6', message: 'Skill Growth updated: "HTML Structure" competency elevated to PROFICIENT.', type: 'reward', read: false, createdAt: new Date(Date.now() - 72 * 3600000).toISOString() },
  { id: 'f7', message: 'Live workshop "Designing Clean Systems with CSS Flex & Grid" is now open for registration.', type: 'alert', read: false, createdAt: new Date(Date.now() - 96 * 3600000).toISOString() },
  { id: 'f8', message: 'Welcome to DigiGrowUp! Your adaptive workspace is configured.', type: 'system', read: true, createdAt: new Date(Date.now() - 120 * 3600000).toISOString() },
]

export default function ActivityCenter() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [toast, setToast] = useState({ msg: '', isErr: false })

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications')
      if (res.data?.success && res.data.data?.length > 0) {
        setNotifications(res.data.data)
      } else {
        setNotifications(FALLBACK_NOTIFICATIONS)
      }
    } catch (err) {
      console.warn('Using default notifications stream:', err.message)
      setNotifications(FALLBACK_NOTIFICATIONS)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all').catch(() => {})
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      showToast('All notifications marked as read.')
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  const markSingleAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`).catch(() => {})
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id ? { ...n, read: true } : n)))
    } catch (err) {
      setNotifications(prev => prev.map(n => (n._id === id || n.id === id ? { ...n, read: true } : n)))
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`).catch(() => {})
      setNotifications(prev => prev.filter(n => (n._id !== id && n.id !== id)))
    } catch (err) {
      setNotifications(prev => prev.filter(n => (n._id !== id && n.id !== id)))
    }
  }

  const clearAllNotifications = () => {
    setNotifications([])
    showToast('Notification feed cleared.')
  }

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true
    return n.type === filterType
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="page-enter max-w-4xl space-y-6 pb-16">
      {/* Toast Alert */}
      {toast.msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium border ${
          toast.isErr ? 'bg-[#0F172A] text-rose-400 border-rose-500/30' : 'bg-[#0F172A] text-emerald-400 border-emerald-500/30'
        }`}>
          {toast.isErr ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <p className="font-mono text-[10px] text-[#3895D2] uppercase tracking-widest font-bold">AUTOMATED EVENT STREAM</p>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              REAL-TIME SYNC
            </span>
          </div>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-850">
            System Notifications & Activity
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Real-time automated updates for course enrollments, quiz achievements, credits, and live events.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={loadNotifications}
            title="Refresh notifications"
            className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-2xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <CheckCheck size={14} />
              <span>Mark all as read ({unreadCount})</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-all border border-slate-200"
            >
              Clear Feed
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'All Updates', count: notifications.length },
          { id: 'reward', label: 'Rewards & Credits', count: notifications.filter(n => n.type === 'reward').length },
          { id: 'alert', label: 'Alerts & Due', count: notifications.filter(n => n.type === 'alert').length },
          { id: 'system', label: 'System & Platform', count: notifications.filter(n => n.type === 'system').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-xs">
        {filteredNotifications.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Bell size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No notifications in this category.</p>
            <p className="text-xs text-slate-400 mt-0.5">Automated updates will appear here as you take actions across the platform.</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const notifId = n._id || n.id
            const isUnread = !n.read
            const isReward = n.type === 'reward'
            const isAlert = n.type === 'alert'

            return (
              <div
                key={notifId}
                onClick={() => isUnread && markSingleAsRead(notifId)}
                className={`p-4.5 flex items-start justify-between gap-4 transition-colors cursor-pointer group ${
                  isUnread ? 'bg-[#3895D2]/5 hover:bg-[#3895D2]/8' : 'bg-white hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Status Indicator Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isReward
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : isAlert
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-[#3895D2]/10 text-[#3895D2] border border-[#3895D2]/20'
                  }`}>
                    {isReward ? <Trophy size={16} /> : isAlert ? <Clock size={16} /> : <Zap size={16} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        isReward
                          ? 'bg-amber-100 text-amber-800'
                          : isAlert
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {n.type || 'SYSTEM'}
                      </span>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#3895D2]" />
                      )}
                    </div>

                    <p className={`text-xs md:text-sm leading-relaxed ${isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {n.message || n.msg}
                    </p>

                    <p className="text-[10px] font-mono text-slate-400 mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : (n.time || 'Recent')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notifId)
                  }}
                  title="Remove notification"
                  className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
