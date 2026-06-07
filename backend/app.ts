import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';

// Load environment variables (works locally via .env; on Vercel env vars are set via dashboard)
dotenv.config();

const app = express();

// ─── Middleware: Ensure DB connection before handling requests ───────────────
// Critical for serverless — connects on first request, reuses cached connection afterward
app.use(async (_req, _res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        _res.status(500).json({ success: false, message: 'Database connection error' });
    }
});

// ─── Body Parser ────────────────────────────────────────────────────────────
app.use(express.json());

// ─── CORS ───────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Static File Serving (uploaded files) ──────────────────────────────────
// On Vercel, use /tmp (ephemeral writable directory); locally use project uploads dir
const uploadsDir = process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// ─── Route Imports ──────────────────────────────────────────────────────────
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import teamRoutes from './routes/team';
import activityRoutes from './routes/activities';

// ─── Mount Routers ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/activities', activityRoutes);

// ─── Root Route ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'Smart Project & Task Collaboration System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            projects: '/api/projects',
            tasks: '/api/tasks',
            team: '/api/team',
            activities: '/api/activities',
            health: '/api/health',
        },
    });
});

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Server is running perfectly' });
});

export default app;