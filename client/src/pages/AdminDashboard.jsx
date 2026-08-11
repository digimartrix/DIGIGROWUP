import { useEffect, useState } from 'react'
import api from '../lib/api'
import {
  Users, BookOpen, Bookmark, Shield, Award, Calendar, Trophy, ChevronRight, Activity
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/admin/overview')
        if (res.data?.success) setStats(res.data.data)
      } catch (err) {
        console.error('Failed to load admin stats:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-xl bg-white border border-slate-200 shimmer" />)}
    </div>
  )

  if (!stats) return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-xl">
      <Shield size={36} className="mx-auto text-slate-300 mb-3" />
      <p className="text-slate-500 text-sm font-semibold">Stats could not be loaded.</p>
    </div>
  )

  const cardItems = [
    { label: 'Total Students', value: stats.studentsCount, icon: Users, color: '#3895D2' },
    { label: 'Active Courses', value: stats.coursesCount, icon: BookOpen, color: '#E8A33D' },
    { label: 'Total Enrollments', value: stats.enrollmentsCount, icon: Bookmark, color: '#4FB286' },
    { label: 'Active Mentors', value: stats.mentorsCount, icon: Shield, color: '#8B5CF6' },
    { label: 'Event Registrations', value: stats.registrationsCount, icon: Calendar, color: '#EC4899' },
    { label: 'Certificates Issued', value: stats.certificatesCount, icon: Award, color: '#EA4532' },
  ]

  return (
    <div className="page-enter max-w-5xl space-y-8">
      {/* Header Info */}
      <div>
        <p className="font-mono text-[10px] text-[#EA4532] uppercase tracking-widest mb-1.5 font-bold">MANAGEMENT PANEL</p>
        <p className="text-slate-500 text-xs md:text-sm">
          Monitor real-time study stats, course popularity rankings, and credits transaction ledger.
        </p>
      </div>

      {/* Grid statistics summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardItems.map((c) => {
          const Icon = c.icon
          return (
            <div 
              key={c.label}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between border-l-4"
              style={{ borderLeftColor: c.color }}
            >
              <div>
                <p className="text-slate-500 font-mono uppercase tracking-widest mb-1.5 font-bold" style={{ fontSize: '9px' }}>{c.label}</p>
                <p className="font-mono text-2xl font-black text-slate-800">{c.value}</p>
              </div>
              <div 
                className="w-10 h-10 rounded border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: `${c.color}25`, backgroundColor: `${c.color}08` }}
              >
                <Icon size={18} style={{ color: c.color }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Credits flow summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <p className="font-heading font-bold text-xs uppercase text-slate-700 tracking-wider mb-2">Virtual Credits Issued</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-[#4FB286]">{stats.creditsEarnedSum}</span>
            <span className="text-slate-500 font-mono text-xs font-semibold">credits rewarded</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <p className="font-heading font-bold text-xs uppercase text-slate-700 tracking-wider mb-2">Virtual Credits Spent</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-black text-[#EA4532]">{stats.creditsSpentSum}</span>
            <span className="text-slate-500 font-mono text-xs font-semibold">credits redeemed</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular courses */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-[#EA4532]" />
              <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base">Course Popularity Ranking</h3>
            </div>

            <div className="space-y-4">
              {stats.coursePopularity?.map((cp) => (
                <div key={cp.title} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="truncate pr-4">{cp.title}</span>
                    <span className="font-mono">{cp.count} enrolls</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className="h-full bg-[#3895D2] rounded-full"
                      style={{ width: `${Math.min(100, (cp.count / Math.max(1, stats.enrollmentsCount)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}

              {(!stats.coursePopularity || stats.coursePopularity.length === 0) && (
                <p className="text-slate-450 text-xs py-4 text-center">No enrollment statistics available yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions logs */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-[#E8A33D]" />
            <h3 className="font-heading font-bold text-slate-800 text-sm md:text-base">Recent Credits Ledger</h3>
          </div>

          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
            {stats.recentTransactions?.map((t) => (
              <div key={t._id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                <div className="min-w-0">
                  <p className="font-medium text-slate-750 truncate">{t.reason}</p>
                  <p className="font-mono text-[9px] text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <span className={`font-mono font-bold ${
                  t.type === 'SPEND' ? 'text-[#EA4532]' : 'text-[#4FB286]'
                }`}>
                  {t.type === 'SPEND' ? '-' : '+'}{t.amount}
                </span>
              </div>
            ))}

            {(!stats.recentTransactions || stats.recentTransactions.length === 0) && (
              <p className="text-slate-450 text-xs py-4 text-center">No transactions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
