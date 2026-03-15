import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import "./Auth.css";

interface SignupResponse {
  message: string;
  user: { id: string; email: string };
}

interface ResendResponse {
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function Signup() {

  const [form, setForm] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!EMAIL_RE.test(form.email)) errs.email = "Invalid email format";
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    if (!form.password) errs.password = "Password is required";
    else if (!PASSWORD_RE.test(form.password))
      errs.password =
        "Must be 8+ chars with uppercase, lowercase, number, and special character (@$!%*?&)";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords don't match";

    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await api<SignupResponse>("/auth/signup", {
        method: "POST",
        body: {
          email: form.email.trim(),
          username: form.username.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          dob: form.dob,
          password: form.password,
        },
      });
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleResend = async () => {
    setResendStatus("sending");
    try {
      await api<ResendResponse>("/auth/resend-verification", {
        method: "POST",
        body: { email: form.email.trim() },
      });
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Check Your Email</h1>
          <p className="auth-subtitle">
            We sent a verification link to <strong>{form.email}</strong>. Click
            the link to verify your account.
          </p>
          <button
            onClick={handleResend}
            className="auth-button"
            disabled={resendStatus === "sending" || resendStatus === "sent"}
            style={{ marginBottom: "1rem" }}
          >
            {resendStatus === "idle" && "Resend Verification Email"}
            {resendStatus === "sending" && "Sending..."}
            {resendStatus === "sent" && "Email Sent"}
            {resendStatus === "error" && "Failed - Try Again"}
          </button>
          <p className="auth-link">
            Already verified? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign Up</h1>
        <p className="auth-subtitle">Create your GamePlan account</p>

        {serverError && <div className="auth-error">{serverError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="First name"
                disabled={loading}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                type="text"
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="Last name"
                disabled={loading}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              disabled={loading}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={form.username}
              onChange={set("username")}
              placeholder="Choose a username"
              disabled={loading}
            />
            {errors.username && <span className="field-error">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              id="dob"
              type="date"
              value={form.dob}
              onChange={set("dob")}
              disabled={loading}
            />
            {errors.dob && <span className="field-error">{errors.dob}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="Min 8 chars, upper, lower, number, special"
              disabled={loading}
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Re-enter your password"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
