import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import "./Auth.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const calledRef = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "" : "No verification token provided"
  );

  useEffect(() => {
    if (!token || calledRef.current) return;
    calledRef.current = true;

    api<{ message: string }>(`/auth/verify?token=${token}`)
      .then((data) => {
        setStatus("success");
        setMessage(data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, [token]);

  // Auto-redirect after successful verification
  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => navigate("/role-select"), 3000);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {status === "loading" && (
          <>
            <h1>Verifying...</h1>
            <p className="auth-subtitle">Hang on, we're confirming your email.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1>Email Verified!</h1>
            <p className="auth-subtitle">{message}</p>
            <p className="auth-subtitle">Redirecting you now...</p>
          </>
        )}

        {status === "error" && (
          <>
            <h1>Verification Failed</h1>
            <div className="auth-error">{message}</div>
            <button
              onClick={() => navigate("/signup")}
              className="auth-button"
              style={{ textAlign: "center", display: "block", cursor: "pointer" }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
