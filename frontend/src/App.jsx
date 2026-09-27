import { useState } from "react"
import ResumeBuilder from "./pages/ResumeBuilder"
import ResumeAnalyzer from "./pages/ResumeAnalyzer"
import ATSChecker from "./pages/ATSChecker"
import InterviewQuestions from "./pages/InterviewQuestions"
import MockInterview from "./pages/MockInterview"
import MyResumes from "./pages/MyResumes"
import Login from "./pages/Login"
import Register from "./pages/Register"
import "./App.css"

// Small Back Button
function BackButton({ onBack }) {
  return (
    <button
      onClick={onBack}
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        border: "none",
        background: "transparent",
        fontSize: "28px",
        cursor: "pointer",
        color: "#4f46e5",
        fontWeight: "bold",
        padding: "0",
        lineHeight: "1"
      }}
      title="Back to Dashboard"
    >
      ←
    </button>
  )
}

function App() {
  // Check whether the user is already logged in
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  )

  const [page, setPage] = useState("dashboard")

  // Get logged-in user's information
  const storedUser = localStorage.getItem("user")
  const user = storedUser ? JSON.parse(storedUser) : null

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    setIsLoggedIn(false)
    setPage("login")

    alert("Logged out successfully!")
  }

  // Login success
  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setPage("dashboard")
  }

  // If user is not logged in
  if (!isLoggedIn) {
    if (page === "register") {
      return (
        <Register
          onLogin={() => setPage("login")}
        />
      )
    }

    return (
      <Login
        onRegister={() => setPage("register")}
        onLoginSuccess={handleLoginSuccess}
      />
    )
  }

  // Resume Builder
  if (page === "resume-builder") {
    return (
      <>
        <BackButton onBack={() => setPage("dashboard")} />
        <ResumeBuilder />
      </>
    )
  }

  // Resume Analyzer
  if (page === "resume-analyzer") {
    return (
      <>
        <BackButton onBack={() => setPage("dashboard")} />
        <ResumeAnalyzer />
      </>
    )
  }

  // ATS Checker
  if (page === "ats-checker") {
    return (
      <>
        <BackButton onBack={() => setPage("dashboard")} />
        <ATSChecker />
      </>
    )
  }

  // Interview Questions
  if (page === "interview-questions") {
    return (
      <>
        <BackButton onBack={() => setPage("dashboard")} />
        <InterviewQuestions />
      </>
    )
  }

  // Mock Interview
  if (page === "mock-interview") {
    return (
      <>
        <BackButton onBack={() => setPage("dashboard")} />
        <MockInterview />
      </>
    )
  }

  // My Resumes
  if (page === "my-resumes") {
    return (
      <>
        <BackButton onBack={() => setPage("dashboard")} />
        <MyResumes />
      </>
    )
  }

  // Dashboard
  return (
    <div className="app">

      {/* Navigation Bar */}
      <nav className="navbar">

        <div
          className="logo"
          onClick={() => setPage("dashboard")}
        >
          Career<span>AI</span>
        </div>

        <div className="nav-links">

          <button
            className="nav-dashboard-btn"
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>

          <button
            onClick={() => setPage("my-resumes")}
          >
            My Resumes
          </button>

          <button
            className="profile-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* Dashboard */}
      <main
        className="dashboard"
        id="dashboard"
      >

        {/* Hero / Welcome Section */}
        <section className="welcome">

          <div className="welcome-content">

            <p className="welcome-label">
              🤖 AI-POWERED CAREER ASSISTANT
            </p>

            <h1>
              Welcome
              {user?.name
                ? `, ${user.name}`
                : ""}
              !
            </h1>

            <h2>
              Build your career with{" "}
              <span>CareerAI</span>
            </h2>

            <p className="welcome-text">
              Create a professional resume, improve your ATS
              compatibility, and prepare confidently for
              your next interview.
            </p>

            <div className="welcome-actions">

              <button
                className="primary-btn"
                onClick={() => setPage("resume-builder")}
              >
                📝 Create Resume
              </button>

              <button
                className="secondary-btn"
                onClick={() => setPage("mock-interview")}
              >
                🎤 Practice Interview
              </button>

            </div>

          </div>

          <div className="welcome-visual">
            <div className="ai-circle">
              🤖
            </div>

            <p>
              Your AI Career Assistant
            </p>

          </div>

        </section>

        {/* Dashboard Overview */}
        <section className="dashboard-overview">

          <div className="overview-card">
            <div className="overview-icon">
              📝
            </div>

            <div>
              <h3>Resume Builder</h3>
              <p>Create professional resumes</p>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              📊
            </div>

            <div>
              <h3>ATS Checker</h3>
              <p>Improve job compatibility</p>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              🎯
            </div>

            <div>
              <h3>Interview Prep</h3>
              <p>Practice before interviews</p>
            </div>
          </div>

          <div className="overview-card">
            <div className="overview-icon">
              📁
            </div>

            <div>
              <h3>My Resumes</h3>
              <p>Manage your resumes</p>
            </div>
          </div>

        </section>

        {/* Quick Actions */}
        <section className="quick-actions">

          <div className="section-heading">
            <p className="section-label">
              QUICK ACTIONS
            </p>

            <h2>
              What would you like to do?
            </h2>
          </div>

          <div className="quick-action-buttons">

            <button
              onClick={() => setPage("resume-builder")}
            >
              📝 Build Resume
            </button>

            <button
              onClick={() => setPage("resume-analyzer")}
            >
              🔍 Analyze Resume
            </button>

            <button
              onClick={() => setPage("ats-checker")}
            >
              📊 Check ATS
            </button>

            <button
              onClick={() => setPage("interview-questions")}
            >
              🎯 Get Questions
            </button>

            <button
              onClick={() => setPage("mock-interview")}
            >
              🎤 Mock Interview
            </button>

            <button
              onClick={() => setPage("my-resumes")}
            >
              📁 My Resumes
            </button>

          </div>

        </section>

        {/* Feature Section */}
        <section className="features-section">

          <div className="section-heading">

            <p className="section-label">
              CAREER TOOLS
            </p>

            <h2>
              Everything you need to prepare for your career
            </h2>

            <p>
              CareerAI brings your resume building and
              interview preparation tools together in one
              platform.
            </p>

          </div>

          <div className="cards">

            {/* Resume Builder */}
            <div className="card">

              <div className="icon">
                📝
              </div>

              <h2>
                Resume Builder
              </h2>

              <p>
                Create a professional resume with structured
                sections and download it as a PDF.
              </p>

              <button
                onClick={() => setPage("resume-builder")}
              >
                Start Building →
              </button>

            </div>

            {/* Resume Analyzer */}
            <div className="card">

              <div className="icon">
                🔍
              </div>

              <h2>
                Resume Analyzer
              </h2>

              <p>
                Upload your resume and discover its strengths,
                weaknesses, and improvement areas.
              </p>

              <button
                onClick={() => setPage("resume-analyzer")}
              >
                Analyze Resume →
              </button>

            </div>

            {/* ATS Checker */}
            <div className="card">

              <div className="icon">
                📊
              </div>

              <h2>
                ATS Checker
              </h2>

              <p>
                Compare your resume with a job description
                and identify important matching keywords.
              </p>

              <button
                onClick={() => setPage("ats-checker")}
              >
                Check ATS →
              </button>

            </div>

            {/* Interview Questions */}
            <div className="card">

              <div className="icon">
                🎯
              </div>

              <h2>
                Interview Questions
              </h2>

              <p>
                Generate role-based interview questions
                according to the job requirements.
              </p>

              <button
                onClick={() => setPage("interview-questions")}
              >
                Generate Questions →
              </button>

            </div>

            {/* Mock Interview */}
            <div className="card">

              <div className="icon">
                🎤
              </div>

              <h2>
                Mock Interview
              </h2>

              <p>
                Practice answering interview questions and
                receive feedback on your answers.
              </p>

              <button
                onClick={() => setPage("mock-interview")}
              >
                Start Interview →
              </button>

            </div>

            {/* My Resumes */}
            <div className="card">

              <div className="icon">
                📁
              </div>

              <h2>
                My Resumes
              </h2>

              <p>
                View, edit, update, and manage your saved
                resumes in one place.
              </p>

              <button
                onClick={() => setPage("my-resumes")}
              >
                View Resumes →
              </button>

            </div>

          </div>

        </section>

        {/* How CareerAI Works */}
        <section className="how-it-works">

          <div className="section-heading">

            <p className="section-label">
              SIMPLE PROCESS
            </p>

            <h2>
              How CareerAI Works
            </h2>

          </div>

          <div className="steps">

            <div className="step">

              <div className="step-number">
                1
              </div>

              <h3>
                Build
              </h3>

              <p>
                Create and save your professional resume.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                2
              </div>

              <h3>
                Analyze
              </h3>

              <p>
                Check your resume and ATS compatibility.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                3
              </div>

              <h3>
                Prepare
              </h3>

              <p>
                Generate questions and practice interviews.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                4
              </div>

              <h3>
                Improve
              </h3>

              <p>
                Use feedback to continuously improve.
              </p>

            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="dashboard-footer">

          <h3>
            Career<span>AI</span>
          </h3>

          <p>
            AI-powered tools for smarter career preparation.
          </p>

          <p className="footer-copy">
            © 2026 CareerAI. All rights reserved.
          </p>

        </footer>

      </main>

    </div>
  )
}

export default App