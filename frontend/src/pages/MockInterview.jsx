import { useState } from "react"
import "./MockInterview.css"

function MockInterview() {
  const [jobRole, setJobRole] = useState("")
  const [experienceLevel, setExperienceLevel] = useState("Fresher")

  const [started, setStarted] = useState(false)

  const [currentQuestion, setCurrentQuestion] = useState("")

  const [answer, setAnswer] = useState("")

  const [feedback, setFeedback] = useState(null)

  const [loading, setLoading] = useState(false)


  // ---------------------------------
  // Start Interview
  // ---------------------------------

  const startInterview = () => {

    if (!jobRole.trim()) {

      alert("Please enter the job role.")

      return
    }


    setStarted(true)


    setCurrentQuestion(
      `Tell me about yourself and why you are interested in the ${jobRole} role.`
    )


    setAnswer("")

    setFeedback(null)
  }


  // ---------------------------------
  // Submit Answer
  // ---------------------------------

  const submitAnswer = async () => {

    if (!answer.trim()) {

      alert("Please enter your answer.")

      return
    }


    const formData = new FormData()


    formData.append(
      "job_role",
      jobRole
    )


    formData.append(
      "experience_level",
      experienceLevel
    )


    formData.append(
      "question",
      currentQuestion
    )


    formData.append(
      "answer",
      answer
    )


    setLoading(true)

    setFeedback(null)


    try {

     const token = localStorage.getItem("token")

const response = await fetch(
  "http://127.0.0.1:8000/evaluate-interview-answer",
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

        throw new Error(
          "Interview evaluation failed"
        )
      }


      setFeedback(data)


    } catch (error) {

      console.error(error)


      alert(
        "Something went wrong while evaluating your answer."
      )


    } finally {

      setLoading(false)

    }
  }


  // ---------------------------------
  // End Interview
  // ---------------------------------

  const endInterview = () => {

    setStarted(false)

    setCurrentQuestion("")

    setAnswer("")

    setFeedback(null)
  }


  return (

    <div className="mock-page">


      {/* Header */}

      <div className="mock-header">

        <h1>🎤 Mock Interview</h1>

        <p>
          Practice your interview with an AI-powered
          interviewer.
        </p>

      </div>



      {/* Setup Section */}

      {!started && (

        <div className="mock-setup">

          <div className="mock-card">

            <h2>
              Start Your Mock Interview
            </h2>

            <p>
              Enter the job role and select your
              experience level to begin.
            </p>


            {/* Job Role */}

            <label>
              Job Role
            </label>

            <input
              type="text"
              placeholder="Example: Junior Data Analyst"
              value={jobRole}
              onChange={(e) =>
                setJobRole(e.target.value)
              }
            />


            {/* Experience Level */}

            <label>
              Experience Level
            </label>

            <select
              value={experienceLevel}
              onChange={(e) =>
                setExperienceLevel(e.target.value)
              }
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


            <button
              className="start-interview-btn"
              onClick={startInterview}
            >
              🚀 Start Interview
            </button>

          </div>

        </div>

      )}



      {/* Interview Section */}

      {started && (

        <div className="mock-interview-section">


          {/* Interview Information */}

          <div className="interview-info">

            <div>

              <strong>
                Job Role:
              </strong>{" "}

              {jobRole}

            </div>


            <div>

              <strong>
                Level:
              </strong>{" "}

              {experienceLevel}

            </div>

          </div>



          {/* Question */}

          <div className="question-box">

            <div className="question-label">
              🤖 Interviewer
            </div>

            <h2>
              {currentQuestion}
            </h2>

          </div>



          {/* Answer */}

          <div className="answer-box">

            <h2>
              Your Answer
            </h2>

            <textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value)
              }
            />


            <button
              className="submit-answer-btn"
              onClick={submitAnswer}
              disabled={loading}
            >

              {loading
                ? "🤖 AI Evaluating..."
                : "Submit Answer"}

            </button>

          </div>



          {/* AI Feedback */}

          {feedback && (

            <div className="feedback-box">

              <h2>
                🤖 AI Feedback
              </h2>


              {/* Score */}

              <div className="feedback-score">

                {feedback.score}

                <span>
                  /100
                </span>

              </div>


              {/* Overall Feedback */}

              <div className="feedback-section">

                <h3>
                  Overall Feedback
                </h3>

                <p>
                  {feedback.feedback}
                </p>

              </div>


              {/* Strengths */}

              <div className="feedback-section">

                <h3>
                  ✅ Strengths
                </h3>

                {feedback.strengths &&
                feedback.strengths.length > 0 ? (

                  <ul>

                    {feedback.strengths.map(
                      (strength, index) => (

                        <li key={index}>
                          {strength}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    No specific strengths identified.
                  </p>

                )}

              </div>


              {/* Improvements */}

              <div className="feedback-section">

                <h3>
                  💡 Areas to Improve
                </h3>

                {feedback.improvements &&
                feedback.improvements.length > 0 ? (

                  <ul>

                    {feedback.improvements.map(
                      (improvement, index) => (

                        <li key={index}>
                          {improvement}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    No specific improvements identified.
                  </p>

                )}

              </div>

            </div>

          )}



          {/* End Interview */}

          <div className="end-interview-container">

            <button
              className="end-interview-btn"
              onClick={endInterview}
            >
              End Interview
            </button>

          </div>

        </div>

      )}

    </div>

  )
}

export default MockInterview