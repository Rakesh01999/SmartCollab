'use client';

import { usePermissions } from '../../hooks/usePermissions';
import {
    BookOpen,
    CheckCircle2,
    Shield,
    FolderKanban,
    ListTodo,
    Users,
    Activity,
    LayoutDashboard,
    MessageSquare,
    ClipboardList,
    Eye,
    Sparkles
} from 'lucide-react';

interface ManualItem {
    label: string;
    description: string;
}

interface ManualSection {
    title: string;
    icon: React.ReactNode;
    items: ManualItem[];
}

export default function RoleUserManual() {
    const permissions = usePermissions();

    const roleLabel = permissions.isAdmin
        ? 'Admin'
        : permissions.isPM
            ? 'Project Manager'
            : permissions.isTeamMember
                ? 'Team Member'
                : 'Unknown';

    const roleColor = permissions.isAdmin
        ? 'from-rose-500 to-red-600 dark:from-rose-400 dark:to-red-500'
        : permissions.isPM
            ? 'from-sky-600 to-teal-500 dark:from-sky-500 dark:to-teal-400'
            : 'from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500';

    const roleBadgeColor = permissions.isAdmin
        ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950 dark:border-rose-500/30 dark:text-rose-400'
        : permissions.isPM
            ? 'bg-sky-50 border-sky-200 text-sky-700 dark:bg-sky-950 dark:border-sky-500/30 dark:text-sky-400'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-500/30 dark:text-emerald-400';

    const roleIconBg = permissions.isAdmin
        ? 'bg-rose-100 dark:bg-rose-950/60'
        : permissions.isPM
            ? 'bg-sky-100 dark:bg-sky-950/60'
            : 'bg-emerald-100 dark:bg-emerald-950/60';

    // ── Build manual sections — only operations the current role can perform ──

    const projectItems: ManualItem[] = [];
    if (permissions.canCreateProject) projectItems.push({ label: 'Create new projects', description: 'Click the "New Project" button on the Project Board page to define a new project with name, description, deadline, status, and team members.' });
    if (permissions.canEditProject) projectItems.push({ label: 'Edit existing projects', description: 'Click the edit (pencil) icon on any project card to modify its details — name, description, deadline, status, or assigned members.' });
    if (permissions.canDeleteProject) projectItems.push({ label: 'Delete projects', description: 'Click the delete (trash) icon on any project card. You will be asked to confirm before the project and all its tasks are permanently removed.' });
    if (permissions.canAddMemberToProject) projectItems.push({ label: 'Add members to projects', description: 'Click the "+" avatar button on a project card to open the member assignment dropdown. Select any unassigned team member to add them.' });

    const taskItems: ManualItem[] = [];
    if (permissions.canCreateTask) taskItems.push({ label: 'Create new tasks', description: 'Click the "New Task" button on the Kanban Board. Fill in the task name, description, project, priority, status, due date, and assigned member.' });
    if (permissions.isTeamMember) {
        taskItems.push({ label: 'Edit your assigned tasks', description: 'On the Kanban Board, tasks assigned to you will show an edit icon. Click it to modify your task details. In the detail modal, the "Edit" button appears only for your own tasks.' });
    } else {
        taskItems.push({ label: 'Edit any task', description: 'Click the edit icon on any task card or the "Edit" button in the task detail modal to modify task properties.' });
    }
    if (permissions.canDeleteTask) taskItems.push({ label: 'Delete tasks', description: 'Click the delete (trash) icon on any task card or in the task detail modal. Confirmation is required before permanent removal.' });
    if (permissions.isTeamMember) {
        taskItems.push({ label: 'Move your assigned tasks', description: 'On your assigned task cards, left/right arrow buttons appear. Click them to move your task to the previous or next status column.' });
    } else {
        taskItems.push({ label: 'Move tasks between columns', description: 'Use the left/right arrow buttons on any task card to quickly shift it between Todo, In Progress, and Completed columns.' });
    }
    if (permissions.isTeamMember) {
        taskItems.push({ label: 'Change your task status', description: 'When viewing the detail modal of a task assigned to you, you will see clickable status buttons (Todo / In Progress / Completed). Click the desired status to update.' });
    } else {
        taskItems.push({ label: 'Change task status', description: "In the task detail modal, interactive status buttons (Todo / In Progress / Completed) let you update any task's workflow stage." });
    }

    const bulkItems: ManualItem[] = [];
    if (permissions.canBulkSelectTasks) bulkItems.push({ label: 'Select multiple tasks', description: 'Checkboxes appear on each task card when you have bulk permission. Tick the checkboxes to select multiple tasks for batch operations.' });
    if (permissions.canBulkStatusChange) bulkItems.push({ label: 'Bulk status change', description: 'After selecting tasks, use the "Move to…" dropdown in the bulk actions panel and click "Apply Status" to change all selected tasks at once.' });
    if (permissions.canBulkDeleteTasks) bulkItems.push({ label: 'Bulk delete tasks', description: 'After selecting tasks, click the trash icon in the bulk actions panel to delete all selected tasks simultaneously. Confirmation is required.' });

    const attachmentItems: ManualItem[] = [];
    if (permissions.isTeamMember) {
        attachmentItems.push({ label: 'Attach files to your tasks', description: "In the detail modal of tasks assigned to you, click the \"Attach File\" button to upload relevant documents. This option is hidden on other members' tasks." });
    } else {
        attachmentItems.push({ label: 'Attach files to any task', description: 'In the task detail modal, click the "Attach File" button to upload documents, images, or other files to any task.' });
    }
    if (permissions.canCommentOnTask) attachmentItems.push({ label: 'Comment on tasks', description: 'In the task detail modal, type your comment in the comment box and press Enter or click Submit. All roles can comment on any task.' });

    const teamItems: ManualItem[] = [];
    if (permissions.canAddTeamMember) teamItems.push({ label: 'Add new team members', description: "On the Team Directory page, click the \"Add Member\" button. Fill in the new member's name, email, password, and role (Admin, Project Manager, or Team Member)." });
    if (permissions.canViewTeamDirectory) teamItems.push({ label: 'View team directory', description: 'Navigate to the Team Members page to see all team members, their roles, workload statistics, and activity status.' });

    const navItems: ManualItem[] = [];
    if (permissions.canViewDashboard) navItems.push({ label: 'View Dashboard', description: 'The Dashboard shows KPI metrics, task priority distribution, project progress, member workload, and recent activity logs. Access it from the sidebar.' });
    if (permissions.canViewActivityLog) navItems.push({ label: 'View Activity Logs', description: 'Navigate to Activity Logs from the sidebar to see a chronological record of all system actions — task creations, status changes, project updates, and more.' });
    navItems.push({ label: 'View Kanban Board', description: 'The Kanban Board organizes all tasks into Todo, In Progress, and Completed columns. Use project tabs and filters to narrow down the view.' });
    navItems.push({ label: 'View Project Board', description: 'The Project Board displays all projects with progress bars, member avatars, and deadline info. All roles can browse projects.' });

    const sections: ManualSection[] = [
        { title: 'Project Management', icon: <FolderKanban className="w-4 h-4" />, items: projectItems },
        { title: 'Task Management', icon: <ListTodo className="w-4 h-4" />, items: taskItems },
        { title: 'Bulk Operations', icon: <ClipboardList className="w-4 h-4" />, items: bulkItems },
        { title: 'Task Attachments & Comments', icon: <MessageSquare className="w-4 h-4" />, items: attachmentItems },
        { title: 'Team Management', icon: <Users className="w-4 h-4" />, items: teamItems },
        { title: 'Navigation & Viewing', icon: <LayoutDashboard className="w-4 h-4" />, items: navItems },
    ].filter(section => section.items.length > 0);

    // ── Role-specific overview description ──
    const roleOverview = permissions.isAdmin
        ? 'As an Admin, you have full control over the SmartCollab platform. You can create, edit, and delete projects and tasks, manage team membership, perform bulk operations, and configure project assignments. You see all operational buttons across every page.'
        : permissions.isPM
            ? 'As a Project Manager, you manage projects and tasks across the platform. You can create/edit/delete projects and tasks, assign members to projects, perform bulk operations, and track all team activity. You cannot add new team members to the system — that is reserved for Admins.'
            : 'As a Team Member, you focus on executing tasks assigned to you. You can edit, move, and change the status of your own tasks, attach files to them, and comment on any task. Buttons for actions you cannot perform are hidden from your view.';

    const responsibilitySummary = permissions.isAdmin
        ? 'Full platform governance • Team composition control • Project lifecycle management • Task oversight & bulk operations'
        : permissions.isPM
            ? 'Project delivery & scheduling • Task coordination & assignment • Member-to-project mapping • Progress tracking & reporting'
            : 'Task execution & delivery • Status updates on assigned work • File attachments & collaboration • Activity awareness';

    return (
        <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-5 md:p-6">
                <div className={`p-2.5 rounded-xl ${roleIconBg}`}>
                    <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div>
                    <h3 className="font-bold text-sm md:text-base lg:text-lg text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        User Manual
                        <span className={`inline-block text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full border ${roleBadgeColor}`}>
                            {roleLabel}
                        </span>
                    </h3>
                    <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                        Your role-based capabilities, responsibilities, and how-to guide.
                    </p>
                </div>
            </div>

            {/* Content - always visible */}
            <div className="border-t border-slate-200/80 dark:border-slate-800/80">
                {/* Role Overview Banner */}
                <div className={`bg-gradient-to-r ${roleColor} p-5 md:p-6 text-white`}>
                    <div className="flex items-start gap-3">
                        <Shield className="w-6 h-6 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-bold text-base md:text-lg flex items-center gap-2">
                                {roleLabel} Role Overview
                            </h4>
                            <p className="text-xs md:text-sm mt-2 opacity-90 leading-relaxed">
                                {roleOverview}
                            </p>
                            <p className="text-[10px] md:text-xs mt-3 opacity-75 font-semibold tracking-wide uppercase">
                                {responsibilitySummary}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Manual Sections - only allowed operations */}
                <div className="p-4 md:p-6 space-y-3">
                    {sections.map((section, sIdx) => (
                        <div
                            key={sIdx}
                            className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40"
                        >
                            {/* Section header */}
                            <div className="flex items-center gap-2.5 p-3 md:p-4">
                                <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
                                    {section.icon}
                                </div>
                                <span className="font-semibold text-sm md:text-base text-slate-700 dark:text-slate-200">
                                    {section.title}
                                </span>
                                <span className="text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                    {section.items.length} capabilities
                                </span>
                            </div>

                            {/* Section items - always visible */}
                            <div className="px-3 md:px-4 pb-3 md:pb-4 space-y-2.5 border-t border-slate-200/60 dark:border-slate-800/60">
                                {section.items.map((item, iIdx) => (
                                    <div
                                        key={iIdx}
                                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-500/20"
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-semibold text-xs md:text-sm block text-slate-700 dark:text-slate-200">
                                                {item.label}
                                            </span>
                                            <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Reference - How to navigate */}
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 p-4 md:p-5">
                        <h4 className="font-bold text-sm md:text-base text-slate-700 dark:text-slate-200 flex items-center gap-2 mb-3">
                            <Eye className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            Quick Navigation Guide
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {[
                                { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, desc: 'KPIs, charts, workload & activity overview' },
                                { path: '/projects', name: 'Project Board', icon: <FolderKanban className="w-3.5 h-3.5" />, desc: 'Create & manage projects (if permitted)' },
                                { path: '/tasks', name: 'Kanban Board', icon: <ListTodo className="w-3.5 h-3.5" />, desc: 'View, move, and manage tasks by status' },
                                { path: '/team', name: 'Team Directory', icon: <Users className="w-3.5 h-3.5" />, desc: 'Browse members & workloads' },
                                { path: '/activities', name: 'Activity Logs', icon: <Activity className="w-3.5 h-3.5" />, desc: 'Chronological system event history' },
                            ].map((nav) => (
                                <div key={nav.path} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50">
                                    <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex-shrink-0">
                                        {nav.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <span className="font-semibold text-xs md:text-sm text-slate-600 dark:text-slate-300 block">{nav.name}</span>
                                        <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 block mt-0.5">{nav.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tip for Team Members */}
                {permissions.isTeamMember && (
                    <div className="px-4 md:px-6 pb-4 md:pb-6">
                        <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 md:p-5">
                            <h4 className="font-bold text-sm md:text-base text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4" />
                                Tip for Team Members
                            </h4>
                            <p className="text-xs md:text-sm text-emerald-600/80 dark:text-emerald-300/70 leading-relaxed">
                                On the Kanban Board, tasks assigned to <strong>you</strong> will display edit, move, and status change buttons. Tasks assigned to other members will only show view and comment options. This helps you focus on your own work while staying aware of the team's progress.
                            </p>
                        </div>
                    </div>
                )}

                {/* Tip for Project Managers */}
                {permissions.isPM && (
                    <div className="px-4 md:px-6 pb-4 md:pb-6">
                        <div className="rounded-xl border border-sky-200/60 dark:border-sky-500/20 bg-sky-50/40 dark:bg-sky-950/20 p-4 md:p-5">
                            <h4 className="font-bold text-sm md:text-base text-sky-700 dark:text-sky-400 flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4" />
                                Tip for Project Managers
                            </h4>
                            <p className="text-xs md:text-sm text-sky-600/80 dark:text-sky-300/70 leading-relaxed">
                                You can manage all projects and tasks, but <strong>adding new team members</strong> to the system is an Admin-only function. If you need a new member added, contact your Admin. You can, however, assign existing members to any project you manage.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}