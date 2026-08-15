import { useState, useEffect, useRef } from 'react'
import {
  X, Plus, Trash2, Edit3, Check, ArrowRight, ArrowLeft, Video,
  FileText, Upload, Clock, Eye, AlertCircle, Save, Send, Sparkles,
  ChevronUp, ChevronDown, CheckCircle2, Play, Download, ExternalLink,
  Layers, BookOpen, ShieldCheck, HelpCircle, RefreshCw, Wand2, Loader2
} from 'lucide-react'
import api from '../lib/api'

export default function CourseBuilder({ isOpen, onClose, initialCourseId = null, onSaved }) {
  // Step 1: Course Info, Step 2: Course Type, Step 3: Curriculum Builder, Step 4: AI PDF Converter
  const [step, setStep] = useState(initialCourseId ? 3 : 1)
  const [courseId, setCourseId] = useState(initialCourseId)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Step 1 & 2 Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    difficulty: 'Beginner',
    estimatedHours: 8,
    estimatedDuration: '8 hours',
    thumbnail: '',
    creditsCost: 0,
    courseType: 'video', // 'video' | 'pdf' | 'text'
    learningObjectives: ['Master fundamental and advanced principles', 'Build practical real-world applications'],
    prerequisites: ['Basic programming fundamentals'],
  })

  // Tag inputs for objectives & prerequisites
  const [newObjective, setNewObjective] = useState('')
  const [newPrerequisite, setNewPrerequisite] = useState('')

  // Curriculum State
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // Module & Lesson Modals
  const [activeModuleModal, setActiveModuleModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [moduleTitleInput, setModuleTitleInput] = useState('')

  const [activeLessonModal, setActiveLessonModal] = useState(false)
  const [targetModuleId, setTargetModuleId] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    contentUrl: '',
    fileName: '',
    fileSize: 0,
    duration: 0,
    content: '',
    uploadStatus: 'ready',
  })

  // File Upload State
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Preview Modal
  const [previewMedia, setPreviewMedia] = useState(null) // { type: 'video'|'pdf'|'text', url, title, content }

  // ─── AI PDF TO TEXT CONVERTER STATE ───
  const [pdfFile, setPdfFile] = useState(null)
  const [convertingPdf, setConvertingPdf] = useState(false)
  const [conversionPhase, setConversionPhase] = useState('') // 'reading' | 'structuring' | 'generating' | 'saving'
  const pdfInputRef = useRef(null)

  // Load existing course if editing
  useEffect(() => {
    if (initialCourseId && isOpen) {
      setCourseId(initialCourseId)
      setStep(3)
      loadCourse(initialCourseId)
    } else if (isOpen) {
      setStep(1)
      setCourseId(null)
      setCourse(null)
      setModules([])
      setPdfFile(null)
      setFormData({
        title: '',
        description: '',
        category: 'Web Development',
        difficulty: 'Beginner',
        estimatedHours: 8,
        estimatedDuration: '8 hours',
        thumbnail: '',
        creditsCost: 0,
        courseType: 'video',
        learningObjectives: ['Master fundamental and advanced principles', 'Build practical real-world applications'],
        prerequisites: ['Basic programming fundamentals'],
      })
    }
  }, [initialCourseId, isOpen])

  const loadCourse = async (id) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/instructor/courses/${id}`)
      setCourse(data)
      setModules(data.modules || [])
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || 'Web Development',
        difficulty: data.difficulty || 'Beginner',
        estimatedHours: data.estimatedHours || 8,
        estimatedDuration: data.estimatedDuration || '8 hours',
        thumbnail: data.thumbnail || '',
        creditsCost: data.creditsCost || 0,
        courseType: data.courseType || 'video',
        learningObjectives: data.learningObjectives || [],
        prerequisites: data.prerequisites || [],
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details.')
    } finally {
      setLoading(false)
    }
  }

  // Step 1 -> Step 2
  const handleNextToType = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide a course title and description.')
      return
    }
    setError(null)
    setStep(2)
  }

  // Step 2 -> Create Course & Go to Step 3
  const handleCreateCourse = async (selectedType) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...formData,
        courseType: selectedType,
      }
      const { data } = await api.post('/instructor/courses', payload)
      setCourseId(data._id)
      setCourse(data)
      setFormData(prev => ({ ...prev, courseType: selectedType }))
      setStep(3)
      setSuccessMsg('Course initialized! Now build your curriculum below.')
      setTimeout(() => setSuccessMsg(null), 3500)
      loadCourse(data._id)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize course.')
    } finally {
      setSaving(false)
    }
  }

  // ─── AI PDF TO COURSE CONVERSION HANDLER ───
  const handleConvertPdfToCourse = async (e) => {
    if (e) e.preventDefault()
    if (!pdfFile) {
      setError('Please select a PDF document to convert.')
      return
    }

    setConvertingPdf(true)
    setError(null)
    setConversionPhase('Extracting text content from PDF pages...')

    try {
      const uploadData = new FormData()
      uploadData.append('file', pdfFile)
      if (formData.title) uploadData.append('title', formData.title)
      uploadData.append('category', formData.category || 'Software Engineering')
      uploadData.append('difficulty', formData.difficulty || 'Beginner')

      const phaseTimer1 = setTimeout(() => {
        setConversionPhase('AI Analyzing topics, syllabus hierarchy & module breakdown...')
      }, 2500)

      const phaseTimer2 = setTimeout(() => {
        setConversionPhase('Generating rich Markdown lessons with code examples and key takeaways...')
      }, 6500)

      const { data } = await api.post('/instructor/courses/convert-pdf', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearTimeout(phaseTimer1)
      clearTimeout(phaseTimer2)
      setConversionPhase('Saving structured curriculum to MongoDB...')

      setSuccessMsg(`🎉 Success! Converted PDF into ${data.modulesCount} modules and ${data.lessonsCount} interactive text lessons!`)
      setCourseId(data.courseId)
      setStep(3)
      await loadCourse(data.courseId)
      if (onSaved) onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to convert PDF. Please ensure the PDF has readable text.')
    } finally {
      setConvertingPdf(false)
      setConversionPhase('')
    }
  }

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { data } = await api.put(`/instructor/courses/${courseId}`, formData)
      setCourse(data)
      setShowSettingsModal(false)
      setSuccessMsg('Course settings updated!')
      setTimeout(() => setSuccessMsg(null), 3000)
      if (onSaved) onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.')
    } finally {
      setSaving(false)
    }
  }

  // Submit for Review
  const handleSubmitForReview = async () => {
    if (modules.length === 0 || modules.every(m => !m.lessons || m.lessons.length === 0)) {
      setError('Please add at least one module and lesson before submitting.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await api.post(`/instructor/courses/${courseId}/submit`)
      setSuccessMsg('Course submitted for Admin review!')
      if (onSaved) onSaved()
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit course.')
    } finally {
      setSaving(false)
    }
  }

  // Module Actions
  const handleOpenAddModule = () => {
    setEditingModule(null)
    setModuleTitleInput(formData.courseType === 'pdf' ? `Chapter ${modules.length + 1}` : `Module ${modules.length + 1}`)
    setActiveModuleModal(true)
  }

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod)
    setModuleTitleInput(mod.title)
    setActiveModuleModal(true)
  }

  const handleSaveModule = async (e) => {
    e.preventDefault()
    if (!moduleTitleInput.trim()) return
    setSaving(true)
    try {
      if (editingModule) {
        const { data } = await api.put(`/instructor/modules/${editingModule._id}`, { title: moduleTitleInput })
        setModules(prev => prev.map(m => m._id === data._id ? { ...m, title: data.title } : m))
      } else {
        const { data } = await api.post(`/instructor/courses/${courseId}/modules`, { title: moduleTitleInput })
        setModules(prev => [...prev, data])
      }
      setActiveModuleModal(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save module.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteModule = async (modId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return
    try {
      await api.delete(`/instructor/modules/${modId}`)
      setModules(prev => prev.filter(m => m._id !== modId))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete module.')
    }
  }

  const handleMoveModule = async (index, direction) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= modules.length) return
    const updated = [...modules]
    const temp = updated[index]
    updated[index] = updated[targetIdx]
    updated[targetIdx] = temp

    setModules(updated)
    try {
      await api.put(`/instructor/courses/${courseId}/reorder`, {
        modules: updated.map((m, idx) => ({
          id: m._id,
          order: idx + 1,
          lessons: (m.lessons || []).map((l, lIdx) => ({ id: l._id, order: lIdx + 1 })),
        }))
      })
    } catch (err) {
      console.error('Failed to sync reorder', err)
    }
  }

  // Lesson Actions
  const handleOpenAddLesson = (moduleId) => {
    setTargetModuleId(moduleId)
    setEditingLesson(null)
    setLessonFormData({
      title: '',
      description: '',
      contentUrl: '',
      fileName: '',
      fileSize: 0,
      duration: formData.courseType === 'video' ? 300 : 0,
      content: '',
      uploadStatus: 'ready',
    })
    setActiveLessonModal(true)
  }

  const handleOpenEditLesson = (moduleId, lesson) => {
    setTargetModuleId(moduleId)
    setEditingLesson(lesson)
    setLessonFormData({
      title: lesson.title || '',
      description: lesson.description || '',
      contentUrl: lesson.contentUrl || '',
      fileName: lesson.fileName || '',
      fileSize: lesson.fileSize || 0,
      duration: lesson.duration || 0,
      content: lesson.content || '',
      uploadStatus: lesson.uploadStatus || 'ready',
    })
    setActiveLessonModal(true)
  }

  // File Upload Handler (for individual lessons)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    setUploadProgress(15)
    setError(null)

    const isPdf = formData.courseType === 'pdf' || file.type === 'application/pdf'
    const endpoint = isPdf ? '/uploads/pdf' : '/uploads/video'
    const fieldName = isPdf ? 'pdf' : 'video'

    const uploadPayload = new FormData()
    uploadPayload.append(fieldName, file)

    try {
      setUploadProgress(50)
      const { data } = await api.post(endpoint, uploadPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUploadProgress(100)

      setLessonFormData(prev => ({
        ...prev,
        contentUrl: data.url,
        fileName: data.fileName,
        fileSize: data.fileSize,
        title: prev.title || data.fileName.replace(/\.[^/.]+$/, ''),
        uploadStatus: 'ready',
      }))
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed. Please try again.')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSaveLesson = async (e) => {
    e.preventDefault()
    if (!lessonFormData.title.trim()) {
      setError('Lesson title is required.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...lessonFormData,
        type: formData.courseType === 'pdf' ? 'pdf' : formData.courseType === 'text' ? 'text' : 'video',
      }

      if (editingLesson) {
        const { data } = await api.put(`/instructor/lessons/${editingLesson._id}`, payload)
        setModules(prev => prev.map(m => {
          if (m._id !== targetModuleId) return m
          return {
            ...m,
            lessons: (m.lessons || []).map(l => l._id === data._id ? data : l)
          }
        }))
      } else {
        const { data } = await api.post(`/instructor/modules/${targetModuleId}/lessons`, payload)
        setModules(prev => prev.map(m => {
          if (m._id !== targetModuleId) return m
          return {
            ...m,
            lessons: [...(m.lessons || []), data]
          }
        }))
      }
      setActiveLessonModal(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lesson.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (!window.confirm('Delete this lesson?')) return
    try {
      await api.delete(`/instructor/lessons/${lessonId}`)
      setModules(prev => prev.map(m => {
        if (m._id !== moduleId) return m
        return {
          ...m,
          lessons: (m.lessons || []).filter(l => l._id !== lessonId)
        }
      }))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete lesson.')
    }
  }

  const handleMoveLesson = async (moduleId, lessonIdx, direction) => {
    const mod = modules.find(m => m._id === moduleId)
    if (!mod || !mod.lessons) return
    const targetIdx = lessonIdx + direction
    if (targetIdx < 0 || targetIdx >= mod.lessons.length) return

    const updatedLessons = [...mod.lessons]
    const temp = updatedLessons[lessonIdx]
    updatedLessons[lessonIdx] = updatedLessons[targetIdx]
    updatedLessons[targetIdx] = temp

    const updatedModules = modules.map(m => m._id === moduleId ? { ...m, lessons: updatedLessons } : m)
    setModules(updatedModules)

    try {
      await api.put(`/instructor/courses/${courseId}/reorder`, {
        modules: updatedModules.map((m, idx) => ({
          id: m._id,
          order: idx + 1,
          lessons: (m.lessons || []).map((l, lIdx) => ({ id: l._id, order: lIdx + 1 })),
        }))
      })
    } catch (err) {
      console.error('Failed to sync reorder', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#3895D2]">
              {formData.courseType === 'pdf' ? <FileText size={20} /> : formData.courseType === 'text' ? <Wand2 size={20} className="text-indigo-600" /> : <Video size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg">
                  {step === 3 ? (course?.title || formData.title || 'Course Curriculum Builder') : step === 4 ? 'AI PDF Course Generator' : 'Course Studio'}
                </h3>
                {step === 3 && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    course?.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : course?.status === 'submitted'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {course?.status || 'Draft'}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs font-medium">
                {step === 1 && 'Step 1 of 2: Course Information & Overview'}
                {step === 2 && 'Step 2 of 2: Select Delivery Format or Convert PDF'}
                {step === 4 && '✨ AI PDF Document to Text Course Converter'}
                {step === 3 && (formData.courseType === 'pdf' ? '📄 PDF Curriculum & Chapter Studio' : formData.courseType === 'text' ? '✨ Interactive Text Course Studio' : '🎥 Video Curriculum & Lecture Studio')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <Edit3 size={13} />
                  <span className="hidden sm:inline">Settings</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmitForReview}
                  disabled={saving || course?.status === 'submitted'}
                  className="px-4 py-1.5 rounded-xl bg-[#3895D2] hover:bg-[#2c7db5] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{course?.status === 'submitted' ? 'Submitted' : 'Submit for Review'}</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                if (onSaved) onSaved()
                onClose()
              }}
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors ml-2"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 text-xs">Dismiss</button>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ══════════════════════════════════════════════
              STEP 1: COURSE INFORMATION
          ══════════════════════════════════════════════ */}
          {step === 1 && (
            <form onSubmit={handleNextToType} className="max-w-2xl mx-auto space-y-5">
              <div className="text-center mb-6">
                <h4 className="text-xl font-heading font-black text-slate-900">Course Information</h4>
                <p className="text-slate-500 text-xs mt-1 font-medium">Enter high-level details about your curriculum.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Web Development with React & Node.js"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#3895D2] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Comprehensive course overview, syllabus structure, and outcomes..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#3895D2] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white outline-none"
                  >
                    {['Web Development', 'Mobile App Dev', 'Data Science & AI', 'Cloud & DevOps', 'Cybersecurity', 'UI/UX Design', 'General'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white outline-none"
                  >
                    {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 10 hours"
                    value={formData.estimatedDuration}
                    onChange={e => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Thumbnail URL / Banner Image</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... or leave blank for default"
                  value={formData.thumbnail}
                  onChange={e => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none"
                />
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Learning Objectives</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add an objective and press Add..."
                    value={newObjective}
                    onChange={e => setNewObjective(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (newObjective.trim()) {
                          setFormData(prev => ({ ...prev, learningObjectives: [...prev.learningObjectives, newObjective.trim()] }))
                          setNewObjective('')
                        }
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newObjective.trim()) {
                        setFormData(prev => ({ ...prev, learningObjectives: [...prev.learningObjectives, newObjective.trim()] }))
                        setNewObjective('')
                      }
                    }}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.learningObjectives.map((obj, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-[#3895D2] border border-sky-200 rounded-xl text-xs font-medium">
                      <span>{obj}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, learningObjectives: prev.learningObjectives.filter((_, idx) => idx !== i) }))}
                        className="hover:text-rose-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <span>Next: Choose Course Type</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════
              STEP 2: CHOOSE COURSE TYPE OR AI PDF CONVERSION
          ══════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center">
                <h4 className="text-xl font-heading font-black text-slate-900">Choose Course Format or Upload PDF</h4>
                <p className="text-slate-500 text-xs mt-1 font-medium">Select how you want to build and deliver your course curriculum.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Option 1: Video Course */}
                <div
                  onClick={() => handleCreateCourse('video')}
                  className="p-5 rounded-3xl border-2 border-slate-200 hover:border-[#3895D2] bg-white hover:bg-sky-50/30 cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 text-[#3895D2] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Video size={22} />
                    </div>
                    <h5 className="font-heading font-bold text-slate-900 text-sm mb-1">
                      🎥 Video Course
                    </h5>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                      Structured video lectures with custom speed, seek bar, and auto-completion at 90% watch time.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#3895D2]">
                    <span>Build Video Track</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Option 2: PDF Document Course */}
                <div
                  onClick={() => handleCreateCourse('pdf')}
                  className="p-5 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileText size={22} />
                    </div>
                    <h5 className="font-heading font-bold text-slate-900 text-sm mb-1">
                      📄 PDF Reader Course
                    </h5>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-medium">
                      Chapter-by-chapter document guides with embedded in-browser PDF reader and instant downloads.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>Build PDF Track</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Option 3: ✨ AI PDF to Text Course */}
                <div
                  onClick={() => setStep(4)}
                  className="p-5 rounded-3xl border-2 border-indigo-200 hover:border-indigo-500 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md relative overflow-hidden"
                >
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                    AI Auto-Parse
                  </div>
                  <div>
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                      <Wand2 size={20} />
                    </div>
                    <h5 className="font-heading font-bold text-indigo-950 text-sm mb-1 flex items-center gap-1.5">
                      <span>✨ AI PDF to Text</span>
                    </h5>
                    <p className="text-indigo-900/70 text-[11px] leading-relaxed font-medium">
                      Upload any PDF document. AI extracts the text, builds modules, and creates formatted Markdown lessons with code examples!
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                    <span>Upload & Convert PDF</span>
                    <Sparkles size={13} className="group-hover:rotate-12 transition-transform" />
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Course Info</span>
                </button>
                {saving && <span className="text-xs text-slate-400 animate-pulse">Initializing course studio...</span>}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 4: ✨ AI PDF CONVERTER PANEL
          ══════════════════════════════════════════════ */}
          {step === 4 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold font-mono mb-2">
                  <Sparkles size={13} />
                  <span>AI CURRICULUM ARCHITECT</span>
                </div>
                <h4 className="text-xl font-heading font-black text-slate-900">
                  Upload PDF to Generate Interactive Text Course
                </h4>
                <p className="text-slate-500 text-xs mt-1 font-medium">
                  Our AI extracts chapters, topics, explanations, and code from your PDF file and structures it into full Markdown lessons.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => !convertingPdf && pdfInputRef.current?.click()}
                className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
                  pdfFile
                    ? 'border-indigo-500 bg-indigo-50/40'
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) {
                      setPdfFile(f)
                      if (!formData.title) {
                        setFormData(prev => ({ ...prev, title: f.name.replace('.pdf', '') }))
                      }
                    }
                  }}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <FileText size={28} />
                </div>

                {pdfFile ? (
                  <div>
                    <p className="font-heading font-bold text-slate-900 text-sm">{pdfFile.name}</p>
                    <p className="text-slate-500 text-xs font-mono mt-0.5">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for AI processing
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPdfFile(null)
                      }}
                      className="mt-2 text-xs text-rose-600 font-bold hover:underline"
                    >
                      Choose a different file
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="font-heading font-bold text-slate-800 text-sm">
                      Click to browse or drop your PDF document here
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Supports course notes, ebooks, whitepapers, textbooks, and cheatsheets up to 25MB
                    </p>
                  </div>
                )}
              </div>

              {/* Conversion Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {['Web Development', 'Mobile App Dev', 'Data Science & AI', 'Cloud & DevOps', 'Cybersecurity', 'UI/UX Design', 'General'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress State during conversion */}
              {convertingPdf && (
                <div className="p-5 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-2 animate-pulse">
                  <div className="flex items-center justify-center gap-2 text-indigo-700 font-bold text-xs">
                    <Loader2 size={16} className="animate-spin" />
                    <span>{conversionPhase || 'AI Engine is parsing and generating curriculum...'}</span>
                  </div>
                  <p className="text-indigo-900/60 text-[11px]">
                    This takes approximately 10-20 seconds depending on document length. Please do not close this window.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={convertingPdf}
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  disabled={!pdfFile || convertingPdf}
                  onClick={handleConvertPdfToCourse}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Sparkles size={14} />
                  <span>{convertingPdf ? 'Generating Course...' : 'Generate Course from PDF ✨'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 3: DRAG & DROP CURRICULUM BUILDER
          ══════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">
              
              {/* Toolbar & Action Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Curriculum Structure</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold">
                      {modules.length} {formData.courseType === 'pdf' ? 'Chapters' : 'Modules'}
                    </span>
                  </h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Organize your syllabus, inspect lesson content, upload media, or edit text explanations.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Wand2 size={13} />
                    <span>AI Convert PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddModule}
                    className="px-4 py-2 rounded-xl bg-[#3895D2] hover:bg-[#2c7db5] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs flex-1 sm:flex-initial justify-center"
                  >
                    <Plus size={14} />
                    <span>{formData.courseType === 'pdf' ? 'Add Chapter' : 'Add Module'}</span>
                  </button>
                </div>
              </div>

              {/* Modules & Lessons List */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-32 bg-slate-50 rounded-2xl border border-slate-200 shimmer" />)}
                </div>
              ) : modules.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <BookOpen size={36} className="text-slate-400 mx-auto mb-3" />
                  <h5 className="font-heading font-bold text-slate-800 text-base">No Modules in this Course</h5>
                  <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                    Start by clicking "+ Add Module", or click "AI Convert PDF" to automatically create your full course outline from a document.
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleOpenAddModule}
                      className="px-4 py-2 bg-[#3895D2] text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      + Add First Module
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <Wand2 size={13} />
                      <span>Convert from PDF ✨</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((mod, modIdx) => (
                    <div
                      key={mod._id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
                    >
                      {/* Module Header Bar */}
                      <div className="p-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-200 font-mono text-[11px] font-bold text-slate-700 flex items-center justify-center flex-shrink-0">
                            {modIdx + 1}
                          </span>
                          <h5 className="font-heading font-bold text-slate-900 text-sm truncate">
                            {mod.title}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                            ({(mod.lessons || []).length} lessons)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveModule(modIdx, -1)}
                            disabled={modIdx === 0}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Up"
                          >
                            <ChevronUp size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveModule(modIdx, 1)}
                            disabled={modIdx === modules.length - 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Move Down"
                          >
                            <ChevronDown size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModule(mod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60"
                            title="Rename Module"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(mod._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Module"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Lessons inside Module */}
                      <div className="p-3 space-y-2 bg-white">
                        {(mod.lessons || []).map((lesson, lIdx) => (
                          <div
                            key={lesson._id}
                            className="p-3 rounded-xl border border-slate-200/70 hover:border-slate-300 bg-slate-50/40 hover:bg-slate-50 flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-[#3895D2] flex-shrink-0">
                                {formData.courseType === 'pdf' ? <FileText size={15} /> : formData.courseType === 'text' ? <FileText size={15} className="text-indigo-600" /> : <Video size={15} />}
                              </div>

                              <div className="min-w-0">
                                <p className="font-heading font-bold text-slate-900 text-xs truncate">
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                                  {lesson.duration > 0 && <span>{Math.round(lesson.duration / 60)} min</span>}
                                  {lesson.wordCount > 0 && <span>{lesson.wordCount} words</span>}
                                  {lesson.fileName && <span>· {lesson.fileName}</span>}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {/* Preview Button */}
                              {(lesson.contentUrl || lesson.content) && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewMedia({
                                    type: formData.courseType === 'pdf' ? 'pdf' : formData.courseType === 'text' ? 'text' : 'video',
                                    url: lesson.contentUrl,
                                    title: lesson.title,
                                    content: lesson.content,
                                  })}
                                  className="px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-[10px] font-bold flex items-center gap-1"
                                >
                                  <Eye size={11} />
                                  <span>Preview</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleMoveLesson(mod._id, lIdx, -1)}
                                disabled={lIdx === 0}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              >
                                <ChevronUp size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveLesson(mod._id, lIdx, 1)}
                                disabled={lIdx === (mod.lessons?.length || 0) - 1}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              >
                                <ChevronDown size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditLesson(mod._id, lesson)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(mod._id, lesson._id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Add Lesson to this Module */}
                        <button
                          type="button"
                          onClick={() => handleOpenAddLesson(mod._id)}
                          className="w-full py-2 border border-dashed border-slate-300 hover:border-[#3895D2] hover:bg-sky-50/40 rounded-xl text-slate-600 hover:text-[#3895D2] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus size={13} />
                          <span>{formData.courseType === 'pdf' ? 'Add Chapter Document' : 'Add Lesson'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ══════════════════════════════════════════════
            MODAL: ADD / EDIT MODULE
        ══════════════════════════════════════════════ */}
        {activeModuleModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-md shadow-2xl">
              <h4 className="font-heading font-bold text-slate-900 text-base mb-1">
                {editingModule ? 'Rename Module' : 'Create New Module'}
              </h4>
              <p className="text-slate-500 text-xs mb-4">
                Modules group your course lessons into thematic milestones.
              </p>

              <form onSubmit={handleSaveModule} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Module Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Module 1: Foundations of Backend Architecture"
                    value={moduleTitleInput}
                    onChange={e => setModuleTitleInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#3895D2]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModuleModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    {saving ? 'Saving...' : 'Save Module'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            MODAL: ADD / EDIT LESSON
        ══════════════════════════════════════════════ */}
        {activeLessonModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
                <h4 className="font-heading font-bold text-slate-900 text-base">
                  {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h4>
                <button onClick={() => setActiveLessonModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="flex-1 overflow-y-auto py-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Setting Up Express Server & MongoDB Connections"
                    value={lessonFormData.title}
                    onChange={e => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence overview of this lesson..."
                    value={lessonFormData.description}
                    onChange={e => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white resize-none"
                  />
                </div>

                {/* File Upload Section */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    {formData.courseType === 'pdf' ? 'Upload PDF Document' : 'Upload Video File (MP4, WebM, MOV)'}
                  </label>
                  
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2 bg-white border border-slate-200 hover:border-[#3895D2] text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2 shadow-2xs">
                      <Upload size={14} className="text-[#3895D2]" />
                      <span>{uploadingFile ? `Uploading ${uploadProgress}%...` : 'Browse File'}</span>
                      <input
                        type="file"
                        accept={formData.courseType === 'pdf' ? 'application/pdf' : 'video/*'}
                        onChange={handleFileUpload}
                        disabled={uploadingFile}
                        className="hidden"
                      />
                    </label>

                    {lessonFormData.fileName && (
                      <span className="text-xs text-slate-600 font-mono font-medium truncate max-w-xs">
                        📎 {lessonFormData.fileName}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold mb-1">Or direct stream / storage URL</label>
                    <input
                      type="text"
                      placeholder="https://commondatastorage.googleapis.com/... or https://..."
                      value={lessonFormData.contentUrl}
                      onChange={e => setLessonFormData({ ...lessonFormData, contentUrl: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Markdown Notes / Text Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Lesson Markdown Content (Notes, Code & Explanations)
                  </label>
                  <textarea
                    rows={6}
                    placeholder="# Lesson Title&#10;&#10;Key explanations, bullet points, and code examples..."
                    value={lessonFormData.content}
                    onChange={e => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:bg-white resize-y"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveLessonModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingFile}
                    className="px-5 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    {saving ? 'Saving...' : 'Save Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            MODAL: COURSE SETTINGS
        ══════════════════════════════════════════════ */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-lg shadow-2xl">
              <h4 className="font-heading font-bold text-slate-900 text-base mb-1">
                Course Settings
              </h4>
              <p className="text-slate-500 text-xs mb-4">Edit course title, description, category, and access credits.</p>

              <form onSubmit={handleSaveSettings} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {['Web Development', 'Mobile App Dev', 'Data Science & AI', 'Cloud & DevOps', 'Cybersecurity', 'UI/UX Design', 'General'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Credits Cost</label>
                    <input
                      type="number"
                      value={formData.creditsCost}
                      onChange={e => setFormData({ ...formData, creditsCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-[#3895D2] text-white rounded-xl text-xs font-bold"
                  >
                    {saving ? 'Saving...' : 'Update Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            MODAL: MEDIA & MARKDOWN PREVIEW
        ══════════════════════════════════════════════ */}
        {previewMedia && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
                <h4 className="font-heading font-bold text-slate-900 text-sm">
                  Preview: {previewMedia.title}
                </h4>
                <button onClick={() => setPreviewMedia(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                {previewMedia.type === 'video' && previewMedia.url && (
                  <video src={previewMedia.url} controls className="w-full rounded-2xl aspect-video bg-black" />
                )}
                {previewMedia.type === 'pdf' && previewMedia.url && (
                  <iframe src={previewMedia.url} title={previewMedia.title} className="w-full h-96 rounded-2xl border border-slate-200" />
                )}
                {previewMedia.content && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-3 font-mono text-xs text-slate-800 whitespace-pre-wrap">
                    {previewMedia.content}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
