# Smart Project & Task Collaboration System

A premium, full-stack web application designed for teams to coordinate projects, manage tasks, assign team members, and trace activities in real time. 

Built using a separated architecture: **Next.js (App Router) + Tailwind CSS + Redux Toolkit** on the frontend, and **Node.js + Express + MongoDB** on the backend.

---

## 🚀 Live Demo & API

- **Frontend Application**: [https://smartcollab-sc.vercel.app/](https://smartcollab-sc.vercel.app/)
- **Backend API Base URL**: [https://smart-collab-backend.vercel.app/](https://smart-collab-backend.vercel.app/)

---

## Technical Features

1. **Role-Based Access Control (RBAC)**:
   - **Admin**: Full system access (create projects, manage tasks, add team members).
   - **Project Manager (PM)**: Create and manage projects, tasks, and assignments.
   - **Team Member**: Update assigned tasks status and participate in comments threads only.
2. **Task Validation & Conflict Prevention**:
   - **Duplicate title validation**: Rejects task creation if a task with the same title exists in the project.
   - **Deadline validation**: Prevents setting past dates as task deadlines.
   - **Completed task validation**: Blocks reassigning the member of a task if it is marked as `Completed`.
3. **Advanced Filtering, Search & Sorting**:
   - Live search projects by name, or tasks by title/description.
   - Filter by Project, Priority, Assignee, Status, and Deadline Urgency (Upcoming / Overdue).
   - Sort by: Latest Created, Nearest Deadline, Highest Priority, Recently Updated.
4. **Rich Analytics Dashboard**:
   - KPI metrics: Total Projects, Total Tasks, Completed, Pending, Overdue.
   - Custom SVG-based analytics: Tasks by Priority (bar charts), Task Status Distribution (radial donut chart), Project Progress Overview (individual completion meters).
   - Live activity logs listing recent system activities with user profiling.
5. **Team Workloads & Productivity Summaries**:
   - High-fidelity visual cards for team members displaying total tasks assigned, completed tasks, and ratio of completed work.
6. **Task Actions & Productivity Features**:
   - Move task statuses quickly in Kanban Columns.
   - Comment thread: add comments to tasks.
   - File attachment support: upload documents/attachments to tasks (saves on server disk, downloads dynamically).
   - Bulk actions: select multiple tasks to delete or update status at once.
7. **Premium Styling & Accessibility**:
   - Responsive flexbox/grid layout (works on desktop, tablet, and mobile).
   - Harmonious Light / Dark theme toggles with smooth micro-animations.
   - Glowing cards and glassmorphic layouts.

---

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/collab_db
JWT_SECRET=super_secret_jwt_token_key
```

### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Setup & Running Instructions

### Prerequisites
- Node.js installed (v18+ recommended)
- MongoDB installed and running locally on port 27017 (or supply a MongoDB Atlas URI in `backend/.env`)

### Step 1: Start the Backend Server
```bash
cd backend
npm install
npm start
```
*Note: The server will connect to MongoDB and automatically seed clean mock data if the database is empty.*

### Step 2: Start the Frontend Next.js Server
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment Instructions

### Deploying to a Live Server (e.g., Vercel + Render / Railway)

#### Backend Deployment (Render / Railway / Any Node.js Host)

1. **Push to GitHub**: Ensure your backend code is pushed to a GitHub repository.
2. **Create a new Web Service** on Render (or Railway):
   - Connect your GitHub repo and select the `backend/` folder as the root directory.
   - Set the build command: `npm install`
 and start command: `npm start`.
   - Add environment variables:
     - `PORT=5000`
     - `MONGODB_URI=<your-mongodb-atlas-connection-string>`
 (use MongoDB Atlas for cloud DB)
     - `JWT_SECRET=<a-secure-random-secret>`
 (generate a strong secret, e.g. `openssl rand -base64 32`)
3. **Configure MongoDB Atlas**:
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Whitelist the deployment server's IP address (or allow all IPs `0.0.0.0/0` for Render/Railway).
   - Copy the connection string and set it as `MONGODB_URI` env var.
4. **Note**: The backend auto-seeds demo data when the database is empty, so no manual seeding is needed on first deploy.

#### Frontend Deployment (Vercel / Netlify / Any Static Host)

1. **Push to GitHub**: Ensure your frontend code is pushed to a GitHub repository.
2. **Create a new project** on Vercel (or Netlify):
   - Connect your GitHub repo and select the `frontend/` folder as the root directory.
   - Set the framework preset to **Next.js**.
   - Add environment variable:
     - `NEXT_PUBLIC_API_URL=https://<your-backend-app>.onrender.com/api` (replace with your actual backend URL)
3. **Build settings** (Vercel auto-detects Next.js):
   - Build command: `npm run build`
   - Output directory: `.next`
4. **Deploy**: Vercel will auto-deploy on every push to the connected branch.

#### Post-Deployment Checklist

- ✅ Backend API is accessible at the deployed URL (test `/api/auth/me` with a valid token).
- ✅ Frontend loads and can communicate with the backend (`NEXT_PUBLIC_API_URL` is correct).
- ✅ Demo login buttons work (Admin, PM, Team Member).
- ✅ MongoDB Atlas connection is stable (check backend logs for connection errors).
- ✅ File uploads work (ensure the `uploads/` directory persists or use cloud storage for production).

---

## Demo Credentials
You can instantly log in to any of the role profiles using the **Demo Login buttons** on the authentication page, or input the credentials manually:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@system.com` | `password123` |
| **Project Manager** | `pm@system.com` | `password123` |
| **Team Member** | `member@system.com` | `password123` |

*To restore the database to its pristine state at any point, click the **"Seed Demo Data"** button in the top navbar.*
