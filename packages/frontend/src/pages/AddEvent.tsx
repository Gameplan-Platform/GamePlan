import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from '../utils/api';


const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS_OF_WEEK = ["Su","Mo","Tu","We","Th","Fr","Sa"];
 
const today = new Date();
const formatDate = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;


function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" fill="#49454F" />
  </svg>
);

function DatePickerDropdown({
  onSelect,
  onClose,
}: {
  onSelect: (dateStr: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  const buildCells = () => {
    const cells: { day: number; current: boolean }[] = [];
    for (let i = 0; i < firstDay; i++)
      cells.push({ day: 0, current: false });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ day: d, current: true });
    const remainder = cells.length % 7;
    if (remainder !== 0)
      for (let i = 0; i < 7 - remainder; i++)
        cells.push({ day: 0, current: false });
    return cells;
  };

  const handleOk = () => {
    if (selected) {
      const mm = String(month + 1).padStart(2, "0");
      const dd = String(selected).padStart(2, "0");
      onSelect(`${mm}/${dd}/${year}`);
    }
    onClose();
  };

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
      {/* Month Nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center text-[#6166db] text-lg">‹</button>
        <span className="text-[#222b45] font-semibold text-sm">{MONTH_NAMES[month]} {year}</span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center text-[#6166db] text-lg">›</button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="text-center text-[#8f9bb3] text-[11px] py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {buildCells().map((cell, i) => (
          <div
            key={i}
            onClick={() => cell.current && setSelected(cell.day)}
            className={`flex items-center justify-center h-8 w-8 mx-auto rounded-lg text-sm transition-colors
              ${cell.current ? "cursor-pointer text-[#222b45]" : "opacity-0 pointer-events-none"}
              ${selected === cell.day && cell.current ? "bg-[#6166db] text-white" : ""}
              ${cell.current && selected !== cell.day ? "hover:bg-[#6166db20]" : ""}
            `}
          >
            {cell.current ? cell.day : ""}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-4 mt-3 pt-3 border-t border-gray-100">
        <button onClick={onClose} className="text-[#6166db] text-sm font-semibold">Cancel</button>
        <button onClick={handleOk} className="text-[#6166db] text-sm font-semibold">Ok</button>
      </div>
    </div>
  );
}


export default function AddEvent() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const { token } = useAuth();
  const [date, setDate] = useState(formatDate(today));
  const [showPicker, setShowPicker] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [startHours, setStartHours] = useState("");
  const [startMinutes, setStartMinutes] = useState("");
  const [startAmpm, setStartAmpm] = useState("am");
  const [endHours, setEndHours] = useState("");
  const [endMinutes, setEndMinutes] = useState("");
  const [endAmpm, setEndAmpm] = useState("am");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");

  const validateDate = (value: string) => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!value) {
      setDateError("Date is required");
      return false;
    }
    if (!regex.test(value)) {
      setDateError("Please enter a valid date");
      return false;
    }
    const [mm, dd, yyyy] = value.split("/").map(Number);
    const parsed = new Date(yyyy, mm - 1, dd);
    if (parsed.getMonth() !== mm - 1 || parsed.getDate() !== dd) {
      setDateError("Invalid date");
      return false;
    }
    setDateError("");
    return true;
  };

  const validateTime = (
    sH: string, sM: string, sA: string,
    eH: string, eM: string, eA: string
  ) => {
    if (!sH || !sM || !eH || !eM) return true; // don't validate if incomplete
    
    const toMinutes = (h: string, m: string, ampm: string) => {
      let hours = parseInt(h);
      const mins = parseInt(m);
      if (ampm === "pm" && hours !== 12) hours += 12;
      if (ampm === "am" && hours === 12) hours = 0;
      return hours * 60 + mins;
    };
  
    const start = toMinutes(sH, sM, sA);
    const end = toMinutes(eH, eM, eA);
  
    if (end <= start) {
      setTimeError("End time must be after start time");
      return false;
    }
    setTimeError("");
    return true;
  };


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <h1 className="text-4xl font-normal text-black">Add Event</h1>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-6 px-6 pt-2">

        {/* Date Field */}
        <div className="relative" ref={pickerRef}>
          <div className="absolute -top-2.5 left-3 px-1 bg-white z-10">
            <span className="text-[#6166db] text-xs">Date</span>
          </div>
          <div className="flex items-center border-2 border-[#6166db] rounded px-3 py-3">
          <input
            type="text"
            value={date}
            onChange={(e) => {
                setDate(e.target.value);
                validateDate(e.target.value);
            }}
            placeholder="MM/DD/YYYY"
            className="flex-1 text-[#1d1b20] text-base bg-transparent outline-none border-none"
            />
            <button onClick={() => setShowPicker(p => !p)}>
              <CalendarIcon />
            </button>
          </div>
          <div className="text-xs px-4 pt-1 h-4">
            {dateError
                ? <span className="text-red-400">{dateError}</span>
                : <span className="text-[#49454f]">MM/DD/YYYY</span>
            }
          </div>

          {showPicker && (
            <DatePickerDropdown
              onSelect={(d) => setDate(d)}
              onClose={() => setShowPicker(false)}
            />
          )}
        </div>

        {/* Time */}
        <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
            <span className="bg-[#6166db] text-white text-xs px-4 py-1 rounded-xl">Time</span>
            {/* All Day Toggle */}
            <div className="flex items-center gap-2">
            <span className="text-[#8f9bb3] text-xs">All Day</span>
            <button
              onClick={() => setAllDay(p => !p)}
              className={`w-12 h-6 rounded-full transition-colors relative ${allDay ? "bg-[#6166db]" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${allDay ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            </div>
        </div>

        {!allDay && (
            <div className="flex flex-col gap-2">

            {/* Start Time */}
            <div className="flex items-center gap-2">
                <span className="text-[#8f9bb3] text-xs w-8">Start</span>
                <div className="flex items-center gap-2">
                <div className="w-[60px] h-[42px] bg-white rounded-xl shadow flex items-center justify-center">
                    <input
                    type="text"
                    value={startHours}
                    onChange={(e) => {
                        setStartHours(e.target.value);
                        validateTime(e.target.value, startMinutes, startAmpm, endHours, endMinutes, endAmpm);
                    }}
                    placeholder="HH"
                    maxLength={2}
                    className="w-full text-center text-[#c7c7c7] text-[15px] bg-transparent outline-none border-none"
                    />
                </div>
                <span className="text-[#c7c7c7]">:</span>
                <div className="w-[60px] h-[42px] bg-white rounded-xl shadow flex items-center justify-center">
                    <input
                    type="text"
                    value={startMinutes}
                    onChange={(e) => {
                        setStartMinutes(e.target.value);
                        validateTime(startHours, e.target.value, startAmpm, endHours, endMinutes, endAmpm);
                    }}
                    placeholder="MM"
                    maxLength={2}
                    className="w-full text-center text-[#c7c7c7] text-[15px] bg-transparent outline-none border-none"
                    />
                </div>
                <div className="w-[60px] h-[42px] bg-white rounded-xl shadow flex items-center justify-center relative">
                    <select
                    value={startAmpm}
                    onChange={(e) => {
                        setStartAmpm(e.target.value);
                        validateTime(startHours, startMinutes, e.target.value, endHours, endMinutes, endAmpm);
                    }}
                    className="w-full text-center text-[#c7c7c7] text-[15px] bg-transparent outline-none border-none cursor-pointer appearance-none"
                    >
                    <option value="am">am</option>
                    <option value="pm">pm</option>
                    </select>
                    <span className="absolute right-2 text-[#c7c7c7] text-[8px] pointer-events-none">▼</span>
                </div>
                </div>
            </div>

            {/* End Time */}
            <div className="flex items-center gap-2">
                <span className="text-[#8f9bb3] text-xs w-8">End</span>
                <div className="flex items-center gap-2">
                <div className="w-[60px] h-[42px] bg-white rounded-xl shadow flex items-center justify-center">
                    <input
                    type="text"
                    value={endHours}
                    onChange={(e) => {
                        setEndHours(e.target.value);
                        validateTime(startHours, startMinutes, startAmpm, e.target.value, endMinutes, endAmpm);

                    }}
                    placeholder="HH"
                    maxLength={2}
                    className="w-full text-center text-[#c7c7c7] text-[15px] bg-transparent outline-none border-none"
                    />
                </div>
                <span className="text-[#c7c7c7]">:</span>
                <div className="w-[60px] h-[42px] bg-white rounded-xl shadow flex items-center justify-center">
                    <input
                    type="text"
                    value={endMinutes}
                    onChange={(e) => {
                        setEndMinutes(e.target.value);
                        validateTime(startHours, startMinutes, startAmpm, endHours, e.target.value, endAmpm);
                    }}
                    placeholder="MM"
                    maxLength={2}
                    className="w-full text-center text-[#c7c7c7] text-[15px] bg-transparent outline-none border-none"
                    />
                </div>
                <div className="w-[60px] h-[42px] bg-white rounded-xl shadow flex items-center justify-center relative">
                    <select
                    value={endAmpm}
                    onChange={(e) => {
                        setEndAmpm(e.target.value);
                        validateTime(startHours, startMinutes, startAmpm, endHours, endMinutes, e.target.value);
                    }}
                    className="w-full text-center text-[#c7c7c7] text-[15px] bg-transparent outline-none border-none cursor-pointer appearance-none"
                    >
                    <option value="am">am</option>
                    <option value="pm">pm</option>
                    </select>
                    <span className="absolute right-2 text-[#c7c7c7] text-[8px] pointer-events-none">▼</span>
                </div>
                </div>
            </div>

            </div>
        )}
        {timeError && (
            <p className="text-red-400 text-xs px-1">{timeError}</p>
        )}

        {allDay && (
            <p className="text-[#8f9bb3] text-xs px-1">This event will last the entire day.</p>
        )}
        </div>

        {/* Title */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex">
            <span className="bg-[#6166db] text-white text-xs px-4 py-1 rounded-xl">Title</span>
          </div>
          <div className="bg-white rounded-2xl shadow px-4 py-3 h-[93px]">
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter Title Here"
              className="w-full h-full resize-none text-[15px] text-[#c7c7c7] placeholder-[#c7c7c7] bg-transparent outline-none border-none"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex">
            <span className="bg-[#6166db] text-white text-xs px-4 py-1 rounded-xl">Details</span>
          </div>
          <div className="bg-white rounded-2xl shadow px-4 py-3 h-[180px]">
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Enter Details Here"
              className="w-full h-full resize-none text-[15px] text-[#c7c7c7] placeholder-[#c7c7c7] bg-transparent outline-none border-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 pt-2 pb-8">
          <button
            onClick={() => navigate(`/modules/${moduleId}/calendar`)}
            className="w-[116px] h-[45px] bg-white rounded-[999px] flex items-center justify-center text-[#222b45] text-sm"
            style={{ border: '1px solid #DFE5F0' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!validateDate(date)) return;
              if (!allDay && !validateTime(startHours, startMinutes, startAmpm, endHours, endMinutes, endAmpm)) return;

              api('/events', {
                method: 'POST',
                token: token ?? undefined,
                body: {
                  moduleId,
                  title,
                  date: new Date(date).toISOString(),
                  startTime: allDay ? null : `${startHours}:${startMinutes} ${startAmpm}`,
                  endTime: allDay ? null : `${endHours}:${endMinutes} ${endAmpm}`,
                  allDay,
                  description: details
                }
              })
              .then(() => navigate(`/modules/${moduleId}/calendar`))
              .catch(() => {});
            }}
            className="w-[116px] h-[45px] bg-[#B8E466] rounded-[999px] flex items-center justify-center text-white text-sm"
            style={{ boxShadow: '0 6px 14px rgba(183,222,88,0.28)' }}
          >
            Post
          </button>
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-24" />
    </div>
  );
}