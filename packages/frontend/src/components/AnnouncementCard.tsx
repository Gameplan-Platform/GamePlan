interface AnnouncementCardProps {
  title: string
  body: string
  authorName: string
  createdAt: string
}

export default function AnnouncementCard({ title, body, authorName, createdAt }: AnnouncementCardProps) {
  const formatted = new Date(createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '20px',
      padding: '18px 20px',
      boxShadow: '0px 2px 10px rgba(0,0,0,0.08)',
      marginBottom: '14px',
    }}>
      <p style={{ fontFamily: 'Amiko', fontWeight: 700, fontSize: '16px', color: '#262626', margin: '0 0 6px' }}>
        {title}
      </p>
      <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#444', margin: '0 0 12px', lineHeight: '1.5' }}>
        {body}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Amiko', fontSize: '12px', color: '#6166DB', fontWeight: 600 }}>
          {authorName}
        </span>
        <span style={{ fontFamily: 'Amiko', fontSize: '11px', color: '#BEBEBE' }}>
          {formatted}
        </span>
      </div>
    </div>
  )
}
