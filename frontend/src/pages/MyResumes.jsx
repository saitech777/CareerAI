import { useCallback, useEffect, useState } from "react"
import "./MyResumes.css"

const API_URL = import.meta.env.VITE_API_URL

function MyResumes() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)

  const [editingResume, setEditingResume] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [saving, setSaving] = useState(false)

  // ==========================================
  // LOAD RESUMES
  // ==========================================

  const fetchResumes = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("token")

      if (!storedUser || !token) {
        setResumes([])
        setLoading(false)
        return
      }

      const user = JSON.parse(storedUser)

      const response = await fetch(
        `${API_URL}/resumes/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch resumes")
      }

      const data = await response.json()

      setResumes(data.resumes || [])
    } catch (error) {
      console.error("Fetch resumes error:", error)

      alert(
        "Something went wrong while loading your resumes."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  // ==========================================
  // LOAD RESUMES WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResumes()
    }, 0)

    return () => {
      clearTimeout(timer)
    }
  }, [fetchResumes])

  // ==========================================
  // START EDITING
  // ==========================================

  const startEditing = (resume) => {
    setEditingResume(resume)
    setEditTitle(resume.title || "")
    setEditContent(resume.content || "")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // ==========================================
  // CANCEL EDITING
  // ==========================================

  const cancelEditing = () => {
    setEditingResume(null)
    setEditTitle("")
    setEditContent("")
  }

  // ==========================================
  // SAVE EDITED RESUME
  // ==========================================

  const saveEditedResume = async () => {
    if (!editingResume) {
      return
    }

    if (!editTitle.trim()) {
      alert("Please enter a resume title.")
      return
    }

    if (!editContent.trim()) {
      alert("Resume content cannot be empty.")
      return
    }

    try {
      setSaving(true)

      const token = localStorage.getItem("token")

      if (!token) {
        alert("Please login first.")
        return
      }

      const formData = new FormData()

      formData.append("title", editTitle)
      formData.append("content", editContent)

      const response = await fetch(
        `${API_URL}/resume/${editingResume.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update resume"
        )
      }

      alert("Resume updated successfully!")

      cancelEditing()

      await fetchResumes()
    } catch (error) {
      console.error(
        "Update resume error:",
        error
      )

      alert(
        "Something went wrong while updating the resume."
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // DELETE RESUME
  // ==========================================

  const deleteResume = async (resume) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${resume.title}"?`
    )

    if (!confirmed) {
      return
    }

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        alert("Please login first.")
        return
      }

      const response = await fetch(
        `${API_URL}/resume/${resume.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete resume"
        )
      }

      alert("Resume deleted successfully!")

      setResumes((currentResumes) =>
        currentResumes.filter(
          (item) => item.id !== resume.id
        )
      )
    } catch (error) {
      console.error(
        "Delete resume error:",
        error
      )

      alert(
        "Something went wrong while deleting the resume."
      )
    }
  }

  // ==========================================
  // VIEW RESUME
  // ==========================================

  const viewResume = (resume) => {
    const content =
      resume.content ||
      "No resume content available."

    alert(content)
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="my-resumes-page">

      {/* HEADER */}

      <div className="my-resumes-header">
        <h1>
          📄 My Resumes
        </h1>

        <p>
          View and manage your saved resumes.
        </p>
      </div>

      {/* EDIT RESUME */}

      {editingResume && (
        <div className="edit-resume-card">

          <h2>
            ✏️ Edit Resume
          </h2>

          <p>
            Resume ID: {editingResume.id}
          </p>

          <label>
            Resume Title
          </label>

          <input
            type="text"
            value={editTitle}
            onChange={(e) =>
              setEditTitle(e.target.value)
            }
            placeholder="Enter resume title"
            disabled={saving}
          />

          <label>
            Resume Content
          </label>

          <textarea
            value={editContent}
            onChange={(e) =>
              setEditContent(e.target.value)
            }
            placeholder="Enter resume content..."
            disabled={saving}
          />

          <div className="edit-buttons">

            <button
              className="save-edit-btn"
              onClick={saveEditedResume}
              disabled={saving}
            >
              {saving
                ? "💾 Saving..."
                : "💾 Save Changes"}
            </button>

            <button
              className="cancel-edit-button"
              onClick={cancelEditing}
              disabled={saving}
            >
              Cancel
            </button>

          </div>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="loading-message">

          <h2>
            Loading...
          </h2>

          <p>
            Fetching your saved resumes.
          </p>

        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        resumes.length === 0 && (
          <div className="empty-resumes">

            <div className="empty-icon">
              📄
            </div>

            <h2>
              No Resumes Found
            </h2>

            <p>
              You haven't saved any resumes yet.
            </p>

          </div>
        )}

      {/* RESUME LIST */}

      {!loading &&
        resumes.length > 0 && (
          <div className="resumes-grid">

            {resumes.map((resume) => (

              <div
                className="resume-card"
                key={resume.id}
              >

                <div className="resume-card-icon">
                  📄
                </div>

                <div className="resume-card-content">

                  <h2>
                    {resume.title}
                  </h2>

                  <p className="resume-id">
                    Resume ID: {resume.id}
                  </p>

                  {resume.created_at && (
                    <p className="resume-date">
                      Created:{" "}
                      {new Date(
                        resume.created_at
                      ).toLocaleString()}
                    </p>
                  )}

                  <div className="resume-content-preview">

                    {resume.content
                      ? resume.content.substring(
                          0,
                          250
                        )
                      : "No resume content available."}

                    {resume.content &&
                      resume.content.length > 250 &&
                      "..."}
                  </div>

                </div>

                {/* ACTION BUTTONS */}

                <div className="resume-actions">

                  <button
                    className="view-resume-btn"
                    onClick={() =>
                      viewResume(resume)
                    }
                  >
                    👁️ View Resume
                  </button>

                  <button
                    className="edit-resume-btn"
                    onClick={() =>
                      startEditing(resume)
                    }
                  >
                    ✏️ Edit Resume
                  </button>

                  <button
                    className="delete-resume-btn"
                    onClick={() =>
                      deleteResume(resume)
                    }
                  >
                    🗑️ Delete Resume
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

    </div>
  )
}

export default MyResumes

