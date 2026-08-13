import { useState } from 'react'
import {
  Calendar, User, Clock, ArrowRight, Video,
  CheckCircle2, Sparkles, AlertCircle, PlayCircle,
  Share2, Users, ExternalLink, X, PlusCircle
} from 'lucide-react'

const EVENTS_DATA = [
  {
    id: 'live-1',
    title: 'Advanced JavaScript Scopes & Closures Deep Dive Workshop',
    desc: 'Deep-dive session resolving asynchronous lexical scopes, garbage collection, memory leak detection in Chrome DevTools, and React performance hooks.',
    trainer: 'Devanand K. (Lead Architect)',
    date: 'Aug 18, 2026',
    time: '04:00 PM - 05:30 PM IST',
    seats: 45,
    status: 'UPCOMING',
    tags: ['JavaScript', 'Performance', 'Memory Leaks'],
    meetUrl: 'https://meet.google.com/dgu-live-dev'
  },
  {
    id: 'live-2',
    title: 'Designing Clean Systems with CSS Flex & Modern Subgrid',
    desc: 'Practical workshop focusing on architectural design hierarchies, fluid layout ratios, container queries, and WCAG accessibility standards.',
    trainer: 'Priyanka Sen (UX Design Lead)',
    date: 'Aug 21, 2026',
    time: '02:00 PM - 03:30 PM IST',
    seats: 60,
    status: 'UPCOMING',
    tags: ['CSS Grid', 'UI/UX', 'Accessibility'],
    meetUrl: 'https://meet.google.com/dgu-live-css'
  },
  {
    id: 'live-3',
    title: 'Building Real-Time Microservices with Node.js & WebSockets',
    desc: 'Recorded masterclass covering full socket lifecycle, room broadcasting, Redis pub/sub backplanes, and low-latency API design.',
    trainer: 'Rahul Verma (Cloud Architect)',
    date: 'Aug 10, 2026',
    time: 'Completed (Recorded)',
    seats: 120,
    status: 'RECORDING',
    tags: ['Node.js', 'WebSockets', 'Redis'],
    recordingUrl: 'https://www.youtube.com/watch?v=sample'
  },
  {
    id: 'live-4',
    title: 'Crack the Technical Coding Round: Live Mock Interview Breakdown',
    desc: 'Interactive live session breaking down real technical interview problems from Uber, Amazon, and Google with optimal Big-O trade-offs.',
    trainer: 'Veda Sarathi V. (Ecosystem Mentor)',
    date: 'Aug 25, 2026',
    time: '06:00 PM - 07:30 PM IST',
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

      {/* Live Room Simulator Modal */}
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
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">LIVE WORKSPACE CONNECTED</span>
            </div>

            <div>
              <h2 className="font-heading font-black text-slate-850 text-lg md:text-xl">
                {activeModal.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{activeModal.desc}</p>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-xl text-center space-y-3">
              <Video size={36} className="mx-auto text-[#3895D2] animate-bounce" />
              <p className="text-sm font-bold">Virtual Classroom Room Ready</p>
              <p className="text-xs text-slate-400 font-mono">{activeModal.time} · Hosted by {activeModal.trainer}</p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => addToCalendar(activeModal)}
                className="text-xs font-bold text-slate-600 hover:text-slate-850 flex items-center gap-1.5"
              >
                <PlusCircle size={14} />
                <span>Add to Google Calendar</span>
              </button>

              <a
                href={activeModal.meetUrl || 'https://meet.google.com'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold font-heading transition-all shadow-xs"
              >
                <span>Launch Google Meet</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] text-[#3895D2] uppercase tracking-widest mb-1 font-bold">COMMUNITY BROADCASTS</p>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-850">
            Live Learning & Masterclasses
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5 font-medium">
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
            className={`px-4 py-1.5 rounded-xl text-xs font-bold font-heading transition-all whitespace-nowrap ${
              filter === tab.id
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filtered.map((event) => {
          const isRegistered = registeredEvents.includes(event.id)
          const isRecording = event.status === 'RECORDING'

          return (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 md:p-7 shadow-xs hover:border-[#3895D2]/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-md ${
                    isRecording
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isRecording ? 'RECORDING AVAILABLE' : 'UPCOMING LIVE'}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-[#3895D2]" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#3895D2]" />
                      {event.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Users size={13} />
                  <span>{event.seats} Seats Available</span>
                </div>
              </div>

              <div>
                <h3 className="font-heading font-black text-slate-850 text-base md:text-lg mb-1.5">
                  {event.title}
                </h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium">
                  {event.desc}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((tag, i) => (
                  <span key={i} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={14} className="text-slate-400" />
                  <span>Trainer: <strong className="text-slate-800 font-semibold">{event.trainer}</strong></span>
                </div>

                <div className="flex items-center gap-2.5">
                  {!isRecording && (
                    <button
                      onClick={() => setActiveModal(event)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Room Details
                    </button>
                  )}

                  {!isRecording ? (
                    <button
                      onClick={() => handleToggleRegister(event)}
                      className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold font-heading transition-all shadow-xs ${
                        isRegistered
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#3895D2] hover:bg-[#2c7db5] text-white'
                      }`}
                    >
                      {isRegistered ? <CheckCircle2 size={14} /> : <PlusCircle size={14} />}
                      <span>{isRegistered ? 'Registered ✓' : 'Register Now'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => showToast('Streaming session recording...')}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-heading transition-all shadow-xs"
                    >
                      <PlayCircle size={14} />
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
