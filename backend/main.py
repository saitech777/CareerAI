from fastapi import FastAPI, UploadFile, File, Form
from fastapi import Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from docx import Document
from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

import io
import os
import json
import re
import bcrypt
from jose import jwt

# ============================================================
# JWT CONFIGURATION
# ============================================================

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "careerai-secret-key-change-later"
)

JWT_ALGORITHM = "HS256"
from fastapi import Header, HTTPException


# ============================================================
# JWT TOKEN VERIFICATION
# ============================================================

def get_current_user(authorization: str = Header(None)):
    """
    Verify the JWT token sent by the frontend
    and return the logged-in user's ID.
    """

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization token is required."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format."
        )

    token = authorization.replace("Bearer ", "", 1)

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid token."
            )

        return user_id

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token."
        )



# ============================================================
# ENVIRONMENT CONFIGURATION
# ============================================================

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="CareerAI API",
    description="AI-powered Resume and Interview Assistant",
    version="1.0.0"
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HOME / DATABASE TEST
# ============================================================

@app.get("/")
def home():

    try:

        with engine.connect() as connection:

            connection.execute(
                text("SELECT 1")
            )

        return {
            "message": "CareerAI Backend is running!",
            "database": "PostgreSQL connected successfully!"
        }

    except Exception as error:

        return {
            "message": "CareerAI Backend is running!",
            "database": "PostgreSQL connection failed.",
            "error": str(error)
        }


# ============================================================
# TEST USER
# ============================================================

@app.post("/test-user")
def create_test_user(
    name: str,
    email: str
):

    try:

        with engine.connect() as connection:

            connection.execute(
                text("""
                    INSERT INTO users
                    (name, email)
                    VALUES
                    (:name, :email)
                """),
                {
                    "name": name,
                    "email": email
                }
            )

            connection.commit()

        return {
            "message": "User saved successfully!",
            "name": name,
            "email": email
        }

    except Exception as error:

        return {
            "message": "Failed to save user.",
            "error": str(error)
        }
# =========================
# User Registration
# =========================

@app.post("/register")
def register_user(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):

    # Remove unnecessary spaces
    name = name.strip()
    email = email.strip().lower()
    password = password.strip()

    # Validate input
    if not name:
        return {
            "success": False,
            "message": "Name is required."
        }

    if not email:
        return {
            "success": False,
            "message": "Email is required."
        }

    if not password:
        return {
            "success": False,
            "message": "Password is required."
        }

    if len(password) < 6:
        return {
            "success": False,
            "message": "Password must be at least 6 characters."
        }

    try:

        with engine.connect() as connection:

            # Check whether email already exists
            existing_user = connection.execute(
                text("""
                    SELECT id
                    FROM users
                    WHERE email = :email
                """),
                {
                    "email": email
                }
            ).fetchone()

            if existing_user:

                return {
                    "success": False,
                    "message": "Email is already registered."
                }

            # Hash password
            hashed_password = bcrypt.hashpw(
                password.encode("utf-8"),
                bcrypt.gensalt()
            ).decode("utf-8")

            # Insert new user
            result = connection.execute(
                text("""
                    INSERT INTO users
                    (name, email, password)
                    VALUES
                    (:name, :email, :password)
                    RETURNING id
                """),
                {
                    "name": name,
                    "email": email,
                    "password": hashed_password
                }
            )

            user_id = result.fetchone()[0]

            connection.commit()

        return {
            "success": True,
            "message": "Registration successful!",
            "user_id": user_id,
            "name": name,
            "email": email
        }

    except Exception as error:

        print("Registration error:", error)

        return {
            "success": False,
            "message": "Registration failed.",
            "error": str(error)
        }


# ============================================================
# USER LOGIN
# ============================================================

@app.post("/login")
def login_user(
    email: str = Form(...),
    password: str = Form(...)
):

    email = email.strip().lower()
    password = password.strip()

    if not email:
        return {"success": False, "message": "Email is required."}

    if not password:
        return {"success": False, "message": "Password is required."}

    try:
        with engine.connect() as connection:
            user = connection.execute(
                text("""
                    SELECT id, name, email, password
                    FROM users
                    WHERE email = :email
                """),
                {"email": email}
            ).fetchone()

        if not user:
            return {"success": False, "message": "Invalid email or password."}

        user_id = user[0]
        user_name = user[1]
        user_email = user[2]
        stored_password = user[3]

        password_correct = bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8")
        )

        if not password_correct:
            return {"success": False, "message": "Invalid email or password."}

        token = jwt.encode(
            {"user_id": user_id, "email": user_email},
            JWT_SECRET,
            algorithm=JWT_ALGORITHM
        )

        return {
            "success": True,
            "message": "Login successful!",
            "token": token,
            "user": {
                "id": user_id,
                "name": user_name,
                "email": user_email
            }
        }

    except Exception as error:
        print("Login error:", error)
        return {
            "success": False,
            "message": "Login failed.",
            "error": str(error)
        }

# ============================================================
# SAVE RESUME
# ============================================================

@app.post("/test-resume")
def create_test_resume(
    user_id: int = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    current_user_id: int = Depends(get_current_user)
):
    # Make sure the resume is saved only for the logged-in user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to save a resume for another user."
        )

    try:
        with engine.connect() as connection:
            connection.execute(
                text("""
                    INSERT INTO resumes
                    (
                        user_id,
                        title,
                        content,
                        created_at
                    )
                    VALUES
                    (
                        :user_id,
                        :title,
                        :content,
                        CURRENT_TIMESTAMP
                    )
                """),
                {
                    "user_id": user_id,
                    "title": title,
                    "content": content
                }
            )
            connection.commit()

        return {
            "message": "Resume saved successfully!",
            "user_id": user_id,
            "title": title
        }

    except Exception as error:
        return {
            "message": "Failed to save resume.",
            "error": str(error)
        }




# ============================================================
# GET ALL RESUMES FOR A USER
# ============================================================

@app.get("/resumes/{user_id}")
def get_resumes(
    user_id: int,
    current_user_id: int = Depends(get_current_user)
):
    if user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to access these resumes."
        )
    try:

        with engine.connect() as connection:

            result = connection.execute(
                text("""
                    SELECT
                        id,
                        user_id,
                        title,
                        content,
                        created_at
                    FROM resumes
                    WHERE user_id = :user_id
                    ORDER BY id DESC
                """),
                {
                    "user_id": user_id
                }
            )

            resumes = []

            for row in result:

                resumes.append(
                    {
                        "id": row.id,
                        "user_id": row.user_id,
                        "title": row.title,
                        "content": row.content,
                        "created_at": (
                            row.created_at.isoformat()
                            if row.created_at
                            else None
                        )
                    }
                )

        return {
            "message": "Resumes retrieved successfully!",
            "resumes": resumes
        }

    except Exception as error:

        return {
            "message": "Failed to retrieve resumes.",
            "resumes": [],
            "error": str(error)
        }


# ============================================================
# GET ONE RESUME
# ============================================================

@app.get("/resume/{resume_id}")
def get_single_resume(
    resume_id: int,
    current_user_id: int = Depends(get_current_user)
):
    try:
        with engine.connect() as connection:
            result = connection.execute(
                text("""
                    SELECT
                        id,
                        user_id,
                        title,
                        content,
                        created_at
                    FROM resumes
                    WHERE id = :resume_id
                """),
                {"resume_id": resume_id}
            )
            row = result.fetchone()

        if row is None:
            return {"message": "Resume not found.", "resume": None}

        if row.user_id != current_user_id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to access this resume."
            )

        resume = {
            "id": row.id,
            "user_id": row.user_id,
            "title": row.title,
            "content": row.content,
            "created_at": row.created_at.isoformat() if row.created_at else None
        }

        return {
            "message": "Resume retrieved successfully!",
            "resume": resume
        }

    except HTTPException:
        raise
    except Exception as error:
        return {
            "message": "Failed to retrieve resume.",
            "resume": None,
            "error": str(error)
        }




# ============================================================
# UPDATE / EDIT RESUME
# ============================================================

@app.put("/resume/{resume_id}")
def update_resume(
    resume_id: int,
    title: str = Form(...),
    content: str = Form(...),
    current_user_id: int = Depends(get_current_user)
):
    try:
        with engine.connect() as connection:
            owner = connection.execute(
                text("""
                    SELECT user_id
                    FROM resumes
                    WHERE id = :resume_id
                """),
                {"resume_id": resume_id}
            ).fetchone()

            if owner is None:
                return {"message": "Resume not found.", "resume_id": resume_id}

            if owner.user_id != current_user_id:
                raise HTTPException(
                    status_code=403,
                    detail="You are not allowed to update this resume."
                )

            connection.execute(
                text("""
                    UPDATE resumes
                    SET title = :title,
                        content = :content
                    WHERE id = :resume_id
                      AND user_id = :user_id
                """),
                {
                    "resume_id": resume_id,
                    "user_id": current_user_id,
                    "title": title,
                    "content": content
                }
            )
            connection.commit()

        return {
            "message": "Resume updated successfully!",
            "resume_id": resume_id,
            "title": title
        }

    except HTTPException:
        raise
    except Exception as error:
        return {
            "message": "Failed to update resume.",
            "resume_id": resume_id,
            "error": str(error)
        }




# ============================================================
# RESUME TEXT EXTRACTION
# ============================================================

def extract_resume_text(
    file_content,
    filename
):

    filename_lower = filename.lower()

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if filename_lower.endswith(".pdf"):

        pdf = PdfReader(
            io.BytesIO(file_content)
        )

        text_content = ""

        for page in pdf.pages:

            text_content += (
                page.extract_text() or ""
            )

        return text_content

    # --------------------------------------------------------
    # DOCX
    # --------------------------------------------------------

    elif filename_lower.endswith(".docx"):

        document = Document(
            io.BytesIO(file_content)
        )

        text_content = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

        return text_content

    # --------------------------------------------------------
    # Unsupported File
    # --------------------------------------------------------

    else:

        raise ValueError(
            "Only PDF and DOCX files are supported."
        )


# ============================================================
# RESUME ANALYZER
# ============================================================



@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user_id: int = Depends(get_current_user)
):

    file_content = await file.read()

    try:

        resume_text = extract_resume_text(
            file_content,
            file.filename
        )

    except ValueError as error:

        return {
            "message": str(error)
        }

    text_lower = resume_text.lower()

    strengths = []
    improvements = []
    score = 0

    # --------------------------------------------------------
    # WORD COUNT
    # --------------------------------------------------------

    word_count = len(
        resume_text.split()
    )

    if word_count >= 100:

        strengths.append(
            "Resume contains sufficient content."
        )

        score += 15

    else:

        improvements.append(
            "Add more relevant details to your resume."
        )

    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    if (
        "mail" in text_lower
        or "@" in text_lower
    ):

        strengths.append(
            "Email contact information found."
        )

        score += 10

    else:

        improvements.append(
            "Add a professional email address."
        )

    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    if "education" in text_lower:

        strengths.append(
            "Education section found."
        )

        score += 15

    else:

        improvements.append(
            "Add an Education section."
        )

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    if (
        "skills" in text_lower
        or "technical skills" in text_lower
    ):

        strengths.append(
            "Skills section found."
        )

        score += 15

    else:

        improvements.append(
            "Add a Skills section."
        )

    # --------------------------------------------------------
    # EXPERIENCE
    # --------------------------------------------------------

    if (
        "experience" in text_lower
        or "internship" in text_lower
    ):

        strengths.append(
            "Experience information found."
        )

        score += 15

    else:

        improvements.append(
            "Add internship or work experience."
        )

    # --------------------------------------------------------
    # PROJECTS
    # --------------------------------------------------------

    if (
        "projects" in text_lower
        or "project" in text_lower
    ):

        strengths.append(
            "Projects section found."
        )

        score += 10

    else:

        improvements.append(
            "Add relevant projects."
        )

    # --------------------------------------------------------
    # CERTIFICATIONS
    # --------------------------------------------------------

    if (
        "certification" in text_lower
        or "certifications" in text_lower
    ):

        strengths.append(
            "Certifications section found."
        )

        score += 10

    else:

        improvements.append(
            "Add relevant certifications if available."
        )

    # --------------------------------------------------------
    # SUMMARY / OBJECTIVE
    # --------------------------------------------------------

    if (
        "objective" in text_lower
        or "summary" in text_lower
        or "profile" in text_lower
    ):

        strengths.append(
            "Professional summary or objective found."
        )

        score += 10

    else:

        improvements.append(
            "Add a professional summary or career objective."
        )

    # ========================================================
    # AI RESUME FEEDBACK
    # ========================================================

    ai_feedback = ""

    try:

        prompt = f"""
You are an expert professional resume reviewer.

Analyze the following resume:

{resume_text}

Provide practical feedback for a student or job seeker.

Use this format:

Overall Feedback:
...

Strengths:
- ...
- ...
- ...

Areas to Improve:
- ...
- ...
- ...

ATS Suggestions:
- ...
- ...
- ...
"""

        response = client.responses.create(
            model="gpt-5.6-luna",
            input=prompt
        )

        ai_feedback = response.output_text

    except Exception as error:

        print(
            "AI analysis error:",
            error
        )

        ai_feedback = (
            "AI analysis could not be completed. "
            "Please check your API configuration."
        )

    return {
        "message":
            "Resume analyzed successfully!",

        "filename":
            file.filename,

        "score":
            score,

        "strengths":
            strengths,

        "improvements":
            improvements,

        "text":
            resume_text,

        "ai_feedback":
            ai_feedback
    }


    # --------------------------------------------------------
    # WORD COUNT
    # --------------------------------------------------------

    word_count = len(
        resume_text.split()
    )

    if word_count >= 100:

        strengths.append(
            "Resume contains sufficient content."
        )

        score += 15

    else:

        improvements.append(
            "Add more relevant details to your resume."
        )


    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    if (
        "mail" in text_lower
        or "@" in text_lower
    ):

        strengths.append(
            "Email contact information found."
        )

        score += 10

    else:

        improvements.append(
            "Add a professional email address."
        )


    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    if "education" in text_lower:

        strengths.append(
            "Education section found."
        )

        score += 15

    else:

        improvements.append(
            "Add an Education section."
        )


    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    if (
        "skills" in text_lower
        or "technical skills" in text_lower
    ):

        strengths.append(
            "Skills section found."
        )

        score += 15

    else:

        improvements.append(
            "Add a Skills section."
        )


    # --------------------------------------------------------
    # EXPERIENCE
    # --------------------------------------------------------

    if (
        "experience" in text_lower
        or "internship" in text_lower
    ):

        strengths.append(
            "Experience information found."
        )

        score += 15

    else:

        improvements.append(
            "Add internship or work experience."
        )


    # --------------------------------------------------------
    # PROJECTS
    # --------------------------------------------------------

    if (
        "projects" in text_lower
        or "project" in text_lower
    ):

        strengths.append(
            "Projects section found."
        )

        score += 10

    else:

        improvements.append(
            "Add relevant projects."
        )


    # --------------------------------------------------------
    # CERTIFICATIONS
    # --------------------------------------------------------

    if (
        "certification" in text_lower
        or "certifications" in text_lower
    ):

        strengths.append(
            "Certifications section found."
        )

        score += 10

    else:

        improvements.append(
            "Add relevant certifications if available."
        )


    # --------------------------------------------------------
    # SUMMARY / OBJECTIVE
    # --------------------------------------------------------

    if (
        "objective" in text_lower
        or "summary" in text_lower
        or "profile" in text_lower
    ):

        strengths.append(
            "Professional summary or objective found."
        )

        score += 10

    else:

        improvements.append(
            "Add a professional summary or career objective."
        )


    # ========================================================
    # AI RESUME FEEDBACK
    # ========================================================

    ai_feedback = ""

    try:

        prompt = f"""
You are an expert professional resume reviewer.

Analyze the following resume:

{resume_text}

Provide practical feedback for a student or job seeker.

Use this format:

Overall Feedback:
...

Strengths:
- ...
- ...
- ...

Areas to Improve:
- ...
- ...
- ...

ATS Suggestions:
- ...
- ...
- ...
"""

        response = client.responses.create(
            model="gpt-5.6-luna",
            input=prompt
        )

        ai_feedback = response.output_text

    except Exception as error:

        print(
            "AI analysis error:",
            error
        )

        ai_feedback = (
            "AI analysis could not be completed. "
            "Please check your API configuration."
        )


    return {
        "message":
            "Resume analyzed successfully!",

        "filename":
            file.filename,

        "score":
            score,

        "strengths":
            strengths,

        "improvements":
            improvements,

        "text":
            resume_text,

        "ai_feedback":
            ai_feedback
    }


# ============================================================
# ATS CHECKER
# ============================================================

@app.post("/ats-check")
async def ats_check(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    current_user_id: int = Depends(get_current_user)
):
    """
    Local ATS checker.
    This version does not call the OpenAI API.
    """

    file_content = await file.read()

    try:
        resume_text = extract_resume_text(
            file_content,
            file.filename
        )
    except ValueError as error:
        return {
            "message": str(error),
            "score": 0,
            "matchedKeywords": [],
            "missingKeywords": [],
            "suggestions": []
        }

    if not resume_text.strip():
        return {
            "message": "Could not extract text from the resume.",
            "score": 0,
            "matchedKeywords": [],
            "missingKeywords": [],
            "suggestions": []
        }

    if not job_description.strip():
        return {
            "message": "Job description cannot be empty.",
            "score": 0,
            "matchedKeywords": [],
            "missingKeywords": [],
            "suggestions": []
        }

    known_keywords = [
        "python", "java", "javascript", "typescript", "react",
        "react.js", "node.js", "html", "css", "sql", "mysql",
        "postgresql", "mongodb", "fastapi", "django", "flask",
        "rest api", "rest apis", "api", "git", "github", "docker",
        "aws", "azure", "machine learning", "deep learning",
        "artificial intelligence", "ai", "data analysis",
        "data science", "pandas", "numpy", "scikit-learn",
        "tensorflow", "pytorch", "power bi", "excel",
        "communication", "problem-solving", "problem solving",
        "leadership", "teamwork", "time management",
        "project management", "c", "c++", "kotlin", "android",
        "flutter", "figma", "bootstrap", "tailwind", "spring boot",
        ".net", "linux", "agile", "scrum"
    ]

    resume_lower = resume_text.lower()
    job_lower = job_description.lower()

    def keyword_present(keyword, text):
        if keyword in ["c", "c++"]:
            return re.search(
                r"(?<![a-z0-9])" + re.escape(keyword) + r"(?![a-z0-9])",
                text
            ) is not None
        return keyword.lower() in text

    job_keywords = []

    for keyword in known_keywords:
        if keyword_present(keyword, job_lower):
            if keyword not in job_keywords:
                job_keywords.append(keyword)

    matched_keywords = []
    missing_keywords = []

    for keyword in job_keywords:
        if keyword_present(keyword, resume_lower):
            matched_keywords.append(keyword)
        else:
            missing_keywords.append(keyword)

    if job_keywords:
        score = round(
            (len(matched_keywords) / len(job_keywords)) * 100
        )
    else:
        score = 0

    score = max(0, min(100, score))

    suggestions = []

    if missing_keywords:
        suggestions.append(
            "Consider adding relevant experience, projects, or skills "
            "related to: " + ", ".join(missing_keywords[:8]) + "."
        )

    if score < 50:
        suggestions.append(
            "Improve keyword alignment by naturally including important "
            "skills from the job description in relevant resume sections."
        )
    elif score < 80:
        suggestions.append(
            "Your resume has several matching keywords. Add missing "
            "job-related skills where they are genuinely supported by "
            "your experience."
        )
    else:
        suggestions.append(
            "Your resume contains strong keyword alignment with this "
            "job description. Keep the keywords relevant and supported "
            "by your actual experience."
        )

    if len(resume_text.split()) < 100:
        suggestions.append(
            "Add more specific details about your projects, experience, "
            "technical skills, and achievements."
        )

    return {
        "message": "ATS analysis completed successfully!",
        "score": score,
        "matchedKeywords": matched_keywords,
        "missingKeywords": missing_keywords,
        "suggestions": suggestions
    }


# ============================================================
# INTERVIEW QUESTION GENERATOR
# ============================================================

@app.post("/generate-interview-questions")
async def generate_interview_questions(
    job_role: str = Form(...),
    experience_level: str = Form(...),
    job_description: str = Form(...),
    current_user_id: int = Depends(get_current_user)
):
    """
    Local interview-question generator.
    Works without OpenAI API credits.
    """

    job_role = job_role.strip()
    experience_level = experience_level.strip()
    job_description = job_description.strip()

    if not job_role:
        return {
            "message": "Job role cannot be empty.",
            "questions": []
        }

    if not experience_level:
        return {
            "message": "Experience level cannot be empty.",
            "questions": []
        }

    if not job_description:
        return {
            "message": "Job description cannot be empty.",
            "questions": []
        }

    description_lower = job_description.lower()
    role_lower = job_role.lower()

    known_skills = [
        "python", "java", "javascript", "typescript", "react",
        "sql", "postgresql", "mysql", "mongodb", "fastapi",
        "django", "flask", "rest api", "rest apis", "git",
        "github", "docker", "aws", "azure", "html", "css",
        "pandas", "numpy", "machine learning", "deep learning",
        "artificial intelligence", "data analysis", "kotlin",
        "android", "flutter", "c++", "c", "spring boot",
        "power bi", "excel"
    ]

    detected_skills = [
        skill for skill in known_skills
        if skill in description_lower or skill in role_lower
    ]

    primary_skill = detected_skills[0] if detected_skills else job_role
    secondary_skills = detected_skills[1:4]

    questions = [
        f"For the {job_role} role, how would you explain your experience and interest in this position?",
        f"What are the key concepts of {primary_skill} that a {experience_level.lower()} candidate should understand?",
        f"Describe a project where you used {primary_skill}. What was your role and what did you achieve?",
        f"How would you solve a technical problem related to {primary_skill} when your first approach does not work?",
        f"What are some common mistakes developers make when working with {primary_skill}, and how can they be avoided?"
    ]

    if secondary_skills:
        questions.append(
            f"How would you use {secondary_skills[0]} together with {primary_skill} in a real-world project?"
        )
    else:
        questions.append(
            f"What tools or technologies would you normally use with {primary_skill} in a real-world project?"
        )

    if len(secondary_skills) >= 2:
        questions.append(
            f"Explain how {secondary_skills[1]} could be used in the kind of project described in the job requirements."
        )
    else:
        questions.append(
            "How do you test and debug your code before considering a feature complete?"
        )

    questions.extend([
        "Tell me about a difficult problem you faced in a project and how you solved it.",
        "How do you communicate technical problems or project updates to teammates?",
        f"Why do you think your skills and experience are suitable for this {job_role} position?"
    ])

    return {
        "message": "Interview questions generated successfully!",
        "questions": questions[:10]
    }

# ============================================================
# MOCK INTERVIEW ANSWER EVALUATION
# ============================================================

@app.post("/evaluate-interview-answer")
async def evaluate_interview_answer(
    job_role: str = Form(...),
    experience_level: str = Form(...),
    question: str = Form(...),
    answer: str = Form(...),
    current_user_id: int = Depends(get_current_user)
):
    """
    Local mock-interview answer evaluator.
    Works without OpenAI API credits.
    """

    job_role = job_role.strip()
    experience_level = experience_level.strip()
    question = question.strip()
    answer = answer.strip()

    if not job_role:
        return {
            "message": "Job role cannot be empty.",
            "score": 0,
            "feedback": "",
            "strengths": [],
            "improvements": []
        }

    if not experience_level:
        return {
            "message": "Experience level cannot be empty.",
            "score": 0,
            "feedback": "",
            "strengths": [],
            "improvements": []
        }

    if not question:
        return {
            "message": "Interview question cannot be empty.",
            "score": 0,
            "feedback": "",
            "strengths": [],
            "improvements": []
        }

    if not answer:
        return {
            "message": "Answer cannot be empty.",
            "score": 0,
            "feedback": "",
            "strengths": [],
            "improvements": []
        }

    answer_lower = answer.lower()
    word_count = len(answer.split())

    strengths = []
    improvements = []

    if word_count >= 80:
        strengths.append("The answer provides a good amount of detail.")
    elif word_count >= 40:
        strengths.append("The answer provides a reasonable level of detail.")
    else:
        improvements.append(
            "Provide more detail and explain your reasoning clearly."
        )

    if any(word in answer_lower for word in [
        "project", "experience", "internship", "developed", "built"
    ]):
        strengths.append(
            "The answer includes practical experience or project context."
        )
    else:
        improvements.append(
            "Include a relevant project, internship, or practical example "
            "when possible."
        )

    if any(word in answer_lower for word in [
        "because", "therefore", "reason", "approach", "solution"
    ]):
        strengths.append(
            "The answer explains reasoning or an approach."
        )
    else:
        improvements.append(
            "Explain why you chose your approach, not only what you did."
        )

    if any(word in answer_lower for word in [
        "python", "sql", "react", "fastapi", "postgresql", "java",
        "javascript", "api", "git", "database", "testing", "debug"
    ]):
        strengths.append(
            "The answer includes relevant technical terminology."
        )
    else:
        improvements.append(
            "Where appropriate, mention the specific technologies or "
            "technical concepts involved."
        )

    if any(word in answer_lower for word in [
        "result", "achieved", "improved", "completed", "increased",
        "reduced", "success"
    ]):
        strengths.append(
            "The answer describes an outcome or result."
        )
    else:
        improvements.append(
            "End with the result, outcome, or what you learned."
        )

    score = 40

    if word_count >= 40:
        score += 10

    if word_count >= 80:
        score += 10

    if any(word in answer_lower for word in [
        "project", "experience", "internship", "developed", "built"
    ]):
        score += 10

    if any(word in answer_lower for word in [
        "because", "therefore", "reason", "approach", "solution"
    ]):
        score += 10

    if any(word in answer_lower for word in [
        "python", "sql", "react", "fastapi", "postgresql", "java",
        "javascript", "api", "git", "database", "testing", "debug"
    ]):
        score += 5

    if any(word in answer_lower for word in [
        "result", "achieved", "improved", "completed", "increased",
        "reduced", "success"
    ]):
        score += 5

    score = min(100, score)

    if score >= 80:
        feedback = (
            f"Your answer is strong for a {experience_level.lower()} "
            f"{job_role} candidate. It is detailed and includes useful "
            "supporting information."
        )
    elif score >= 60:
        feedback = (
            "Your answer has a good foundation. Make it stronger by "
            "adding a specific example, technical details, and a clear result."
        )
    else:
        feedback = (
            "Your answer needs more detail. Try using the STAR structure "
            "(Situation, Task, Action, Result) and include a specific example."
        )

    return {
        "message": "Interview answer evaluated successfully!",
        "score": score,
        "feedback": feedback,
        "strengths": strengths[:4],
        "improvements": improvements[:4]
    }


# ============================================================
# DELETE RESUME
# ============================================================

@app.delete("/resume/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user_id: int = Depends(get_current_user)
):
    try:
        with engine.connect() as connection:
            owner = connection.execute(
                text("""
                    SELECT user_id
                    FROM resumes
                    WHERE id = :resume_id
                """),
                {"resume_id": resume_id}
            ).fetchone()

            if owner is None:
                return {"message": "Resume not found."}

            if owner.user_id != current_user_id:
                raise HTTPException(
                    status_code=403,
                    detail="You are not allowed to delete this resume."
                )

            connection.execute(
                text("""
                    DELETE FROM resumes
                    WHERE id = :resume_id
                      AND user_id = :user_id
                """),
                {
                    "resume_id": resume_id,
                    "user_id": current_user_id
                }
            )
            connection.commit()

        return {
            "message": "Resume deleted successfully!",
            "resume_id": resume_id
        }

    except HTTPException:
        raise
    except Exception as error:
        print("Delete resume error:", error)
        return {
            "message": "Failed to delete resume.",
            "error": str(error)
        }


