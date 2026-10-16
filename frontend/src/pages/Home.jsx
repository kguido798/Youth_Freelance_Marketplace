
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Search,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-page">
      <nav className="home-navbar">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <Code2 size={22} />
          </span>
          <span>
            Skill<span className="accent">Bridge</span>
          </span>
        </Link>

        <div className="home-nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#opportunities">Opportunities</a>
        </div>

        <div className="home-nav-actions">
          <Link to="/login" className="nav-login">
            Log in
          </Link>
          <Link to="/register" className="nav-signup">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <span className="hero-label">
              <span className="status-dot" />
              THE FUTURE OF YOUNG TALENT
            </span>

            <h1>
              Turn your skills into <span className="accent">opportunity.</span>
            </h1>

            <p>
              Find meaningful freelance projects, gain practical experience,
              and connect with clients who value your talent.
            </p>

            <div className="hero-actions">
              <Link to="/register" className="submit-button hero-button">
                Start your journey <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="hero-secondary">
                I already have an account
              </Link>
            </div>

            <div className="hero-trust">
              <Users size={18} />
              <span>Made to connect emerging talent with real opportunities.</span>
            </div>
          </div>

          <div className="hero-visual" id="opportunities">
            <div className="visual-topline">
              <span className="window-dots">● ● ●</span>
              <span>PROJECT EXPLORER</span>
            </div>

            <div className="visual-heading">
              <div>
                <span className="muted-label">YOUR NEXT OPPORTUNITY</span>
                <h2>Find work that matters.</h2>
              </div>
              <Search size={23} className="accent" />
            </div>

            <div className="opportunity-card">
              <span className="opportunity-icon">
                <Code2 size={23} />
              </span>
              <div className="opportunity-info">
                <h3>Frontend Developer</h3>
                <p>Web development · Remote</p>
                <div className="skill-tags">
                  <span>React</span>
                  <span>CSS</span>
                </div>
              </div>
              <span className="opportunity-arrow">↗</span>
            </div>

            <div className="opportunity-card">
              <span className="opportunity-icon purple-icon">
                <BriefcaseBusiness size={23} />
              </span>
              <div className="opportunity-info">
                <h3>Business Research</h3>
                <p>Research · Flexible</p>
                <div className="skill-tags">
                  <span>Analysis</span>
                  <span>Writing</span>
                </div>
              </div>
              <span className="opportunity-arrow">↗</span>
            </div>

            <div className="visual-bottomline">
              <span className="status-dot" />
              Your next chapter starts here.
            </div>
          </div>
        </section>

        <section className="home-steps" id="how-it-works">
          <div className="section-heading">
            <p className="eyebrow">SIMPLE BY DESIGN</p>
            <h2>Three steps to get started.</h2>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01</span>
              <h3>Create your profile</h3>
              <p>Showcase your skills, experience, and the work you want to do.</p>
            </article>

            <article className="step-card">
              <span className="step-number">02</span>
              <h3>Discover projects</h3>
              <p>Explore opportunities that match your interests and strengths.</p>
            </article>

            <article className="step-card">
              <span className="step-number">03</span>
              <h3>Build your future</h3>
              <p>Gain experience, deliver great work, and grow your portfolio.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <Link to="/" className="brand">
          Skill<span className="accent">Bridge</span>
        </Link>
        <span>Connecting young talent to opportunity.</span>
      </footer>
    </div>
  );
}
