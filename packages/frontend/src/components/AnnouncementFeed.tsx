import AnnouncementCard from './AnnouncementCard'

export interface Announcement {
  id: string
  title: string
  body: string
  createdAt: string
  author: { firstName: string; lastName: string }
}

interface AnnouncementFeedProps {
  announcements: Announcement[]
}

export default function AnnouncementFeed({ announcements }: AnnouncementFeedProps) {
  if (announcements.length === 0) {
    return (
      <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#BEBEBE', textAlign: 'center', marginTop: '24px' }}>
        No announcements yet.
      </p>
    )
  }

  return (
    <div>
      {announcements.map(a => (
        <AnnouncementCard
          key={a.id}
          title={a.title}
          body={a.body}
          authorName={`${a.author.firstName} ${a.author.lastName}`}
          createdAt={a.createdAt}
        />
      ))}
    </div>
  )
}
