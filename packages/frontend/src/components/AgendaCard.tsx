import { useState } from 'react'

interface AgendaCardProps {
  title: string
  description?: string | null
  date: string
  authorName: string
}

export default function AgendaCard({ title, description, date, authorName }: AgendaCardProps) {
  const [expanded, setExpanded] = useState(false)

  const eventDate = new Date(date)
  const isPast = eventDate < new Date()

  const formattedDate = eventDate.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      onClick={() => description && setExpanded(prev => !prev)}
      style={{
        background: isPast ? '#F7F7F7' : '#FFFFFF',
        borderRadius: '20px',
        padding: '18px 20px',
        boxShadow: '0px 2px 10px rgba(0,0,0,0.06)',
        marginBottom: '14px',
        cursor: description ? 'pointer' : 'default',
        userSelect: 'none',
        borderLeft: isPast ? '4px solid #BEBEBE' : '4px solid #6166DB',
        opacity: isPast ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
        <p style={{ fontFamily: 'Amiko', fontWeight: 700, fontSize: '16px', color: isPast ? '#888' : '#262626', margin: 0, flex: 1 }}>
          {title}
        </p>
        {isPast && (
          <span style={{ fontFamily: 'Amiko', fontSize: '11px', color: '#BEBEBE', marginLeft: '8px', whiteSpace: 'nowrap' }}>
            Past
          </span>
        )}
      </div>

      {expanded && description && (
        <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#444', margin: '0 0 10px', lineHeight: '1.5' }}>
          {description}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Amiko', fontSize: '12px', color: isPast ? '#AAAAAA' : '#6166DB', fontWeight: 600 }}>
          {authorName}
        </span>
        <span style={{ fontFamily: 'Amiko', fontSize: '11px', color: '#BEBEBE' }}>
          {formattedDate}
        </span>
      </div>
    </div>
  )
}
