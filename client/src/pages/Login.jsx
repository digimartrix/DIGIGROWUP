import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, AlertCircle, Sparkles, BookOpen, Brain, Trophy, Volume2, ShieldCheck, Mail, Lock } from 'lucide-react'
import api from '../lib/api'
import Lottie from 'lottie-react'

const THOUGHTS = [
  "Ready to learn something new? Click me to hear! 🚀",
  "Welcome back, future developer! Let's code. 💻",
  "Let's grow your skills today!🌱",
  "Code. Create. Conquer! 🎯",
  "Your learning journey awaits! ✨",
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [roboData, setRoboData] = useState(null)
  const [thoughtIdx, setThoughtIdx] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef(null)

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

  // Cycle thoughts
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
        // Cancel any ongoing speech
        synth.cancel()
        // Clean thought text of emojis for cleaner pronunciation
        const cleanText = textToSpeak.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.rate = 1.0
        utterance.pitch = 1.1 // Slightly cute robotic pitch
        synth.speak(utterance)
      }
    } catch (e) {
      console.warn("Speech failed:", e)
    }
  }

  const handleRoboClick = () => {
    // Pick next thought immediately
    const nextIdx = (thoughtIdx + 1) % THOUGHTS.length
    setThoughtIdx(nextIdx)
    speakThought(THOUGHTS[nextIdx])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('Server is waking up... Please wait a moment and try again.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.')
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

      {/* Main Container Card (Expanded width: max-w-6xl, min-h-[580px] for spacious feeling) */}
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
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#3895D2] via-[#EA4532] to-[#3895D2]" />

        {/* Left Side: Robot + Immersive Interactive Graphics */}
        <div className="w-full lg:w-[50%] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between gap-8 relative overflow-hidden bg-white/[0.01]">
          
          {/* Logo & Header */}
          <div className="relative z-10">
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
              Your learning{' '}
              <span className="bg-gradient-to-r from-[#3895D2] to-[#EA4532] bg-clip-text text-transparent animate-shimmer">command center</span>{' '}
              awaits.
            </h1>
            <p className="text-white/50 text-xs md:text-sm leading-relaxed max-w-md">
              Master web development, AI, blockchain, and more through interactive courses, AI-powered mentoring, and hands-on projects.
            </p>
          </div>

          {/* Interactive Robot (Clickable with Speech Synthesis & Micro-animations) */}
          <div className="relative z-10 flex flex-col items-center my-4 group">
            {/* Thought bubble with Volume/Speaker Indicator */}
            <div 
              onClick={handleRoboClick}
              className="relative mb-[-6px] cursor-pointer"
              style={{ animation: 'thoughtFloat 3s ease-in-out infinite' }}
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 max-w-[260px] relative shadow-xl hover:bg-white/[0.15] transition-all hover:scale-105 active:scale-95 duration-200">
                <p className="text-white/95 text-xs font-medium text-center leading-relaxed flex items-center justify-center gap-1.5 pr-2">
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
                    ? 'drop-shadow(0 0 35px rgba(56,149,210,0.3))' 
                    : 'drop-shadow(0 0 25px rgba(56,149,210,0.15))'
                }}
              >
                <Lottie animationData={roboData} loop autoplay style={{ width: '100%', height: '100%' }} />
                <span className="text-[10px] text-white/30 font-mono tracking-widest uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to speak
                </span>
              </div>
            )}
          </div>

          {/* Interactive Feature Pills */}
          <div className="relative z-10 flex flex-wrap gap-2.5 justify-center lg:justify-start">
            {[
              { icon: BookOpen, label: '5 Full Courses', color: '#3895D2' },
              { icon: Brain, label: 'AI Tutor Enabled', color: '#8B5CF6' },
              { icon: Trophy, label: 'Earn Real Credits', color: '#EA4532' },
              { icon: Sparkles, label: '18+ Modules', color: '#10B981' },
            ].map(({ icon: Icon, label, color }) => (
              <div 
                key={label} 
                className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 text-white/70 text-[10px] font-bold font-mono uppercase tracking-wider hover:bg-white/[0.08] hover:border-white/15 transition-all duration-200"
              >
                <Icon size={12} style={{ color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Elegant Form with Interactive Input Elements */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white/[0.005]">
          <div className="w-full max-w-[390px] mx-auto page-enter">
            
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-black text-white mb-1.5 tracking-tight">Welcome Back</h2>
              <p className="text-white/45 text-sm">
                New to the ecosystem?{' '}
                <Link to="/register" className="text-[#3895D2] font-black hover:text-[#3895D2]/80 transition-colors underline decoration-2 underline-offset-4">
                  Create account
                </Link>
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-[#EA4532]/10 border border-[#EA4532]/20 rounded-2xl px-4 py-3 mb-6">
                <AlertCircle size={16} strokeWidth={1.5} className="text-[#EA4532] mt-0.5 flex-shrink-0" />
                <p className="text-[#EA4532] text-xs leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Interactive Email field with icon input wrapper */}
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#3895D2]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#3895D2]/10 transition-all font-body"
                  />
                </div>
              </div>

              {/* Interactive Password field with icon input wrapper */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-white/50 text-xs font-bold">Password</label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please contact your administrator to reset passwords."); }} className="text-xs text-white/30 hover:text-white/60 transition-colors">
                    Forgot?
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
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-11 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#3895D2]/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#3895D2]/10 transition-all font-body"
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
                className="w-full text-white font-black py-3.5 rounded-xl text-sm transition-all mt-4 font-heading shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #3895D2 0%, #2A7BB8 100%)' }}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : 'Sign In →'}
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
      `}</style>
    </div>
  )
}
