import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home, BookOpen, Brain, Layers, Terminal, Users, UserCheck,
  GraduationCap, Rocket, Trophy, CreditCard, Package,
  Calendar, Bell, User, Settings, LogOut, ShieldCheck,
  Shield, Activity, Sparkles, FolderPlus
} from 'lucide-react'

export default function Sidebar({ onOpenTutor }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const role = user?.role || 'student'

  // Dynamic Navigation Sections based on Role Isolation
  const getNavSections = () => {
    if (role === 'admin') {
      return [
        {
          title: 'GOVERNANCE & CONTROL',
          items: [
            { to: '/admin-dashboard', icon: ShieldCheck, label: 'Admin Command Center', badge: 'ADMIN' },
            { to: '/instructor-dashboard', icon: BookOpen, label: 'Instructor Studio', badge: 'PRO' },
            { to: '/explore', icon: Layers, label: 'Course Directory' },
          ]
        },
        {
          title: 'PLATFORM MONITORING',
          items: [
            { to: '/community', icon: Users, label: 'Community Forum' },
            { to: '/digicredits', icon: CreditCard, label: 'Credits Ledger' },
            { to: '/live-learning', icon: Calendar, label: 'Live Events' },
            { to: '/resource-hub', icon: Package, label: 'Resource Store' },
            { to: '/activity-center', icon: Bell, label: 'Activity Feed' },
          ]
        }
      ]
    }

    if (role === 'instructor') {
      return [
        {
          title: 'INSTRUCTOR SUITE',
          items: [
            { to: '/instructor-dashboard', icon: BookOpen, label: 'Instructor Studio', badge: 'PRO' },
            { to: '/explore', icon: Layers, label: 'Course Catalog' },
            { to: '/live-learning', icon: Calendar, label: 'Host Events & Webinars' },
          ]
        },
        {
          title: 'COLLABORATION & EARNINGS',
          items: [
            { to: '/community', icon: Users, label: 'Community Forum' },
            { to: '/mentor-connect', icon: UserCheck, label: 'Student Mentorship' },
            { to: '/resource-hub', icon: Package, label: 'Resource Hub' },
            { to: '/digicredits', icon: CreditCard, label: 'Credits & Royalties' },
            { to: '/activity-center', icon: Bell, label: 'Notifications' },
          ]
        }
      ]
    }

    if (role === 'mentor') {
      return [
        {
          title: 'MENTORSHIP PORTAL',
          items: [
            { to: '/mentor-connect', icon: UserCheck, label: 'Mentorship Requests' },
            { to: '/live-learning', icon: Calendar, label: 'Live Sessions' },
            { to: '/community', icon: Users, label: 'Community Discussions' },
            { to: '/explore', icon: BookOpen, label: 'Browse Courses' },
          ]
        },
        {
          title: 'REWARDS & WALLET',
          items: [
            { to: '/digicredits', icon: CreditCard, label: 'DigiCredits Balance' },
            { to: '/resource-hub', icon: Package, label: 'Resource Vault' },
            { to: '/activity-center', icon: Bell, label: 'Notifications' },
          ]
        }
      ]
    }

    // Default: Student / Learner Menu
    return [
      {
        title: 'LEARNING JOURNEY',
        items: [
          { to: '/dashboard', icon: Home, label: 'Dashboard' },
          { to: '/explore', icon: BookOpen, label: 'Explore Tracks' },
          { to: '/my-learning', icon: Layers, label: 'My Learning' },
          { to: '/digimentor', icon: Brain, label: 'AI Tutor', isAI: true },
        ]
      },
      {
        title: 'HANDS-ON LABS',
        items: [
          { to: '/code-arena', icon: Terminal, label: 'Practice Lab' },
          { to: '/build-lab', icon: GraduationCap, label: 'Project Studio' },
          { to: '/mentor-connect', icon: UserCheck, label: 'Mentor Connect' },
          { to: '/live-learning', icon: Calendar, label: 'Live Events' },
        ]
      },
      {
        title: 'COMMUNITY & REWARDS',
        items: [
          { to: '/community', icon: Users, label: 'Community' },
          { to: '/career-launchpad', icon: Rocket, label: 'Career Launchpad' },
          { to: '/achievement-vault', icon: Trophy, label: 'Achievements' },
          { to: '/resource-hub', icon: Package, label: 'Resource Hub' },
          { to: '/digicredits', icon: CreditCard, label: 'DigiCredits' },
          { to: '/activity-center', icon: Bell, label: 'Notifications' },
        ]
      }
    ]
  }

  const sections = getNavSections()

  return (
    <aside className="w-[280px] flex-shrink-0 flex flex-col bg-[#0F172A] h-screen sticky top-0 text-white z-20 shadow-xl border-r border-slate-800">
      
      {/* Brand logo container - DigiGrowUp branding */}
      <div className="px-5 h-[76px] flex-shrink-0 border-b border-white/10 flex items-center bg-[#0B0F19] gap-3">
        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 bg-white shadow-sm">
          <img
            src="/favicon_circle.png"
            alt="Digimartrix Logo"
            className="w-full h-full object-contain p-0.5"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '🎯';
            }}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-heading font-black text-[16px] tracking-wide leading-none select-none">
            <span className="text-[#3895D2]">DIGI</span>
            <span className="text-[#EA4532]">GROWUP</span>
          </span>
          <span className="text-white/60 font-mono tracking-widest text-[7.5px] leading-none mt-1 font-bold truncate">
            {role.toUpperCase()} • WORKSPACE
          </span>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin">
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1.5">
            <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest px-3 mb-2 font-bold">
              {sec.title}
            </p>
            {sec.items.map(({ to, icon: Icon, label, isAI, badge }) => {
              return isAI ? (
                <button
                  key={to}
                  onClick={onOpenTutor}
                  className="w-full flex items-center gap-3.5 px-3 py-2 rounded text-sm font-bold text-white/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-150 group text-left"
                >
                  <Icon size={16} strokeWidth={1.5} className="text-white/60 group-hover:text-[#EA4532]" />
                  <span className="font-body text-[13px]">{label}</span>
                  <span className="ml-auto text-[8px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                    AI
                  </span>
                </button>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-3 py-2 rounded text-sm font-bold transition-all duration-150 group border ${
                      isActive
                        ? role === 'admin'
                          ? 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#EA4532] shadow-sm'
                          : role === 'instructor'
                          ? 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#E8A33D] shadow-sm'
                          : 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#3895D2] shadow-sm'
                        : 'text-white/80 hover:text-white hover:bg-white/5 border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        className={
                          isActive
                            ? role === 'admin'
                              ? 'text-[#EA4532]'
                              : role === 'instructor'
                              ? 'text-[#E8A33D]'
                              : 'text-[#3895D2]'
                            : 'text-white/60 group-hover:text-white'
                        }
                      />
                      <span className="font-body text-[13px] truncate">{label}</span>
                      {badge && (
                        <span className={`ml-auto text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                          badge === 'ADMIN' ? 'text-rose-300 bg-rose-500/20' : 'text-amber-300 bg-amber-500/20'
                        }`}>
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}

        {/* Profile & System Section */}
        <div className="pt-4 border-t border-white/10 space-y-1.5">
          <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest px-3 mb-2 font-bold">
            ACCOUNT & SETTINGS
          </p>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2 rounded text-sm font-bold transition-all duration-150 group border ${
                isActive ? 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#3895D2] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/5 border-transparent'
              }`
            }
          >
            <User size={16} strokeWidth={1.5} className="text-white/60 group-hover:text-white" />
            <span className="font-body text-[13px]">
              {role === 'admin' ? 'Administrator Profile' : role === 'instructor' ? 'Instructor Profile' : 'Learner Profile'}
            </span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2 rounded text-sm font-bold transition-all duration-150 group border ${
                isActive ? 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#3895D2] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/5 border-transparent'
              }`
            }
          >
            <Settings size={16} strokeWidth={1.5} className="text-white/60 group-hover:text-white" />
            <span className="font-body text-[13px]">System Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* User info & Sign out */}
      <div className="px-4 py-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate leading-none mb-1">{user?.name || 'User'}</p>
            <p className="text-white/40 font-mono flex items-center gap-1.5" style={{ fontSize: '9px' }}>
              <span className={`px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                role === 'admin'
                  ? 'text-[#EA4532] bg-[#EA4532]/20 border border-[#EA4532]/30'
                  : role === 'instructor'
                  ? 'text-[#E8A33D] bg-[#E8A33D]/20 border border-[#E8A33D]/30'
                  : role === 'mentor'
                  ? 'text-[#8B5CF6] bg-[#8B5CF6]/20 border border-[#8B5CF6]/30'
                  : 'text-[#3895D2] bg-[#3895D2]/20 border border-[#3895D2]/30'
              }`}>
                {role}
              </span>
              <span>PORTAL</span>
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded text-xs text-white/80 hover:text-white hover:bg-white/5 transition-all duration-150 font-bold"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
