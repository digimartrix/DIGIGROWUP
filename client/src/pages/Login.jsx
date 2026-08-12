import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, AlertCircle, Sparkles, BookOpen, Brain, Trophy, Volume2, ShieldCheck, Mail, Lock, UserCheck, Shield } from 'lucide-react'
import api from '../lib/api'
import Lottie from 'lottie-react'

const THOUGHTS = [
  "Choose your role portal: Student, Instructor, or Admin! 🎯",
  "Instructors can create courses & quizzes in real-time! 👨‍🏫",
  "Admins monitor live security logs & users! 🛡️",
  "Ready to level up your engineering skills? 🚀",
  "Practice in the real-time Code Arena! 💻",
  "Earn DigiCredits as you complete lessons! 💎",
]

const DEMO_ROLES = [
  {
    id: 'admin',
    label: 'Administrator',
    icon: ShieldCheck,
    color: '#EA4532',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    email: 'admin@digimartrix.com',
    password: 'Admin123!',
    desc: 'Platform governance, logs & user management'
  },
  {
    id: 'instructor',
    label: 'Instructor',
    icon: BookOpen,
    color: '#E8A33D',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    email: 'instructor@digimartrix.com',
    password: 'Instructor123!',
    desc: 'Author courses, modules, lessons & quizzes'
  },
  {
    id: 'student',
    label: 'Student',
    icon: UserCheck,
    color: '#3895D2',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    email: 'vedasaradhiv@gmail.com',
    password: '',
    desc: 'Interactive courses, labs & AI tutoring'
  }
]

export default function Login() {
  const [form, setForm] = useState({ email: 'vedasaradhiv@gmail.com', password: '' })
  const [selectedRole, setSelectedRole] = useState('admin')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [thoughtIdx, setThoughtIdx] = useState(0)
  const [animationData, setAnimationData] = useState(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const cardRef = useRef(null)

  useEffect(() => {
    fetch('/DIGIMARTRIX_Robo.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Error loading robo animation:", err))
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      cardRef.current.style.setProperty('--mouse-x', `${x}px`)
      cardRef.current.style.setProperty('--mouse-y', `${y}px`)
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
      return () => card.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const speakThought = (textToSpeak) => {
    try {
      const synth = window.speechSynthesis
      if (synth) {
        synth.cancel()
        const cleanText = textToSpeak.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.rate = 1.0
        utterance.pitch = 1.1
        synth.speak(utterance)
      }
    } catch (e) {
      console.warn("Speech synthesis unavailable:", e)
    }
  }

  const handleRoboClick = () => {
    const nextIdx = (thoughtIdx + 1) % THOUGHTS.length
    setThoughtIdx(nextIdx)
    speakThought(THOUGHTS[nextIdx])
  }

  const handleSelectRole = (roleItem) => {
    setSelectedRole(roleItem.id)
    setForm({
      email: roleItem.email,
      password: roleItem.password || form.password
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      if (data.user.role === 'admin') {
        navigate('/admin-dashboard')
      } else if (data.user.role === 'instructor') {
        navigate('/instructor-dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Server is waking up... Please wait a moment and try again.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please verify credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #070913 0%, #0B0F19 50%, #150E2E 100%)' }}>
      
      {/* Dynamic Background floating particles */}
      <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-[#3895D2]/10 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-80 h-80 rounded-full bg-[#EA4532]/10 blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      {/* Main Container Card (Expanded width: max-w-6xl, min-h-[600px]) */}
      <div 
        ref={cardRef}
        className="w-full max-w-6xl min-h-[600px] bg-white/[0.01] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative transition-all duration-300 hover:border-white/15"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Dynamic interactive gradient cursor glow */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(56, 149, 210, 0.08), transparent 80%)`
          }}
        />

        {/* Subtle decorative glowing borders */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3895D2] via-[#EA4532] to-[#3895D2]" />

        {/* Left Side: Robot + Immersive Interactive Graphics */}
        <div className="w-full lg:w-[48%] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between gap-6 relative overflow-hidden bg-white/[0.01]">
          
          {/* Logo & Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center overflow-hidden bg-white/5 backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-200">
                <img src="/favicon_circle.png" alt="Digimartrix Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-base tracking-wide leading-none">
                  <span className="text-[#3895D2]">DIGI</span>
                  <span className="text-[#EA4532]">GROWUP</span>
                </span>
                <span className="font-mono text-white/40 text-[8px] tracking-[0.2em] mt-1 font-bold">MULTI-ROLE ECOSYSTEM</span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-black text-white mb-2 leading-tight">
              Your multi-role{' '}
              <span className="bg-gradient-to-r from-[#3895D2] via-[#E8A33D] to-[#EA4532] bg-clip-text text-transparent animate-shimmer">command portal</span>{' '}
              awaits.
            </h1>
            <p className="text-white/50 text-xs md:text-sm leading-relaxed">
              Sign in as an <strong className="text-[#EA4532]">Administrator</strong> for governance, <strong className="text-[#E8A33D]">Instructor</strong> for real-time course authoring, or <strong className="text-[#3895D2]">Student</strong> for interactive learning.
            </p>
          </div>

          {/* Interactive Robot (Clickable with Speech Synthesis & Micro-animations) */}
          <div className="relative z-10 flex flex-col items-center my-2 group">
            {/* Thought bubble */}
            <div 
              onClick={handleRoboClick}
              className="relative cursor-pointer mb-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-white/30 text-center max-w-[280px]"
              style={{ animation: 'thoughtFloat 3s ease-in-out infinite' }}
              title="Click to hear robo's thought!"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>{THOUGHTS[thoughtIdx]}</span>
                <Volume2 size={13} className="text-[#3895D2] flex-shrink-0 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/10 border-b border-r border-white/20 rotate-45" />
            </div>

            {/* Robot Animation */}
            <div 
              onClick={handleRoboClick}
              className="w-40 h-40 relative cursor-pointer transform transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
            >
              {animationData ? (
                <Lottie animationData={animationData} loop={true} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🤖</div>
              )}
            </div>
          </div>

          {/* Interactive Feature Pills */}
          <div className="relative z-10 flex flex-wrap gap-2 justify-center lg:justify-start">
            {[
              { icon: ShieldCheck, label: 'Admin Governance', color: '#EA4532' },
              { icon: BookOpen, label: 'Instructor Studio', color: '#E8A33D' },
              { icon: Trophy, label: 'Student Mastery', color: '#3895D2' },
              { icon: Brain, label: 'AI Mentorship', color: '#8B5CF6' },
            ].map(({ icon: Icon, label, color }) => (
              <div 
                key={label} 
                className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 text-white/70 text-[10px] font-bold font-mono uppercase tracking-wider hover:bg-white/[0.08] transition-all"
              >
                <Icon size={12} style={{ color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Role Selector & Login Form */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white/[0.005]">
          <div className="w-full max-w-[420px] mx-auto page-enter">
            
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-heading font-black text-white tracking-tight">Sign In</h2>
                <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border bg-white/5 border-white/15 text-white/70">
                  Select Role Portal
                </span>
              </div>
              <p className="text-white/45 text-xs mt-1">
                New to the platform?{' '}
                <Link to="/register" className="text-[#3895D2] font-black hover:text-[#3895D2]/80 transition-colors underline decoration-2 underline-offset-4">
                  Create account & choose role
                </Link>
              </p>
            </div>

            {/* 1-Click Role Portal Switcher / Quick Demo Credentials */}
            <div className="mb-6 space-y-2">
              <label className="block text-white/50 text-[10px] font-mono uppercase font-bold tracking-wider">
                Quick Role Credentials Selector:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ROLES.map((r) => {
                  const Icon = r.icon
                  const isCurrent = selectedRole === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex flex-col items-center text-center gap-1 ${
                        isCurrent
                          ? `${r.bg} ${r.border} ring-1 ring-white/20 shadow-md`
                          : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/15 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Icon size={16} style={{ color: r.color }} />
                      <span className="text-xs font-bold text-white leading-none mt-0.5">{r.label}</span>
                      <span className="text-[8px] font-mono text-white/40 uppercase">Portal</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-[#EA4532]/10 border border-[#EA4532]/20 rounded-2xl px-4 py-3 mb-5">
                <AlertCircle size={16} strokeWidth={1.5} className="text-[#EA4532] mt-0.5 flex-shrink-0" />
                <p className="text-[#EA4532] text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Interactive Email field with icon wrapper */}
              <div>
                <label className="block text-white/50 text-xs font-bold mb-1.5">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#3895D2] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#3895D2]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#3895D2]/10 transition-all font-body"
                  />
                </div>
              </div>

              {/* Interactive Password field with icon wrapper */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-white/50 text-xs font-bold">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Admin password: Admin123! | Instructor: Instructor123! | Or your registered password."); }} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                    Need Help?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#3895D2] transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#3895D2]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#3895D2]/10 transition-all font-body"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full text-white font-black py-3 rounded-xl text-sm transition-all mt-2 font-heading shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                style={{
                  background: selectedRole === 'admin'
                    ? 'linear-gradient(135deg, #EA4532 0%, #B91C1C 100%)'
                    : selectedRole === 'instructor'
                    ? 'linear-gradient(135deg, #E8A33D 0%, #D97706 100%)'
                    : 'linear-gradient(135deg, #3895D2 0%, #2563EB 100%)'
                }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating {selectedRole.toUpperCase()}...
                  </>
                ) : `Sign In to ${selectedRole.toUpperCase()} Portal →`}
              </button>
            </form>

            {/* Bottom trust badges */}
            <div className="flex items-center justify-center gap-2 mt-6 text-white/25">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-mono tracking-wider uppercase">
                SECURED BY DIGIMARTRIX SHIELD
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes thoughtFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
