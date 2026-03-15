import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TitleScreen from './pages/TitleScreen'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {<TitleScreen />} />
      </Routes>
    </BrowserRouter>
  )
}