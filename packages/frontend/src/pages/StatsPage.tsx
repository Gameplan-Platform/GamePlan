import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const fontFamily = '"Amiko", sans-serif'
const accent = '#6267E3'
const accentDark = '#55337B'
const textPrimary = '#1F2937'
const textSecondary = '#8B93A7'
const cardBorder = '#EAEFF8'
const cardShadow = '0 18px 36px rgba(34, 43, 69, 0.08)'

const DEDUCTION_CATEGORIES = [
  { key: 'AF',    label: 'Athlete Fall',        pointsEach: 0.15 },
  { key: 'MAF',   label: 'Major Athlete Fall',  pointsEach: 0.25 },
  { key: 'BB',    label: 'Building Bobble',     pointsEach: 0.25 },
  { key: 'BF',    label: 'Building Fall',       pointsEach: 0.75 },
  { key: 'MBF',   label: 'Major Building Fall', pointsEach: 1.25 },
  { key: 'OOB',   label: 'Boundary Violation',  pointsEach: 0.05 },
  { key: 'ILL',   label: 'Illegality',          pointsEach: 2.00 },
] as const

interface Deduction {
  category: string
  value: number
}

interface Routine {
  id: string
  title: string
  date: string
  isFullOut: boolean
  deductions: Deduction[]
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      height: '42px',
      borderRadius: '999px',
      background: accent,
      boxShadow: '0 10px 20px rgba(98, 103, 227, 0.18)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 18px',
      marginBottom: '14px',
    }}>
      <span style={{ fontFamily, fontSize: '14px', fontWeight: 400, color: '#fff', letterSpacing: '0.02em' }}>
        {title}
      </span>
    </div>
  )
}

// Custom x-axis tick: mm/dd on first line, truncated title on second
function LineTick({ x, y, payload }: { x?: number | string; y?: number | string; payload?: { value: string } }) {
  if (!payload || x == null || y == null) return null
  const nx = typeof x === 'string' ? parseFloat(x) : x
  const ny = typeof y === 'string' ? parseFloat(y) : y
  const parts = (payload.value as string).split('|')
  return (
    <g transform={`translate(${nx},${ny})`}>
      <text x={0} y={0} dy={10} textAnchor="middle" fill="#999" fontFamily="Amiko" fontSize={8}>{parts[0]}</text>
      <text x={0} y={0} dy={20} textAnchor="middle" fill="#999" fontFamily="Amiko" fontSize={7}>{parts[1]}</text>
    </g>
  )
}

function ymd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function mmdd(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  return `${m}/${d}`
}

export default function StatsPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
    if (!moduleId || !token) return
    const load = async () => {
      setLoading(true)
      try {
        const data = await api<Routine[]>(`/modules/${moduleId}/routines`, { token })
        setRoutines(data)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [moduleId, token])

  const monthStart = ymd(viewMonth)
  const monthEnd = ymd(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0))

  // Only full outs count for stats
  const monthFullOuts = useMemo(() =>
    routines
      .filter(r => r.isFullOut && r.date.slice(0, 10) >= monthStart && r.date.slice(0, 10) <= monthEnd)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [routines, monthStart, monthEnd]
  )

  // Line chart: total deduction points per full out
  const lineData = useMemo(() =>
    monthFullOuts.map(r => {
      const pts = r.deductions.reduce((sum, d) => {
        const cat = DEDUCTION_CATEGORIES.find(c => c.key === d.category)
        return sum + (cat ? d.value * cat.pointsEach : 0)
      }, 0)
      const shortTitle = r.title.length > 8 ? r.title.slice(0, 8) + '…' : r.title
      return {
        label: `${mmdd(r.date.slice(0, 10))}|${shortTitle}`,
        fullName: `${r.title} (${mmdd(r.date.slice(0, 10))})`,
        points: Number(pts.toFixed(2)),
      }
    }),
    [monthFullOuts]
  )

  // Bar chart: total points per deduction category across all full outs, plus frequency count
  const barData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of monthFullOuts) {
      for (const d of r.deductions) {
        counts[d.category] = (counts[d.category] ?? 0) + d.value
      }
    }
    return DEDUCTION_CATEGORIES.map(cat => ({
      key: cat.key,
      label: cat.label,
      points: Number((( counts[cat.key] ?? 0) * cat.pointsEach).toFixed(2)),
      frequency: counts[cat.key] ?? 0,
    }))
  }, [monthFullOuts])

  const activeBarData = barData.filter(d => d.frequency > 0)

  const monthName = viewMonth.toLocaleDateString(undefined, { month: 'long' })
  const monthYear = viewMonth.getFullYear()

  const noDataMsg = (
    <p style={{ fontFamily, fontSize: '13px', color: textSecondary, margin: '10px 0 4px', textAlign: 'left' }}>
      No full outs logged this month.
    </p>
  )

  const loadingMsg = (
    <p style={{ fontFamily, fontSize: '13px', color: textSecondary, margin: '10px 0 4px', textAlign: 'left' }}>
      Loading…
    </p>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{
        width: '440px', height: '956px', background: '#FCFCFE',
        borderRadius: '55px', position: 'relative', overflow: 'hidden',
        boxShadow: '0 24px 70px rgba(34, 43, 69, 0.10)', fontFamily,
      }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiko:wght@400;600;700&display=swap');`}</style>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
          onClick={() => navigate(moduleId ? `/modules/${moduleId}/progress` : -1 as never)}
          style={{
            position: 'absolute', top: '52px', left: '28px',
            width: '42px', height: '42px', borderRadius: '14px',
            border: '1px solid #D9DEEA', background: '#F5F6FA',
            boxShadow: '0 6px 16px rgba(34, 43, 69, 0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 6,
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8.5 1L1.5 8L8.5 15" stroke="#222B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.03 }}
          style={{
            position: 'absolute', top: '50px', left: 0, right: 0, margin: 0,
            textAlign: 'center', fontSize: '22px', fontWeight: 700,
            color: '#0F172A', letterSpacing: '0.01em', zIndex: 4,
            padding: '0 80px',
          }}
        >
          Comprehensive Stats
        </motion.h1>

        {/* Scrollable content */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          style={{
            position: 'absolute', top: '104px', left: '24px', right: '24px',
            bottom: '100px', overflowY: 'auto', paddingRight: '4px',
          }}
        >

          {/* Month nav */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '18px', padding: '0 4px',
          }}>
            <button
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7L7 13" stroke="#222B45" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily, fontSize: '20px', fontWeight: 700, color: '#222B45', lineHeight: 1.1 }}>
                {monthName}
              </div>
              <div style={{ fontFamily, fontSize: '12px', fontWeight: 400, color: textSecondary, marginTop: '2px' }}>
                {monthYear}
              </div>
            </div>

            <button
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke="#222B45" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Line chart — total deduction pts over time */}
          <div style={{ background: '#fff', borderRadius: '26px', padding: '18px', boxShadow: cardShadow, border: `1px solid ${cardBorder}`, marginBottom: '18px' }}>
            <SectionHeader title="Total Points in Deductions Over Time" />
            {loading ? loadingMsg : lineData.length === 0 ? noDataMsg : (
              <ResponsiveContainer width="100%" height={190}>
                <LineChart data={lineData} margin={{ top: 4, right: 12, bottom: 28, left: -8 }}>
                  <CartesianGrid stroke="#E8EBF4" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={(props) => <LineTick {...props} />}
                    tickLine={false} axisLine={false}
                    interval={0}
                    height={36}
                    label={{ value: 'Date', position: 'insideBottom', offset: 0, style: { fontFamily: 'Amiko', fontSize: 9, fill: '#999', textAnchor: 'middle' } }}
                  />
                  <YAxis
                    tick={{ fontFamily: 'Amiko', fontSize: 9, fill: '#999' }}
                    tickLine={false} axisLine={false}
                    width={44}
                    domain={[0, 15]}
                    ticks={[0, 3, 6, 9, 12, 15]}
                    label={{ value: 'Points', angle: -90, dx: -10, style: { fontFamily: 'Amiko', fontSize: 9, fill: '#999', textAnchor: 'middle' } }}
                  />
                  <Tooltip
                    contentStyle={{ fontFamily: 'Amiko', fontSize: 14, borderRadius: '14px', border: 'none', boxShadow: '0 6px 24px rgba(0,0,0,0.13)', padding: '10px 16px' }}
                    labelStyle={{ fontFamily: 'Amiko', fontSize: 14, fontWeight: 400, color: textPrimary, marginBottom: '4px' }}
                    itemStyle={{ fontFamily: 'Amiko', fontSize: 13, fontWeight: 400, color: accentDark }}
                    labelFormatter={(_label, payload) => {
                      const entry = payload?.[0]?.payload as { fullName?: string } | undefined
                      return entry?.fullName ?? _label
                    }}
                    formatter={(v) => [`${typeof v === 'number' ? v.toFixed(2) : '0.00'} pts`, 'Deducted']}
                  />
                  <Line
                    dataKey="points" stroke={accent} strokeWidth={2}
                    dot={{ r: 5, fill: '#B8E466', stroke: '#B8E466' }}
                    activeDot={{ r: 7, fill: '#B8E466' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart — deduction frequency */}
          <div style={{ background: '#fff', borderRadius: '26px', padding: '18px', boxShadow: cardShadow, border: `1px solid ${cardBorder}`, marginBottom: '28px' }}>
            <SectionHeader title="Frequency of Deduction Type" />
            {loading ? loadingMsg : monthFullOuts.length === 0 ? noDataMsg : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 10, left: -8 }}>
                    <CartesianGrid vertical={false} stroke="#E8EBF4" />
                    <XAxis
                      dataKey="key"
                      tick={{ fontFamily: 'Amiko', fontSize: 8, fill: '#999' }}
                      tickLine={false} axisLine={false}
                      angle={-40}
                      textAnchor="end"
                      interval={0}
                      height={40}
                      label={{ value: 'Deduction', position: 'insideBottom', offset: 0, style: { fontFamily: 'Amiko', fontSize: 9, fill: '#999' } }}
                    />
                    <YAxis
                      width={52}
                      tick={{ fontFamily: 'Amiko', fontSize: 9, fill: '#999' }}
                      tickLine={false} axisLine={false}
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                      label={{ value: 'Points', angle: -90, dx: -10, style: { fontFamily: 'Amiko', fontSize: 9, fill: '#999', textAnchor: 'middle' } }}
                    />
                    <Tooltip
                      contentStyle={{ fontFamily: 'Amiko', fontSize: 12, borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                      labelFormatter={(key) => DEDUCTION_CATEGORIES.find(c => c.key === key)?.label ?? key}
                      formatter={(v) => [`${typeof v === 'number' ? v.toFixed(2) : '0.00'} pts`, 'Points']}
                    />
                    <Bar dataKey="points" fill={accentDark} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Frequency legend — only show categories with occurrences */}
                {activeBarData.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #EEF2F8', display: 'grid', gap: '6px' }}>
                    {activeBarData.map(d => (
                      <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily, fontSize: '12px' }}>
                        <div style={{
                          background: '#EEF8D8', border: '1px solid #D6EFA0',
                          borderRadius: '20px', padding: '4px 10px',
                          fontSize: '11px', fontWeight: 600, color: '#4A6B1A',
                        }}>
                          {d.key} — {d.label}
                        </div>
                        <span style={{ fontWeight: 700, color: textPrimary, flexShrink: 0, marginLeft: '8px' }}>{d.frequency}×</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        </motion.div>

        <BottomNav />
      </div>
    </div>
  )
}
