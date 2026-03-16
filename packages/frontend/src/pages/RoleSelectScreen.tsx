import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import athleteLogo from '../assets/athlete_logo.png'
import coachLogo from '../assets/coach_logo.png'
import parentLogo from '../assets/parent_logo.png'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

const starClip = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
const ribbonLeft = 'polygon(7% 0, 100% 0, 100% 100%, 7% 100%, 0 50%)'

// TitleScreen style — top-left + bottom-right
const topRibbons = [
  { width: '340px', left: '-102.09px', top: '-34.7px',   bg: '#B8E466', delay: 0.05 },
  { width: '317px', left: '-24.13px',  top: '-7.61px',  bg: '#55337B', delay: 0.1 },
  { width: '315px', left: '-63.07px',  top: '56.27px', bg: '#6166DB', delay: 0.15 },
  { width: '320px', left: '-107px',    top: '120.67px', bg: '#B8E466', delay: 0.2 },
]
const botRibbons = [
  { width: '340px', left: '202.09px', top: '1008.25px', bg: '#55337B', delay: 0.05 },
  { width: '317px', left: '147.13px', top: '981.34px', bg: '#55337B', delay: 0.1 },
  { width: '315px', left: '188.07px', top: '918.68px', bg: '#6166DB', delay: 0.15 },
  { width: '320px', left: '227px',    top: '854.28px', bg: '#B8E466', delay: 0.2 },
]
const topStars = [
  { left: '280px', top: '-79px',  bg: '#55337B', delay: 0 },
  { left: '238px', top: '-16px',  bg: '#B8E466', delay: 0.05 },
  { left: '201px', top: '48px', bg: '#6166DB', delay: 0.1 },
]
const botStars = [
  { left: '112.7px', top: '1037.7px', bg: '#55337B', delay: 0 },
  { left: '154.7px', top: '974.7px', bg: '#B8E466', delay: 0.05 },
  { left: '191.7px', top: '910.7px', bg: '#6166DB', delay: 0.1 },
]

const roles = [
  {
    key: 'athlete',
    label: 'Athlete',
    cardBg: '#6166DB',
    circleBg: '#D7D8FE',
    cardTop: '276px',
    logo: athleteLogo,
    logoScale: 2.1,
    iconAlign: 'left' as const,
  },
  {
    key: 'coach',
    label: 'Coach',
    cardBg: '#B8E466',
    circleBg: '#F1F8DF',
    cardTop: '479px',
    logo: coachLogo,
    logoScale: 1.3,
    iconAlign: 'right' as const,
  },
  {
    key: 'parent',
    label: 'Parent',
    cardBg: '#55337B',
    circleBg: '#E0D4ED',
    cardTop: '683px',
    logo: parentLogo,
    logoScale: 1.5,
    iconAlign: 'left' as const,
  },
]

export default function RoleSelectScreen() {
  const navigate = useNavigate()
  const { token, setRole } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRoleSelect = async (role: string) => {
    setLoading(true)
    setError('')
    try {
      await api('/api/users/role', {
        method: 'PATCH',
        body: { role: role.toUpperCase() },
        token: token ?? undefined,
      })
      setRole(role.toUpperCase())
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set role')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

        {/* Top-left stars */}
        {topStars.map((s, i) => (
          <motion.div key={`ts${i}`}
            initial={{ x: -800, y: 300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: s.delay }}
            style={{ position: 'absolute', left: s.left, top: s.top }}>
            <div style={{ width: '47.3px', height: '47.3px', background: s.bg, transform: 'rotate(-11deg)', clipPath: starClip }} />
          </motion.div>
        ))}

        {/* Top-left ribbons */}
        {topRibbons.map((r, i) => (
          <motion.div key={`tr${i}`}
            initial={{ x: -800, y: 300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: r.delay }}
            style={{ position: 'absolute', left: r.left, top: r.top }}>
            <div style={{ width: r.width, height: '31.05px', background: r.bg, transform: 'matrix(-0.94, 0.34, -0.34, -0.94, 0, 0)', clipPath: ribbonLeft }} />
          </motion.div>
        ))}

        {/* Bottom-right stars */}
        {botStars.map((s, i) => (
          <motion.div key={`bs${i}`}
            initial={{ x: 800, y: -300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: s.delay }}
            style={{ position: 'absolute', left: s.left, top: s.top }}>
            <div style={{ width: '47.3px', height: '47.3px', background: s.bg, transform: 'rotate(169deg)', clipPath: starClip }} />
          </motion.div>
        ))}

        {/* Bottom-right ribbons */}
        {botRibbons.map((r, i) => (
          <motion.div key={`br${i}`}
            initial={{ x: 800, y: -300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: r.delay }}
            style={{ position: 'absolute', left: r.left, top: r.top }}>
            <div style={{ width: r.width, height: '31.05px', background: r.bg, transform: 'matrix(0.94, -0.34, 0.34, 0.94, 0, 0)', clipPath: ribbonLeft }} />
          </motion.div>
        ))}

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0 }}
          style={{ position: 'absolute', width: '268px', left: '86px', top: '115px', fontFamily: 'Amiko', fontWeight: 700, fontSize: '48px', lineHeight: '64px', textAlign: 'center', color: '#000000', margin: 0 }}>
          Choose Your Role
        </motion.p>

        {error && (
          <p style={{ position: 'absolute', top: '240px', left: '30px', right: '30px', textAlign: 'center', color: 'red', fontFamily: 'Amiko', fontSize: '13px' }}>
            {error}
          </p>
        )}

        {/* Role cards */}
        {roles.map((role, i) => (
          <motion.button
            key={role.key}
            onClick={() => handleRoleSelect(role.key)}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 + i * 0.1 }}
            whileHover={loading ? {} : { scale: 1.02 }}
            whileTap={loading ? {} : { scale: 0.98 }}
            style={{
              position: 'absolute',
              width: '379px', height: '148px',
              left: '31px', top: role.cardTop,
              background: role.cardBg,
              boxShadow: '5px 5px 4px rgba(0,0,0,0.25)',
              borderRadius: '25px',
              border: 'none',
              cursor: 'pointer',
              overflow: 'hidden',
            }}>

            {/* Avatar circle */}
            <div style={{
              position: 'absolute',
              width: '119px', height: '119px',
              ...(role.iconAlign === 'left'
                ? { left: '16px' }
                : { right: '16px' }),
              top: '14px',
              background: role.circleBg,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img src={role.logo} alt={role.label} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${role.logoScale}) translateY(5%)` }} />
            </div>

            {/* Label */}
            <span style={{
              position: 'absolute',
              ...(role.iconAlign === 'left'
                ? { left: '155px', right: '16px' }
                : { left: '16px', right: '155px' }),
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'Amiko',
              fontWeight: 400,
              fontSize: '36px',
              lineHeight: '48px',
              textAlign: 'center',
              color: '#FFFFFF',
            }}>
              {role.label}
            </span>

          </motion.button>
        ))}

      </div>
    </div>
  )
}
