import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BottomNav from '../components/BottomNav'

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    username: string
    firstName: string
    lastName: string
    role: string
    profilePicture: string | null
  }
}

export default function ConversationDetail() {
  const { id: moduleId, conversationId } = useParams<{ id: string; conversationId: string }>()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [conversationName, setConversationName] = useState('Chat')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const currentUserId = token
    ? JSON.parse(atob(token.split('.')[1])).userId
    : null

  // Fetch conversation name
  useEffect(() => {
    if (!token) return
    api<{ previews: { id: string; name: string | null; isGroup: boolean; members: { id: string; firstName: string; lastName: string }[] }[] }>('/conversations', { token })
      .then(data => {
        const conv = data.previews.find(p => p.id === conversationId)
        if (conv) {
          if (conv.name) {
            setConversationName(conv.name)
          } else {
            // private chat — show the other person's name
            const other = conv.members.find(m => m.id !== currentUserId)
            if (other) setConversationName(`${other.firstName} ${other.lastName}`)
          }
        }
      })
      .catch(() => {})
  }, [token, conversationId, currentUserId])

  // Fetch messages
  useEffect(() => {
    if (!token || !conversationId) return
    api<{ messages: Message[] }>(`/conversations/${conversationId}/messages`, { token })
      .then(data => setMessages(data.messages))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, conversationId])

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!token || !conversationId) return
    const interval = setInterval(() => {
      api<{ messages: Message[] }>(`/conversations/${conversationId}/messages`, { token })
        .then(data => setMessages(data.messages))
        .catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [token, conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!content.trim() || sending) return
    setSending(true)
    try {
      const data = await api<{ data: Message }>(`/conversations/${conversationId}/message`, {
        method: 'POST',
        token: token ?? undefined,
        body: { content },
      })
      setMessages(prev => [...prev, data.data])
      setContent('')
    } catch {
      // handle error silently
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

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
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiko:wght@400;600;700&display=swap');`}</style>

        {/* Header */}
        <div className="relative flex items-center justify-center px-6 pt-10 pb-6 border-b border-gray-100 flex-shrink-0">
          <button
            className="absolute left-6 w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg text-[#222b45]"
            onClick={() => navigate(`/modules/${moduleId}/messaging`)}
          >‹</button>
          <h1 className="text-2xl font-bold text-[#222b45]">{conversationName}</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ paddingBottom: '100px' }}>
          {loading && (
            <p className="text-center text-sm text-[#8f9bb3] mt-8">Loading...</p>
          )}

          {!loading && messages.length === 0 && (
            <p className="text-center text-sm text-[#8f9bb3] mt-8">No messages yet. Say hello!</p>
          )}

          <div className="flex flex-col gap-3">
            {messages.map(msg => {
              const isMe = msg.senderId === currentUserId
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender name for others */}
                  {!isMe && (
                    <span className="text-xs text-[#8f9bb3] mb-1 pl-1">
                      {msg.sender.firstName} {msg.sender.lastName}
                    </span>
                  )}

                  {/* Bubble */}
                  <div
                    style={{
                      maxWidth: '75%',
                      background: isMe ? '#6166DB' : '#F0F0F8',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: '10px 14px',
                    }}
                  >
                    <p style={{
                      fontFamily: 'Amiko', fontSize: '14px',
                      color: isMe ? '#FFFFFF' : '#222B45',
                      margin: 0, lineHeight: '20px',
                    }}>
                      {msg.content}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-xs text-[#8f9bb3] mt-1 px-1">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0"
          style={{ background: '#FFFFFF', position: 'sticky', bottom: '95px', left: 0, right: 0 }}
        >
          <input
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            style={{
              flex: 1, height: '44px',
              background: '#F0F0F8',
              borderRadius: '22px',
              border: 'none', outline: 'none',
              padding: '0 16px',
              fontFamily: 'Amiko', fontSize: '14px', color: '#222B45',
            }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !content.trim()}
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: content.trim() ? '#6166DB' : '#E0E0E0',
              border: 'none',
              cursor: content.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <BottomNav />
      </div>
    </div>
  )
}