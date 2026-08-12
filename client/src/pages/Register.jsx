import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, CheckCircle2, AlertCircle, Rocket, Code2, Users, Zap, Volume2, ShieldCheck, Mail, Lock, User, BookOpen, GraduationCap, Shield } from 'lucide-react'
import api from '../lib/api'
import Lottie from 'lottie-react'

const THOUGHTS = [
  "Choose your role to get custom dashboard tools! ✨",
  "Instructors get access to the Course Authoring Studio! 👨‍🏫",
  "Students get practice labs, quizzes & AI tutor! 🚀",
  "Level up with real-world project portfolios! 💡",
  "Unlock certifications as you build mastery! 🏆",
]

const ROLE_OPTIONS = [
  {
    id: 'student',
    title: 'Student Learner',
    icon: GraduationCap,
    color: '#3895D2',
    desc: 'Access courses, coding arena, quizzes & AI mentor'
  },
  {
    id: 'instructor',
    title: 'Course Instructor',
    icon: BookOpen,
    color: '#E8A33D',
    desc: 'Author courses, markdown lessons & interactive quizzes'
  },
  {
    id: 'mentor',
    title: 'Ecosystem Mentor',
    icon: Shield,
    color: '#8B5CF6',
    desc: 'Host live sessions, review projects & mentor learners'
  }
]

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  })
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
      console.warn("Speech failed:", e)
    }
  }

  const handleRoboClick = () => {
    const nextIdx = (thoughtIdx + 1) % THOUGHTS.length
    setThoughtIdx(nextIdx)
    speakThought(THOUGHTS[nextIdx])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', form)
      login(data.token, data.user)
      if (data.user.role === 'instructor') {
        navigate('/instructor-dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Server is waking up... Please wait a moment and try again.')
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden" 
      style={{ background: 'linear-gradient(135deg, #070913 0%, #0B0F19 50%, #150E2E 100%)' }}>
      
      {/* Floating particles background decoration */}
      <div className="absolute top-[10%] right-[5%] w-72 h-72 rounded-full bg-[#EA4532]/10 blur-[80px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[10%] left-[5%] w-80 h-80 rounded-full bg-[#3895D2]/10 blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

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
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#EA4532] via-[#E8A33D] to-[#3895D2]" />
        
        {/* Left panel — Robot + Features */}
        <div className="w-full lg:w-[48%] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between gap-6 relative overflow-hidden bg-white/[0.01]">
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center overflow-hidden bg-white/5 backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-200">
                <img src="/favicon_circle.png" alt="Digimartrix Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-base tracking-wide leading-none">
                  <span className="text-[#3895D2]">DIGI</span>
                  <span className="text-[#EA4532]">GROWUP</span>
                </span>
                <span className="font-mono text-white/40 text-[8px] tracking-[0.2em] mt-1 font-bold">ECOSYSTEM MEMBERSHIP</span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-black text-white mb-2 leading-tight">
              Join as a{' '}
              <span className="bg-gradient-to-r from-[#3895D2] via-[#E8A33D] to-[#EA4532] bg-clip-text text-transparent animate-shimmer">Learner or Instructor</span>.
            </h1>
            <p className="text-white/50 text-xs md:text-sm leading-relaxed">
              Create your free verified account, choose your role, and gain immediate access to our interactive curriculum studio or learner hub.
            </p>
          </div>

          {/* Interactive Robot with speech and thoughts */}
          <div className="relative z-10 flex flex-col items-center my-2 group">
            {/* Thought Bubble */}
            <div 
              onClick={handleRoboClick}
              className="relative cursor-pointer mb-3 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-white/30 text-center max-w-[280px]"
              style={{ animation: 'thoughtFloat 3s ease-in-out infinite' }}
              title="Click to hear robo's thought!"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>{THOUGHTS[thoughtIdx]}</span>
                <Volume2 size={13} className="text-[#EA4532] flex-shrink-0 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/10 border-b border-r border-white/20 rotate-45" />
            </div>

            {/* Lottie Robo */}
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

          {/* Feature Grid */}
          <div className="relative z-10 grid grid-cols-2 gap-2">
            {[
              { icon: Code2, label: 'Practice Labs', desc: 'Hands-on coding' },
              { icon: BookOpen, label: 'Course Studio', desc: 'Authoring tools' },
              { icon: Users, label: 'Community', desc: 'Peer discussions' },
              { icon: Zap, label: 'AI Mentor', desc: 'Instant support' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-2.5 group hover:bg-white/[0.08] hover:border-white/15 transition-all cursor-default">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon size={12} strokeWidth={1.5} className="text-[#3895D2] group-hover:text-[#EA4532] transition-colors" />
                  <span className="text-white/85 text-[11px] font-bold">{label}</span>
                </div>
                <span className="text-white/30 text-[8px] font-mono uppercase tracking-wider">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form (Centered & Compact with Role Selector) */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white/[0.005]">
          <div className="w-full max-w-[420px] mx-auto page-enter">
            
            <div className="mb-4">
              <h2 className="text-2xl font-heading font-black text-white tracking-tight">Create Account</h2>
              <p className="text-white/45 text-xs mt-0.5">
                Already registered?{' '}
                <Link to="/login" className="text-[#3895D2] font-black hover:text-[#3895D2]/80 transition-colors underline decoration-2 underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-[#EA4532]/10 border border-[#EA4532]/20 rounded-xl px-4 py-2.5 mb-4">
                <AlertCircle size={15} strokeWidth={1.5} className="text-[#EA4532] mt-0.5 flex-shrink-0" />
                <p className="text-[#EA4532] text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Account Role Selector */}
              <div>
                <label className="block text-white/50 text-[10px] font-mono uppercase font-bold tracking-wider mb-1.5">
                  Choose Account Role:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map((r) => {
                    const Icon = r.icon
                    const isSelected = form.role === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, role: r.id }))}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-white/10 border-[#3895D2] text-white ring-1 ring-[#3895D2]/50 shadow-md'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/[0.08] hover:text-white opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Icon size={16} style={{ color: r.color }} />
                        <span className="text-[11px] font-bold leading-tight">{r.title.split(' ')[0]}</span>
                        <span className="text-[7.5px] font-mono text-white/40 uppercase">{r.title.split(' ')[1]}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Full Name Field */}
              <div>
                <label className="block text-white/50 text-xs font-bold mb-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#EA4532] transition-colors">
                    <User size={15} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#EA4532]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#EA4532]/10 transition-all font-body"
                  />
                </div>
              </div>

              {/* Email Address Field */}
              <div>
                <label className="block text-white/50 text-xs font-bold mb-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#EA4532] transition-colors">
                    <Mail size={15} />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#EA4532]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#EA4532]/10 transition-all font-body"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-white/50 text-xs font-bold mb-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#EA4532] transition-colors">
                    <Lock size={15} />
                  </div>
                  <input
                    id="reg-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#EA4532]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#EA4532]/10 transition-all font-body"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="reg-submit"
                type="submit"
                disabled={loading}
                className="w-full text-white font-black py-3 rounded-xl text-sm transition-all mt-2 font-heading shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #EA4532 0%, #C23020 100%)' }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating {form.role.toUpperCase()} account...
                  </>
                ) : `Join DigiGrowUp as ${form.role.toUpperCase()} →`}
              </button>
            </form>

            {/* Bottom trust badges */}
            <div className="flex items-center justify-center gap-2 mt-4 text-white/25">
              <ShieldCheck size={13} />
              <span className="text-[9px] font-mono tracking-wider uppercase">
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
