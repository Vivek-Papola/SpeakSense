import { useNavigate } from 'react-router-dom'
import './Home.css'
import { useEffect, useRef } from 'react'

function Home() {
  const navigate = useNavigate()
  const sectionsRef = useRef([])

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => {
      sectionsRef.current.forEach((section) => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  return (
    <div className="home-page-new">
      {/* SECTION 1: Hero Section - Blue Gradient */}
      <section 
        className="section hero-section"
        ref={(el) => (sectionsRef.current[0] = el)}
      >
        <div className="section-background hero-bg"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-word">Master</span>
              <span className="title-word">Your</span>
              <span className="title-word">English</span>
              <span className="title-word">Pronunciation</span>
            </h1>
            <p className="hero-subtitle">
              Perfect Your Accent with AI-Powered Speech Analysis and Real-Time Feedback
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Active Learners</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Sessions</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">95%</div>
                <div className="stat-label">Improvement</div>
              </div>
            </div>
            <div className="hero-cta-buttons">
              <button className="btn-primary-hero" onClick={() => navigate('/practice')}>
                Start Practicing Now
              </button>
              <button className="btn-secondary-hero" onClick={() => navigate('/dashboard')}>
                View Dashboard →
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-badge">Real-Time</div>
              <div className="card-text">Instant Feedback</div>
            </div>
            <div className="floating-card card-2">
              <div className="card-badge">AI Powered</div>
              <div className="card-text">Smart Analysis</div>
            </div>
            <div className="floating-card card-3">
              <div className="card-badge">Track</div>
              <div className="card-text">Your Progress</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Features Section - Purple Gradient */}
      <section 
        className="section features-section"
        ref={(el) => (sectionsRef.current[1] = el)}
      >
        <div className="section-background features-bg"></div>
        <div className="floating-shapes">
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>

        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">Everything you need to master your pronunciation</p>
          </div>

          <div className="features-grid">
            <div className="feature-card feature-card-1">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Real-Time Analysis</h3>
              <p>Get instant feedback on your pronunciation with phoneme-level accuracy</p>
            </div>

            <div className="feature-card feature-card-2">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.16-2.66c-.23-.28-.62-.38-.96-.24-.34.13-.56.48-.56.84v4.2h12V9.5c0-.36-.22-.71-.56-.84-.34-.13-.73-.04-.96.24l-4.05 6.37z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Detailed Reports</h3>
              <p>Comprehensive analysis with word-level insights and improvement areas</p>
            </div>

            <div className="feature-card feature-card-3">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Progress Tracking</h3>
              <p>Monitor your improvements over time with beautiful charts and metrics</p>
            </div>

            <div className="feature-card feature-card-4">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                </svg>
              </div>
              <h3>AI Recommendations</h3>
              <p>Get personalized practice exercises based on your weaknesses</p>
            </div>

            <div className="feature-card feature-card-5">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Fluency Metrics</h3>
              <p>Track speech rate, pauses, and filler words to improve flow</p>
            </div>

            <div className="feature-card feature-card-6">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M11 7h2v10h-2zm5-4v2h4V3zm0 16v2h4v-2zM8 6.5C4.69 6.5 2 9.19 2 12.5S4.69 18.5 8 18.5s6-2.69 6-6-2.69-6-6-6zm0 11c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Personalized Learning</h3>
              <p>Custom practice plans tailored to your learning style and goals</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: How It Works - Teal Gradient */}
      <section 
        className="section how-it-works-section"
        ref={(el) => (sectionsRef.current[2] = el)}
      >
        <div className="section-background how-it-works-bg"></div>
        <div className="floating-shapes">
          <div className="shape shape-6"></div>
          <div className="shape shape-7"></div>
          <div className="shape shape-8"></div>
        </div>

        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How SpeakSense Works</h2>
            <p className="section-subtitle">Three simple steps to improve your pronunciation</p>
          </div>

          <div className="steps-container">
            <div className="step-card step-1">
              <div className="step-number">01</div>
              <div className="step-circle">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                  <path d="M12 14c1.66 0 3-1.34 3-3 0-1.65-1.34-3-3-3s-3 1.35-3 3c0 1.66 1.34 3 3 3zm0-8c2.76 0 5 2.24 5 5 0 2.76-2.24 5-5 5s-5-2.24-5-5c0-2.76 2.24-5 5-5zm-.9 10H8v3h3.1v-3zm4.8 0v3H16v-3z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Record</h3>
              <p>Tap the mic and speak naturally about one of our suggested topics</p>
            </div>

            <div className="step-connector"></div>

            <div className="step-card step-2">
              <div className="step-number">02</div>
              <div className="step-circle">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.16-2.66c-.23-.28-.62-.38-.96-.24-.34.13-.56.48-.56.84v4.2h12V9.5c0-.36-.22-.71-.56-.84-.34-.13-.73-.04-.96.24l-4.05 6.37z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Analyze</h3>
              <p>Our AI analyzes your pronunciation with phoneme-level accuracy</p>
            </div>

            <div className="step-connector"></div>

            <div className="step-card step-3">
              <div className="step-number">03</div>
              <div className="step-circle">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12h-2v-2h-2v2h-2v2h2v2h2v-2h2v-2zm-8-6H9v2H7V6h4V4zm0 6H9v2H7v-2h4v-2zm0 6H9v2H7v-2h4v-2z" fill="currentColor"/>
                </svg>
              </div>
              <h3>Improve</h3>
              <p>Get detailed feedback and practice recommendations to level up</p>
            </div>
          </div>

          <div className="cta-section-bottom">
            <h3>Ready to Master Your Pronunciation?</h3>
            <p>Join thousands of learners improving their English every day</p>
            <button className="btn-large-cta" onClick={() => navigate('/practice')}>
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 4: About Section - Blue Gradient (Optional) */}
      <section 
        className="section about-section"
        ref={(el) => (sectionsRef.current[3] = el)}
      >
        <div className="section-background about-bg"></div>
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2>About SpeakSense</h2>
              <p>
                SpeakSense is a revolutionary AI-powered pronunciation coaching platform designed to help English learners master their accent and fluency. Whether you're preparing for interviews, presentations, or everyday conversations, SpeakSense gives you the tools and insights you need to communicate with confidence.
              </p>
              <ul className="about-features">
                <li>🎯 Phoneme-level pronunciation analysis</li>
                <li>📊 Real-time fluency tracking</li>
                <li>🤖 AI-powered personalized recommendations</li>
                <li>💾 Unlimited practice sessions</li>
                <li>🏆 Progress reports and certificates</li>
              </ul>
            </div>
            <div className="about-stats">
              <div className="stat-large">
                <div className="stat-num">1500+</div>
                <div className="stat-desc">Active Users</div>
              </div>
              <div className="stat-large">
                <div className="stat-num">85K+</div>
                <div className="stat-desc">Practice Sessions</div>
              </div>
              <div className="stat-large">
                <div className="stat-num">4.8★</div>
                <div className="stat-desc">User Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
