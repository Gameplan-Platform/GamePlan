import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import TitleScreen from './pages/TitleScreen'
import LandingScreen from './pages/LandingScreen'
import SignupScreen from './pages/SignupScreen'
import LoginScreen from './pages/LoginScreen'
import RoleSelectScreen from './pages/RoleSelectScreen'
import VerifyEmail from './pages/VerifyEmail'
import ModuleHomepage from './pages/ModuleHomepage'
import ModuleDashboard from './pages/ModuleDashboard'
import CreateModule from './pages/CreateModule'
import JoinModule from './pages/JoinModule'
import CalendarScreenCoach from './pages/CalendarScreenCoach'
import CalendarScreenUser from './pages/CalendarScreenUser'
import AddEvent from './pages/AddEvent'
import ViewEvent from './pages/ViewEvent'
import EditEvent from './pages/EditEvent'
import CreateAnnouncement from './pages/CreateAnnouncement'
import CreateAgenda from './pages/CreateAgenda'
import AnnouncementDetail from './pages/AnnouncementDetail'
import AgendaDetail from './pages/AgendaDetail'
import EditAnnouncement from './pages/EditAnnouncement'
import EditAgenda from './pages/EditAgenda'
import ModuleAttendanceScreen from './pages/ModuleAttendanceScreen'
import Messaging from './pages/Inbox'
import ConversationDetail from './pages/ConversationDetail'
import NewMessage from './pages/NewMessage'
import ProgressScreen from './pages/ProgressScreen'
import ProgressPage from './pages/ProgressPage'
import RoutineDetailPage from './pages/RoutineDetailPage'
import StatsPage from './pages/StatsPage'

function CalendarRoute() {
  const { role } = useAuth();
  if (role === 'COACH') return <CalendarScreenCoach />;
  return <CalendarScreenUser />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/landing" element={<LandingScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/role-select" element={<RoleSelectScreen />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/module-homepage" element={<ModuleHomepage />} />
        <Route path="/modules/create" element={<CreateModule />} />
        <Route path="/modules/join" element={<JoinModule />} />
        <Route path="/modules/:moduleId/calendar" element={<CalendarRoute />} />
        <Route path="/modules/:moduleId/calendar/add-event" element={<AddEvent />} />
        <Route path="/modules/:moduleId/calendar/:eventId" element={<ViewEvent />} />
        <Route path="/modules/:moduleId/calendar/:eventId/edit" element={<EditEvent />} />
        <Route path="/modules/:id" element={<ModuleDashboard />} />
        <Route path="/modules/:moduleId/roster" element={<ModuleAttendanceScreen />} />
        <Route path="/modules/:id/announcements/create" element={<CreateAnnouncement />} />
        <Route path="/modules/:id/announcements/:announcementId/edit" element={<EditAnnouncement />} />
        <Route path="/modules/:id/announcements/:announcementId" element={<AnnouncementDetail />} />
        <Route path="/modules/:id/agendas/create" element={<CreateAgenda />} />
        <Route path="/modules/:id/agendas/:agendaId/edit" element={<EditAgenda />} />
        <Route path="/modules/:id/agendas/:agendaId" element={<AgendaDetail />} />
        <Route path="/modules/:id/messaging" element={<Messaging />} />
        <Route path="/modules/:id/messages/:conversationId" element={<ConversationDetail />} />
        <Route path="/modules/:id/messages/new" element={<NewMessage />} />
        <Route path="/modules/:moduleId/progress" element={<ProgressScreen />} />
        <Route path="/modules/:moduleId/progress/scores" element={<ProgressPage />} />
        <Route path="/modules/:moduleId/routines/:routineId" element={<RoutineDetailPage />} />
        <Route path="/modules/:moduleId/progress/stats" element={<StatsPage />} />


      </Routes>
    </BrowserRouter>
  )
}