'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { projectsAPI, tasksAPI, teamAPI, activitiesAPI } from '../../lib/api';
import { showToast } from '../../store/appSlice';
import {
  Folder,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { AppDispatch } from '../../store/store';
import { Project, Task, Activity, User } from '../../types';

export default function DashboardView() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState<boolean>(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workloads, setWorkloads] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes, workloadRes, actRes] = await Promise.all([
        projectsAPI.getAll(),
        tasksAPI.getAll({ limit: '100' }), // fetch a large chunk for computing stats
        teamAPI.getWorkload(),
        activitiesAPI.getRecent(8),
      ]);

      setProjects(projRes.data.data || []);
      setTasks(taskRes.data.data || []);
      setWorkloads(workloadRes.data.data || []);
      setActivities(actRes.data.data || []);
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Failed to load dashboard data', type: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Analyzing system productivity...</span>
        </div>
      </div>
    );
  }

  // Compute metrics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;

  const today = new Date();
  const overdueTasks = tasks.filter(t => {
    return t.status !== 'Completed' && new Date(t.dueDate) < today;
  }).length;

  // Tasks by Priority
  const highPriorityCount = tasks.filter(t => t.priority === 'High').length;
  const mediumPriorityCount = tasks.filter(t => t.priority === 'Medium').length;
  const lowPriorityCount = tasks.filter(t => t.priority === 'Low').length;

  // Task Status distribution
  const todoCount = tasks.filter(t => t.status === 'Todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;

  // Project progress calculations
  const projectSummaries = projects.map(proj => {
    const projTasks = tasks.filter(t => (t.project as Project)?._id === proj._id || t.project === proj._id);
    const totalProjTasks = projTasks.length;
    const completedProjTasks = projTasks.filter(t => t.status === 'Completed').length;
    const pendingProjTasks = totalProjTasks - completedProjTasks;
    const completionPercent = totalProjTasks > 0 ? Math.round((completedProjTasks / totalProjTasks) * 100) : 0;

    // Calculate relative urgency text
    const daysLeft = Math.ceil((new Date(proj.deadline).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let deadlineText = '';
    if (daysLeft < 0) {
      deadlineText = `Overdue by ${Math.abs(daysLeft)} days`;
    } else if (daysLeft === 0) {
      deadlineText = 'Deadline today';
    } else if (daysLeft === 1) {
      deadlineText = 'Deadline tomorrow';
    } else {
      deadlineText = `Deadline in ${daysLeft} days`;
    }

    return {
      ...proj,
      pendingCount: pendingProjTasks,
      completionPercent,
      deadlineText,
      totalCount: totalProjTasks
    };
  });

  // KPI card configuration
  const kpis = [
    { title: 'Total Projects', value: totalProjects, icon: <Folder className="w-5 h-5" />, color: 'from-blue-50 to-sky-50 border-blue-200 text-blue-600 dark:from-blue-600/20 dark:to-sky-600/5 dark:border-blue-500/20 dark:text-blue-400' },
    { title: 'Total Tasks', value: totalTasks, icon: <ListTodo className="w-5 h-5" />, color: 'from-sky-50 to-teal-50 border-sky-200 text-sky-700 dark:from-sky-600/20 dark:to-teal-600/5 dark:border-sky-500/20 dark:text-sky-400' },
    { title: 'Completed Tasks', value: completedTasks, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-emerald-50 to-teal-50 border-emerald-200 text-emerald-600 dark:from-emerald-600/20 dark:to-teal-600/5 dark:border-emerald-500/20 dark:text-emerald-400' },
    { title: 'Pending Tasks', value: pendingTasks, icon: <Clock className="w-5 h-5" />, color: 'from-amber-50 to-orange-50 border-amber-200 text-amber-600 dark:from-amber-600/20 dark:to-orange-600/5 dark:border-amber-500/20 dark:text-amber-400' },
    { title: 'Overdue Tasks', value: overdueTasks, icon: <AlertCircle className="w-5 h-5" />, color: 'from-rose-50 to-red-50 border-rose-200 text-rose-600 dark:from-rose-600/20 dark:to-red-600/5 dark:border-rose-500/20 dark:text-rose-400 animate-pulse' },
  ];

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-4 lg:space-y-8 max-w-7xl mx-auto w-full animate-fade-in-up">
      {/* Title greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Dashboard Insights
          </h2>
          <p className="text-xs md:text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics and workload tracking metrics across the collaboration platform.
          </p>
        </div>
        <button
          onClick={() => router.push('/tasks')}
          className="flex items-center gap-2 px-4 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg text-xs md:text-sm lg:text-base font-semibold transition-all shadow-lg shadow-sky-700/20 cursor-pointer self-start md:self-auto"
        >
          View Kanban Board
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`glass-panel border p-4 rounded-xl flex items-center justify-between bg-gradient-to-br ${kpi.color}`}
          >
            <div className="space-y-1">
              <span className="text-xs md:text-sm lg:text-base font-semibold text-slate-500 dark:text-slate-400 tracking-wider block">{kpi.title}</span>
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white block">{kpi.value}</span>
            </div>
            <div className="p-2.5 bg-white/40 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* User Manual Link */}
      <button
        onClick={() => router.push('/manual')}
        className="w-full flex items-center justify-between p-5 md:p-6 glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/60">
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200">
              User Manual
            </h3>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
              Your role-based capabilities, responsibilities, and how-to guide.
            </p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
      </button>

      {/* Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

        {/* Tasks by Priority (Bar chart) */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200">Tasks by Priority</h3>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Distribution of tasks sorted by urgency.</p>
          </div>
          <div className="space-y-4 my-6">
            {/* High Priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">High Priority</span>
                <span className="text-slate-500 dark:text-slate-400">{highPriorityCount} tasks</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (highPriorityCount / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            {/* Medium Priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-sky-700 dark:text-sky-400 font-semibold">Medium Priority</span>
                <span className="text-slate-500 dark:text-slate-400">{mediumPriorityCount} tasks</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-teal-500 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (mediumPriorityCount / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            {/* Low Priority */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Low Priority</span>
                <span className="text-slate-500 dark:text-slate-400">{lowPriorityCount} tasks</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-500 dark:to-slate-400 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (lowPriorityCount / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="text-xs md:text-sm text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-900 pt-3 flex justify-between">
            <span>High priority tasks require immediate review.</span>
          </div>
        </div>

        {/* Task Status Distribution (Donut Chart representation) */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200">Task Status Distribution</h3>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Task lifecycle breakdown.</p>
          </div>

          {/* Custom SVG Donut representation */}
          <div className="relative flex items-center justify-center py-6">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="rgba(226, 232, 240, 0.6)"
                strokeWidth="12"
                fill="transparent"
                className="dark:[stroke:rgba(15,23,42,0.6)]"
              />
              <circle
                cx="72"
                cy="72"
                r="56"
                stroke="#10b981" // Completed
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - (totalTasks > 0 ? completedTasks / totalTasks : 0))}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white block">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
              <span className="text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase">Completed</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs md:text-sm border-t border-slate-200 dark:border-slate-900 pt-4">
            <div>
              <span className="block text-slate-500 dark:text-slate-400 font-semibold">Todo</span>
              <span className="block text-sm md:text-base font-bold text-slate-600 dark:text-slate-300 mt-0.5">{todoCount}</span>
            </div>
            <div>
              <span className="block text-blue-600 dark:text-blue-400 font-semibold">In Progress</span>
              <span className="block text-sm md:text-base font-bold text-blue-500 dark:text-blue-300 mt-0.5">{inProgressCount}</span>
            </div>
            <div>
              <span className="block text-emerald-600 dark:text-emerald-400 font-semibold">Done</span>
              <span className="block text-sm md:text-base font-bold text-emerald-500 dark:text-emerald-300 mt-0.5">{completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Project Summaries Widget (Progress Tracking) */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200">Project Progress Overview</h3>
            <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Summary of major team deliverables.</p>
          </div>

          <div className="my-4 space-y-4 max-h-[180px] overflow-y-auto pr-1">
            {projectSummaries.map((proj, idx) => (
              <div key={proj._id || idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs md:text-sm">
                  <span className="font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[150px] md:max-w-[200px]">{proj.name}</span>
                  <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                    {proj.completionPercent === 100 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% completed</span>
                    ) : proj.status === 'On Hold' ? (
                      <span className="text-amber-600 dark:text-amber-500 font-semibold">On Hold</span>
                    ) : (
                      <span className="font-medium text-slate-400">{proj.pendingCount} tasks pending</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${proj.status === 'On Hold'
                        ? 'bg-amber-500'
                        : proj.completionPercent === 100
                          ? 'bg-emerald-500'
                          : 'bg-sky-600'
                        }`}
                      style={{ width: `${proj.completionPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-slate-400 dark:text-slate-500 w-24 md:w-28 text-right truncate">
                    {proj.deadlineText}
                  </span>
                </div>
              </div>
            ))}
            {projectSummaries.length === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic block py-4 text-center">No projects registered.</span>
            )}
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-900 pt-3 flex justify-between items-center">
            <span>Overall completion trends.</span>
            <button
              onClick={() => router.push('/projects')}
              className="text-sky-700 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-bold cursor-pointer hover:underline"
            >
              Manage Projects
            </button>
          </div>
        </div>

      </div>

      {/* Team Workload & Upcoming Deadlines / Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

        {/* Member Workload Summary */}
        <div className="lg:col-span-6 glass-panel border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200">Member Workload Summary</h3>
              <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Assigned tasks and completed work ratio per member.</p>
            </div>
            <button
              onClick={() => router.push('/team')}
              className="text-xs md:text-sm text-sky-700 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-bold cursor-pointer"
            >
              View Team
            </button>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
            {workloads.map((item, idx) => {
              const total = item.totalTasks;
              const completed = item.completedTasks;
              const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={item.member._id || idx} className="flex items-center gap-4 p-2 bg-white/30 dark:bg-slate-900/30 rounded-xl border border-slate-200/50 dark:border-slate-900">
                  <img
                    src={item.member.avatarUrl}
                    alt={item.member.name}
                    className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="font-semibold text-slate-600 dark:text-slate-300 truncate">{item.member.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {completed}/{total} tasks ({ratio}%)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-600 to-emerald-400 transition-all duration-500"
                          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 w-24 md:w-28 text-right truncate">
                        {item.pendingTasks} pending tasks
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {workloads.length === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic block py-4 text-center">No workloads recorded.</span>
            )}
          </div>
        </div>

        {/* Recent Activities list (Logs) */}
        <div className="lg:col-span-6 glass-panel border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200">Recent Activities</h3>
              <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 mt-0.5">Logs of recent updates on tasks and projects.</p>
            </div>
            <button
              onClick={() => router.push('/activities')}
              className="text-xs md:text-sm text-sky-700 dark:text-sky-400 hover:text-sky-600 dark:hover:text-sky-300 font-bold cursor-pointer"
            >
              View Logs
            </button>
          </div>

          <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
            {activities.map((act, idx) => (
              <div key={act._id || idx} className="flex gap-3 text-xs md:text-sm leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 flex-shrink-0 animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-600 dark:text-slate-300 font-medium">{act.text}</p>
                  <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 block mt-0.5">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — by {act.user?.name || 'System'}
                  </span>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic block py-6 text-center">No recent activities.</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
