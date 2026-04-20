import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { useModule } from '../context/ModuleContext'
import BottomNav from '../components/BottomNav'
import React from 'react'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

interface ModuleInfo {
  id: string
  name: string
  description?: string | null
  type?: string
  systemKey?: string | null
  joinCode?: string
  memberRole: string
}

interface Announcement {
  id: string
  title: string
  body: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
  author: { firstName: string; lastName: string }
}

interface AgendaItem {
  id: string
  title: string
  description?: string | null
  date: string
  likeCount: number
  likedByMe: boolean
  author: { firstName: string; lastName: string }
}

export default function ModuleDashboard() {
  const { id: moduleId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()
  const { setSystemKey } = useModule()

  const [moduleInfo, setModuleInfo] = useState<ModuleInfo | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [agendas, setAgendas] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showJoinCode, setShowJoinCode] = useState(false)

  const isAdmin = moduleInfo?.memberRole === 'MODULE_ADMIN'

  useEffect(() => {
    if (!moduleId || !token) return

    Promise.all([
      api<{ module: ModuleInfo }>(`/modules/${moduleId}`, { token }),
      api<{ announcements: Announcement[] }>(`/modules/${moduleId}/announcements`, { token }),
      api<{ agendas: AgendaItem[] }>(`/modules/${moduleId}/agendas`, { token }),
    ])
      .then(([modData, annData, agendaData]) => {
        setModuleInfo(modData.module)
        setSystemKey(modData.module.systemKey ?? null)
        setAnnouncements(annData.announcements)
        setAgendas(agendaData.agendas)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [moduleId, token])

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
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="relative overflow-hidden bg-white"
        style={{ width: '440px', height: '956px', borderRadius: '55px' }}
        onClick={() => setShowJoinCode(false)}
      >
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0 }}
          onClick={(e) => { e.stopPropagation(); navigate('/module-homepage') }}
          style={{
            position: 'absolute', left: '28px', top: '74px',
            width: '38px', height: '42px',
            background: 'transparent', border: '1px solid #CED3DE',
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.5,
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8.5 1L1.5 8L8.5 15" stroke="#222B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>

        {/* Dashboard title */}
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
          Dashboard
        </motion.p>

        {/* Info icon */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 0.05 }}
          onClick={(e) => { e.stopPropagation(); setShowJoinCode(prev => !prev) }}
          style={{
            position: 'absolute', right: '28px', top: '74px',
            width: '26px', height: '26px', borderRadius: '50%',
            background: 'transparent', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="12" stroke="#CED3DE" strokeWidth="2"/>
            <text x="13" y="18" textAnchor="middle" fontFamily="Amiko" fontSize="14" fontWeight="700" fill="#CED3DE">i</text>
          </svg>
        </motion.button>

        {/* Join code popup */}
        {showJoinCode && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', right: '28px', top: '108px',
              background: '#FFFFFF', borderRadius: '12px',
              padding: '10px 16px',
              boxShadow: '0px 4px 16px rgba(0,0,0,0.15)',
              fontFamily: 'Amiko', fontSize: '14px', fontWeight: 400,
              color: '#000000', zIndex: 10,
              border: '2px solid #707070',
            }}
          >
            Module Code: {moduleInfo?.joinCode ?? '—'}
          </div>
        )}

        {/* Scrollable content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{
           position: 'absolute', top: '155px', left: '20px', right: '20px',
           bottom: '110px', overflowY: 'auto', padding: '0 10px 20px',
          }}
        >
          {/* Announcements section */}
          <Section
            title="Announcements"
            isAdmin={isAdmin}
            onAdd={() => navigate(`/modules/${moduleId}/announcements/create`)}
          >
            {announcements.length === 0 ? (
              <EmptyState text="No announcements yet." />
            ) : (
              announcements.map(a => (
                <AnnouncementCard
                  key={a.id}
                  announcement={a}
                  onClick={() => navigate(`/modules/${moduleId}/announcements/${a.id}`)}
                />
              ))
            )}
          </Section>

          {/* Agenda section */}
          <Section
            title="Agenda"
            isAdmin={isAdmin}
            onAdd={() => navigate(`/modules/${moduleId}/agendas/create`)}
          >
            {agendas.length === 0 ? (
              <EmptyState text="No agenda items yet." />
            ) : (
              agendas.map(a => (
                <AgendaCard
                  key={a.id}
                  agenda={a}
                  onClick={() => navigate(`/modules/${moduleId}/agendas/${a.id}`)}
                />
              ))
            )}
          </Section>
        </motion.div>
        <BottomNav />
      </div>
    </div>
  )
}

function Section({ title, isAdmin, onAdd, children }: {
  title: string
  isAdmin: boolean
  onAdd: () => void
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Header bar */}
      <div style={{
        background: '#6166DB',
        boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
        borderRadius: '20px',
        height: '47px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        marginBottom: '18px',
      }}>
        <span style={{ fontFamily: 'Amiko', fontWeight: 400, fontSize: '20px', color: '#FFFFFF' }}>
          {title}
        </span>
      </div>

      {/* Cards — scrollable window ~3 tall */}
      <div className="section-scroll" style={{
        maxHeight: '220px', overflowY: 'scroll',
        paddingLeft: '4px', paddingRight: '20px',
      }}>
        {children}
      </div>

      {/* + button (admin only) */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            onClick={onAdd}
            style={{
              width: '54px', height: '54px', borderRadius: '50%',
              background: '#B8E466', border: 'none', cursor: 'pointer',
              boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', width: '23px', height: '23px' }}>
              <div style={{ position: 'absolute', left: '10px', top: 0, width: '3px', height: '23px', background: '#FFFFFF' }} />
              <div style={{ position: 'absolute', top: '10px', left: 0, width: '23px', height: '3px', background: '#FFFFFF' }} />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

function AnnouncementCard({ announcement: a, onClick }: { announcement: Announcement; onClick: () => void }) {
  const date = new Date(a.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '10px', cursor: 'pointer',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '45px', height: '45px', borderRadius: '100px', flexShrink: 0,
        background: 'rgba(97,102,219,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="10" r="4.5" stroke="#6166DB" strokeWidth="1.8"/>
          <path d="M4.5 22c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5" stroke="#6166DB" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Purple bubble — capped width so it doesn't stretch full row */}
        <div style={{
          background: '#55337B', borderRadius: '20px',
          padding: '4px 14px', marginBottom: '4px',
          display: 'block', overflow: 'hidden', marginRight: '8px',
        }}>
          <span style={{
            fontFamily: 'Amiko', fontWeight: 700, fontSize: '12px', color: '#FFFFFF',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            display: 'block',
          }}>
            {a.title}
          </span>
        </div>
        {/* Body */}
        <p style={{
          fontFamily: 'Amiko', fontSize: '11px', color: '#000000',
          margin: '0 0 2px 4px', lineHeight: '15px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {a.body}
        </p>
        {/* Date + author */}
        <span style={{ fontFamily: 'Amiko', fontSize: '10px', color: '#000000', paddingLeft: '4px' }}>
          {date} · {a.author.firstName} {a.author.lastName}
        </span>
      </div>

      {/* Big black right arrow */}
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none" style={{ flexShrink: 0 }}>
        <path d="M2 2L13 14L2 26" stroke="#222B45" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

function AgendaCard({ agenda: a, onClick }: { agenda: AgendaItem; onClick: () => void }) {
  const date = new Date(a.date.split('T')[0] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        marginBottom: '10px', cursor: 'pointer',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '45px', height: '45px', borderRadius: '100px', flexShrink: 0,
        background: 'rgba(97,102,219,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="10" r="4.5" stroke="#6166DB" strokeWidth="1.8"/>
          <path d="M4.5 22c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5" stroke="#6166DB" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          background: '#55337B', borderRadius: '20px',
          padding: '4px 14px', marginBottom: '4px',
          display: 'block', overflow: 'hidden', marginRight: '8px',
        }}>
          <span style={{
            fontFamily: 'Amiko', fontWeight: 700, fontSize: '12px', color: '#FFFFFF',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            display: 'block',
          }}>
            {a.title}
          </span>
        </div>
        <p style={{
          fontFamily: 'Amiko', fontSize: '11px', color: '#000000',
          margin: '0 0 2px 4px', lineHeight: '15px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {a.description ?? ''}
        </p>
        <span style={{ fontFamily: 'Amiko', fontSize: '10px', color: '#000000', paddingLeft: '4px' }}>
          {date} · {a.author.firstName} {a.author.lastName}
        </span>
      </div>

      {/* Big black right arrow */}
      <svg width="16" height="28" viewBox="0 0 16 28" fill="none" style={{ flexShrink: 0 }}>
        <path d="M2 2L13 14L2 26" stroke="#222B45" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: 'Amiko', fontSize: '13px', color: '#BEBEBE', textAlign: 'center', margin: '12px 0' }}>
      {text}
    </p>
  )
}
