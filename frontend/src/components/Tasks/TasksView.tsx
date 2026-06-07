'use client';

import { useEffect, useState, FormEvent, ChangeEvent, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector, useDispatch } from 'react-redux';
import { tasksAPI, projectsAPI, teamAPI } from '../../lib/api';
import { showToast, setActiveProjectId } from '../../store/appSlice';
import { useConfirm } from '../../hooks/useConfirm';
import { usePermissions } from '../../hooks/usePermissions';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Paperclip,
  ChevronRight,
  ChevronLeft,
  X,
  PlusCircle,
  Trash2,
  CheckSquare,
  FileText,
  RotateCcw
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store/store';
import { Task, Project, User } from '../../types';

export default function TasksView() {
  const dispatch = useDispatch<AppDispatch>();
  const activeProjectId = useSelector((state: RootState) => state.app.activeProjectId);

  const [loading, setLoading] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [team, setTeam] = useState<User[]>([]);

  // Filters & Search
  const searchParams = useSearchParams();
  const [search, setSearch] = useState<string>(searchParams.get('search') || '');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [deadlineFilter, setDeadlineFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latestCreated');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(12);
  const isInitialMount = useRef<boolean>(true);

  const hasActiveFilters = search !== '' || priorityFilter !== 'all' || assigneeFilter !== 'all' || deadlineFilter !== 'all' || sortBy !== 'latestCreated';

  const handleResetFilters = () => {
    setSearch('');
    setPriorityFilter('all');
    setAssigneeFilter('all');
    setDeadlineFilter('all');
    setSortBy('latestCreated');
    setCurrentPage(1);
  };

  // Bulk Actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  // Modals
  const [showTaskFormModal, setShowTaskFormModal] = useState<boolean>(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState<boolean>(false);

  // Selected task for detail/editing
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Form States (Create / Edit Task)
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDesc, setTaskDesc] = useState<string>('');
  const [taskProjId, setTaskProjId] = useState<string>('');
  const [taskAssigneeId, setTaskAssigneeId] = useState<string>('');
  const [taskDueDate, setTaskDueDate] = useState<string>('');
  const [taskPriority, setTaskPriority] = useState<string>('Medium');
  const [taskStatus, setTaskStatus] = useState<string>('Todo');

  // Comment & File Upload States
  const [commentText, setCommentText] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const permissions = usePermissions();

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [projRes, teamRes] = await Promise.all([
        projectsAPI.getAll(),
        teamAPI.getAll()
      ]);
      setProjects(projRes.data.data || []);
      setTeam(teamRes.data.data || []);

      // Load tasks
      await refreshTasks();
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to load task resources', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = async (page?: number, limit?: number) => {
    try {
      const filters: any = {};
      if (activeProjectId !== 'all') {
        filters.project = activeProjectId;
      }
      if (priorityFilter !== 'all') {
        filters.priority = priorityFilter;
      }
      if (assigneeFilter !== 'all') {
        filters.assignedMember = assigneeFilter;
      }
      if (deadlineFilter !== 'all') {
        filters.deadlineStatus = deadlineFilter;
      }
      if (search !== '') {
        filters.search = search;
      }
      filters.sortBy = sortBy;
      filters.page = (page ?? currentPage).toString();
      filters.limit = (limit ?? pageSize).toString();

      const taskRes = await tasksAPI.getAll(filters);
      setTasks(taskRes.data.data || []);
      setTotalTasks(taskRes.data.total || 0);
      setTotalPages(taskRes.data.pages || 1);
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to refresh tasks list', type: 'error' }));
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    refreshTasks(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    refreshTasks(1, size);
  };

  // Initial load: fetch projects, team, and tasks
  useEffect(() => {
    loadAllData();
  }, []);

  // Filter changes: reset page and refresh tasks (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setCurrentPage(1);
    refreshTasks(1);
  }, [activeProjectId, priorityFilter, assigneeFilter, deadlineFilter, sortBy, search]);

  const handleOpenCreateTask = () => {
    if (!permissions.canCreateTask) return;
    setIsEditMode(false);
    setTaskTitle('');
    setTaskDesc('');
    setTaskProjId(activeProjectId !== 'all' ? activeProjectId : (projects[0]?._id || ''));
    setTaskAssigneeId('');
    setTaskDueDate('');
    setTaskPriority('Medium');
    setTaskStatus('Todo');
    setShowTaskFormModal(true);
  };

  const handleOpenEditTask = (task: Task) => {
    // RBAC: only users with edit permission for this task can open the edit form
    if (!permissions.canEditTask(task)) {
      dispatch(showToast({ message: 'You do not have permission to edit this task.', type: 'warning' }));
      return;
    }

    setIsEditMode(true);
    setActiveTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskProjId((task.project as Project)?._id || (task.project as string) || '');
    setTaskAssigneeId((task.assignedMember as User)?._id || (task.assignedMember as unknown as string) || '');
    setTaskDueDate(task.dueDate ? String(task.dueDate).split('T')[0] : '');
    setTaskPriority(task.priority);
    setTaskStatus(task.status);
    setShowTaskFormModal(true);
  };

  const handleOpenTaskDetail = async (task: Task) => {
    try {
      const res = await tasksAPI.getById(task._id as string);
      setActiveTask(res.data.data);
      setShowTaskDetailModal(true);
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to load task details', type: 'error' }));
    }
  };

  const handleTaskSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskProjId || !taskDueDate) {
      dispatch(showToast({ message: 'Title, Project, and Due Date are required', type: 'warning' }));
      return;
    }

    // Client-side rule check: Past due dates (if creating or if date changed)
    const todayStr = new Date().toISOString().split('T')[0];
    if (taskDueDate < todayStr) {
      dispatch(showToast({ message: 'Please select a valid deadline.', type: 'error' }));
      return;
    }

    try {
      const taskData = {
        title: taskTitle,
        description: taskDesc,
        project: taskProjId,
        assignedMember: taskAssigneeId || null,
        dueDate: taskDueDate,
        priority: taskPriority,
        status: taskStatus
      };

      if (isEditMode && activeTask) {
        // Backend validation errors will bubble up here
        await tasksAPI.update(activeTask._id as string, taskData);
        dispatch(showToast({ message: 'Task updated successfully', type: 'success' }));
      } else {
        await tasksAPI.create(taskData);
        dispatch(showToast({ message: 'Task created successfully', type: 'success' }));
      }

      setShowTaskFormModal(false);
      refreshTasks();
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to save task', type: 'error' }));
    }
  };

  const handleQuickStatusChange = async (task: Task, newStatus: string) => {
    // RBAC: only users with status-change permission for this task can move it
    if (!permissions.canChangeTaskStatus(task)) {
      dispatch(showToast({ message: 'You do not have permission to change the status of this task.', type: 'warning' }));
      return;
    }

    try {
      await tasksAPI.update(task._id as string, { status: newStatus });
      dispatch(showToast({ message: `Task moved to ${newStatus}`, type: 'success' }));
      refreshTasks();
      if (showTaskDetailModal && activeTask?._id === task._id) {
        // refresh detail modal
        const res = await tasksAPI.getById(task._id as string);
        setActiveTask(res.data.data);
      }
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to update task status', type: 'error' }));
    }
  };

  const { confirm } = useConfirm();

  const handleDeleteTask = async (id: string) => {
    if (!permissions.canDeleteTask) return;
    const confirmed = await confirm({
      title: 'Delete Task',
      message: 'Delete this task permanently? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep It',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        await tasksAPI.delete(id);
        dispatch(showToast({ message: 'Task deleted successfully', type: 'success' }));
        setShowTaskDetailModal(false);
        refreshTasks();
      } catch (error: any) {
        dispatch(showToast({ message: error.message || 'Failed to delete task', type: 'error' }));
      }
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeTask) return;

    try {
      const res = await tasksAPI.addComment(activeTask._id as string, commentText);
      dispatch(showToast({ message: 'Comment posted', type: 'success' }));
      setCommentText('');

      // Refresh active task comments
      const updatedTaskRes = await tasksAPI.getById(activeTask._id as string);
      setActiveTask(updatedTaskRes.data.data);
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to post comment', type: 'error' }));
    }
  };

  const handleUploadAttachment = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTask) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingFile(true);
      setUploadProgress(20);

      // Simulate progression interval
      const progTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 15 : prev));
      }, 100);

      await tasksAPI.uploadAttachment(activeTask._id as string, formData);

      clearInterval(progTimer);
      setUploadProgress(100);
      dispatch(showToast({ message: `File "${file.name}" uploaded successfully!`, type: 'success' }));

      // Refresh task details
      const updatedTaskRes = await tasksAPI.getById(activeTask._id as string);
      setActiveTask(updatedTaskRes.data.data);
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to upload attachment', type: 'error' }));
    } finally {
      setTimeout(() => {
        setUploadingFile(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  // Bulk status update
  const handleBulkStatusUpdate = async () => {
    if (selectedTaskIds.length === 0 || !bulkStatus) return;

    try {
      setLoading(true);
      let successCount = 0;
      let failCount = 0;
      let errorMsg = '';

      for (let taskId of selectedTaskIds) {
        try {
          const task = tasks.find(t => t._id === taskId);
          // Check RBAC permission for each task
          if (!permissions.canChangeTaskStatus(task)) {
            failCount++;
            continue;
          }
          await tasksAPI.update(taskId, { status: bulkStatus });
          successCount++;
        } catch (err: any) {
          failCount++;
          errorMsg = err.message;
        }
      }

      if (successCount > 0) {
        dispatch(showToast({ message: `Bulk updated status of ${successCount} tasks to ${bulkStatus}`, type: 'success' }));
      }
      if (failCount > 0) {
        dispatch(showToast({
          message: `Failed to update ${failCount} tasks. ${permissions.isTeamMember ? 'Only assigned tasks can be updated.' : errorMsg}`,
          type: 'warning'
        }));
      }

      setSelectedTaskIds([]);
      setBulkStatus('');
      refreshTasks();
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Bulk update failed', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!permissions.canBulkDeleteTasks || selectedTaskIds.length === 0) return;
    const confirmed = await confirm({
      title: 'Bulk Delete Tasks',
      message: `Are you sure you want to delete all ${selectedTaskIds.length} selected tasks? This action cannot be undone.`,
      confirmText: 'Delete All',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      try {
        setLoading(true);
        for (let taskId of selectedTaskIds) {
          await tasksAPI.delete(taskId);
        }
        dispatch(showToast({ message: `Deleted ${selectedTaskIds.length} tasks successfully`, type: 'success' }));
        setSelectedTaskIds([]);
        refreshTasks();
      } catch (error: any) {
        dispatch(showToast({ message: error.message || 'Bulk delete failed', type: 'error' }));
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelectTask = (id: string) => {
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter(tid => tid !== id));
    } else {
      setSelectedTaskIds([...selectedTaskIds, id]);
    }
  };

  // Split tasks into Kanban columns
  const columns: Record<string, Task[]> = {
    Todo: tasks.filter(t => t.status === 'Todo'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    Completed: tasks.filter(t => t.status === 'Completed')
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Title & Operations */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Kanban Task Board
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Organize team deliverables and map progress workflows.</p>
        </div>

        {permissions.canCreateTask && (
          <button
            onClick={handleOpenCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-sm md:text-base font-semibold transition-all shadow-lg shadow-sky-700/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        )}
      </div>

      {/* Project Selector Tab Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => dispatch(setActiveProjectId('all'))}
          className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all border cursor-pointer ${activeProjectId === 'all'
            ? 'bg-sky-700 text-white border-sky-600 shadow-md'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          All Projects
        </button>
        {projects.map((proj) => (
          <button
            key={proj._id}
            onClick={() => dispatch(setActiveProjectId(proj._id as string))}
            className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all border cursor-pointer ${activeProjectId === proj._id
              ? 'bg-sky-700 text-white border-sky-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            {proj.name}
          </button>
        ))}
      </div>

      {/* Kanban Filters & Sort Toolbar */}
      <div className="bg-white/60 dark:bg-slate-900/40 p-3 lg:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 flex flex-wrap gap-3 items-center">

        {/* Search */}
        <div className="relative w-full md:w-auto md:flex-[2] md:min-w-[180px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-sm md:text-base text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-600 transition-all"
          />
        </div>

        {/* Priority Filter */}
        <div className="w-full md:w-auto md:flex-1 md:min-w-[130px]">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-600"
          >
            <option value="all">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div className="w-full md:w-auto md:flex-1 md:min-w-[130px]">
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-600"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {team.map(m => (
              <option key={m._id} value={m._id as string}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* Deadline filter */}
        <div className="w-full md:w-auto md:flex-1 md:min-w-[130px]">
          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-600"
          >
            <option value="all">Timeline</option>
            <option value="upcoming">Upcoming</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        {/* Sorting option */}
        <div className="w-full md:w-auto md:flex-1 md:min-w-[130px]">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-600"
          >
            <option value="latestCreated">Sort: Latest Created</option>
            <option value="nearestDeadline">Sort: Nearest Deadline</option>
            <option value="highestPriority">Sort: Highest Priority</option>
            <option value="recentlyUpdated">Sort: Recently Updated</option>
          </select>
        </div>

        {/* Reset Filters */}
        <div className="w-full md:w-auto flex items-center justify-center md:justify-start">
          <button
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${hasActiveFilters
              ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md hover:shadow-lg'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>

      </div>

      {/* Bulk Actions Panel - only visible to authorized users (Admin/PM) */}
      {selectedTaskIds.length > 0 && permissions.canBulkSelectTasks && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-500/20 p-4 rounded-xl gap-4 shadow-md">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200">
              {selectedTaskIds.length} tasks selected
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <option value="">Choose Status...</option>
              <option value="Todo">Move to Todo</option>
              <option value="In Progress">Move to In Progress</option>
              <option value="Completed">Move to Completed</option>
            </select>

            <button
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus}
              className="px-3 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Apply Status
            </button>

            {permissions.canBulkDeleteTasks && (
              <button
                onClick={handleBulkDelete}
                className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 hover:border-rose-500 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all cursor-pointer"
                title="Bulk Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setSelectedTaskIds([])}
              className="text-xs md:text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Kanban Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {Object.entries(columns).map(([colName, colTasks]) => {
            const titleColors: any = {
              Todo: 'text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800',
              'In Progress': 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-500/20',
              Completed: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-500/20',
            }[colName];

            return (
              <div key={colName} className="flex flex-col min-h-[450px]">
                {/* Column Header */}
                <div className={`p-3 rounded-xl border flex items-center justify-between font-bold text-sm md:text-base lg:text-lg mb-4 ${titleColors}`}>
                  <span>{colName}</span>
                  <span className="bg-slate-200/60 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md text-xs md:text-sm">{colTasks.length}</span>
                </div>

                {/* Task Cards Container */}
                <div className="flex-1 space-y-4 bg-slate-100/40 dark:bg-slate-950/20 p-2 rounded-2xl border border-slate-200 dark:border-slate-900 border-dashed min-h-[400px]">
                  {colTasks.map((task) => {
                    const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysLeft < 0 && task.status !== 'Completed';

                    const priorityStyles: any = {
                      High: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-500/10',
                      Medium: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-500/10',
                      Low: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
                    }[task.priority];

                    const isChecked = selectedTaskIds.includes(task._id as string);

                    return (
                      <div
                        key={task._id}
                        className={`glass-panel border rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:translate-x-1 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 ${isChecked ? 'border-sky-600/60 bg-sky-50/10 dark:bg-sky-950/10 shadow-[0_0_15px_rgba(14, 165, 233,0.08)]' : ''
                          }`}
                        onClick={() => handleOpenTaskDetail(task)}
                      >
                        {/* Top section: Checkbox (authorized only), Project and Priority */}
                        <div className="flex justify-between items-start gap-2 mb-2" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {permissions.canBulkSelectTasks && (
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectTask(task._id as string)}
                                className="w-4 h-4 accent-sky-700 rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 cursor-pointer"
                              />
                            )}
                            <span className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate max-w-[120px]">
                              {(task.project as Project)?.name || 'No Project'}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold border ${priorityStyles}`}>
                            {task.priority}
                          </span>
                        </div>

                        {/* Task title and description */}
                        <h4 className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 line-clamp-1">{task.title}</h4>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                          {task.description || 'No description provided.'}
                        </p>

                        {/* Quick Move Buttons & Assignee */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 flex justify-between items-center" onClick={e => e.stopPropagation()}>
                          {/* Due Date Indicator */}
                          <div className={`flex items-center gap-1 text-[10px] md:text-xs font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold animate-pulse' : 'text-slate-500 dark:text-slate-400'
                            }`}>
                            <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>
                              {isOverdue
                                ? `Overdue by ${Math.abs(daysLeft)}d`
                                : daysLeft === 0
                                  ? 'Due Today'
                                  : daysLeft === 1
                                    ? 'Due Tomorrow'
                                    : `Due in ${daysLeft}d`}
                            </span>
                          </div>

                          {/* Status Shift Buttons - only visible if user can move this task */}
                          <div className="flex items-center gap-2">
                            {permissions.canMoveTask(task) && colName !== 'Todo' && (
                              <button
                                onClick={() => handleQuickStatusChange(task, colName === 'Completed' ? 'In Progress' : 'Todo')}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-sky-700 dark:hover:text-sky-400 cursor-pointer transition-colors"
                                title="Move Left"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Assignee Avatar */}
                            {task.assignedMember ? (
                              <img
                                src={(task.assignedMember as User).avatarUrl}
                                alt={(task.assignedMember as User).name}
                                className="w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-900"
                                title={`Assigned to ${(task.assignedMember as User).name}`}
                              />
                            ) : (
                              <span
                                className="w-5.5 h-5.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 flex items-center justify-center text-[8px] md:text-[10px] text-slate-500"
                                title="Unassigned Task"
                              >
                                U
                              </span>
                            )}

                            {permissions.canMoveTask(task) && colName !== 'Completed' && (
                              <button
                                onClick={() => handleQuickStatusChange(task, colName === 'Todo' ? 'In Progress' : 'Completed')}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-sky-700 dark:hover:text-sky-400 cursor-pointer transition-colors"
                                title="Move Right"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-600 text-xs md:text-sm italic">No tasks in this stage.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalTasks > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/60 dark:bg-slate-900/40 p-3 lg:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
          {/* Results summary */}
          <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, totalTasks)} of {totalTasks} tasks
          </span>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">Per page:</span>
            {[6, 12, 24, 48].map(size => (
              <button
                key={size}
                onClick={() => handlePageSizeChange(size)}
                className={`px-2.5 py-1 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${pageSize === size
                  ? 'bg-sky-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="First page"
            >
              ««
            </button>
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Previous page"
            >
              ‹
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Calculate which page numbers to show (centered around current page)
              let start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
              const end = Math.min(totalPages, start + 4);
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${currentPage === pageNum
                    ? 'bg-sky-700 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" title="Next page"
            >
              ›
            </button>
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700" title="Last page"
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* Task Creation / Editing Form Modal */}
      {showTaskFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-sky-600" />
                {isEditMode ? 'Modify Task Details' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setShowTaskFormModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="task-title-input">Task Title *</label>
                <input
                  type="text"
                  id="task-title-input"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Integrate REST Endpoints"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-sm md:text-base text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="task-desc-input">Task Description</label>
                <textarea
                  id="task-desc-input"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Provide checklist, details, and requirements..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-sm md:text-base text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-600 min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="task-project-select">Project *</label>
                  <select
                    id="task-project-select"
                    value={taskProjId}
                    onChange={(e) => setTaskProjId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-sm md:text-base text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-600"
                    required
                  >
                    <option value="" disabled>Choose Project...</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id as string}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="task-assignee-select">Assigned Member</label>
                  <select
                    id="task-assignee-select"
                    value={taskAssigneeId}
                    onChange={(e) => setTaskAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-sm md:text-base text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-600"
                  >
                    <option value="">Unassigned</option>
                    {team.map(m => (
                      <option key={m._id} value={m._id as string}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="task-due-date-input">Due Date *</label>
                  <DatePicker
                    id="task-due-date-input"
                    selected={taskDueDate ? new Date(taskDueDate + 'T00:00:00') : null}
                    onChange={(date: Date | null) => setTaskDueDate(date ? date.toISOString().split('T')[0] : '')}
                    minDate={new Date()}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a due date"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-sky-600"
                    calendarClassName="dark-theme-calendar"
                    popperPlacement="bottom-start"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="task-priority-select">Priority</label>
                  <select
                    id="task-priority-select"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-600"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400" htmlFor="task-status-select">Status</label>
                  <select
                    id="task-status-select"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-600"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskFormModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm md:text-base font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-sm md:text-base font-semibold shadow-lg shadow-sky-700/20 cursor-pointer"
                >
                  {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details, Comments, and File Attachments Modal */}
      {showTaskDetailModal && activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
              <div>
                <span className="text-[10px] md:text-xs font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {(activeTask.project as Project)?.name || 'Project'}
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1.5">{activeTask.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                {permissions.canEditTask(activeTask) && (
                  <button
                    onClick={() => {
                      setShowTaskDetailModal(false);
                      handleOpenEditTask(activeTask);
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs md:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                )}
                {permissions.canDeleteTask && (
                  <button
                    onClick={() => handleDeleteTask(activeTask._id as string)}
                    className="p-1.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 hover:border-rose-500 text-rose-600 dark:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowTaskDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">

              {/* Left Column: Info & Description */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h4 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Description</h4>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 mt-2 whitespace-pre-line leading-relaxed bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-4 rounded-xl">
                    {activeTask.description || 'No description provided.'}
                  </p>
                </div>

                {/* File Attachments Support */}
                <div className="space-y-3">
                  <h4 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">File Attachments</h4>

                  <div className="grid grid-cols-1 gap-2">
                    {activeTask.attachments?.map((file, i) => (
                      <div key={file._id || i} className="flex items-center justify-between p-2.5 bg-slate-50/40 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-850 rounded-xl">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                          <span className="text-xs md:text-sm text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={file.filename}>
                            {file.filename}
                          </span>
                        </div>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${file.filepath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] md:text-xs text-sky-700 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-bold"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                    {(!activeTask.attachments || activeTask.attachments.length === 0) && (
                      <span className="text-xs md:text-sm text-slate-500 italic block py-1">No files attached yet.</span>
                    )}
                  </div>

                  {/* Upload button wrapper - only visible if user can attach files to this task */}
                  <div className="flex items-center gap-3">
                    {permissions.canAttachFile(activeTask) && (
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700">
                        <Paperclip className="w-3.5 h-3.5" />
                        Attach File
                        <input
                          type="file"
                          onChange={handleUploadAttachment}
                          className="hidden"
                          disabled={uploadingFile}
                        />
                      </label>
                    )}
                    {uploadingFile && (
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-sky-600" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment Threads */}
                <div className="space-y-4">
                  <h4 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Comments Thread</h4>

                  {/* List of comments */}
                  <div className="space-y-3.5 max-h-52 overflow-y-auto pr-1">
                    {activeTask.comments?.map((c, i) => (
                      <div key={c._id || i} className="flex gap-3 text-xs md:text-sm bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/60 dark:border-slate-900 p-3 rounded-xl">
                        <img
                          src={(c.user as User)?.avatarUrl}
                          alt=""
                          className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{(c.user as User)?.name}</span>
                            <span className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                              {new Date(c.createdAt).toLocaleDateString()} at {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">{c.text}</p>
                        </div>
                      </div>
                    ))}
                    {(!activeTask.comments || activeTask.comments.length === 0) && (
                      <span className="text-xs md:text-sm text-slate-500 italic block py-4 text-center">No comments posted yet.</span>
                    )}
                  </div>

                  {/* Add comment form */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs md:text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-sky-600"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs md:text-sm font-semibold cursor-pointer"
                    >
                      Post
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Status & Assignment Panel */}
              <div className="md:col-span-5 space-y-6 bg-slate-500/5 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900/50 p-5 rounded-2xl max-h-fit shadow-inner">
                <h4 className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-200 dark:border-slate-800">
                  Task Parameters
                </h4>

                <div className="space-y-4">
                  {/* Status selection - only interactive if user can change task status */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Status Workflow</span>
                    {permissions.canChangeTaskStatus(activeTask) ? (
                      <div className="grid grid-cols-3 gap-1.5">
                        {['Todo', 'In Progress', 'Completed'].map(st => {
                          const isCurrent = activeTask.status === st;
                          const colors: any = {
                            Todo: 'border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                            'In Progress': 'border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-500 hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400',
                            Completed: 'border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-500 hover:border-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400',
                          }[st];
                          const activeBg: any = {
                            Todo: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
                            'In Progress': 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.15)]',
                            Completed: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
                          }[st];

                          return (
                            <button
                              key={st}
                              onClick={() => handleQuickStatusChange(activeTask, st)}
                              className={`px-2 py-1.5 border rounded-lg text-[10px] md:text-xs font-bold transition-all text-center cursor-pointer ${isCurrent ? activeBg : `text-slate-500 ${colors}`
                                }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200">
                        {activeTask.status}
                      </div>
                    )}
                  </div>

                  {/* Due date status */}
                  <div className="space-y-1">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Due Deadline</span>
                    <span className="block text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {new Date(activeTask.dueDate).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Priority Badge */}
                  <div className="space-y-1">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Task Priority</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs md:text-sm font-bold border ${({
                      High: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-500/20',
                      Medium: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-500/20',
                      Low: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
                    } as any)[activeTask.priority] || ''
                      }`}>
                      {activeTask.priority}
                    </span>
                  </div>

                  {/* Assignee Card */}
                  <div className="space-y-2">
                    <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Assignee</span>
                    {activeTask.assignedMember ? (
                      <div className="flex items-center gap-3 p-3 bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl">
                        <img
                          src={(activeTask.assignedMember as User).avatarUrl}
                          alt=""
                          className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800"
                        />
                        <div className="min-w-0">
                          <span className="block text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{(activeTask.assignedMember as User).name}</span>
                          <span className="block text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{(activeTask.assignedMember as User).email}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs md:text-sm text-slate-500 italic block">No member assigned to this task.</span>
                    )}
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
