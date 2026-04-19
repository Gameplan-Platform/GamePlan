import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

interface RosterMember {
  userId: string
  name: string
  role: string
  email: string
  profilePicture: string | null
}

export default function NewMessage() {
  const { id: moduleId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [roster, setRoster] = useState<RosterMember[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState<string | null>(null)

  const currentUserId = token
    ? JSON.parse(atob(token.split('.')[1])).userId
    : null

  useEffect(() => {
    if (!token || !moduleId) return
    api<{ roster: RosterMember[] }>(`/modules/${moduleId}/roster`, { token })
      .then(data => setRoster(data.roster))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, moduleId])

  const filtered = roster.filter(member =>
    member.userId !== currentUserId &&
    member.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleSelectMember(otherUserId: string) {
    if (starting) return
    setStarting(otherUserId)
    try {
      const data = await api<{ conversation: { id: string } }>('/conversations/private', {
        method: 'POST',
        token: token ?? undefined,
        body: { otherUserId, moduleId },
      })
      navigate(`/modules/${moduleId}/messages/${data.conversation.id}`)
    } catch {
      setStarting(null)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        style={{
          fontFamily: "'Amiko', sans-serif",
          width: '440px',
          height: '956px',
          borderRadius: '55px',
          overflow: 'hidden',
          background: '#FFFFFF',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiko:wght@400;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="relative flex items-center justify-center px-6 pt-10 pb-6 flex-shrink-0">
          <button
            className="absolute left-6 w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg text-[#222b45]"
            onClick={() => navigate(`/modules/${moduleId}/messaging`)}
          >‹</button>
          <h1 className="text-3xl font-bold text-[#222b45]">New Message</h1>
        </div>

        {/* Search */}
        <div className="px-6 pb-4 flex-shrink-0">
          <div style={{
            background: '#F0F0F8', borderRadius: '22px',
            display: 'flex', alignItems: 'center',
            padding: '0 16px', height: '44px',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" stroke="#8f9bb3" strokeWidth="2"/>
              <path d="M21 21L16.65 16.65" stroke="#8f9bb3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search people..."
              style={{
                flex: 1, background: 'transparent',
                border: 'none', outline: 'none',
                fontFamily: 'Amiko', fontSize: '14px', color: '#222B45',
              }}
            />
          </div>
        </div>

        {/* To: field */}
        <div style={{
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #F0F0F0',
        padding: '12px 24px',
        gap: '8px',
        }}>
        <span style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#8f9bb3', flexShrink: 0 }}>To:</span>
        <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name"
            autoFocus
            style={{
            flex: 1, border: 'none', outline: 'none',
            fontFamily: 'Amiko', fontSize: '14px', color: '#222B45',
            background: 'transparent',
            }}
        />
        </div>

        {/* Dropdown results — only show when search has text */}
        {search.trim() && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 && (
            <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#BEBEBE', textAlign: 'center', marginTop: '40px' }}>
                No results
            </p>
            )}
            {filtered.map(member => (
            <div
                key={member.userId}
                onClick={() => handleSelectMember(member.userId)}
                style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 24px',
                borderBottom: '1px solid #F0F0F0',
                cursor: 'pointer',
                }}
            >
                <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#6166DB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                }}>
                <span style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#FFFFFF', fontWeight: 700 }}>
                    {member.name.charAt(0)}
                </span>
                </div>
                <div>
                <p style={{ fontFamily: 'Amiko', fontSize: '14px', fontWeight: 700, color: '#222B45', margin: 0 }}>
                    {member.name}
                </p>
                <p style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#8f9bb3', margin: '2px 0 0 0' }}>
                    {member.role === 'MODULE_ADMIN' ? 'Coach' : 'Member'}
                </p>
                </div>
            </div>
            ))}
        </div>
        )}

{/* Empty state when no search */}
{!search.trim() && (
  <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#BEBEBE', textAlign: 'center', marginTop: '40px' }}>
    Start typing a name
  </p>
)}
      </div>
    </div>
  )
}