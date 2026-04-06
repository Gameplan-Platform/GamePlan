import { useState , useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';



const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const DAYS_OF_WEEK = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];


function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay: boolean;
}

export default function CalendarScreenCoach() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { token } = useAuth();



  useEffect(() => {
    if (!moduleId) return;
    api<CalendarEvent[]>(`/events/module/${moduleId}`, { token: token ?? undefined })
      .then(data => {
        const mapped = data.reduce((acc: Record<string, CalendarEvent[]>, ev: CalendarEvent) => {
          const key = ev.date.split("T")[0];
          if (!acc[key]) acc[key] = [];
          acc[key].push(ev);
          return acc;
        }, {});
        setEvents(mapped);
      })
      .catch(() => {});
  }, [moduleId, token]);


  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const buildCells = () => {
    const firstDay = getFirstDay(year, month);
    const daysInMonth = getDaysInMonth(year, month);
    const daysInPrev = getDaysInMonth(year, month - 1);
    const cells: { day: number; current: boolean }[] = [];


    for (let i = 0; i < firstDay; i++)
      cells.push({ day: daysInPrev - firstDay + 1 + i, current: false });


    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ day: d, current: true });


    const remainder = cells.length % 7;
    const trailingCount = remainder === 0 ? 0 : 7 - remainder;
    for (let i = 1; i <= trailingCount; i++)
      cells.push({ day: i, current: false });

    return cells;
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const hasEvents = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return !!events[dateStr]?.length;
  };

  const selectedEvents = selectedDate ? (events[selectedDate] || []) : [];


  return (
    <div style={{ fontFamily: "'Amiko', sans-serif" }} className="bg-white min-h-screen w-full max-w-[440px] mx-auto flex flex-col">

      {/* Import font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiko:wght@400;600;700&display=swap');`}</style>

      {/* Header */}
      <div className="relative flex items-center justify-center px-6 pt-8 pb-4">
        <button
            className="absolute left-6 w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg text-[#222b45]"
            onClick={() => window.history.back()}
        >‹</button>
        <h1 className="text-4xl font-bold text-[#222b45]">Calendar</h1>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-16 py-2">
        <button onClick={prevMonth} className="text-2xl text-[#222b45] w-8 h-8 flex items-center justify-center">‹</button>
        <div className="text-center">
          <div className="text-xl font-normal text-[#222b45]">{MONTH_NAMES[month]}</div>
          <div className="text-xs text-[#8f9bb3]">{year}</div>
        </div>
        <button onClick={nextMonth} className="text-2xl text-[#222b45] w-8 h-8 flex items-center justify-center">›</button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 px-4 mt-2">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-[#8f9bb3] text-[13px] py-2">{d}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 px-4">
        {buildCells().map((cell, i) => {
          const dateStr = cell.current
            ? `${year}-${String(month + 1).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`
            : null;
          const isSelected = dateStr === selectedDate;
          const todayDate = cell.current && isToday(cell.day);
          const hasEv = cell.current && hasEvents(cell.day);

          return (
            <div
              key={i}
              onClick={() => cell.current && handleDateClick(cell.day)}
              className={`flex flex-col items-center justify-center py-2 cursor-pointer select-none`}
            >
              <div className={`w-9 h-9 flex flex-col items-center justify-center rounded-[10px]
                ${isSelected && cell.current ? "bg-[#735bf2]" : ""}
              `}>
                <span className={`text-[15px] leading-5
                  ${isSelected ? "text-white font-bold" : ""}
                  ${todayDate && !isSelected ? "text-[#735bf2] font-bold" : ""}
                  ${!isSelected && !todayDate && cell.current ? "text-[#222b45]" : ""}
                  ${!cell.current ? "text-[#8f9bb3]" : ""}
                `}>
                  {cell.day}
                </span>
                {hasEv && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-[#735bf2]"}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-8 h-1 bg-gray-200 rounded mx-auto my-4" />

      {/* Events */}
      <div className="flex-1 px-6 space-y-3">
        {!selectedDate ? (
          <p className="text-center text-[#8f9bb3] text-sm mt-4">Select a date to view events</p>
        ) : selectedEvents.length === 0 ? (
          <p className="text-center text-[#8f9bb3] text-sm mt-4">No events for this date</p>
        ) : (
          selectedEvents.map((ev, i) => (
            <div 
            key={i} 
            onClick={() => navigate(`/modules/${moduleId}/calendar/${ev.id}`)}
            className="flex justify-between items-center px-4 py-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex gap-3 items-start">
                <span className="text-[#735bf2] text-[10px] mt-1">●</span>
                <div>
                  <div className="text-xs text-[#8f9bb3] mb-0.5 tracking-wide">{ev.startTime}-{ev.endTime}</div>
                  <div className="text-[#222b45] font-semibold text-base tracking-wide">{ev.title}</div>
                </div>
              </div>
              <button 
                className="flex gap-0.5">
                {[0,1,2].map(d => <div key={d} className="w-1 h-1 bg-[#8f9bb3] rounded-full" />)}
              </button>
            </div>
          ))
        )}
      </div>
      {/* Add Event */}
      <div className="w-full max-w-[440px] mx-auto relative">
        <button
          onClick={() => navigate(`/modules/${moduleId}/calendar/add-event`)}
          className="absolute bottom-28 right-6 w-14 h-14 bg-[#b8e366] rounded-full text-white text-3xl shadow-lg flex items-center justify-center"
        >
          +
        </button>
      </div>

      {/* Bottom spacer for nav bar */}
      <div className="h-24" />
    </div>
  );
}
