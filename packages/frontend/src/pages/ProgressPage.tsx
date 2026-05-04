import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/BottomNav'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

interface ScoreRecord {
  id: string
  score: number
  deductions: number
  date: string
  eventName?: string | null
  notes?: string | null
  athlete: { id: string; firstName: string; lastName: string }
  recordedBy: { id: string; firstName: string; lastName: string }
}

interface Summary {
  count: number
  averageScore: number
  averageDeductions: number
  highestScore: number
  lowestScore: number
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data'
}

interface GoalCompletion {
  total: number
  completed: number
  percentage: number
}

interface SummaryResponse {
  scores: ScoreRecord[]
  summary: Summary | null
  goalCompletion: GoalCompletion
  athleteId: string
  message?: string
}

interface Athlete {
  id: string
  firstName: string
  lastName: string
}

const ACCENT = '#6166DB'
const DEDUCTION_COLOR = '#E05C6B'
const CARD_BG = '#F4F3FD'

function TrendBadge({ trend }: { trend: Summary['trend'] }) {
  const config = {
    improving: { label: 'Improving', bg: '#D6F2DE', color: '#2E7D32' },
    declining: { label: 'Declining', bg: '#FFE4E4', color: '#C62828' },
    stable: { label: 'Stable', bg: '#FFF8DC', color: '#7B6000' },
    insufficient_data: { label: 'Not enough data', bg: '#F0F0F0', color: '#777' },
  }
  const c = config[trend]
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontFamily: 'Amiko', fontSize: '11px', fontWeight: 700,
      borderRadius: '20px', padding: '3px 10px',
    }}>
      {c.label}
    </span>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: CARD_BG, borderRadius: '16px',
      padding: '12px 14px', flex: 1, minWidth: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    }}>
      <span style={{ fontFamily: 'Amiko', fontSize: '18px', fontWeight: 700, color: ACCENT }}>{value}</span>
      <span style={{ fontFamily: 'Amiko', fontSize: '10px', color: '#888', textAlign: 'center' }}>{label}</span>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{
      background: ACCENT, borderRadius: '20px', height: '40px',
      display: 'flex', alignItems: 'center', padding: '0 18px',
      marginBottom: '12px',
    }}>
      <span style={{ fontFamily: 'Amiko', fontSize: '16px', fontWeight: 400, color: '#fff' }}>{title}</span>
    </div>
  )
}

export default function ProgressPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const navigate = useNavigate()
  const { token, role } = useAuth()

  const isCoach = role === 'COACH'

  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | undefined>(undefined)
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Coaches: load athlete list once
  useEffect(() => {
    if (!moduleId || !token || !isCoach) return
    api<{ athletes: Athlete[] }>(`/modules/${moduleId}/scores/athletes`, { token })
      .then(res => setAthletes(res.athletes))
      .catch(() => {/* non-fatal */})
  }, [moduleId, token, isCoach])

  // Load summary whenever the selected athlete changes (or on mount for non-coaches)
  useEffect(() => {
    if (!moduleId || !token) return
    const load = async () => {
      setLoading(true)
      setError(null)
      const query = selectedAthleteId ? `?athleteId=${selectedAthleteId}` : ''
      try {
        const res = await api<SummaryResponse>(`/modules/${moduleId}/scores/summary${query}`, { token })
        setData(res)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [moduleId, token, selectedAthleteId])

  const chartData = (data?.scores ?? []).map(s => ({
    date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: Number(s.score.toFixed(2)),
    deductions: Number(s.deductions.toFixed(2)),
  }))

  const hasData = data?.summary !== null && (data?.scores?.length ?? 0) > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="relative bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Amiko', fontSize: '16px', color: '#BEBEBE' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="relative bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Amiko', fontSize: '16px', color: '#FF6B6B' }}>{error}</p>
          <BottomNav />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="relative overflow-hidden bg-white"
        style={{ width: '440px', height: '956px', borderRadius: '55px' }}
      >
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0 }}
          onClick={() => navigate(`/modules/${moduleId}`)}
          style={{
            position: 'absolute', left: '28px', top: '74px',
            width: '42px', height: '42px',
            background: '#F5F6FA', border: '1px solid #D9DEEA',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(34, 43, 69, 0.05)',
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8.5 1L1.5 8L8.5 15" stroke="#222B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          style={{
            position: 'absolute', left: 0, right: 0, top: '69px',
            fontFamily: 'Amiko', fontWeight: 400, fontSize: '40px',
            lineHeight: '53px', color: '#000000', margin: 0,
            textAlign: 'center', pointerEvents: 'none',
          }}
        >
          Progress
        </motion.p>

        {/* Scrollable content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{
            position: 'absolute', top: '150px', left: '20px', right: '20px',
            bottom: '110px', overflowY: 'auto', padding: '0 10px 20px',
          }}
        >
          {/* Athlete selector for coaches */}
          {isCoach && athletes.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#888', display: 'block', marginBottom: '6px' }}>
                Viewing athlete
              </label>
              <select
                value={selectedAthleteId ?? ''}
                onChange={e => setSelectedAthleteId(e.target.value || undefined)}
                style={{
                  width: '100%', fontFamily: 'Amiko', fontSize: '14px',
                  border: '1.5px solid #E0E0E0', borderRadius: '12px',
                  padding: '8px 12px', background: CARD_BG, color: '#222',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Select an athlete…</option>
                {athletes.map(a => (
                  <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Empty / no-selection state */}
          {isCoach && !selectedAthleteId ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', paddingTop: '60px', gap: '12px',
            }}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="27" stroke={ACCENT} strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M28 18v10l6 4" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#BEBEBE', textAlign: 'center' }}>
                Select an athlete to view their score charts
              </p>
            </div>
          ) : !hasData ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', paddingTop: '60px', gap: '12px',
            }}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="27" stroke={ACCENT} strokeWidth="2" strokeOpacity="0.3"/>
                <path d="M16 40l8-12 8 6 8-18" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#BEBEBE', textAlign: 'center' }}>
                Not enough data to generate a chart
              </p>
            </div>
          ) : (
            <>
              {/* Trend + stats row */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                  <TrendBadge trend={data!.summary!.trend} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <StatCard label="Avg Score" value={data!.summary!.averageScore.toFixed(2)} />
                  <StatCard label="Avg Deductions" value={data!.summary!.averageDeductions.toFixed(2)} />
                  <StatCard label="Best" value={data!.summary!.highestScore.toFixed(2)} />
                  <StatCard label="Worst" value={data!.summary!.lowestScore.toFixed(2)} />
                </div>
              </div>

              {/* Score trend chart */}
              <div style={{ marginBottom: '24px' }}>
                <SectionHeader title="Score Trend" />
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                    <XAxis dataKey="date" tick={{ fontFamily: 'Amiko', fontSize: 10, fill: '#999' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontFamily: 'Amiko', fontSize: 10, fill: '#999' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ fontFamily: 'Amiko', fontSize: 12, borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                      formatter={(v) => [Number(v).toFixed(2), 'Score']}
                    />
                    <Line
                      type="monotone" dataKey="score"
                      stroke={ACCENT} strokeWidth={2.5}
                      dot={{ fill: ACCENT, r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Deductions chart */}
              <div style={{ marginBottom: '24px' }}>
                <SectionHeader title="Deductions" />
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEE" />
                    <XAxis dataKey="date" tick={{ fontFamily: 'Amiko', fontSize: 10, fill: '#999' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontFamily: 'Amiko', fontSize: 10, fill: '#999' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ fontFamily: 'Amiko', fontSize: 12, borderRadius: '10px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                      formatter={(v) => [Number(v).toFixed(2), 'Deductions']}
                    />
                    <Bar dataKey="deductions" fill={DEDUCTION_COLOR} radius={[6, 6, 0, 0] as [number, number, number, number]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Goal completion */}
              <div style={{ marginBottom: '16px' }}>
                <SectionHeader title="Goals" />
                {data!.goalCompletion.total === 0 ? (
                  <p style={{ fontFamily: 'Amiko', fontSize: '13px', color: '#BEBEBE', textAlign: 'center', margin: '8px 0' }}>
                    No goals assigned yet
                  </p>
                ) : (
                  <div style={{ background: CARD_BG, borderRadius: '16px', padding: '14px 18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'Amiko', fontSize: '13px', color: '#444' }}>
                        {data!.goalCompletion.completed} / {data!.goalCompletion.total} completed
                      </span>
                      <span style={{ fontFamily: 'Amiko', fontSize: '16px', fontWeight: 700, color: ACCENT }}>
                        {data!.goalCompletion.percentage}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ background: '#E0E0E0', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data!.goalCompletion.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: ACCENT, borderRadius: '8px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Recent scores list */}
              <div>
                <SectionHeader title="Recent Scores" />
                {data!.scores.slice().reverse().slice(0, 5).map(s => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: CARD_BG, borderRadius: '14px',
                    marginBottom: '8px',
                  }}>
                    <div>
                      <p style={{ fontFamily: 'Amiko', fontSize: '13px', fontWeight: 700, color: '#222', margin: 0 }}>
                        {s.eventName ?? 'Session'}
                      </p>
                      <p style={{ fontFamily: 'Amiko', fontSize: '11px', color: '#888', margin: 0 }}>
                        {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Amiko', fontSize: '16px', fontWeight: 700, color: ACCENT, margin: 0 }}>
                        {s.score.toFixed(2)}
                      </p>
                      {s.deductions > 0 && (
                        <p style={{ fontFamily: 'Amiko', fontSize: '11px', color: DEDUCTION_COLOR, margin: 0 }}>
                          -{s.deductions.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        <BottomNav />
      </div>
    </div>
  )
}
