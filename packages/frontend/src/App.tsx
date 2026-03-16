import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TitleScreen from './pages/TitleScreen'
import LandingScreen from './pages/LandingScreen'
import SignupScreen from './pages/SignupScreen'
import LoginScreen from './pages/LoginScreen'
import RoleSelectScreen from './pages/RoleSelectScreen'
import VerifyEmail from './pages/VerifyEmail'
import ModuleHomepage from './pages/ModuleHomepage'
import CreateModule from './pages/CreateModule'
import JoinModule from './pages/JoinModule'

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
      </Routes>
    </BrowserRouter>
  )
}