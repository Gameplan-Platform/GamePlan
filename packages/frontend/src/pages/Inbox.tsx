import { useState , useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import BottomNav from '../components/BottomNav'

interface Message {
    id: string,
    senderName: string,
    preview: string,
    sentAt: string,
    read: boolean
}

export default function Messaging()
{
    const { moduleId } = useParams()
    const navigate = useNavigate()
    const [messages, sentMessages] = useState<Message[]>([{ 
        id: '1', senderName: 'John Doe', preview: 'Hey, practice is at 5pm...', sentAt: '2026-04-07T12:00:00Z', read: false },
        { id: '2', senderName: 'Jane Smith', preview: 'Can you send the schedule?', sentAt: '2026-04-06T09:00:00Z', read: true },
])
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    )
    const { token } = useAuth()


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
                <div className="relative flex items-center justify-center px-6 pt-10 pb-10">
                    <button
                        className="absolute left-6 w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg text-[#222b45]"
                        onClick={() => window.history.back()}
                    >‹</button>
                    <h1 className="text-4xl font-bold text-[#222b45]">Inbox</h1>
                </div>
                {/* New Message */}
                <div className="flex-1 px-6 overflow-y-auto">
                    {sortedMessages.map(msg => (
                        <div
                        key={msg.id}
                        onClick={() => navigate('/modules/${moduleId}/messages/${msg.id}')}
                        className="flex items-center gap-5 py-6 border-b border-gray-100 cursor-pointer">
                        {/* unread dot */}
                        {!msg.read && (<div className="w-2 h-2 rounded-full bg-[#6166db] flex-shrink-0" />)}
                        {msg.read && <div className="w-2 h-2 flex-shrink-0" />}

                        {/* Content */}
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <span className={`text-sm ${!msg.read ? 'font-bold test-[#222b45]' : 'font-normal test-[#222b45]'}`}>
                                    {msg.senderName}
                                </span>
                                <span className="text-xs text-[#8f9bb3]">
                                    {new Date(msg.sentAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={`text-xs mt-0.5 truncate ${!msg.read ? 'text-[#222b45] font-semibold' : 'text-[#8f9bb3]'}`}>
                                {msg.preview}
                            </p>
                        </div>
                        </div>
                    ))}
                </div>
                {/* Recent Messages */}
                <BottomNav/>
            </div>
        </div>
    )

}