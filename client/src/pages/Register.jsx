import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, CheckCircle2, AlertCircle, Rocket, Code2, Users, Zap, Volume2, ShieldCheck, Mail, Lock, User } from 'lucide-react'
import api from '../lib/api'
import Lottie from 'lottie-react'

const THOUGHTS = [
  "Excited to have you here! Click me! 🎉",
  "Let's build something amazing! 🛠️",
  "Your coding journey starts now! 🚀",
  "I'll guide you step by step! 📚",
  "Join 100+ learners today! 🌟",
  "Master new skills with me! 💡",
]

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roboData, setRoboData] = useState(null)
  const [thoughtIdx, setThoughtIdx] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

  const pwStrength = form.password.length >= 8

  // Mouse move effect for glowing background
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      cardRef.current.style.setProperty('--mouse-x', `${x}px`)
      cardRef.current.style.setProperty('--mouse-y', `${y}px`)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    fetch('/DIGIMARTRIX_Robo.json')
      .then(r => r.json())
      .then(d => setRoboData(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setThoughtIdx(i => (i + 1) % THOUGHTS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Text to Speech logic
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
      navigate('/dashboard')
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

      {/* Main Container Card (Expanded width: max-w-6xl, min-h-[580px] for spacious layout) */}
      <div 
        ref={cardRef}
        className="w-full max-w-6xl min-h-[580px] bg-white/[0.01] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row relative transition-all duration-300 hover:border-white/15"
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
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#EA4532] via-[#3895D2] to-[#EA4532]" />
        
        {/* Left panel — Robot + Features (Tight spacing layout) */}
        <div className="w-full lg:w-[50%] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between gap-8 relative overflow-hidden bg-white/[0.01]">
          {/* Animated orbs inside the left container */}
          <div className="absolute top-10 right-0 w-48 h-48 rounded-full opacity-10 animate-pulse" style={{ background: 'radial-gradient(circle, #EA4532 0%, transparent 70%)' }} />
          <div className="absolute bottom-10 left-0 w-48 h-48 rounded-full opacity-8 animate-pulse" style={{ background: 'radial-gradient(circle, #3895D2 0%, transparent 70%)', animationDelay: '2s' }} />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl border border-white/15 flex items-center justify-center overflow-hidden bg-white/5 backdrop-blur-sm shadow-lg hover:scale-105 transition-transform duration-200">
                <img src="/favicon_circle.png" alt="Digimartrix Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-base tracking-wide leading-none">
                  <span className="text-[#3895D2]">DIGI</span>
                  <span className="text-[#EA4532]">GROWUP</span>
                </span>
                <span className="font-mono text-white/40 text-[8px] tracking-[0.2em] mt-1">LEARNING ECOSYSTEM</span>
              </div>
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-black text-white mb-3 leading-tight">
              Start your{' '}
              <span className="bg-gradient-to-r from-[#EA4532] to-[#3895D2] bg-clip-text text-transparent">learning journey</span>{' '}
              today.
            </h1>
            <p className="text-white/50 text-xs md:text-sm leading-relaxed max-w-md">
              Join the DigiGrowUp ecosystem and unlock 5 professional courses, AI-powered mentoring, coding labs, and real-world project experience.
            </p>
          </div>

          {/* Interactive Robot (Clickable with Speech Synthesis) */}
          <div className="relative z-10 flex flex-col items-center my-4 group">
            {/* Thought bubble with Speaker Indicator */}
            <div 
              onClick={handleRoboClick}
              className="relative mb-[-6px] cursor-pointer"
              style={{ animation: 'thoughtFloat 3s ease-in-out infinite' }}
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 max-w-[260px] relative shadow-xl hover:bg-white/[0.15] transition-all hover:scale-105 active:scale-95 duration-200">
                <p className="text-white/95 text-xs font-medium text-center leading-relaxed flex items-center justify-center gap-1.5 pr-2" key={thoughtIdx} style={{ animation: 'fadeInUp 0.5s ease-out' }}>
                  {THOUGHTS[thoughtIdx]}
                </p>
                <div className="absolute right-2.5 bottom-2.5 text-white/40">
                  <Volume2 size={11} className="animate-pulse" />
                </div>
                {/* Thought pointer bubbles */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
                  <div className="w-2 h-2 rounded-full bg-white/10 border border-white/15" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white/8 border border-white/10" />
                </div>
              </div>
            </div>

            {/* Clickable Lottie Robot */}
            {roboData && (
              <div 
                onClick={handleRoboClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="cursor-pointer transition-all duration-300 hover:scale-108 active:scale-95 flex flex-col items-center"
                style={{ 
                  width: 170, 
                  height: 170, 
                  filter: isHovered 
                    ? 'drop-shadow(0 0 35px rgba(234,69,50,0.3))' 
                    : 'drop-shadow(0 0 25px rgba(234,69,50,0.15))'
                }}
              >
                <Lottie animationData={roboData} loop autoplay style={{ width: '100%', height: '100%' }} />
                <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to speak
                </span>
              </div>
            )}
          </div>

          {/* Feature cards (Tight grid) */}
          <div className="relative z-10 grid grid-cols-2 gap-2.5">
            {[
              { icon: Code2, label: 'Practice Labs', desc: 'Hands-on coding' },
              { icon: Rocket, label: 'Build Projects', desc: 'Real-world apps' },
              { icon: Users, label: 'Community', desc: 'Peer learning' },
              { icon: Zap, label: 'AI Tutor', desc: 'Instant help' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 group hover:bg-white/[0.08] hover:border-white/15 transition-all cursor-default">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon size={12} strokeWidth={1.5} className="text-[#3895D2] group-hover:text-[#EA4532] transition-colors" />
                  <span className="text-white/85 text-[11px] font-bold">{label}</span>
                </div>
                <span className="text-white/30 text-[8px] font-mono uppercase tracking-wider">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form (Centered & Compact) */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white/[0.005]">
          <div className="w-full max-w-[390px] mx-auto page-enter">
            
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-black text-white mb-1.5 tracking-tight">Create Your Account</h2>
              <p className="text-white/45 text-sm">
                Already have an ID?{' '}
                <Link to="/login" className="text-[#3895D2] font-black hover:text-[#3895D2]/80 transition-colors underline decoration-2 underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Enrollment notice */}
            <div className="bg-[#3895D2]/10 border border-[#3895D2]/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
              <CheckCircle2 size={15} className="text-[#3895D2] mt-0.5 flex-shrink-0" />
              <p className="text-white/70 text-xs leading-relaxed">
                Auto-enrolled in <strong className="text-[#3895D2] font-bold">Web Development Fundamentals</strong>
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-[#EA4532]/10 border border-[#EA4532]/20 rounded-xl px-4 py-3 mb-6">
                <AlertCircle size={15} strokeWidth={1.5} className="text-[#EA4532] mt-0.5 flex-shrink-0" />
                <p className="text-[#EA4532] text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Learner Name Field */}
              <div>
                <label className="block text-white/50 text-xs font-bold mb-1.5">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#EA4532] transition-colors">
                    <User size={16} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#EA4532]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#EA4532]/10 transition-all font-body"
                  />
                </div>
              </div>

              {/* Email Address Field */}
              <div>
                <label className="block text-white/50 text-xs font-bold mb-1.5">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#EA4532] transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#EA4532]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#EA4532]/10 transition-all font-body"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-white/50 text-xs font-bold mb-1.5">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30 group-focus-within:text-[#EA4532] transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    id="reg-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#EA4532]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#EA4532]/10 transition-all font-body"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1 flex-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-1 flex-1 rounded-full transition-all"
                          style={{ backgroundColor: i < Math.min(4, Math.floor(form.password.length / 2)) ? '#3895D2' : 'rgba(255,255,255,0.1)' }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold" style={{ color: pwStrength ? '#4FB286' : 'rgba(255,255,255,0.3)' }}>
                      {pwStrength ? 'VALID' : 'SHORT'}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full text-white font-black py-3.5 rounded-xl text-sm transition-all mt-4 font-heading shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #EA4532 0%, #D63A2B 100%)' }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Ecosystem ID...
                  </>
                ) : 'Create Account →'}
              </button>
            </form>

            {/* Bottom trust badges */}
            <div className="flex items-center justify-center gap-2 mt-8 text-white/25">
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
