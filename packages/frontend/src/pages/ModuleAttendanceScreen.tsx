import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

type ViewMode = 'roster' | 'attendance'
type AttendanceStatus = 'PRESENT' | 'ABSENT' | null

interface ModuleInfo {
  id: string
  name: string
  memberRole: string
}

interface RosterMember {
  userId: string
  name: string
  role: string
  email: string
  profilePicture?: string | null
}

interface RosterResponse {
  roster: RosterMember[]
}

interface AttendanceMember {
  memberId: string
  name: string
  status: AttendanceStatus
}

interface AttendanceResponse {
  moduleId: string
  date: string
  members: AttendanceMember[]
}

interface MemberAttendanceRecord {
  moduleId: string
  memberId: string
  date: string
  status: 'PRESENT' | 'ABSENT'
  markedById?: string
}

interface MemberAttendanceResponse {
  attendance: MemberAttendanceRecord[]
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const hoverTransition = { type: 'spring' as const, stiffness: 320, damping: 22 }

function parseUserId(token: string | null): string | null {
  if (!token) return null
  try {
    return JSON.parse(atob(token.split('.')[1])).userId ?? null
  } catch {
    return null
  }
}

function ymd(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseBackendDate(dateString: string) {
  const raw = (dateString || '').split('T')[0]
  const [year, month, day] = raw.split('-').map(Number)

  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

function formatDisplayDate(dateString: string) {
  const raw = (dateString || '').split('T')[0]
  const [year, month, day] = raw.split('-')
  return `${month}/${day}/${year}`
}

function formatHistoryDate(dateString: string) {
  const date = parseBackendDate(dateString)

  if (!date) return 'Invalid Date'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatMonth(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function buildCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const start = new Date(year, month, 1 - firstDay.getDay())

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return day
  })
}

function StatusButton({
  kind,
  active,
  onClick,
}: {
  kind: 'present' | 'absent'
  active: boolean
  onClick: () => void
}) {
  const bg =
    kind === 'present'
      ? active
        ? '#B8E466'
        : '#EEF6DB'
      : active
        ? '#FF6B6B'
        : '#FFE8E8'

  const color =
    kind === 'present'
      ? active
        ? '#FFFFFF'
        : '#82AD35'
      : active
        ? '#FFFFFF'
        : '#E05252'

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      transition={hoverTransition}
      onClick={onClick}
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: 'none',
        background: bg,
        color,
        fontSize: '11px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {kind === 'present' ? '✓' : '✕'}
    </motion.button>
  )
}

function MiniCalendar({
  selectedDate,
  onSelect,
  onClose,
}: {
  selectedDate: string
  onSelect: (date: string) => void
  onClose: () => void
}) {
  const [viewDate, setViewDate] = useState(() => {
    const base = parseBackendDate(selectedDate) ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const cells = buildCalendarDays(viewDate)
  const currentMonth = viewDate.getMonth()

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '100%',
        maxWidth: '250px',
        background: '#E9E8F8',
        borderRadius: '16px',
        padding: '14px',
        boxShadow: '0 14px 28px rgba(24, 28, 50, 0.18)',
        zIndex: 80,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          fontFamily: 'Amiko',
          fontSize: '11px',
          color: '#6A6FBF',
        }}
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          style={{ border: 'none', background: 'transparent', color: '#6A6FBF', cursor: 'pointer' }}
        >
          ‹
        </motion.button>

        <span style={{ fontWeight: 700 }}>{formatMonth(viewDate)}</span>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          style={{ border: 'none', background: 'transparent', color: '#6A6FBF', cursor: 'pointer' }}
        >
          ›
        </motion.button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
        }}
      >
        {DAYS.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontFamily: 'Amiko',
              fontSize: '10px',
              color: '#8D8DA8',
            }}
          >
            {day}
          </div>
        ))}

        {cells.map((day) => {
          const dayString = ymd(day)
          const isSelected = dayString === selectedDate
          const isCurrentMonth = day.getMonth() === currentMonth

          return (
            <motion.button
              key={dayString}
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={hoverTransition}
              onClick={() => {
                onSelect(dayString)
                onClose()
              }}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                border: 'none',
                background: isSelected ? '#6166DB' : 'transparent',
                color: isSelected ? '#FFFFFF' : isCurrentMonth ? '#3E4272' : '#B6B7CB',
                fontFamily: 'Amiko',
                fontSize: '10px',
                cursor: 'pointer',
                justifySelf: 'center',
              }}
            >
              {day.getDate()}
            </motion.button>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#8D8DA8',
            fontFamily: 'Amiko',
            fontSize: '10px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={() => {
            onSelect(ymd(new Date()))
            onClose()
          }}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#6166DB',
            fontFamily: 'Amiko',
            fontSize: '10px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Today
        </motion.button>
      </div>
    </div>
  )
}

export default function ModuleAttendanceScreen() {
  const params = useParams()
  const moduleId = params.id ?? params.moduleId
  const navigate = useNavigate()
  const { token } = useAuth()
  const currentUserId = parseUserId(token)

  const [view, setView] = useState<ViewMode>('roster')

  const [moduleInfo, setModuleInfo] = useState<ModuleInfo | null>(null)
  const [roster, setRoster] = useState<RosterMember[]>([])
  const [rosterLoading, setRosterLoading] = useState(true)

  const [selectedRosterMemberId, setSelectedRosterMemberId] = useState<string | null>(null)

  const [selectedDate, setSelectedDate] = useState(ymd(new Date()))
  const [attendanceMembers, setAttendanceMembers] = useState<AttendanceMember[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const [selectedHistoryMemberId, setSelectedHistoryMemberId] = useState<string | null>(null)
  const [memberHistoryMap, setMemberHistoryMap] = useState<Record<string, MemberAttendanceRecord[]>>({})
  const [historyLoadingMemberId, setHistoryLoadingMemberId] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!moduleId || !token) return

    setRosterLoading(true)
    setError(null)

    Promise.all([
      api<{ module: ModuleInfo }>(`/modules/${moduleId}`, {
        token: token ?? undefined,
      }),
      api<RosterResponse>(`/modules/${moduleId}/roster`, {
        token: token ?? undefined,
      }),
    ])
      .then(([moduleData, rosterData]) => {
        setModuleInfo(moduleData.module)
        setRoster([...rosterData.roster].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load roster')
      })
      .finally(() => setRosterLoading(false))
  }, [moduleId, token])

  const canManageAttendance = useMemo(() => {
    return (
      moduleInfo?.memberRole === 'COACH' ||
      moduleInfo?.memberRole === 'MODULE_ADMIN'
    )
  }, [moduleInfo])

  useEffect(() => {
    if (!moduleId || !token || !canManageAttendance || view !== 'attendance') return

    setAttendanceLoading(true)
    setError(null)

    api<AttendanceResponse>(`/modules/${moduleId}/attendance?date=${selectedDate}`, {
      token: token ?? undefined,
    })
      .then((data) => {
        setAttendanceMembers([...data.members].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load attendance'))
      .finally(() => setAttendanceLoading(false))
  }, [moduleId, token, selectedDate, canManageAttendance, view])

  async function loadMemberHistory(memberId: string) {
    if (!moduleId || !token) return []

    if (memberHistoryMap[memberId]) {
      return memberHistoryMap[memberId]
    }

    setHistoryLoadingMemberId(memberId)
    setError(null)

    try {
      const data = await api<MemberAttendanceResponse>(
        `/modules/${moduleId}/members/${memberId}/attendance`,
        { token: token ?? undefined }
      )

      setMemberHistoryMap((prev) => ({
        ...prev,
        [memberId]: data.attendance,
      }))

      return data.attendance
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance history')
      return []
    } finally {
      setHistoryLoadingMemberId(null)
    }
  }

  async function openHistory(memberId: string) {
    const isSelf = memberId === currentUserId
    if (!canManageAttendance && !isSelf) return

    if (selectedHistoryMemberId === memberId) {
      setSelectedHistoryMemberId(null)
      return
    }

    setSelectedHistoryMemberId(memberId)
    await loadMemberHistory(memberId)
  }

  function setStatus(memberId: string, status: AttendanceStatus) {
    setAttendanceMembers((prev) =>
      prev.map((member) =>
        member.memberId === memberId ? { ...member, status } : member
      )
    )
    setSuccess(null)
  }

  async function saveAttendance() {
    if (!moduleId || !token) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const records = attendanceMembers
        .filter((member) => member.status === 'PRESENT' || member.status === 'ABSENT')
        .map((member) => ({
          memberId: member.memberId,
          status: member.status as 'PRESENT' | 'ABSENT',
        }))

      await api(`/modules/${moduleId}/attendance`, {
        method: 'PUT',
        token: token ?? undefined,
        body: {
          date: selectedDate,
          records,
        },
      })

      setSuccess('Attendance saved.')
      setMemberHistoryMap({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const selectedRosterMember =
    roster.find((member) => member.userId === selectedRosterMemberId) ?? null

  const selectedRosterHistory = selectedRosterMember
    ? memberHistoryMap[selectedRosterMember.userId] ?? []
    : []

  const selectedRosterPresentCount = selectedRosterHistory.filter(
    (record) => record.status === 'PRESENT'
  ).length

  const selectedRosterAbsentCount = selectedRosterHistory.filter(
    (record) => record.status === 'ABSENT'
  ).length

  const selectedAttendanceHistory = selectedHistoryMemberId
    ? memberHistoryMap[selectedHistoryMemberId] ?? []
    : []

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div
        className="relative overflow-hidden bg-white"
        style={{ width: '440px', height: '956px', borderRadius: '55px' }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          transition={hoverTransition}
          onClick={() => navigate(`/modules/${moduleId}`)}
          style={{
            position: 'absolute',
            left: '28px',
            top: '52px',
            width: '42px',
            height: '42px',
            border: '1px solid #D9DEEA',
            borderRadius: '14px',
            background: '#F5F6FA',
            boxShadow: '0 6px 16px rgba(34, 43, 69, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 6,
          }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            <path d="M8.5 1L1.5 8L8.5 15" stroke="#222B45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>

        <p
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '69px',
            margin: 0,
            textAlign: 'center',
            fontFamily: 'Amiko',
            fontWeight: 400,
            fontSize: '34px',
            color: '#000000',
          }}
        >
          {view === 'roster' ? 'Roster' : 'Attendance'}
        </p>

        <div
          style={{
            position: 'absolute',
            top: '135px',
            left: '20px',
            right: '20px',
            bottom: '100px',
            overflowY: 'auto',
            padding: '0 4px 20px',
          }}
        >
          <div
            style={{
              width: '220px',
              height: '38px',
              background: '#F3F1FB',
              borderRadius: '999px',
              padding: '4px',
              display: 'grid',
              gridTemplateColumns: canManageAttendance ? '1fr 1fr' : '1fr',
              gap: '4px',
              margin: '0 auto 16px',
            }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={hoverTransition}
              onClick={() => setView('roster')}
              style={{
                border: 'none',
                borderRadius: '999px',
                background: view === 'roster' ? '#6166DB' : 'transparent',
                color: view === 'roster' ? '#FFFFFF' : '#6F73B7',
                fontFamily: 'Amiko',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Roster
            </motion.button>

            {canManageAttendance && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={hoverTransition}
                onClick={() => setView('attendance')}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  background: view === 'attendance' ? '#6166DB' : 'transparent',
                  color: view === 'attendance' ? '#FFFFFF' : '#6F73B7',
                  fontFamily: 'Amiko',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Attendance
              </motion.button>
            )}
          </div>

          {error && (
            <div
              style={{
                marginBottom: '12px',
                background: '#FFEAEA',
                color: '#D25454',
                borderRadius: '14px',
                padding: '10px 12px',
                fontFamily: 'Amiko',
                fontSize: '12px',
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: '12px',
                background: '#EEF7DB',
                color: '#719B2D',
                borderRadius: '14px',
                padding: '10px 12px',
                fontFamily: 'Amiko',
                fontSize: '12px',
              }}
            >
              {success}
            </div>
          )}

          {view === 'roster' && (
            <>
              {rosterLoading ? (
                <p style={{ textAlign: 'center', color: '#A1A3BC', fontFamily: 'Amiko' }}>Loading...</p>
              ) : (
                roster.map((member) => {
                  const expanded = selectedRosterMemberId === member.userId
                  const isCoachRow =
                    member.role === 'COACH' || member.role === 'MODULE_ADMIN'
                  const roleBadgeLabel = isCoachRow ? 'Coach' : null

                  return (
                    <div key={member.userId} style={{ marginBottom: '10px' }}>
                      <motion.button
                        type="button"
                        whileHover={
                          isCoachRow
                            ? {}
                            : { y: -2, boxShadow: '0 8px 18px rgba(56, 60, 109, 0.10)' }
                        }
                        whileTap={isCoachRow ? {} : { scale: 0.99 }}
                        transition={hoverTransition}
                        onClick={async () => {
                          if (isCoachRow) return

                          if (expanded) {
                            setSelectedRosterMemberId(null)
                            return
                          }

                          setSelectedRosterMemberId(member.userId)
                          await loadMemberHistory(member.userId)
                        }}
                        style={{
                          width: '100%',
                          border: 'none',
                          background: '#F6F5FB',
                          borderRadius: '18px',
                          minHeight: '42px',
                          padding: '10px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: isCoachRow ? 'default' : 'pointer',
                          opacity: isCoachRow ? 0.92 : 1,
                        }}
                      >
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#E1DEFA',
                            color: '#6166DB',
                            fontSize: '10px',
                            fontFamily: 'Amiko',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(member.name).slice(0, 1)}
                        </div>

                        <div
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            fontFamily: 'Amiko',
                            fontSize: '12px',
                            color: '#2E3157',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <span>{member.name}</span>

                          {roleBadgeLabel && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                background: '#E8E9FB',
                                color: '#6166DB',
                                fontWeight: 700,
                              }}
                            >
                              {roleBadgeLabel}
                            </span>
                          )}
                        </div>

                        {!isCoachRow && (
                          <div style={{ color: '#7E83D7', fontSize: '16px' }}>›</div>
                        )}
                      </motion.button>

                      {expanded && selectedRosterMember && !isCoachRow && (
                        <div
                          style={{
                            marginTop: '10px',
                            background: '#F6F5FB',
                            borderRadius: '20px',
                            padding: '16px',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                            <div
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: '#E1DEFA',
                                color: '#6166DB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: 'Amiko',
                                fontWeight: 700,
                                fontSize: '18px',
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(selectedRosterMember.name)}
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontFamily: 'Amiko',
                                  fontSize: '15px',
                                  fontWeight: 700,
                                  color: '#2E3157',
                                }}
                              >
                                {selectedRosterMember.name}
                              </div>

                              <div
                                style={{
                                  fontFamily: 'Amiko',
                                  fontSize: '11px',
                                  color: '#7E83A6',
                                  marginTop: '4px',
                                }}
                              >
                                Age: N/A
                              </div>

                              <div
                                style={{
                                  fontFamily: 'Amiko',
                                  fontSize: '11px',
                                  color: '#7E83A6',
                                  marginTop: '2px',
                                }}
                              >
                                Team: N/A
                              </div>

                              <div
                                style={{
                                  fontFamily: 'Amiko',
                                  fontSize: '11px',
                                  color: '#7E83A6',
                                  marginTop: '6px',
                                  lineHeight: 1.5,
                                }}
                              >
                                Bio: N/A
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                            <div
                              style={{
                                flex: 1,
                                background: '#EEF7DB',
                                borderRadius: '14px',
                                padding: '10px',
                              }}
                            >
                              <div style={{ fontFamily: 'Amiko', fontSize: '10px', color: '#719B2D' }}>
                                Present
                              </div>
                              <div
                                style={{
                                  fontFamily: 'Amiko',
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  color: '#719B2D',
                                }}
                              >
                                {selectedRosterPresentCount}
                              </div>
                            </div>

                            <div
                              style={{
                                flex: 1,
                                background: '#FFEAEA',
                                borderRadius: '14px',
                                padding: '10px',
                              }}
                            >
                              <div style={{ fontFamily: 'Amiko', fontSize: '10px', color: '#D25454' }}>
                                Absent
                              </div>
                              <div
                                style={{
                                  fontFamily: 'Amiko',
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  color: '#D25454',
                                }}
                              >
                                {selectedRosterAbsentCount}
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              background: '#FFFFFF',
                              borderRadius: '16px',
                              padding: '10px',
                              maxHeight: '170px',
                              overflowY: 'auto',
                            }}
                          >
                            {historyLoadingMemberId === selectedRosterMember.userId ? (
                              <p style={{ textAlign: 'center', color: '#A1A3BC', fontFamily: 'Amiko', fontSize: '12px' }}>
                                Loading history...
                              </p>
                            ) : selectedRosterHistory.length === 0 ? (
                              <p style={{ textAlign: 'center', color: '#A1A3BC', fontFamily: 'Amiko', fontSize: '12px' }}>
                                No attendance history yet.
                              </p>
                            ) : (
                              selectedRosterHistory.map((record, index) => (
                                <div
                                  key={`${record.date}-${index}`}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 0',
                                    borderBottom:
                                      index === selectedRosterHistory.length - 1
                                        ? 'none'
                                        : '1px solid #F0EFF8',
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: 'Amiko',
                                      fontSize: '11px',
                                      color: '#2E3157',
                                    }}
                                  >
                                    {formatHistoryDate(record.date)}
                                  </span>

                                  <span
                                    style={{
                                      fontFamily: 'Amiko',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      color: record.status === 'PRESENT' ? '#719B2D' : '#D25454',
                                    }}
                                  >
                                    {record.status === 'PRESENT' ? 'Present' : 'Absent'}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </>
          )}

          {view === 'attendance' && canManageAttendance && (
            <>
              <div style={{ position: 'relative', marginBottom: '14px', width: '100%' }}>
                <div
                  style={{
                    width: '100%',
                    minHeight: '40px',
                    background: '#FFFFFF',
                    border: '1px solid #C7C8E7',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    padding: '8px 10px',
                    fontFamily: 'Amiko',
                    fontSize: '12px',
                    color: '#4A4E7A',
                    boxSizing: 'border-box',
                  }}
                >
                  <span>{formatDisplayDate(selectedDate)}</span>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    transition={hoverTransition}
                    onClick={() => setCalendarOpen((prev) => !prev)}
                    style={{
                      width: '24px',
                      height: '24px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      padding: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="6" width="14" height="13" rx="2" stroke="#6166DB" strokeWidth="2" />
                      <path d="M8 4V8M16 4V8M5 10H19" stroke="#6166DB" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </motion.button>
                </div>

                {calendarOpen && (
                  <MiniCalendar
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    onClose={() => setCalendarOpen(false)}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={hoverTransition}
                  onClick={saveAttendance}
                  disabled={saving}
                  style={{
                    border: 'none',
                    background: '#B8E466',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    height: '38px',
                    padding: '0 18px',
                    fontFamily: 'Amiko',
                    fontSize: '12px',
                    cursor: saving ? 'default' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </motion.button>
              </div>

              {attendanceLoading ? (
                <p style={{ textAlign: 'center', color: '#A1A3BC', fontFamily: 'Amiko' }}>Loading...</p>
              ) : attendanceMembers.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#A1A3BC', fontFamily: 'Amiko' }}>
                  No attendance members found for this date.
                </p>
              ) : (
                attendanceMembers.map((member) => {
                  const expandedHistory = selectedHistoryMemberId === member.memberId

                  return (
                    <div key={member.memberId} style={{ marginBottom: '10px' }}>
                      <motion.div
                        whileHover={{ y: -2, boxShadow: '0 8px 18px rgba(56, 60, 109, 0.10)' }}
                        transition={hoverTransition}
                        style={{
                          background: '#F6F5FB',
                          borderRadius: '18px',
                          minHeight: '42px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <StatusButton
                          kind="present"
                          active={member.status === 'PRESENT'}
                          onClick={() =>
                            setStatus(
                              member.memberId,
                              member.status === 'PRESENT' ? null : 'PRESENT'
                            )
                          }
                        />

                        <StatusButton
                          kind="absent"
                          active={member.status === 'ABSENT'}
                          onClick={() =>
                            setStatus(
                              member.memberId,
                              member.status === 'ABSENT' ? null : 'ABSENT'
                            )
                          }
                        />

                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#E1DEFA',
                            color: '#6166DB',
                            fontSize: '10px',
                            fontFamily: 'Amiko',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(member.name).slice(0, 1)}
                        </div>

                        <motion.button
                          type="button"
                          whileHover={{ x: 1 }}
                          whileTap={{ scale: 0.99 }}
                          transition={hoverTransition}
                          onClick={() => openHistory(member.memberId)}
                          style={{
                            flex: 1,
                            border: 'none',
                            background: 'transparent',
                            textAlign: 'left',
                            fontFamily: 'Amiko',
                            fontSize: '12px',
                            color: '#2E3157',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        >
                          {member.name}
                        </motion.button>

                        <div style={{ color: '#7E83D7', fontSize: '16px' }}>›</div>
                      </motion.div>

                      {expandedHistory && (
                        <div
                          style={{
                            marginTop: '8px',
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '10px 12px',
                            boxShadow: '0 4px 12px rgba(56, 60, 109, 0.05)',
                          }}
                        >
                          {historyLoadingMemberId === member.memberId ? (
                            <p
                              style={{
                                textAlign: 'center',
                                color: '#A1A3BC',
                                fontFamily: 'Amiko',
                                fontSize: '12px',
                              }}
                            >
                              Loading history...
                            </p>
                          ) : selectedAttendanceHistory.length === 0 ? (
                            <p
                              style={{
                                textAlign: 'center',
                                color: '#A1A3BC',
                                fontFamily: 'Amiko',
                                fontSize: '12px',
                              }}
                            >
                              No attendance history yet.
                            </p>
                          ) : (
                            selectedAttendanceHistory.map((record, index) => (
                              <div
                                key={`${record.date}-${index}`}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '8px 0',
                                  borderBottom:
                                    index === selectedAttendanceHistory.length - 1
                                      ? 'none'
                                      : '1px solid #F0EFF8',
                                }}
                              >
                                <span
                                  style={{
                                    fontFamily: 'Amiko',
                                    fontSize: '11px',
                                    color: '#2E3157',
                                  }}
                                >
                                  {formatHistoryDate(record.date)}
                                </span>

                                <span
                                  style={{
                                    fontFamily: 'Amiko',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    color:
                                      record.status === 'PRESENT'
                                        ? '#719B2D'
                                        : '#D25454',
                                  }}
                                >
                                  {record.status === 'PRESENT' ? 'Present' : 'Absent'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </>
          )}
        </div>
        <BottomNav />
      </div>
    </div>
  )
}