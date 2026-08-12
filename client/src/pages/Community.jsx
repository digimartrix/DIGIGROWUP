import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import {
  MessageSquare, ThumbsUp, Bookmark, Send, Plus, X, Search, Hash
} from 'lucide-react'

const CATEGORIES = ['Programming', 'AI', 'Career', 'Projects', 'UI/UX', 'Blockchain']

export default function Community() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCat, setNewCat] = useState('Programming')
  const [activePostComments, setActivePostComments] = useState(null) // postId
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load posts
  useEffect(() => {
    loadPosts()
  }, [filterCat])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const url = filterCat ? `/community?category=${filterCat}` : '/community'
      const res = await api.get(url)
      if (res.data?.success) setPosts(res.data.data)
    } catch (err) {
      console.error('Failed to load posts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create post
  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return

    setSubmitting(true)
    try {
      const res = await api.post('/community', {
        title: newTitle,
        content: newContent,
        category: newCat
      })
      if (res.data?.success) {
        setNewTitle('')
        setNewContent('')
        setShowCreate(false)
        loadPosts()
      }
    } catch (err) {
      alert('Failed to publish post.')
    } finally {
      setSubmitting(false)
    }
  }

  // Like post
  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/community/${postId}/like`)
      if (res.data?.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.data.likes } : p))
      }
    } catch (err) {
      console.error('Like failed:', err)
    }
  }

  // Save post
  const handleSave = async (postId) => {
    try {
      const res = await api.post(`/community/${postId}/save`)
      if (res.data?.success) {
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, savedBy: res.data.data.savedBy } : p))
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  // Comments toggle
  const toggleComments = async (postId) => {
    if (activePostComments === postId) {
      setActivePostComments(null)
      setComments([])
      return
    }

    setActivePostComments(postId)
    try {
      const res = await api.get(`/community/${postId}/comments`)
      if (res.data?.success) setComments(res.data.data)
    } catch (err) {
      console.error('Comments fetch failed:', err)
    }
  }

  // Submit comment
  const handleAddComment = async (e, postId) => {
    e.preventDefault()
    if (!commentText.trim()) return

    try {
      const res = await api.post(`/community/${postId}/comments`, { content: commentText })
      if (res.data?.success) {
        setComments(prev => [...prev, res.data.data])
        setCommentText('')
      }
    } catch (err) {
      alert('Failed to add comment.')
    }
  }

  return (
    <div className="page-enter max-w-4xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] text-[#EA4532] uppercase tracking-widest mb-1.5 font-bold">DIGICOMMUNITY</p>
          <h1 className="text-2xl font-black font-heading tracking-tight text-slate-850">
            Learner Discussions & Forums
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Discuss topics, share programming tasks, and collaborate with peers and mentors in real-time.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="self-start sm:self-center flex items-center gap-1.5 px-4 py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          <Plus size={14} />
          <span>New Discussion</span>
        </button>
      </div>

      {/* OFFICIAL WHATSAPP COMMUNITY BANNER */}
      <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                OFFICIAL GROUP
              </span>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">1,200+ Members</span>
            </div>
            <h3 className="font-heading font-bold text-slate-850 text-base mt-0.5">
              Join the DigiGrowUp WhatsApp Community
            </h3>
            <p className="text-slate-600 text-xs mt-0.5 font-medium">
              Instant doubt solving, project collaboration, hackathons, and real-time live event links.
            </p>
          </div>
        </div>

        <a
          href="https://chat.whatsapp.com/KEnB8p3DZpIH2GWnzAyY1R"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold font-heading px-5 py-3 rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 flex-shrink-0"
        >
          <span>Join WhatsApp Group</span>
          <span className="text-sm">↗</span>
        </a>
      </div>

      {/* Category Pills Filters */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
        <button
          onClick={() => setFilterCat('')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            filterCat === ''
              ? 'bg-[#EA4532] text-white border-transparent'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Topics
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              filterCat === cat
                ? 'bg-[#EA4532] text-white border-transparent'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Modal for creating post */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base">Start New Discussion</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Topic Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Help understanding React useRef vs state variables"
                  className="w-full text-slate-900 border border-slate-200 rounded px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-[#3895D2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Category</label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full text-slate-800 border border-slate-200 rounded px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-[#3895D2]"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Post Content</label>
                <textarea
                  required
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe your question or thoughts in detail..."
                  className="w-full text-slate-900 border border-slate-200 rounded px-3 py-2 text-xs md:text-sm focus:outline-none focus:border-[#3895D2] font-body"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#3895D2] hover:bg-[#2c7db5] text-white rounded text-xs font-bold transition-all shadow-3xs"
              >
                {submitting ? 'Publishing...' : 'Publish Discussion'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Feed list */}
      {loading ? (
        <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-32 rounded-xl bg-white border border-slate-200 shimmer" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <MessageSquare size={36} strokeWidth={1} className="mx-auto text-slate-350 mb-3" />
          <p className="text-slate-500 text-sm font-semibold">No discussions started in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => {
            const hasLiked = post.likes?.includes(user?.id)
            const hasSaved = post.savedBy?.includes(user?.id)
            
            return (
              <div key={post._id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs hover:shadow-sm transition-all relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 bg-[#EA4532]/10 border border-[#EA4532]/25 text-[#EA4532] rounded uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-slate-400 text-xs font-semibold font-mono">By {post.authorName}</span>
                </div>

                <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base mb-2 pr-12">{post.title}</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-5 whitespace-pre-wrap">{post.content}</p>

                {/* Post action footer bar */}
                <div className="flex items-center gap-6 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                      hasLiked ? 'text-[#EA4532]' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ThumbsUp size={13} fill={hasLiked ? 'currentColor' : 'none'} />
                    <span>{post.likes?.length || 0} Likes</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post._id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all"
                  >
                    <MessageSquare size={13} />
                    <span>Comments</span>
                  </button>

                  <button
                    onClick={() => handleSave(post._id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all ml-auto ${
                      hasSaved ? 'text-[#3895D2]' : 'text-slate-500 hover:text-[#3895D2]'
                    }`}
                  >
                    <Bookmark size={13} fill={hasSaved ? 'currentColor' : 'none'} />
                    <span>{hasSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                {/* Comments box drawer expand */}
                {activePostComments === post._id && (
                  <div className="mt-5 border-t border-slate-100 pt-5 space-y-4 bg-slate-50/50 p-4 rounded-lg border">
                    <p className="font-heading font-bold text-xs text-slate-700 mb-3 uppercase tracking-wider">Comments Feed</p>
                    
                    {comments.length === 0 ? (
                      <p className="text-slate-450 text-xs">No replies yet. Be the first to reply!</p>
                    ) : (
                      <div className="space-y-3.5 max-h-60 overflow-y-auto pr-2">
                        {comments.map((comment) => (
                          <div key={comment._id} className="bg-white border border-slate-200/60 rounded p-3 shadow-3xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-[9px] font-bold text-[#3895D2]">@{comment.authorName}</span>
                              <span className="text-slate-400 font-mono text-[9px]">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-750 text-xs font-medium leading-relaxed">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex gap-2 mt-4">
                      <input
                        type="text"
                        required
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a helpful reply..."
                        className="flex-1 text-slate-900 border border-slate-200 rounded px-3 py-2 text-xs focus:outline-none focus:border-[#3895D2]"
                      />
                      <button
                        type="submit"
                        className="px-3.5 bg-[#3895D2] text-white hover:bg-[#2c7db5] rounded flex items-center justify-center transition-colors shadow-3xs"
                      >
                        <Send size={12} />
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
