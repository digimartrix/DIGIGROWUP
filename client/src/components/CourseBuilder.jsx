import { useState, useEffect } from 'react'
import {
  X, Plus, Trash2, Edit3, Check, ArrowRight, ArrowLeft, Video,
  FileText, Upload, Clock, Eye, AlertCircle, Save, Send, Sparkles,
  ChevronUp, ChevronDown, CheckCircle2, Play, Download, ExternalLink,
  Layers, BookOpen, ShieldCheck, HelpCircle, RefreshCw
} from 'lucide-react'
import api from '../lib/api'

export default function CourseBuilder({ isOpen, onClose, initialCourseId = null, onSaved }) {
  // Step 1: Course Info, Step 2: Course Type, Step 3: Curriculum Builder
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
    courseType: 'video', // 'video' | 'pdf'
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
  const [previewMedia, setPreviewMedia] = useState(null) // { type: 'video'|'pdf', url, title }

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
        estimatedDuration: data.estimatedDuration || `${data.estimatedHours || 8} hours`,
        thumbnail: data.thumbnail || '',
        creditsCost: data.creditsCost || 0,
        courseType: data.courseType || 'video',
        learningObjectives: data.learningObjectives?.length ? data.learningObjectives : ['Master fundamental principles'],
        prerequisites: data.prerequisites?.length ? data.prerequisites : ['Basic computer literacy'],
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Step 1 -> Step 2
  const handleNextToType = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide a course title and description.')
      return
    }
    setError(null)
    setStep(2)
  }

  // Handle Step 2 -> Create Course & Go to Curriculum Builder
  const handleCreateCourse = async (selectedType) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...formData,
        courseType: selectedType,
      }
      const { data } = await api.post('/instructor/courses', payload)
      setCourse(data)
      setCourseId(data._id)
      setModules(data.modules || [])
      setStep(3)
      setSuccessMsg('Course initialized! You can now organize your modules and lessons.')
      setTimeout(() => setSuccessMsg(null), 3500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize course.')
    } finally {
      setSaving(false)
    }
  }

  // Save Course Settings
  const handleSaveSettings = async () => {
    if (!courseId) return
    setSaving(true)
    try {
      const { data } = await api.put(`/instructor/courses/${courseId}`, formData)
      setCourse(prev => ({ ...prev, ...data }))
      setShowSettingsModal(false)
      setSuccessMsg('Course settings updated successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update settings.')
    } finally {
      setSaving(false)
    }
  }

  // Submit Course for Review
  const handleSubmitForReview = async () => {
    if (!courseId) return
    if (modules.length === 0 || modules.every(m => !m.lessons || m.lessons.length === 0)) {
      setError('Please add at least 1 module and 1 lesson with content before submitting for review.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const { data } = await api.post(`/instructor/courses/${courseId}/submit`)
      setCourse(prev => ({ ...prev, status: 'submitted' }))
      setSuccessMsg('🎉 Course successfully submitted for Admin Review!')
      if (onSaved) onSaved()
      setTimeout(() => {
        setSuccessMsg(null)
        onClose()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit course for review.')
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

  // File Upload Handler
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
    if (!lessonFormData.contentUrl.trim() && !lessonFormData.content.trim()) {
      setError('Please upload a file or enter a valid media URL.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...lessonFormData,
        type: formData.courseType,
      }

      if (editingLesson) {
        const { data } = await api.put(`/instructor/lessons/${editingLesson._id}`, payload)
        setModules(prev => prev.map(m => {
          if (m._id === targetModuleId) {
            return {
              ...m,
              lessons: (m.lessons || []).map(l => l._id === data._id ? data : l)
            }
          }
          return m
        }))
      } else {
        const { data } = await api.post(`/instructor/modules/${targetModuleId}/lessons`, payload)
        setModules(prev => prev.map(m => {
          if (m._id === targetModuleId) {
            return {
              ...m,
              lessons: [...(m.lessons || []), data]
            }
          }
          return m
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
        if (m._id === moduleId) {
          return { ...m, lessons: (m.lessons || []).filter(l => l._id !== lessonId) }
        }
        return m
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
              {formData.courseType === 'pdf' ? <FileText size={20} /> : <Video size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-slate-900 text-base sm:text-lg">
                  {step === 3 ? (course?.title || formData.title || 'Course Curriculum Builder') : 'Course Studio'}
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
                {step === 2 && 'Step 2 of 2: Select Primary Delivery Format'}
                {step === 3 && (formData.courseType === 'pdf' ? '📄 PDF Curriculum & Chapter Studio' : '🎥 Video Curriculum & Lecture Studio')}
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
              STEP 2: CHOOSE COURSE TYPE
          ══════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center">
                <h4 className="text-xl font-heading font-black text-slate-900">Choose Primary Course Delivery Type</h4>
                <p className="text-slate-500 text-xs mt-1 font-medium">Select how learners will consume this course material.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option 1: Video Course */}
                <div
                  onClick={() => handleCreateCourse('video')}
                  className="p-6 rounded-3xl border-2 border-slate-200 hover:border-[#3895D2] bg-white hover:bg-sky-50/30 cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-[#3895D2] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Video size={24} />
                    </div>
                    <h5 className="font-heading font-bold text-slate-900 text-base mb-1.5 flex items-center gap-2">
                      <span>🎥 Video Course</span>
                    </h5>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      Structured video lectures (MP4, WebM, MOV) with custom playback speeds, auto-completion at 90% watch time, and interactive module playlists.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#3895D2]">
                    <span>Build Video Curriculum</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Option 2: PDF Course */}
                <div
                  onClick={() => handleCreateCourse('pdf')}
                  className="p-6 rounded-3xl border-2 border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 cursor-pointer transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <FileText size={24} />
                    </div>
                    <h5 className="font-heading font-bold text-slate-900 text-base mb-1.5 flex items-center gap-2">
                      <span>📄 PDF Course</span>
                    </h5>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">
                      Chapter-by-chapter document guides, whitepapers, and illustrated ebooks with embedded in-browser reader, zoom controls, and instant PDF download.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                    <span>Build PDF Curriculum</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
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
                    Organize your syllabus, upload media files, and sequence learning steps.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleOpenAddModule}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus size={14} />
                    <span>{formData.courseType === 'pdf' ? 'Add Chapter' : 'Add Module'}</span>
                  </button>
                </div>
              </div>

              {/* Modules & Lessons List */}
              {modules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <Layers size={32} className="text-slate-400 mx-auto mb-2" />
                  <p className="font-heading font-bold text-slate-700 text-sm">No modules created yet</p>
                  <p className="text-slate-400 text-xs mt-1">Click the button above to add your first module or chapter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((mod, modIdx) => (
                    <div
                      key={mod._id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all hover:border-slate-300"
                    >
                      {/* Module Header */}
                      <div className="px-5 py-3.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleMoveModule(modIdx, -1)}
                              disabled={modIdx === 0}
                              className="text-slate-400 hover:text-slate-800 disabled:opacity-20 p-0.5"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveModule(modIdx, 1)}
                              disabled={modIdx === modules.length - 1}
                              className="text-slate-400 hover:text-slate-800 disabled:opacity-20 p-0.5"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-500">
                            #{modIdx + 1}
                          </span>
                          <h5 className="font-heading font-bold text-slate-900 text-sm sm:text-base truncate">
                            {mod.title}
                          </h5>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-bold">
                            {(mod.lessons || []).length} {formData.courseType === 'pdf' ? 'docs' : 'lessons'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenAddLesson(mod._id)}
                            className="px-3 py-1.5 bg-[#3895D2]/10 hover:bg-[#3895D2]/20 text-[#3895D2] rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            <Plus size={13} />
                            <span className="hidden sm:inline">{formData.courseType === 'pdf' ? 'Upload PDF' : 'Add Video'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModule(mod)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                            title="Rename Module"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(mod._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Module"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Lessons in Module */}
                      <div className="divide-y divide-slate-100">
                        {(!mod.lessons || mod.lessons.length === 0) ? (
                          <div className="px-5 py-4 text-center text-xs text-slate-400">
                            No {formData.courseType === 'pdf' ? 'PDF files' : 'video lessons'} in this section yet. Click{' '}
                            <strong className="text-[#3895D2] cursor-pointer" onClick={() => handleOpenAddLesson(mod._id)}>
                              +{formData.courseType === 'pdf' ? 'Upload PDF' : 'Add Video'}
                            </strong>.
                          </div>
                        ) : (
                          mod.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson._id}
                              className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveLesson(mod._id, lIdx, -1)}
                                    disabled={lIdx === 0}
                                    className="text-slate-400 hover:text-slate-800 disabled:opacity-20 p-0.5"
                                  >
                                    <ChevronUp size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveLesson(mod._id, lIdx, 1)}
                                    disabled={lIdx === mod.lessons.length - 1}
                                    className="text-slate-400 hover:text-slate-800 disabled:opacity-20 p-0.5"
                                  >
                                    <ChevronDown size={12} />
                                  </button>
                                </div>

                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                                  {formData.courseType === 'pdf' ? <FileText size={15} /> : <Play size={14} />}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-slate-900 text-xs sm:text-sm font-bold truncate">
                                      {lesson.title}
                                    </p>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                      <Check size={10} /> Ready
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
                                    {lesson.duration > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Clock size={11} /> {Math.round(lesson.duration / 60)} min
                                      </span>
                                    )}
                                    {lesson.fileSize > 0 && (
                                      <span>{(lesson.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
                                    )}
                                    {lesson.fileName && (
                                      <span className="truncate max-w-[150px]">{lesson.fileName}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {lesson.contentUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewMedia({
                                      type: formData.courseType,
                                      url: lesson.contentUrl,
                                      title: lesson.title,
                                    })}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-all"
                                  >
                                    <Eye size={12} />
                                    <span className="hidden sm:inline">Preview</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditLesson(mod._id, lesson)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                  title="Edit Lesson"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteLesson(mod._id, lesson._id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ══════════════════════════════════════════════
            ADD / EDIT MODULE MODAL
        ══════════════════════════════════════════════ */}
        {activeModuleModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-2xl">
              <h4 className="font-heading font-bold text-slate-900 text-base mb-4">
                {editingModule ? 'Rename Section' : (formData.courseType === 'pdf' ? 'Add Chapter' : 'Add Module')}
              </h4>
              <form onSubmit={handleSaveModule} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Title</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. HTML5 Semantics & DOM Hierarchy"
                    value={moduleTitleInput}
                    onChange={e => setModuleTitleInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModuleModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-[#3895D2] text-white text-xs font-bold hover:bg-[#2c7db5]"
                  >
                    {saving ? 'Saving...' : 'Save Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            ADD / EDIT LESSON MODAL (VIDEO OR PDF)
        ══════════════════════════════════════════════ */}
        {activeLessonModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-xl shadow-2xl my-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
                  {formData.courseType === 'pdf' ? <FileText size={18} className="text-emerald-600" /> : <Video size={18} className="text-[#3895D2]" />}
                  <span>{editingLesson ? 'Edit Lesson' : (formData.courseType === 'pdf' ? 'Add PDF Chapter' : 'Add Video Lecture')}</span>
                </h4>
                <button onClick={() => setActiveLessonModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to CSS Flexbox"
                    value={lessonFormData.title}
                    onChange={e => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Description / Learning Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Key concepts covered in this lesson..."
                    value={lessonFormData.description}
                    onChange={e => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none resize-none"
                  />
                </div>

                {/* File Upload Box */}
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 bg-slate-50/60 text-center relative">
                  <input
                    type="file"
                    accept={formData.courseType === 'pdf' ? '.pdf,application/pdf' : 'video/mp4,video/webm,video/quicktime'}
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploadingFile}
                  />
                  <div className="flex flex-col items-center">
                    <Upload size={24} className="text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-800">
                      {uploadingFile ? 'Uploading file...' : `Click or drag ${formData.courseType === 'pdf' ? 'PDF Document' : 'Video File'} here`}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {formData.courseType === 'pdf' ? 'Supported format: PDF (up to 50MB)' : 'Supported formats: MP4, WebM, MOV (up to 250MB)'}
                    </p>
                  </div>
                  {uploadingFile && (
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#3895D2] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  )}
                </div>

                {/* Or Direct URL Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                    Or External {formData.courseType === 'pdf' ? 'PDF' : 'Video'} URL
                  </label>
                  <input
                    type="text"
                    placeholder={formData.courseType === 'pdf' ? 'https://example.com/guide.pdf' : 'https://commondatastorage.googleapis.com/.../sample.mp4'}
                    value={lessonFormData.contentUrl}
                    onChange={e => setLessonFormData({ ...lessonFormData, contentUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white outline-none"
                  />
                </div>

                {formData.courseType === 'video' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Seconds)</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="300"
                        value={lessonFormData.duration}
                        onChange={e => setLessonFormData({ ...lessonFormData, duration: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">File Name</label>
                      <input
                        type="text"
                        placeholder="lesson.mp4"
                        value={lessonFormData.fileName}
                        onChange={e => setLessonFormData({ ...lessonFormData, fileName: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveLessonModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploadingFile}
                    className="px-5 py-2 rounded-xl bg-[#3895D2] text-white text-xs font-bold hover:bg-[#2c7db5] shadow-xs"
                  >
                    {saving ? 'Saving...' : 'Save Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            COURSE SETTINGS MODAL
        ══════════════════════════════════════════════ */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading font-bold text-slate-900 text-base">Course Settings</h4>
                <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none"
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
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      {['Beginner', 'Intermediate', 'Advanced'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-[#3895D2] text-white text-xs font-bold hover:bg-[#2c7db5]"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            MEDIA PREVIEW MODAL
        ══════════════════════════════════════════════ */}
        {previewMedia && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="font-heading font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Eye size={16} className="text-[#3895D2]" />
                  <span>Preview: {previewMedia.title}</span>
                </h4>
                <button onClick={() => setPreviewMedia(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 my-4 overflow-hidden rounded-2xl bg-black/90 flex items-center justify-center min-h-[350px]">
                {previewMedia.type === 'video' ? (
                  <video
                    src={previewMedia.url}
                    controls
                    autoPlay
                    className="w-full max-h-[500px] object-contain rounded-xl"
                  />
                ) : (
                  <iframe
                    src={previewMedia.url}
                    title={previewMedia.title}
                    className="w-full h-[500px] rounded-xl bg-white border-0"
                  />
                )}
              </div>

              <div className="flex justify-end">
                <button
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
