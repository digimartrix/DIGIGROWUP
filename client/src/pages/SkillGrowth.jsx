import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import SegmentedGauge from '../components/SegmentedGauge'
import api from '../lib/api'
import { Target, TrendingUp, Award, Clock } from 'lucide-react'

export default function SkillGrowth() {
  const { user } = useAuth()
  const [mastery, setMastery] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/mastery/${user.id}`)
      .then(res => setMastery(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user.id])

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 rounded bg-white border border-slate-200 shimmer" />)}
    </div>
  )

  return (
    <div className="p-6 page-enter max-w-4xl">
      {/* Header Info */}
      <div className="mb-6">
        <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">SKILL METRIC RADAR</p>
        <p className="text-slate-500 text-xs md:text-sm">
          Observe your progress metrics, verified competencies, and active areas of growth below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Core Stats */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-[#3895D2]/10 border border-[#3895D2]/25 flex items-center justify-center text-[#3895D2]">
            <Target size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">TRACKED TOPICS</p>
            <p className="font-mono text-xl font-bold text-slate-800">{mastery.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-[#3895D2]/10 border border-[#3895D2]/25 flex items-center justify-center text-[#3895D2]">
            <TrendingUp size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">AVERAGE MASTERY</p>
            <p className="font-mono text-xl font-bold text-slate-800">
              {mastery.length > 0
                ? `${Math.round(mastery.reduce((a, b) => a + b.score, 0) / mastery.length)}%`
                : '0%'
              }
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-3xs flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-[#3895D2]/10 border border-[#3895D2]/25 flex items-center justify-center text-[#3895D2]">
            <Award size={18} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">SKILL LEVEL</p>
            <p className="font-mono text-xs font-bold text-slate-850">
              {mastery.length > 0
                ? mastery.reduce((a, b) => a + b.score, 0) / mastery.length >= 70 ? 'PROFICIENT DEVELOPER' : 'BEGINNER TRACK'
                : 'INITIATING...'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Mastery List */}
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-3xs">
        <h3 className="font-heading font-bold text-slate-850 text-xs md:text-sm mb-6 uppercase tracking-wider flex items-center gap-2">
          Competency Gauges
        </h3>
        
        {mastery.length > 0 ? (
          <div className="space-y-6">
            {mastery.map((m) => (
              <div key={m.topic} className="border-b border-slate-100 pb-4 last:border-none last:pb-0">
                <SegmentedGauge topic={m.topic} score={m.score} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-semibold">No skill metrics recorded yet.</p>
            <p className="text-[10px] mt-1">Complete lessons and submit assessments to observe your dashboard gauges rise.</p>
          </div>
        )}
      </div>
    </div>
  )
}
