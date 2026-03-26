import AgendaCard from './AgendaCard'

export interface AgendaItem {
  id: string
  title: string
  description?: string | null
  date: string
  author: { firstName: string; lastName: string }
  likeCount: number
  likedByMe: boolean
}

interface AgendaFeedProps {
  agendas: AgendaItem[]
  moduleId: string
  token: string | null
}

export default function AgendaFeed({ agendas, moduleId, token }: AgendaFeedProps) {
  if (agendas.length === 0) {
    return (
      <p style={{ fontFamily: 'Amiko', fontSize: '14px', color: '#BEBEBE', textAlign: 'center', marginTop: '24px' }}>
        No agenda items yet.
      </p>
    )
  }

  return (
    <div>
      {agendas.map(a => (
        <AgendaCard
          key={a.id}
          id={a.id}
          moduleId={moduleId}
          title={a.title}
          description={a.description}
          date={a.date}
          authorName={`${a.author.firstName} ${a.author.lastName}`}
          likeCount={a.likeCount}
          likedByMe={a.likedByMe}
          token={token}
        />
      ))}
    </div>
  )
}
