import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SegmentedGauge from '../components/SegmentedGauge'
import api from '../lib/api'
import {
  CheckCircle2, ArrowRight, ChevronLeft, Clock, FileText, Brain,
  Video, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw,
  Download, ChevronRight, Check, AlertCircle, Sparkles, BookOpen
} from 'lucide-react'

// Markdown renderer for text lessons
function renderMarkdown(content) {
  if (!content) return null
  const lines = content.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-xl sm:text-2xl font-heading font-black text-slate-900 mb-3 mt-4">{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-heading font-bold text-slate-800 mb-2 mt-3">{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-heading font-bold text-slate-800 mb-2 mt-3">{line.slice(4)}</h3>)
    } else if (line.startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} className="p-4 bg-slate-900 text-slate-100 rounded-2xl overflow-x-auto my-3 text-xs font-mono">
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
    } else if (line.startsWith('- ')) {
      const items = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(<li key={i} className="ml-4 list-disc text-xs sm:text-sm text-slate-700 my-1">{lines[i].slice(2)}</li>)
        i++
      }
      elements.push(<ul key={`ul-${i}`} className="my-2">{items}</ul>)
      continue
    } else if (line.trim()) {
      elements.push(<p key={i} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-2 font-medium">{line}</p>)
    }
    i++
  }
  return elements
}

export default function Lesson() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { onOpenTutor } = useOutletContext() || {}

  const [lesson, setLesson] = useState(null)
  const [mastery, setMastery] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [toast, setToast] = useState({ msg: '', isErr: false })

  // Video Player Controls State
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [watchPct, setWatchPct] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [hasAutoCompleted, setHasAutoCompleted] = useState(false)

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast({ msg: '', isErr: false }), 4000)
  }

  useEffect(() => {
    loadLessonData()
  }, [id])

  async function loadLessonData() {
    setLoading(true)
    setHasAutoCompleted(false)
    try {
      const [lessonRes, masteryRes] = await Promise.all([
        api.get(`/lessons/${id}`),
        api.get(`/mastery/${user.id}`).catch(() => ({ data: [] })),
      ])

      const lData = lessonRes.data
      setLesson(lData)
      setCompleted(lData.isCompleted)
      setWatchPct(lData.percentage || (lData.isCompleted ? 100 : 0))
      setMastery(masteryRes.data || [])

      // Set initial video playback position if available
      if (lData.lastPosition && videoRef.current) {
        videoRef.current.currentTime = lData.lastPosition
      }
    } catch (err) {
      console.error('Failed to load lesson:', err)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Video Time Update & Auto-complete
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const cur = videoRef.current.currentTime
    const dur = videoRef.current.duration || lesson?.duration || 1
    setCurrentTime(cur)
    setDuration(dur)

    const pct = Math.min(100, Math.round((cur / dur) * 100))
    setWatchPct(pct)

    // Automatically complete when approximately 90% watched
    if (pct >= 90 && !completed && !hasAutoCompleted) {
      setHasAutoCompleted(true)
      handleAutoComplete(pct, cur)
    }
  }

  const handleAutoComplete = async (percentage, curPos) => {
    try {
      const res = await api.post('/progress/lesson', {
        courseId: lesson.courseId,
        lessonId: lesson._id,
        percentage,
        lastPosition: Math.round(curPos),
        completed: true,
      })
      setCompleted(true)
      showToast('🎉 Lesson automatically marked complete (90% watched)!')
    } catch {
      // ignore
    }
  }

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) {
      videoRef.current.playbackRate = speed
    }
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  const markComplete = async () => {
    if (completing || completed) return
    setCompleting(true)
    try {
      const { data } = await api.post(`/lessons/${id}/complete`)
      setCompleted(true)
      showToast('Lesson marked complete!')
      if (data.mastery) setMastery(data.mastery)
    } catch (err) {
      showToast('Failed to complete lesson.', true)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-6xl mx-auto page-enter">
        <div className="h-10 w-48 bg-white rounded-xl shimmer" />
        <div className="h-96 rounded-3xl bg-white border border-slate-200 shimmer" />
      </div>
    )
  }

  if (!lesson) return null

  const isVideo = lesson.type === 'video' || (lesson.contentUrl && lesson.contentUrl.match(/\.(mp4|webm|mov|mkv|ogg)$/i)) || (!lesson.type && lesson.contentUrl && !lesson.contentUrl.endsWith('.pdf'))
  const isPdf = lesson.type === 'pdf' || (lesson.contentUrl && lesson.contentUrl.endsWith('.pdf'))

  return (
    <div className="max-w-7xl mx-auto space-y-6 page-enter pb-12">
      
      {/* Toast */}
      {toast.msg && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between shadow-2xs ${
          toast.isErr ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.isErr ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-emerald-600" />}
            <span>{toast.msg}</span>
          </div>
          <button onClick={() => setToast({ msg: '', isErr: false })} className="text-xs opacity-70">Dismiss</button>
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 px-6 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/my-learning')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={16} />
            <span>My Learning</span>
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
            {lesson.courseTitle || 'Learning Track'}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {completed ? (
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
              <CheckCircle2 size={14} />
              <span>COMPLETED</span>
            </div>
          ) : (
            <button
              onClick={markComplete}
              disabled={completing}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check size={13} />
              <span>{completing ? 'Saving...' : 'Mark as Complete'}</span>
            </button>
          )}

          <button
            onClick={onOpenTutor}
            className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#3895D2] border border-sky-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Brain size={14} />
            <span>DigiMentor AI</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player Area + Syllabus Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Cols: Player Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ══════════════════════════════════════════════
              VIDEO PLAYER INTERFACE
          ══════════════════════════════════════════════ */}
          {isVideo && (
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
              <div className="relative aspect-video bg-black flex items-center justify-center">
                {lesson.contentUrl ? (
                  <video
                    ref={videoRef}
                    src={lesson.contentUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400">
                    <Video size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold">No video stream URL provided for this lesson.</p>
                  </div>
                )}
              </div>

              {/* Video Sub-bar: Speed, Progress Tracker, Fullscreen */}
              <div className="p-4 bg-slate-950 flex items-center justify-between gap-4 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Speed:</span>
                  {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                        playbackSpeed === speed ? 'bg-[#3895D2] text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Watched: <strong className="text-white">{watchPct}%</strong></span>
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              PDF VIEWER INTERFACE
          ══════════════════════════════════════════════ */}
          {isPdf && (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-emerald-600" />
                  <span className="font-heading font-bold text-slate-800 text-xs sm:text-sm">
                    {lesson.fileName || `${lesson.title}.pdf`}
                  </span>
                </div>

                {lesson.contentUrl && (
                  <a
                    href={lesson.contentUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Download size={13} />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>

              <div className="w-full h-[600px] bg-slate-100 flex items-center justify-center">
                {lesson.contentUrl ? (
                  <iframe
                    src={lesson.contentUrl}
                    title={lesson.title}
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="text-center p-8 text-slate-400">
                    <FileText size={48} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-bold">No PDF document attached.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lesson Metadata & Content Notes */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                <span className="font-bold text-[#3895D2]">{lesson.moduleTitle}</span>
                <span>·</span>
                <span>Lesson</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-black text-slate-900">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
                  {lesson.description}
                </p>
              )}
            </div>

            {/* Markdown Body (if provided) */}
            {lesson.content && (
              <div className="pt-4 border-t border-slate-100">
                {renderMarkdown(lesson.content)}
              </div>
            )}

            {/* Navigation Buttons: Previous / Next Lesson */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
              {lesson.prevLesson ? (
                <button
                  onClick={() => navigate(`/lesson/${lesson.prevLesson._id}`)}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Previous:</span>
                  <span className="truncate max-w-[120px]">{lesson.prevLesson.title}</span>
                </button>
              ) : <div />}

              {lesson.nextLesson ? (
                <button
                  onClick={() => navigate(`/lesson/${lesson.nextLesson._id}`)}
                  className="px-5 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Next:</span>
                  <span className="truncate max-w-[120px]">{lesson.nextLesson.title}</span>
                  <ArrowRight size={14} />
                </button>
              ) : lesson.quizId ? (
                <button
                  onClick={() => navigate(`/quiz/${lesson.quizId}`)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  <span>Take Module Quiz</span>
                  <ArrowRight size={14} />
                </button>
              ) : null}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Syllabus & Course Tree Sidebar */}
        <div className="space-y-6">
          
          {/* Syllabus Playlist Card */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/80">
              <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen size={16} className="text-[#3895D2]" />
                <span>Course Syllabus</span>
              </h3>
              <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                {(lesson.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} learning items
              </p>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {(lesson.modules || []).map((mod, modIdx) => (
                <div key={mod._id} className="p-3">
                  <p className="text-[11px] font-mono font-bold text-slate-500 uppercase px-2 mb-2">
                    {mod.title}
                  </p>
                  <div className="space-y-1">
                    {(mod.lessons || []).map(l => {
                      const isCurrent = l._id.toString() === lesson._id.toString()
                      const isLessonCompleted = (lesson.completedLessons || []).includes(l._id.toString())
                      return (
                        <button
                          key={l._id}
                          onClick={() => navigate(`/lesson/${l._id}`)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-medium transition-all flex items-center justify-between gap-2.5 ${
                            isCurrent
                              ? 'bg-sky-50 border border-sky-200 text-[#3895D2] font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isLessonCompleted ? (
                              <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                            ) : isCurrent ? (
                              <Play size={13} className="text-[#3895D2] flex-shrink-0" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />
                            )}
                            <span className="truncate">{l.title}</span>
                          </div>
                          {l.duration > 0 && (
                            <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                              {Math.round(l.duration / 60)}m
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Mastery Gauges */}
          {mastery.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                Skill Mastery
              </h3>
              <div className="space-y-3">
                {mastery.slice(0, 3).map(m => (
                  <SegmentedGauge key={m.topic} topic={m.topic} score={m.score} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
