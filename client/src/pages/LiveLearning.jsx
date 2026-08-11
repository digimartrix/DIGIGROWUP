import { Calendar, User, Clock, ArrowRight } from 'lucide-react'

const EVENTS = [
  {
    id: '1',
    title: 'Advanced JavaScript Scopes & Closures Workshop',
    desc: 'Deep-dive session resolving asynchronous lexical scopes, garbage collection, and custom performance memory leaks in React systems.',
    trainer: 'Devanand K. (Lead Architect)',
    date: 'Aug 18, 2026',
    time: '04:00 PM - 05:30 PM IST',
    seats: 45,
  },
  {
    id: '2',
    title: 'Designing Clean Systems with CSS Flex & Grid Systems',
    desc: 'Practical workshop focusing on architectural design hierarchies, fluid layout ratios, and accessibility margins.',
    trainer: 'Priyanka Sen (UX Lead)',
    date: 'Aug 21, 2026',
    time: '02:00 PM - 03:30 PM IST',
    seats: 60,
  },
]

export default function LiveLearning() {
  return (
    <div className="p-6 page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">LIVE SESSIONS & WORKSHOPS</p>
          <p className="text-slate-500 text-xs md:text-sm">
            Register for upcoming live lectures, hands-on bootcamps, and developer workshops hosted by Digimartrix specialists.
          </p>
        </div>

        <div className="space-y-4">
          {EVENTS.map((event) => (
            <div key={event.id} className="bg-white border border-slate-200 rounded-md p-6 hover:shadow-xs transition-all flex flex-col justify-between shadow-3xs">
              <div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} strokeWidth={1.5} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} strokeWidth={1.5} />
                    <span>{event.time}</span>
                  </div>
                </div>
                <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base mb-2">{event.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed mb-4">{event.desc}</p>
                
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User size={13} strokeWidth={1.5} />
                  <span>Hosted by: <strong className="text-slate-650 font-semibold">{event.trainer}</strong></span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{event.seats} seats remaining</span>
                <button
                  onClick={() => alert(`Registered successfully for "${event.title}"!`)}
                  className="bg-brandBlue text-white hover:bg-opacity-95 px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-3xs"
                >
                  Register
                  <ArrowRight size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
