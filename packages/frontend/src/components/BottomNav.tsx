import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

type TabKey = 'dashboard' | 'calendar' | 'progress' | 'roster' | 'messaging'

type BottomNavProps = {
  activeTab?: TabKey
}

const spring = { type: 'spring' as const, stiffness: 120, damping: 14 }

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V19C20 19.5523 19.5523 20 19 20H15V14H9V20H5C4.44772 20 4 19.5523 4 19V10.5Z"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="5"
        y="6"
        width="14"
        height="13"
        rx="2"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2"
      />
      <path
        d="M8 4V8M16 4V8M5 10H19"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4V12L17 15"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2"
      />
    </svg>
  )
}

function RosterIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2"
      />
      <path
        d="M6.5 18C7.4 15.8 9.4 14.5 12 14.5C14.6 14.5 16.6 15.8 17.5 18"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MessagingIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="6"
        width="16"
        height="12"
        rx="2"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2"
      />
      <path
        d="M5 8L12 13L19 8"
        stroke={active ? '#6166DB' : '#7E83D7'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TabIcon({ tab, active }: { tab: TabKey; active: boolean }) {
  switch (tab) {
    case 'dashboard':
      return <DashboardIcon active={active} />
    case 'calendar':
      return <CalendarIcon active={active} />
    case 'progress':
      return <ProgressIcon active={active} />
    case 'roster':
      return <RosterIcon active={active} />
    case 'messaging':
      return <MessagingIcon active={active} />
    default:
      return null
  }
}

export default function BottomNav({ activeTab = 'dashboard' }: BottomNavProps) {
  const navigate = useNavigate()
  const [hoveredTab, setHoveredTab] = useState<TabKey | null>(null)

  const items: { key: TabKey; label: string; route?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', route: '/module-homepage' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'progress', label: 'Progress' },
    { key: 'roster', label: 'Roster' },
    { key: 'messaging', label: 'Messaging' },
  ]

  const handleClick = (item: { key: TabKey; label: string; route?: string }) => {
    if (item.route) {
      navigate(item.route)
      return
    }

    alert(`${item.label} page is not connected yet.`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.15 }}
      style={{
        position: 'absolute',
        left: '22px',
        bottom: '18px',
        width: '396px',
        height: '82px',
        background: '#E9E8F8',
        borderRadius: '28px',
        boxShadow: '0 10px 26px rgba(24, 28, 50, 0.14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 40,
      }}
    >
      {items.map((item) => {
        const isActive = item.key === activeTab
        const isHovered = hoveredTab === item.key
        const showHighlight = isActive || isHovered

        return (
          <button
            key={item.key}
            onClick={() => handleClick(item)}
            onMouseEnter={() => setHoveredTab(item.key)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              width: '64px',
              height: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: 0,
              position: 'relative',
              transition: 'transform 0.15s ease',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <TabIcon tab={item.key} active={showHighlight} />
            <span
              style={{
                fontFamily: 'Amiko',
                fontSize: '11px',
                fontWeight: showHighlight ? 700 : 600,
                color: showHighlight ? '#6166DB' : '#7E83D7',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
    </motion.div>
  )
}