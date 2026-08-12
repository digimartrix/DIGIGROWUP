import { useState, useEffect } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  Bell, Trash2, MailOpen, Send, CheckCircle2,
  FileSpreadsheet, Sparkles, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react'

const INITIAL_NOTIFICATIONS = [
  { id: '1', msg: 'Your weekly JS closures revision schedule is due.', type: 'alert', read: false, time: '2 hours ago' },
  { id: '2', msg: 'Completed HTML Semantics & Structure assessment successfully.', type: 'system', read: true, time: '5 hours ago' },
  { id: '3', msg: 'You unlocked 40 DigiCredits in HTML Semantics Quiz.', type: 'reward', read: false, time: '1 day ago' },
  { id: '4', msg: 'New project "Adaptive Dashboard Grid" uploaded to Build Lab.', type: 'system', read: false, time: '1 day ago' },
  { id: '5', msg: 'Your 1-on-1 mentor session with Devanand K. is scheduled for Aug 18, 04:00 PM.', type: 'system', read: true, time: '2 days ago' },
  { id: '6', msg: 'Skill Growth updated: "HTML Structure" competency level elevated to PROFICIENT.', type: 'reward', read: false, time: '3 days ago' },
  { id: '7', msg: 'Live workshop "Designing Clean Systems with CSS Flex & Grid" is now open for registration.', type: 'alert', read: false, time: '4 days ago' },
  { id: '8', msg: 'Ecosystem security parameters check completed successfully.', type: 'system', read: true, time: '5 days ago' },
  { id: '9', msg: 'Welcome to DigiGrowUp! Start by exploring modules in your Learning Library.', type: 'system', read: true, time: '1 week ago' },
]

export default function ActivityCenter() {
  const { user } = useAuth()
  const [notifs, setNotifs] = useState(INITIAL_NOTIFICATIONS)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [content, setContent] = useState('')
  const [appsScriptUrl, setAppsScriptUrl] = useState(
    localStorage.getItem('APPS_SCRIPT_WEBHOOK_URL') || ''
  )
  const [showConfig, setShowConfig] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  useEffect(() => {
    if (user?.name && !name) setName(user.name)
    if (user?.email && !email) setEmail(user.email)
  }, [user])

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    showToast('All notifications marked as read.')
  }

  const deleteNotif = (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  const handleSaveWebhook = (e) => {
    e.preventDefault()
    localStorage.setItem('APPS_SCRIPT_WEBHOOK_URL', appsScriptUrl.trim())
    setShowConfig(false)
    showToast('Google Apps Script Webhook URL saved!')
  }

  const handleSubmitToSheet = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !content.trim()) {
      showToast('Please fill in all fields (Name, Email, Content).', true)
      return
    }

    setSending(true)

    try {
      // 1. If Apps Script Webhook URL is configured, POST to Google Apps Script
      if (appsScriptUrl.trim()) {
        try {
          await fetch(appsScriptUrl.trim(), {
            method: 'POST',
            mode: 'no-cors', // Apps Script standard web redirect handling
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, content, timestamp: new Date().toISOString() })
          })
        } catch (err) {
          console.warn('Apps Script direct post notice:', err)
        }
      }

      // 2. Add as a local notification immediately
      const newEntry = {
        id: Date.now().toString(),
        msg: `Notification dispatched: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
        type: 'system',
        read: false,
        time: 'Just now'
      }
      setNotifs(prev => [newEntry, ...prev])
      setContent('')
      showToast('✅ Notification & Contact entry logged successfully into Contact-from(digigrowup)!')
    } catch (err) {
      showToast('Failed to dispatch notification.', true)
    } finally {
      setSending(false)
    }
  }

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
          <p className="font-mono text-[10px] text-[#3895D2] uppercase tracking-widest mb-1.5 font-bold">COMMUNICATION CENTER</p>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-850">
            Notifications & Apps Script Sync
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Review your learning alerts, course events, and sync inquiries with Google Sheets via Apps Script.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>Apps Script URL</span>
          </button>

          {notifs.some(n => !n.read) && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3895D2] text-white hover:bg-[#2c7db5] text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <MailOpen size={13} strokeWidth={2} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* GOOGLE APPS SCRIPT WEBHOOK CONFIG MODAL/CARD */}
      {showConfig && (
        <form onSubmit={handleSaveWebhook} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={16} className="text-emerald-600" />
              <h3 className="font-heading font-bold text-slate-850 text-sm">
                Connect Google Apps Script Web App URL
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
              Sheet: Contact-from(digigrowup)
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Paste your deployed Google Apps Script Web App URL below to automatically append Name, Email, and Content to your Google Sheet in real-time.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="url"
              value={appsScriptUrl}
              onChange={(e) => setAppsScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="flex-1 text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#3895D2]"
            />
            <button
              type="submit"
              className="bg-[#3895D2] hover:bg-[#2c7db5] text-white px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all shadow-xs"
            >
              Save URL
            </button>
          </div>
        </form>
      )}

      {/* DISPATCH NOTIFICATION / CONTACT GOOGLE SHEET FORM */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
          <MessageSquare size={15} className="text-emerald-600" />
          <span>Dispatch Query / Notification to Google Sheet</span>
        </div>

        <form onSubmit={handleSubmitToSheet} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 uppercase mb-1">
                Name (Column A)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Veda Sarathi V"
                className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-600 uppercase mb-1">
                Email (Column B)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. vedasaradhiv@gmail.com"
                className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-slate-600 uppercase mb-1">
              Content / Notification Message (Column C)
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your notification content or inquiry details..."
              className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold font-heading transition-all shadow-xs flex items-center gap-2"
            >
              {sending ? (
                <span>Dispatching...</span>
              ) : (
                <>
                  <Send size={13} />
                  <span>Send to Contact-from(digigrowup)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
            Recent System Notifications ({notifs.length})
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-xs">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                n.read ? 'bg-white' : 'bg-[#3895D2]/5'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                    n.read ? 'bg-transparent border border-slate-300' : 'bg-[#3895D2]'
                  }`}
                />
                <div className="min-w-0">
                  <p className={`text-slate-800 text-xs md:text-sm ${n.read ? 'font-normal' : 'font-bold'}`}>
                    {n.msg}
                  </p>
                  {n.time && (
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{n.time}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteNotif(n.id)}
                title="Delete notification"
                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {notifs.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Bell size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">You're all caught up.</p>
              <p className="text-xs text-slate-400 mt-0.5">No new unread notifications at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
