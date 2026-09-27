import { useState } from "react"
import "./ResumeAnalyzer.css"

function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyzeResume = async () => {
    if (!file) {
      alert("Please upload your resume first.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/upload-resume`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error("Failed to analyze resume")
      }

      setResult(data)
    } catch (error) {
      console.error(error)
      alert("Something went wrong while analyzing the resume.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="analyzer-page">

      {/* Header */}
      <div className="analyzer-header">
        <h1>Resume Analyzer</h1>

        <p>
          Upload your resume and discover how you can improve it.
        </p>
      </div>

      {/* Upload Section */}
      <div className="upload-card">

        <div className="upload-icon">📄</div>

        <h2>Upload Your Resume</h2>

        <p>
          Upload your resume in PDF or DOCX format.
        </p>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {file && (
          <p>
            Selected file: <strong>{file.name}</strong>
          </p>
        )}

        <button
          className="analyze-btn"
          onClick={analyzeResume}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

      </div>

      {/* Results Section */}
      <div className="results-section">

        {/* Resume Score */}
        <div className="score-card">

          <h2>Resume Score</h2>

          <div className="score">
            {result ? result.score : "--"}
          </div>

          <p>
            {result
              ? "Your resume analysis score"
              : "Your score will appear here"}
          </p>

        </div>

        {/* Strengths */}
        <div className="result-card">

          <h2>Strengths</h2>

          {result ? (
            <ul>
              {result.strengths.map((strength, index) => (
                <li key={index}>
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Your resume strengths will appear here after analysis.
            </p>
          )}

        </div>

        {/* Areas to Improve */}
        <div className="result-card">

          <h2>Areas to Improve</h2>

          {result ? (
            result.improvements.length > 0 ? (
              <ul>
                {result.improvements.map((item, index) => (
                  <li key={index}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                No major improvements detected.
              </p>
            )
          ) : (
            <p>
              Suggestions for improving your resume will appear here.
            </p>
          )}

        </div>

        {/* AI Feedback */}
        {result && result.ai_feedback && (
          <div className="result-card ai-feedback-card">

            <h2>🤖 AI Resume Feedback</h2>

            <div className="ai-feedback">
              {result.ai_feedback}
            </div>

          </div>
        )}

        {/* Extracted Resume Text */}
        {result && (
          <div className="result-card resume-text-card">

            <h2>Extracted Resume Text</h2>

            <p className="resume-text">
              {result.text}
            </p>

          </div>
        )}

      </div>

    </div>
  )
}

export default ResumeAnalyzer

