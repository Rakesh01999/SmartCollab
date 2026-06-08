import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Task from '../models/Task';
import Project from '../models/Project';
import Activity from '../models/Activity';
import User from '../models/User';
import { protect, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = express.Router();

// ─── Upload directory: /tmp on Vercel (ephemeral writable), local project dir otherwise ──
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper: Check if a date is in the past (yesterday or earlier)
const isPastDate = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const {
      project,
      status,
      priority,
      assignedMember,
      search,
      page = '1',
      limit = '12',
    } = req.query as Record<string, string>;

    const filter: any = {};
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedMember) filter.assignedMember = assignedMember;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalTasks = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('project', 'name status')
      .populate('assignedMember', 'name email avatarUrl role')
      .populate('createdBy', 'name email avatarUrl role')
      .populate('comments.user', 'name email avatarUrl role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalTasks,
        totalPages: Math.ceil(totalTasks / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status')
      .populate('assignedMember', 'name email avatarUrl role')
      .populate('createdBy', 'name email avatarUrl role')
      .populate('comments.user', 'name email avatarUrl role');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin, Project Manager)
router.post('/', protect, authorize('Admin', 'Project Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, project, assignedMember, dueDate, priority, status } = req.body;

    if (!title || !project) {
      res.status(400).json({ success: false, message: 'Title and project are required' });
      return;
    }

    // Validate dueDate is not in the past
    if (dueDate && isPastDate(dueDate)) {
      res.status(400).json({ success: false, message: 'Due date cannot be in the past' });
      return;
    }

    // Validate project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      res.status(400).json({ success: false, message: 'Project not found' });
      return;
    }

    // Prevent duplicate task titles inside the same project
    const existingTask = await Task.findOne({ title, project });
    if (existingTask) {
      res.status(400).json({ success: false, message: 'This task already exists in the project.' });
      return;
    }

    // Validate assignedMember exists and is in the project
    if (assignedMember) {
      const member = await User.findById(assignedMember);
      if (!member) {
        res.status(400).json({ success: false, message: 'Assigned member not found' });
        return;
      }
      const projectMembers = (projectDoc.members as any[]).map((m: any) => m.toString());
      if (!projectMembers.includes(assignedMember)) {
        res.status(400).json({ success: false, message: 'Assigned member is not part of this project' });
        return;
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedMember: assignedMember || null,
      dueDate: dueDate || null,
      priority: priority || 'Medium',
      status: status || 'Todo',
      createdBy: req.user!._id,
    });

    // Log activity
    await Activity.create({
      text: `Task "${title}" created by ${req.user!.name}`,
      user: req.user!._id,
      type: 'task_created',
      project,
      task: task._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedMember', 'name email avatarUrl role')
      .populate('createdBy', 'name email avatarUrl role');

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Admin, Project Manager, assigned Team Member for status only)
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const { title, description, project, assignedMember, dueDate, priority, status } = req.body;

    // Prevent reassigning completed tasks
    if (task.status === 'Completed' && assignedMember) {
      res.status(400).json({ success: false, message: 'Completed tasks cannot be reassigned.' });
      return;
    }

    // Prevent duplicate task titles inside the same project (when title or project changes)
    const effectiveTitle = title || task.title;
    const effectiveProject = project || task.project.toString();
    if (title || project) {
      const duplicateTask = await Task.findOne({
        title: effectiveTitle,
        project: effectiveProject,
        _id: { $ne: task._id },
      });
      if (duplicateTask) {
        res.status(400).json({ success: false, message: 'This task already exists in the project.' });
        return;
      }
    }

    // Role-based update restrictions
    const isAssignedMember = task.assignedMember && task.assignedMember.toString() === req.user!._id.toString();
    const isAdmin = req.user!.role === 'Admin';
    const isPM = req.user!.role === 'Project Manager';

    // Team Members can only update status of tasks assigned to them
    if (req.user!.role === 'Team Member' && !isAssignedMember) {
      res.status(403).json({ success: false, message: 'Team Members can only update tasks assigned to them' });
      return;
    }

    if (req.user!.role === 'Team Member' && isAssignedMember) {
      // Team Members can only change the status field
      task.status = status || task.status;
    } else {
      // Admin and Project Manager can update all fields
      if (title) task.title = title;
      if (description) task.description = description;
      if (project) task.project = project;
      if (assignedMember) task.assignedMember = assignedMember;
      if (dueDate) {
        if (isPastDate(dueDate)) {
          res.status(400).json({ success: false, message: 'Due date cannot be in the past' });
          return;
        }
        task.dueDate = dueDate;
      }
      if (priority) task.priority = priority;
      if (status) task.status = status;
    }

    const updatedTask = await task.save();

    // Log activity
    await Activity.create({
      text: `Task "${updatedTask.title}" updated by ${req.user!.name}`,
      user: req.user!._id,
      type: 'task_updated',
      project: updatedTask.project,
      task: updatedTask._id,
    });

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name status')
      .populate('assignedMember', 'name email avatarUrl role')
      .populate('createdBy', 'name email avatarUrl role')
      .populate('comments.user', 'name email avatarUrl role');

    res.json({ success: true, data: populatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Project Manager)
router.delete('/:id', protect, authorize('Admin', 'Project Manager'), async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Log activity before deletion
    await Activity.create({
      text: `Task "${task.title}" deleted by ${req.user!.name}`,
      user: req.user!._id,
      type: 'task_deleted',
      project: task.project,
    });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Add a comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private
router.post('/:id/comments', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const { text } = req.body;
    if (!text) {
      res.status(400).json({ success: false, message: 'Comment text is required' });
      return;
    }

    task.comments.push({ user: req.user!._id, text, createdAt: new Date() });
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name email avatarUrl role');

    res.status(201).json({ success: true, data: populatedTask?.comments || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// @desc    Upload attachment to a task
// @route   POST /api/tasks/:id/attachments
// @access  Private (Admin, Project Manager, assigned Team Member)
router.post('/:id/attachments', protect, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    // Role check: only assigned member, Admin, or PM can upload
    const isAssignedMember = task.assignedMember && task.assignedMember.toString() === req.user!._id.toString();
    const isAdminOrPM = req.user!.role === 'Admin' || req.user!.role === 'Project Manager';
    if (!isAssignedMember && !isAdminOrPM) {
      res.status(403).json({ success: false, message: 'Not authorized to upload attachments to this task' });
      return;
    }

    // filepath matches the IAttachment schema; on Vercel it's /tmp/uploads, locally it's the project uploads dir
    const filepath = process.env.VERCEL
      ? path.join('/tmp', 'uploads', req.file.filename)
      : path.join(__dirname, '../uploads', req.file.filename);

    task.attachments.push({
      filename: req.file.filename,
      filepath: filepath,
      filetype: req.file.mimetype,
      uploadedAt: new Date(),
    });

    await task.save();

    res.status(201).json({ success: true, data: task.attachments });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
