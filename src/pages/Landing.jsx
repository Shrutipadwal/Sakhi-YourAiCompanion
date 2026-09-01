import GoogleAuth from "../components/GoogleAuth";

const Landing = () => {
  return (
    <main className="page-shell landing-shell">
      <div className="landing-grid">
        <section className="landing-copy">
          <p className="landing-eyebrow">
            A calm companion for everyday moments
          </p>
          <h1 className="landing-hero-title">
            Sakhi 🌸
            <br />
            Your AI voice companion that listens, remembers, and grows with you.
          </h1>

          <div className="landing-hero-copy">
            <p>You are not alone.</p>
            <p>
              Talk to Sakhi naturally through your voice. Share your thoughts,
              ask questions, and have a companion that understands your journey.
            </p>
          </div>

          <div className="landing-pill-list landing-pill-list--featured">
            <span className="pill">🌸 Warm conversations</span>
            <span className="pill">📚 Study motivation</span>
            <span className="pill">🚀 Career guidance</span>
            <span className="pill">✨ Personal reflections</span>
          </div>

          <p className="landing-note">
            One-click Google sign-in. No passwords, no waiting.
          </p>
        </section>

        <div className="landing-card-wrapper">
          <GoogleAuth
            title="Welcome to Sakhi"
            subtitle="Sign in with Google to begin your supportive companion chat."
            containerClassName="landing-auth-container"
          />
        </div>
      </div>
    </main>
  );
};

export default Landing;
