
import { useState } from "react";
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "freelancer",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (formData.fullName.trim().length < 2) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Your password must contain at least 8 characters.");
      setMessageType("error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Your passwords do not match.");
      setMessageType("error");
      return;
    }

    // Frontend demonstration only. Connect to Flask registration later.
    setMessage(
      `Your form is valid! Backend account creation for ${formData.role} accounts will be added next.`
    );
    setMessageType("success");
  }

  return (
    <AuthLayout mode="register">
      <form className="auth-form register-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="fullName">Full name</label>

          <div className="input-wrapper">
            <UserRound className="input-icon" size={19} />
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              minLength={2}
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="register-email">Email address</label>

          <div className="input-wrapper">
            <Mail className="input-icon" size={19} />
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="role">I want to join as a</label>

          <div className="input-wrapper select-wrapper">
            <BriefcaseBusiness className="input-icon" size={19} />
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="freelancer">Freelancer — find projects</option>
              <option value="client">Client — hire talent</option>
            </select>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Password</label>

          <div className="input-wrapper">
            <LockKeyhole className="input-icon" size={19} />
            <input
              id="register-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword">Confirm password</label>

          <div className="input-wrapper">
            <LockKeyhole className="input-icon" size={19} />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              onClick={() =>
                setShowConfirmPassword((previous) => !previous)
              }
            >
              {showConfirmPassword ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        <label className="checkbox-row terms-row">
          <input type="checkbox" required />
          <span>
            I agree to the <a href="#terms">Terms of Service</a> and{" "}
            <a href="#privacy">Privacy Policy</a>.
          </span>
        </label>

        {message && (
          <div
            className={`form-message ${messageType}`}
            role="status"
          >
            {message}
          </div>
        )}

        <button type="submit" className="submit-button">
          Create account <span>→</span>
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
