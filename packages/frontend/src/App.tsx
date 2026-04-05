import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import CreateAnnouncement from './pages/CreateAnnouncement'
import CreateAgenda from './pages/CreateAgenda'
import AnnouncementDetail from './pages/AnnouncementDetail'
import AgendaDetail from './pages/AgendaDetail'
import EditAnnouncement from './pages/EditAnnouncement'
import EditAgenda from './pages/EditAgenda'

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
        <Route path="/modules/:id" element={<ModuleDashboard />} />
        <Route path="/modules/:id/announcements/create" element={<CreateAnnouncement />} />
        <Route path="/modules/:id/announcements/:announcementId" element={<AnnouncementDetail />} />
        <Route path="/modules/:id/announcements/:announcementId/edit" element={<EditAnnouncement />} />
        <Route path="/modules/:id/agendas/create" element={<CreateAgenda />} />
        <Route path="/modules/:id/agendas/:agendaId" element={<AgendaDetail />} />
        <Route path="/modules/:id/agendas/:agendaId/edit" element={<EditAgenda />} />
      </Routes>
    </BrowserRouter>
  )
}