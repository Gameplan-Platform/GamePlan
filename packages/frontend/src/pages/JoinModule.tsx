import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

export default function JoinModule() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) { setError('Module code is required'); return }
    setError('')
    setLoading(true)
    try {
      await api('/modules/join', {
        method: 'POST',
        body: { joinCode: joinCode.trim() },
        token: token ?? undefined,
      })
      navigate('/module-homepage')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join module')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 0 }}
          onClick={() => navigate('/module-homepage')}
          style={{
            position: 'absolute', left: '28px', top: '74px',
            width: '42px', height: '42px',
            background: '#F5F6FA', border: '1px solid #D9DEEA',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(34, 43, 69, 0.05)',
          }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M9 2L4 7.5L9 13" stroke="#222B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          style={{ position: 'absolute', left: '81px', top: '121px', fontFamily: 'Amiko', fontWeight: 400, fontSize: '40px', lineHeight: '53px', color: '#000000', margin: 0 }}>
          Join a Module
        </motion.p>

        <form onSubmit={handleSubmit}>

          {/* Module Information pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{
              position: 'absolute', left: '48px', top: '204px',
              width: '349px', height: '41px',
              background: '#6166DB', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
              borderRadius: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <span style={{ fontFamily: 'Amiko', fontWeight: 600, fontSize: '24px', color: '#FFFFFF' }}>
              Module Information
            </span>
          </motion.div>

          {/* Join code input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            style={{
              position: 'absolute', left: '48px', top: '283px',
              width: '350px', height: '48px',
              background: '#FFFFFF', boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
              borderRadius: '20px', display: 'flex', alignItems: 'center', overflow: 'hidden',
            }}>
            <input
              type="text"
              placeholder="Enter Module Code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              disabled={loading}
              style={{
                width: '100%', height: '100%', border: 'none', outline: 'none',
                background: 'transparent', fontFamily: 'Amiko', fontSize: '18px',
                color: '#333', padding: '0 16px',
              }}
            />
          </motion.div>

          {/* Error */}
          {error && (
            <p style={{ position: 'absolute', top: '342px', left: '56px', color: 'red', fontFamily: 'Amiko', fontSize: '13px', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Cancel button */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            onClick={() => navigate('/module-homepage')}
            style={{
              position: 'absolute', left: '60px', top: '750px',
              width: '150px', height: '52px',
              background: '#FF6B6B', border: 'none',
              borderRadius: '999px', cursor: 'pointer',
              fontFamily: 'Amiko', fontWeight: 400, fontSize: '16px',
              color: '#FFFFFF',
              boxShadow: '0 6px 14px rgba(255,107,107,0.28)',
            }}>
            Cancel
          </motion.button>

          {/* Join button */}
          <motion.button
            type="submit"
            disabled={loading}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.25 }}
            style={{
              position: 'absolute', left: '230px', top: '750px',
              width: '150px', height: '52px',
              background: '#B8E466', border: 'none',
              borderRadius: '999px', cursor: 'pointer',
              fontFamily: 'Amiko', fontWeight: 400, fontSize: '16px',
              color: '#FFFFFF',
              boxShadow: '0 6px 14px rgba(183,222,88,0.28)',
            }}>
            {loading ? 'Joining...' : 'Join'}
          </motion.button>

        </form>
      </div>
    </div>
  )
}
