import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../utils/api";
import "./Auth.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "" : "No verification token provided"
  );

  useEffect(() => {
    if (!token) return;

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
            <h1>Email Verified</h1>
            <p className="auth-subtitle">{message}</p>
            <Link
              to="/login"
              className="auth-button"
              style={{ textAlign: "center", display: "block", textDecoration: "none" }}
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1>Verification Failed</h1>
            <div className="auth-error">{message}</div>
            <Link
              to="/login"
              className="auth-button"
              style={{ textAlign: "center", display: "block", textDecoration: "none" }}
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
