import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { Award, Mail, BookOpen, User, Edit3, Key, Save, CheckCircle } from 'lucide-react'

export default function LearnerProfile() {
  const { user, login } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setErrorMsg('')

    try {
      const res = await api.put('/auth/profile', {
        name,
        email,
        ...(password ? { password } : {})
      })
      if (res.data?.success) {
        login(res.data.token, res.data.user)
        setMessage('✓ Profile details saved successfully!')
        setPassword('')
        setEditing(false)
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-enter max-w-3xl">
      {/* Header info */}
      <div className="mb-6">
        <p className="font-mono text-[9px] text-[#EA4532] uppercase tracking-widest mb-1.5 font-bold">LEARNER DATABASE</p>
        <p className="text-slate-500 text-xs md:text-sm font-medium">Manage your personal developer profile, credentials, and authentication keys.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Core Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#3895D2]/10 border border-[#3895D2]/25 flex items-center justify-center font-heading font-black text-[#3895D2] text-2xl shadow-3xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="font-heading font-bold text-slate-800 text-base md:text-lg leading-tight flex items-center gap-2">
                  {user?.name}
                  <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-bold border border-slate-200">
                    {user?.role || 'Learner'}
                  </span>
                </h2>
                <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5 font-mono font-medium">
                  <Mail size={12} strokeWidth={1.5} className="text-slate-400" />
                  {user?.email}
                </p>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-250 hover:border-slate-350 text-slate-700 bg-slate-50 hover:bg-white rounded-lg text-xs font-bold transition-all shadow-3xs"
              >
                <Edit3 size={13} />
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editing ? (
            <form onSubmit={handleSave} className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#3895D2]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#3895D2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">
                  Update Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="New password (min 8 chars)"
                    className="w-full text-slate-800 border border-slate-200 rounded px-3 py-2 pl-9 text-xs focus:outline-none focus:border-[#3895D2]"
                  />
                  <Key size={13} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </div>

              {errorMsg && <p className="text-[#EA4532] text-xs font-semibold">{errorMsg}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-lg text-xs font-bold shadow-3xs transition-colors"
                >
                  <Save size={13} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName(user?.name || '')
                    setEmail(user?.email || '')
                    setPassword('')
                    setEditing(false)
                    setErrorMsg('')
                  }}
                  className="px-4 py-2 border border-slate-250 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="pt-6">
              {message && (
                <p className="text-[#4FB286] text-xs font-semibold bg-[#4FB286]/5 border border-[#4FB286]/20 p-2.5 rounded-xl mb-4">
                  {message}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-heading font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">Ecosystem Enrollments</h3>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <BookOpen size={16} className="text-[#3895D2]" />
                    <div>
                      <p className="text-slate-800 text-xs font-bold leading-none mb-1">Web Development Fundamentals</p>
                      <p className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider mt-0.5">Active</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">Skill Certifications</h3>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <Award size={16} className="text-[#4FB286]" />
                    <div>
                      <p className="text-slate-800 text-xs font-bold leading-none mb-1">HTML Semantics & Structure</p>
                      <p className="text-slate-400 font-mono text-[9px] uppercase font-bold tracking-wider mt-0.5">Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
