import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

const starClip = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
const ribbonLeft = 'polygon(7% 0, 100% 0, 100% 100%, 7% 100%, 0 50%)'

const springIn  = { type: 'spring' as const, stiffness: 80, damping: 14 }
const springOut = { type: 'spring' as const, stiffness: 120, damping: 18 }

const topRibbons = [
  { width: '340px', left: '-102.09px', top: '36.7px',   bg: '#55337B', delay: 0.05 },
  { width: '317px', left: '-24.13px',  top: '63.61px',  bg: '#B8E466', delay: 0.1 },
  { width: '315px', left: '-63.07px',  top: '126.27px', bg: '#6166DB', delay: 0.15 },
  { width: '320px', left: '-107px',    top: '190.67px', bg: '#B8E466', delay: 0.2 },
]

const botRibbons = [
  { width: '340px', left: '202.09px', top: '888.25px', bg: '#55337B', delay: 0.05 },
  { width: '317px', left: '147.13px', top: '861.34px', bg: '#B8E466', delay: 0.1 },
  { width: '315px', left: '188.07px', top: '798.68px', bg: '#6166DB', delay: 0.15 },
  { width: '320px', left: '227px',    top: '734.28px', bg: '#B8E466', delay: 0.2 },
]

const topStars = [
  { left: '280px', top: '-9px',  bg: '#55337B', delay: 0 },
  { left: '238px', top: '54px',  bg: '#B8E466', delay: 0.05 },
  { left: '201px', top: '118px', bg: '#6166DB', delay: 0.1 },
]

const botStars = [
  { left: '112.7px', top: '917.7px', bg: '#55337B', delay: 0 },
  { left: '154.7px', top: '854.7px', bg: '#B8E466', delay: 0.05 },
  { left: '191.7px', top: '790.7px', bg: '#6166DB', delay: 0.1 },
]

export default function TitleScreen() {
  const navigate = useNavigate()
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const holdTimer  = setTimeout(() => setIsExiting(true), 2000)
    const navTimer   = setTimeout(() => navigate('/landing'), 3200)
    return () => { clearTimeout(holdTimer); clearTimeout(navTimer) }
  }, [navigate])

  const topAnimate    = isExiting ? { x: -800, y: 300,  opacity: 0 } : { x: 0, y: 0, opacity: 1 }
  const botAnimate    = isExiting ? { x: 800,  y: -300, opacity: 0 } : { x: 0, y: 0, opacity: 1 }
  const logoAnimate   = isExiting ? { opacity: 0, scale: 0.6, y: 100 } : { opacity: 1, scale: 1, y: 0 }
  const transition    = (delay: number) => ({ ...(isExiting ? springOut : springIn), delay: isExiting ? 0 : delay })

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

        {/* Top-left stars */}
        {topStars.map((s, i) => (
          <motion.div key={`ts${i}`}
            initial={{ x: -800, y: 300, opacity: 0 }}
            animate={topAnimate}
            transition={transition(s.delay)}
            style={{ position: 'absolute', left: s.left, top: s.top }}>
            <div style={{ width: '47.3px', height: '47.3px', background: s.bg, transform: 'rotate(-11deg)', clipPath: starClip }} />
          </motion.div>
        ))}

        {/* Top-left ribbons */}
        {topRibbons.map((r, i) => (
          <motion.div key={`tr${i}`}
            initial={{ x: -800, y: 300, opacity: 0 }}
            animate={topAnimate}
            transition={transition(r.delay)}
            style={{ position: 'absolute', left: r.left, top: r.top }}>
            <div style={{ width: r.width, height: '31.05px', background: r.bg, transform: 'matrix(-0.94, 0.34, -0.34, -0.94, 0, 0)', clipPath: ribbonLeft }} />
          </motion.div>
        ))}

        {/* Logo */}
        <motion.img
          src={logo}
          alt="GamePlan logo"
          initial={{ opacity: 0, scale: 0.6, y: 0 }}
          animate={logoAnimate}
          transition={isExiting ? { ...springOut, delay: 0.2 } : { ...springIn, delay: 0.5 }}
          style={{ position: 'absolute', width: '417px', height: '375px', left: '15px', top: '260px', objectFit: 'contain' }}
        />

        {/* Bottom-right stars */}
        {botStars.map((s, i) => (
          <motion.div key={`bs${i}`}
            initial={{ x: 800, y: -300, opacity: 0 }}
            animate={botAnimate}
            transition={transition(s.delay)}
            style={{ position: 'absolute', left: s.left, top: s.top }}>
            <div style={{ width: '47.3px', height: '47.3px', background: s.bg, transform: 'rotate(169deg)', clipPath: starClip }} />
          </motion.div>
        ))}

        {/* Bottom-right ribbons */}
        {botRibbons.map((r, i) => (
          <motion.div key={`br${i}`}
            initial={{ x: 800, y: -300, opacity: 0 }}
            animate={botAnimate}
            transition={transition(r.delay)}
            style={{ position: 'absolute', left: r.left, top: r.top }}>
            <div style={{ width: r.width, height: '31.05px', background: r.bg, transform: 'matrix(0.94, -0.34, 0.34, 0.94, 0, 0)', clipPath: ribbonLeft }} />
          </motion.div>
        ))}

      </div>
    </div>
  )
}
