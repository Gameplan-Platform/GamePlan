import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

type Goal = {
  id: string
  title: string
  completed: boolean
  athleteId: string
}

type Deduction = {
  id?: string
  category: string
  value: number
  notes?: string | null
}

type Routine = {
  id: string
  title: string
  date: string
  notes: string | null
  athleteId: string
  deductions: Deduction[]
}

const fontFamily = '"Amiko", sans-serif'
const accent = '#6267E3'
const accentDark = '#613B97'
const green = '#B7DE58'
const pageBackground = '#F3F4F6'
const textPrimary = '#1F2937'
const textSecondary = '#8B93A7'
const cardBorder = '#EAEFF8'
const cardShadow = '0 18px 36px rgba(34, 43, 69, 0.08)'
const hoverTransition = { type: 'spring' as const, stiffness: 320, damping: 22 }

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function parseUserId(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId ?? ''
  } catch {
    return ''
  }
}

function ymd(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function todayYmd() {
  return ymd(new Date())
}

function formatPrettyDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMonth(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const start = new Date(year, month, 1 - firstDay.getDay())

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return day
  })
}

function TopTab({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: '44px',
        minWidth: '160px',
        padding: '0 20px',
        borderRadius: '999px',
        border: active ? 'none' : '1px solid #E2E6F0',
        background: active ? accent : '#FFFFFF',
        color: active ? '#FFFFFF' : '#2B3140',
        fontFamily,
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: active
          ? '0 10px 24px rgba(98, 103, 227, 0.22)'
          : '0 6px 16px rgba(34, 43, 69, 0.05)',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 92
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percent / 100) * circumference

  return (
    <div
      style={{
        position: 'relative',
        width: '252px',
        height: '252px',
        margin: '0 auto',
      }}
    >
      <svg width="252" height="252" viewBox="0 0 252 252">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6F74F3" />
            <stop offset="100%" stopColor="#5E63DB" />
          </linearGradient>
        </defs>

        <circle
          cx="126"
          cy="126"
          r={radius}
          fill="none"
          stroke="#DCDFF5"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <circle
          cx="126"
          cy="126"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 126 126)"
          style={{
            filter: 'drop-shadow(0 10px 18px rgba(98, 103, 227, 0.18))',
            transition: 'stroke-dashoffset 0.45s ease',
          }}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: '34px',
            fontWeight: 700,
            color: '#111827',
            lineHeight: 1,
          }}
        >
          {percent}%
        </div>
      </div>
    </div>
  )
}

function GoalRow({
  goal,
  onToggle,
}: {
  goal: Goal
  onToggle: (id: string) => void
}) {
  return (
    <motion.button
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      onClick={() => onToggle(goal.id)}
      style={{
        width: '100%',
        minHeight: '48px',
        border: '1px solid #EEF2F8',
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'left',
        cursor: 'pointer',
        boxShadow: '0 8px 22px rgba(34, 43, 69, 0.08)',
      }}
    >
      <div
        style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          background: goal.completed ? green : '#D9D9D9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {goal.completed ? (
          <span
            style={{
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ✓
          </span>
        ) : null}
      </div>

      <span
        style={{
          fontFamily,
          fontSize: '14px',
          fontWeight: 600,
          color: textPrimary,
          textDecoration: goal.completed ? 'line-through' : 'none',
          opacity: goal.completed ? 0.72 : 1,
        }}
      >
        {goal.title}
      </span>
    </motion.button>
  )
}

function RoutineCard({
  routine,
  canManage,
  onView,
  onEdit,
  onDelete,
}: {
  routine: Routine
  canManage: boolean
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      whileHover={{ y: -1.5 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        padding: '16px',
        border: '1px solid #EEF2F8',
        boxShadow: '0 10px 24px rgba(34, 43, 69, 0.08)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <div style={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={onView}>
          <div
            style={{
              fontFamily,
              fontSize: '15px',
              fontWeight: 700,
              color: textPrimary,
              marginBottom: routine.notes ? '8px' : 0,
            }}
          >
            {routine.title}
          </div>

          {routine.notes ? (
            <div
              style={{
                fontFamily,
                fontSize: '12px',
                lineHeight: 1.5,
                color: textSecondary,
              }}
            >
              {routine.notes}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {canManage && (
            <>
              <button
                onClick={onEdit}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid #E8ECF6',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 20H8L18.5 9.5C19.3 8.7 19.3 7.3 18.5 6.5L17.5 5.5C16.7 4.7 15.3 4.7 14.5 5.5L4 16V20Z"
                    stroke="#6166DB"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                onClick={onDelete}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  border: '1px solid #F3D6D6',
                  background: '#FFF7F7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 7H18M9 7V5H15V7M8 7L9 19H15L16 7"
                    stroke="#D85050"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          )}

          <button
            onClick={onView}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: '1px solid #E8ECF6',
              background: '#F5F6FA',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="#6166DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function MiniCalendar({
  selectedDate,
  onSelect,
  onClose,
}: {
  selectedDate: string
  onSelect: (date: string) => void
  onClose: () => void
}) {
  const [viewDate, setViewDate] = useState(() => {
    const [year, month] = selectedDate.split('-').map(Number)
    return new Date(year, (month || 1) - 1, 1)
  })

  const cells = buildCalendarDays(viewDate)
  const currentMonth = viewDate.getMonth()

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '100%',
        maxWidth: '250px',
        background: '#E9E8F8',
        borderRadius: '16px',
        padding: '14px',
        boxShadow: '0 14px 28px rgba(24, 28, 50, 0.18)',
        zIndex: 80,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          fontFamily: 'Amiko',
          fontSize: '11px',
          color: '#6A6FBF',
        }}
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={() =>
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
          }
          style={{
            border: 'none',
            background: 'transparent',
            color: '#6A6FBF',
            cursor: 'pointer',
          }}
        >
          ‹
        </motion.button>

        <span style={{ fontWeight: 700 }}>{formatMonth(viewDate)}</span>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={() =>
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
          }
          style={{
            border: 'none',
            background: 'transparent',
            color: '#6A6FBF',
            cursor: 'pointer',
          }}
        >
          ›
        </motion.button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
        }}
      >
        {DAYS.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontFamily: 'Amiko',
              fontSize: '10px',
              color: '#8D8DA8',
            }}
          >
            {day}
          </div>
        ))}

        {cells.map((day) => {
          const dayString = ymd(day)
          const isSelected = dayString === selectedDate
          const isCurrentMonth = day.getMonth() === currentMonth

          return (
            <motion.button
              key={dayString}
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={hoverTransition}
              onClick={() => {
                onSelect(dayString)
                onClose()
              }}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: 'none',
                background: isSelected ? '#6166DB' : 'transparent',
                color: isSelected ? '#FFFFFF' : isCurrentMonth ? '#3E4272' : '#B6B7CB',
                fontFamily: 'Amiko',
                fontSize: '10px',
                cursor: 'pointer',
                justifySelf: 'center',
              }}
            >
              {day.getDate()}
            </motion.button>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#8D8DA8',
            fontFamily: 'Amiko',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={() => {
            onSelect(todayYmd())
            onClose()
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#6166DB',
            fontFamily: 'Amiko',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Today
        </motion.button>
      </div>
    </div>
  )
}

export default function ProgressScreen() {
  const navigate = useNavigate()
  const { id, moduleId } = useParams<{ id: string; moduleId: string }>()
  const currentModuleId = id ?? moduleId
  const { role, token } = useAuth()

  const [activeTab, setActiveTab] = useState<'goals' | 'routines'>('goals')

  const [goals, setGoals] = useState<Goal[]>([])
  const [goalsLoading, setGoalsLoading] = useState(true)
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  const defaultRoutineDate = todayYmd()

  const [selectedRoutineDate, setSelectedRoutineDate] = useState(defaultRoutineDate)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [routines, setRoutines] = useState<Routine[]>([])
  const [routinesLoading, setRoutinesLoading] = useState(true)

  const [showRoutineModal, setShowRoutineModal] = useState(false)
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null)
  const [routineTitle, setRoutineTitle] = useState('')
  const [routineNotes, setRoutineNotes] = useState('')
  const [routineDeductions, setRoutineDeductions] = useState<Deduction[]>([])
  const [savingRoutine, setSavingRoutine] = useState(false)

  const canManageRoutines = role === 'COACH'

  useEffect(() => {
    if (!currentModuleId || !token) return

    let cancelled = false

    setGoalsLoading(true)
    api<Goal[]>(`/modules/${currentModuleId}/goals`, { token })
      .then(data => {
        if (!cancelled) setGoals(data)
      })
      .catch(error => {
        if (!cancelled) console.error('Failed to load goals', error)
      })
      .finally(() => {
        if (!cancelled) setGoalsLoading(false)
      })

    setRoutinesLoading(true)
    api<Routine[]>(`/modules/${currentModuleId}/routines`, { token })
      .then(data => {
        if (!cancelled) setRoutines(data)
      })
      .catch(error => {
        if (!cancelled) console.error('Failed to load routines', error)
      })
      .finally(() => {
        if (!cancelled) setRoutinesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [currentModuleId, token])

  const completedCount = useMemo(
    () => goals.filter(goal => goal.completed).length,
    [goals]
  )

  const goalPercent = useMemo(() => {
    if (goals.length === 0) return 0
    return Math.round((completedCount / goals.length) * 100)
  }, [completedCount, goals])

  const routinesForSelectedDate = useMemo(
    () => routines.filter(r => r.date.slice(0, 10) === selectedRoutineDate),
    [routines, selectedRoutineDate]
  )

  const toggleGoal = async (goalId: string) => {
    if (!token) return
    const previous = goals
    const target = previous.find(g => g.id === goalId)
    if (!target) return

    const nextCompleted = !target.completed
    setGoals(prev =>
      prev.map(goal =>
        goal.id === goalId ? { ...goal, completed: nextCompleted } : goal
      )
    )

    try {
      await api<{ goal: Goal }>(`/goals/${goalId}`, {
        method: 'PATCH',
        body: { completed: nextCompleted },
        token,
      })
    } catch (error) {
      console.error('Failed to update goal', error)
      setGoals(previous)
    }
  }

  const addGoal = async () => {
    const title = goalInput.trim()
    if (!title || !currentModuleId || !token) return

    try {
      const res = await api<{ goal: Goal }>(
        `/modules/${currentModuleId}/goals`,
        {
          method: 'POST',
          body: { title, athleteId: parseUserId(token) },
          token,
        }
      )
      setGoals(prev => [...prev, res.goal])
      setGoalInput('')
      setShowAddGoal(false)
    } catch (error) {
      console.error('Failed to add goal', error)
    }
  }

  const openNewRoutine = () => {
    setEditingRoutineId(null)
    setRoutineTitle('')
    setRoutineNotes('')
    setRoutineDeductions([])
    setShowRoutineModal(true)
  }

  const openEditRoutine = (routine: Routine) => {
    setEditingRoutineId(routine.id)
    setRoutineTitle(routine.title)
    setRoutineNotes(routine.notes ?? '')
    setRoutineDeductions(routine.deductions.map(d => ({ ...d })))
    setShowRoutineModal(true)
  }

  const closeRoutineModal = () => {
    setShowRoutineModal(false)
    setEditingRoutineId(null)
    setRoutineTitle('')
    setRoutineNotes('')
    setRoutineDeductions([])
  }

  const addDeductionRow = () => {
    setRoutineDeductions(prev => [...prev, { category: '', value: 0, notes: '' }])
  }

  const updateDeductionRow = (index: number, patch: Partial<Deduction>) => {
    setRoutineDeductions(prev =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row))
    )
  }

  const removeDeductionRow = (index: number) => {
    setRoutineDeductions(prev => prev.filter((_, i) => i !== index))
  }

  const saveRoutine = async () => {
    const trimmedTitle = routineTitle.trim()
    if (!trimmedTitle || !currentModuleId || !token) return

    const cleanedDeductions = routineDeductions
      .map(d => ({
        category: d.category.trim(),
        value: Number(d.value) || 0,
        notes: d.notes?.toString().trim() || undefined,
      }))
      .filter(d => d.category.length > 0)

    setSavingRoutine(true)
    try {
      if (editingRoutineId !== null) {
        const res = await api<{ routine: Routine }>(`/routines/${editingRoutineId}`, {
          method: 'PATCH',
          body: {
            title: trimmedTitle,
            notes: routineNotes.trim() || null,
            deductions: cleanedDeductions,
          },
          token,
        })
        setRoutines(prev => prev.map(r => (r.id === res.routine.id ? res.routine : r)))
      } else {
        const res = await api<{ routine: Routine }>(
          `/modules/${currentModuleId}/routines`,
          {
            method: 'POST',
            body: {
              title: trimmedTitle,
              date: selectedRoutineDate,
              athleteId: parseUserId(token),
              notes: routineNotes.trim() || undefined,
              deductions: cleanedDeductions,
            },
            token,
          }
        )
        setRoutines(prev => [res.routine, ...prev])
      }
      closeRoutineModal()
    } catch (error) {
      console.error('Failed to save routine', error)
    } finally {
      setSavingRoutine(false)
    }
  }

  const deleteRoutine = async (routineId: string) => {
    if (!token) return
    const previous = routines
    setRoutines(prev => prev.filter(r => r.id !== routineId))

    try {
      await api(`/routines/${routineId}`, { method: 'DELETE', token })
    } catch (error) {
      console.error('Failed to delete routine', error)
      setRoutines(previous)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: pageBackground,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '440px',
          height: '956px',
          background: '#FCFCFE',
          borderRadius: '55px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 70px rgba(34, 43, 69, 0.10)',
          fontFamily,
        }}
      >
        <style>
          {`@import url('https://fonts.googleapis.com/css2?family=Amiko:wght@400;600;700&display=swap');`}
        </style>

        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22 }}
          onClick={() =>
            navigate(
              currentModuleId ? `/modules/${currentModuleId}` : '/module-homepage'
            )
          }
          style={{
            position: 'absolute',
            top: '52px',
            left: '28px',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            border: '1px solid #D9DEEA',
            background: '#F5F6FA',
            boxShadow: '0 6px 16px rgba(34, 43, 69, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 4,
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path
              d="M8.5 1L1.5 8L8.5 15"
              stroke="#222B45"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.03 }}
          style={{
            position: 'absolute',
            top: '50px',
            left: 0,
            right: 0,
            margin: 0,
            textAlign: 'center',
            fontSize: '32px',
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '0.01em',
            zIndex: 4,
          }}
        >
          Progress
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          style={{
            position: 'absolute',
            top: '104px',
            left: '24px',
            right: '24px',
            bottom: '112px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 3,
              background:
                'linear-gradient(180deg, rgba(252,252,254,0.98) 0%, rgba(252,252,254,0.96) 82%, rgba(252,252,254,0) 100%)',
              paddingBottom: '14px',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                paddingTop: '4px',
              }}
            >
              <TopTab
                label="Goals"
                active={activeTab === 'goals'}
                onClick={() => setActiveTab('goals')}
              />
              <TopTab
                label="Routines / Sections"
                active={activeTab === 'routines'}
                onClick={() => setActiveTab('routines')}
              />
            </div>
          </div>

          {activeTab === 'goals' ? (
            <>
              <motion.div
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '26px',
                  padding: '18px 18px 20px',
                  boxShadow: cardShadow,
                  border: `1px solid ${cardBorder}`,
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    height: '42px',
                    borderRadius: '16px',
                    background: `linear-gradient(90deg, ${accentDark} 0%, #6A419F 100%)`,
                    boxShadow: '0 10px 20px rgba(97, 59, 151, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    marginBottom: '18px',
                  }}
                >
                  <span
                    style={{
                      fontFamily,
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Completion
                  </span>
                </div>

                <ProgressRing percent={goalPercent} />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginTop: '18px',
                  }}
                >
                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      padding: '14px',
                      boxShadow: '0 8px 20px rgba(34, 43, 69, 0.05)',
                      border: '1px solid #EEF1F8',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        color: textSecondary,
                        marginBottom: '6px',
                        fontWeight: 600,
                      }}
                    >
                      Completed goals
                    </div>
                    <div
                      style={{
                        fontSize: '22px',
                        color: textPrimary,
                        fontWeight: 700,
                      }}
                    >
                      {completedCount}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '18px',
                      padding: '14px',
                      boxShadow: '0 8px 20px rgba(34, 43, 69, 0.05)',
                      border: '1px solid #EEF1F8',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        color: textSecondary,
                        marginBottom: '6px',
                        fontWeight: 600,
                      }}
                    >
                      Total goals
                    </div>
                    <div
                      style={{
                        fontSize: '22px',
                        color: textPrimary,
                        fontWeight: 700,
                      }}
                    >
                      {goals.length}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '26px',
                  padding: '18px',
                  boxShadow: cardShadow,
                  border: `1px solid ${cardBorder}`,
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    height: '42px',
                    borderRadius: '16px',
                    background: `linear-gradient(90deg, ${accentDark} 0%, #6A419F 100%)`,
                    boxShadow: '0 10px 20px rgba(97, 59, 151, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    marginBottom: '18px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Goals
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.82)',
                    }}
                  >
                    {completedCount}/{goals.length}
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  {goals.length > 0 ? (
                    goals.map(goal => (
                      <GoalRow key={goal.id} goal={goal} onToggle={toggleGoal} />
                    ))
                  ) : (
                    <div
                      style={{
                        borderRadius: '16px',
                        border: '1px dashed #D9DEEB',
                        background: '#FCFCFF',
                        padding: '20px 14px',
                        textAlign: 'center',
                        fontFamily,
                        fontSize: '13px',
                        color: textSecondary,
                      }}
                    >
                      {goalsLoading ? 'Loading goals…' : 'No goals assigned yet.'}
                    </div>
                  )}
                </div>

                {canManageRoutines ? (
                <div style={{ marginTop: '16px' }}>
                  <AnimatePresence mode="wait">
                    {!showAddGoal ? (
                      <motion.button
                        key="collapsed-add-goal"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        onClick={() => setShowAddGoal(true)}
                        style={{
                          width: '100%',
                          height: '46px',
                          borderRadius: '999px',
                          border: '1px solid #E8ECF5',
                          background: '#FFFFFF',
                          boxShadow: '0 12px 24px rgba(34, 43, 69, 0.07)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: green,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '18px',
                            fontWeight: 700,
                            lineHeight: 1,
                            boxShadow: '0 10px 18px rgba(183, 222, 88, 0.3)',
                          }}
                        >
                          +
                        </div>
                      </motion.button>
                    ) : (
                      <motion.div
                        key="expanded-add-goal"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            minHeight: '50px',
                            borderRadius: '18px',
                            background: '#FFFFFF',
                            border: '1px solid #EEF1F8',
                            boxShadow: '0 12px 24px rgba(34, 43, 69, 0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 14px',
                            gap: '10px',
                          }}
                        >
                          <div
                            style={{
                              color: green,
                              fontSize: '18px',
                              lineHeight: 1,
                            }}
                          >
                            ✦
                          </div>

                          <input
                            value={goalInput}
                            onChange={e => setGoalInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') addGoal()
                              if (e.key === 'Escape') {
                                setShowAddGoal(false)
                                setGoalInput('')
                              }
                            }}
                            placeholder="Title"
                            autoFocus
                            style={{
                              flex: 1,
                              border: 'none',
                              outline: 'none',
                              background: 'transparent',
                              fontFamily,
                              fontSize: '14px',
                              fontWeight: 600,
                              color: textPrimary,
                            }}
                          />

                          <button
                            onClick={() => {
                              setShowAddGoal(false)
                              setGoalInput('')
                            }}
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              border: 'none',
                              background: '#D94C4C',
                              color: '#FFFFFF',
                              fontSize: '14px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              lineHeight: 1,
                              flexShrink: 0,
                            }}
                          >
                            ×
                          </button>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={addGoal}
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            border: 'none',
                            background: green,
                            color: '#FFFFFF',
                            fontSize: '30px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 14px 24px rgba(183, 222, 88, 0.34)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                            flexShrink: 0,
                          }}
                        >
                          +
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                ) : null}
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '26px',
                  padding: '18px',
                  boxShadow: cardShadow,
                  border: `1px solid ${cardBorder}`,
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    fontFamily,
                    fontSize: '18px',
                    fontWeight: 700,
                    color: textPrimary,
                    marginBottom: '6px',
                  }}
                >
                  Routine Schedule
                </div>

                <div
                  style={{
                    fontFamily,
                    fontSize: '12px',
                    lineHeight: 1.5,
                    color: textSecondary,
                    marginBottom: '16px',
                  }}
                >
                  Select a practice date to view or build that day&apos;s routine.
                </div>

                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '100%',
                      minHeight: '40px',
                      background: '#FFFFFF',
                      border: '1px solid #C7C8E7',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '8px 10px',
                      fontFamily: 'Amiko',
                      fontSize: '12px',
                      color: '#4A4E7A',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span>{formatPrettyDate(selectedRoutineDate)}</span>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.96 }}
                      transition={hoverTransition}
                      onClick={() => setCalendarOpen(prev => !prev)}
                      style={{
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        padding: 0,
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="6" width="14" height="13" rx="2" stroke="#6166DB" strokeWidth="2" />
                        <path d="M8 4V8M16 4V8M5 10H19" stroke="#6166DB" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </motion.button>
                  </div>

                  {calendarOpen && (
                    <MiniCalendar
                      selectedDate={selectedRoutineDate}
                      onSelect={setSelectedRoutineDate}
                      onClose={() => setCalendarOpen(false)}
                    />
                  )}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '26px',
                  padding: '18px',
                  boxShadow: cardShadow,
                  border: `1px solid ${cardBorder}`,
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    height: '42px',
                    borderRadius: '16px',
                    background: `linear-gradient(90deg, ${accentDark} 0%, #6A419F 100%)`,
                    boxShadow: '0 10px 20px rgba(97, 59, 151, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    marginBottom: '18px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Routines for {formatPrettyDate(selectedRoutineDate)}
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.82)',
                    }}
                  >
                    {routinesForSelectedDate.length}
                  </span>
                </div>

                {routinesForSelectedDate.length > 0 ? (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {routinesForSelectedDate.map(routine => (
                      <RoutineCard
                        key={routine.id}
                        routine={routine}
                        canManage={canManageRoutines}
                        onView={() => navigate(`/modules/${currentModuleId}/routines/${routine.id}`)}
                        onEdit={() => openEditRoutine(routine)}
                        onDelete={() => deleteRoutine(routine.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: '20px',
                      border: '1px dashed #D9DEEB',
                      background: '#FCFCFF',
                      padding: '24px 18px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontFamily,
                        fontSize: '15px',
                        fontWeight: 700,
                        color: textPrimary,
                        marginBottom: '6px',
                      }}
                    >
                      {routinesLoading ? 'Loading routines…' : 'No routines for this date yet'}
                    </div>

                    <div
                      style={{
                        fontFamily,
                        fontSize: '12px',
                        color: textSecondary,
                        lineHeight: 1.5,
                      }}
                    >
                      {canManageRoutines
                        ? 'Create the first routine for this practice day.'
                        : 'Your coach has not added routines for this date yet.'}
                    </div>
                  </div>
                )}

                {canManageRoutines ? (
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={openNewRoutine}
                    style={{
                      width: '100%',
                      height: '48px',
                      marginTop: '16px',
                      borderRadius: '16px',
                      border: '1px solid #E7EBF5',
                      background: '#FFFFFF',
                      boxShadow: '0 10px 24px rgba(34, 43, 69, 0.07)',
                      fontFamily,
                      fontSize: '14px',
                      fontWeight: 700,
                      color: textPrimary,
                      cursor: 'pointer',
                    }}
                  >
                    + Add Routine
                  </motion.button>
                ) : null}
              </motion.div>

              <button
                onClick={() => navigate(`/modules/${currentModuleId}/progress/stats`)}
                style={{
                  width: '100%',
                  height: '46px',
                  border: 'none',
                  borderRadius: '999px',
                  background: `linear-gradient(90deg, ${accentDark} 0%, #6A419F 100%)`,
                  boxShadow: '0 10px 20px rgba(97, 59, 151, 0.18)',
                  color: '#FFFFFF',
                  fontFamily,
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '28px',
                }}
              >
                See Comprehensive Stats
              </button>
            </>
          )}
        </motion.div>

        <AnimatePresence>
          {showRoutineModal ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.24)',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  background: '#FFFFFF',
                  borderRadius: '26px',
                  border: '1px solid #EEF2F8',
                  boxShadow: '0 26px 50px rgba(15, 23, 42, 0.16)',
                  padding: '22px',
                }}
              >
                <div
                  style={{
                    fontFamily,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: textPrimary,
                    marginBottom: '8px',
                  }}
                >
                  {editingRoutineId !== null ? 'Edit Routine' : 'Add Routine'}
                </div>

                <div
                  style={{
                    fontFamily,
                    fontSize: '12px',
                    color: textSecondary,
                    lineHeight: 1.5,
                    marginBottom: '18px',
                  }}
                >
                  Build the routine for {formatPrettyDate(selectedRoutineDate)}.
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: textSecondary,
                      marginBottom: '8px',
                    }}
                  >
                    Routine Title
                  </label>

                  <input
                    value={routineTitle}
                    onChange={e => setRoutineTitle(e.target.value)}
                    placeholder="Ex. Full Out 1"
                    autoFocus
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '14px',
                      border: '1px solid #DFE5F0',
                      padding: '0 14px',
                      fontFamily,
                      fontSize: '14px',
                      color: textPrimary,
                      background: '#FBFCFF',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontFamily,
                      fontSize: '12px',
                      fontWeight: 700,
                      color: textSecondary,
                      marginBottom: '8px',
                    }}
                  >
                    Notes
                  </label>

                  <textarea
                    value={routineNotes}
                    onChange={e => setRoutineNotes(e.target.value)}
                    placeholder="Optional details for athletes and parents"
                    rows={4}
                    style={{
                      width: '100%',
                      borderRadius: '14px',
                      border: '1px solid #DFE5F0',
                      padding: '12px 14px',
                      fontFamily,
                      fontSize: '14px',
                      color: textPrimary,
                      background: '#FBFCFF',
                      outline: 'none',
                      resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <label
                      style={{
                        fontFamily,
                        fontSize: '12px',
                        fontWeight: 700,
                        color: textSecondary,
                      }}
                    >
                      Deductions
                    </label>
                    <button
                      type="button"
                      onClick={addDeductionRow}
                      style={{
                        height: '28px',
                        padding: '0 12px',
                        borderRadius: '999px',
                        border: '1px solid #DFE5F0',
                        background: '#FFFFFF',
                        fontFamily,
                        fontSize: '12px',
                        fontWeight: 700,
                        color: accent,
                        cursor: 'pointer',
                      }}
                    >
                      + Add
                    </button>
                  </div>

                  {routineDeductions.length === 0 ? (
                    <div
                      style={{
                        borderRadius: '12px',
                        border: '1px dashed #DFE5F0',
                        padding: '10px 12px',
                        fontFamily,
                        fontSize: '12px',
                        color: textSecondary,
                      }}
                    >
                      No deductions recorded yet.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {routineDeductions.map((row, i) => (
                        <div
                          key={row.id ?? `new-${i}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 72px 28px',
                            gap: '8px',
                            alignItems: 'center',
                          }}
                        >
                          <input
                            value={row.category}
                            onChange={e =>
                              updateDeductionRow(i, { category: e.target.value })
                            }
                            placeholder="Category (e.g. Tumbling)"
                            style={{
                              height: '38px',
                              borderRadius: '10px',
                              border: '1px solid #DFE5F0',
                              padding: '0 10px',
                              fontFamily,
                              fontSize: '13px',
                              color: textPrimary,
                              background: '#FBFCFF',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          <input
                            type="number"
                            step="0.05"
                            value={row.value}
                            onChange={e =>
                              updateDeductionRow(i, { value: Number(e.target.value) })
                            }
                            placeholder="0.0"
                            style={{
                              height: '38px',
                              borderRadius: '10px',
                              border: '1px solid #DFE5F0',
                              padding: '0 10px',
                              fontFamily,
                              fontSize: '13px',
                              color: textPrimary,
                              background: '#FBFCFF',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeDeductionRow(i)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              border: 'none',
                              background: '#D94C4C',
                              color: '#FFFFFF',
                              fontSize: '14px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              lineHeight: 1,
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                  }}
                >
                  <button
                    onClick={closeRoutineModal}
                    style={{
                      height: '42px',
                      padding: '0 16px',
                      borderRadius: '12px',
                      border: '1px solid #DFE5F0',
                      background: '#FFFFFF',
                      fontFamily,
                      fontSize: '13px',
                      fontWeight: 700,
                      color: textPrimary,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveRoutine}
                    disabled={savingRoutine}
                    style={{
                      height: '42px',
                      padding: '0 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: accent,
                      fontFamily,
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      cursor: savingRoutine ? 'not-allowed' : 'pointer',
                      opacity: savingRoutine ? 0.7 : 1,
                      boxShadow: '0 10px 20px rgba(98, 103, 227, 0.24)',
                    }}
                  >
                    {savingRoutine
                      ? 'Saving…'
                      : editingRoutineId !== null
                        ? 'Save Changes'
                        : 'Add Routine'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <BottomNav />
      </div>
    </div>
  )
}