import { useState } from 'react'
import { api } from '../utils/api'
import type { AgendaItem } from './AgendaFeed'

interface CreateAgendaFormProps {
  moduleId: string
  token: string
  onCreated: (agenda: AgendaItem) => void
}

export default function CreateAgendaForm({ moduleId, token, onCreated }: CreateAgendaFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const validate = () => {
    const e: { title?: string; date?: string } = {}
    if (!title.trim()) e.title = 'Title is required'
    if (!date) e.date = 'Date is required'
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
      const data = await api<{ agenda: AgendaItem }>(
        `/modules/${moduleId}/agendas`,
        { method: 'POST', body: { title: title.trim(), description: description.trim() || undefined, date }, token }
      )
      onCreated(data.agenda)
      setTitle('')
      setDescription('')
      setDate('')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '28px' }}>
      <p style={{ fontFamily: 'Amiko', fontWeight: 700, fontSize: '18px', color: '#262626', margin: '0 0 16px' }}>
        New Agenda Item
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

      {/* Date */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          background: '#F5F5F5', borderRadius: '40px',
          border: errors.date ? '1.5px solid #FF6B6B' : '1.5px solid transparent',
          overflow: 'hidden',
        }}>
          <input
            type="datetime-local"
            value={date}
            onChange={e => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: undefined })) }}
            style={{
              width: '100%', height: '44px', border: 'none', outline: 'none',
              background: 'transparent', fontFamily: 'Amiko', fontSize: '15px',
              color: '#333', padding: '0 16px', boxSizing: 'border-box',
            }}
          />
        </div>
        {errors.date && (
          <p style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#FF6B6B', margin: '4px 0 0 8px' }}>
            {errors.date}
          </p>
        )}
      </div>

      {/* Description (optional) */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          background: '#F5F5F5', borderRadius: '16px',
          border: '1.5px solid transparent',
          overflow: 'hidden',
        }}>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            style={{
              width: '100%', border: 'none', outline: 'none',
              background: 'transparent', fontFamily: 'Amiko', fontSize: '14px',
              color: '#333', padding: '12px 16px', boxSizing: 'border-box',
              resize: 'none', lineHeight: '1.5',
            }}
          />
        </div>
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
        {submitting ? 'Adding...' : 'Add Agenda Item'}
      </button>
    </form>
  )
}
