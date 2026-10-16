
import { ArrowRight, BriefcaseBusiness, Code2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children, mode }) {
  const isLogin = mode === "login";

  return (
    <div className="auth-page">
      <header className="auth-navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Code2 size={22} />
          </span>
          <span>
            Skill<span className="accent">Bridge</span>
          </span>
        </Link>

        <Link to="/" className="back-home">
          Back to home <ArrowRight size={16} />
        </Link>
      </header>

      <main className="auth-container">
        <section className="auth-form-section">
          <div className="auth-form-inner">
            <div className="mobile-brand-icon">
              <BriefcaseBusiness size={25} />
            </div>

            <p className="eyebrow">
              {isLogin ? "WELCOME BACK" : "YOUR NEXT CHAPTER STARTS HERE"}
            </p>

            <h1>
              {isLogin ? (
                <>Welcome <span className="accent">back.</span></>
              ) : (
                <>Create your <span className="accent">account.</span></>
              )}
            </h1>

            <p className="auth-description">
              {isLogin
                ? "Log in to find opportunities, manage projects, and grow your career."
                : "Join a community connecting young African talent with meaningful opportunities."}
            </p>

            {children}
          </div>
        </section>

        <aside className="auth-promo">
          <div className="promo-orb orb-one" />
          <div className="promo-orb orb-two" />

          <div className="promo-content">
            <span className="promo-tag">
              <span className="status-dot" />
              BUILT FOR THE NEXT GENERATION
            </span>

            <h2>
              Your talent.
              <br />
              Your future.
              <br />
              <span className="accent">Your opportunity.</span>
            </h2>

            <p>
              Discover projects, showcase your skills, and build real-world
              experience that moves your career forward.
            </p>

            <div className="promo-stat-row">
              <div>
                <strong>01</strong>
                <span>Show your skills</span>
              </div>
              <div>
                <strong>02</strong>
                <span>Find opportunities</span>
              </div>
              <div>
                <strong>03</strong>
                <span>Build your future</span>
              </div>
            </div>
          </div>

          <div className="promo-footer">
            <span>SKILLBRIDGE</span>
            <span>Connecting talent to opportunity.</span>
          </div>
        </aside>
      </main>

      <footer className="auth-mobile-footer">
        © {new Date().getFullYear()} SkillBridge. Built for young talent.
      </footer>
    </div>
  );
}
