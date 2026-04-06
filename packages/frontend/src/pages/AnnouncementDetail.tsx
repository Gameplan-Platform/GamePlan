import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

interface AnnouncementDetail {
  id: string
  title: string
  body: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
  memberRole: string
  author: { firstName: string; lastName: string }
}

export default function AnnouncementDetail() {
  const { id: moduleId, announcementId } = useParams<{ id: string; announcementId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = announcement?.memberRole === 'MODULE_ADMIN'

  useEffect(() => {
    if (!moduleId || !announcementId || !token) return
    api<{ announcement: AnnouncementDetail }>(
      `/modules/${moduleId}/announcements/${announcementId}`,
      { token }
    )
      .then(data => setAnnouncement(data.announcement))
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [moduleId, announcementId, token])

  async function handleLike() {
    if (!announcement) return
    const wasLiked = announcement.likedByMe
    setAnnouncement(prev => prev ? {
      ...prev,
      likedByMe: !wasLiked,
      likeCount: wasLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    } : prev)
    try {
      await api(`/modules/${moduleId}/announcements/${announcementId}/like`, {
        method: wasLiked ? 'DELETE' : 'POST',
        token: token ?? undefined,
      })
    } catch {
      setAnnouncement(prev => prev ? {
        ...prev,
        likedByMe: wasLiked,
        likeCount: wasLiked ? prev.likeCount + 1 : prev.likeCount - 1,
      } : prev)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this announcement?')) return
    setDeleting(true)
    try {
      await api(`/modules/${moduleId}/announcements/${announcementId}`, {
        method: 'DELETE',
        token: token ?? undefined,
      })
      navigate(`/modules/${moduleId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
      setDeleting(false)
    }
  }

  const date = announcement
    ? new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Amiko', fontSize: '16px', color: '#BEBEBE' }}>Loading...</p>
      </div>
    </div>
  )

  if (error || !announcement) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative bg-white" style={{ width: '440px', height: '956px', borderRadius: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Amiko', fontSize: '16px', color: '#FF6B6B' }}>{error ?? 'Not found'}</p>
      </div>
    </div>
  )

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="relative bg-white overflow-hidden" style={{ width: '440px', height: '956px', borderRadius: '55px' }}>

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

        {/* Content */}
        <div style={{
          position: 'absolute', top: '130px', left: '24px', right: '24px', bottom: '24px',
          overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {/* Subject bubble */}
          <div style={{
            background: '#55337B', borderRadius: '20px',
            padding: '8px 18px',
          }}>
            <span style={{ fontFamily: 'Amiko', fontWeight: 700, fontSize: '16px', color: '#FFFFFF' }}>
              {announcement.title}
            </span>
          </div>

          {/* Meta: author + date */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '4px', paddingRight: '4px' }}>
            <span style={{ fontFamily: 'Amiko', fontSize: '11px', color: '#888' }}>
              {announcement.author.firstName} {announcement.author.lastName}
            </span>
            <span style={{ fontFamily: 'Amiko', fontSize: '11px', color: '#888' }}>{date}</span>
          </div>

          {/* Body */}
          <div style={{
            background: '#FFFFFF', borderRadius: '20px',
            border: '1px solid #E0E0E0',
            boxShadow: '0px 0px 4px rgba(0,0,0,0.15)',
            padding: '16px 18px', minHeight: '200px', maxHeight: '500px',
          }}>
            <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#222B45', margin: 0, lineHeight: '22px', whiteSpace: 'pre-wrap' }}>
              {announcement.body}
            </p>
          </div>

          {/* Like + admin buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px' }}>
            <button
              onClick={handleLike}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                paddingLeft: '4px',
              }}
            >
              <svg width="22" height="20" viewBox="0 0 22 20" fill={announcement.likedByMe ? '#6166DB' : 'none'}>
                <path d="M11 18.5C11 18.5 1.5 13 1.5 6.5C1.5 4.01 3.51 2 6 2C7.74 2 9.26 2.93 10.12 4.3C10.35 4.68 10.65 4.68 10.88 4.3C11.74 2.93 13.26 2 15 2C17.49 2 19.5 4.01 19.5 6.5C19.5 13 11 18.5 11 18.5Z"
                  stroke="#6166DB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: 'Amiko', fontSize: '13px', color: '#6166DB' }}>
                {announcement.likeCount} {announcement.likeCount === 1 ? 'like' : 'likes'}
              </span>
            </button>

            {isAdmin && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigate(`/modules/${moduleId}/announcements/${announcementId}/edit`)}
                  style={{
                    height: '36px', padding: '0 18px', borderRadius: '20px',
                    background: '#B8E466', border: 'none', cursor: 'pointer',
                    fontFamily: 'Amiko', fontSize: '14px', color: '#FFFFFF',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    height: '36px', padding: '0 18px', borderRadius: '20px',
                    background: '#E53935', border: 'none', cursor: 'pointer',
                    fontFamily: 'Amiko', fontSize: '14px', color: '#FFFFFF',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
                    opacity: deleting ? 0.5 : 1,
                  }}
                >
                  {deleting ? '...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
