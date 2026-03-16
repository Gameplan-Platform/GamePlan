import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

const colorOptions = [
  '#6166DB',
  '#B8E466',
  '#55337B',
  '#FF6B6B',
  '#4ECDC4',
  '#FFB347',
]

const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: '14px' }}>
    <circle cx="12" cy="7" r="4" fill="#B8E466" />
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#B8E466" />
  </svg>
)

interface CreateModuleResponse {
  message: string
  module: { id: string; name: string; joinCode: string }
}

export default function CreateModule() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Module name is required'); return }
    setError('')
    setLoading(true)
    try {
      await api<CreateModuleResponse>('/modules', {
        method: 'POST',
        body: { name: name.trim(), description: selectedColor },
        token: token ?? undefined,
      })
      navigate('/module-homepage')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module')
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
            position: 'absolute', left: '38px', top: '71px',
            width: '38px', height: '42px',
            background: 'white', border: '1px solid #CED3DE',
            borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.8,
          }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M9 2L4 7.5L9 13" stroke="#222B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          style={{ position: 'absolute', left: '72px', top: '119px', fontFamily: 'Amiko', fontWeight: 700, fontSize: '40px', lineHeight: '53px', color: '#000000', margin: 0 }}>
          Create Module
        </motion.p>

        <form onSubmit={handleSubmit}>

          {/* Module Information pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{
              position: 'absolute', left: '44px', top: '205px',
              width: '349px', height: '41px',
              background: '#6166DB', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
              borderRadius: '40px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <span style={{ fontFamily: 'Amiko', fontWeight: 600, fontSize: '24px', color: '#FFFFFF' }}>
              Module Information
            </span>
          </motion.div>

          {/* Module Name field */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            style={{
              position: 'absolute', left: '32px', top: '284px',
              width: '384px', height: '50px',
              background: '#FFFFFF', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
              borderRadius: '40px', display: 'flex', alignItems: 'center', overflow: 'hidden',
            }}>
            <PersonIcon />
            <input
              type="text"
              placeholder="Module Name"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              style={{
                width: '100%', height: '100%', border: 'none', outline: 'none',
                background: 'transparent', fontFamily: 'Amiko', fontSize: '15px',
                color: '#333', paddingLeft: '10px',
              }}
            />
          </motion.div>

          {/* Color picker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            style={{ position: 'absolute', left: '32px', top: '360px' }}>
            <p style={{ fontFamily: 'Amiko', fontSize: '15px', color: '#BEBEBE', margin: '0 0 12px 12px' }}>
              Choose a color
            </p>
            <div style={{ display: 'flex', gap: '14px', paddingLeft: '12px' }}>
              {colorOptions.map(color => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: color, cursor: 'pointer',
                    border: selectedColor === color ? '3px solid #262626' : '3px solid transparent',
                    boxSizing: 'border-box',
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <p style={{ position: 'absolute', top: '345px', left: '44px', color: 'red', fontFamily: 'Amiko', fontSize: '13px', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Create button */}
          <motion.button
            type="submit"
            disabled={loading}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            style={{
              position: 'absolute', left: '56px', top: '740px',
              width: '317px', height: '41px',
              background: '#B8E466', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
              borderRadius: '40px', border: 'none',
              fontFamily: 'Amiko', fontWeight: 600, fontSize: '24px',
              color: '#FFFFFF', cursor: 'pointer',
            }}>
            {loading ? 'Creating...' : 'Create'}
          </motion.button>

          {/* Cancel button */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.25 }}
            onClick={() => navigate('/module-homepage')}
            style={{
              position: 'absolute', left: '63px', top: '795px',
              width: '304px', height: '41px',
              background: '#FFFFFF', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
              borderRadius: '40px', border: 'none',
              fontFamily: 'Amiko', fontWeight: 600, fontSize: '24px',
              color: '#C8C8C8', cursor: 'pointer',
            }}>
            Cancel
          </motion.button>

        </form>
      </div>
    </div>
  )
}
