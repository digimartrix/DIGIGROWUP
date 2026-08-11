import { useState } from 'react'
import { Briefcase } from 'lucide-react'

export default function CareerLaunchpad() {
  const [careerGoal, setCareerGoal] = useState('Full Stack Developer')

  const metrics = [
    { title: 'Technical Skills', pct: 78, color: '#3895D2' },
    { title: 'Project Implementation', pct: 65, color: '#EA4532' },
    { title: 'Code Practice Tasks', pct: 71, color: '#E8A33D' },
    { title: 'Core Communication', pct: 62, color: '#4FB286' },
  ]

  const gaps = [
    { skill: 'Asynchronous JS Protocols', action: 'Complete closures assessment in learning command center' },
    { skill: 'CSS Flexbox alignment edge-cases', action: 'Submit flexbox grid build-lab project' },
  ]

  return (
    <div className="p-6 page-enter">
      <div className="max-w-4xl">
        {/* Header info */}
        <div className="mb-6">
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">CAREER READY SYSTEM</p>
          <p className="text-slate-500 text-xs md:text-sm">
            Define your career trajectory, analyze skill gaps, and track your overall job readiness benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Goal card */}
          <div className="bg-white border border-slate-200 rounded-md p-6 md:col-span-2 shadow-3xs">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block mb-2 font-bold">ACTIVE CAREER TARGET</span>
            <div className="flex items-center gap-3 mb-4">
              <Briefcase size={20} className="text-brandBlue" />
              <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base leading-none">{careerGoal}</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              This path benchmarks your HTML structure, advanced layout positioning, and functional closure systems to verify backend integration capability.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCareerGoal('AI Systems Engineer')}
                className="text-xs text-brandBlue font-bold hover:underline"
              >
                Switch Trajectory →
              </button>
            </div>
          </div>

          {/* Score card */}
          <div className="bg-white border border-slate-200 rounded-md p-6 flex flex-col justify-center text-center shadow-3xs">
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-400 block mb-2 font-bold">CAREER READINESS</span>
            <p className="font-mono text-5xl font-black text-brandBlue mb-1">72%</p>
            <p className="text-slate-400 text-xs font-semibold">Based on 3 tracked topics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Metrics */}
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-3xs">
            <h3 className="font-heading font-bold text-slate-800 text-xs md:text-sm mb-4">Core Competency Matrix</h3>
            <div className="space-y-4">
              {metrics.map((m) => (
                <div key={m.title}>
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span className="text-slate-600">{m.title}</span>
                    <span className="font-mono" style={{ color: m.color }}>{m.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gaps */}
          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-3xs">
            <h3 className="font-heading font-bold text-slate-800 text-xs md:text-sm mb-4">Identified Skill Gaps</h3>
            <div className="space-y-4">
              {gaps.map((g, i) => (
                <div key={i} className="flex gap-3 items-start text-xs">
                  <div className="w-5 h-5 rounded-full bg-brandRed/10 border border-brandRed/20 flex items-center justify-center flex-shrink-0 mt-0.5 text-brandRed font-mono font-bold">
                    !
                  </div>
                  <div>
                    <p className="text-slate-800 font-bold">{g.skill}</p>
                    <p className="text-slate-405 mt-0.5 leading-relaxed font-semibold">{g.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
