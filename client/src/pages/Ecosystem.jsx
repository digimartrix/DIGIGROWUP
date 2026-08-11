import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AITutorPanel from '../components/AITutorPanel'
import SegmentedGauge from '../components/SegmentedGauge'
import api from '../lib/api'
import {
  Award,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Code2,
  CreditCard,
  GraduationCap,
  Hammer,
  Library,
  Network,
  PackageOpen,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Target,
  UserRound,
} from 'lucide-react'

const sections = {
  digimentor: {
    title: 'DigiMentor',
    eyebrow: 'Contextual learning assistant',
    icon: Bot,
    summary: 'Ask, explain, plan, practice, and revise with page-aware support.',
  },
  'skill-growth': {
    title: 'Skill Growth',
    eyebrow: 'Skill mastery engine',
    icon: Target,
    summary: 'Track real capability by topic, not just course completion.',
  },
  'build-lab': {
    title: 'Build Lab',
    eyebrow: 'Project-based learning',
    icon: Hammer,
    summary: 'Turn lessons into guided portfolio work with milestones and review checkpoints.',
  },
  'code-arena': {
    title: 'Code Arena',
    eyebrow: 'Practice and assessment',
    icon: Code2,
    summary: 'Practice problems, debugging drills, MCQs, and performance feedback.',
  },
  'knowledge-network': {
    title: 'Knowledge Network',
    eyebrow: 'Focused student collaboration',
    icon: Network,
    summary: 'Ask questions, share resources, and build topic reputation without social noise.',
  },
  'mentor-connect': {
    title: 'Mentor Connect',
    eyebrow: 'Mentor guidance',
    icon: GraduationCap,
    summary: 'Find the right mentor for your current skill gap and career direction.',
  },
  'opportunity-hub': {
    title: 'Opportunity Hub',
    eyebrow: 'Internships and openings',
    icon: Rocket,
    summary: 'Discover internships, hackathons, scholarships, and role-fit opportunities.',
  },
  'career-launchpad': {
    title: 'Career Launchpad',
    eyebrow: 'Career readiness',
    icon: BriefcaseBusiness,
    summary: 'Map your goal to skills, projects, practice, and interview preparation.',
  },
  'achievement-vault': {
    title: 'Achievement Vault',
    eyebrow: 'Certificates and proof',
    icon: Award,
    summary: 'Collect completed courses, badges, project proof, and certificate-ready milestones.',
  },
  digicredits: {
    title: 'DigiCredits',
    eyebrow: 'Transparent learning credits',
    icon: CreditCard,
    summary: 'Earn credits for learning actions and spend them on educational resources.',
  },
  'resource-hub': {
    title: 'Resource Hub',
    eyebrow: 'Learning resources',
    icon: PackageOpen,
    summary: 'Access notes, practice packs, templates, datasets, and project kits.',
  },
  'live-learning': {
    title: 'Live Learning',
    eyebrow: 'Workshops and events',
    icon: CalendarDays,
    summary: 'Register for workshops, webinars, mentor sessions, and guided build events.',
  },
  'activity-center': {
    title: 'Activity Center',
    eyebrow: 'Intelligent notifications',
    icon: Bell,
    summary: 'See revision due, mentor reminders, unlocked resources, and progress updates.',
  },
  'learner-profile': {
    title: 'Learner Profile',
    eyebrow: 'Professional learning identity',
    icon: UserRound,
    summary: 'Review your skills, achievements, portfolio direction, and public profile readiness.',
  },
  settings: {
    title: 'Settings',
    eyebrow: 'Learning preferences',
    icon: Settings,
    summary: 'Tune recommendation, notification, privacy, and accessibility preferences.',
  },
}

const contentBySection = {
  'build-lab': [
    { title: 'Accessible Portfolio Site', type: 'Beginner project', skill: 'HTML, CSS', credits: 80, description: 'Build a standards-first portfolio that demonstrates semantic structure and responsive layout.' },
    { title: 'Learning Progress Tracker', type: 'Intermediate project', skill: 'React', credits: 130, description: 'Create a dashboard that turns lesson completion and quiz results into a skill-growth view.' },
    { title: 'Full Stack Course API', type: 'Advanced project', skill: 'Node.js, MongoDB', credits: 190, description: 'Design secure course, lesson, assessment, and progress APIs with role-aware access.' },
  ],
  'code-arena': [
    { title: 'HTML Semantics Drill', type: 'MCQ set', skill: 'Accessibility', credits: 24, description: 'Practice identifying correct semantic elements and accessible form patterns.' },
    { title: 'Flexbox Debugging', type: 'Debugging challenge', skill: 'CSS Layout', credits: 36, description: 'Fix layout bugs caused by main-axis and cross-axis alignment mistakes.' },
    { title: 'JavaScript Output Prediction', type: 'Practice set', skill: 'Programming', credits: 42, description: 'Strengthen core reasoning before moving into React and Node.js.' },
  ],
  'knowledge-network': [
    { title: 'Why should every input have a label?', type: 'Question', skill: 'HTML Forms', credits: 12, description: 'A focused discussion on label semantics, placeholders, and assistive technology behavior.' },
    { title: 'Responsive card grid examples', type: 'Resource share', skill: 'CSS Grid', credits: 18, description: 'Learners compare minmax patterns and share polished implementations.' },
    { title: 'Study group: Web foundations sprint', type: 'Study group', skill: 'Web Development', credits: 30, description: 'A small cohort working through the active course and weekly practice reviews.' },
  ],
  'mentor-connect': [
    { title: 'Frontend Foundations Review', type: 'Mentor session', skill: 'Web Development', credits: 120, description: 'A mentor reviews your lesson notes, quiz patterns, and next project milestone.' },
    { title: 'Career Path Mapping', type: 'Goal session', skill: 'Career Skills', credits: 160, description: 'Translate your current mastery into a practical full-stack roadmap.' },
    { title: 'Code Review Clinic', type: 'Project feedback', skill: 'Build Lab', credits: 180, description: 'Get feedback on project structure, accessibility, and maintainability.' },
  ],
  'opportunity-hub': [
    { title: 'Frontend Intern Readiness Track', type: 'Internship prep', skill: 'React, CSS', credits: 0, description: 'Recommended after completing web foundations and one Build Lab project.' },
    { title: 'Student Hackathon: Learning Tools', type: 'Hackathon', skill: 'Full Stack', credits: 0, description: 'Build a useful education product and add it to your public profile.' },
    { title: 'Open Source Docs Sprint', type: 'Contribution', skill: 'Communication', credits: 0, description: 'Practice technical writing while contributing learner-friendly documentation.' },
  ],
  'resource-hub': [
    { title: 'HTML Accessibility Checklist', type: 'Cheat sheet', skill: 'HTML Forms', credits: 30, description: 'A concise review sheet for labels, fieldsets, validation, and ARIA support.' },
    { title: 'CSS Layout Practice Pack', type: 'Practice pack', skill: 'CSS Layout', credits: 55, description: 'Guided exercises for flexbox, grid, spacing, and responsive patterns.' },
    { title: 'Full Stack Project Kit', type: 'Project kit', skill: 'MERN', credits: 140, description: 'Requirements, milestones, API contract, and review checklist for a portfolio-grade build.' },
  ],
  'live-learning': [
    { title: 'Workshop: Clean CSS Systems', type: 'Workshop', skill: 'CSS', credits: 20, description: 'A live session on building maintainable spacing, color, and component systems.' },
    { title: 'Mentor Hour: JavaScript Fundamentals', type: 'Mentor event', skill: 'Programming', credits: 0, description: 'Ask practical questions and review common quiz mistakes with a mentor.' },
    { title: 'Bootcamp: Build a Course Player', type: 'Bootcamp', skill: 'React', credits: 80, description: 'Build a lesson player with notes, progress, resources, and assessment flow.' },
  ],
}

const careerMetrics = [
  ['Technical Skills', 78],
  ['Projects', 64],
  ['Coding', 71],
  ['Communication', 62],
  ['Interview', 58],
]

function normalizeSection(section) {
  return sections[section] ? section : 'skill-growth'
}

function EmptyState({ title, body, actionLabel, onAction }) {
  return (
    <div className="surface p-8 text-center">
      <div className="w-10 h-10 rounded bg-amber-glow border border-amber/20 flex items-center justify-center mx-auto mb-3">
        <Library size={18} strokeWidth={1.7} className="text-amber" />
      </div>
      <h3 className="text-text font-heading text-base">{title}</h3>
      <p className="text-muted text-sm mt-2 max-w-md mx-auto">{body}</p>
      {actionLabel && (
        <button onClick={onAction} className="mt-4 bg-amber hover:bg-amber-dim text-white rounded px-4 py-2 text-sm font-semibold transition-colors">
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function WorkCard({ item, actionLabel, onAction, active }) {
  return (
    <article className={`surface interactive-card p-5 ${active ? 'border-amber/45 bg-amber-glow/40' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="section-label mb-2">{item.type}</p>
          <h3 className="font-heading text-base text-text">{item.title}</h3>
          <p className="text-muted text-sm mt-2 leading-relaxed">{item.description}</p>
        </div>
        <span className="flex-shrink-0 rounded border border-panel-border bg-panel-elevated px-2 py-1 text-xs text-muted font-mono">
          {item.credits ? `${item.credits} credits` : 'Open'}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 mt-5">
        <span className="text-xs text-muted bg-panel-elevated border border-panel-border rounded px-2 py-1">{item.skill}</span>
        <button onClick={onAction} className="flex items-center gap-1.5 text-sm text-amber font-semibold hover:text-amber-dim">
          {active ? 'Added' : actionLabel}
          {active ? <CheckCircle2 size={14} strokeWidth={1.7} /> : <ChevronRight size={14} strokeWidth={1.7} />}
        </button>
      </div>
    </article>
  )
}

function HeaderSearch({ query, setQuery, onOpenTutor }) {
  return (
    <div className="surface p-3 flex flex-col md:flex-row md:items-center gap-3">
      <div className="relative flex-1">
        <Search size={16} strokeWidth={1.7} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses, lessons, skills, projects, mentors, events..."
          className="w-full bg-panel-elevated border border-panel-border rounded pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-muted focus:outline-none focus:border-amber/50"
        />
      </div>
      <button onClick={onOpenTutor} className="flex items-center justify-center gap-2 rounded bg-blue-accent/10 border border-blue-accent/20 text-blue-accent px-4 py-2.5 text-sm font-semibold hover:bg-blue-accent/15">
        <Bot size={16} strokeWidth={1.7} />
        Ask DigiMentor
      </button>
    </div>
  )
}

function SkillGrowthView({ overview, navigate }) {
  const mastery = overview?.mastery || []
  const radar = overview?.skillRadar || []
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
      <div className="surface p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="section-label">Skill radar</p>
            <h2 className="text-lg mt-1">Capability across the learning ecosystem</h2>
          </div>
          <span className="text-3xl font-mono text-amber font-semibold">{overview?.learningHealth?.skillMastery || 0}%</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {radar.map((skill) => (
            <div key={skill.name} className="surface-muted p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">{skill.name}</span>
                <span className="font-mono text-sm text-muted">{skill.score}%</span>
              </div>
              <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
                <div className="h-full rounded-full bg-amber" style={{ width: `${skill.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="surface p-5">
        <p className="section-label mb-3">Topic mastery</p>
        {mastery.length > 0 ? (
          <div className="space-y-5">
            {mastery.map((topic) => <SegmentedGauge key={topic.topic} topic={topic.topic} score={topic.score} />)}
          </div>
        ) : (
          <EmptyState
            title="Your skill growth is ready"
            body="Complete a quiz to turn course activity into topic-level mastery."
            actionLabel="Go to Learning Command Center"
            onAction={() => navigate('/dashboard')}
          />
        )}
      </aside>
    </div>
  )
}

function DigiMentorView({ overview, onOpenTutor }) {
  const prompts = [
    'Explain my weakest topic in simple terms',
    'Create a revision plan for this week',
    'Generate practice questions from my current course',
    'Help me choose my next Build Lab project',
  ]
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
      <div className="surface p-6">
        <p className="section-label">Smart global assistant</p>
        <h2 className="text-xl mt-2">DigiMentor follows the learning context</h2>
        <p className="text-muted mt-3 max-w-2xl">
          DigiMentor uses your current lesson, mastery gaps, assessment results, and course progress to explain, plan, practice, and recommend without taking control of your data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
          {prompts.map((prompt) => (
            <button key={prompt} onClick={onOpenTutor} className="surface-muted text-left p-4 hover:border-amber/40 transition-colors">
              <span className="text-sm font-medium text-text">{prompt}</span>
              <ChevronRight size={15} strokeWidth={1.7} className="text-amber mt-3" />
            </button>
          ))}
        </div>
      </div>
      <aside className="surface p-5">
        <p className="section-label mb-3">Current context</p>
        <div className="space-y-3 text-sm">
          <div className="surface-muted p-3">
            <span className="text-muted">Weakest topic</span>
            <p className="text-text font-semibold">{overview?.weakestTopic?.topic || 'Waiting for quiz data'}</p>
          </div>
          <div className="surface-muted p-3">
            <span className="text-muted">Recommended action</span>
            <p className="text-text font-semibold">{overview?.nextAction?.topic || 'Start active course'}</p>
          </div>
          <button onClick={onOpenTutor} className="w-full bg-amber hover:bg-amber-dim text-white rounded px-4 py-2.5 text-sm font-semibold">
            Start DigiMentor session
          </button>
        </div>
      </aside>
    </div>
  )
}

function CareerView({ overview, navigate }) {
  const readiness = overview?.careerReadiness || 66
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
      <div className="surface p-6">
        <p className="section-label">Career goal</p>
        <h2 className="text-xl mt-2">Full Stack Developer</h2>
        <div className="mt-6 flex items-end gap-2">
          <span className="font-mono text-6xl font-semibold text-amber">{readiness}</span>
          <span className="text-muted text-xl mb-2">%</span>
        </div>
        <p className="text-muted text-sm mt-3">Career readiness combines course progress, mastery, assessment performance, project coverage, and coding practice.</p>
      </div>
      <div className="surface p-6">
        <p className="section-label mb-4">Readiness factors</p>
        <div className="space-y-4">
          {careerMetrics.map(([label, value]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-text font-medium">{label}</span>
                <span className="text-muted font-mono">{value}%</span>
              </div>
              <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
                <div className="h-full bg-blue-accent rounded-full" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/explore')} className="mt-6 bg-amber hover:bg-amber-dim text-white rounded px-4 py-2.5 text-sm font-semibold">
          Improve with Learning Library
        </button>
      </div>
    </div>
  )
}

function ActivityView({ overview }) {
  const [read, setRead] = useState(false)
  const activity = overview?.activityCenter || []
  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="section-label">Notifications</p>
          <h2 className="text-lg mt-1">Activity Center</h2>
        </div>
        <button onClick={() => setRead(true)} className="text-sm text-amber font-semibold hover:text-amber-dim">Mark all read</button>
      </div>
      {activity.length ? (
        <div className="space-y-3">
          {activity.map((item) => (
            <div key={item.title} className={`surface-muted p-4 flex items-start gap-3 ${read ? 'opacity-65' : ''}`}>
              <span className={`status-dot mt-2 ${read ? 'bg-muted' : 'bg-amber'}`} />
              <div>
                <p className="font-medium text-text">{item.title}</p>
                <p className="text-sm text-muted mt-1">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="You're all caught up" body="New revision, mentor, resource, and certificate updates will appear here." />
      )}
    </div>
  )
}

function CreditsView({ overview, onAdd }) {
  const balance = overview?.digiCredits?.balance || 0
  const earned = overview?.digiCredits?.earned || []
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
      <div className="surface p-6">
        <p className="section-label">Credit balance</p>
        <div className="mt-4 flex items-end gap-2">
          <span className="font-mono text-6xl font-semibold text-amber">{balance}</span>
          <span className="text-muted mb-2">DigiCredits</span>
        </div>
        <p className="text-sm text-muted mt-4">Credits are earned through transparent learning work and used only for educational resources.</p>
      </div>
      <div className="surface p-6">
        <p className="section-label mb-4">Earn history</p>
        <div className="space-y-3">
          {earned.map((item) => (
            <div key={item.reason} className="surface-muted p-4 flex items-center justify-between gap-4">
              <span className="text-sm text-text font-medium">{item.reason}</span>
              <span className="font-mono text-amber">+{item.amount}</span>
            </div>
          ))}
        </div>
        <button onClick={() => onAdd('resource-credit-plan')} className="mt-5 text-sm text-amber font-semibold hover:text-amber-dim">
          Add credit goal to Action Board
        </button>
      </div>
    </div>
  )
}

function ProfileView({ overview }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
      <div className="surface p-6">
        <div className="w-16 h-16 rounded bg-amber-glow border border-amber/25 flex items-center justify-center">
          <UserRound size={28} strokeWidth={1.7} className="text-amber" />
        </div>
        <h2 className="text-xl mt-4">{overview?.learner?.name || 'Learner'}</h2>
        <p className="text-muted text-sm">{overview?.learner?.email || 'student@digimartrix.com'}</p>
        <div className="mt-5 surface-muted p-4">
          <p className="section-label">Public profile readiness</p>
          <p className="font-mono text-3xl text-amber font-semibold mt-2">{overview?.profileReadiness || 52}%</p>
        </div>
      </div>
      <div className="surface p-6">
        <p className="section-label mb-4">Portfolio signals</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(overview?.portfolioSignals || []).map((signal) => (
            <div key={signal.label} className="surface-muted p-4">
              <p className="text-sm font-medium text-text">{signal.label}</p>
              <p className="text-sm text-muted mt-1">{signal.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SettingsView() {
  const [prefs, setPrefs] = useState({
    adaptivePlan: true,
    revisionReminders: true,
    voiceFallback: false,
    publicProfile: false,
  })

  return (
    <div className="surface p-5 max-w-3xl">
      <p className="section-label mb-4">Preferences</p>
      <div className="space-y-3">
        {[
          ['adaptivePlan', 'Use adaptive recommendations', 'Let Digimartrix prioritize next lessons, revision, projects, and practice.'],
          ['revisionReminders', 'Revision reminders', 'Show Activity Center reminders when weak topics are due.'],
          ['voiceFallback', 'Prefer voice controls when supported', 'Enable optional browser speech controls in DigiMentor.'],
          ['publicProfile', 'Public learner profile', 'Make completed achievements available for a public portfolio profile.'],
        ].map(([key, title, detail]) => (
          <label key={key} className="surface-muted p-4 flex items-center justify-between gap-4 cursor-pointer">
            <span>
              <span className="block text-sm text-text font-medium">{title}</span>
              <span className="block text-sm text-muted mt-1">{detail}</span>
            </span>
            <input
              type="checkbox"
              checked={prefs[key]}
              onChange={() => setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))}
              className="w-5 h-5 accent-amber"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

function GenericSection({ section, overview, query, onAdd, added, navigate }) {
  if (section === 'digimentor') return <DigiMentorView overview={overview} onOpenTutor={() => onAdd('open-tutor', true)} />
  if (section === 'skill-growth') return <SkillGrowthView overview={overview} navigate={navigate} />
  if (section === 'career-launchpad') return <CareerView overview={overview} navigate={navigate} />
  if (section === 'activity-center') return <ActivityView overview={overview} />
  if (section === 'digicredits') return <CreditsView overview={overview} onAdd={onAdd} />
  if (section === 'learner-profile') return <ProfileView overview={overview} />
  if (section === 'settings') return <SettingsView />
  if (section === 'achievement-vault') {
    const achievements = overview?.achievements || []
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {achievements.map((item) => (
          <WorkCard key={item.title} item={item} actionLabel="View proof" onAction={() => onAdd(item.title)} active={added.has(item.title)} />
        ))}
      </div>
    )
  }

  const items = (contentBySection[section] || []).filter((item) => {
    const haystack = `${item.title} ${item.type} ${item.skill} ${item.description}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  if (!items.length) {
    return (
      <EmptyState
        title={section === 'mentor-connect' ? 'No mentor matches your current filters' : 'Your build journey starts here'}
        body="Try a different search term or return to the Learning Library to strengthen the source skill."
        actionLabel="Open Learning Library"
        onAction={() => navigate('/explore')}
      />
    )
  }

  const labels = {
    'build-lab': 'Add to Action Board',
    'code-arena': 'Start practice',
    'knowledge-network': 'Follow topic',
    'mentor-connect': 'Request session',
    'opportunity-hub': 'Save opportunity',
    'resource-hub': 'Unlock resource',
    'live-learning': 'Register interest',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <WorkCard
          key={item.title}
          item={item}
          actionLabel={labels[section] || 'Open'}
          active={added.has(item.title)}
          onAction={() => {
            if (section === 'code-arena' && overview?.primaryQuizId) {
              navigate(`/quiz/${overview.primaryQuizId}`)
              return
            }
            onAdd(item.title)
          }}
        />
      ))}
    </div>
  )
}

export default function Ecosystem() {
  const { section: rawSection } = useParams()
  const navigate = useNavigate()
  const section = normalizeSection(rawSection)
  const meta = sections[section]
  const Icon = meta.icon
  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [tutorOpen, setTutorOpen] = useState(false)
  const [added, setAdded] = useState(() => new Set())
  const [toast, setToast] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api.get('/ecosystem/overview')
      .then((res) => { if (mounted) setOverview(res.data) })
      .catch(() => { if (mounted) setOverview(null) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [])

  const onAdd = (key, openTutor = false) => {
    if (openTutor) {
      setTutorOpen(true)
      return
    }
    setAdded((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
    setToast('Added to your Action Board for this session.')
    window.setTimeout(() => setToast(''), 2200)
  }

  const quickStats = useMemo(() => [
    { label: 'Skill Mastery', value: `${overview?.learningHealth?.skillMastery || 0}%`, icon: Target },
    { label: 'DigiCredits', value: overview?.digiCredits?.balance || 0, icon: CreditCard },
    { label: 'Readiness', value: `${overview?.careerReadiness || 0}%`, icon: ShieldCheck },
  ], [overview])

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar onOpenTutor={() => setTutorOpen(true)} />

      <main className="app-main flex-1 min-w-0 p-4 md:p-6 page-enter overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-5">
          <HeaderSearch query={query} setQuery={setQuery} onOpenTutor={() => setTutorOpen(true)} />

          <section className="surface p-5 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded bg-amber-glow border border-amber/25 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} strokeWidth={1.7} className="text-amber" />
                </div>
                <div>
                  <p className="section-label">{meta.eyebrow}</p>
                  <h1 className="text-2xl md:text-3xl mt-1">{meta.title}</h1>
                  <p className="text-muted mt-2 max-w-2xl">{meta.summary}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 min-w-0 lg:min-w-[360px]">
                {quickStats.map((stat) => {
                  const StatIcon = stat.icon
                  return (
                    <div key={stat.label} className="surface-muted p-3">
                      <StatIcon size={14} strokeWidth={1.7} className="text-muted mb-2" />
                      <p className="text-lg font-mono text-text font-semibold">{stat.value}</p>
                      <p className="text-xs text-muted truncate">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 rounded shimmer" />)}
            </div>
          ) : (
            <GenericSection
              section={section}
              overview={overview}
              query={query}
              onAdd={onAdd}
              added={added}
              navigate={navigate}
            />
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-text text-white rounded px-4 py-2 text-sm shadow-card-hover">
          {toast}
        </div>
      )}

      <AITutorPanel isOpen={tutorOpen} onClose={() => setTutorOpen(false)} />
    </div>
  )
}
