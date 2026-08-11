import { useState } from 'react'
import { ToggleLeft, ToggleRight, Settings } from 'lucide-react'

export default function SettingsPage() {
  const [notifToggle, setNotifToggle] = useState(true)
  const [privacyToggle, setPrivacyToggle] = useState(false)

  return (
    <div className="page-enter max-w-3xl">
      {/* Header info */}
      <div className="mb-6">
        <p className="font-mono text-[9px] text-[#EA4532] uppercase tracking-widest mb-1.5 font-bold">SYSTEM OPTIONS</p>
        <p className="text-slate-500 text-xs md:text-sm font-medium">Configure system notifications, workspace layout preferences, and security options.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-slate-800 text-xs md:text-sm uppercase tracking-wider flex items-center gap-1.5">
            <Settings size={14} className="text-[#3895D2]" />
            Preferences
          </h3>
          
          {/* Notification toggle */}
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-slate-800 text-xs font-bold">Ecosystem Notifications</p>
              <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Receive alert cues when assessments are scheduled or revised.</p>
            </div>
            <button
              onClick={() => setNotifToggle(!notifToggle)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              {notifToggle ? <ToggleRight size={24} className="text-[#3895D2]" /> : <ToggleLeft size={24} />}
            </button>
          </div>

          {/* Profile privacy toggle */}
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-slate-800 text-xs font-bold">Private Learner Profile</p>
              <p className="text-slate-400 text-[10px] mt-0.5 font-medium">Only show certificates and project portfolios to logged-in recruiters.</p>
            </div>
            <button
              onClick={() => setPrivacyToggle(!privacyToggle)}
              className="text-slate-400 hover:text-slate-650 transition-colors"
            >
              {privacyToggle ? <ToggleRight size={24} className="text-[#3895D2]" /> : <ToggleLeft size={24} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
