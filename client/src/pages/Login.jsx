import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, AlertCircle, Sparkles, BookOpen, Brain, Trophy, Volume2, ShieldCheck, Mail, Lock, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react'
import api from '../lib/api'
import Lottie from 'lottie-react'
import { playLoudClearVoice } from '../lib/speech'

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
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    activeBg: 'bg-rose-600 text-white',
    email: 'admin@digimartrix.com',
    password: 'Admin123!',
    desc: 'Platform governance, logs & user management'
  },
  {
    id: 'instructor',
    label: 'Instructor',
    icon: BookOpen,
    color: '#D97706',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    activeBg: 'bg-amber-500 text-white',
    email: 'instructor@digimartrix.com',
    password: 'Instructor123!',
    desc: 'Author courses, modules, lessons & quizzes'
  },
  {
    id: 'student',
    label: 'Student',
    icon: UserCheck,
    color: '#0284C7',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    activeBg: 'bg-[#3895D2] text-white',
    email: 'vedasaradhiv@gmail.com',
    password: '',
    desc: 'Interactive courses, labs & AI tutoring'
  }
]

export default function Login() {
  const [form, setForm] = useState({ email: 'vedasaradhiv@gmail.com', password: '' })
  const [selectedRole, setSelectedRole] = useState('student')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [thoughtIdx, setThoughtIdx] = useState(0)
  const [animationData, setAnimationData] = useState(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/DIGIMARTRIX_Robo.json')
      .then(res => res.json())
      .then(data => setAnimationData(data))
      .catch(err => console.error("Error loading robo animation:", err))
  }, [])

  const speakThought = (textToSpeak) => {
    playLoudClearVoice(textToSpeak)
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-50 relative overflow-hidden">
      {/* Soft elegant background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden flex flex-col lg:flex-row relative z-10">
        
        {/* Left Side: Brand Showcase + Interactive Robot Mascot */}
        <div className="w-full lg:w-[46%] p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between gap-6 bg-slate-50/60">
          
          {/* Logo & Header */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center shadow-xs">
                <img src="/favicon_circle.png" alt="Digimartrix Logo" className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-base tracking-wide leading-none text-slate-900">
                  <span className="text-[#3895D2]">DIGI</span>
                  <span className="text-[#EA4532]">GROWUP</span>
                </span>
                <span className="font-mono text-slate-600 text-[9px] tracking-wider mt-1 font-bold">NEXT-GEN LEARNING</span>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-heading font-black text-slate-900 mb-2 leading-tight tracking-tight">
              Sign in to your learning workspace.
            </h1>
            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
              Access interactive programming courses, real-time code labs, mentor sessions, and course authoring tools.
            </p>
          </div>

          {/* Interactive Mascot & Speech Bubble */}
          <div className="flex flex-col items-center my-2 group">
            {/* Thought bubble */}
            <button
              type="button"
              onClick={handleRoboClick}
              className="cursor-pointer mb-3 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-xs hover:shadow-md hover:border-[#3895D2]/40 transition-all flex items-center gap-2 max-w-[280px] text-center"
            >
              <span>{THOUGHTS[thoughtIdx]}</span>
              <Volume2 size={15} className="text-[#3895D2] flex-shrink-0 animate-pulse" />
            </button>

            {/* Robot Animation */}
            <div 
              onClick={handleRoboClick}
              className="w-36 h-36 relative cursor-pointer transform transition-transform duration-300 group-hover:scale-105"
              title="Click to talk with DigiRobot!"
            >
              {animationData ? (
                <Lottie animationData={animationData} loop={true} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🤖</div>
              )}
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: BookOpen, label: 'Interactive Tracks', text: 'Real-time Coding' },
              { icon: ShieldCheck, label: 'Verified Certificates', text: 'Skill Badges' },
            ].map(({ icon: Icon, label, text }) => (
              <div 
                key={label} 
                className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                  <Icon size={13} className="text-[#3895D2]" />
                  <span>{label}</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5 font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Role Selector & Login Form */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="w-full max-w-md mx-auto page-enter">
            
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Sign In</h2>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                New to DigiGrowUp?{' '}
                <Link to="/register" className="text-[#3895D2] font-bold hover:underline">
                  Create a free account
                </Link>
              </p>
            </div>

            {/* Role Quick Selector */}
            <div className="mb-6">
              <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-2">
                Select Your Role Portal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ROLES.map((roleItem) => {
                  const Icon = roleItem.icon
                  const isSelected = selectedRole === roleItem.id
                  return (
                    <button
                      type="button"
                      key={roleItem.id}
                      onClick={() => handleSelectRole(roleItem)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-white/20 text-white' : `${roleItem.bg} text-slate-800`
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-heading font-bold">{roleItem.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 font-medium animate-fade-in">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:border-[#3895D2] focus:ring-2 focus:ring-[#3895D2]/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono font-bold text-slate-700 uppercase">
                    Password
                  </label>
                  <Link to="/settings" className="text-[11px] font-medium text-slate-600 hover:text-[#3895D2]">
                    Need Help?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs md:text-sm font-medium focus:bg-white focus:outline-none focus:border-[#3895D2] focus:ring-2 focus:ring-[#3895D2]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 active:scale-[0.99] text-white rounded-xl text-xs md:text-sm font-heading font-black transition-all shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : `Sign In to ${selectedRole.toUpperCase()} Portal`}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Footer notice */}
            <div className="mt-6 text-center text-[11px] text-slate-600 font-medium">
              <span>Protected by DigiMartrix 256-bit encrypted authentication</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
