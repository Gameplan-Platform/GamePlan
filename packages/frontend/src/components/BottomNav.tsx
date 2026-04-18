import { motion } from 'framer-motion'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

type FrontendTab = 'dashboard' | 'calendar' | 'progress' | 'roster' | 'messaging'

function getActiveTab(pathname: string): FrontendTab {
  if (pathname.includes('/calendar')) return 'calendar'
  if (pathname.includes('/progress')) return 'progress'
  if (pathname.includes('/roster')) return 'roster'
  if (pathname.includes('/messaging')) return 'messaging'
  return 'dashboard'
}

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5L12 4L20 10.5V19C20 19.5523 19.5523 20 19 20H15V14H9V20H5C4.44772 20 4 19.5523 4 19V10.5Z"
        stroke={active ? '#6166DB' : '#8F93DA'}
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
        stroke={active ? '#6166DB' : '#8F93DA'}
        strokeWidth="2"
      />
      <path
        d="M8 4V8M16 4V8M5 10H19"
        stroke={active ? '#6166DB' : '#8F93DA'}
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
        stroke={active ? '#6166DB' : '#8F93DA'}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="12"
        r="8"
        stroke={active ? '#6166DB' : '#8F93DA'}
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
        stroke={active ? '#6166DB' : '#8F93DA'}
        strokeWidth="2"
      />
      <path
        d="M6.5 18C7.4 15.8 9.4 14.5 12 14.5C14.6 14.5 16.6 15.8 17.5 18"
        stroke={active ? '#6166DB' : '#8F93DA'}
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
        stroke={active ? '#6166DB' : '#8F93DA'}
        strokeWidth="2"
      />
      <path
        d="M5 8L12 13L19 8"
        stroke={active ? '#6166DB' : '#8F93DA'}
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

const tabs: Array<{
  key: FrontendTab
  label: string
  enabled: boolean
  getPath: (moduleId: string) => string
}> = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    enabled: true,
    getPath: (moduleId) => `/modules/${moduleId}`,
  },
  {
    key: 'calendar',
    label: 'Calendar',
    enabled: true,
    getPath: (moduleId) => `/modules/${moduleId}/calendar`,
  },
  {
    key: 'progress',
    label: 'Progress',
    enabled: true,
    getPath: (moduleId) => `/modules/${moduleId}/progress`,
  },
  {
    key: 'roster',
    label: 'Roster',
    enabled: true,
    getPath: (moduleId) => `/modules/${moduleId}/roster`,
  },
  {
    key: 'messaging',
    label: 'Messaging',
    enabled: false,
    getPath: (moduleId) => `/modules/${moduleId}/messaging`,
  },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()

  const moduleId = params.id ?? params.moduleId
  if (!moduleId) return null

  const activeTab = getActiveTab(location.pathname)

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: '0 16px 16px',
        zIndex: 50,
      }}
    >
      <motion.nav
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.08 }}
        aria-label="Module navigation"
        style={{
          width: '100%',
          minHeight: '76px',
          background: '#E9E8F8',
          borderRadius: '28px',
          boxShadow: '0 10px 26px rgba(24, 28, 50, 0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <motion.button
              key={tab.key}
              type="button"
              whileHover={{
                y: -3,
                scale: 1.03,
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              onClick={() => {
                if (!tab.enabled) return
                navigate(tab.getPath(moduleId))
              }}
              style={{
                flex: 1,
                minWidth: 0,
                height: '100%',
                border: 'none',
                background: 'transparent',
                cursor: tab.enabled ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '10px 4px',
                opacity: tab.enabled ? 1 : 0.62,
                position: 'relative',
              }}
            >
              <motion.div
                animate={{
                  backgroundColor: isActive ? 'rgba(97, 102, 219, 0.14)' : 'rgba(97, 102, 219, 0)',
                  boxShadow: isActive
                    ? '0 6px 16px rgba(97, 102, 219, 0.16)'
                    : '0 0 0 rgba(0,0,0,0)',
                }}
                whileHover={{
                  backgroundColor: 'rgba(97, 102, 219, 0.10)',
                  boxShadow: '0 6px 16px rgba(97, 102, 219, 0.12)',
                }}
                transition={{ duration: 0.18 }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TabIcon tab={tab.key} active={isActive} />
              </motion.div>

              <span
                style={{
                  fontFamily: 'Amiko',
                  fontSize: '10px',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#6166DB' : '#8B90D9',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.18s ease',
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </motion.nav>
    </div>
  )
}