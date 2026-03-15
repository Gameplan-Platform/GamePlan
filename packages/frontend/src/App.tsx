import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TitleScreen from './pages/TitleScreen'
import LandingScreen from './pages/LandingScreen'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<TitleScreen />} />
        <Route path="/landing" element={<LandingScreen />} />
      </Routes>
    </BrowserRouter>
  )
}