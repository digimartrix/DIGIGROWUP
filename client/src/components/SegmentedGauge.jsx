import { useEffect, useRef, useState } from 'react'

const TIERS = [
  { label: 'DEVELOPING', min: 0,  max: 60,  color: '#0284C7' },
  { label: 'PROFICIENT', min: 60, max: 85,  color: '#3895D2' },
  { label: 'MASTERED',   min: 85, max: 101, color: '#10B981' },
]

function getColor(score) {
  if (score >= 85) return '#10B981' // Emerald Positive Success
  if (score >= 60) return '#3895D2' // Digi Blue Proficient
  return '#0284C7' // Sky Blue Developing
}

function getTier(score) {
  return TIERS.find(t => score >= t.min && score < t.max) || TIERS[2]
}

export default function SegmentedGauge({ topic, score = 0, animated = false }) {
  const SEGMENTS = 10
  const filledCount = Math.round((score / 100) * SEGMENTS)
  const color = getColor(score)
  const tier = getTier(score)

  const [visibleCount, setVisibleCount] = useState(animated ? 0 : filledCount)
  const animRef = useRef(null)

  useEffect(() => {
    if (!animated) { setVisibleCount(filledCount); return }
    let current = 0
    if (animRef.current) clearInterval(animRef.current)
    animRef.current = setInterval(() => {
      current++
      setVisibleCount(current)
      if (current >= filledCount) clearInterval(animRef.current)
    }, 8)
    return () => clearInterval(animRef.current)
  }, [score, filledCount, animated])

  const tierColors = {
    'DEVELOPING': 'text-[#0284C7]',
    'PROFICIENT': 'text-[#3895D2]',
    'MASTERED': 'text-emerald-600',
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-slate-800 text-xs font-bold tracking-wide truncate pr-2">{topic}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`font-mono text-xs uppercase tracking-wider font-bold ${tierColors[tier.label] || 'text-slate-500'}`}
            style={{ fontSize: '10px' }}
          >
            {tier.label}
          </span>
          <span className={`font-mono text-xs md:text-sm font-black ${animated ? 'number-tick' : ''}`} style={{ color }}>
            {score}<span className="text-slate-400 text-xs">%</span>
          </span>
        </div>
      </div>

      <div className="flex gap-1" style={{ gap: '4px' }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className="flex-1 segment-fill"
            style={{
              height: '4px',
              borderRadius: '2px',
              backgroundColor: i < visibleCount ? color : '#E2E8F0',
              transition: `background-color 0.1s ease ${i * 8}ms`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
