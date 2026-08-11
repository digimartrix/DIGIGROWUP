import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Home, BookOpen, Brain, Target, Layers, Terminal, Users, UserCheck,
  GraduationCap, Rocket, Briefcase, Trophy, CreditCard, Package,
  Calendar, Bell, User, Settings, LogOut, ShieldCheck
} from 'lucide-react'

const navItems = [
  { to: '/dashboard',          icon: Home,          label: 'Dashboard' },
  { to: '/explore',            icon: BookOpen,      label: 'Explore' },
  { to: '/my-learning',        icon: Layers,        label: 'My Learning' },
  { to: '/digimentor',         icon: Brain,         label: 'AI Tutor' },
  { to: '/code-arena',         icon: Terminal,      label: 'Practice Lab' },
  { to: '/build-lab',          icon: GraduationCap, label: 'Projects' },
  { to: '/mentor-connect',     icon: UserCheck,     label: 'Mentors' },
  { to: '/community',          icon: Users,         label: 'Community' },
  { to: '/live-learning',      icon: Calendar,      label: 'Events' },
  { to: '/career-launchpad',   icon: Rocket,        label: 'Career Hub' },
  { to: '/achievement-vault',  icon: Trophy,        label: 'Achievements' },
  { to: '/resource-hub',       icon: Package,       label: 'Resources' },
  { to: '/activity-center',    icon: Bell,          label: 'Notifications' },
  { to: '/digicredits',        icon: CreditCard,    label: 'Credits' },
]

export default function Sidebar({ onOpenTutor }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
            LEARN • GROW • PROGRESS
          </span>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 scrollbar-thin">
        <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest px-3 mb-2 font-bold">MAIN NAVIGATION</p>
        
        {navItems.map(({ to, icon: Icon, label }) => {
          const isAITutor = to === '/digimentor';
          
          return isAITutor ? (
            <button
              key={to}
              onClick={onOpenTutor}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded text-sm font-bold text-white/80 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-150 group text-left"
            >
              <Icon size={17} strokeWidth={1.5} className="text-white/60 group-hover:text-[#EA4532]" />
              <span className="font-body text-[13.5px]">{label}</span>
              <span className="ml-auto text-[8px] font-mono text-white bg-white/20 px-1.5 py-0.5 rounded uppercase">AI</span>
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3 py-2.5 rounded text-sm font-bold transition-all duration-150 group border ${
                  isActive
                    ? 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#EA4532] shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/5 border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={17}
                    strokeWidth={1.5}
                    className={isActive ? 'text-[#EA4532]' : 'text-white/60 group-hover:text-[#EA4532]'}
                  />
                  <span className="font-body text-[13.5px]">{label}</span>
                </>
              )}
            </NavLink>
          )
        })}



        <div className="pt-4 border-t border-white/10 mt-5 space-y-1.5">
          <p className="text-white/40 font-mono text-[9px] uppercase tracking-widest px-3 mb-2 font-bold">PROFILE & SYSTEM</p>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2.5 rounded text-sm font-bold transition-all duration-150 group border ${
                isActive ? 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#EA4532] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/5 border-transparent'
              }`
            }
          >
            <User size={17} strokeWidth={1.5} className="text-white/60 group-hover:text-[#EA4532]" />
            <span className="font-body text-[13.5px]">Learner Profile</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-3 py-2.5 rounded text-sm font-bold transition-all duration-150 group border ${
                isActive ? 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#EA4532] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/5 border-transparent'
              }`
            }
          >
            <Settings size={17} strokeWidth={1.5} className="text-white/60 group-hover:text-[#EA4532]" />
            <span className="font-body text-[13.5px]">Settings</span>
          </NavLink>
          {/* Admin Dashboard Entry (Visible only to authenticated Administrators) */}
          {user && user.role === 'admin' && (
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3 py-2.5 rounded text-sm font-bold transition-all duration-150 group border ${
                  isActive ? 'bg-white/10 text-white border-white/10 border-l-4 border-l-[#EA4532] shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/5 border-transparent'
                }`
              }
            >
              <ShieldCheck size={17} strokeWidth={1.5} className="text-white/60 group-hover:text-[#EA4532]" />
              <span className="font-body text-[13.5px]">Admin Dashboard</span>
            </NavLink>
          )}
        </div>
      </nav>

      {/* User info & Sign out */}
      <div className="px-4 py-4 border-t border-white/10 bg-black/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
            <span className="font-mono text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate leading-none mb-1">{user?.name || 'Student'}</p>
            <p className="text-white/40 font-mono" style={{ fontSize: '9px' }}>LEARNER ID</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-3 py-2 rounded text-xs text-white/80 hover:text-white hover:bg-white/5 transition-all duration-150 font-bold"
        >
          <LogOut size={17} strokeWidth={1.5} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
