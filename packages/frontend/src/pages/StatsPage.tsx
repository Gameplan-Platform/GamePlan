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
const green = '#B7DE58'
const textPrimary = '#1F2937'
const textSecondary = '#8B93A7'
const cardBorder = '#EAEFF8'
const cardShadow = '0 18px 36px rgba(34, 43, 69, 0.08)'

const DEDUCTION_CATEGORIES = [
  { key: 'AF',    label: 'Athlete Fall',                  pointsEach: 0.15 },
  { key: 'MAF',   label: 'Major Athlete Fall',            pointsEach: 0.25 },
  { key: 'BB',    label: 'Building Bobble',               pointsEach: 0.25 },
  { key: 'BF',    label: 'Building Fall',                 pointsEach: 0.75 },
  { key: 'MBF',   label: 'Major Building Fall',           pointsEach: 1.25 },
  { key: 'OOB',   label: 'Boundary Violation',            pointsEach: 0.05 },
  { key: 'TLV',   label: 'Time Limit Violation',          pointsEach: 0.05 },
  { key: 'DV',    label: 'Division Violation',            pointsEach: 5.00 },
  { key: 'UNI',   label: 'Uniform Violation',             pointsEach: 0.01 },
  { key: 'APS',   label: 'APS / Excessive Celebration',  pointsEach: 0.25 },
  { key: 'OOL-T', label: 'Out of Level Tumbling',        pointsEach: 0.05 },
  { key: 'OOL-B', label: 'Building Out of Level',        pointsEach: 0.10 },
  { key: 'SRD',   label: 'Skill Restriction / Division', pointsEach: 0.50 },
] as const

interface Deduction {
  category: string
  value: number
}

interface Routine {
  id: string
  title: string
  date: string
  deductions: Deduction[]
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      height: '42px',
      borderRadius: '16px',
      background: `linear-gradient(90deg, ${accentDark} 0%, #6A419F 100%)`,
      boxShadow: '0 10px 20px rgba(97, 59, 151, 0.18)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 18px',
      marginBottom: '14px',
    }}>
      <span style={{ fontFamily, fontSize: '14px', fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
        {title}
      </span>
    </div>
  )
}

function ymd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
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
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [moduleId, token])

  const monthStart = ymd(viewMonth)
  const monthEnd = ymd(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0))

  const monthRoutines = useMemo(() =>
    routines
      .filter(r => r.date.slice(0, 10) >= monthStart && r.date.slice(0, 10) <= monthEnd)
      .sort((a, b) => a.date.localeCompare(b.date)),
    [routines, monthStart, monthEnd]
  )

  // Line chart: total deduction points per routine in the month
  const lineData = useMemo(() =>
    monthRoutines.map(r => {
      const totalPts = r.deductions.reduce((sum, d) => {
        const cat = DEDUCTION_CATEGORIES.find(c => c.key === d.category)
        return sum + (cat ? d.value * cat.pointsEach : 0)
      }, 0)
      return {
        name: r.title.length > 10 ? r.title.slice(0, 10) + '…' : r.title,
        points: Number(totalPts.toFixed(2)),
        date: r.date.slice(0, 10),
      }
    }),
    [monthRoutines]
  )

  // Bar chart: total count per deduction type across the month
  const barData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of monthRoutines) {
      for (const d of r.deductions) {
        counts[d.category] = (counts[d.category] ?? 0) + d.value
      }
    }
    return DEDUCTION_CATEGORIES
      .map(cat => ({ key: cat.key, label: cat.label, count: counts[cat.key] ?? 0 }))
      .filter(d => d.count > 0)
  }, [monthRoutines])

  // Summary stats
  const totalRoutines = monthRoutines.length
  const totalDeductionPts = useMemo(() =>
    lineData.reduce((s, d) => s + d.points, 0),
    [lineData]
  )
  const avgPts = totalRoutines > 0 ? (totalDeductionPts / totalRoutines).toFixed(2) : '0.00'

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
            cursor: 'pointer', zIndex: 4,
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
            textAlign: 'center', fontSize: '26px', fontWeight: 700,
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
            bottom: '112px', overflowY: 'auto', paddingRight: '4px',
          }}
        >

          {/* Month nav */}
          <div style={{
            background: '#fff', borderRadius: '26px', padding: '14px 18px',
            boxShadow: cardShadow, border: `1px solid ${cardBorder}`, marginBottom: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <button
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px 10px', fontSize: '18px', color: accent }}
            >‹</button>
            <span style={{ fontFamily, fontSize: '14px', fontWeight: 700, color: textPrimary }}>
              {formatMonthLabel(viewMonth)}
            </span>
            <button
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '6px 10px', fontSize: '18px', color: accent }}
            >›</button>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '18px' }}>
            {[
              { label: 'Routines', value: totalRoutines },
              { label: 'Total Deducted', value: `-${totalDeductionPts.toFixed(2)}` },
              { label: 'Avg / Routine', value: `-${avgPts}` },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: '#fff', borderRadius: '18px', padding: '14px 10px',
                border: `1px solid ${cardBorder}`, boxShadow: cardShadow, textAlign: 'center',
              }}>
                <div style={{ fontFamily, fontSize: '10px', fontWeight: 600, color: textSecondary, marginBottom: '6px' }}>{label}</div>
                <div style={{ fontFamily, fontSize: '16px', fontWeight: 700, color: textPrimary }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Line chart */}
          <div style={{ background: '#fff', borderRadius: '26px', padding: '18px', boxShadow: cardShadow, border: `1px solid ${cardBorder}`, marginBottom: '18px' }}>
            <SectionHeader title="Deductions Over Time" />
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', fontFamily, fontSize: '13px', color: textSecondary }}>Loading…</div>
            ) : lineData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', fontFamily, fontSize: '13px', color: textSecondary }}>No routines this month.</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontFamily: 'Amiko', fontSize: 10, fill: '#999' }}
                    tickLine={false} axisLine={false}
                    label={{ value: 'Routine', position: 'insideBottom', offset: -12, style: { fontFamily: 'Amiko', fontSize: 10, fill: '#999' } }}
                  />
                  <YAxis
                    tick={{ fontFamily: 'Amiko', fontSize: 10, fill: '#999' }}
                    tickLine={false} axisLine={false}
                    label={{ value: 'Points', angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: 'Amiko', fontSize: 10, fill: '#999' } }}
                  />
                  <Tooltip
                    contentStyle={{ fontFamily: 'Amiko', fontSize: 12, borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                    formatter={(v: number) => [`-${v.toFixed(2)} pts`, 'Deducted']}
                  />
                  <Line dataKey="points" stroke={accent} strokeWidth={2} dot={{ r: 4, fill: accent }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bar chart: deduction frequency */}
          <div style={{ background: '#fff', borderRadius: '26px', padding: '18px', boxShadow: cardShadow, border: `1px solid ${cardBorder}`, marginBottom: '28px' }}>
            <SectionHeader title="Deduction Frequency" />
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', fontFamily, fontSize: '13px', color: textSecondary }}>Loading…</div>
            ) : barData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', fontFamily, fontSize: '13px', color: textSecondary }}>No deductions this month.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 20, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                    <XAxis
                      dataKey="key"
                      tick={{ fontFamily: 'Amiko', fontSize: 10, fill: '#999' }}
                      tickLine={false} axisLine={false}
                      label={{ value: 'Type', position: 'insideBottom', offset: -12, style: { fontFamily: 'Amiko', fontSize: 10, fill: '#999' } }}
                    />
                    <YAxis
                      tick={{ fontFamily: 'Amiko', fontSize: 10, fill: '#999' }}
                      tickLine={false} axisLine={false}
                      label={{ value: 'Count', angle: -90, position: 'insideLeft', offset: 10, style: { fontFamily: 'Amiko', fontSize: 10, fill: '#999' } }}
                    />
                    <Tooltip
                      contentStyle={{ fontFamily: 'Amiko', fontSize: 12, borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                      formatter={(v: number, _: unknown, props: { payload?: { label?: string } }) => [v, props.payload?.label ?? '']}
                    />
                    <Bar dataKey="count" fill={green} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div style={{ marginTop: '12px', display: 'grid', gap: '4px' }}>
                  {barData.map(d => (
                    <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', fontFamily, fontSize: '11px', color: textSecondary }}>
                      <span><strong style={{ color: textPrimary }}>{d.key}</strong> — {d.label}</span>
                      <span style={{ fontWeight: 700, color: textPrimary }}>{d.count}×</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </motion.div>

        <BottomNav />
      </div>
    </div>
  )
}
