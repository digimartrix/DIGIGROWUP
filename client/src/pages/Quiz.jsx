import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import SegmentedGauge from '../components/SegmentedGauge'
import api from '../lib/api'
import {
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Trophy, RotateCcw
} from 'lucide-react'

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then(res => setQuiz(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleSelect = (optionIdx) => {
    if (result) return
    setSelected(s => ({ ...s, [current]: optionIdx }))
  }

  const handleNext = () => {
    if (current < quiz.questions.length - 1) setCurrent(c => c + 1)
  }

  const handlePrev = () => {
    if (current > 0) setCurrent(c => c - 1)
  }

  const handleSubmit = async () => {
    if (submitting) return
    const answers = quiz.questions.map((_, i) => selected[i] ?? -1)
    setSubmitting(true)
    try {
      const { data } = await api.post(`/quizzes/${id}/submit`, { answers })
      setResult(data)
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const answeredCount = Object.keys(selected).length
  const allAnswered = quiz ? answeredCount === quiz.questions.length : false

  if (loading) return (
    <div className="p-6">
      <div className="h-64 rounded bg-white border border-slate-200 shimmer" />
    </div>
  )
  if (!quiz) return null

  const q = quiz.questions[current]

  return (
    <div className="p-6 page-enter">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-xs font-bold mb-6 transition-colors group bg-transparent border-none outline-none"
      >
        <ChevronLeft size={14} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
        Learning Command Center
      </button>

      {!result ? (
        /* ── Quiz Taking UI ── */
        <div className="max-w-2xl mx-auto">
          {/* Progress header */}
          <div className="bg-white border border-slate-200 rounded-md p-4 mb-6 shadow-3xs">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-slate-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>ASSESSMENT · QUESTION</p>
              <span className="font-mono text-sm text-slate-450 font-semibold">
                <span className="text-brandBlue">{current + 1}</span> / {quiz.questions.length}
              </span>
            </div>
            {/* Progress bar */}
            <div className="flex gap-1">
              {quiz.questions.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full cursor-pointer transition-all"
                  style={{
                    backgroundColor: i === current
                      ? '#3895D2'
                      : selected[i] !== undefined
                        ? '#4FB286'
                        : '#E2E8F0',
                  }}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-slate-400 text-xs font-mono">{answeredCount}/{quiz.questions.length} answered</span>
              <span className="text-slate-400 text-xs font-mono">{q.topic}</span>
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white border border-slate-200 rounded-md p-6 mb-4 shadow-3xs">
            <h2 className="font-heading font-bold text-slate-800 text-sm md:text-base leading-relaxed mb-6">
              {q.text}
            </h2>

            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                const isSelected = selected[current] === idx
                return (
                  <button
                    key={idx}
                    id={`option-${idx}`}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left flex items-start gap-4 p-4 rounded border transition-all ${
                      isSelected
                        ? 'border-brandBlue bg-brandBlue/5 text-slate-800 font-semibold shadow-3xs'
                        : 'border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                      isSelected ? 'bg-brandBlue border-brandBlue' : 'border-slate-200'
                    }`}>
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L4 7L9 1" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs md:text-sm leading-relaxed">{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={current === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded border border-slate-250 text-slate-700 hover:text-slate-850 hover:border-slate-350 disabled:opacity-30 disabled:cursor-not-allowed text-xs md:text-sm transition-all bg-slate-50 hover:bg-white font-semibold"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
              Previous
            </button>

            {current < quiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2.5 rounded border border-slate-250 text-slate-700 hover:text-slate-850 hover:border-slate-350 text-xs md:text-sm transition-all bg-slate-50 hover:bg-white font-semibold"
              >
                Next
                <ChevronRight size={14} strokeWidth={1.5} />
              </button>
            ) : (
              <button
                id="submit-quiz-btn"
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className="flex items-center gap-2 bg-brandBlue hover:bg-opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded text-xs md:text-sm transition-colors shadow-3xs"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {!allAnswered && (
            <p className="text-slate-400 text-xs font-mono text-center mt-4">
              Answer all {quiz.questions.length} questions to submit assessment
            </p>
          )}
        </div>
      ) : (
        /* ── Results UI ── */
        <div className="max-w-3xl mx-auto">
          {/* Score card */}
          <div className={`rounded-md p-8 mb-6 border relative overflow-hidden bg-white shadow-3xs ${
            result.score >= 70
              ? 'border-brandGreen/35'
              : result.score >= 40
                ? 'border-brandBlue/35'
                : 'border-brandRed/35'
          }`}>
            <div className="absolute top-4 right-4">
              <Trophy size={48} strokeWidth={1} className="text-slate-100" />
            </div>
            <p className="font-mono text-xs uppercase tracking-widest mb-2 font-bold"
              style={{ color: result.score >= 70 ? '#4FB286' : result.score >= 40 ? '#3895D2' : '#EA4532' }}>
              ASSESSMENT COMPLETE · {result.score >= 70 ? 'OUTSTANDING' : result.score >= 40 ? 'ON TRACK' : 'NEEDS PRACTICE'}
            </p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-mono text-6xl font-bold number-tick"
                style={{ color: result.score >= 70 ? '#4FB286' : result.score >= 40 ? '#3895D2' : '#EA4532' }}>
                {result.score}
              </span>
              <span className="text-slate-400 text-2xl font-bold">%</span>
            </div>
            <p className="text-slate-500 text-xs md:text-sm">
              Verified: {result.correct} of {result.total} questions answered correctly
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Question breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-slate-850 text-xs uppercase tracking-wider">Evaluation Analysis</h3>
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {result.questionResults.map((qr, i) => {
                  const questObj = quiz.questions[i]
                  return (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          qr.isCorrect ? 'bg-[#4FB286]/10 border border-[#4FB286]/25' : 'bg-[#EA4532]/10 border border-[#EA4532]/25'
                        }`}>
                          {qr.isCorrect
                            ? <CheckCircle2 size={12} strokeWidth={1.5} className="text-[#4FB286]" />
                            : <XCircle size={12} strokeWidth={1.5} className="text-[#EA4532]" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 text-xs font-bold leading-normal">
                            Q{i + 1}: {questObj?.text}
                          </p>
                          <p className="text-slate-450 font-mono text-[9px] uppercase tracking-wider mt-1">{qr.topic}</p>
                        </div>
                      </div>
                      
                      <div className="pl-7 space-y-1 text-xs">
                        <p className="text-slate-500 font-medium">
                          Your answer: <span className={qr.isCorrect ? 'text-[#4FB286] font-bold' : 'text-[#EA4532] font-bold'}>
                            {questObj?.options[qr.yourAnswer] || 'Unanswered'}
                          </span>
                        </p>
                        {!qr.isCorrect && (
                          <p className="text-slate-550 font-medium bg-[#4FB286]/5 border border-[#4FB286]/10 p-2 rounded-lg mt-1">
                            Correct Answer: <span className="text-[#4FB286] font-bold">
                              {questObj?.options[qr.correctIndex]}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Updated skill mastery */}
            <div className="bg-white border border-slate-200 rounded-md p-6 shadow-3xs">
              <h3 className="font-heading font-bold text-slate-800 text-sm mb-4">
                Skill Mastery Updated
                <span className="ml-2 text-[10px] font-mono text-brandBlue uppercase font-bold tracking-widest">LIVE</span>
              </h3>
              <div className="space-y-4">
                {result.mastery?.map(m => (
                  <SegmentedGauge key={m.topic} topic={m.topic} score={m.score} animated />
                ))}
              </div>
            </div>
          </div>

          {/* Next action from result */}
          {result.nextAction && (
            <div className={`mt-6 rounded-md p-4 border flex items-start gap-4 bg-white shadow-3xs ${
              result.nextAction.action === 'CRITICAL'
                ? 'border-brandRed/25 bg-brandRed/5'
                : 'border-brandBlue/25 bg-brandBlue/5'
            }`}>
              <AlertTriangle size={16} strokeWidth={1.5}
                className={result.nextAction.action === 'CRITICAL' ? 'text-brandRed mt-0.5 flex-shrink-0' : 'text-brandBlue mt-0.5 flex-shrink-0'} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 text-sm font-semibold">{result.nextAction.cta}</p>
              </div>
              {result.nextAction.deepLink && (
                <button
                  onClick={() => navigate(result.nextAction.deepLink)}
                  className="flex-shrink-0 text-sm text-brandBlue font-bold flex items-center gap-1 hover:gap-1.5 transition-all"
                >
                  Go <ArrowRight size={13} strokeWidth={1.5} />
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 bg-brandBlue hover:bg-opacity-95 text-white font-bold px-5 py-3 rounded text-xs md:text-sm transition-colors shadow-3xs"
            >
              Back to Command Center
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => { setResult(null); setCurrent(0); setSelected({}) }}
              className="flex items-center gap-2 px-5 py-3 rounded border border-slate-250 text-slate-700 hover:text-slate-850 hover:border-slate-350 text-xs md:text-sm font-bold bg-slate-50 hover:bg-white transition-all shadow-3xs"
            >
              <RotateCcw size={14} strokeWidth={1.5} />
              Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
