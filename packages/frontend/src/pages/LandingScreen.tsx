import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

export default function LandingScreen() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

        {/* Logo */}
        <motion.img
          src={logo}
          alt="GamePlan logo"
          initial={{ opacity: 0, scale: 0.6, y: -60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...spring, delay: 0 }}
          style={{ position: 'absolute', width: '329px', height: '304px', left: '57px', top: '179px', objectFit: 'contain' }}
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          style={{ position: 'absolute', width: '209px', left: '117px', top: '504px', fontFamily: 'Amiko', fontWeight: 400, fontSize: '18px', lineHeight: '24px', textAlign: 'center', color: '#262626' }}
        >
          Log In or Sign Up To Continue
        </motion.p>

        {/* Login button */}
        <motion.button
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.25 }}
          onClick={() => navigate('/login')}
          style={{ position: 'absolute', width: '316.68px', height: '41.23px', left: '62px', top: '580px', background: '#6166DB', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)', borderRadius: '40px', border: 'none', fontFamily: 'Amiko', fontWeight: 650, fontSize: '24px', color: '#FFFFFF', cursor: 'pointer' }}
        >
          Login
        </motion.button>

        {/* Sign Up button */}
        <motion.button
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.35 }}
          onClick={() => navigate('/signup')}
          style={{ position: 'absolute', width: '316.68px', height: '41.23px', left: '62px', top: '663px', background: '#6166DB', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)', borderRadius: '40px', border: 'none', fontFamily: 'Amiko', fontWeight: 650, fontSize: '24px', color: '#FFFFFF', cursor: 'pointer' }}
        >
          Sign Up
        </motion.button>

      </div>
    </div>
  )
}
