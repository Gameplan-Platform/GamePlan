import { useState } from 'react'
import { api } from '../utils/api'

interface AnnouncementCardProps {
  id: string
  moduleId: string
  title: string
  body: string
  authorName: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
  token: string | null
}

export default function AnnouncementCard({
  id,
  moduleId,
  title,
  body,
  authorName,
  createdAt,
  likeCount: initialLikeCount,
  likedByMe: initialLikedByMe,
  token,
}: AnnouncementCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [likedByMe, setLikedByMe] = useState(initialLikedByMe)
  const [likeCount, setLikeCount] = useState(initialLikeCount)

  const formatted = new Date(createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!token) return

    const nowLiked = !likedByMe
    setLikedByMe(nowLiked)
    setLikeCount(prev => prev + (nowLiked ? 1 : -1))

    try {
      await api(`/modules/${moduleId}/announcements/${id}/like`, {
        token,
        method: nowLiked ? 'POST' : 'DELETE',
      })
    } catch {
      setLikedByMe(!nowLiked)
      setLikeCount(prev => prev + (nowLiked ? -1 : 1))
    }
  }

  return (
    <div
      onClick={() => setExpanded(prev => !prev)}
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '18px 20px',
        boxShadow: '0px 2px 10px rgba(0,0,0,0.08)',
        marginBottom: '14px',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <p style={{ fontFamily: 'Amiko', fontWeight: 700, fontSize: '16px', color: '#262626', margin: '0 0 6px' }}>
        {title}
      </p>
      {expanded && (
        <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#444', margin: '0 0 12px', lineHeight: '1.5' }}>
          {body}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#6166DB', fontWeight: 600 }}>
          {authorName}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'Amiko', fontSize: '11px', color: '#BEBEBE' }}>
            {formatted}
          </span>
          {token && (
            <button
              onClick={handleHeartClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: '0',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>
                {likedByMe ? '❤️' : '🤍'}
              </span>
              <span style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#BEBEBE' }}>
                {likeCount}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
