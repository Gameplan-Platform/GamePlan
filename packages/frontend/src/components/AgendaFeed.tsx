import AgendaCard from './AgendaCard'

export interface AgendaItem {
  id: string
  title: string
  description?: string | null
  date: string
  author: { firstName: string; lastName: string }
}

interface AgendaFeedProps {
  agendas: AgendaItem[]
}

export default function AgendaFeed({ agendas }: AgendaFeedProps) {
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
          title={a.title}
          description={a.description}
          date={a.date}
          authorName={`${a.author.firstName} ${a.author.lastName}`}
        />
      ))}
    </div>
  )
}
