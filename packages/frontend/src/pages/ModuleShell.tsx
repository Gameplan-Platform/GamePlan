import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

interface ModuleInfoResponse {
  module: {
    id: string
    name: string
    description?: string | null
    type?: string
    systemKey?: string | null
  }
}

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

export default function ModuleShell() {
  const navigate = useNavigate()
  const { moduleId } = useParams<{ moduleId: string }>()
  const { token } = useAuth()
  const [moduleName, setModuleName] = useState('Module')

  useEffect(() => {
    if (!moduleId || !token) return

    api<ModuleInfoResponse>(`/modules/${moduleId}`, { token })
      .then((data) => setModuleName(data.module.name))
      .catch((error) => console.error('Failed to load module info:', error))
  }, [moduleId, token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-6">
      <div
        className="relative w-full max-w-[440px] overflow-hidden bg-white shadow-lg"
        style={{ minHeight: '956px', borderRadius: '55px' }}
      >
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...spring, delay: 0 }}
          onClick={() => navigate('/module-homepage')}
          style={{
            position: 'absolute',
            left: '30px',
            top: '60px',
            width: '85px',
            height: '32px',
            background: '#6166DB',
            boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
            borderRadius: '40px',
            border: 'none',
            fontFamily: 'Amiko',
            fontWeight: 600,
            fontSize: '16px',
            color: '#FFFFFF',
            cursor: 'pointer',
            zIndex: 20,
          }}
        >
          Back
        </motion.button>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          style={{
            position: 'absolute',
            left: '0',
            right: '0',
            top: '83px',
            fontFamily: 'Amiko',
            fontWeight: 700,
            fontSize: '32px',
            lineHeight: '42px',
            color: '#000000',
            margin: 0,
            textAlign: 'center',
            padding: '0 120px',
          }}
        >
          {moduleName}
        </motion.p>

        <Outlet />
      </div>
    </div>
  )
}