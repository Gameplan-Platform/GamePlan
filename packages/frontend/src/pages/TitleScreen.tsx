import logo from '../assets/logo.png'

export default function TitleScreen() {
  return (
    <div className = "flex flex-col items-center justify-center min-h-screen bg-white">
      <img src = {logo} alt = "GamePlan logo" className = "w-48" />
    </div>
  )
}