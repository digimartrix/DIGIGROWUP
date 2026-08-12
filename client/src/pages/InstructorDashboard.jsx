import { useState, useEffect } from 'react'
import api from '../lib/api'
import {
  BookOpen, Plus, Trash2, Edit3, ChevronDown, ChevronRight,
  FileText, HelpCircle, Layers, CheckCircle2, AlertCircle, Save,
  Eye, Sparkles, Clock, BarChart2, ShieldAlert
} from 'lucide-react'

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Create course form state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    difficulty: 'Beginner',
    estimatedHours: 8,
    creditsCost: 50,
  })

  // Selected course for curriculum builder
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseDetails, setCourseDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  // Module / Lesson / Quiz editing modals & states
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [showAddModule, setShowAddModule] = useState(false)

  const [activeModuleForLesson, setActiveModuleForLesson] = useState(null)
  const [lessonForm, setLessonForm] = useState({ title: '', content: '' })
  const [editingLessonId, setEditingLessonId] = useState(null)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [previewMarkdown, setPreviewMarkdown] = useState(false)

  const [activeModuleForQuiz, setActiveModuleForQuiz] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [showQuizModal, setShowQuizModal] = useState(false)

  useEffect(() => {
    fetchInstructorCourses()
  }, [])

  const showToast = (msg, isErr = false) => {
    if (isErr) {
      setError(msg)
      setTimeout(() => setError(''), 4000)
    } else {
      setSuccessMsg(msg)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  const fetchInstructorCourses = async () => {
    setLoading(true)
    try {
      const res = await api.get('/instructor/courses')
      setCourses(res.data || [])
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load instructor courses.', true)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      showToast('Please provide course title and description.', true)
      return
    }
    try {
      const res = await api.post('/instructor/courses', newCourse)
      showToast(`Course "${res.data.title}" created successfully!`)
      setShowCreateModal(false)
      setNewCourse({
        title: '',
        description: '',
        category: 'Web Development',
        difficulty: 'Beginner',
        estimatedHours: 8
      })
      fetchInstructorCourses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create course.', true)
    }
  }

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" and all its modules, lessons, and quizzes?`)) {
      return
    }
    try {
      await api.delete(`/instructor/courses/${courseId}`)
      showToast(`Deleted course "${title}".`)
      if (selectedCourse?._id === courseId) {
        setSelectedCourse(null)
        setCourseDetails(null)
      }
      fetchInstructorCourses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete course.', true)
    }
  }

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course)
    setLoadingDetails(true)
    try {
      const res = await api.get(`/courses/${course._id}`)
      setCourseDetails(res.data)
    } catch (err) {
      showToast('Failed to load course curriculum.', true)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleAddModule = async (e) => {
    e.preventDefault()
    if (!newModuleTitle.trim() || !selectedCourse) return
    try {
      await api.post(`/instructor/courses/${selectedCourse._id}/modules`, { title: newModuleTitle.trim() })
      setNewModuleTitle('')
      setShowAddModule(false)
      showToast('Module added successfully!')
      handleSelectCourse(selectedCourse)
      fetchInstructorCourses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add module.', true)
    }
  }

  const handleDeleteModule = async (moduleId, title) => {
    if (!window.confirm(`Delete module "${title}" and its lessons/quizzes?`)) return
    try {
      await api.delete(`/instructor/courses/${selectedCourse._id}/modules/${moduleId}`)
      showToast(`Module "${title}" deleted.`)
      handleSelectCourse(selectedCourse)
      fetchInstructorCourses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete module.', true)
    }
  }

  // Lesson Management
  const openAddLesson = (module) => {
    setActiveModuleForLesson(module)
    setEditingLessonId(null)
    setLessonForm({
      title: '',
      content: `# ${module.title} — Lesson 1\n\nWelcome to this lesson! Explain the key concepts here.\n\n### Key Concepts:\n- Concept 1\n- Concept 2\n\n\`\`\`javascript\n// Sample code snippet\nconsole.log("Hello DigiGrowUp!");\n\`\`\``
    })
    setPreviewMarkdown(false)
    setShowLessonModal(true)
  }

  const openEditLesson = (module, lesson) => {
    setActiveModuleForLesson(module)
    setEditingLessonId(lesson._id)
    setLessonForm({
      title: lesson.title,
      content: lesson.content || ''
    })
    setPreviewMarkdown(false)
    setShowLessonModal(true)
  }

  const handleSaveLesson = async (e) => {
    e.preventDefault()
    if (!lessonForm.title.trim()) {
      showToast('Lesson title is required.', true)
      return
    }
    try {
      if (editingLessonId) {
        await api.put(`/instructor/modules/${activeModuleForLesson._id}/lessons/${editingLessonId}`, lessonForm)
        showToast('Lesson updated!')
      } else {
        await api.post(`/instructor/modules/${activeModuleForLesson._id}/lessons`, lessonForm)
        showToast('Lesson created successfully!')
      }
      setShowLessonModal(false)
      handleSelectCourse(selectedCourse)
      fetchInstructorCourses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save lesson.', true)
    }
  }

  const handleDeleteLesson = async (moduleId, lessonId, title) => {
    if (!window.confirm(`Delete lesson "${title}"?`)) return
    try {
      await api.delete(`/instructor/modules/${moduleId}/lessons/${lessonId}`)
      showToast(`Deleted lesson "${title}".`)
      handleSelectCourse(selectedCourse)
      fetchInstructorCourses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete lesson.', true)
    }
  }

  // Quiz Management
  const openQuizBuilder = async (module) => {
    setActiveModuleForQuiz(module)
    try {
      if (module.quizId) {
        const res = await api.get(`/quizzes/${module.quizId}`)
        // Set quiz questions
        setQuizQuestions(res.data?.questions || [])
      } else {
        setQuizQuestions([
          {
            text: 'What is the primary function of this module concept?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            topic: module.title,
            difficulty: 'easy'
          }
        ])
      }
      setShowQuizModal(true)
    } catch (err) {
      showToast('Failed to load quiz data.', true)
    }
  }

  const handleAddQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        topic: activeModuleForQuiz?.title || 'General',
        difficulty: 'medium'
      }
    ])
  }

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...quizQuestions]
    updated[index][field] = value
    setQuizQuestions(updated)
  }

  const handleUpdateOption = (qIdx, optIdx, value) => {
    const updated = [...quizQuestions]
    updated[qIdx].options[optIdx] = value
    setQuizQuestions(updated)
  }

  const handleRemoveQuestion = (index) => {
    if (quizQuestions.length <= 1) {
      showToast('A quiz must have at least one question.', true)
      return
    }
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index))
  }

  const handleSaveQuiz = async () => {
    // Validate questions
    for (let i = 0; i < quizQuestions.length; i++) {
      const q = quizQuestions[i]
      if (!q.text.trim()) {
        showToast(`Question ${i + 1} text cannot be empty.`, true)
        return
      }
      if (q.options.some(opt => !opt.trim())) {
        showToast(`All 4 options in Question ${i + 1} must be filled.`, true)
        return
      }
    }

    try {
      await api.post(`/instructor/modules/${activeModuleForQuiz._id}/quiz`, {
        questions: quizQuestions
      })
      showToast(`Quiz saved with ${quizQuestions.length} questions!`)
      setShowQuizModal(false)
      handleSelectCourse(selectedCourse)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save quiz.', true)
    }
  }

  return (
    <div className="page-enter max-w-7xl mx-auto space-y-8 pb-16">
      {/* Toast notifications */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-emerald-400 border border-emerald-500/30 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-rose-400 border border-rose-500/30 px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <AlertCircle size={18} className="text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#3895D2]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#3895D2] font-bold uppercase mb-2">
              <Sparkles size={14} />
              <span>INSTRUCTOR STUDIO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
              Course Authoring & Management
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Create, organize, and publish live interactive courses, markdown lessons, and auto-graded assessments in real-time.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 bg-[#EA4532] hover:bg-[#EA4532]/90 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-[#EA4532]/25 flex-shrink-0"
          >
            <Plus size={18} />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Course List, Right = Curriculum Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Courses list (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase font-bold text-slate-400 tracking-wider">
              Your Published Courses ({courses.length})
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-slate-800/40 rounded-xl animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-8 text-center text-slate-400">
              <BookOpen size={36} className="mx-auto text-slate-600 mb-3" />
              <p className="font-semibold text-white text-sm">No courses authored yet.</p>
              <p className="text-xs text-slate-500 mt-1">Click "Create New Course" above to author your first module-based course.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((c) => {
                const isSelected = selectedCourse?._id === c._id
                return (
                  <div
                    key={c._id}
                    onClick={() => handleSelectCourse(c)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1E293B] border-[#3895D2] shadow-md ring-1 ring-[#3895D2]/50'
                        : 'bg-[#0F172A] border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#3895D2]/10 text-[#3895D2] border border-[#3895D2]/20">
                            {c.category || 'General'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {c.difficulty}
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base truncate">{c.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{c.description}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Layers size={13} className="text-[#3895D2]" />
                            {c.moduleCount || 0} Modules
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={13} className="text-[#4FB286]" />
                            {c.lessonCount || 0} Lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-[#E8A33D]" />
                            {c.estimatedHours || 0}h
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCourse(c._id, c.title)
                        }}
                        title="Delete Course"
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Curriculum Builder (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono uppercase font-bold text-slate-400 tracking-wider">
              {selectedCourse ? `Curriculum Studio: ${selectedCourse.title}` : 'Curriculum Studio'}
            </h2>
            {selectedCourse && (
              <button
                onClick={() => setShowAddModule(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#3895D2] hover:bg-[#3895D2]/90 px-3 py-1.5 rounded-lg transition-all shadow-sm"
              >
                <Plus size={14} />
                <span>Add Module</span>
              </button>
            )}
          </div>

          {!selectedCourse ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-12 text-center text-slate-400 min-h-[380px] flex flex-col items-center justify-center">
              <Layers size={48} className="text-slate-700 mb-3" />
              <p className="font-semibold text-white text-base">Select a course to edit curriculum</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Choose any course from the left panel to manage modules, author lesson markdown content, and design quizzes.
              </p>
            </div>
          ) : loadingDetails ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-[#3895D2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono">LOADING CURRICULUM TREE...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Module adding row form */}
              {showAddModule && (
                <form onSubmit={handleAddModule} className="bg-[#1E293B] border border-[#3895D2]/40 p-4 rounded-xl space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-[#3895D2]">New Module Title</span>
                    <button
                      type="button"
                      onClick={() => setShowAddModule(false)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Module 1: Introduction to Web Architecture"
                      value={newModuleTitle}
                      onChange={(e) => setNewModuleTitle(e.target.value)}
                      className="flex-1 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#3895D2]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-[#3895D2] hover:bg-[#3895D2]/90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      Save Module
                    </button>
                  </div>
                </form>
              )}

              {/* Modules list */}
              {courseDetails?.modules?.length === 0 ? (
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                  <p className="text-sm font-semibold text-white">This course has no modules yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Click "Add Module" to start structuring lessons and quizzes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {courseDetails?.modules?.map((mod, idx) => (
                    <div key={mod._id} className="bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                      {/* Module Header */}
                      <div className="p-4 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-[#3895D2]/10 text-[#3895D2] border border-[#3895D2]/30 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-white text-sm truncate">{mod.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => openAddLesson(mod)}
                            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                          >
                            <Plus size={13} />
                            <span>Lesson</span>
                          </button>
                          <button
                            onClick={() => openQuizBuilder(mod)}
                            className={`text-xs font-bold px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-colors ${
                              mod.quizId
                                ? 'bg-[#E8A33D]/10 text-[#E8A33D] hover:bg-[#E8A33D]/20 border border-[#E8A33D]/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <HelpCircle size={13} />
                            <span>{mod.quizId ? 'Edit Quiz' : '+ Quiz'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod._id, mod.title)}
                            title="Delete Module"
                            className="text-slate-500 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Module Lessons sub-list */}
                      <div className="p-3 space-y-2 bg-[#0B0F19]">
                        {mod.lessons?.length === 0 ? (
                          <p className="text-xs text-slate-500 italic px-2 py-1">No lessons in this module yet.</p>
                        ) : (
                          mod.lessons?.map((les, lIdx) => (
                            <div
                              key={les._id}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-[#0F172A] border border-slate-800/80 hover:border-slate-700 text-xs text-slate-300 group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={14} className="text-[#3895D2] flex-shrink-0" />
                                <span className="font-mono text-slate-500">{lIdx + 1}.</span>
                                <span className="font-medium text-white truncate">{les.title}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                                <button
                                  onClick={() => openEditLesson(mod, les)}
                                  className="text-slate-400 hover:text-[#3895D2] p-1 rounded hover:bg-white/5"
                                  title="Edit Lesson Content"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(mod._id, les._id, les.title)}
                                  className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-white/5"
                                  title="Delete Lesson"
                                >
                                  <Trash2 size={14} />
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
      </div>

      {/* MODAL 1: Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Course</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Full-Stack React & Next.js"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3895D2]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="A comprehensive course covering end-to-end web architecture, state management, and real-time APIs."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3895D2]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3895D2]"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Cloud Architecture">Cloud Architecture</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">Difficulty</label>
                  <select
                    value={newCourse.difficulty}
                    onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3895D2]"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">Est. Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={newCourse.estimatedHours}
                    onChange={(e) => setNewCourse({ ...newCourse, estimatedHours: Number(e.target.value) })}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3895D2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">Credits Cost</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50 (0 = Free)"
                    value={newCourse.creditsCost}
                    onChange={(e) => setNewCourse({ ...newCourse, creditsCost: Number(e.target.value) })}
                    className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3895D2]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#EA4532] hover:bg-[#EA4532]/90 transition-colors shadow-lg"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Lesson Markdown Editor */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-4xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#3895D2] uppercase">
                  {activeModuleForLesson?.title}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
                </h3>
              </div>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0">
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1">Lesson Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Understanding Asynchronous JavaScript & Promises"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#3895D2]"
                />
              </div>

              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono uppercase font-bold text-slate-300">
                    Content (Markdown Supported)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPreviewMarkdown(!previewMarkdown)}
                    className="flex items-center gap-1.5 text-xs font-mono text-[#3895D2] hover:text-white"
                  >
                    <Eye size={14} />
                    <span>{previewMarkdown ? 'Switch to Edit' : 'Live Preview'}</span>
                  </button>
                </div>

                {previewMarkdown ? (
                  <div className="flex-1 bg-[#1E293B] border border-slate-700 rounded-xl p-4 overflow-y-auto prose prose-invert max-w-none text-xs text-slate-300">
                    <pre className="whitespace-pre-wrap font-sans">{lessonForm.content}</pre>
                  </div>
                ) : (
                  <textarea
                    rows={12}
                    value={lessonForm.content}
                    onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder="# Lesson Title\n\nExplain your lesson topics here using markdown formatting..."
                    className="flex-1 w-full bg-[#1E293B] border border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#3895D2] resize-none"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#3895D2] hover:bg-[#3895D2]/90 shadow-lg"
                >
                  <Save size={14} />
                  <span>Save Lesson</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Quiz Builder */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#E8A33D] uppercase">
                  {activeModuleForQuiz?.title}
                </span>
                <h3 className="text-lg font-bold text-white">Interactive Module Quiz Builder</h3>
              </div>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="bg-[#1E293B] border border-slate-700/80 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      Question {qIdx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                      title="Remove Question"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Enter question prompt..."
                    value={q.text}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'text', e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E8A33D]"
                  />

                  <div className="space-y-2 pt-2">
                    <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                      Answer Choices (Select radio for correct answer)
                    </p>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qIdx}`}
                          checked={q.correctIndex === optIdx}
                          onChange={() => handleUpdateQuestion(qIdx, 'correctIndex', optIdx)}
                          className="w-4 h-4 text-[#4FB286] bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-slate-400 w-4">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <input
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt}
                          onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                          className="flex-1 bg-[#0F172A] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-[#4FB286]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full py-3 border border-dashed border-slate-700 hover:border-[#E8A33D] rounded-xl text-xs font-mono text-slate-300 hover:text-[#E8A33D] flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={15} />
                <span>Add Another Question</span>
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowQuizModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuiz}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#E8A33D] hover:bg-[#E8A33D]/90 shadow-lg"
              >
                <Save size={14} />
                <span>Save All Questions</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
