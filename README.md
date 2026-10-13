# Kishor Kumar — Data Analyst Portfolio & Admin CMS Website

A modern, high-performance **Data Analyst Portfolio Website with a Secure Admin CMS**, built for **Kishor Kumar**. It features two distinct access modes: a fast, public-facing portfolio with zero edit controls for recruiters/visitors, and a protected, server-authenticated **Admin Dashboard** allowing the administrator to manage every visible text, project, key point, resume, and image without touching source code.

---

## 🌟 Key Features & Upgrades

### 1. Two Separate Access Modes
- **Public Viewer Access (`/`)**:
  - Completely accessible without login.
  - Zero admin controls, edit buttons, or draft content visible.
  - Recruiter-friendly: direct links to GitHub repositories, Power BI dashboards, live demos, and resume downloads.
  - Fast rendering powered by the persistent content API with seamless static fallback.
- **Admin Access (`/admin`)**:
  - Secure server-side authentication using **JWT in httpOnly secure cookies** and **bcrypt** password hashing.
  - Rate-limited login endpoint (`10 requests / 15 minutes`) protecting against brute force.
  - Protected API routes — unauthorized visitors cannot create, edit, or delete content or upload files via direct API calls.
  - Session verification endpoint (`/api/auth/me`) and secure logout.

### 2. Complete Content Management System (CMS)
Every visible text element on the portfolio is editable from the Admin Dashboard:
- Website brand name, logo badge initials, and navbar labels.
- Hero status badge, heading, professional title, short bio, chips, and CTA button labels.
- About Me section: heading, lead subtitle, and paragraphs.
- **Professional Experience section**: Job titles, company names, employment dates, descriptions, and bullet achievements.
- **Skills section**: Categorized skills (Programming & Analytics, Data Visualization, Analytics & Methodology) with proficiency badges.
- Website section headings and supporting subtitles.
- Contact section heading, copy, direct email, location, and social profile links.
- Footer copyright and tagline text.
- SEO meta tags: Browser page title, meta description, keywords, and OpenGraph social image.

### 3. Advanced Project Management
- Add, edit, duplicate, reorder, publish/unpublish, and permanently delete projects.
- Fields: Title, short description, detailed description, category dropdown (Python / SQL / Power BI / Other), technology stack tags, project overview, key findings, business impact, thumbnail/cover image, featured toggle, display order, and published/draft toggle.
- **Repeatable Key Points Editor**:
  - Add individual key points one by one without editing large blocks of text.
  - Edit, reorder (Move Up / Down), and delete points individually.
  - Displayed on the public portfolio as clean, structured bullet lists.
- **Strict Link Guard Rails & Testing**:
  - Real-time URL validation for GitHub, Live Demo, and Dashboard URLs.
  - **"Test Link"** button inside the dashboard to verify URLs before saving.
  - Public project buttons only render when valid URLs are configured — **zero fake links or placeholder repositories**.

### 4. Resume Management System
- **Option A: Drag & Drop**: Drag documents onto the upload zone.
- **Option B: File Picker**: Choose PDF, DOC, or DOCX documents from your computer (server-validated, max 15MB).
- **Option C: Google Drive Picker Integration**: Official Google Picker API & Google Identity Services integration to select documents directly from Google Drive.
- **Active Document Designation**: One active resume is designated at a time. Switching or uploading an active resume automatically updates the public **"Download Resume"** and **"View Resume"** buttons.
- **Controlled Streaming Endpoints**:
  - `/api/resume/download`: Streams active resume with `Content-Disposition: attachment`.
  - `/api/resume/preview`: Streams active resume with `Content-Disposition: inline` for browser viewing.

### 5. Media Library
- Upload profile photos, project screenshots, and dashboard previews (JPG, JPEG, PNG, WebP, SVG; max 10MB).
- Image gallery with copy-to-clipboard public URLs and permanent deletion controls.

### 6. Draft vs. Published Workflow
- Edit sections and projects in draft mode without immediately affecting the live website.
- Header status badge displays **"Draft Changes Pending"** when unsaved changes exist.
- One-click **"Publish Changes"** action promotes all drafts to the live public site.

---

## 📂 Project Architecture

```
portfolio/
├── .env                         # Active environment configuration (never commit real secrets)
├── .env.example                 # Configuration template with placeholders
├── package.json                 # Node dependencies & scripts
├── server.js                    # Express application entrypoint with security middleware
├── test_workflow.js             # Automated end-to-end test suite (25/25 tests passing)
│
├── server/
│   ├── database.js              # Persistent atomic JSON database engine with seed fallback
│   ├── auth.js                  # JWT authentication, bcrypt hashing, and httpOnly cookie security
│   ├── upload.js                # Multer file upload handler with strict MIME & size validators
│   └── routes/
│       ├── auth.routes.js       # /api/auth/login, /api/auth/me, /api/auth/logout
│       ├── content.routes.js    # /api/public/content, /api/admin/content, /api/admin/publish
│       ├── projects.routes.js   # /api/admin/projects CRUD, duplicate, reorder, toggle-publish
│       ├── resume.routes.js     # /api/resume/download, /api/resume/preview, upload, drive import
│       └── media.routes.js      # /api/admin/media/upload, list, and delete
│
├── data/
│   └── portfolio_db.json        # Persistent JSON database (atomic writes via .tmp rename)
│
├── uploads/
│   ├── resumes/                 # Persistent storage for uploaded resumes
│   └── images/                  # Persistent storage for uploaded photos and screenshots
│
├── assets/
│   ├── Kishor_Kumar_Resume.pdf  # Starter placeholder resume PDF
│   └── README.md                # Assets guide
│
├── css/
│   ├── style.css                # Public website theme (preserved blue-gradient aesthetic)
│   └── admin.css                # Admin dashboard theme (responsive sidebar, dark analytics UI)
│
├── js/
│   ├── config.js                # Default fallback configuration
│   ├── app.js                   # Public website controller (live API fetch + dynamic rendering)
│   └── admin.js                 # Admin dashboard controller (auth, CMS forms, modals, toasts)
│
├── index.html                   # Public viewer website
└── admin.html                   # Admin CMS dashboard
```

---

## ⚙️ Environment Variables Configuration

Create a `.env` file in the project root (copied from `.env.example`):

```env
# Server Port & Environment
PORT=3000
NODE_ENV=development

# Authorized Administrator Credentials
ADMIN_EMAIL=admin@kishorkumar.dev
ADMIN_PASSWORD=Kishor@Analytics2026!

# JWT Session Security Secret (Use a strong random 64-char string in production)
AUTH_SECRET=kk_portfolio_auth_secret_token_change_in_production_2026_xyz

# Persistent Uploads Directory
UPLOADS_DIR=./uploads

# Optional: Google Drive Picker API Integration
GOOGLE_CLIENT_ID=
GOOGLE_API_KEY=
GOOGLE_APP_ID=
```

---

## 🔑 Administrator Login Credentials

- **Admin Login Page**: `http://localhost:3000/admin`
- **Default Email**: `admin@kishorkumar.dev` (or whatever you set in `ADMIN_EMAIL`)
- **Default Password**: `Kishor@Analytics2026!` (or whatever you set in `ADMIN_PASSWORD`)

> **Security Note**: On first server startup or whenever you update `ADMIN_PASSWORD` in `.env`, the database automatically re-hashes the password using `bcrypt` (10 rounds). Passwords are never stored in plaintext.

---

## ☁️ Google Drive & Google Picker API Setup

To enable importing resumes directly from Google Drive without downloading them to your computer first:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and enable:
   - **Google Drive API**
   - **Google Picker API**
3. Under **APIs & Services > Credentials**:
   - Create an **API Key** (restrict to your website domain or localhost).
   - Create an **OAuth 2.0 Client ID** (Application type: *Web Application*).
   - Add Authorized JavaScript Origins: `http://localhost:3000` (and your production domain).
4. Paste the credentials into your `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_API_KEY=your_api_key
   ```
5. Click **"Choose from Drive"** in the Resume Manager to launch the picker!

---

## 💻 Local Development Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Application Server
```bash
npm start
# or
node server.js
```
The server will run at:
- **Public Website**: `http://localhost:3000`
- **Admin Dashboard**: `http://localhost:3000/admin`

### 3. Run Automated End-to-End Test Suite
```bash
npm test
# or
node test_workflow.js
```
Executes all 25 automated integration tests validating public routes, admin authentication, protected endpoints, project CRUD, key points, draft isolation, publishing, and resume streaming.

---

## 🚀 Production Deployment Instructions

### Deploy to Node.js Hosts (Render, Railway, DigitalOcean, Heroku)
1. Commit the repository to GitHub.
2. Link the repository to your host.
3. Configure the **Build Command**: `npm install`
4. Configure the **Start Command**: `npm start`
5. Set environment variables in the host dashboard:
   - `NODE_ENV=production`
   - `ADMIN_EMAIL=your-real-email@domain.com`
   - `ADMIN_PASSWORD=YourStrongPassword123!`
   - `AUTH_SECRET=generate-a-random-64-character-string`
   - (Optional Google credentials)
6. Attach a **Persistent Disk** (or mount volume) to `./uploads` and `./data` so uploaded files and database changes persist across redeployments.

---

## 🧪 Verification & Automated Test Results

The test suite in [`test_workflow.js`](file:///c:/Users/azar1/Downloads/portfolio/test_workflow.js) was executed and passed with **100% success rate (25/25 tests)**:

| Test Case | Expected Behavior | Result |
| :--- | :--- | :---: |
| **Public Content API** | Returns HTTP 200 with 7+ projects, 3 skill categories, and active resume | **PASS** |
| **Unauthorized Admin Access** | Blocked with HTTP 401 across all protected routes | **PASS** |
| **Admin Login (Invalid Password)** | Rejected with HTTP 401 error message | **PASS** |
| **Admin Login (Valid Credentials)** | Authenticates with HTTP 200 and issues `httpOnly` JWT session cookie | **PASS** |
| **Session Verification (`/api/auth/me`)** | Confirms active session for authorized admin | **PASS** |
| **Draft Content Modification** | Admin updates draft without modifying public endpoint (Draft isolation) | **PASS** |
| **Publishing Workflow (`/api/admin/publish`)** | Promotes draft to published snapshot; public endpoint immediately updates | **PASS** |
| **Project CRUD & Repeatable Key Points** | Creates project with key points array, edits, duplicates, and deletes | **PASS** |
| **URL Validation** | Malformed URLs return 400 validation error | **PASS** |
| **Resume Streaming (`/download` & `/preview`)** | Streams active document with proper Content-Disposition and MIME headers | **PASS** |
| **Admin Logout** | Clears session cookie; follow-up requests return 401 Unauthorized | **PASS** |
