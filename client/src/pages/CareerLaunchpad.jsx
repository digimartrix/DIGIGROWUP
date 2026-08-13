import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, TrendingUp, Target, CheckCircle2,
  AlertTriangle, ArrowRight, FileCheck, Sparkles,
  Zap, Award, Code, BookOpen, Clock, ShieldCheck
} from 'lucide-react'

const CAREER_TRAJECTORIES = [
  {
    id: 'fullstack',
    title: 'Full Stack Software Engineer',
    readiness: 78,
    targetSalary: '$85,000 - $120,000 / yr',
    summary: 'Focuses on end-to-end full stack web architectures, React SPA state flows, REST & GraphQL APIs, and database transactions.',
    metrics: [
      { title: 'Frontend Systems (React/HTML/CSS)', pct: 85, color: '#3895D2' },
      { title: 'Backend & APIs (Node/Express/Mongoose)', pct: 75, color: '#10B981' },
      { title: 'Database & Data Modeling', pct: 70, color: '#F59E0B' },
      { title: 'Algorithms & Problem Solving', pct: 80, color: '#6366F1' }
    ],
    gaps: [
      { skill: 'Asynchronous JavaScript & Event Loop Closures', action: 'Complete closures assessment in command center', link: '/dashboard' },
      { skill: 'CSS Responsive Subgrid & Dynamic Layout Clamping', action: 'Submit flexbox grid project in Build Lab', link: '/build-lab' }
    ],
    topSkills: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'TailwindCSS', 'REST APIs', 'Git CI/CD']
  },
  {
    id: 'frontend',
    title: 'Frontend & UI Systems Specialist',
    readiness: 88,
    targetSalary: '$80,000 - $110,000 / yr',
    summary: 'Focuses on design systems, micro-frontend performance, browser rendering lifecycles, and high-fidelity user experiences.',
    metrics: [
      { title: 'Semantic HTML & SEO Standards', pct: 95, color: '#3895D2' },
      { title: 'Advanced CSS Layouts (Grid/Flex/Animations)', pct: 90, color: '#10B981' },
      { title: 'Modern React & State Management', pct: 85, color: '#F59E0B' },
      { title: 'Web Accessibility (a11y) & CWV Optimization', pct: 80, color: '#6366F1' }
    ],
    gaps: [
      { skill: 'Core Web Vitals & LCP Optimization', action: 'Review DOM optimization patterns in Resource Hub', link: '/resource-hub' }
    ],
    topSkills: ['React 18', 'TypeScript', 'TailwindCSS', 'CSS Grid', 'Lighthouse CWV', 'Vite']
  },
  {
    id: 'backend',
    title: 'Backend & Distributed Systems Architect',
    readiness: 70,
    targetSalary: '$95,000 - $135,000 / yr',
    summary: 'Focuses on microservice architectures, caching strategies, database optimization, rate limiting, and cloud scalability.',
    metrics: [
      { title: 'RESTful API Engineering', pct: 80, color: '#3895D2' },
      { title: 'Database Optimization & Indexing', pct: 68, color: '#10B981' },
      { title: 'Security & Auth Tokens (JWT/OAuth)', pct: 75, color: '#F59E0B' },
      { title: 'High-Concurrency & Caching (Redis)', pct: 60, color: '#6366F1' }
    ],
    gaps: [
      { skill: 'Redis Caching & Cache-Aside Invalidation', action: 'Download System Design Blueprint in Resource Hub', link: '/resource-hub' },
      { skill: 'Rate Limiting & Token Bucket Algorithms', action: 'Solve backend challenges in Code Arena', link: '/code-arena' }
    ],
    topSkills: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker', 'PostgreSQL', 'Microservices']
  }
]

export default function CareerLaunchpad() {
  const [selectedTrajectory, setSelectedTrajectory] = useState('fullstack')
  const [atsScore, setAtsScore] = useState(82)
  const [analyzingAts, setAnalyzingAts] = useState(false)
  const [atsFeedback, setAtsFeedback] = useState(null)

  const active = CAREER_TRAJECTORIES.find(t => t.id === selectedTrajectory) || CAREER_TRAJECTORIES[0]

  const runAtsAudit = () => {
    setAnalyzingAts(true)
    setTimeout(() => {
      setAtsScore(86)
      setAtsFeedback({
        matchedKeywords: ['React.js', 'Node.js', 'MongoDB', 'REST APIs', 'Semantic HTML5', 'Git'],
        recommendedKeywords: ['Docker', 'Redis', 'Unit Testing (Jest)', 'TypeScript'],
        tip: 'Strong match for Junior-to-Mid level Full Stack Developer roles. Adding 1 more deployed full stack project increases match rate to 95%.'
      })
      setAnalyzingAts(false)
    }, 1200)
  }

  return (
    <div className="page-enter max-w-6xl space-y-6 pb-16">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] text-[#3895D2] uppercase tracking-widest mb-1 font-bold">CAREER INTELLIGENCE</p>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-850">
            Career Launchpad & Readiness Matrix
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5 font-medium">
            Define your career trajectory, analyze skill gaps, and optimize your ATS resume match for top engineering roles.
          </p>
        </div>
      </div>

      {/* Trajectory Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CAREER_TRAJECTORIES.map((t) => {
          const isSelected = t.id === selectedTrajectory
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrajectory(t.id)}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#3895D2] shadow-md ring-2 ring-[#3895D2]/15'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">CAREER TRACK</span>
                  <span className="font-mono text-xs font-black text-[#3895D2]">{t.readiness}% READY</span>
                </div>
                <h3 className="font-heading font-bold text-slate-850 text-sm md:text-base leading-snug">
                  {t.title}
                </h3>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>{t.targetSalary}</span>
                <span className={isSelected ? 'text-[#3895D2] font-bold' : 'text-slate-400'}>
                  {isSelected ? 'Active Path ✓' : 'Select'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Trajectory Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Competency Matrix */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#3895D2] uppercase tracking-widest">PATH BENCHMARK</span>
            <h2 className="font-heading font-black text-slate-850 text-lg md:text-xl mt-0.5">
              {active.title} Readiness Matrix
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed font-medium">
              {active.summary}
            </p>
          </div>

          {/* Competency Bars */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-mono font-bold text-slate-700 uppercase">Core Competency Breakdown</h4>
            {active.metrics.map((m) => (
              <div key={m.title} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">{m.title}</span>
                  <span className="font-mono text-slate-850">{m.pct}% Mastery</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Required Tech Stack Badges */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-700 uppercase">Track Skill Focus</h4>
            <div className="flex flex-wrap gap-1.5">
              {active.topSkills.map((s, idx) => (
                <span key={idx} className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Overall Score & ATS Match */}
        <div className="space-y-6">
          {/* Readiness Score Card */}
          <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-md text-center space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#3895D2] font-bold block">
              AGGREGATE READINESS SCORE
            </span>
            <p className="font-mono text-6xl font-black text-white tracking-tight">
              {active.readiness}%
            </p>
            <p className="text-slate-400 text-xs font-medium">
              Calculated across 8 completed assessments, project submissions, and code challenges.
            </p>
            <Link
              to="/code-arena"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white text-xs font-bold rounded-xl transition-all mt-2"
            >
              <span>Boost Score in Code Arena</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* ATS Resume Analyzer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-slate-850 text-sm flex items-center gap-2">
                <FileCheck size={16} className="text-[#3895D2]" />
                ATS Profile Audit
              </h3>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {atsScore}% Match
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Simulate candidate resume matching algorithms used by recruiters for {active.title} positions.
            </p>

            <button
              onClick={runAtsAudit}
              disabled={analyzingAts}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
            >
              {analyzingAts ? 'Auditing Resume...' : 'Re-Run ATS Audit'}
            </button>

            {atsFeedback && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 animate-fade-in font-medium">
                <p className="text-slate-700">{atsFeedback.tip}</p>
                <div className="pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-emerald-700 font-bold block mb-1">Matched Keywords:</span>
                  <p className="text-slate-500 font-mono">{atsFeedback.matchedKeywords.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Identified Skill Gaps & Action Items */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-slate-850 text-base flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          Recommended Skill Growth Tasks
        </h3>
        <p className="text-slate-500 text-xs font-medium">
          Close these identified gaps to advance your career readiness score from {active.readiness}% to 95%+.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {active.gaps.map((g, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 hover:bg-white hover:border-[#3895D2]/40 transition-all flex flex-col justify-between shadow-2xs"
            >
              <div>
                <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">
                  HIGH PRIORITY GAP
                </span>
                <h4 className="font-heading font-bold text-slate-850 text-sm mt-2 mb-1">{g.skill}</h4>
                <p className="text-xs text-slate-500 font-medium">{g.action}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
                <Link
                  to={g.link}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#3895D2] hover:text-[#2c7db5]"
                >
                  <span>Resolve Gap Now</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
