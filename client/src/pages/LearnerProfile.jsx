import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import {
  Award, Mail, BookOpen, User, Edit3, Key, Save, CheckCircle2,
  Trophy, Zap, ShieldCheck, Github, Linkedin, Globe, Sparkles,
  ExternalLink, Download, FileText, ChevronRight, X
} from 'lucide-react'

export default function LearnerProfile() {
  const { user, login } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [bio, setBio] = useState(
    localStorage.getItem('DIGI_USER_BIO') || 'Aspiring Software Engineer mastering full-stack web architectures and scalable application development on DigiGrowUp.'
  )
  const [github, setGithub] = useState(localStorage.getItem('DIGI_USER_GITHUB') || 'github.com/vedasarathi')
  const [linkedin, setLinkedin] = useState(localStorage.getItem('DIGI_USER_LINKEDIN') || 'linkedin.com/in/vedasarathi')
  
  const [saving, setSaving] = useState(false)
  const [certificateModal, setCertificateModal] = useState(null)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await api.put('/auth/profile', { name, email })
      if (res.data?.success) {
        login(res.data.token, res.data.user)
      }
      localStorage.setItem('DIGI_USER_BIO', bio)
      localStorage.setItem('DIGI_USER_GITHUB', github)
      localStorage.setItem('DIGI_USER_LINKEDIN', linkedin)
      showToast('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', true)
    } finally {
      setSaving(false)
    }
  }

  const CERTIFICATES = [
    {
      id: 'CERT-DGU-8821',
      title: 'Web Development Core Fundamentals',
      issueDate: 'August 2026',
      issuer: 'DigiGrowUp Engineering Academy',
      grade: 'Grade: Distinction (96%)',
      skills: ['HTML5 Semantics', 'CSS Flex/Grid', 'DOM Architecture']
    },
    {
      id: 'CERT-DGU-9403',
      title: 'JavaScript Async & Closures Mastery',
      issueDate: 'August 2026',
      issuer: 'DigiGrowUp Engineering Academy',
      grade: 'Grade: Certified (88%)',
      skills: ['Lexical Scoping', 'Event Loop', 'Promises & Async/Await']
    }
  ]

  return (
    <div className="page-enter max-w-5xl space-y-6 pb-16">
      {/* Toast Alert */}
      {toast.msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium border ${
          toast.isErr ? 'bg-[#0F172A] text-rose-400 border-rose-500/30' : 'bg-[#0F172A] text-emerald-400 border-emerald-500/30'
        }`}>
          <CheckCircle2 size={18} />
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {certificateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-slate-200 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-6 relative animate-scale-up">
            <button
              onClick={() => setCertificateModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="text-center border-4 border-double border-[#3895D2]/30 p-6 rounded-xl bg-slate-50/50 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#3895D2]/10 text-[#3895D2] flex items-center justify-center mx-auto">
                <Award size={28} />
              </div>
              <div>
                <p className="font-mono text-[10px] text-[#3895D2] uppercase tracking-widest font-bold">DIGIGROWUP VERIFIED CREDENTIAL</p>
                <h2 className="font-heading font-black text-xl text-slate-850 mt-1">
                  Certificate of Achievement
                </h2>
                <p className="text-xs text-slate-500 mt-1">This certifies that</p>
                <p className="text-lg font-black text-slate-900 font-heading my-1">{user?.name}</p>
                <p className="text-xs text-slate-500">has successfully mastered all assessments in</p>
                <p className="text-sm font-bold text-[#3895D2] font-heading mt-1">{certificateModal.title}</p>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-200 pt-3">
                <span>ID: {certificateModal.id}</span>
                <span>Issued: {certificateModal.issueDate}</span>
                <span className="text-emerald-600 font-bold">VERIFIED AUTH</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  window.print()
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold font-heading transition-all shadow-xs"
              >
                <Download size={14} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Banner Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#3895D2]/10 border-2 border-[#3895D2]/30 flex items-center justify-center font-heading font-black text-[#3895D2] text-3xl shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-heading font-black text-slate-850 text-xl md:text-2xl leading-tight">
                  {user?.name}
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#3895D2]/10 text-[#3895D2] border border-[#3895D2]/20">
                  {user?.role || 'Student'} Learner
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Verified
                </span>
              </div>
              <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium">
                <Mail size={13} className="text-slate-400" />
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-700 rounded-xl text-xs font-bold font-heading transition-all shadow-2xs"
          >
            <Edit3 size={14} />
            <span>{editing ? 'Cancel Editing' : 'Edit Bio & Links'}</span>
          </button>
        </div>

        {/* Bio section */}
        {!editing ? (
          <div className="pt-5 space-y-4">
            <p className="text-slate-650 text-xs md:text-sm leading-relaxed font-medium">
              {bio}
            </p>
            <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Github size={14} className="text-slate-700" />
                <a href={`https://${github}`} target="_blank" rel="noreferrer" className="hover:text-[#3895D2]">{github}</a>
              </span>
              <span className="flex items-center gap-1.5">
                <Linkedin size={14} className="text-[#3895D2]" />
                <a href={`https://${linkedin}`} target="_blank" rel="noreferrer" className="hover:text-[#3895D2]">{linkedin}</a>
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="pt-6 space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">Developer Bio</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-slate-900 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#3895D2]"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">GitHub Profile Handle</label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full text-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3895D2]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1">LinkedIn Profile Handle</label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full text-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3895D2]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                {saving ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'DigiCredits Balance', val: `${user?.creditsBalance || 285} 💎`, color: '#3895D2' },
          { label: 'Career Readiness', val: `${user?.careerReadinessScore || 78}%`, color: '#10B981' },
          { label: 'Courses In Progress', val: '2 Active', color: '#6366F1' },
          { label: 'Quizzes Mastered', val: '8 Tests', color: '#EA4532' }
        ].map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-2xs">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{m.label}</p>
            <p className="text-xl font-black font-heading text-slate-850 mt-1" style={{ color: m.color }}>
              {m.val}
            </p>
          </div>
        ))}
      </div>

      {/* Verified Certificates & Credentials */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-slate-850 text-base">Verified Certifications</h3>
            <p className="text-slate-500 text-xs font-medium">Official DigiGrowUp skill mastery credentials and credentials.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {CERTIFICATES.map((cert) => (
            <div
              key={cert.id}
              className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 hover:bg-white hover:border-[#3895D2]/40 transition-all flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {cert.grade}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{cert.id}</span>
                </div>
                <h4 className="font-heading font-bold text-slate-850 text-sm mb-1">{cert.title}</h4>
                <p className="text-xs text-slate-400 font-medium mb-3">{cert.issuer}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cert.skills.map((s, idx) => (
                    <span key={idx} className="text-[9px] font-mono bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-[10px] font-mono text-slate-400">{cert.issueDate}</span>
                <button
                  onClick={() => setCertificateModal(cert)}
                  className="flex items-center gap-1 text-xs font-bold text-[#3895D2] hover:text-[#2c7db5]"
                >
                  <span>View Certificate</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
