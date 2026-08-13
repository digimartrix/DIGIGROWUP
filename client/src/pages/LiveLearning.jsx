import { useState } from 'react'
import {
  Calendar, User, Clock, ArrowRight, Video,
  CheckCircle2, Sparkles, AlertCircle, PlayCircle,
  Share2, Users, ExternalLink, X, PlusCircle, Bookmark
} from 'lucide-react'

const EVENTS_DATA = [
  {
    id: 'live-1',
    title: 'Advanced JavaScript Scopes & Closures Deep Dive Workshop',
    desc: 'Deep-dive session resolving asynchronous lexical scopes, garbage collection, memory leak detection in Chrome DevTools, and React performance hooks.',
    trainer: 'Devanand K.',
    role: 'Lead Architect',
    date: 'Aug 18, 2026',
    time: '04:00 PM – 05:30 PM IST',
    seats: 45,
    status: 'UPCOMING',
    tags: ['JavaScript', 'Performance', 'Memory Leaks'],
    meetUrl: 'https://meet.google.com/dgu-live-dev'
  },
  {
    id: 'live-2',
    title: 'Designing Clean Systems with CSS Flex & Modern Subgrid',
    desc: 'Practical workshop focusing on architectural design hierarchies, fluid layout ratios, container queries, and WCAG accessibility standards.',
    trainer: 'Priyanka Sen',
    role: 'UX Design Lead',
    date: 'Aug 21, 2026',
    time: '02:00 PM – 03:30 PM IST',
    seats: 60,
    status: 'UPCOMING',
    tags: ['CSS Grid', 'UI Systems', 'Accessibility'],
    meetUrl: 'https://meet.google.com/dgu-live-css'
  },
  {
    id: 'live-3',
    title: 'Building Real-Time Microservices with Node.js & WebSockets',
    desc: 'Recorded masterclass covering full socket lifecycle, room broadcasting, Redis pub/sub backplanes, and low-latency API design.',
    trainer: 'Rahul Verma',
    role: 'Cloud Architect',
    date: 'Aug 10, 2026',
    time: 'Recorded Masterclass (1h 30m)',
    seats: 120,
    status: 'RECORDING',
    tags: ['Node.js', 'WebSockets', 'Redis'],
    recordingUrl: 'https://www.youtube.com/watch?v=sample'
  },
  {
    id: 'live-4',
    title: 'Crack the Technical Coding Round: Live Mock Interview Breakdown',
    desc: 'Interactive live session breaking down real technical interview problems from Uber, Amazon, and Google with optimal Big-O trade-offs.',
    trainer: 'Veda Sarathi V.',
    role: 'Ecosystem Mentor',
    date: 'Aug 25, 2026',
    time: '06:00 PM – 07:30 PM IST',
    seats: 80,
    status: 'UPCOMING',
    tags: ['Interviews', 'Algorithms', 'FAANG Prep'],
    meetUrl: 'https://meet.google.com/dgu-live-mock'
  }
]

export default function LiveLearning() {
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    const saved = localStorage.getItem('REGISTERED_EVENTS')
    return saved ? JSON.parse(saved) : ['live-1']
  })
  const [filter, setFilter] = useState('ALL')
  const [activeModal, setActiveModal] = useState(null)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  const handleToggleRegister = (event) => {
    if (registeredEvents.includes(event.id)) {
      const updated = registeredEvents.filter(id => id !== event.id)
      setRegisteredEvents(updated)
      localStorage.setItem('REGISTERED_EVENTS', JSON.stringify(updated))
      showToast(`Cancelled registration for "${event.title}".`)
    } else {
      const updated = [...registeredEvents, event.id]
      setRegisteredEvents(updated)
      localStorage.setItem('REGISTERED_EVENTS', JSON.stringify(updated))
      showToast(`🎉 Successfully registered for "${event.title}"! Reminder set.`)
    }
  }

  const addToCalendar = (event) => {
    const title = encodeURIComponent(event.title)
    const details = encodeURIComponent(event.desc)
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`
    window.open(url, '_blank')
  }

  const filtered = EVENTS_DATA.filter((e) => {
    if (filter === 'ALL') return true
    if (filter === 'UPCOMING') return e.status === 'UPCOMING'
    if (filter === 'RECORDING') return e.status === 'RECORDING'
    if (filter === 'MY_EVENTS') return registeredEvents.includes(e.id)
    return true
  })

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

      {/* Live Room Modal */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-5 relative animate-scale-up">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                LIVE VIRTUAL ROOM READY
              </span>
            </div>

            <div>
              <h2 className="font-heading font-black text-slate-850 text-xl md:text-2xl leading-snug">
                {activeModal.title}
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{activeModal.desc}</p>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-xl text-center space-y-2.5 border border-slate-800">
              <Video size={36} className="mx-auto text-[#3895D2] animate-bounce" />
              <p className="text-base font-bold font-heading">Google Meet Integration</p>
              <p className="text-xs text-slate-300 font-mono">{activeModal.time} · Trainer: {activeModal.trainer}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <button
                onClick={() => addToCalendar(activeModal)}
                className="w-full sm:w-auto text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200"
              >
                <PlusCircle size={15} />
                <span>Add to Google Calendar</span>
              </button>

              <a
                href={activeModal.meetUrl || 'https://meet.google.com'}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold font-heading transition-all shadow-xs"
              >
                <span>Launch Google Meet</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold text-[#3895D2] uppercase tracking-wider mb-1">COMMUNITY BROADCASTS</p>
          <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-slate-850">
            Live Learning & Masterclasses
          </h1>
          <p className="text-slate-600 text-sm mt-1 font-medium">
            Join interactive bootcamps, architecture breakdowns, and Q&A sessions hosted by specialist mentors.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Sessions' },
          { id: 'UPCOMING', label: 'Upcoming Live' },
          { id: 'MY_EVENTS', label: `My Registered (${registeredEvents.length})` },
          { id: 'RECORDING', label: 'Recordings & Replays' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-5">
        {filtered.map((event) => {
          const isRegistered = registeredEvents.includes(event.id)
          const isRecording = event.status === 'RECORDING'

          return (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs hover:border-[#3895D2]/50 hover:shadow-md transition-all space-y-5"
            >
              {/* Top Meta Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                    isRecording
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isRecording ? '● RECORDING AVAILABLE' : '● UPCOMING LIVE'}
                  </span>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#3895D2]" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#3895D2]" />
                      {event.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                  <Users size={14} className="text-slate-400" />
                  <span><strong>{event.seats}</strong> Seats Available</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-heading font-black text-slate-850 text-lg md:text-xl leading-snug mb-2">
                  {event.title}
                </h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                  {event.desc}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-medium bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Bottom Actions Strip */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <User size={16} className="text-[#3895D2]" />
                  <span>Host: <strong className="text-slate-900 font-bold">{event.trainer}</strong> <span className="text-xs text-slate-500 font-normal">({event.role})</span></span>
                </div>

                <div className="flex items-center gap-3">
                  {!isRecording && (
                    <button
                      onClick={() => setActiveModal(event)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200"
                    >
                      Room Details
                    </button>
                  )}

                  {!isRecording ? (
                    <button
                      onClick={() => handleToggleRegister(event)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-heading transition-all shadow-xs ${
                        isRegistered
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#3895D2] hover:bg-[#2c7db5] text-white'
                      }`}
                    >
                      {isRegistered ? <CheckCircle2 size={15} /> : <PlusCircle size={15} />}
                      <span>{isRegistered ? 'Registered ✓' : 'Register Now'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => showToast('Streaming session recording...')}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-heading transition-all shadow-xs"
                    >
                      <PlayCircle size={15} />
                      <span>Watch Replay (1h 30m)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
