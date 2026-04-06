import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function CreateAgenda() {
  const { id: moduleId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePost() {
    if (!title.trim() || !description.trim() || !date) return
    setSubmitting(true)
    setError(null)
    try {
      await api(`/modules/${moduleId}/agendas`, {
        method: 'POST',
        token: token ?? undefined,
        body: { title, description, date },
      })
      navigate(`/modules/${moduleId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="relative bg-white overflow-hidden"
        style={{ width: '440px', height: '956px', borderRadius: '55px' }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(`/modules/${moduleId}`)}
          style={{
            position: 'absolute', left: '28px', top: '74px',
            width: '38px', height: '42px',
            background: 'transparent', border: '1px solid #CED3DE',
            borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.5,
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8.5 1L1.5 8L8.5 15" stroke="#222B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Title */}
        <p style={{
          position: 'absolute', left: '112px', top: '69px',
          width: '216px', height: '53px',
          fontFamily: 'Amiko', fontWeight: 400, fontSize: '40px',
          lineHeight: '53px', color: '#000000', margin: 0,
          pointerEvents: 'none',
        }}>
          Dashboard
        </p>

        {/* Subject label */}
        <div style={{
          position: 'absolute', left: '51px', top: '132px',
          width: '105px', height: '30px',
          background: '#6166DB', borderRadius: '21px',
          boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#FFFFFF' }}>Subject</span>
        </div>

        {/* Subject input */}
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter Subject Here"
          rows={1}
          style={{
            position: 'absolute', left: '50px', top: '174px',
            width: '350px', height: '70px',
            background: '#FFFFFF',
            boxShadow: '0px 0px 4px rgba(0,0,0,0.25)',
            borderRadius: '20px', border: 'none',
            padding: '14px 18px',
            fontFamily: 'Amiko', fontSize: '15px', color: '#000000',
            outline: 'none', resize: 'none', boxSizing: 'border-box',
          }}
        />

        {/* Date label */}
        <div style={{
          position: 'absolute', left: '51px', top: '257px',
          width: '105px', height: '30px',
          background: '#6166DB', borderRadius: '21px',
          boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#FFFFFF' }}>Date</span>
        </div>

        {/* Date input */}
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className={date ? 'has-value' : ''}
          style={{
            position: 'absolute', left: '50px', top: '299px',
            width: '350px', height: '60px',
            background: '#FFFFFF',
            boxShadow: '0px 0px 4px rgba(0,0,0,0.25)',
            borderRadius: '20px', border: 'none',
            padding: '0 18px',
            fontFamily: 'Amiko', fontSize: '15px', color: '#000000',
            outline: 'none', boxSizing: 'border-box',
          }}
        />

        {/* Agenda label */}
        <div style={{
          position: 'absolute', left: '51px', top: '372px',
          width: '105px', height: '30px',
          background: '#6166DB', borderRadius: '21px',
          boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Amiko', fontSize: '11px', color: '#FFFFFF' }}>Agenda</span>
        </div>

        {/* Agenda textarea */}
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Enter Agenda Here"
          style={{
            position: 'absolute', left: '50px', top: '414px',
            width: '350px', height: '340px',
            background: '#FFFFFF',
            boxShadow: '0px 0px 4px rgba(0,0,0,0.25)',
            borderRadius: '20px', border: 'none',
            padding: '16px 18px',
            fontFamily: 'Amiko', fontSize: '15px', color: '#000000',
            outline: 'none', resize: 'none', boxSizing: 'border-box',
          }}
        />

        {/* Error */}
        {error && (
          <p style={{
            position: 'absolute', left: '50px', top: '772px',
            fontFamily: 'Amiko', fontSize: '12px', color: '#FF6B6B', margin: 0,
          }}>
            {error}
          </p>
        )}

        {/* Cancel button */}
        <button
          onClick={() => navigate(`/modules/${moduleId}`)}
          style={{
            position: 'absolute', left: '156px', top: '788px',
            width: '116px', height: '45px',
            background: '#FFFFFF',
            boxShadow: '0px 1px 4px rgba(0,0,0,0.25)',
            borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontFamily: 'Amiko', fontSize: '20px', color: '#222B45',
          }}
        >
          Cancel
        </button>

        {/* Post button */}
        <button
          onClick={handlePost}
          disabled={submitting || !title.trim() || !description.trim() || !date}
          style={{
            position: 'absolute', left: '284px', top: '789px',
            width: '116px', height: '45px',
            background: '#B8E466',
            borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontFamily: 'Amiko', fontSize: '20px', color: '#FFFFFF',
            opacity: submitting || !title.trim() || !description.trim() || !date ? 0.5 : 1,
          }}
        >
          {submitting ? '...' : 'Post'}
        </button>

      </div>
    </div>
  )
}
