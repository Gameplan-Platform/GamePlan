import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

type Goal = {
  id: number
  title: string
  completed: boolean
}

const fontFamily = '"Amiko", sans-serif'
const accent = '#6267E3'
const accentDark = '#613B97'
const green = '#B7DE58'
const pageBackground = '#F3F5FB'
const textPrimary = '#1F2937'
const textSecondary = '#8B93A7'
const cardBorder = '#EAEFF8'
const cardShadow = '0 18px 36px rgba(34, 43, 69, 0.08)'

const initialGoals: Goal[] = [
  { id: 1, title: 'Hit 0', completed: false },
  { id: 2, title: 'Upgrade elites', completed: true },
  { id: 3, title: 'Get a paid bid', completed: false },
  { id: 4, title: 'Add in punch fronts', completed: true },
]

function TopTab({
  label,
  active,
  disabled = false,
  onClick,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: '46px',
        minWidth: '168px',
        padding: '0 22px',
        borderRadius: '999px',
        border: active ? 'none' : '1px solid #E2E6F0',
        background: active ? accent : '#FFFFFF',
        color: active ? '#FFFFFF' : '#2B3140',
        fontFamily,
        fontSize: '13px',
        fontWeight: 700,
        cursor: disabled ? 'default' : 'pointer',
        boxShadow: active
          ? '0 10px 24px rgba(98, 103, 227, 0.24)'
          : '0 6px 16px rgba(34, 43, 69, 0.06)',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        opacity: disabled && !active ? 0.96 : 1,
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
  onToggle: (id: number) => void
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

export default function ProgressScreen() {
  const navigate = useNavigate()
  const { id, moduleId } = useParams<{ id: string; moduleId: string }>()
  const currentModuleId = id ?? moduleId

  const [activeTab] = useState<'goals' | 'routines'>('goals')
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [showAddRow, setShowAddRow] = useState(false)
  const [goalInput, setGoalInput] = useState('')

  const completedCount = useMemo(
    () => goals.filter(goal => goal.completed).length,
    [goals]
  )

  const percent = useMemo(() => {
    if (goals.length === 0) return 0
    return Math.round((completedCount / goals.length) * 100)
  }, [completedCount, goals])

  const toggleGoal = (goalId: number) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    )
  }

  const addGoal = () => {
    const title = goalInput.trim()
    if (!title) return

    setGoals(prev => [
      ...prev,
      {
        id: Date.now(),
        title,
        completed: false,
      },
    ])
    setGoalInput('')
    setShowAddRow(false)
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
          background: 'linear-gradient(180deg, #F9FAFE 0%, #F3F5FB 100%)',
          borderRadius: '55px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 70px rgba(34, 43, 69, 0.18)',
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
            top: '74px',
            left: '28px',
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            border: '1px solid #D9DEEA',
            background: 'rgba(255,255,255,0.94)',
            boxShadow: '0 10px 24px rgba(34, 43, 69, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
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
            top: '66px',
            left: 0,
            right: 0,
            margin: 0,
            textAlign: 'center',
            fontSize: '38px',
            fontWeight: 700,
            color: '#0F172A',
            letterSpacing: '0.01em',
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
            top: '144px',
            left: '24px',
            right: '24px',
            bottom: '112px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '18px',
            }}
          >
            <TopTab label="Goals" active={activeTab === 'goals'} />
            <TopTab label="Routines / Sections" disabled />
          </div>

          <motion.div
            whileHover={{ y: -1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            style={{
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FE 100%)',
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
                boxShadow: '0 10px 20px rgba(97, 59, 151, 0.22)',
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

            <ProgressRing percent={percent} />

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
              background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FE 100%)',
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
                boxShadow: '0 10px 20px rgba(97, 59, 151, 0.22)',
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
              {goals.map(goal => (
                <GoalRow key={goal.id} goal={goal} onToggle={toggleGoal} />
              ))}
            </div>

            <div style={{ marginTop: '16px' }}>
              <AnimatePresence mode="wait">
                {!showAddRow ? (
                  <motion.button
                    key="collapsed-add"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => setShowAddRow(true)}
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '999px',
                      border: '1px solid #E8ECF5',
                      background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFCFF 100%)',
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
                    key="expanded-add"
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
                            setShowAddRow(false)
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
                          setShowAddRow(false)
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
          </motion.div>
        </motion.div>

        <BottomNav />
      </div>
    </div>
  )
}