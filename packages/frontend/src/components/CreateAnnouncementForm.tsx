import { useState } from 'react'
import { api } from '../utils/api'
import type { Announcement } from './AnnouncementFeed'

interface CreateAnnouncementFormProps {
  moduleId: string
  token: string
  onCreated: (announcement: Announcement) => void
}

export default function CreateAnnouncementForm({ moduleId, token, onCreated }: CreateAnnouncementFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const validate = () => {
    const e: { title?: string; body?: string } = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!body.trim()) e.body = 'Body is required'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    setSubmitting(true)
    try {
      const data = await api<{ announcement: Omit<Announcement, 'likeCount' | 'likedByMe'> }>(
        `/modules/${moduleId}/announcements`,
        { method: 'POST', body: { title: title.trim(), body: body.trim() }, token }
      )
      onCreated({ ...data.announcement, likeCount: 0, likedByMe: false })
      setTitle('')
      setBody('')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '28px' }}>
      <p style={{ fontFamily: 'Amiko', fontWeight: 700, fontSize: '18px', color: '#262626', margin: '0 0 16px' }}>
        New Announcement
      </p>

      {/* Title */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          background: '#F5F5F5', borderRadius: '40px',
          border: errors.title ? '1.5px solid #FF6B6B' : '1.5px solid transparent',
          overflow: 'hidden',
        }}>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: undefined })) }}
            placeholder="Title"
            style={{
              width: '100%', height: '44px', border: 'none', outline: 'none',
              background: 'transparent', fontFamily: 'Amiko', fontSize: '15px',
              color: '#333', padding: '0 16px', boxSizing: 'border-box',
            }}
          />
        </div>
        {errors.title && (
          <p style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#FF6B6B', margin: '4px 0 0 8px' }}>
            {errors.title}
          </p>
        )}
      </div>

      {/* Body */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          background: '#F5F5F5', borderRadius: '16px',
          border: errors.body ? '1.5px solid #FF6B6B' : '1.5px solid transparent',
          overflow: 'hidden',
        }}>
          <textarea
            value={body}
            onChange={e => { setBody(e.target.value); setErrors(prev => ({ ...prev, body: undefined })) }}
            placeholder="Write your announcement..."
            rows={4}
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent', fontFamily: 'Amiko', fontSize: '14px',
              color: '#333', padding: '12px 16px', boxSizing: 'border-box',
              resize: 'none', lineHeight: '1.5',
            }}
          />
        </div>
        {errors.body && (
          <p style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#FF6B6B', margin: '4px 0 0 8px' }}>
            {errors.body}
          </p>
        )}
      </div>

      {apiError && (
        <p style={{ fontFamily: 'Amiko', fontSize: '13px', color: '#FF6B6B', margin: '0 0 12px 4px' }}>
          {apiError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%', height: '44px',
          background: submitting ? '#BEBEBE' : '#6166DB',
          border: 'none', borderRadius: '40px',
          fontFamily: 'Amiko', fontWeight: 600, fontSize: '16px',
          color: '#FFFFFF', cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Posting...' : 'Post Announcement'}
      </button>
    </form>
  )
}
