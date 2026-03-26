import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import AnnouncementFeed, { type Announcement } from '../components/AnnouncementFeed'
import CreateAnnouncementForm from '../components/CreateAnnouncementForm'
import AgendaFeed, { type AgendaItem } from '../components/AgendaFeed'
import CreateAgendaForm from '../components/CreateAgendaForm'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

type Tab = 'announcements' | 'agenda'

interface ModuleInfo {
  id: string
  name: string
  description?: string | null
  type?: string
  systemKey?: string | null
}

export default function ModulePage() {
  const { id: moduleId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token, role } = useAuth()
  const isCoach = role === 'COACH'

  const [activeTab, setActiveTab] = useState<Tab>('announcements')
  const [moduleInfo, setModuleInfo] = useState<ModuleInfo | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [agendas, setAgendas] = useState<AgendaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!moduleId || !token) return

    Promise.all([
      api<{ module: ModuleInfo }>(`/modules/${moduleId}`, { token }),
      api<{ announcements: Announcement[] }>(`/modules/${moduleId}/announcements`, { token }),
      api<{ agendas: AgendaItem[] }>(`/modules/${moduleId}/agendas`, { token }),
    ])
      .then(([modData, annData, agendaData]) => {
        setModuleInfo(modData.module)
        setAnnouncements(annData.announcements)
        setAgendas(agendaData.agendas)
      })
      .catch(err => {
        const msg = err instanceof Error ? err.message : 'Failed to load'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [moduleId, token])

  const handleAnnouncementCreated = (announcement: Announcement) => {
    setAnnouncements(prev => [announcement, ...prev])
  }

  const handleAgendaCreated = (agenda: AgendaItem) => {
    setAgendas(prev => {
      const updated = [...prev, agenda]
      return updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })
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
          onClick={() => navigate('/module-homepage')}
          style={{
            position: 'absolute', left: '30px', top: '60px',
            width: '85px', height: '32px',
            background: '#6166DB', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
            borderRadius: '40px', border: 'none',
            fontFamily: 'Amiko', fontWeight: 600, fontSize: '15px',
            color: '#FFFFFF', cursor: 'pointer',
          }}
        >
          ← Back
        </motion.button>

        {/* Module name */}
        <motion.p
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          style={{
            position: 'absolute', left: '30px', top: '108px',
            fontFamily: 'Amiko', fontWeight: 700, fontSize: '28px',
            color: '#262626', margin: 0,
            maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {moduleInfo?.name ?? ''}
        </motion.p>

        {/* Tab bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          style={{
            position: 'absolute', left: '30px', right: '30px', top: '152px',
            display: 'flex', gap: '8px',
          }}
        >
          {(['announcements', 'agenda'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, height: '32px', border: 'none', borderRadius: '40px',
                fontFamily: 'Amiko', fontWeight: 600, fontSize: '13px',
                cursor: 'pointer',
                background: activeTab === tab ? '#6166DB' : '#F0F0F0',
                color: activeTab === tab ? '#FFFFFF' : '#888888',
                textTransform: 'capitalize',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {tab === 'announcements' ? 'Announcements' : 'Agenda'}
            </button>
          ))}
        </motion.div>

        {/* Scrollable content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          style={{
            position: 'absolute', top: '196px', left: '20px', right: '20px',
            bottom: '30px', overflowY: 'auto', padding: '10px 10px 20px',
          }}
        >
          {loading ? (
            <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#BEBEBE', textAlign: 'center', marginTop: '40px' }}>
              Loading...
            </p>
          ) : error ? (
            <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#FF6B6B', textAlign: 'center', marginTop: '40px' }}>
              {error}
            </p>
          ) : activeTab === 'announcements' ? (
            <>
              {isCoach && moduleId && token && (
                <CreateAnnouncementForm
                  moduleId={moduleId}
                  token={token}
                  onCreated={handleAnnouncementCreated}
                />
              )}
              <AnnouncementFeed announcements={announcements} moduleId={moduleId!} token={token} />
            </>
          ) : (
            <>
              {isCoach && moduleId && token && (
                <CreateAgendaForm
                  moduleId={moduleId}
                  token={token}
                  onCreated={handleAgendaCreated}
                />
              )}
              <AgendaFeed agendas={agendas} moduleId={moduleId!} token={token} />
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
