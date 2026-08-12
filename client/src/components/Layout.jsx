import { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import AITutorPanel from './AITutorPanel'
import { Bell, Trophy, Brain } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import Lottie from 'lottie-react'

import { playLoudClearVoice } from '../lib/speech'

export default function Layout() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [tutorOpen, setTutorOpen] = useState(false)
  const [credits, setCredits] = useState(245)
  const [pageTitle, setPageTitle] = useState('Learning Command Center')
  const [roboData, setRoboData] = useState(null)

  // Fetch Lottie JSON dynamically from public asset
  useEffect(() => {
    fetch('/DIGIMARTRIX_Robo.json')
      .then((res) => res.json())
      .then((data) => setRoboData(data))
      .catch((err) => console.error('Failed to load Lottie Robo animation:', err))
  }, [])

  // Web Speech Synthesis welcome trigger when dashboard loads / user logs in
  useEffect(() => {
    if (user?.name && !sessionStorage.getItem('hasWelcomed')) {
      const timeout = setTimeout(() => {
        const userName = user.name.split(' ')[0]
        playLoudClearVoice(`Welcome to DigiGrowUp, ${userName}! Your learning workspace is ready.`)
        sessionStorage.setItem('hasWelcomed', 'true')
      }, 800)
      return () => clearTimeout(timeout)
    }
  }, [user])

  // Derive page title from route
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/dashboard')) setPageTitle('Dashboard')
    else if (path.includes('/explore')) setPageTitle('Explore')
    else if (path.includes('/my-learning')) setPageTitle('My Learning')
    else if (path.includes('/build-lab')) setPageTitle('Projects')
    else if (path.includes('/code-arena')) setPageTitle('Practice Lab')
    else if (path.includes('/mentor-connect')) setPageTitle('Mentors')
    else if (path.includes('/community')) setPageTitle('Community')
    else if (path.includes('/live-learning')) setPageTitle('Events')
    else if (path.includes('/career-launchpad')) setPageTitle('Career Hub')
    else if (path.includes('/achievement-vault')) setPageTitle('Achievements')
    else if (path.includes('/digicredits')) setPageTitle('Credits')
    else if (path.includes('/resource-hub')) setPageTitle('Resources')
    else if (path.includes('/activity-center')) setPageTitle('Notifications')
    else if (path.includes('/profile')) setPageTitle('Profile')
    else if (path.includes('/settings')) setPageTitle('Settings')
    else if (path.includes('/lesson')) setPageTitle('Lesson View')
    else if (path.includes('/quiz')) setPageTitle('Assessment')
    else if (path.includes('/instructor-dashboard')) setPageTitle('Instructor Studio')
    else if (path.includes('/admin-dashboard')) setPageTitle('Admin Dashboard')
  }, [location])

  // Fetch credits on user mount and route navigation
  useEffect(() => {
    if (user?.id) {
      api.get('/credits/balance')
        .then((res) => {
          if (res.data?.success) {
            setCredits(res.data.balance)
          }
        })
        .catch(() => {})
    }
  }, [user, location.pathname])

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-body text-slate-900 relative">
      {/* Sidebar Navigation */}
      <Sidebar onOpenTutor={() => setTutorOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Common Shared Header (Aligned to matching h-[76px] height with black background) */}
        <header className="bg-[#0F172A] text-white h-[76px] px-6 flex items-center justify-between flex-shrink-0 z-10 shadow-md border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h1 className="text-base md:text-lg font-heading font-black text-white tracking-wider uppercase">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* DigiCredits badge */}
            <button
              onClick={() => navigate('/digicredits')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-full transition-all"
            >
              <Trophy size={13} className="text-[#3895D2]" />
              <span className="font-mono text-xs font-bold text-white">{credits} Credits</span>
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/activity-center')}
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-all relative"
            >
              <Bell size={14} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EA4532]" />
            </button>

            {/* DigiMentor Quick Access */}
            <button
              onClick={() => setTutorOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#3895D2] text-white hover:bg-opacity-90 rounded text-xs font-bold transition-all shadow-3xs"
            >
              <Brain size={13} />
              DigiMentor
            </button>
          </div>
        </header>

        {/* Dynamic Route Outlet Container with clean spacing and top padding to prevent header overlaps */}
        <div className="flex-1 overflow-y-auto p-8 pt-8">
          <Outlet context={{ onOpenTutor: () => setTutorOpen(true) }} />
        </div>
      </div>

      {/* Global DigiMentor Chat Drawer */}
      <AITutorPanel isOpen={tutorOpen} onClose={() => setTutorOpen(false)} />

      {/* Floating Lottie Robot chatbot widget (Bigger size: w-[140px] h-[140px]) */}
      {roboData && (
        <div 
          onClick={() => setTutorOpen(!tutorOpen)}
          className="fixed bottom-6 right-6 z-40 w-[140px] h-[140px] cursor-pointer hover:scale-105 active:scale-95 transition-transform drop-shadow-2xl flex items-center justify-center bg-white/5 backdrop-blur-xs rounded-full border border-white/5"
          title="Click to talk with DigiMentor"
        >
          <Lottie 
            animationData={roboData} 
            loop={true} 
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  )
}
