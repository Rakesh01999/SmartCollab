# Smart Project & Task Collaboration System

A premium, full-stack web application designed for teams to coordinate projects, manage tasks, assign team members, and trace activities in real time. 

Built using a separated architecture: **Next.js (App Router) + Tailwind CSS + Redux Toolkit** on the frontend, and **Node.js + Express + MongoDB** on the backend.

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

## Demo Credentials

You can instantly log in to any of the role profiles using the **Demo Login buttons** on the authentication page, or input the credentials manually:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@system.com` | `password123` |
| **Project Manager** | `pm@system.com` | `password123` |
| **Team Member** | `member@system.com` | `password123` |

*To restore the database to its pristine state at any point, click the **"Seed Demo Data"** button in the top navbar.*
