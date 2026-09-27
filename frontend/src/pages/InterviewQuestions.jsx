import { useState } from "react"
import "./InterviewQuestions.css"

function InterviewQuestions() {
  const [jobRole, setJobRole] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("Fresher")
  const [jobDescription, setJobDescription] = useState("")
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)

  const generateQuestions = async () => {
    if (!jobRole.trim()) {
      alert("Please enter the job role.")
      return
    }

    if (!jobDescription.trim()) {
      alert("Please enter the job description.")
      return
    }

    const formData = new FormData()

    formData.append("job_role", jobRole)
    formData.append("experience_level", experienceLevel)
    formData.append("job_description", jobDescription)

    setLoading(true)
    setQuestions([])

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/generate-interview-questions`,
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
        throw new Error("Failed to generate questions")
      }

      setQuestions(data.questions || [])

    } catch (error) {
      console.error(error)

      alert(
        "Something went wrong while generating interview questions."
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="interview-page">

      {/* Header */}
      <div className="interview-header">
        <h1>AI Interview Question Generator</h1>

        <p>
          Generate personalized interview questions based on
          your job role and job description.
        </p>
      </div>

      {/* Input Section */}
      <div className="interview-input-section">

        {/* Job Role */}
        <div className="interview-card">

          <h2>💼 Job Role</h2>

          <p>
            Enter the position you are preparing for.
          </p>

          <input
            type="text"
            placeholder="Example: Junior Data Analyst"
            value={jobRole}
            onChange={(e) => {
              setJobRole(e.target.value)
              setQuestions([])
            }}
          />

        </div>

        {/* Experience Level */}
        <div className="interview-card">

          <h2>🎓 Experience Level</h2>

          <p>
            Select your experience level.
          </p>

          <select
            value={experienceLevel}
            onChange={(e) => {
              setExperienceLevel(e.target.value)
              setQuestions([])
            }}
          >
            <option value="Fresher">
              Fresher
            </option>

            <option value="Entry Level">
              Entry Level
            </option>

            <option value="1-2 Years">
              1-2 Years
            </option>

            <option value="3-5 Years">
              3-5 Years
            </option>

            <option value="5+ Years">
              5+ Years
            </option>
          </select>

        </div>

        {/* Job Description */}
        <div className="interview-card job-description-card">

          <h2>📋 Job Description</h2>

          <p>
            Paste the job description below.
          </p>

          <textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value)
              setQuestions([])
            }}
          />

        </div>

      </div>

      {/* Generate Button */}
      <div className="generate-button-container">

        <button
          className="generate-btn"
          onClick={generateQuestions}
          disabled={loading}
        >
          {loading
            ? "Generating Questions..."
            : "🤖 Generate Interview Questions"}
        </button>

      </div>

      {/* Questions */}
      {questions.length > 0 && (

        <div className="questions-section">

          <h2>🎯 Your Interview Questions</h2>

          <p className="questions-subtitle">
            Practice answering these questions before your interview.
          </p>

          <div className="questions-list">

            {questions.map((question, index) => (

              <div
                className="question-card"
                key={index}
              >

                <div className="question-number">
                  {index + 1}
                </div>

                <div className="question-text">
                  {question}
                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  )
}

export default InterviewQuestions

