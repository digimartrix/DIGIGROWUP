import { useState } from 'react'
import { Bell, Trash2, MailOpen } from 'lucide-react'

const NOTIFICATIONS = [
  { id: '1', msg: 'Your weekly JS closures revision schedule is due.', type: 'alert', read: false },
  { id: '2', msg: 'Completed HTML Semantics & Structure assessment successfully.', type: 'system', read: true },
  { id: '3', msg: 'You unlocked 40 DigiCredits in HTML Semantics Quiz.', type: 'reward', read: false },
  { id: '4', msg: 'New project "Adaptive Dashboard Grid" uploaded to Build Lab.', type: 'system', read: false },
  { id: '5', msg: 'Your 1-on-1 mentor session with Devanand K. is scheduled for Aug 18, 04:00 PM.', type: 'system', read: true },
  { id: '6', msg: 'Skill Growth updated: "HTML Structure" competency level elevated to PROFICIENT.', type: 'reward', read: false },
  { id: '7', msg: 'Live workshop "Designing Clean Systems with CSS Flex & Grid" is now open for registration.', type: 'alert', read: false },
  { id: '8', msg: 'Ecosystem security parameters check completed successfully.', type: 'system', read: true },
  { id: '9', msg: 'Welcome to DigiGrowUp! Start by exploring modules in your Learning Library.', type: 'system', read: true },
]

export default function ActivityCenter() {
  const [notifs, setNotifs] = useState(NOTIFICATIONS)

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotif = (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-slate-500 text-xs md:text-sm">
            Review your learning updates, mentor communications, and credit activities.
          </p>
          
          {notifs.some(n => !n.read) && (
            <button
              onClick={markAllRead}
              className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 bg-[#3895D2] text-white hover:bg-opacity-95 text-xs font-bold rounded transition-colors shadow-3xs"
            >
              <MailOpen size={13} strokeWidth={1.5} />
              Mark all read
            </button>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-md overflow-hidden divide-y divide-slate-100 shadow-3xs">
          {notifs.map((n) => (
            <div key={n.id} className={`p-4 flex items-start justify-between gap-4 transition-colors ${
              n.read ? 'bg-white' : 'bg-[#3895D2]/5'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  n.read ? 'bg-transparent' : 'bg-[#3895D2]'
                }`} />
                <p className={`text-slate-800 text-xs md:text-sm ${n.read ? 'font-normal' : 'font-bold'}`}>
                  {n.msg}
                </p>
              </div>
              <button
                onClick={() => deleteNotif(n.id)}
                className="text-slate-400 hover:text-brandRed p-1 rounded transition-colors"
              >
                <Trash2 size={13} strokeWidth={1.5} />
              </button>
            </div>
          ))}

          {notifs.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Bell size={24} strokeWidth={1} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">You're all caught up.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
