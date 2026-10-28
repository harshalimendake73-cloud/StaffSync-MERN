# StaffSync — Enterprise Full-Stack MERN HR Management System

> **Tagline**: *"People First. Work Smarter."*

StaffSync is an enterprise-grade Human Resources Management System (HRMS) built with the modern MERN stack. It streamlines organizational attendance, automated leave quota balances, role-based workflows, corporate upskilling programs, announcements, and compliance auditing in a unified, responsive SaaS dashboard.

---

## 1. Features & Architectural Highlights

### 🛡️ Role-Based Access Control (RBAC)
- **HR Administrator**: Full organizational oversight. Manage employee records, departmental hierarchies, leave policies, organization-wide attendance adjustments with audit reasons, company bulletins, training programs, holiday calendars, and CSV telemetry exports.
- **Team Manager**: Direct reports directory, review and approve/reject team leave petitions with comments, monitor team daily attendance, view training progress.
- **Employee**: Dedicated self-service station. One-click Clock In / Clock Out with live elapsed timer, overnight shift tracking, leave balance buckets (Casual, Sick, Earned, Unpaid), course catalog enrollment, company bulletins, and profile updates.

### ⏱️ Smart Attendance & Overnight Shift Policy
- **Single Workday Session**: Strict enforcement of one valid session per employee per workday.
- **Overnight Shift Handling**: Shifts starting after 18:00 local time can be flagged as overnight, carrying forward cleanly into the next day and attributing hours to the start date's business cycle without date collisions.
- **Duration & Late Thresholds**: Automated calculation of working hours; late marks applied for arrivals after 09:30 AM; half-day assigned for sessions under 4.5 hours.
- **Server Timestamp Authority**: Clocks rely strictly on server time; client-side clock tampering is prevented.
- **Administrative Corrections**: HR can correct hours with mandatory reasons permanently logged in immutable audit records.

### 🏖️ Automated Leave Management Engine
- **Configurable Balances**: Casual, Sick, Earned (Annual Vacation), and Unpaid leave quotas.
- **Overlap & Date Validation**: Detects and rejects overlapping applications.
- **Atomic Balance Updates**: Automatic deduction of leave days upon approval; automatic replenishment upon cancellation or rejection.

### 📚 Upskilling & Training Programs
- Course scheduling with duration, lead instructors, departmental allocations, and capacity caps.
- Self-paced milestone progress updating (25%, 50%, 75%, 100%) and completion certifications.

### 🔒 Security & Compliance
- JWT access tokens stored in secure `Authorization: Bearer` headers and optional HttpOnly cookies.
- Password hashing using `bcryptjs` with salt factor 10.
- `express-rate-limit` on login and password reset routes.
- `Helmet` security headers and origin-restricted `CORS`.
- Centralized error handling and sensitive credential redaction.

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Bootstrap 5, Custom Responsive CSS, React Router DOM v6, Axios, React Context API, Recharts, React Icons |
| **Backend** | Node.js, Express.js (ES modules), MongoDB, Mongoose, JWT, bcryptjs, express-validator, Helmet, CORS, express-rate-limit, json2csv, Morgan |
| **Testing** | Vitest, Supertest, React Testing Library, Jest DOM |

---

## 3. Project Structure

```
staffsync/
├── client/
│   ├── src/
│   │   ├── api/             # Axios instance & interceptors
│   │   ├── assets/          # Brand visuals
│   │   ├── components/      # Common UI (Sidebar, TopNavbar, StatCard, AttendanceWidget, StatusBadge, Pagination)
│   │   ├── context/         # AuthContext & NotificationContext
│   │   ├── layouts/         # DashboardLayout, AuthLayout
│   │   ├── pages/           # 25 full pages (Dashboards, Employees, Leaves, Attendance, Trainings, Bulletins, Settings)
│   │   ├── routes/          # ProtectedRoute, RoleRoute, AppRouter
│   │   ├── utils/           # Time, date, and text formatters
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        # Navy & indigo enterprise design system
│   ├── tests/               # Component unit tests
│   ├── vite.config.js
│   └── vercel.json          # Vercel deployment rewrites
├── server/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # Auth, Employees, Leaves, Attendance, Departments, Trainings, Bulletins, Audit
│   │   ├── middleware/      # JWT Authenticate, Role Authorize, ErrorHandler
│   │   ├── models/          # 14 Mongoose models (User, Profile, Leave, Attendance, Policy, Audit, etc.)
│   │   ├── routes/          # Express REST endpoints under /api/v1
│   │   ├── services/        # Leave balance deduction & attendance calculation engines
│   │   ├── utils/           # Timezone & audit logger utilities
│   │   ├── validators/      # express-validator schemas
│   │   ├── app.js           # Express app setup
│   │   ├── server.js        # Server entrypoint
│   │   └── seed/            # Development database seed script
│   ├── tests/               # Integration tests with Supertest & Vitest
│   └── render.yaml          # Render deployment blueprint
├── package.json             # Root monorepo scripts
└── README.md
```

---

## 4. Environment Variables

### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync
JWT_ACCESS_SECRET=staffsync_jwt_super_secret_access_key_2026_enterprise_secure
JWT_ACCESS_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
TIMEZONE=UTC
```

### Frontend (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 5. Quick Start & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017 (or MongoDB Atlas URI)

### 1. Install Dependencies
```bash
# From the project root
npm run install:all
```
*(Or navigate into `server` and `client` respectively and run `npm install`)*

### 2. Seed Development Database
Populates the database with 1 HR Admin, 2 Managers, 10 Employees, 5 Departments, 2026 Holidays, Leave Policies, Attendance Sessions, Leave Petitions, Bulletins, and Training Programs:
```bash
npm run seed
```

### 3. Run Development Servers
Open two terminal tabs:

**Terminal 1 (Backend API):**
```bash
npm run server
# Starts server at http://localhost:5000
# Health check: http://localhost:5000/api/v1/health
```

**Terminal 2 (Frontend Client):**
```bash
npm run client
# Starts Vite at http://localhost:5173
```

---

## 6. Demo Accounts (Documented Credentials)

All pre-seeded demo accounts use the standard password: **`StaffSync@2026`**

| Role | Email | Password | Description |
|---|---|---|---|
| **HR Administrator** | `admin@staffsync.com` | `StaffSync@2026` | Full organization access, analytics, audit trail |
| **Engineering Manager** | `manager.eng@staffsync.com` | `StaffSync@2026` | Manages Engineering direct reports, approves team leaves |
| **Product & Ops Manager** | `manager.hr@staffsync.com` | `StaffSync@2026` | Manages Product/Operations team |
| **Standard Employee** | `john.doe@staffsync.com` | `StaffSync@2026` | Senior Developer, self-service attendance & leaves |

> 💡 **Tip**: The login page includes **1-click Quick-Fill buttons** for all three roles for instant testing.

---

## 7. Running Tests

### Backend API Integration Tests
Runs 20 automated integration tests verifying health, JWT authentication, unauthorized access rejection, employee CRUD, leave balance deduction, duplicate attendance prevention, checkout duration calculation, and dashboard analytics:
```bash
npm run test:server
```

### Frontend Component Tests
Runs component unit tests verifying UI render states, StatusBadges, and Metric Cards:
```bash
npm run test:client
```

---

## 8. Complete API Reference (`/api/v1`)

### Authentication & Profiles
- `POST /api/v1/auth/login` — Sign in and receive JWT token + profile
- `POST /api/v1/auth/logout` — Invalidate session and clear cookies
- `GET  /api/v1/auth/me` — Retrieve active authenticated user profile
- `POST /api/v1/auth/forgot-password` — Generate password reset token
- `POST /api/v1/auth/reset-password` — Update password using reset token
- `PATCH /api/v1/auth/change-password` — Change password with current password verification

### Employees
- `GET   /api/v1/employees` — Search, filter by department/role/status, paginate staff
- `POST  /api/v1/employees` — [HR Only] Onboard new employee
- `GET   /api/v1/employees/:id` — View employee profile details
- `PATCH /api/v1/employees/:id` — Update personal or corporate details
- `PATCH /api/v1/employees/:id/status` — [HR Only] Activate or deactivate employee

### Departments
- `GET    /api/v1/departments` — List departments with headcount metrics
- `POST   /api/v1/departments` — [HR Only] Create department
- `PATCH  /api/v1/departments/:id` — [HR Only] Update department
- `DELETE /api/v1/departments/:id` — [HR Only] Delete department (guarded against active employees)

### Leave Management
- `GET   /api/v1/leaves` — List leaves (filtered by role scope: HR=all, Manager=team, Employee=self)
- `POST  /api/v1/leaves` — Submit new leave application
- `GET   /api/v1/leaves/balance/me` — Retrieve current year's leave balance buckets
- `GET   /api/v1/leaves/:id` — View leave petition details
- `PATCH /api/v1/leaves/:id/approve` — [HR / Manager] Approve leave and deduct balance
- `PATCH /api/v1/leaves/:id/reject` — [HR / Manager] Reject leave with review comment
- `PATCH /api/v1/leaves/:id/cancel` — Cancel pending/approved leave application

### Attendance
- `POST  /api/v1/attendance/check-in` — Clock in for today's session (with overnight switch)
- `PATCH /api/v1/attendance/check-out` — Clock out and calculate total elapsed hours
- `GET   /api/v1/attendance/me` — Today's session status and recent personal logs
- `GET   /api/v1/attendance` — Organization/team attendance logs with date filters
- `GET   /api/v1/attendance/reports/summary` — Aggregate monthly working hours & status metrics
- `GET   /api/v1/attendance/export` — Download attendance report as formatted CSV
- `PATCH /api/v1/attendance/:id/correct` — [HR Only] Adjust records with mandatory audit justification

### Bulletins, Training & Compliance
- `GET   /api/v1/announcements` — Retrieve published company bulletins
- `POST  /api/v1/announcements` — [HR Only] Publish new bulletin
- `GET   /api/v1/trainings` — List training courses with enrollment status
- `POST  /api/v1/trainings/:id/enroll` — Enroll employee in training program
- `PATCH /api/v1/trainings/:id/progress` — Update course completion milestone (0-100%)
- `GET   /api/v1/holidays` — List calendar holidays
- `GET   /api/v1/leave-policies` — Retrieve leave governance rules and quotas
- `POST  /api/v1/leave-policies` — [HR Only] Configure leave quotas
- `GET   /api/v1/audit-logs` — [HR Only] Query security audit trail
- `GET   /api/v1/dashboard/hr` — [HR Only] High-level organizational analytics
- `GET   /api/v1/dashboard/manager` — Team operations overview
- `GET   /api/v1/dashboard/employee` — Employee personal dashboard
- `GET   /api/v1/health` — System status, uptime, and database connectivity check

---

## 9. Production Deployment Guide

### A. Frontend on Vercel
1. Push repository to GitHub/GitLab.
2. In Vercel, import the project and set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Configure Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-backend.onrender.com/api/v1`
5. The included `client/vercel.json` automatically handles client-side React Router rewrites.

### B. Backend on Render
1. In Render, create a new **Web Service** pointing to the repository.
2. Set **Root Directory** to `server`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `npm start`.
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/staffsync?retryWrites=true&w=majority`
   - `JWT_ACCESS_SECRET`: `<secure-random-secret>`
   - `CLIENT_URL`: `https://your-staffsync-app.vercel.app`
   - `TIMEZONE`: `UTC`

### C. Database on MongoDB Atlas
1. Create a free M0 cluster on MongoDB Atlas.
2. Under **Network Access**, add `0.0.0.0/0` (or Render's outbound IPs).
3. Under **Database Access**, create a user with read/write privileges.
4. Copy the connection string into the `MONGODB_URI` environment variable.
5. Run the seed script remotely or via Render shell: `npm run seed`.

