import AnnouncementCard from './AnnouncementCard'

export interface Announcement {
  id: string
  title: string
  body: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
  author: { firstName: string; lastName: string }
}

interface AnnouncementFeedProps {
  announcements: Announcement[]
  moduleId: string
  token: string | null
}

export default function AnnouncementFeed({ announcements, moduleId, token }: AnnouncementFeedProps) {
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
          id={a.id}
          moduleId={moduleId}
          title={a.title}
          body={a.body}
          authorName={`${a.author.firstName} ${a.author.lastName}`}
          createdAt={a.createdAt}
          likeCount={a.likeCount}
          likedByMe={a.likedByMe}
          token={token}
        />
      ))}
    </div>
  )
}
