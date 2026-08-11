import { useEffect, useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SegmentedGauge from '../components/SegmentedGauge'
import api from '../lib/api'
import {
  CheckCircle2, ArrowRight, ChevronLeft, Clock, FileText, Brain
} from 'lucide-react'

// Simple markdown-to-jsx renderer
function renderLesson(content) {
  const lines = content.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i}>{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>)
    } else if (line.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(<pre key={i}><code>{codeLines.join('\n')}</code></pre>)
    } else if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(<li key={i}>{parseLine(lines[i].slice(2))}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`}>{items}</ul>)
      continue
    } else if (line.trim()) {
      elements.push(<p key={i}>{parseLine(line)}</p>)
    }
    i++
  }
  return elements
}

function parseLine(text) {
  const parts = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const raw = match[0]
    if (raw.startsWith('**')) {
      parts.push(<strong key={match.index}>{raw.slice(2, -2)}</strong>)
    } else {
      parts.push(<code key={match.index}>{raw.slice(1, -1)}</code>)
    }
    last = match.index + raw.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export default function Lesson() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { onOpenTutor } = useOutletContext() // Get DigiMentor toggle trigger from Outlet context
  const [lesson, setLesson] = useState(null)
  const [mastery, setMastery] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [lessonRes, masteryRes] = await Promise.all([
          api.get(`/lessons/${id}`),
          api.get(`/mastery/${user.id}`),
        ])
        setLesson(lessonRes.data)
        setCompleted(lessonRes.data.isCompleted)
        setMastery(masteryRes.data)
      } catch {
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user.id, navigate])

  const markComplete = async () => {
    if (completing || completed) return
    setCompleting(true)
    try {
      const { data } = await api.post(`/lessons/${id}/complete`)
      setCompleted(true)
      setMastery(data.mastery || [])
    } catch {}
    finally { setCompleting(false) }
  }

  const estTime = lesson?.wordCount ? Math.max(5, Math.round((lesson.wordCount / 200) / 5) * 5) : null

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3,4].map(i => <div key={i} className="h-20 rounded bg-white border border-slate-200 shimmer" />)}
    </div>
  )

  if (!lesson) return null

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 page-enter">
      {/* Content */}
      <div className="flex-1 min-w-0 max-w-2xl">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-xs font-bold mb-6 transition-colors group bg-transparent border-none outline-none"
        >
          <ChevronLeft size={14} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          Learning Command Center
        </button>

        {/* Lesson header */}
        <div className="bg-white border border-slate-200 rounded-md p-6 mb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-mono text-slate-400 uppercase tracking-widest mb-1.5" style={{ fontSize: '9px' }}>
                {lesson.moduleTitle}
              </p>
              <h1 className="text-xl font-heading font-bold text-slate-800 mb-3">{lesson.title}</h1>
              <div className="flex flex-wrap items-center gap-4">
                {estTime && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12} strokeWidth={1.5} />
                    <span className="font-mono text-xs">~{estTime} min read</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FileText size={12} strokeWidth={1.5} />
                  <span className="font-mono text-xs">{lesson.wordCount || 0} words</span>
                </div>
                {completed && (
                  <div className="flex items-center gap-1.5 text-brandGreen font-bold">
                    <CheckCircle2 size={12} strokeWidth={1.5} />
                    <span className="font-mono text-[10px]">COMPLETE</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onOpenTutor}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 rounded text-xs font-bold text-slate-700 border border-slate-250 hover:border-brandBlue/35 hover:text-brandBlue transition-all bg-slate-50 hover:bg-white"
            >
              <Brain size={14} strokeWidth={1.5} />
              Ask DigiMentor
            </button>
          </div>
        </div>

        {/* Lesson body */}
        <div className="bg-white border border-slate-200 rounded-md p-8 mb-6 lesson-content shadow-3xs">
          {renderLesson(lesson.content)}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          {!completed ? (
            <button
              id="mark-complete-btn"
              onClick={markComplete}
              disabled={completing}
              className="flex items-center gap-2 bg-brandBlue hover:bg-opacity-95 disabled:opacity-50 text-white font-bold px-5 py-3 rounded text-xs md:text-sm transition-colors shadow-3xs"
            >
              <CheckCircle2 size={15} strokeWidth={1.5} />
              {completing ? 'Marking...' : 'Mark as Complete'}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-brandGreen px-5 py-3 rounded text-xs md:text-sm font-bold">
              <CheckCircle2 size={15} strokeWidth={1.5} />
              Completed
            </div>
          )}

          {lesson.quizId && (
            <button
              onClick={() => navigate(`/quiz/${lesson.quizId}`)}
              className="flex items-center gap-2 text-slate-700 border border-slate-250 hover:border-brandBlue/45 hover:text-brandBlue px-5 py-3 rounded text-xs md:text-sm font-bold bg-slate-50 hover:bg-white transition-all shadow-3xs"
            >
              Take Module Quiz
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Right rail — skill mastery */}
      {mastery.length > 0 && (
        <div className="w-full lg:w-[240px] flex-shrink-0 sticky top-6 self-start space-y-4">
          <h2 className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">SKILL MASTERY</h2>
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-5 shadow-3xs">
            {mastery.map(m => (
              <SegmentedGauge key={m.topic} topic={m.topic} score={m.score} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
