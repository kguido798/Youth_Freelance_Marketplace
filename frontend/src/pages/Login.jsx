
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

const roleDestinations = {
  freelancer: "/profile",
  client: "/client-dashboard",
  admin: "/admin",
};

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await loginUser(email.trim(), password);
      const destination = roleDestinations[user.role];

      if (!destination) {
        setError("This account has an unrecognized role.");
        return;
      }

      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#0b0d0c",
      color: "#f4f5f4",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "Arial, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: "430px",
      padding: "36px",
      border: "1px solid #292e2a",
      borderRadius: "18px",
      background: "#131614",
      boxSizing: "border-box",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      color: "#d0d5d1",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "13px",
      borderRadius: "8px",
      border: "1px solid #343b36",
      background: "#0b0d0c",
      color: "#ffffff",
      marginBottom: "20px",
      fontSize: "15px",
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "#b6f36b",
      color: "#10140b",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      fontSize: "15px",
      cursor: "pointer",
    },
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <Link
          to="/"
          style={{
            color: "#b6f36b",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Youth Freelance Marketplace
        </Link>

        <h1 style={{ marginTop: "28px", marginBottom: "8px" }}>
          Welcome back
        </h1>

        <p style={{ color: "#a0a8a2", marginBottom: "28px" }}>
          Log in to continue to your workspace.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            style={styles.input}
          />

          <label style={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            style={styles.input}
          />

          {error && (
            <p role="alert" style={{ color: "#ff8585", fontSize: "14px" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ color: "#a0a8a2", fontSize: "14px", marginTop: "24px" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#b6f36b" }}>
            Create one
          </Link>
        </p>

        <div
          style={{
            marginTop: "28px",
            padding: "16px",
            background: "#1a201b",
            borderRadius: "10px",
            fontSize: "12px",
            lineHeight: 1.8,
            color: "#c6cec8",
          }}
        >
          
        </div>
      </section>
    </main>
  );
}
