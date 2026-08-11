import { useState } from 'react'
import { Star, Calendar, X } from 'lucide-react'

const MENTORS = [
  {
    id: '1',
    name: 'Devanand K.',
    role: 'Lead Architect @ Digimartrix',
    expertise: 'Node.js, System Design, MongoDB Scalability',
    rating: 4.9,
    reviews: 142,
    avatar: 'D',
    slots: ['10:00 AM - 11:00 AM', '02:00 PM - 03:00 PM'],
  },
  {
    id: '2',
    name: 'Priyanka Sen',
    role: 'UX Designer & Product Lead',
    expertise: 'Information Architecture, UI systems, Accessibility',
    rating: 4.8,
    reviews: 98,
    avatar: 'P',
    slots: ['11:30 AM - 12:30 PM', '04:00 PM - 05:00 PM'],
  },
]

export default function MentorConnect() {
  const [bookingMentor, setBookingMentor] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [booked, setBooked] = useState(false)

  const handleBook = () => {
    if (!selectedSlot) return
    setBooked(true)
    setTimeout(() => {
      setBookingMentor(null)
      setBooked(false)
      setSelectedSlot('')
      alert('📅 Mentor session booked successfully! Details sent to your Activity Center.')
    }, 1500)
  }

  return (
    <div className="p-6 page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">MENTORSHIP MATCHING</p>
          <p className="text-slate-500 text-xs md:text-sm">
            Schedule 1-on-1 calls with professional mentors to debug complex architectures, review code, or prepare for job opportunities.
          </p>
        </div>

        {/* Mentor list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MENTORS.map((m) => (
            <div key={m.id} className="bg-white border border-slate-200 rounded-md p-6 hover:shadow-xs transition-all flex flex-col justify-between shadow-3xs">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-brandBlue/10 border border-brandBlue/20 flex items-center justify-center font-heading font-bold text-brandBlue">
                    {m.avatar}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-800 text-sm leading-none mb-1">{m.name}</h3>
                    <p className="text-slate-400 text-[11px] font-semibold">{m.role}</p>
                  </div>
                </div>

                <p className="text-slate-400 font-mono text-[9px] font-bold mb-1.5 tracking-wider uppercase">EXPERTISE</p>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">{m.expertise}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1 text-amber">
                    <Star size={14} fill="currentColor" />
                    <span className="font-mono text-xs font-bold text-slate-700">{m.rating}</span>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">{m.reviews} sessions conducted</span>
                </div>
              </div>

              <button
                onClick={() => setBookingMentor(m)}
                className="w-full bg-brandBlue hover:bg-opacity-95 text-white border border-brandBlue font-bold py-2.5 rounded text-xs transition-colors flex items-center justify-center gap-2 shadow-3xs"
              >
                <Calendar size={13} strokeWidth={1.5} />
                Book Live Session
              </button>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {bookingMentor && (
          <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-slate-250 rounded shadow-xl max-w-[400px] w-full p-6 relative page-enter">
              <button
                onClick={() => setBookingMentor(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 rounded p-1 hover:bg-slate-50"
              >
                <X size={15} strokeWidth={1.5} />
              </button>
              <h3 className="font-heading font-bold text-slate-800 text-base mb-2">Schedule Session</h3>
              <p className="text-slate-500 text-xs mb-4 font-semibold">Select an available slot with {bookingMentor.name}</p>

              <div className="space-y-2 mb-6">
                {bookingMentor.slots.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSlot(s)}
                    className={`w-full text-left p-3 rounded border text-xs font-bold font-mono transition-all ${
                      selectedSlot === s
                        ? 'border-brandBlue bg-brandBlue/5 text-brandBlue'
                        : 'border-slate-200 hover:border-slate-350 text-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button
                onClick={handleBook}
                disabled={!selectedSlot || booked}
                className="w-full bg-brandBlue hover:bg-opacity-95 disabled:opacity-50 text-white font-bold py-2.5 rounded text-xs transition-colors flex items-center justify-center gap-2 shadow-3xs"
              >
                {booked ? 'Scheduling...' : 'Confirm Session'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
