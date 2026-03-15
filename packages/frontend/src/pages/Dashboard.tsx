import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Dashboard</h1>
        <p className="auth-subtitle">You're logged in.</p>
        <button onClick={handleLogout} className="auth-button">
          Log Out
        </button>
      </div>
    </div>
  );
}
