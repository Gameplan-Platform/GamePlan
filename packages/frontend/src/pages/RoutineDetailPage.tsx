import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
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

// United Scoring deduction categories (v10.15.25)
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

interface StoredDeduction {
  id?: string
  category: string
  value: number
  notes?: string | null
}

interface Routine {
  id: string
  title: string
  date: string
  notes: string | null
  isFullOut: boolean
  moduleId: string
  athleteId: string
  deductions: StoredDeduction[]
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

export default function RoutineDetailPage() {
  const { moduleId, routineId } = useParams<{ moduleId: string; routineId: string }>()
  const navigate = useNavigate()
  const { token, role } = useAuth()
  const isCoach = role === 'COACH'

  const [routine, setRoutine] = useState<Routine | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [savedNotes, setSavedNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  // counts[key] = how many times this deduction occurred
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [deductionSaved, setDeductionSaved] = useState(false)
  const isFirstLoad = useRef(true)


  const notesDirty = notes !== savedNotes

  useEffect(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return }
    if (!routineId || !token) return
    const deductions = DEDUCTION_CATEGORIES
      .filter(cat => (counts[cat.key] ?? 0) > 0)
      .map(cat => ({ category: cat.key, value: counts[cat.key] }))
    api(`/routines/${routineId}`, { method: 'PATCH', token, body: { deductions } })
      .then(() => { setDeductionSaved(true); setTimeout(() => setDeductionSaved(false), 1500) })
      .catch(() => {})
  }, [counts])

  const saveNotes = async () => {
    if (!routineId || !token) return
    setSavingNotes(true)
    try {
      await api(`/routines/${routineId}`, {
        method: 'PATCH', token,
        body: { notes: notes.trim() || null },
      })
      setSavedNotes(notes)
    } catch (err) {
      console.error('Failed to save notes', err)
    } finally {
      setSavingNotes(false)
    }
  }

  useEffect(() => {
    if (!routineId || !token) return
    setLoading(true)
    api<Routine>(`/routines/${routineId}`, { token })
      .then(res => {
        const r = res
        setRoutine(r)
        setNotes(r.notes ?? '')
        setSavedNotes(r.notes ?? '')
        // Map stored deductions back to counts by category key
        const initial: Record<string, number> = {}
        for (const d of r.deductions) {
          initial[d.category] = d.value
        }
        setCounts(initial)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [routineId, token])

  const getCount = (key: string) => counts[key] ?? 0

  const setCount = (key: string, val: number) => {
    setCounts(prev => ({ ...prev, [key]: Math.max(0, Math.floor(val)) }))
  }

  const totalDeductionPoints = DEDUCTION_CATEGORIES.reduce((sum, cat) => {
    return sum + getCount(cat.key) * cat.pointsEach
  }, 0)

  const chartData = DEDUCTION_CATEGORIES
    .map(cat => ({
      key: cat.key,
      label: cat.label,
      points: Number((getCount(cat.key) * cat.pointsEach).toFixed(2)),
    }))


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '440px', height: '956px', background: '#FCFCFE', borderRadius: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily, color: textSecondary }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!routine) {
    return (
      <div style={{ minHeight: '100vh', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '440px', height: '956px', background: '#FCFCFE', borderRadius: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily, color: '#E05C5C' }}>Routine not found.</p>
        </div>
      </div>
    )
  }

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
          onClick={() => navigate(`/modules/${moduleId}/progress`)}
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
            textAlign: 'center', fontSize: '28px', fontWeight: 700,
            color: '#0F172A', letterSpacing: '0.01em', zIndex: 4,
            padding: '0 80px',
          }}
        >
          {routine.title}
        </motion.h1>

        {/* Scrollable content */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          style={{
            position: 'absolute', top: '104px', left: '24px', right: '24px',
            bottom: '90px', overflowY: 'auto', paddingRight: '4px',
          }}
        >

          {/* Notes — always shown */}
          <div style={{ background: '#fff', borderRadius: '26px', padding: '18px', boxShadow: cardShadow, border: `1px solid ${cardBorder}`, marginBottom: '18px' }}>
            <SectionHeader title="Notes" />
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              readOnly={!isCoach}
              placeholder="Enter Notes Here"
              rows={5}
              style={{
                width: '100%', borderRadius: '14px',
                border: '1px solid #DFE5F0', padding: '12px 14px',
                fontFamily, fontSize: '14px', color: textPrimary,
                background: isCoach ? '#FBFCFF' : '#F7F8FC',
                outline: 'none', resize: 'none', boxSizing: 'border-box',
              }}
            />
            <AnimatePresence>
            {isCoach && notesDirty && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  onClick={() => setNotes(savedNotes)}
                  style={{
                    height: '34px', padding: '0 16px', borderRadius: '999px',
                    border: '1px solid #DFE5F0', background: '#fff',
                    fontFamily, fontSize: '12px', fontWeight: 400,
                    color: textSecondary, cursor: 'pointer',
                  }}
                >Cancel</button>
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  style={{
                    height: '34px', padding: '0 16px', borderRadius: '999px',
                    border: 'none', background: '#B7DE58',
                    fontFamily, fontSize: '12px', fontWeight: 400,
                    color: '#fff', cursor: savingNotes ? 'not-allowed' : 'pointer',
                    opacity: savingNotes ? 0.7 : 1,
                    boxShadow: '0 6px 14px rgba(183,222,88,0.3)',
                  }}
                >{savingNotes ? 'Saving…' : 'Save'}</button>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Deductions + Chart — full outs only */}
          {routine.isFullOut && (<>
          <div style={{ background: '#fff', borderRadius: '26px', padding: '18px', boxShadow: cardShadow, border: `1px solid ${cardBorder}`, marginBottom: '18px' }}>
            <SectionHeader title="Deductions" />

            <div style={{ display: 'grid', gap: '10px' }}>
              {DEDUCTION_CATEGORIES.map(cat => {
                const count = getCount(cat.key)
                const pts = count * cat.pointsEach
                return (
                  <div key={cat.key} style={{ display: 'grid', gridTemplateColumns: '1fr auto 56px', gap: '8px', alignItems: 'center' }}>
                    {/* Category badge */}
                    <div style={{
                      background: '#EEF8D8', border: '1px solid #D6EFA0',
                      borderRadius: '20px', padding: '6px 12px',
                      fontFamily, fontSize: '12px', fontWeight: 600, color: '#4A6B1A',
                      display: 'flex', alignItems: 'center',
                    }}>
                      {cat.label}
                    </div>

                    {/* Stepper */}
                    {isCoach ? (
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        border: '1px solid #DFE5F0', borderRadius: '12px',
                        overflow: 'hidden', background: '#FBFCFF',
                      }}>
                        <button
                          onClick={() => setCount(cat.key, count - 1)}
                          disabled={count === 0}
                          style={{
                            width: '32px', height: '32px', border: 'none',
                            background: 'transparent', cursor: count > 0 ? 'pointer' : 'default',
                            fontFamily, fontSize: '18px', color: count > 0 ? accentDark : '#C4C9D8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}
                        >−</button>
                        <div style={{
                          width: '28px', textAlign: 'center',
                          fontFamily, fontSize: '13px', fontWeight: 700,
                          color: count > 0 ? textPrimary : textSecondary,
                        }}>
                          {count}
                        </div>
                        <button
                          onClick={() => setCount(cat.key, count + 1)}
                          style={{
                            width: '32px', height: '32px', border: 'none',
                            background: 'transparent', cursor: 'pointer',
                            fontFamily, fontSize: '18px', color: accentDark,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}
                        >+</button>
                      </div>
                    ) : (
                      <div style={{
                        width: '92px', height: '32px',
                        border: '1px solid #DFE5F0', borderRadius: '12px',
                        background: '#F7F8FC', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontFamily, fontSize: '13px', fontWeight: 700,
                        color: count > 0 ? textPrimary : textSecondary,
                      }}>
                        {count}
                      </div>
                    )}

                    {/* Calculated points */}
                    <div style={{ fontFamily, fontSize: '12px', fontWeight: 700, color: pts > 0 ? '#D94C4C' : textSecondary, textAlign: 'right' }}>
                      {pts > 0 ? pts.toFixed(2) : `${cat.pointsEach}`}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total */}
            <div style={{
              marginTop: '16px', paddingTop: '14px',
              borderTop: '1px solid #EEF2F8',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily, fontSize: '13px', fontWeight: 700, color: textPrimary }}>
                Total Deductions {deductionSaved && <span style={{ fontSize: '11px', fontWeight: 400, color: '#4CAF50' }}>✓ Saved</span>}
              </span>
              <span style={{ fontFamily, fontSize: '16px', fontWeight: 700, color: totalDeductionPoints > 0 ? '#D94C4C' : textSecondary }}>
                {totalDeductionPoints > 0 ? `${totalDeductionPoints.toFixed(2)} pts` : '0 pts'}
              </span>
            </div>
          </div>

          {/* Chart */}
          <div style={{ background: '#fff', borderRadius: '26px', padding: '18px', boxShadow: cardShadow, border: `1px solid ${cardBorder}`, marginBottom: '28px' }}>
            <SectionHeader title="Chart" />
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 10, left: -8 }}>
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
          </div>
          </>)}

        </motion.div>


        <BottomNav />
      </div>
    </div>
  )
}
