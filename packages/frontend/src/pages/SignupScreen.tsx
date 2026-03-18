import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const spring = { type: 'spring' as const, stiffness: 100, damping: 14 }

const starClip = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
const ribbonLeft = 'polygon(7% 0, 100% 0, 100% 100%, 7% 100%, 0 50%)'

// Signup screen — top-right corner
const topRibbons = [
  { width: '340px', left: '170.09px', top: '-82px',    bg: '#55337B', delay: 0.05 },
  { width: '350px', left: '150.13px', top: '-29px',    bg: '#B8E466', delay: 0.1 },
  { width: '315px', left: '250.07px', top: '-11.73px', bg: '#6166DB', delay: 0.15 },
  { width: '320px', left: '350px',    top: '-4.33px',  bg: '#B8E466', delay: 0.2 },
]
// Signup screen — bottom-left corner
const botRibbons = [
  { width: '340px', left: '-20.09px', top: '1000.25px', bg: '#55337B', delay: 0.05 },
  { width: '317px', left: '10.13px',  top: '947.34px',  bg: '#B8E466', delay: 0.1 },
  { width: '315px', left: '-73.07px', top: '932.68px',  bg: '#6166DB', delay: 0.15 },
  { width: '320px', left: '-200px',   top: '932.28px',  bg: '#B8E466', delay: 0.2 },
]
const topStars = [
  { left: '127.7px', top: '-19px', bg: '#6166DB', delay: 0.1 },
  { left: '112.7px', top: '39px',  bg: '#55337B', delay: 0 },
  { left: '210.7px', top: '50px',  bg: '#B8E466', delay: 0.05 },
  { left: '317.7px', top: '58px',  bg: '#6166DB', delay: 0.1 },
]
const botStars = [
  { left: '310px', top: '930.7px', bg: '#6166DB', delay: 0.1 },
  { left: '320px', top: '874.7px', bg: '#55337B', delay: 0 },
  { left: '238px', top: '856.7px', bg: '#B8E466', delay: 0.05 },
  { left: '115px', top: '856.7px', bg: '#6166DB', delay: 0.1 },
]


interface SignupResponse {
  message: string
  user: { id: string; email: string }
}

interface ResendResponse {
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: '14px' }}>
    <circle cx="12" cy="7" r="4" fill="#B8E466" />
    <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#B8E466" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: '14px' }}>
    <rect x="3" y="5" width="18" height="16" rx="2" fill="#B8E466" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: '14px' }}>
    <rect x="5" y="11" width="14" height="10" rx="2" fill="#B8E466" />
    <path d="M8 11V7a4 4 0 018 0v4" stroke="#B8E466" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
)

const EmailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginLeft: '14px' }}>
    <rect x="2" y="5" width="20" height="14" rx="2" fill="#B8E466" />
    <path d="M2 8l10 7 10-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const inputStyle = {
  width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent',
  fontFamily: 'Amiko', fontSize: '15px', color: '#333', paddingLeft: '10px',
}

const fieldStyle = (top: string) => ({
  position: 'absolute' as const,
  width: '384px', height: '50px', left: '26px', top,
  background: '#FFFFFF', boxShadow: '0px 8px 20px rgba(0,0,0,0.1)',
  borderRadius: '40px', display: 'flex', alignItems: 'center', overflow: 'hidden',
})

export default function SignupScreen() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', dob: '', username: '', password: '', confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [bypassing, setBypassing] = useState(false)

  const handleBypass = async () => {
    setBypassing(true)
    try {
      const { token } = await api<{ token: string }>('/auth/bypass-verify', {
        method: 'POST',
        body: { email: form.email.trim() },
      })
      login(token)
      navigate('/role-select')
    } catch {
      setBypassing(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim()) errs.lastName = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    else if (!EMAIL_RE.test(form.email)) errs.email = 'Invalid email'
    if (!form.dob) errs.dob = 'Required'
    else if (new Date(form.dob) >= new Date()) errs.dob = 'Must be in the past'
    if (!form.username.trim()) errs.username = 'Required'
    if (!form.password) errs.password = 'Required'
    else if (!PASSWORD_RE.test(form.password)) errs.password = '8+ chars w/ uppercase, number & symbol'
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match"
    return errs
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }
    setLoading(true)
    try {
      await api<SignupResponse>('/auth/signup', {
        method: 'POST',
        body: {
          email: form.email.trim(), username: form.username.trim(),
          firstName: form.firstName.trim(), lastName: form.lastName.trim(),
          dob: form.dob, password: form.password,
        },
      })
      setSuccess(true)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendStatus('sending')
    try {
      await api<ResendResponse>('/auth/resend-verification', {
        method: 'POST',
        body: { email: form.email.trim() },
      })
      setResendStatus('sent')
    } catch {
      setResendStatus('error')
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>


<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={spring}
            style={{ position: 'absolute', top: '250px', left: '40px', right: '40px', textAlign: 'center' }}>

            {/* Title */}
            <p style={{ fontFamily: 'Amiko', fontSize: '40px', fontWeight: 700, color: '#000', margin: 0 }}>Check Your Email!</p>

            {/* Subtitle */}
            <p style={{ fontFamily: 'Amiko', fontSize: '16px', color: '#262626', marginTop: '20px' }}>
              We sent a verification link to <strong>{form.email}</strong>
            </p>

            {/* Waiting message */}
            <p style={{ fontFamily: 'Amiko', fontSize: '15px', color: '#BEBEBE', marginTop: '40px' }}>
              This page will automatically continue once you verify.
            </p>

            {/* Didn't get an email */}
            <p style={{ fontFamily: 'Amiko', fontSize: '15px', color: '#BEBEBE', marginTop: '30px', marginBottom: '8px', textAlign: 'left', paddingLeft: '12px' }}>
              Didn't get an email?
            </p>

            {/* Resend button */}
            <button
              onClick={handleResend}
              disabled={resendStatus === 'sending' || resendStatus === 'sent'}
              style={{ width: '316px', height: '50px', background: resendStatus === 'sent' ? '#55337B' : '#6166DB', borderRadius: '40px', border: 'none', fontFamily: 'Amiko', fontWeight: 700, fontSize: '18px', color: '#fff', cursor: resendStatus === 'sent' ? 'default' : 'pointer' }}>
              {resendStatus === 'idle' && 'Resend Verification Email'}
              {resendStatus === 'sending' && 'Sending...'}
              {resendStatus === 'sent' && 'Email Sent'}
              {resendStatus === 'error' && 'Failed — Try Again'}
            </button>

            {/* Bypass button */}
            <button
              onClick={handleBypass}
              disabled={bypassing}
              style={{ marginTop: '16px', background: 'none', border: 'none', fontFamily: 'Amiko', fontSize: '13px', color: '#BEBEBE', cursor: 'pointer', textDecoration: 'underline' }}>
              {bypassing ? 'Bypassing...' : 'Bypass verification (test account)'}
            </button>

          </motion.div>
        </div>
      </div>
    )
  }

  const fields = [
    { key: 'firstName',       label: 'First Name',       type: 'text',     top: '275px', icon: <PersonIcon /> },
    { key: 'lastName',        label: 'Last Name',        type: 'text',     top: '343px', icon: <PersonIcon /> },
    { key: 'email',           label: 'Email',            type: 'email',    top: '411px', icon: <EmailIcon /> },
    { key: 'dob',             label: 'Date of Birth',    type: 'date',     top: '479px', icon: <CalendarIcon /> },
    { key: 'username',        label: 'Username',         type: 'text',     top: '547px', icon: <PersonIcon /> },
    { key: 'password',        label: 'Password',         type: 'password', top: '615px', icon: <LockIcon /> },
    { key: 'confirmPassword', label: 'Confirm Password', type: 'password', top: '683px', icon: <LockIcon /> },
  ]

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative overflow-hidden bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

        {/* Top-right stars */}
        {topStars.map((s, i) => (
          <motion.div key={`ts${i}`}
            initial={{ x: 800, y: -300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: s.delay }}
            style={{ position: 'absolute', left: s.left, top: s.top }}>
            <div style={{ width: '47.3px', height: '47.3px', background: s.bg, transform: 'rotate(11deg)', clipPath: starClip }} />
          </motion.div>
        ))}

        {/* Top-right ribbons */}
        {topRibbons.map((r, i) => (
          <motion.div key={`tr${i}`}
            initial={{ x: 800, y: -300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: r.delay }}
            style={{ position: 'absolute', left: r.left, top: r.top }}>
            <div style={{ width: r.width, height: '31.05px', background: r.bg, transform: 'matrix(0.94, -0.34, 0.34, 0.94, 0, 0)', clipPath: ribbonLeft }} />
          </motion.div>
        ))}

        {/* Bottom-left stars */}
        {botStars.map((s, i) => (
          <motion.div key={`bs${i}`}
            initial={{ x: -800, y: 300, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ ...spring, delay: s.delay }}
            style={{ position: 'absolute', left: s.left, top: s.top }}>
            <div style={{ width: '47.3px', height: '47.3px', background: s.bg, transform: 'rotate(-11deg)', clipPath: starClip }} />
          </motion.div>
        ))}

        {/* Bottom-left ribbons */}
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
            style={{ position: 'absolute', width: '373px', left: '33px', top: '100px', fontFamily: 'Amiko', fontWeight: 700, fontSize: '45px', lineHeight: '50px', textAlign: 'center', color: '#000' }}>
            Create Your Account
          </motion.p>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            style={{ position: 'absolute', width: '209px', left: '114px', top: '210px', fontFamily: 'Amiko', fontSize: '18px', textAlign: 'center', color: '#262626' }}>
            Tell Us a Little Bit About You!
          </motion.p>

          {/* Validation errors + server error */}
          {(serverError || Object.keys(errors).length > 0) && (
            <div style={{ position: 'absolute', top: '258px', left: '30px', right: '30px' }}>
              {serverError && (
                <p style={{ margin: '0 0 2px', color: 'red', fontFamily: 'Amiko', fontSize: '11px', lineHeight: '1.3' }}>{serverError}</p>
              )}
              {errors.firstName   && <p style={{ margin: '0 0 2px', color: 'red', fontFamily: 'Amiko', fontSize: '11px', lineHeight: '1.3' }}>First name: {errors.firstName}</p>}
              {errors.lastName    && <p style={{ margin: '0 0 2px', color: 'red', fontFamily: 'Amiko', fontSize: '11px', lineHeight: '1.3' }}>Last name: {errors.lastName}</p>}
              {errors.email       && <p style={{ margin: '0 0 2px', color: 'red', fontFamily: 'Amiko', fontSize: '11px', lineHeight: '1.3' }}>Email: {errors.email}</p>}
              {errors.dob         && <p style={{ margin: '0 0 2px', color: 'red', fontFamily: 'Amiko', fontSize: '11px', lineHeight: '1.3' }}>DOB: {errors.dob}</p>}
              {errors.username    && <p style={{ margin: '0 0 2px', color: 'red', fontFamily: 'Amiko', fontSize: '11px', lineHeight: '1.3' }}>Username: {errors.username}</p>}
              {errors.password    && <p style={{ margin: '0 0 2px', color: 'red', fontFamily: 'Amiko', fontSize: '11px', lineHeight: '1.3' }}>Password must contain: {errors.password}</p>}
              {errors.confirmPassword && <p style={{ margin: '0 0 2px', color: 'red', fontFamily: 'Amiko', fontSize: '11px', lineHeight: '1.3' }}>Confirm password: {errors.confirmPassword}</p>}
            </div>
          )}

          {/* Fields */}
          {fields.map((f, i) => (
            <motion.div key={f.key}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.15 + i * 0.07 }}
              style={fieldStyle(f.top)}>
                      {f.icon}
              <input
                type={f.type}
                placeholder={errors[f.key] ? errors[f.key] : f.label}
                value={form[f.key as keyof typeof form]}
                onChange={set(f.key)}
                disabled={loading}
                style={{ ...inputStyle, color: errors[f.key] ? '#ff4444' : (f.type === 'date' && !form[f.key as keyof typeof form] ? '#9CA3AF' : '#333') }}
              />
            </motion.div>
          ))}

          {/* Already have an account */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ ...spring, delay: 0.35 }}
            style={{ position: 'absolute', left: 0, right: 0, top: '825px', textAlign: 'center', fontFamily: 'Amiko', fontSize: '15px', color: '#BEBEBE', margin: 0 }}>
            <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
              Already Have an Account?
            </span>
          </motion.p>

          {/* Continue button */}
          <motion.button
            type="submit"
            disabled={loading}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.75 }}
            style={{ position: 'absolute', width: '316px', height: '50px', left: '62px', top: '765px', background: '#6166DB', borderRadius: '40px', border: 'none', fontFamily: 'Amiko', fontWeight: 700, fontSize: '22px', color: '#fff', cursor: 'pointer' }}>
            {loading ? 'Creating account...' : 'Continue'}
          </motion.button>

        </form>
      </div>
    </div>
  )
}
