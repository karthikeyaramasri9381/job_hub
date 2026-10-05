# JobHub - Modern Full-Stack Recruitment Platform

[![Backend](https://img.shields.io/badge/Backend-Django_5.2_DRF-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React_19_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-02E079?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Storage](https://img.shields.io/badge/Storage-Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

JobHub is a production-grade, full-stack online recruitment and career management platform built with a Django REST Framework backend and a React.js (Vite) single-page application frontend. Connected to a serverless Neon PostgreSQL database, JobHub provides robust multi-role capabilities for Job Seekers (Candidates), Hiring Teams (Recruiters), and Platform Administrators.

---

## 🌟 Key Features

### 👤 User Authentication & Role Management
- **Multi-Role RBAC**: Built-in support for `CANDIDATE`, `RECRUITER`, and `ADMIN` user roles.
- **JWT Authentication**: Secure authentication powered by `django-rest-framework-simplejwt` with automatic token refresh via Axios response interceptors.
- **Google One-Tap / Sign-In Integration**: Server-side verification of Google Identity Services (GIS) ID tokens via `google.oauth2.id_token`.

### 💼 Candidate Features
- **Job Discovery & Search**: Full-text keyword search with location, employment type, category filters, and pagination.
- **1-Click Application Workflow**: Quick application process with cover letter submission and PDF resume upload to Cloudinary (5MB limit validation).
- **Application Tracking**: Real-time tracking of application statuses (`APPLIED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `HIRED`, `REJECTED`, `WITHDRAWN`).
- **Saved Jobs**: Bookmark favorite job postings with database-level uniqueness.
- **Interview Hub**: Interactive schedule view displaying virtual meeting links, dates, times, and recruiter notes.

### 🏢 Recruiter Features
- **Company Management**: Dedicated company profile setup and branding.
- **Job Lifecycle Management**: Post, update, publish, and close job postings.
- **Applicant Pipeline & Status Update**: Detailed applicant reviews, resume access via Cloudinary CDN, and status transitions.
- **Interview Scheduling**: Integrated scheduler to send interview invitations with virtual links (Google Meet/Zoom) or in-person location details.

### 🛡️ Admin Management
- **Platform Analytics**: Dynamic statistics dashboard tracking system users, published jobs, and job application metrics.
- **Governance**: Overview and management endpoints for users and active job postings.

---

## 🏗️ Architecture & Technology Stack

```mermaid
graph TD
    Client["React 19 Frontend (Vite + React Router)"]
    API["Django 5.2 REST Framework Backend"]
    DB[("Neon Cloud PostgreSQL")]
    Cloudinary[("Cloudinary CDN (Resumes)")]
    GoogleAuth["Google Identity Services"]

    Client -->|REST API Requests / JWT| API
    Client -->|Google ID Token| GoogleAuth
    API -->|Google Token Verification| GoogleAuth
    API -->|Queries & Transactions| DB
    API -->|PDF Uploads & CDN URLs| Cloudinary
```

| Layer | Technologies |
| :--- | :--- |
| **Backend Framework** | Python 3.10+, Django 5.2, Django REST Framework |
| **Authentication** | SimpleJWT (JWT Access/Refresh tokens), Google Identity Services |
| **Database** | Neon Cloud Serverless PostgreSQL (`psycopg2-binary`, `dj-database-url`) |
| **Media Storage** | Cloudinary Storage Engine (`django-cloudinary-storage`) |
| **Frontend Framework** | React 19, Vite 8, React Router v7 |
| **HTTP Client** | Axios (with auto token refresh interceptors) |
| **Styling & UI** | Custom CSS Design System, Lucide React Icons |

---

## 🔌 API Endpoints Overview

### Authentication (`/api/accounts/`)
- `POST /api/accounts/register/` - Register a new Candidate or Recruiter
- `POST /api/accounts/token/` - Obtain JWT token pair (Email & Password)
- `POST /api/accounts/token/refresh/` - Refresh expired access token
- `POST /api/accounts/google/` - Authenticate via Google ID token
- `POST /api/accounts/logout/` - Blacklist refresh token & logout
- `GET /api/accounts/profile/` - Fetch authenticated user profile

### Jobs (`/api/jobs/`)
- `GET /api/jobs/` - Public paginated job search & filter list
- `GET /api/jobs/<id>/` - Public job details view
- `POST /api/jobs/recruiter/jobs/` - Create a new job posting (Recruiter)
- `PUT/PATCH /api/jobs/recruiter/jobs/<id>/` - Edit job posting (Recruiter)
- `POST /api/jobs/recruiter/jobs/<id>/publish/` - Publish job (Recruiter)
- `POST /api/jobs/recruiter/jobs/<id>/close/` - Close job posting (Recruiter)
- `POST /api/jobs/saved/toggle/<job_id>/` - Save/unsave job bookmark (Candidate)
- `GET /api/jobs/saved/` - List saved jobs (Candidate)

### Applications (`/api/applications/`)
- `POST /api/applications/apply/<job_id>/` - Submit application (Candidate)
- `GET /api/applications/candidate/` - Track submitted applications (Candidate)
- `POST /api/applications/withdraw/<id>/` - Withdraw job application (Candidate)
- `GET /api/applications/recruiter/job/<job_id>/` - View applicants for job (Recruiter)
- `PATCH /api/applications/recruiter/<id>/status/` - Update application status (Recruiter)

### Interviews (`/api/interviews/`)
- `POST /api/interviews/schedule/` - Schedule interview for applicant (Recruiter)
- `GET /api/interviews/candidate/` - View scheduled interviews (Candidate)
- `GET /api/interviews/recruiter/` - View managed interviews (Recruiter)

### Admin (`/api/accounts/admin/`)
- `GET /api/accounts/admin/stats/` - Platform summary metrics
- `GET /api/accounts/admin/users/` - View all platform users
- `GET /api/accounts/admin/jobs/` - View all system jobs

---

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- PostgreSQL database (or Neon Cloud PostgreSQL URL)

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/your-username/jobhub.git
cd jobhub/backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file in backend/ directory
cat <<EOT > .env
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=postgresql://user:password@host/neondb?sslmode=require
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EOT

# Apply Database Migrations
python manage.py migrate

# Create Admin Superuser
python manage.py createsuperuser

# Start Django Development Server
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing Guide

### Running Backend Unit Tests
The Django test runner automatically uses an in-memory SQLite database during unit tests for speed and isolation:
```bash
cd backend
python manage.py test accounts profiles companies jobs applications interviews
```

### Verifying Frontend Build
```bash
cd frontend
npm run build
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
