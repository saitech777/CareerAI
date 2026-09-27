import { useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import "./ResumeBuilder.css"

function ResumeBuilder() {
  const [resume, setResume] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    skills: "",
    education: "",
    experience: "",
    projects: "",
    certifications: "",
  })

  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setResume({
      ...resume,
      [e.target.name]: e.target.value,
    })
  }

  // =========================
  // Save Resume to PostgreSQL
  // =========================

  const saveResume = async () => {
    if (!resume.name.trim()) {
      alert("Please enter your name first.")
      return
    }

    // Get logged-in user
    const storedUser = localStorage.getItem("user")
    const token = localStorage.getItem("token")

    if (!storedUser || !token) {
      alert("Please login first.")
      return
    }

    const user = JSON.parse(storedUser)

    setSaving(true)

    const content = `
Professional Summary:
${resume.summary}

Skills:
${resume.skills}

Education:
${resume.education}

Experience:
${resume.experience}

Projects:
${resume.projects}

Certifications:
${resume.certifications}
`

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/test-resume`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",

            // JWT authentication
            Authorization: `Bearer ${token}`,
          },

          body: new URLSearchParams({
            user_id: String(user.id),
            title: `${resume.name} Resume`,
            content: content,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to save resume"
        )
      }

      alert(
        "Resume saved successfully! 🎉"
      )

      console.log(data)

    } catch (error) {
      console.error(
        "Save resume error:",
        error
      )

      alert(
        "Something went wrong while saving the resume."
      )

    } finally {
      setSaving(false)
    }
  }

  // =========================
  // Download Resume as PDF
  // =========================

  const downloadResume = async () => {
    const element =
      document.querySelector(
        ".resume-preview"
      )

    const button =
      document.querySelector(
        ".download-btn"
      )

    button.style.display = "none"

    const canvas = await html2canvas(
      element,
      {
        scale: 2,
        backgroundColor: "#ffffff",
      }
    )

    button.style.display = "block"

    const imageData =
      canvas.toDataURL("image/png")

    const pdf = new jsPDF(
      "p",
      "mm",
      "a4"
    )

    const pdfWidth =
      pdf.internal.pageSize.getWidth()

    const pdfHeight =
      (canvas.height * pdfWidth) /
      canvas.width

    pdf.addImage(
      imageData,
      "PNG",
      0,
      0,
      pdfWidth,
      pdfHeight
    )

    pdf.save(
      "CareerAI-Resume.pdf"
    )
  }

  return (
    <div className="builder-page">

      <div className="builder-header">

        <h1>
          Resume Builder
        </h1>

        <p>
          Create your professional
          resume with CareerAI
        </p>

      </div>

      <div className="builder-container">

        {/* FORM */}

        <div className="builder-form">

          <h2>
            Personal Details
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={resume.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={resume.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={resume.phone}
            onChange={handleChange}
          />

          <input
            type="text"
            name="location"
            placeholder="Location"
            value={resume.location}
            onChange={handleChange}
          />

          <h2>
            Professional Summary
          </h2>

          <textarea
            name="summary"
            placeholder="Write a short professional summary..."
            value={resume.summary}
            onChange={handleChange}
          />

          <h2>
            Skills
          </h2>

          <textarea
            name="skills"
            placeholder="Python, SQL, React, JavaScript..."
            value={resume.skills}
            onChange={handleChange}
          />

          <h2>
            Education
          </h2>

          <textarea
            name="education"
            placeholder="Enter your education details..."
            value={resume.education}
            onChange={handleChange}
          />

          <h2>
            Experience
          </h2>

          <textarea
            name="experience"
            placeholder="Enter your internship or work experience..."
            value={resume.experience}
            onChange={handleChange}
          />

          <h2>
            Projects
          </h2>

          <textarea
            name="projects"
            placeholder="Enter your projects..."
            value={resume.projects}
            onChange={handleChange}
          />

          <h2>
            Certifications
          </h2>

          <textarea
            name="certifications"
            placeholder="Enter your certifications..."
            value={resume.certifications}
            onChange={handleChange}
          />

        </div>

        {/* PREVIEW */}

        <div className="resume-preview">

          <h1>
            {resume.name ||
              "Your Name"}
          </h1>

          <p>
            {resume.email ||
              "email@example.com"}

            {" | "}

            {resume.phone ||
              "Phone"}

            {" | "}

            {resume.location ||
              "Location"}
          </p>

          <hr />

          {resume.summary && (
            <>
              <h2>
                Professional Summary
              </h2>

              <p>
                {resume.summary}
              </p>
            </>
          )}

          {resume.skills && (
            <>
              <h2>
                Skills
              </h2>

              <p>
                {resume.skills}
              </p>
            </>
          )}

          {resume.education && (
            <>
              <h2>
                Education
              </h2>

              <p>
                {resume.education}
              </p>
            </>
          )}

          {resume.experience && (
            <>
              <h2>
                Experience
              </h2>

              <p>
                {resume.experience}
              </p>
            </>
          )}

          {resume.projects && (
            <>
              <h2>
                Projects
              </h2>

              <p>
                {resume.projects}
              </p>
            </>
          )}

          {resume.certifications && (
            <>
              <h2>
                Certifications
              </h2>

              <p>
                {resume.certifications}
              </p>
            </>
          )}

          {/* SAVE BUTTON */}

          <button
            className="save-resume-btn"
            onClick={saveResume}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "💾 Save Resume"}
          </button>

          {/* DOWNLOAD BUTTON */}

          <button
            className="download-btn"
            onClick={downloadResume}
          >
            Download Resume
          </button>

        </div>

      </div>

    </div>
  )
}

export default ResumeBuilder

