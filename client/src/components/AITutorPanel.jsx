import { useState, useRef, useEffect } from 'react'
import { X, Brain, Send, Loader2, ChevronRight } from 'lucide-react'
import api from '../lib/api'

export default function AITutorPanel({ isOpen, onClose, lessonId, lessonTitle }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm DigiMentor, your contextual learning assistant. I track your active courses, current lessons, and skill mastery to guide you. Ask me anything, or request explanation of a specific section in your current lesson.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350)
    }
  }, [isOpen])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { data } = await api.post('/ai/tutor', { message: msg, lessonId })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Unable to connect to the DigiMentor engine. Please ensure your backend server is active and the GROQ_API_KEY is configured in server/.env.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const suggestedQuestions = [
    'Explain closures with a simple example',
    'What is the difference between flexbox and grid?',
    'Why does margin collapse occur?',
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`tutor-panel fixed top-0 right-0 h-full w-[420px] max-w-[95vw] bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col ${isOpen ? 'open' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-brandBlue/10 border border-brandBlue/20 flex items-center justify-center">
              <Brain size={15} strokeWidth={1.5} className="text-brandBlue" />
            </div>
            <div>
              <p className="font-heading text-slate-800 text-sm font-semibold">DigiMentor</p>
              {lessonTitle && (
                <p className="text-slate-400 text-[10px] truncate max-w-[200px]">Context: {lessonTitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="status-dot bg-brandGreen" />
              <span className="text-slate-400 text-[10px] font-mono">ONLINE</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded hover:bg-slate-100"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brandBlue text-white border border-brandBlue shadow-xs'
                    : 'bg-white border border-slate-250 text-slate-600 shadow-xs'
                }`}
              >
                <pre className="whitespace-pre-wrap font-body text-xs md:text-sm">{msg.content}</pre>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-2 shadow-xs">
                <Loader2 size={14} strokeWidth={1.5} className="text-brandBlue animate-spin" />
                <span className="text-slate-400 text-xs font-mono">Processing...</span>
              </div>
            </div>
          )}

          {/* Suggested questions (only at start) */}
          {messages.length === 1 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-slate-400 text-[9px] font-mono tracking-widest px-1 uppercase">SUGGESTED EXPLANATIONS</p>
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(q); inputRef.current?.focus() }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded border border-slate-200 text-slate-600 text-xs font-semibold hover:text-brandBlue hover:border-brandBlue/35 hover:bg-brandBlue/5 transition-all group"
                >
                  <ChevronRight size={12} strokeWidth={1.5} className="text-slate-400 group-hover:text-brandBlue flex-shrink-0" />
                  {q}
                </button>
              ))}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-slate-200 flex-shrink-0 bg-white">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask DigiMentor anything about web dev..."
              rows={2}
              className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:border-brandBlue/40 focus:bg-white transition-all font-body"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-10 bg-brandBlue hover:bg-opacity-90 disabled:opacity-40 disabled:cursor-not-allowed rounded flex items-center justify-center transition-colors"
            >
              {loading
                ? <Loader2 size={14} strokeWidth={1.5} className="text-white animate-spin" />
                : <Send size={14} strokeWidth={1.5} className="text-white" />
              }
            </button>
          </div>
          <p className="text-slate-400 text-[10px] mt-2 font-mono">⏎ to send · Shift+⏎ for newline</p>
        </div>
      </div>
    </>
  )
}
