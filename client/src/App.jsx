import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import Lesson from './pages/Lesson'
import Quiz from './pages/Quiz'
import BuildLab from './pages/BuildLab'
import CodeArena from './pages/CodeArena'
import MentorConnect from './pages/MentorConnect'
import OpportunityHub from './pages/OpportunityHub'
import CareerLaunchpad from './pages/CareerLaunchpad'
import AchievementVault from './pages/AchievementVault'
import DigiCredits from './pages/DigiCredits'
import ResourceHub from './pages/ResourceHub'
import LiveLearning from './pages/LiveLearning'
import ActivityCenter from './pages/ActivityCenter'
import LearnerProfile from './pages/LearnerProfile'
import Settings from './pages/Settings'
import SkillGrowth from './pages/SkillGrowth'
import NotFound from './pages/NotFound'
import MyLearning from './pages/MyLearning'
import Community from './pages/Community'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-brandBlue border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-mono text-xs">INITIALIZING ECOSYSTEM...</span>
      </div>
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          
          {/* Main App Layout Wrapper with nested routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/build-lab" element={<BuildLab />} />
            <Route path="/code-arena" element={<CodeArena />} />
            <Route path="/mentor-connect" element={<MentorConnect />} />
            <Route path="/opportunity-hub" element={<OpportunityHub />} />
            <Route path="/career-launchpad" element={<CareerLaunchpad />} />
            <Route path="/achievement-vault" element={<AchievementVault />} />
            <Route path="/digicredits" element={<DigiCredits />} />
            <Route path="/resource-hub" element={<ResourceHub />} />
            <Route path="/live-learning" element={<LiveLearning />} />
            <Route path="/activity-center" element={<ActivityCenter />} />
            <Route path="/profile" element={<LearnerProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/skill-growth" element={<SkillGrowth />} />
            
            <Route path="/my-learning" element={<MyLearning />} />
            <Route path="/community" element={<Community />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            
            <Route path="/lesson/:id" element={<Lesson />} />
            <Route path="/quiz/:id" element={<Quiz />} />
          </Route>
          
          {/* Backwards-compatibility fallback redirect routes */}
          <Route path="/knowledge-network" element={<Navigate to="/dashboard" replace />} />
          <Route path="/assessments" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
