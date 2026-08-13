import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { playLoudClearVoice } from '../lib/speech'
import {
  Settings, User, Lock, Volume2, Bell, Shield,
  Code, Clock, Download, CheckCircle2, AlertCircle,
  Save, Eye, EyeOff, Sparkles, Moon, Sun, Laptop,
  HelpCircle, RefreshCw
} from 'lucide-react'

export default function SettingsPage() {
  const { user, login } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  
  // Account state
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  // Voice & Sound state
  const [voiceEnabled, setVoiceEnabled] = useState(
    localStorage.getItem('DIGI_VOICE_ENABLED') !== 'false'
  )
  const [speechRate, setSpeechRate] = useState(
    Number(localStorage.getItem('DIGI_SPEECH_RATE') || '0.95')
  )
  const [speechVolume, setSpeechVolume] = useState(
    Number(localStorage.getItem('DIGI_SPEECH_VOLUME') || '1.0')
  )

  // Learning Goals state
  const [dailyGoal, setDailyGoal] = useState(
    localStorage.getItem('DIGI_DAILY_GOAL') || '30'
  )
  const [careerFocus, setCareerFocus] = useState(
    localStorage.getItem('DIGI_CAREER_FOCUS') || 'Full Stack Developer'
  )
  const [emailDigest, setEmailDigest] = useState(
    localStorage.getItem('DIGI_EMAIL_DIGEST') !== 'false'
  )

  // Code Editor state
  const [editorFontSize, setEditorFontSize] = useState(
    localStorage.getItem('DIGI_EDITOR_FONT_SIZE') || '14'
  )
  const [editorTabSize, setEditorTabSize] = useState(
    localStorage.getItem('DIGI_EDITOR_TAB_SIZE') || '2'
  )

  // Status message
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4500)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)

    if (newPassword && newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', true)
      setSaving(false)
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      showToast('New passwords do not match.', true)
      setSaving(false)
      return
    }

    try {
      const res = await api.put('/auth/profile', {
        name,
        email,
        ...(newPassword ? { password: newPassword } : {})
      })

      if (res.data?.success) {
        login(res.data.token, res.data.user)
        setNewPassword('')
        setConfirmPassword('')
        showToast('Profile & credentials updated successfully!')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', true)
    } finally {
      setSaving(false)
    }
  }

  const handleSavePreferences = () => {
    localStorage.setItem('DIGI_VOICE_ENABLED', String(voiceEnabled))
    localStorage.setItem('DIGI_SPEECH_RATE', String(speechRate))
    localStorage.setItem('DIGI_SPEECH_VOLUME', String(speechVolume))
    localStorage.setItem('DIGI_DAILY_GOAL', String(dailyGoal))
    localStorage.setItem('DIGI_CAREER_FOCUS', String(careerFocus))
    localStorage.setItem('DIGI_EMAIL_DIGEST', String(emailDigest))
    localStorage.setItem('DIGI_EDITOR_FONT_SIZE', String(editorFontSize))
    localStorage.setItem('DIGI_EDITOR_TAB_SIZE', String(editorTabSize))

    showToast('Preferences saved successfully!')
  }

  const testVoiceGreeting = () => {
    playLoudClearVoice(`Hello ${user?.name ? user.name.split(' ')[0] : 'learner'}! Voice output is configured and operating at crystal clear volume.`)
  }

  const exportUserData = () => {
    const data = {
      profile: { name: user?.name, email: user?.email, role: user?.role, credits: user?.creditsBalance },
      preferences: { dailyGoal, careerFocus, editorFontSize, editorTabSize, voiceEnabled },
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `digigrowup-profile-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Learning data exported as JSON!')
  }

  return (
    <div className="page-enter max-w-5xl space-y-6 pb-16">
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
          <p className="font-mono text-[10px] text-[#3895D2] uppercase tracking-widest mb-1 font-bold">WORKSPACE CONTROL</p>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-850">
            System & Account Settings
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5 font-medium">
            Configure profile credentials, speech and robot sound levels, daily study targets, and practice lab defaults.
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold font-heading transition-all shadow-xs"
        >
          <Save size={14} />
          <span>Save All Settings</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'account', label: 'Account & Security', icon: User },
          { id: 'voice', label: 'Voice & Robot Audio', icon: Volume2 },
          { id: 'learning', label: 'Learning Goals', icon: Clock },
          { id: 'editor', label: 'Editor & Lab', icon: Code },
          { id: 'data', label: 'Data & Privacy', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: ACCOUNT & SECURITY */}
      {activeTab === 'account' && (
        <form onSubmit={handleUpdateProfile} className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-bold text-slate-850 text-base mb-1">Profile Details & Credentials</h3>
            <p className="text-slate-500 text-xs font-medium">Update your account name and change password credentials securely.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-700 uppercase">Change Account Password</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">New Password (Optional)</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3895D2] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-600 mb-1">Confirm New Password</label>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#3895D2] hover:bg-[#2c7db5] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold font-heading transition-all shadow-xs flex items-center gap-2"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: VOICE & ROBOT AUDIO */}
      {activeTab === 'voice' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-slate-850 text-base mb-1">Speech & Chatbot Voice Engine</h3>
              <p className="text-slate-500 text-xs font-medium">Fine-tune the clarity, volume, and automatic vocal triggers of DigiGrowUp assistants.</p>
            </div>
            <button
              onClick={testVoiceGreeting}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold font-mono transition-all border border-slate-200"
            >
              <Volume2 size={15} className="text-[#3895D2]" />
              <span>Test Audio (Loud)</span>
            </button>
          </div>

          <div className="space-y-5 pt-2">
            {/* Auto Voice Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-800">Auto-Welcome Audio on Dashboard Entry</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Plays audio greeting when you login and start your learning session.</p>
              </div>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#3895D2] rounded cursor-pointer"
              />
            </div>

            {/* Volume Control */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">Voice Output Volume</span>
                <span className="font-mono text-[#3895D2]">{Math.round(speechVolume * 100)}% (Max)</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.1"
                value={speechVolume}
                onChange={(e) => setSpeechVolume(Number(e.target.value))}
                className="w-full accent-[#3895D2] cursor-pointer"
              />
            </div>

            {/* Speech Rate Control */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">Pronunciation Pacing</span>
                <span className="font-mono text-[#3895D2]">{speechRate}x (Natural)</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="w-full accent-[#3895D2] cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEARNING GOALS */}
      {activeTab === 'learning' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-bold text-slate-850 text-base mb-1">Target Study Schedule & Trajectory</h3>
            <p className="text-slate-500 text-xs font-medium">Customize your daily commitment targets and primary engineering specialization.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1.5">Daily Study Commitment</label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
              >
                <option value="15">15 Minutes / Day (Casual)</option>
                <option value="30">30 Minutes / Day (Recommended)</option>
                <option value="45">45 Minutes / Day (Intensive)</option>
                <option value="60">60+ Minutes / Day (Mastery Bootcamp)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1.5">Primary Engineering Goal</label>
              <select
                value={careerFocus}
                onChange={(e) => setCareerFocus(e.target.value)}
                className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#3895D2]"
              >
                <option value="Full Stack Developer">Full Stack Software Developer</option>
                <option value="Frontend Specialist">Frontend & UI/UX Specialist</option>
                <option value="Backend Architect">Backend & Distributed Systems Architect</option>
                <option value="AI & ML Engineer">AI Systems & ML Engineer</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-800">Weekly Progress Digest via Email</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Receive summary reports of completed quizzes, credits earned, and next recommendations.</p>
            </div>
            <input
              type="checkbox"
              checked={emailDigest}
              onChange={(e) => setEmailDigest(e.target.checked)}
              className="w-5 h-5 accent-[#3895D2] rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* TAB 4: EDITOR & LAB */}
      {activeTab === 'editor' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-bold text-slate-850 text-base mb-1">Code Arena & Editor Configuration</h3>
            <p className="text-slate-500 text-xs font-medium">Personalize the live practice lab code editor appearance and indentation.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1.5">Editor Font Size</label>
              <select
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(e.target.value)}
                className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-[#3895D2]"
              >
                <option value="12">12px (Compact)</option>
                <option value="14">14px (Standard)</option>
                <option value="16">16px (Large)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1.5">Indentation Size</label>
              <select
                value={editorTabSize}
                onChange={(e) => setEditorTabSize(e.target.value)}
                className="w-full text-slate-900 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-[#3895D2]"
              >
                <option value="2">2 Spaces (Standard JS/React)</option>
                <option value="4">4 Spaces (Python / Backend)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATA & PRIVACY */}
      {activeTab === 'data' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <h3 className="font-heading font-bold text-slate-850 text-base mb-1">Data Ownership & Privacy</h3>
            <p className="text-slate-500 text-xs font-medium">Export your learning records or manage your ecosystem visibility.</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Export Complete Learning Record</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">Download all your quiz attempts, project ratings, and credit transactions as JSON.</p>
              </div>
              <button
                onClick={exportUserData}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex-shrink-0"
              >
                <Download size={14} />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
