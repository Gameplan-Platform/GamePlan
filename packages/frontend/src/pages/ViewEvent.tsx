import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from '../utils/api';


interface Event {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
  description?: string;
}

export default function ViewEvent() {
  const navigate = useNavigate();
  const { moduleId, eventId } = useParams();
  const { token, role } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    api<Event>(`/events/${eventId}`, { token: token ?? undefined })
      .then(data => setEvent(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [eventId, token]);

  const handleDelete = () => {
    api(`/events/${eventId}`, { method: 'DELETE', token: token ?? undefined })
      .then(() => navigate(`/modules/${moduleId}/calendar`))
      .catch(() => {});
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div
      style={{ fontFamily: "'Amiko', sans-serif" }}
      className="bg-white min-h-screen w-full max-w-[440px] mx-auto flex flex-col"
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiko:wght@400;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="relative flex items-center justify-center px-6 pt-8 pb-4">
        <button
          onClick={() => navigate(`/modules/${moduleId}/calendar`)}
          style={{
            position: 'absolute', left: '24px',
            width: '42px', height: '42px',
            background: '#F5F6FA', border: '1px solid #D9DEEA',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(34, 43, 69, 0.05)',
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8.5 1L1.5 8L8.5 15" stroke="#222B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-4xl font-normal text-[#222b45]">Event</h1>
      </div>

      {loading ? (
        <p className="text-center text-[#8f9bb3] text-sm mt-8">Loading...</p>
      ) : !event ? (
        <p className="text-center text-[#8f9bb3] text-sm mt-8">Event not found.</p>
      ) : (
        <div className="flex flex-col gap-5 px-6 pt-2">

          {/* Title */}
          <div className="flex flex-col gap-2">
            <span className="bg-[#6166db] text-white text-xs px-4 py-1 rounded-xl inline-flex w-fit">Title</span>
            <div className="bg-white rounded-2xl shadow px-4 py-4">
              <p className="text-[#222b45] text-base tracking-wide">{event.title}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <span className="bg-[#6166db] text-white text-xs px-4 py-1 rounded-xl inline-flex w-fit">Date</span>
            <div className="bg-white rounded-2xl shadow px-4 py-4">
              <p className="text-[#222b45] text-sm">{formatDate(event.date)}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex flex-col gap-2">
            <span className="bg-[#6166db] text-white text-xs px-4 py-1 rounded-xl inline-flex w-fit">Time</span>
            <div className="bg-white rounded-2xl shadow px-4 py-4">
              {event.allDay ? (
                <p className="text-[#8f9bb3] text-sm">All Day</p>
              ) : (
                <p className="text-[#222b45] text-sm">
                  {event.startTime} — {event.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-2">
            <span className="bg-[#6166db] text-white text-xs px-4 py-1 rounded-xl inline-flex w-fit">Details</span>
            <div className="bg-white rounded-2xl shadow px-4 py-4 min-h-[120px]">
                <div className="text-[#222b45] text-sm">
                    {event.description 
                        ? event.description 
                        : <span className="text-[#c7c7c7]">No details provided.</span>
                    }
                </div>
            </div>
          </div>

          {/* Coach actions */}
          {role === "COACH" && (
            <div className="flex justify-center gap-4 pt-2 pb-8">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-[116px] h-[45px] bg-red-400 rounded-[999px] flex items-center justify-center text-white text-sm"
              >
                Delete
              </button>
              <button
                onClick={() => navigate(`/modules/${moduleId}/calendar/${eventId}/edit`)}
                className="w-[116px] h-[45px] bg-[#B8E466] rounded-[999px] flex items-center justify-center text-white text-sm"
                style={{ boxShadow: '0 6px 14px rgba(183,222,88,0.28)' }}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[300px] shadow-xl text-center">
            <p className="text-[#222b45] font-bold text-lg mb-2">Delete Event?</p>
            <p className="text-[#8f9bb3] text-sm mb-6">This will permanently delete the event for everyone.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-[110px] h-[40px] rounded-[999px] text-[#222b45] text-sm"
                style={{ background: '#FFFFFF', border: '1px solid #DFE5F0' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="w-[110px] h-[40px] bg-red-400 rounded-[999px] text-white text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div className="h-24" />
    </div>
  );
}