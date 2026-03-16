import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

function cardColor(systemKey: string | null | undefined, index: number): string {
  if (systemKey === 'gym') return 'rgba(184, 228, 102, 0.48)'
  if (systemKey === 'staff') return 'rgba(85, 51, 123, 0.62)'
  const customs = ['rgba(97, 102, 219, 0.43)', 'rgba(184, 228, 102, 0.48)', 'rgba(85, 51, 123, 0.62)']
  return customs[index % customs.length]
}

interface Module {
  id: string
  name: string
  type?: string
  systemKey?: string | null
  joinCode?: string
}

export default function ModuleHomepage() {
  const navigate = useNavigate()
  const { token, role, logout } = useAuth()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [openCodeId, setOpenCodeId] = useState<string | null>(null)
  const isCoach = role === 'COACH'

  useEffect(() => {
    api<{ modules: Module[] }>('/modules', { token: token ?? undefined })
      .then(data => setModules(data.modules))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const visibleModules = isCoach
    ? modules
    : modules.filter(m => m.systemKey !== 'staff')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0 }}
          style={{ position: 'absolute', left: '134px', top: '83px', fontFamily: 'Amiko', fontWeight: 700, fontSize: '40px', lineHeight: '53px', color: '#000000', margin: 0 }}>
          Modules
        </motion.p>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.4 }}
          onClick={handleLogout}
          style={{
            position: 'absolute', left: '30px', top: '88px',
            width: '85px', height: '32px',
            background: '#6166DB', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
            borderRadius: '40px', border: 'none',
            fontFamily: 'Amiko', fontWeight: 600, fontSize: '16px',
            color: '#FFFFFF', cursor: 'pointer',
          }}>
          Log Out
        </motion.button>

        {/* Module cards */}
        {loading ? (
          <p style={{ position: 'absolute', top: '300px', left: 0, right: 0, textAlign: 'center', fontFamily: 'Amiko', color: '#262626' }}>
            Loading...
          </p>
        ) : (
          visibleModules.map((mod, i) => {
            const col = i % 2
            const row = Math.floor(i / 2)
            const left = col === 0 ? 35 : 237
            const top = 174 + row * 218
            const color = cardColor(mod.systemKey, i)

            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.1 + i * 0.08 }}
                style={{
                  position: 'absolute', left, top,
                  width: '165px', height: '166px',
                  background: color,
                  boxShadow: '0px 0px 10px rgba(0,0,0,0.25)',
                  borderRadius: '40px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}>

                {/* 3 dots kebab menu */}
                <div
                  onClick={(e) => { e.stopPropagation(); setOpenCodeId(openCodeId === mod.id ? null : mod.id) }}
                  style={{ position: 'absolute', right: '10px', top: '18px', display: 'flex', flexDirection: 'column', gap: '7px', cursor: 'pointer', padding: '4px' }}>
                  {[0, 1, 2].map(d => (
                    <div key={d} style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />
                  ))}
                </div>

                {/* Join code bubble */}
                {openCodeId === mod.id && (
                  <div style={{
                    position: 'absolute', right: '28px', top: '10px',
                    background: '#FFFFFF', borderRadius: '10px',
                    padding: '6px 10px',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
                    fontFamily: 'Amiko', fontSize: '13px', fontWeight: 600,
                    color: '#262626', whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}>
                    {mod.joinCode ?? '—'}
                  </div>
                )}

                {/* Label pill at bottom */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0,
                  width: '165px', height: '58px',
                  background: '#EBEAEA',
                  borderRadius: '0 0 40px 40px',
                  borderTop: '1px solid rgba(112,112,112,0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'Amiko', fontSize: '18px', lineHeight: '24px', color: '#262626', textAlign: 'center', padding: '0 8px' }}>
                    {mod.name}
                  </span>
                </div>

              </motion.div>
            )
          })
        )}

        {/* + circle (all roles — join) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.35 }}
          onClick={() => navigate('/modules/join')}
          style={{
            position: 'absolute', left: '330px', top: '850px',
            width: '54px', height: '54px',
            background: '#B8E466', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
          }}>
          <div style={{ position: 'relative', width: '23px', height: '23px' }}>
            <div style={{ position: 'absolute', left: '10px', top: 0, width: '3px', height: '23px', background: '#FFFFFF' }} />
            <div style={{ position: 'absolute', top: '10px', left: 0, width: '23px', height: '3px', background: '#FFFFFF' }} />
          </div>
        </motion.div>

        {/* Create button (coach only) */}
        {isCoach && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.4 }}
            onClick={() => navigate('/modules/create')}
            style={{
              position: 'absolute', left: '200px', top: '857px',
              width: '109px', height: '41px',
              background: '#B8E466', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
              borderRadius: '40px', border: 'none',
              fontFamily: 'Amiko', fontWeight: 600, fontSize: '24px',
              color: '#FFFFFF', cursor: 'pointer',
            }}>
            Create
          </motion.button>
        )}

      </div>
    </div>
  )
}
