import { useEffect, useRef, useState } from 'react'

const TIERS = [
  { label: 'CRITICAL',   min: 0,  max: 40,  color: '#EA4532' },
  { label: 'DEVELOPING', min: 40, max: 70,  color: '#E8A33D' },
  { label: 'PROFICIENT', min: 70, max: 90,  color: '#3895D2' },
  { label: 'MASTERED',   min: 90, max: 101, color: '#4FB286' },
]

function getColor(score) {
  return '#EA4532'
}

function getTier(score) {
  return TIERS.find(t => score >= t.min && score < t.max) || TIERS[3]
}

export default function SegmentedGauge({ topic, score = 0, animated = false }) {
  const SEGMENTS = 10
  const filledCount = Math.round((score / 100) * SEGMENTS)
  const color = getColor(score)
  const tier = getTier(score)

  const [visibleCount, setVisibleCount] = useState(animated ? 0 : filledCount)
  const prevScore = useRef(score)
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
    'CRITICAL': 'text-[#EA4532]',
    'DEVELOPING': 'text-[#E8A33D]',
    'PROFICIENT': 'text-[#3895D2]',
    'MASTERED': 'text-[#4FB286]',
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-slate-600 text-xs font-semibold tracking-wide truncate pr-2">{topic}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`font-mono text-xs uppercase tracking-widest ${tierColors[tier.label] || 'text-slate-400'}`}
            style={{ letterSpacing: '0.05em', fontSize: '10px' }}
          >
            {tier.label}
          </span>
          <span className={`font-mono text-sm font-semibold ${animated ? 'number-tick' : ''}`} style={{ color }}>
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
