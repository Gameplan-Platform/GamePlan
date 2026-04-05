import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

function cardColor(mod: Module, index: number): string {
  if (mod.description?.startsWith('#')) return mod.description
  if (mod.systemKey === 'gym') return 'rgba(184, 228, 102, 0.48)'
  if (mod.systemKey === 'staff') return 'rgba(85, 51, 123, 0.62)'
  const customs = ['rgba(97, 102, 219, 0.43)', 'rgba(184, 228, 102, 0.48)', 'rgba(85, 51, 123, 0.62)']
  return customs[index % customs.length]
}

function parseUserId(token: string | null): string | null {
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1])).userId ?? null
  } catch { return null }
}

interface Module {
  id: string
  name: string
  type?: string
  systemKey?: string | null
  joinCode?: string
  description?: string | null
  createdById?: string | null
}

export default function ModuleHomepage() {
  const navigate = useNavigate()
  const { token, role, logout } = useAuth()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [openCodeId, setOpenCodeId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const isCoach = role === 'COACH'
  const currentUserId = parseUserId(token)

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

  const handleEdit = (mod: Module) => {
    setEditingModule(mod)
    setEditName(mod.name)
    setEditColor(mod.description?.startsWith('#') ? mod.description : '#6166DB')
    setOpenCodeId(null)
  }

  const handleSaveEdit = async () => {
    if (!editingModule || !editName.trim()) return
    try {
      const updated = await api<{ module: Module }>(`/modules/${editingModule.id}`, {
        method: 'PATCH',
        body: { name: editName.trim(), description: editColor },
        token: token ?? undefined,
      })
      setModules(prev => prev.map(m => m.id === editingModule.id ? updated.module : m))
      setEditingModule(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (moduleId: string) => {
    try {
      await api(`/modules/${moduleId}`, { method: 'DELETE', token: token ?? undefined })
      setModules(prev => prev.filter(m => m.id !== moduleId))
    } catch (err) {
      console.error(err)
    } finally {
      setConfirmDeleteId(null)
      setOpenCodeId(null)
    }
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
            position: 'absolute', left: '30px', top: '60px',
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
            const color = cardColor(mod, i)

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
                  style={{ position: 'absolute', right: '18px', top: '18px', display: 'flex', flexDirection: 'column', gap: '7px', cursor: 'pointer', padding: '4px' }}>
                  {[0, 1, 2].map(d => (
                    <div key={d} style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#FFFFFF' }} />
                  ))}
                </div>

                {/* Popup bubble */}
                {openCodeId === mod.id && (
                  <div style={{
                    position: 'absolute', right: '28px', top: '10px',
                    background: '#FFFFFF', borderRadius: '10px',
                    padding: '8px 12px',
                    boxShadow: '0px 4px 12px rgba(0,0,0,0.2)',
                    fontFamily: 'Amiko', fontSize: '13px', fontWeight: 600,
                    color: '#262626', whiteSpace: 'nowrap',
                    zIndex: 10, display: 'flex', flexDirection: 'column', gap: '8px',
                  }}>
                    <span>Code: {mod.joinCode ?? '—'}</span>
                    {isCoach && mod.createdById === currentUserId && (
                      <>
                        <span
                          onClick={(e) => { e.stopPropagation(); handleEdit(mod) }}
                          style={{ color: '#6166DB', cursor: 'pointer' }}>
                          Edit
                        </span>
                        <span
                          onClick={(e) => { e.stopPropagation(); setOpenCodeId(null); setConfirmDeleteId(mod.id) }}
                          style={{ color: '#FF6B6B', cursor: 'pointer' }}>
                          Delete
                        </span>
                      </>
                    )}
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
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.08, y: -2, boxShadow: '0px 8px 18px rgba(0,0,0,0.18)' }}
          transition={{
                opacity: { ...spring, delay: 0.35 },
                scale: { type: 'tween', duration: 0.12 },
                y: { type: 'tween', duration: 0.12 },
                boxShadow: { type: 'tween', duration: 0.12 },}}
          onClick={() => navigate('/modules/join')}
          style={{
            position: 'absolute',
            left: '330px',
            top: '770px',
            width: '54px',
            height: '54px',
            background: '#B8E466',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
            zIndex: 20,
          }}
        >
          <div style={{ position: 'relative', width: '23px', height: '23px' }}>
            <div
              style={{
                position: 'absolute',
                left: '10px',
                top: 0,
                width: '3px',
                height: '23px',
                background: '#FFFFFF',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '10px',
                left: 0,
                width: '23px',
                height: '3px',
                background: '#FFFFFF',
              }}
            />
          </div>
        </motion.div>

        {/* Create button (coach only) */}
        {isCoach && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                opacity: { ...spring, delay: 0.35 },
                scale: { type: 'tween', duration: 0.12 },
                y: { type: 'tween', duration: 0.12 },
                boxShadow: { type: 'tween', duration: 0.12 },}}
            onClick={() => navigate('/modules/create')}
            style={{
              position: 'absolute',
              left: '200px',
              top: '777px',
              width: '109px',
              height: '41px',
              background: '#B8E466',
              boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
              borderRadius: '40px',
              border: 'none',
              fontFamily: 'Amiko',
              fontWeight: 600,
              fontSize: '24px',
              color: '#FFFFFF',
              cursor: 'pointer',
              zIndex: 20,
            }}
          >
            Create
          </motion.button>
        )}

        {/* Edit modal */}
        {editingModule && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, borderRadius: '55px',
          }}>
            <div style={{
              background: '#FFFFFF', borderRadius: '20px',
              padding: '32px 28px', width: '320px',
              boxShadow: '0px 8px 30px rgba(0,0,0,0.2)',
            }}>
              <p style={{ fontFamily: 'Amiko', fontWeight: 700, fontSize: '20px', color: '#262626', margin: '0 0 20px' }}>
                Edit Module
              </p>

              {/* Name input */}
              <div style={{
                width: '100%', height: '46px',
                background: '#F5F5F5', borderRadius: '40px',
                display: 'flex', alignItems: 'center', overflow: 'hidden',
                marginBottom: '20px',
              }}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'Amiko', fontSize: '15px', color: '#333', padding: '0 16px' }}
                />
              </div>

              {/* Color swatches */}
              <p style={{ fontFamily: 'Amiko', fontSize: '13px', color: '#BEBEBE', margin: '0 0 10px 4px' }}>Choose a color</p>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {['#6166DB','#B8E466','#55337B','#FF6B6B','#4ECDC4','#FFB347'].map(color => (
                  <div
                    key={color}
                    onClick={() => setEditColor(color)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: color, cursor: 'pointer',
                      border: editColor === color ? '3px solid #262626' : '3px solid transparent',
                      boxSizing: 'border-box',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setEditingModule(null)}
                  style={{ flex: 1, height: '40px', background: '#EBEAEA', border: 'none', borderRadius: '40px', fontFamily: 'Amiko', fontWeight: 600, fontSize: '16px', color: '#888', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  style={{ flex: 1, height: '40px', background: '#B8E466', border: 'none', borderRadius: '40px', fontFamily: 'Amiko', fontWeight: 600, fontSize: '16px', color: '#FFFFFF', cursor: 'pointer' }}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {confirmDeleteId && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, borderRadius: '55px',
          }}>
            <div style={{
              background: '#FFFFFF', borderRadius: '20px',
              padding: '32px 28px', width: '320px', textAlign: 'center',
              boxShadow: '0px 8px 30px rgba(0,0,0,0.2)',
            }}>
              <p style={{ fontFamily: 'Amiko', fontWeight: 700, fontSize: '20px', color: '#262626', margin: '0 0 12px' }}>
                Delete Module?
              </p>
              <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#888', margin: '0 0 24px' }}>
                This will remove the module for everyone. This can't be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  style={{ width: '120px', height: '40px', background: '#EBEAEA', border: 'none', borderRadius: '40px', fontFamily: 'Amiko', fontWeight: 600, fontSize: '16px', color: '#888', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  style={{ width: '120px', height: '40px', background: '#FF6B6B', border: 'none', borderRadius: '40px', fontFamily: 'Amiko', fontWeight: 600, fontSize: '16px', color: '#FFFFFF', cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
