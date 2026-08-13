import { useState, useEffect } from 'react'
import api from '../lib/api'
import {
  BookOpen, Plus, Trash2, Edit3, ChevronDown, ChevronRight,
  FileText, HelpCircle, Layers, CheckCircle2, AlertCircle, Save,
  Eye, Sparkles, Clock, BarChart2, ShieldAlert, Video, Download,
  Code, Calendar, ExternalLink, X, PlusCircle, Users
} from 'lucide-react'

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('courses') // 'courses' | 'events' | 'resources' | 'projects'
  
  // Courses state
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    difficulty: 'Beginner',
    estimatedHours: 8,
    creditsCost: 50,
  })

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseDetails, setCourseDetails] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
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

  // Events state
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '2026-08-20',
    time: '04:00 PM - 05:30 PM IST',
    mentor: '',
    capacity: 50,
    type: 'Workshop',
    creditsCost: 0
  })

  // Resources state
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [showCreateResourceModal, setShowCreateResourceModal] = useState(false)
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'Cheatsheet',
    downloadUrl: '',
    creditsCost: 0
  })

  // Projects state
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '',
    problemStatement: '',
    difficulty: 'Beginner',
    requiredSkills: 'React, Node.js, TailwindCSS',
    technology: 'JavaScript, Vite, MongoDB'
  })

  useEffect(() => {
    fetchInstructorCourses()
    fetchEvents()
    fetchResources()
    fetchProjects()
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

  // ─── COURSES LOGIC ─────────────────────────────────────────
  const fetchInstructorCourses = async () => {
    setLoading(true)
    try {
      const res = await api.get('/instructor/courses')
      const list = res.data || []
      setCourses(list)
      if (list.length > 0) {
        handleSelectCourse(list[0])
      } else {
        setSelectedCourse(null)
        setCourseDetails(null)
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load courses.', true)
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
        estimatedHours: 8,
        creditsCost: 50
      })
      fetchInstructorCourses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create course.', true)
    }
  }

  const handleDeleteCourse = async (courseId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return
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
      showToast('Failed to load course details.', true)
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
    if (!window.confirm(`Delete module "${title}" and all its lessons?`)) return
    try {
      await api.delete(`/instructor/modules/${moduleId}`)
      showToast(`Deleted module "${title}".`)
      handleSelectCourse(selectedCourse)
      fetchInstructorCourses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete module.', true)
    }
  }

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
    setLessonForm({ title: lesson.title, content: lesson.content || '' })
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

  const openQuizBuilder = async (module) => {
    setActiveModuleForQuiz(module)
    try {
      if (module.quizId) {
        const res = await api.get(`/quizzes/${module.quizId}`)
        setQuizQuestions(res.data?.questions || [])
      } else {
        setQuizQuestions([
          {
            text: 'What is the primary concept of this module?',
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
      showToast('A quiz must have at least 1 question.', true)
      return
    }
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index))
  }

  const handleSaveQuiz = async () => {
    if (!activeModuleForQuiz) return
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
      await api.post(`/instructor/modules/${activeModuleForQuiz._id}/quiz`, { questions: quizQuestions })
      showToast(`Quiz saved with ${quizQuestions.length} questions!`)
      setShowQuizModal(false)
      handleSelectCourse(selectedCourse)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save quiz.', true)
    }
  }

  // ─── EVENTS LOGIC ──────────────────────────────────────────
  const fetchEvents = async () => {
    setLoadingEvents(true)
    try {
      const res = await api.get('/instructor/events')
      setEvents(res.data || [])
    } catch (err) {
      console.warn('Failed to load events:', err)
    } finally {
      setLoadingEvents(false)
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.description) {
      showToast('Event title and description are required.', true)
      return
    }
    try {
      await api.post('/instructor/events', newEvent)
      showToast(`Live event "${newEvent.title}" published!`)
      setShowCreateEventModal(false)
      setNewEvent({
        title: '',
        description: '',
        date: '2026-08-20',
        time: '04:00 PM - 05:30 PM IST',
        mentor: '',
        capacity: 50,
        type: 'Workshop',
        creditsCost: 0
      })
      fetchEvents()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create event.', true)
    }
  }

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Delete live event "${title}"?`)) return
    try {
      await api.delete(`/instructor/events/${id}`)
      showToast(`Deleted event "${title}".`)
      fetchEvents()
    } catch (err) {
      showToast('Failed to delete event.', true)
    }
  }

  // ─── RESOURCES LOGIC ───────────────────────────────────────
  const fetchResources = async () => {
    setLoadingResources(true)
    try {
      const res = await api.get('/instructor/resources')
      setResources(res.data || [])
    } catch (err) {
      console.warn('Failed to load resources:', err)
    } finally {
      setLoadingResources(false)
    }
  }

  const handleCreateResource = async (e) => {
    e.preventDefault()
    if (!newResource.title) {
      showToast('Resource title is required.', true)
      return
    }
    try {
      await api.post('/instructor/resources', newResource)
      showToast(`Resource "${newResource.title}" published!`)
      setShowCreateResourceModal(false)
      setNewResource({
        title: '',
        description: '',
        type: 'Cheatsheet',
        downloadUrl: '',
        creditsCost: 0
      })
      fetchResources()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to publish resource.', true)
    }
  }

  const handleDeleteResource = async (id, title) => {
    if (!window.confirm(`Delete resource "${title}"?`)) return
    try {
      await api.delete(`/instructor/resources/${id}`)
      showToast(`Deleted resource "${title}".`)
      fetchResources()
    } catch (err) {
      showToast('Failed to delete resource.', true)
    }
  }

  // ─── PROJECTS LOGIC ────────────────────────────────────────
  const fetchProjects = async () => {
    setLoadingProjects(true)
    try {
      const res = await api.get('/instructor/projects')
      setProjects(res.data || [])
    } catch (err) {
      console.warn('Failed to load projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProject.title || !newProject.problemStatement) {
      showToast('Project title and problem statement are required.', true)
      return
    }
    try {
      await api.post('/instructor/projects', newProject)
      showToast(`Project challenge "${newProject.title}" published!`)
      setShowCreateProjectModal(false)
      setNewProject({
        title: '',
        problemStatement: '',
        difficulty: 'Beginner',
        requiredSkills: 'React, Node.js, TailwindCSS',
        technology: 'JavaScript, Vite, MongoDB'
      })
      fetchProjects()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create project.', true)
    }
  }

  const handleDeleteProject = async (id, title) => {
    if (!window.confirm(`Delete project challenge "${title}"?`)) return
    try {
      await api.delete(`/instructor/projects/${id}`)
      showToast(`Deleted project "${title}".`)
      fetchProjects()
    } catch (err) {
      showToast('Failed to delete project.', true)
    }
  }

  return (
    <div className="page-enter max-w-7xl mx-auto space-y-6 pb-16">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#3895D2] font-bold uppercase mb-2">
              <Sparkles size={14} />
              <span>TEACHER & INSTRUCTOR COMMAND STUDIO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white">
              Curriculum, Events & Assets Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl font-medium">
              Publish courses, schedule live workshops, share educational cheat sheets, and author hands-on project challenges.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {activeTab === 'courses' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-[#EA4532] hover:bg-[#EA4532]/90 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Plus size={16} />
                <span>Create New Course</span>
              </button>
            )}
            {activeTab === 'events' && (
              <button
                onClick={() => setShowCreateEventModal(true)}
                className="flex items-center gap-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Plus size={16} />
                <span>Publish Live Event</span>
              </button>
            )}
            {activeTab === 'resources' && (
              <button
                onClick={() => setShowCreateResourceModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Plus size={16} />
                <span>Upload Resource</span>
              </button>
            )}
            {activeTab === 'projects' && (
              <button
                onClick={() => setShowCreateProjectModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Plus size={16} />
                <span>Create Project Challenge</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'courses', label: `Courses (${courses.length})`, icon: BookOpen },
          { id: 'events', label: `Live Events (${events.length})`, icon: Video },
          { id: 'resources', label: `Resource Hub (${resources.length})`, icon: Download },
          { id: 'projects', label: `Build Lab Projects (${projects.length})`, icon: Code }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4.5 py-2 rounded-xl text-xs md:text-sm font-bold font-heading transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: COURSES */}
      {activeTab === 'courses' && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-3">
                {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}
              </div>
              <div className="lg:col-span-7 h-80 bg-slate-100 rounded-2xl animate-pulse" />
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-14 text-center shadow-xs space-y-6 max-w-3xl mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 text-[#3895D2] flex items-center justify-center mx-auto shadow-inner">
                <BookOpen size={40} />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 font-heading tracking-tight">
                  Author Your First Interactive Course
                </h3>
                <p className="text-slate-600 text-xs md:text-sm font-medium leading-relaxed">
                  Create structured curriculums with modules, markdown lessons, code snippets, and auto-graded assessments. Earn 80% royalties on student enrollments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black text-[#3895D2] font-mono uppercase tracking-wider">STEP 01</span>
                  <h4 className="font-heading font-black text-slate-900 text-sm mt-1">Course Setup</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Define title, category, and credit price.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black text-emerald-600 font-mono uppercase tracking-wider">STEP 02</span>
                  <h4 className="font-heading font-black text-slate-900 text-sm mt-1">Lessons & Code</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Add curriculum with markdown & quizzes.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-black text-amber-600 font-mono uppercase tracking-wider">STEP 03</span>
                  <h4 className="font-heading font-black text-slate-900 text-sm mt-1">Live Publish</h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Available immediately on Explore tracks.</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#EA4532] hover:bg-[#EA4532]/90 text-white rounded-xl text-xs md:text-sm font-bold font-heading transition-all shadow-md hover:shadow-lg"
              >
                <Plus size={16} />
                <span>Create New Course Track</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Courses list (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-mono uppercase font-bold text-slate-500 tracking-wider">
                    Your Published Courses ({courses.length})
                  </h2>
                </div>

                <div className="space-y-3.5">
                  {courses.map(c => {
                    const isSelected = selectedCourse?._id === c._id
                    return (
                      <div
                        key={c._id}
                        onClick={() => handleSelectCourse(c)}
                        className={`bg-white border rounded-2xl p-5 cursor-pointer transition-all shadow-2xs hover:shadow-xs ${
                          isSelected ? 'border-[#3895D2] ring-2 ring-[#3895D2]/20 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            {c.category} · {c.difficulty}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCourse(c._id, c.title)
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <h3 className="font-heading font-black text-slate-900 text-base mb-1.5">{c.title}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2 font-medium mb-3.5 leading-relaxed">{c.description}</p>
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 pt-3 border-t border-slate-100">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Layers size={14} className="text-[#3895D2]" />
                            <span>{c.moduleCount || 0} Modules</span>
                          </span>
                          <span className="bg-[#3895D2]/10 text-[#3895D2] border border-[#3895D2]/20 px-2.5 py-0.5 rounded-md font-black">
                            {c.creditsCost || 0} Credits
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Curriculum Builder (7 cols) */}
              <div className="lg:col-span-7">
                {selectedCourse ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#3895D2] uppercase tracking-wider">CURRICULUM BUILDER</span>
                        <h3 className="font-heading font-black text-slate-900 text-xl">{selectedCourse.title}</h3>
                      </div>
                      <button
                        onClick={() => setShowAddModule(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                      >
                        <Plus size={14} />
                        <span>Add Module</span>
                      </button>
                    </div>

                    {showAddModule && (
                      <form onSubmit={handleAddModule} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-fade-in">
                        <label className="text-xs font-bold text-slate-700">Module Title</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. Module 1: Introduction to Web Architecture"
                            value={newModuleTitle}
                            onChange={e => setNewModuleTitle(e.target.value)}
                            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3895D2]"
                            autoFocus
                          />
                          <button type="submit" className="px-4 py-2 bg-[#3895D2] text-white text-xs font-bold rounded-xl">Save</button>
                        </div>
                      </form>
                    )}

                    {/* Modules List */}
                    {courseDetails?.modules?.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
                        <Layers size={28} className="text-slate-400 mx-auto" />
                        <p className="text-sm font-bold text-slate-800">No modules added to this course yet.</p>
                        <p className="text-xs text-slate-500">Click "Add Module" above to start adding lessons and quizzes.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {courseDetails?.modules?.map((mod, idx) => (
                          <div key={mod._id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-800">Module {idx + 1}: {mod.title}</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => openAddLesson(mod)} className="text-xs font-bold text-[#3895D2] hover:underline">+ Lesson</button>
                                <button onClick={() => openQuizBuilder(mod)} className="text-xs font-bold text-amber-600 hover:underline">+ Quiz</button>
                                <button onClick={() => handleDeleteModule(mod._id, mod.title)} className="text-slate-400 hover:text-rose-600"><Trash2 size={13} /></button>
                              </div>
                            </div>
                            <div className="p-4 space-y-2">
                              {mod.lessons?.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No lessons yet. Click "+ Lesson" to author markdown content.</p>
                              ) : (
                                mod.lessons?.map((les) => (
                                  <div key={les._id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 text-xs font-medium">
                                    <span className="text-slate-700 font-semibold">{les.title}</span>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => openEditLesson(mod, les)} className="text-slate-500 hover:text-slate-900"><Edit3 size={13} /></button>
                                      <button onClick={() => handleDeleteLesson(mod._id, les._id, les.title)} className="text-slate-400 hover:text-rose-600"><Trash2 size={13} /></button>
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
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-2xs space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#3895D2] flex items-center justify-center mx-auto">
                      <Layers size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 font-heading">Course Curriculum Editor</h4>
                      <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 font-medium leading-relaxed">
                        Select a course from the list on the left to structure its modules, write markdown lessons with interactive code snippets, and build auto-graded assessment quizzes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: LIVE EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">Published Live Events & Workshops ({events.length})</h3>
              <p className="text-xs text-slate-600 font-medium">All sessions are instantly synced and broadcast to student masterclass schedules.</p>
            </div>
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#3895D2] hover:bg-[#2c7db5] text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus size={14} />
              <span>Schedule Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {events.map((e) => (
              <div key={e._id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-black tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-0.5 rounded-full uppercase">
                      ● {e.type || 'Workshop'}
                    </span>
                    <button
                      onClick={() => handleDeleteEvent(e._id, e.title)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h4 className="font-heading font-black text-slate-900 text-base mb-2">{e.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 font-medium mb-4 leading-relaxed">{e.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-slate-700">📅 {e.date} · ⏰ {e.time}</span>
                  <span className="text-[#3895D2]">👥 {e.capacity} Seats</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">Published Educational Resources ({resources.length})</h3>
              <p className="text-xs text-slate-600 font-medium">Cheat sheets, architectural maps, starter templates, and code banks.</p>
            </div>
            <button
              onClick={() => setShowCreateResourceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus size={14} />
              <span>Upload Resource</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {resources.map((r) => (
              <div key={r._id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-black tracking-wider text-purple-800 bg-purple-100 border border-purple-200 px-3 py-0.5 rounded-full uppercase">
                      📄 {r.type || 'Cheatsheet'}
                    </span>
                    <button
                      onClick={() => handleDeleteResource(r._id, r.title)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h4 className="font-heading font-black text-slate-900 text-base mb-2">{r.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 font-medium mb-4 leading-relaxed">{r.description || 'Verified engineering learning asset.'}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-slate-500">🔗 {r.downloadUrl ? 'Direct Link Ready' : 'In-App Preview'}</span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md font-black">
                    {r.creditsCost === 0 ? 'FREE' : `${r.creditsCost} Credits`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-slate-900 text-lg">Build Lab Project Challenges ({projects.length})</h3>
              <p className="text-xs text-slate-600 font-medium">Real-world projects for students to implement and submit code repositories.</p>
            </div>
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <Plus size={14} />
              <span>Create Project</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((p) => (
              <div key={p._id} className="border border-slate-200 rounded-2xl p-5 bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-black tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-3 py-0.5 rounded-full uppercase">
                      🎯 {p.difficulty || 'Beginner'}
                    </span>
                    <button
                      onClick={() => handleDeleteProject(p._id, p.title)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <h4 className="font-heading font-black text-slate-900 text-base mb-2">{p.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 font-medium mb-4 leading-relaxed">{p.problemStatement}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="text-slate-600 truncate max-w-[240px]">
                    Skills: {Array.isArray(p.requiredSkills) ? p.requiredSkills.join(', ') : p.requiredSkills}
                  </span>
                  <span className="text-purple-600 font-black">+50 XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE COURSE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateCourse} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-slate-900 text-lg">Author New Course</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Course Title</label>
              <input type="text" required value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea rows={3} required value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} className="w-full border rounded-xl p-3 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                <select value={newCourse.difficulty} onChange={e => setNewCourse({ ...newCourse, difficulty: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Credits Unlock Cost</label>
                <input type="number" value={newCourse.creditsCost} onChange={e => setNewCourse({ ...newCourse, creditsCost: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#EA4532] text-white rounded-xl text-xs font-bold">Create Course</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: CREATE LIVE EVENT */}
      {showCreateEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateEvent} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-slate-900 text-lg">Schedule Live Event</h3>
              <button type="button" onClick={() => setShowCreateEventModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Title</label>
              <input type="text" required value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea rows={3} required value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} className="w-full border rounded-xl p-3 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time (e.g. 04:00 PM IST)</label>
                <input type="text" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateEventModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#3895D2] text-white rounded-xl text-xs font-bold">Publish Event</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: CREATE RESOURCE */}
      {showCreateResourceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateResource} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-slate-900 text-lg">Publish Educational Resource</h3>
              <button type="button" onClick={() => setShowCreateResourceModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title</label>
              <input type="text" required value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description / Summary</label>
              <textarea rows={3} value={newResource.description} onChange={e => setNewResource({ ...newResource, description: e.target.value })} className="w-full border rounded-xl p-3 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                <select value={newResource.type} onChange={e => setNewResource({ ...newResource, type: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs">
                  <option value="Cheatsheet">Cheat Sheet</option>
                  <option value="PDF">PDF Guide</option>
                  <option value="Template">Starter Template</option>
                  <option value="Code">Code Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Credits Cost (0 = Free)</label>
                <input type="number" value={newResource.creditsCost} onChange={e => setNewResource({ ...newResource, creditsCost: Number(e.target.value) })} className="w-full border rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateResourceModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Publish Resource</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: CREATE PROJECT */}
      {showCreateProjectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateProject} className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-slate-900 text-lg">Author Project Challenge</h3>
              <button type="button" onClick={() => setShowCreateProjectModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Title</label>
              <input type="text" required value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Problem Statement</label>
              <textarea rows={3} required value={newProject.problemStatement} onChange={e => setNewProject({ ...newProject, problemStatement: e.target.value })} className="w-full border rounded-xl p-3 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                <select value={newProject.difficulty} onChange={e => setNewProject({ ...newProject, difficulty: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                <input type="text" value={newProject.requiredSkills} onChange={e => setNewProject({ ...newProject, requiredSkills: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreateProjectModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">Publish Project</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 5: LESSON MODAL */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveLesson} className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-bold text-slate-900 text-lg">Author Lesson</h3>
              <button type="button" onClick={() => setShowLessonModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lesson Title</label>
              <input type="text" required value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Markdown Lesson Content</label>
              <textarea rows={8} required value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} className="w-full border rounded-xl p-3 text-xs font-mono" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowLessonModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button type="submit" className="px-5 py-2 bg-[#3895D2] text-white rounded-xl text-xs font-bold">Save Lesson</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: QUIZ MODAL */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-4 max-h-[85vh] flex flex-col animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-heading font-bold text-slate-900 text-lg">Quiz Authoring Builder</h3>
              <button type="button" onClick={() => setShowQuizModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 border rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700">Question {qIdx + 1}</span>
                    <button onClick={() => handleRemoveQuestion(qIdx)} className="text-rose-500 text-xs">Remove</button>
                  </div>
                  <input type="text" placeholder="Question prompt..." value={q.text} onChange={e => handleUpdateQuestion(qIdx, 'text', e.target.value)} className="w-full border rounded-lg px-3 py-1.5 text-xs" />
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-1.5">
                        <input type="radio" name={`correct-${qIdx}`} checked={q.correctIndex === oIdx} onChange={() => handleUpdateQuestion(qIdx, 'correctIndex', oIdx)} />
                        <input type="text" placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => handleUpdateOption(qIdx, oIdx, e.target.value)} className="w-full border rounded px-2 py-1 text-xs" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={handleAddQuestion} className="w-full py-2 border-2 border-dashed rounded-xl text-xs font-bold text-[#3895D2] hover:bg-[#3895D2]/5">+ Add Question</button>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setShowQuizModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={handleSaveQuiz} className="px-5 py-2 bg-[#3895D2] text-white rounded-xl text-xs font-bold">Save Complete Quiz</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
