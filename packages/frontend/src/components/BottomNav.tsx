import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

type BackendTab = 'home' | 'dashboard' | 'calendar' | 'progress' | 'roster' | 'messaging'
type FrontendTab = 'dashboard' | 'calendar' | 'progress' | 'roster' | 'messaging'

type BottomNavProps = {
  activeTab: FrontendTab
}

interface ModuleNavigationResponse {
  navigation: {
    moduleId: string
    moduleName: string
    moduleType?: string
    systemKey?: string | null
    tabs: BackendTab[]
  }
}

const spring = { type: 'spring' as const, stiffness: 120, damping: 14 }

function normalizeBackendTab(tab: BackendTab): FrontendTab {
  return tab === 'home' ? 'dashboard' : tab
}

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

function TabIcon({ tab, active }: { tab: FrontendTab; active: boolean }) {
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

const tabConfig: Record<FrontendTab, { label: string; subpath: string }> = {
  dashboard: { label: 'Dashboard', subpath: '' },
  calendar: { label: 'Calendar', subpath: 'calendar' },
  progress: { label: 'Progress', subpath: 'progress' },
  roster: { label: 'Roster', subpath: 'roster' },
  messaging: { label: 'Messaging', subpath: 'messaging' },
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { moduleId } = useParams<{ moduleId: string }>()
  const { token } = useAuth()
  const [hoveredTab, setHoveredTab] = useState<FrontendTab | null>(null)
  const [tabs, setTabs] = useState<FrontendTab[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!moduleId || !token) {
      setTabs([])
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadNavigation() {
      try {
        const data = await api<ModuleNavigationResponse>(`/modules/${moduleId}/navigation`, {
          token: token ?? undefined,
        })

        if (!cancelled) {
          const normalized = data.navigation.tabs.map(normalizeBackendTab)
          setTabs(Array.from(new Set(normalized)))
        }
      } catch (error) {
        console.error('Failed to load module navigation:', error)
        if (!cancelled) {
          setTabs([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadNavigation()

    return () => {
      cancelled = true
    }
  }, [moduleId, token])

  const visibleTabs = useMemo(() => tabs, [tabs])

  const handleNavigate = (tab: FrontendTab) => {
    if (!moduleId) return

    const config = tabConfig[tab]
    const target = config.subpath
      ? `/modules/${moduleId}/${config.subpath}`
      : `/modules/${moduleId}`

    if (location.pathname !== target) {
      navigate(target)
    }
  }

  if (!moduleId || loading || visibleTabs.length === 0) {
    return null
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring, delay: 0.12 }}
      aria-label="Module navigation"
      style={{
        position: 'absolute',
        left: '5%',
        right: '5%',
        bottom: '24px',
        minHeight: '76px',
        background: '#E9E8F8',
        borderRadius: '28px',
        boxShadow: '0 10px 26px rgba(24, 28, 50, 0.14)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        zIndex: 40,
      }}
    >
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab
        const isHovered = hoveredTab === tab
        const highlighted = isActive || isHovered

        return (
          <button
            key={tab}
            type="button"
            onClick={() => handleNavigate(tab)}
            onMouseEnter={() => setHoveredTab(tab)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '10px 4px',
              position: 'relative',
              transition: 'transform 0.15s ease',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <TabIcon tab={tab} active={highlighted} />
            <span
              style={{
                fontFamily: 'Amiko',
                fontSize: 'clamp(10px, 1.9vw, 11px)',
                fontWeight: highlighted ? 700 : 600,
                color: highlighted ? '#6166DB' : '#7E83D7',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {tabConfig[tab].label}
            </span>
          </button>
        )
      })}
    </motion.nav>
  )
}