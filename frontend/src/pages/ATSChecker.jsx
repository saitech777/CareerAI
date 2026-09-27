import { useState } from "react"
import "./ATSChecker.css"

function ATSChecker() {
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkATS = async () => {
    if (!resumeFile) {
      alert("Please upload your resume first.")
      return
    }

    if (!jobDescription.trim()) {
      alert("Please enter the job description.")
      return
    }

    const formData = new FormData()

    formData.append("file", resumeFile)
    formData.append("job_description", jobDescription)

    setLoading(true)
    setResult(null)

    try {
      const token = localStorage.getItem("token")

const response = await fetch(
  "http://127.0.0.1:8000/ats-check",
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
        throw new Error("ATS analysis failed")
      }

      setResult(data)

    } catch (error) {

      console.error(error)

      alert(
        "Something went wrong while checking ATS compatibility."
      )

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="ats-page">

      {/* Header */}
      <div className="ats-header">

        <h1>ATS Checker</h1>

        <p>
          Compare your resume with a job description and improve
          your ATS compatibility.
        </p>

      </div>


      {/* Input Section */}
      <div className="ats-input-section">

        {/* Resume Upload */}
        <div className="ats-card">

          <h2>📄 Upload Resume</h2>

          <p>
            Upload your resume in PDF or DOCX format.
          </p>

          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => {
              setResumeFile(e.target.files[0])
              setResult(null)
            }}
          />

          {resumeFile && (
            <p className="selected-file">

              Selected:
              {" "}

              <strong>
                {resumeFile.name}
              </strong>

            </p>
          )}

        </div>


        {/* Job Description */}
        <div className="ats-card">

          <h2>💼 Job Description</h2>

          <p>
            Paste the job description below.
          </p>

          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value)
              setResult(null)
            }}
          />

        </div>

      </div>


      {/* Check Button */}
      <div className="ats-button-container">

        <button
          className="ats-check-btn"
          onClick={checkATS}
          disabled={loading}
        >

          {loading
            ? "Analyzing with AI..."
            : "Check ATS Compatibility"}

        </button>

      </div>


      {/* Results */}
      {result && (

        <div className="ats-results">


          {/* ATS Score */}
          <div className="ats-score-card">

            <h2>ATS Score</h2>

            <div className="ats-score">
              {result.score}
            </div>

            <p>
              Resume compatibility score
            </p>

          </div>


          {/* Matched Keywords */}
          <div className="ats-result-card">

            <h2>✅ Matched Keywords</h2>

            {result.matchedKeywords.length > 0 ? (

              <ul>

                {result.matchedKeywords.map(
                  (keyword, index) => (

                    <li key={index}>
                      {keyword}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No important matched keywords found.
              </p>

            )}

          </div>


          {/* Missing Keywords */}
          <div className="ats-result-card">

            <h2>⚠️ Missing Keywords</h2>

            {result.missingKeywords.length > 0 ? (

              <ul>

                {result.missingKeywords.map(
                  (keyword, index) => (

                    <li key={index}>
                      {keyword}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No major missing keywords detected.
              </p>

            )}

          </div>


          {/* Suggestions */}
          <div className="ats-result-card ats-suggestions">

            <h2>💡 AI Suggestions</h2>

            {result.suggestions.length > 0 ? (

              <ul>

                {result.suggestions.map(
                  (suggestion, index) => (

                    <li key={index}>
                      {suggestion}
                    </li>

                  )
                )}

              </ul>

            ) : (

              <p>
                No additional suggestions.
              </p>

            )}

          </div>

        </div>

      )}

    </div>
  )
}

export default ATSChecker