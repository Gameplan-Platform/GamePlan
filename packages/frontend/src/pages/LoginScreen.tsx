import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

const starClip = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
const ribbonLeft = 'polygon(7% 0, 100% 0, 100% 100%, 7% 100%, 0 50%)'

const topRibbons = [
  { width: '340px', left: '170.09px', top: '-52px',    bg: '#55337B', delay: 0.05 },
  { width: '350px', left: '150.13px', top: '1px',    bg: '#B8E466', delay: 0.1 },
  { width: '315px', left: '250.07px', top: '18.27px', bg: '#6166DB', delay: 0.15 },
  { width: '320px', left: '350px',    top: '25.67px',  bg: '#B8E466', delay: 0.2 },
]
const botRibbons = [
  { width: '340px', left: '-30.09px', top: '975.25px', bg: '#55337B', delay: 0.05 },
  { width: '317px', left: '10.13px',  top: '917.34px',  bg: '#B8E466', delay: 0.1 },
  { width: '315px', left: '-73.07px', top: '902.68px',  bg: '#6166DB', delay: 0.15 },
  { width: '320px', left: '-200px',   top: '902.28px',  bg: '#B8E466', delay: 0.2 },
]
const topStars = [
  { left: '127.7px', top: '11px', bg: '#6166DB', delay: 0.1 },
  { left: '112.7px', top: '69px',  bg: '#55337B', delay: 0 },
  { left: '210.7px', top: '80px',  bg: '#B8E466', delay: 0.05 },
  { left: '317.7px', top: '88px',  bg: '#6166DB', delay: 0.1 },
]
const botStars = [
  { left: '305px', top: '898.7px', bg: '#6166DB', delay: 0.1 },
  { left: '320px', top: '844.7px', bg: '#55337B', delay: 0 },
  { left: '238px', top: '826.7px', bg: '#B8E466', delay: 0.05 },
  { left: '115px', top: '826.7px', bg: '#6166DB', delay: 0.1 },
]

interface LoginResponse {
  message: string
  token: string
}

const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: '14px' }}>
    <circle cx="12" cy="7" r="4" fill="#B8E466" />
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#B8E466" />
  </svg>
)

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: '14px' }}>
    <rect x="5" y="11" width="14" height="10" rx="2" fill="#B8E466" />
    <path d="M8 11V7a4 4 0 018 0v4" stroke="#B8E466" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
)

const inputStyle = {
  width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'Amiko', fontSize: '15px', color: '#333', paddingLeft: '10px',
}

const fieldStyle = (top: string) => ({
  position: 'absolute' as const,
  width: '300px', height: '50px', left: '70px', top,
  background: '#FFFFFF', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
  borderRadius: '40px', display: 'flex', alignItems: 'center', overflow: 'hidden',
})

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!identifier.trim()) return 'Email or username is required'
    if (!password) return 'Password is required'
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setLoading(true)
    try {
      const data = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { identifier: identifier.trim(), password },
      })
      login(data.token)
      navigate('/role-select')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

        {/* Top stars */}
        {topStars.map((s, i) => (
          <motion.div key={`ts${i}`}
            initial={{ x: 800, y: -300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: s.delay }}
            style={{ position: 'absolute', left: s.left, top: s.top }}>
            <div style={{ width: '47.3px', height: '47.3px', background: s.bg, transform: 'rotate(11deg)', clipPath: starClip }} />
          </motion.div>
        ))}

        {/* Top ribbons */}
        {topRibbons.map((r, i) => (
          <motion.div key={`tr${i}`}
            initial={{ x: 800, y: -300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: r.delay }}
            style={{ position: 'absolute', left: r.left, top: r.top }}>
            <div style={{ width: r.width, height: '31.05px', background: r.bg, transform: 'matrix(0.94, -0.34, 0.34, 0.94, 0, 0)', clipPath: ribbonLeft }} />
          </motion.div>
        ))}

        {/* Bottom stars */}
        {botStars.map((s, i) => (
          <motion.div key={`bs${i}`}
            initial={{ x: -800, y: 300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: s.delay }}
            style={{ position: 'absolute', left: s.left, top: s.top }}>
            <div style={{ width: '47.3px', height: '47.3px', background: s.bg, transform: 'rotate(-11deg)', clipPath: starClip }} />
          </motion.div>
        ))}

        {/* Bottom ribbons */}
        {botRibbons.map((r, i) => (
          <motion.div key={`br${i}`}
            initial={{ x: -800, y: 300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: r.delay }}
            style={{ position: 'absolute', left: r.left, top: r.top }}>
            <div style={{ width: r.width, height: '31.05px', background: r.bg, transform: 'matrix(-0.94, 0.34, -0.34, -0.94, 0, 0)', clipPath: ribbonLeft }} />
          </motion.div>
        ))}

        <form onSubmit={handleSubmit}>

          {/* Title */}
          <motion.p
            initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0 }}
            style={{ position: 'absolute', width: '269px', left: '85px', top: '200px', fontFamily: 'Amiko', fontWeight: 700, fontSize: '48px', lineHeight: '64px', textAlign: 'center', color: '#262626', margin: 0 }}>
            Welcome Back!
          </motion.p>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ position: 'absolute', width: '209px', left: '116px', top: '354px', fontFamily: 'Amiko', fontWeight: 400, fontSize: '18px', lineHeight: '24px', textAlign: 'center', color: '#262626', margin: 0 }}>
            Sign in to your account
          </motion.p>

          {/* Error */}
          {error && (
            <p style={{ position: 'absolute', top: '402px', left: '70px', color: 'red', fontFamily: 'Amiko', fontSize: '13px', margin: 0 }}>
              {error}
            </p>
          )}

          {/* Username / identifier field */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            style={fieldStyle('416px')}>
            <PersonIcon />
            <input
              type="text"
              placeholder="Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              style={inputStyle}
            />
          </motion.div>

          {/* Password field */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.22 }}
            style={fieldStyle('507px')}>
            <LockIcon />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={inputStyle}
            />
          </motion.div>

          {/* Forgot password */}
          <motion.button
            type="button"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ ...spring, delay: 0.3 }}
            style={{ position: 'absolute', left: '188px', top: '589px', width: '182px', background: 'none', border: 'none', fontFamily: 'Amiko', fontSize: '15px', lineHeight: '20px', color: '#BEBEBE', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
            Forgot your password?
          </motion.button>

          {/* Don't have an account */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ ...spring, delay: 0.35 }}
            style={{ position: 'absolute', left: '188px', top: '623px', width: '182px', fontFamily: 'Amiko', fontSize: '15px', lineHeight: '20px', color: '#BEBEBE', margin: 0 }}>
            Don't Have an Account?{' '}
            <span
              onClick={() => navigate('/signup')}
              style={{ color: '#6166DB', cursor: 'pointer', fontWeight: 600 }}>
              Sign Up
            </span>
          </motion.p>

          {/* Log In button */}
          <motion.button
            type="submit"
            disabled={loading}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.4 }}
            style={{ position: 'absolute', width: '316.68px', height: '41.23px', left: '62px', top: '682px', background: '#6166DB', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)', borderRadius: '40px', border: 'none', fontFamily: 'Amiko', fontWeight: 700, fontSize: '24px', color: '#FFFFFF', cursor: 'pointer' }}>
            {loading ? 'Logging in...' : 'Log In'}
          </motion.button>

        </form>
      </div>
    </div>
  )
}
