import { useState, useRef, useEffect } from 'react'
import { X, Brain, Send, Loader2, Volume2, Sparkles, HelpCircle, FileText, Code2, Zap } from 'lucide-react'
import api from '../lib/api'
import { playLoudClearVoice } from '../lib/speech'

export default function AITutorPanel({
  isOpen,
  onClose,
  lessonId,
  lessonTitle,
  courseTitle,
  moduleTitle,
  courseType,
  lessonContent
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm DigiMentor, your contextual AI learning assistant. I track your active courses, current lectures, and skill mastery to guide you. Ask me anything, or choose a quick contextual prompt below!",
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

  const sendAction = async (actionType) => {
    if (loading) return
    setLoading(true)

    const actionLabels = {
      explain: `💡 Explain "${lessonTitle || 'current lesson'}" in detail`,
      summarize: `📝 Summarize "${lessonTitle || 'current lesson'}" key takeaways`,
      example: `🔬 Show real-world practical example of this concept`,
      quiz: `⚡ Generate a quick quiz for this topic`,
    }

    const userDisplayMsg = actionLabels[actionType] || 'Explain this lesson'
    setMessages(prev => [...prev, { role: 'user', content: userDisplayMsg }])

    try {
      const { data } = await api.post('/ai/tutor', {
        action: actionType,
        lessonId,
        lessonTitle,
        courseTitle,
        moduleTitle,
        courseType,
        lessonContent,
      })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ DigiMentor is temporarily unable to reach the inference model. Please ensure the server is running with a valid GROQ_API_KEY.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const send = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { data } = await api.post('/ai/tutor', {
        message: msg,
        lessonId,
        lessonTitle,
        courseTitle,
        moduleTitle,
        courseType,
        lessonContent,
      })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ DigiMentor is temporarily unavailable. Check your server connection.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`tutor-panel fixed top-0 right-0 h-full w-[440px] max-w-[95vw] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#3895D2] shadow-2xs">
              <Brain size={18} />
            </div>
            <div>
              <p className="font-heading font-black text-slate-900 text-sm">DigiMentor AI</p>
              {lessonTitle ? (
                <p className="text-slate-500 text-[10px] font-mono truncate max-w-[210px]">
                  Context: {lessonTitle}
                </p>
              ) : (
                <p className="text-slate-400 text-[10px] font-mono">Real-time learning copilot</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-[9px] font-mono font-bold">ONLINE</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Quick Context Action Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5 text-xs flex-shrink-0">
          <button
            onClick={() => sendAction('explain')}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#3895D2] hover:text-[#3895D2] text-slate-700 text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
          >
            <Sparkles size={11} className="text-[#3895D2]" />
            <span>Explain This</span>
          </button>
          <button
            onClick={() => sendAction('summarize')}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#3895D2] hover:text-[#3895D2] text-slate-700 text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
          >
            <FileText size={11} className="text-amber-500" />
            <span>Summarize</span>
          </button>
          <button
            onClick={() => sendAction('example')}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#3895D2] hover:text-[#3895D2] text-slate-700 text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
          >
            <Code2 size={11} className="text-emerald-600" />
            <span>Example</span>
          </button>
          <button
            onClick={() => sendAction('quiz')}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#3895D2] hover:text-[#3895D2] text-slate-700 text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1"
          >
            <Zap size={11} className="text-indigo-600" />
            <span>Test Me</span>
          </button>
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-xs">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => playLoudClearVoice(msg.content)}
                    className="mt-2 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[10px] font-mono transition-colors"
                  >
                    <Volume2 size={11} />
                    <span>Listen</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 p-2 text-xs">
              <Loader2 size={14} className="animate-spin text-[#3895D2]" />
              <span>DigiMentor is thinking...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:bg-white focus-within:border-[#3895D2] transition-colors">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask a question about this lecture or code..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-1.5 bg-transparent text-xs font-medium outline-none text-slate-800"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-xl bg-[#3895D2] hover:bg-[#2c7db5] disabled:opacity-30 text-white flex items-center justify-center transition-all flex-shrink-0 shadow-2xs"
            >
              <Send size={13} />
            </button>
          </div>
        </div>

      </div>
    </>
  )
}
