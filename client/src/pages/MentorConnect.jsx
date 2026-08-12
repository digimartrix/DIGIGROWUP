import { useState } from 'react'
import {
  Star, Calendar, X, ExternalLink, Users, Briefcase,
  Sparkles, CheckCircle2, ShieldCheck, MessageSquare,
  ArrowRight, Video, Zap, Globe
} from 'lucide-react'

const MENTORS = [
  {
    id: '1',
    name: 'Devanand K.',
    role: 'Lead Architect @ Digimartrix',
    company: 'Digimartrix Technologies',
    expertise: 'Node.js, System Design, MongoDB Scalability, Microservices',
    rating: 4.9,
    reviews: 142,
    avatar: 'D',
    color: '#3895D2',
    twinConnectUrl: 'https://twin-connect-app.vercel.app/',
    slots: ['10:00 AM - 11:00 AM', '02:00 PM - 03:00 PM', '06:00 PM - 07:00 PM'],
    bio: '10+ years architecting enterprise distributed backends and high-concurrency systems.'
  },
  {
    id: '2',
    name: 'Priyanka Sen',
    role: 'Staff UX Designer & Product Lead',
    company: 'DesignScale Labs',
    expertise: 'Design Systems, User Research, Accessibility, Figma Prototyping',
    rating: 4.8,
    reviews: 98,
    avatar: 'P',
    color: '#EA4532',
    twinConnectUrl: 'https://twin-connect-app.vercel.app/',
    slots: ['11:30 AM - 12:30 PM', '04:00 PM - 05:00 PM'],
    bio: 'Specializes in converting complex user journeys into intuitive, high-conversion interfaces.'
  },
  {
    id: '3',
    name: 'Rohan Mehta',
    role: 'Senior Full Stack Engineer',
    company: 'FinTech Cloud',
    expertise: 'React, Next.js, WebSockets, Payment Gateway Integrations',
    rating: 5.0,
    reviews: 76,
    avatar: 'R',
    color: '#4FB286',
    twinConnectUrl: 'https://twin-connect-app.vercel.app/',
    slots: ['09:00 AM - 10:00 AM', '05:30 PM - 06:30 PM'],
    bio: 'Built real-time trading engines and payment flows handling millions in daily volume.'
  },
  {
    id: '4',
    name: 'Ananya Sharma',
    role: 'AI & Data Science Specialist',
    company: 'Nexus AI Research',
    expertise: 'Python, LLM Fine-tuning, LangChain, Vector Databases',
    rating: 4.9,
    reviews: 110,
    avatar: 'A',
    color: '#8B5CF6',
    twinConnectUrl: 'https://twin-connect-app.vercel.app/',
    slots: ['01:00 PM - 02:00 PM', '07:00 PM - 08:00 PM'],
    bio: 'Deploying generative AI agents, retrieval-augmented generation (RAG), and machine learning pipelines.'
  },
]

export default function MentorConnect() {
  const [bookingMentor, setBookingMentor] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [booked, setBooked] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const handleBook = () => {
    if (!selectedSlot) return
    setBooked(true)
    setTimeout(() => {
      setBookingMentor(null)
      setBooked(false)
      setSelectedSlot('')
      setToastMsg(`📅 Session booked with ${bookingMentor.name}! Link sent to your notifications.`)
      setTimeout(() => setToastMsg(''), 5000)
    }, 1200)
  }

  const openTwinConnect = () => {
    window.open('https://twin-connect-app.vercel.app/', '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page-enter max-w-6xl space-y-8 pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-emerald-400 border border-emerald-500/30 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TWINCONNECT OFFICIAL INTEGRATION HERO BANNER */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-[#3895D2]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#EA4532]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-[#3895D2] font-bold uppercase bg-[#3895D2]/10 border border-[#3895D2]/30 px-3 py-1 rounded-full">
                <Sparkles size={13} />
                <span>POWERED BY TWINCONNECT</span>
              </span>
              <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                LIVE NETWORK
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black font-heading tracking-tight text-white leading-tight">
              Connect with Mentors & Businesses via{' '}
              <span className="bg-gradient-to-r from-[#3895D2] via-[#8B5CF6] to-[#EA4532] bg-clip-text text-transparent">
                TwinConnect
              </span>
            </h1>

            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              DigiGrowUp is integrated directly with <strong className="text-white">TwinConnect</strong> — the dedicated real-time platform for student mentorship, technical mock interviews, and startup business connections.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                '1-on-1 Architecture Reviews',
                'Technical Mock Interviews',
                'Startup & Business Matchmaking',
                'Verified Industry Leads'
              ].map((f) => (
                <span key={f} className="text-[11px] font-mono text-slate-300 bg-[#1E293B] border border-slate-700/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#3895D2]" />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Primary Action Card */}
          <div className="bg-[#1E293B]/80 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between gap-4 flex-shrink-0 lg:w-80 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3895D2] to-[#8B5CF6] flex items-center justify-center text-white shadow-md">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-slate-400 uppercase">External Portal</p>
                <h4 className="text-sm font-bold text-white">twin-connect-app</h4>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Access the complete TwinConnect network to find mentors in specialized domains or pitch your project to business partners.
            </p>

            <button
              onClick={openTwinConnect}
              className="w-full bg-gradient-to-r from-[#3895D2] to-[#2563EB] hover:from-[#2c7db5] hover:to-[#1d4ed8] text-white py-3 rounded-xl text-xs font-bold font-heading shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>Launch TwinConnect Platform</span>
              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <a
              href="https://twin-connect-app.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-slate-500 hover:text-[#3895D2] text-center truncate underline transition-colors"
            >
              https://twin-connect-app.vercel.app/
            </a>
          </div>
        </div>
      </div>

      {/* FEATURED MENTORS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-heading font-black text-slate-850 tracking-tight flex items-center gap-2">
              <Users size={18} className="text-[#3895D2]" />
              <span>Featured Industry Mentors</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Book live coaching sessions or connect directly on the TwinConnect platform.
            </p>
          </div>
          <button
            onClick={openTwinConnect}
            className="flex items-center gap-1 text-xs font-mono font-bold text-[#3895D2] hover:text-[#2563EB] transition-colors"
          >
            <span>Explore All on TwinConnect</span>
            <ExternalLink size={13} />
          </button>
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MENTORS.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col justify-between border-l-4 relative group"
              style={{ borderLeftColor: m.color }}
            >
              <div>
                {/* Mentor Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-base shadow-xs"
                      style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30` }}
                    >
                      {m.avatar}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-slate-850 text-base leading-tight">{m.name}</h3>
                      <p className="text-slate-500 text-xs font-medium mt-0.5">{m.role}</p>
                      <p className="text-[10px] font-mono text-slate-400 font-bold">{m.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex-shrink-0">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span className="font-mono text-xs font-bold text-slate-800">{m.rating}</span>
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed mb-4 font-medium">
                  {m.bio}
                </p>

                <div className="mb-5">
                  <p className="text-slate-400 font-mono text-[9px] font-bold mb-1.5 tracking-wider uppercase">
                    Core Technical Domains
                  </p>
                  <p className="text-slate-700 text-xs font-mono font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {m.expertise}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => setBookingMentor(m)}
                  className="w-full sm:flex-1 bg-[#3895D2] hover:bg-[#2c7db5] text-white py-2.5 rounded-xl text-xs font-bold font-heading transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Calendar size={14} />
                  <span>Book In-App Slot</span>
                </button>

                <a
                  href={m.twinConnectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold font-heading transition-all flex items-center justify-center gap-1.5 group/btn"
                >
                  <span>TwinConnect</span>
                  <ExternalLink size={13} className="text-slate-500 group-hover/btn:text-slate-800" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BUSINESS & VENTURE NETWORKING CALLOUT */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-slate-800 rounded-2xl p-6 md:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[#4FB286] font-bold uppercase">
            <Briefcase size={14} />
            <span>BUSINESS & HIRING PARTNERS</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold font-heading text-white">
            Looking to recruit verified student developers or find startup co-founders?
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Businesses and engineering managers can browse top-ranking project portfolios and hire directly through TwinConnect.
          </p>
        </div>

        <button
          onClick={openTwinConnect}
          className="bg-[#4FB286] hover:bg-[#4FB286]/90 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 flex-shrink-0"
        >
          <span>Connect as a Business</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* BOOKING MODAL */}
      {bookingMentor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-md w-full p-6 relative page-enter shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#3895D2]">Schedule Mentorship</span>
                <h3 className="font-heading font-bold text-white text-base">Session with {bookingMentor.name}</h3>
              </div>
              <button
                onClick={() => setBookingMentor(null)}
                className="text-slate-400 hover:text-white rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-slate-400 text-xs">
              Select an available time slot for your 1-on-1 technical discussion:
            </p>

            <div className="space-y-2">
              {bookingMentor.slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSlot(s)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-between ${
                    selectedSlot === s
                      ? 'border-[#3895D2] bg-[#3895D2]/15 text-[#3895D2] ring-1 ring-[#3895D2]/40'
                      : 'border-slate-700/80 bg-[#1E293B] text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={13} />
                    <span>{s}</span>
                  </div>
                  {selectedSlot === s && <CheckCircle2 size={15} />}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <a
                href={bookingMentor.twinConnectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-slate-400 hover:text-[#3895D2] flex items-center gap-1"
              >
                <span>Or use TwinConnect</span>
                <ExternalLink size={12} />
              </a>

              <button
                onClick={handleBook}
                disabled={!selectedSlot || booked}
                className="bg-[#3895D2] hover:bg-[#3895D2]/90 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg"
              >
                {booked ? 'Scheduling...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
