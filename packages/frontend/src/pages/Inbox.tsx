import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BottomNav from '../components/BottomNav'

interface Conversation {
  id: string
  name: string
  isGroup: boolean
  latestMessage: string | null
  latestMessageTime: string | null
  moduleId?: string
  hasUnread: boolean
  profilePicture?: string | null
  members: { id: string; firstName: string; lastName: string }[]
}

export default function Messaging() {
  const { id: moduleId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (!token) return
    api<{ previews: Conversation[] }>(`/conversations?moduleId=${moduleId}`, { token })
      .then(data => {
        console.log('conversations:', data.previews)
        setConversations(data.previews)})
      .catch(() => {})
  }, [token, moduleId])

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
  
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const sortedConversations = [...conversations]
  .filter(conv => conv.isGroup || (conv.latestMessage !== null && (!conv.moduleId || conv.moduleId === moduleId)))
  .sort((a, b) => {
    if (!a.latestMessageTime) return 1
    if (!b.latestMessageTime) return -1
    return new Date(b.latestMessageTime).getTime() - new Date(a.latestMessageTime).getTime()
  })

  const currentUserId = token
  ? JSON.parse(atob(token.split('.')[1])).userId
  : null

  const getConversationName = (conv: Conversation) => {
  if (conv.name) return conv.name
  const other = conv.members.find(m => m.id !== currentUserId)
  return other ? `${other.firstName} ${other.lastName}` : 'Unknown'
}

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        style={{
          fontFamily: "'Amiko', sans-serif",
          width: '440px',
          height: '956px',
          borderRadius: '55px',
          overflow: 'hidden',
          background: '#FFFFFF',
          position: 'relative',
        }}
        className="mx-auto flex flex-col"
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiko:wght@400;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="relative flex items-center justify-center px-6 pt-16 pb-10">
          <button
            className="absolute left-6 w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg text-[#222b45]"
            onClick={() => navigate(`/modules/${moduleId}`)}
          >‹</button>
          <h1 style={{
            fontFamily: 'Amiko',
            fontWeight: 400,
            fontSize: '40px',
            lineHeight: '53px',
            color: '#000000',
            margin: 0,
          }}>Inbox</h1>
          <button
            onClick={() => navigate(`/modules/${moduleId}/messages/new`)}
            style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#B8E466', border: 'none', cursor: 'pointer',
                boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'absolute', right: '24px',
            }}
            >
            <div style={{ position: 'relative', width: '16px', height: '16px' }}>
                <div style={{ position: 'absolute', left: '7px', top: 0, width: '2px', height: '16px', background: '#FFFFFF' }} />
                <div style={{ position: 'absolute', top: '7px', left: 0, width: '16px', height: '2px', background: '#FFFFFF' }} />
            </div>
            </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 px-6 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-center text-sm text-[#8f9bb3] mt-8">No conversations yet</p>
          )}

          {sortedConversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => navigate(`/modules/${moduleId}/messages/${conv.id}`)}
              className="flex items-center gap-5 py-6 border-b border-gray-100 cursor-pointer"
            >
              {/* Unread dot */}
              {conv.hasUnread
                ? <div className="w-2 h-2 rounded-full bg-[#6166db] flex-shrink-0" />
                : <div className="w-2 h-2 flex-shrink-0" />
              }

              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: '#6166DB', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                }}>
                {conv.profilePicture ? (
                  <img src={conv.profilePicture} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                  <span style={{ fontFamily: 'Amiko', fontSize: '16px', color: '#FFFFFF', fontWeight: 700 }}>
                    {getConversationName(conv).charAt(0).toUpperCase()}
                  </span>
                  )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-[#222b45]">
                    {getConversationName(conv)}
                  </span>
                  {conv.latestMessageTime && (
                    <span className="text-xs text-[#8f9bb3]">
                      {formatMessageTime(conv.latestMessageTime)}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-0.5 truncate text-[#8f9bb3]">
                  {conv.latestMessage ?? 'No messages yet'}
                </p>
              </div>
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke="#CED3DE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>

        <BottomNav />
      </div>
    </div>
  )
}