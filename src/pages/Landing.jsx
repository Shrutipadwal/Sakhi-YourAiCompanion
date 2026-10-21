import GoogleAuth from "../components/GoogleAuth";

const Landing = () => {
  return (
    <main className="page-shell landing-shell">
      <div className="landing-page-content">
        <header className="landing-nav">
          <a className="landing-brand" href="/" aria-label="Sakhi home">
            <span className="landing-brand-mark">s</span>
            Sakhi
          </a>
          <nav aria-label="Main navigation">
            <a href="#about">About</a>
            <a href="#how-it-helps">How it helps</a>
          </nav>
        </header>

        <div className="landing-grid">
          <section className="landing-copy">
            <div className="landing-hero-character" aria-hidden="true">
              <span className="hero-character-orbit" />
              <span className="hero-character-spark hero-character-spark-one">
                ✦
              </span>
              <span className="hero-character-spark hero-character-spark-two">
                ✧
              </span>
              <svg viewBox="0 0 200 230" className="hero-person-illustration">
                <defs>
                  <linearGradient
                    id="hero-hair"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#72534b" />
                    <stop offset="1" stopColor="#493c39" />
                  </linearGradient>
                  <linearGradient
                    id="hero-top"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#a7c6a5" />
                    <stop offset="1" stopColor="#71977d" />
                  </linearGradient>
                </defs>
                <circle cx="101" cy="112" r="87" fill="#dce9d8" opacity=".72" />
                <path
                  d="M47 110C38 50 57 22 103 20c49-2 65 35 53 94l-8 57H51z"
                  fill="url(#hero-hair)"
                />
                <path
                  d="M35 230c4-44 26-68 65-72h4c42 3 63 29 67 72z"
                  fill="url(#hero-top)"
                />
                <path d="m83 145-2 24 20 19 20-19-3-26z" fill="#d99578" />
                <path
                  d="M63 74c0-28 17-43 40-43 27 0 42 18 42 45v34c0 29-18 49-42 49-25 0-41-20-41-49z"
                  fill="#f2c5a7"
                />
                <path
                  d="M62 82c-7-32 8-59 38-63 24-3 42 9 49 31-12-7-23-15-28-25-9 17-29 27-57 30z"
                  fill="url(#hero-hair)"
                />
                <path
                  d="M64 82c-8 18-5 47 2 61-17-10-23-32-18-55 3-17 9-30 20-40z"
                  fill="#59443f"
                />
                <path
                  d="M143 77c9 18 7 48 0 65 17-10 23-32 18-55-3-17-9-30-20-40z"
                  fill="#59443f"
                />
                <path
                  d="M81 102c5-4 11-4 16 0m13 0c5-4 11-4 16 0"
                  fill="none"
                  stroke="#634a42"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <path
                  d="M104 105c-1 8-4 13-2 15 2 2 5 2 7 1"
                  fill="none"
                  stroke="#ce9278"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <path
                  d="M93 128c7 7 17 7 24 0"
                  fill="none"
                  stroke="#a65f5a"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <ellipse
                  cx="78"
                  cy="119"
                  rx="7"
                  ry="3.5"
                  fill="#df9a87"
                  opacity=".55"
                />
                <ellipse
                  cx="132"
                  cy="119"
                  rx="7"
                  ry="3.5"
                  fill="#df9a87"
                  opacity=".55"
                />
                <path
                  d="m88 179 13 12 13-12 11 8-24 30-24-30z"
                  fill="#f8f3e7"
                  opacity=".95"
                />
                <circle cx="101" cy="197" r="3" fill="#c49b66" />
              </svg>
            </div>
            <p className="landing-eyebrow">
              A calm companion for everyday moments
            </p>
            <h1 className="landing-hero-title">Sakhi</h1>
            <p className="landing-hero-tagline">
              Your AI voice companion that listens, remembers, and grows with
              you.
            </p>

            <div className="landing-hero-copy">
              <p>You are not alone. Take a breath, and start wherever you are.</p>
              <p>
                Sakhi is a gentle space to talk through everyday feelings,
                find encouragement for study or career goals, and reflect
                without pressure. You can type or use voice, and Sakhi can
                remember useful details you choose to share so conversations
                feel more personal over time.
              </p>
            </div>

            <div className="landing-pill-list landing-pill-list--featured">
              <span className="pill">Warm conversations</span>
              <span className="pill">Study motivation</span>
              <span className="pill">Career guidance</span>
              <span className="pill">Daily check-ins</span>
            </div>

            <p className="landing-note">
              A personal space to pause, reflect, and feel heard.
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

        <section className="landing-about" id="about">
          <div className="landing-about-intro">
            <div className="landing-section-heading">
              <span>About Sakhi</span>
              <h2>A thoughtful companion for the moments in between.</h2>
              <p>
                Sakhi brings supportive conversation, practical encouragement,
                and personal reflection into one calm place. It is here to
                listen and help you explore your next step—not to judge or rush
                you.
              </p>
            </div>
            <div className="landing-about-character" aria-hidden="true">
              <span className="illustration-spark illustration-spark-one">
                ✦
              </span>
              <span className="illustration-spark illustration-spark-two">
                ✧
              </span>
              <div className="sakhi-character">
                <span className="character-leaf character-leaf-left" />
                <span className="character-leaf character-leaf-right" />
                <span className="character-face">
                  <span className="character-eyes" />
                  <span className="character-smile" />
                  <span className="character-blush character-blush-left" />
                  <span className="character-blush character-blush-right" />
                </span>
              </div>
            </div>
          </div>
          <div className="landing-feature-grid" id="how-it-helps">
            <article className="landing-feature-card">
              <span aria-hidden="true">♡</span>
              <h3>A listening space</h3>
              <p>
                Share what is on your mind at your own pace. Sakhi responds
                with warmth and helps you sort through thoughts one step at a
                time.
              </p>
            </article>
            <article className="landing-feature-card">
              <span aria-hidden="true">☼</span>
              <h3>Gentle daily check-ins</h3>
              <p>
                Take a moment to name how you feel. Your check-in starts a
                conversation that can meet you where you are today.
              </p>
            </article>
            <article className="landing-feature-card">
              <span aria-hidden="true">✿</span>
              <h3>Encouragement for your goals</h3>
              <p>
                Talk through study plans, career questions, motivation, or
                everyday routines and find a manageable next step.
              </p>
            </article>
          </div>
        </section>

        <section className="landing-how-it-works">
          <div className="landing-section-heading">
            <span>How it works</span>
            <h2>Start with what is on your mind.</h2>
          </div>
          <ol className="landing-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Begin your way</h3>
                <p>Sign in, then type or speak naturally in a new chat.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Talk it through</h3>
                <p>
                  Sakhi uses your message and recent conversation to offer a
                  relevant, supportive reply.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Build on what matters</h3>
                <p>
                  Helpful personal context may be remembered for future chats,
                  and you can return to your saved conversations anytime.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <footer className="landing-footer">
          <span>Sakhi</span>
          <span>A little more room to be yourself.</span>
        </footer>
      </div>
    </main>
  );
};

export default Landing;
