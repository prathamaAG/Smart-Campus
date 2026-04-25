# Smart Campus

A full-stack academic management platform that combines:

- Automated lecture scheduling with intelligent venue allocation
- AI-powered assignment processing from DOCX uploads using Google Gemini
- Role-based workflows for Admin, Faculty, and Students

The project includes a React frontend and a Node.js/Express + MongoDB backend in a single repository.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Features](#core-features)
3. [System Architecture](#system-architecture)
4. [Tech Stack](#tech-stack)
5. [Repository Structure](#repository-structure)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [Available Scripts](#available-scripts)
9. [API Overview](#api-overview)
10. [AI Assignment Processing Flow](#ai-assignment-processing-flow)
11. [User Roles and Permissions](#user-roles-and-permissions)
12. [Troubleshooting](#troubleshooting)
13. [Future Improvements](#future-improvements)
14. [License](#license)

---

## Project Overview

Smart Campus is designed to streamline academic operations across scheduling, assignments, announcements, and task tracking.

It provides:

- Centralized management for subjects, users, lectures, and announcements
- Faculty-driven assignment publication and grading workflows
- Student assignment submission and schedule visibility
- AI-generated academic solution documents from uploaded DOCX files

The platform is split into:

- **Frontend**: React application for Admin, Faculty, and Student dashboards
- **Backend**: REST API with JWT authentication, MongoDB persistence, file uploads, and Gemini integration

---

## Core Features

### 1) Intelligent Lecture Scheduling

- Faculty/Admin can schedule lectures
- Schedule data is organized for upcoming and role-specific views
- Venue allocation is automated in the scheduling workflow to reduce conflicts and manual effort

### 2) AI Assignment Processing with Google Gemini

- Accepts DOCX assignment uploads
- Extracts document text
- Sends structured prompt to Gemini for academic-quality solutions
- Generates downloadable DOCX solution output

### 3) Assignment and Submission Management

- Faculty can create assignments (DOCX upload)
- Students can submit assignment solutions (DOCX upload)
- Faculty can review and grade submissions

### 4) Role-Based Access and Dashboards

- Roles: **Admin**, **Faculty**, **Student**
- JWT-protected routes
- Route-level authorization checks based on role

### 5) Academic Operations

- Subject creation and faculty-subject mapping
- Announcements CRUD
- Activity feed for administrative tracking
- Personal task management

---

## System Architecture

### Frontend (React)

- Uses Axios client with JWT token interceptor
- Uses React Router for protected route navigation
- Includes dedicated pages/components for each role

### Backend (Node.js/Express)

- REST API under `/api/*`
- MongoDB with Mongoose models
- Multer-based DOCX upload handling
- JWT auth middleware (`protect`, `authorize`)
- Gemini integration for solution generation

### Data and File Flow

1. User authenticates and receives JWT
2. Frontend stores token and sends it via `Authorization: Bearer <token>`
3. Backend validates token and user role
4. File uploads are stored/read from `Backend/uploads/`
5. AI-generated solution files are persisted and served through secure download routes

---

## Tech Stack

### Frontend

- React 19
- React Router DOM
- Axios
- Material UI
- Framer Motion
- ApexCharts / React ApexCharts
- React Big Calendar

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Multer
- Google Gemini SDK (`@google/generative-ai`)
- Mammoth / DOCX utilities

---

## Repository Structure

```text
smart-scheduler-final/
  Backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    uploads/
    utils/
    server.js
    package.json

  frontend/
    public/
    src/
      api/
      components/
      context/
      hooks/
      pages/
      styles/
    package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local instance or MongoDB Atlas)
- Google Gemini API key

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd smart-scheduler-final
```

### 2) Install backend dependencies

```bash
cd Backend
npm install
```

### 3) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4) Configure environment files

Create these files:

- `Backend/.env`
- `frontend/.env`

Use the templates in the [Environment Variables](#environment-variables) section.

### 5) Start backend server

```bash
cd Backend
npm run dev
```

Backend runs on: `http://localhost:5000`

### 6) Start frontend app (new terminal)

```bash
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

---

## Environment Variables

### Backend (`Backend/.env`)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-campus
JWT_SECRET=your_super_secure_jwt_secret
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_google_gemini_api_key
```

### Frontend (`frontend/.env`)

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Notes:

- In development, backend CORS allows `http://localhost:3000` by default.
- In production mode, backend CORS uses `CLIENT_URL`.

---

## Available Scripts

### Backend (`Backend/package.json`)

- `npm run dev` - start backend with nodemon
- `npm start` - start backend with node
- `npm test` - placeholder test script

### Frontend (`frontend/package.json`)

- `npm start` - start React dev server
- `npm run build` - create production build
- `npm test` - run tests

---

## API Overview

Base URL (local): `http://localhost:5000/api`

### Authentication

- `POST /auth/register` - register user
- `POST /auth/login` - login user
- `GET /auth/profile` - authenticated profile

### Users (Admin-focused)

- `GET /users` - list users
- `GET /users/faculty` - list faculty
- `GET /users/students` - list students
- `PUT /users/profile` - update own profile
- `GET /users/me` - current user
- `PATCH /users/:id` - update user (Admin)
- `DELETE /users/:id` - delete user (Admin)
- `PUT /users/faculty/:id/subjects` - map faculty subjects (Admin)

### Subjects

- `POST /subjects` - create subject (Admin)
- `GET /subjects` - get subjects
- `POST /subjects/assign` - assign subject to faculty (Admin)
- `POST /subjects/remove-faculty` - remove faculty mapping (Admin)
- `PUT /subjects/:id` - update subject (Admin)
- `DELETE /subjects/:id` - delete subject (Admin)

### Lectures

- `POST /lectures` - create lecture (Faculty/Admin)
- `GET /lectures` - get lectures
- `DELETE /lectures/:id` - delete lecture (Faculty/Admin)
- `GET /lectures/faculty/upcoming` - faculty upcoming lectures
- `GET /lectures/faculty/:facultyId/upcoming` - faculty upcoming by id
- `GET /lectures/student` - student lectures

### Assignments

- `POST /assignments` - create assignment with DOCX (Faculty)
- `GET /assignments` - list assignments
- `GET /assignments/:id` - get assignment details
- `DELETE /assignments/:id` - delete assignment (Faculty)
- `GET /assignments/download/:id` - download original assignment file

### Submissions

- `POST /submissions/assignments/:id/submit` - student submission (DOCX)
- `GET /submissions/faculty/submissions` - faculty submission list
- `PUT /submissions/assignments/:assignmentId/submissions/:submissionId/grade` - grade submission (Faculty)
- `GET /submissions/download/:assignmentId/:submissionId` - download submission (Faculty)

### AI Solver and Question Generation

- `GET /solver/test` - health/test route
- `POST /solver/process` - upload DOC/DOCX and generate AI solution
- `GET /solver/download/:filename` - download generated solution file
- `POST /questions/generate/:assignmentId/:submissionId` - generate viva/review questions from submission (Faculty)

### Announcements and Activities

- `GET /announcements` - get announcements
- `POST /announcements` - create announcement (Admin)
- `PUT /announcements/:id` - update announcement (Admin)
- `DELETE /announcements/:id` - delete announcement (Admin)
- `GET /activities` - latest activities (Admin)

### Tasks

- `GET /tasks` - list tasks
- `POST /tasks` - create task
- `PUT /tasks/:id` - update task status
- `DELETE /tasks/:id` - delete task

---

## AI Assignment Processing Flow

The AI workflow in the backend follows this sequence:

1. Validate uploaded file and metadata (`paperType`, `paperTitle`)
2. Extract text content from DOCX
3. Build a structured academic prompt based on document type
4. Generate response from Google Gemini model
5. Build a polished DOCX solution document
6. Save output file and return a secure download URL

Supported paper types include:

- Assignment
- Question Paper
- Research Paper
- Case Study
- Project Report

---

## User Roles and Permissions

### Admin

- Manage users
- Manage subjects and faculty assignments
- Publish and manage announcements
- View platform activity logs

### Faculty

- Schedule lectures
- Post assignments
- View and grade student submissions
- Generate questions from submissions

### Student

- View lectures and assignments
- Submit assignment files
- Use AI solver flow where enabled by application workflow

---

## Troubleshooting

### Backend fails to start

- Check `MONGO_URI` and database connectivity
- Check `JWT_SECRET` is present
- Ensure `PORT` is free

### Gemini errors during AI processing

- Verify `GEMINI_API_KEY`
- Confirm API quota/limits in your Google AI project
- Retry if service reports temporary overload

### Upload issues

- Only DOCX files are accepted in assignment/submission routes
- Check max file size (10 MB)
- Ensure upload directories exist and are writable

### CORS or auth token issues

- Confirm frontend URL matches backend CORS config
- Confirm frontend sends `Authorization: Bearer <token>`
- Validate `REACT_APP_API_BASE_URL`

---

## Future Improvements

- Conflict-aware venue optimization dashboard
- Calendar sync integration (Google/Microsoft)
- Better analytics for assignment quality and outcomes
- Background queue for long AI processing tasks
- Comprehensive automated test coverage (unit/integration/e2e)

---

## License

This project is currently unlicensed for public redistribution.

If you plan to open-source it, add a license file (for example: MIT).
