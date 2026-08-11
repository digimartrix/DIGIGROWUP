import { Building2, MapPin, DollarSign, Calendar, ArrowRight } from 'lucide-react'

const JOBS = [
  {
    id: '1',
    title: 'Junior React Frontend Engineer',
    company: 'Digimartrix Core Lab',
    location: 'Chennai, India (Hybrid)',
    stipend: '₹35,000 / month',
    type: 'Internship (6 Months)',
    skills: ['React.js', 'Tailwind CSS', 'ES6 JavaScript'],
  },
  {
    id: '2',
    title: 'Full Stack Node Developer',
    company: 'Artrix Cloud Solutions',
    location: 'Remote',
    stipend: '₹40,000 / month',
    type: 'Full-Time (Entry Level)',
    skills: ['Node.js', 'Express.js', 'MongoDB Atlas'],
  },
]

export default function OpportunityHub() {
  return (
    <div className="p-6 page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">CAREER ENGINE</p>
          <p className="text-slate-500 text-xs md:text-sm">
            Explore internships, hackathons, and job roles recommended directly by your Digimartrix skill mastery levels.
          </p>
        </div>

        <div className="space-y-4">
          {JOBS.map((job) => (
            <div key={job.id} className="bg-white border border-slate-200 rounded-md p-6 shadow-3xs transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={13} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">{job.company}</span>
                  </div>
                  <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base mb-3">{job.title}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-slate-450 font-mono mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} strokeWidth={1.5} />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign size={12} strokeWidth={1.5} />
                      <span>{job.stipend}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} strokeWidth={1.5} />
                      <span>{job.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.map(s => (
                      <span key={s} className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Applied successfully for the ${job.title} position!`)}
                  className="flex-shrink-0 bg-brandBlue text-white hover:bg-opacity-95 px-4 py-2.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all self-start shadow-3xs"
                >
                  Quick Apply
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
