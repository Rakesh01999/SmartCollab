'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { User, Task, UserRole } from '../types';

/**
 * Centralized role-based permission hook.
 * Provides granular boolean flags for each action type,
 * including task-specific permissions that depend on whether
 * the Team Member is assigned to that task.
 *
 * Permission Matrix:
 * ┌──────────────────────┬───────┬─────────────────┬──────────────┐
 * │ Action               │ Admin │ Project Manager │ Team Member  │
 * ├──────────────────────┼───────┼─────────────────┼──────────────┤
 * │ Create Task          │  ✓    │  ✓              │  ✗           │
 * │ Edit Task (any)      │  ✓    │  ✓              │  ✗           │
 * │ Edit Task (own)      │  ✓    │  ✓              │  ✓           │
 * │ Delete Task          │  ✓    │  ✓              │  ✗           │
 * │ Move Task (any)      │  ✓    │  ✓              │  ✗           │
 * │ Move Task (own)      │  ✓    │  ✓              │  ✓           │
 * │ Change Status (any)  │  ✓    │  ✓              │  ✗           │
 * │ Change Status (own)  │  ✓    │  ✓              │  ✓           │
 * │ Bulk Select Tasks    │  ✓    │  ✓              │  ✗           │
 * │ Bulk Status Change   │  ✓    │  ✓              │  ✗           │
 * │ Bulk Delete Tasks    │  ✓    │  ✓              │  ✗           │
 * │ Attach File (any)    │  ✓    │  ✓              │  ✗           │
 * │ Attach File (own)    │  ✓    │  ✓              │  ✓           │
 * │ Comment on Task      │  ✓    │  ✓              │  ✓           │
 * │ Create Project       │  ✓    │  ✓              │  ✗           │
 * │ Edit Project         │  ✓    │  ✓              │  ✗           │
 * │ Delete Project       │  ✓    │  ✓              │  ✗           │
 * │ Add Member to Proj   │  ✓    │  ✓              │  ✗           │
 * │ Add Team Member      │  ✓    │  ✗              │  ✗           │
 * │ View Team Directory  │  ✓    │  ✓              │  ✓           │
 * │ View Activity Log    │  ✓    │  ✓              │  ✓           │
 * │ View Dashboard       │  ✓    │  ✓              │  ✓           │
 * └──────────────────────┴───────┴─────────────────┴──────────────┘
 */

export function usePermissions() {
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const role: UserRole | null = currentUser?.role ?? null;
    const userId: string | null = currentUser?.id ?? currentUser?._id ?? null;

    // ── Role identity checks ──
    const isAdmin = role === 'Admin';
    const isPM = role === 'Project Manager';
    const isTeamMember = role === 'Team Member';
    const isAuthorized = isAdmin || isPM; // Admin + Project Manager

    // ── Helper: is the current user assigned to this task? ──
    const isAssignedToTask = (task: Task): boolean => {
        if (!userId) return false;
        const assignedId = (task.assignedMember as User)?._id ?? (task.assignedMember as User)?.id;
        return assignedId === userId;
    };

    // ── Global permissions (not task-specific) ──

    const canCreateTask = isAuthorized;
    const canCreateProject = isAuthorized;
    const canEditProject = isAuthorized;
    const canDeleteProject = isAuthorized;
    const canAddMemberToProject = isAuthorized;
    const canAddTeamMember = isAdmin;
    const canBulkSelectTasks = isAuthorized;
    const canBulkStatusChange = isAuthorized;
    const canBulkDeleteTasks = isAuthorized;

    // ── Task-specific permissions ──

    /** Can edit the given task (Admin/PM: any; Team Member: only assigned) */
    const canEditTask = (task: Task): boolean => {
        if (isAuthorized) return true;
        if (isTeamMember && isAssignedToTask(task)) return true;
        return false;
    };

    /** Can delete the given task (Admin/PM only; Team Member: never) */
    const canDeleteTask = isAuthorized;

    /** Can move/shift the given task's status (Admin/PM: any; Team Member: only assigned) */
    const canMoveTask = (task: Task): boolean => {
        if (isAuthorized) return true;
        if (isTeamMember && isAssignedToTask(task)) return true;
        return false;
    };

    /** Can change task status via workflow buttons (Admin/PM: any; Team Member: only assigned) */
    const canChangeTaskStatus = (task: Task): boolean => {
        if (isAuthorized) return true;
        if (isTeamMember && isAssignedToTask(task)) return true;
        return false;
    };

    /** Can attach files to the given task (Admin/PM: any; Team Member: only assigned) */
    const canAttachFile = (task: Task): boolean => {
        if (isAuthorized) return true;
        if (isTeamMember && isAssignedToTask(task)) return true;
        return false;
    };

    /** Can comment on any task (all roles can comment) */
    const canCommentOnTask = true;

    // ── Navigation visibility ──
    const canViewTeamDirectory = true; // All roles can view
    const canViewActivityLog = true;   // All roles can view
    const canViewDashboard = true;     // All roles can view

    return {
        // Role identity
        currentUser,
        isAdmin,
        isPM,
        isTeamMember,
        isAuthorized,

        // Global permissions
        canCreateTask,
        canCreateProject,
        canEditProject,
        canDeleteProject,
        canAddMemberToProject,
        canAddTeamMember,
        canBulkSelectTasks,
        canBulkStatusChange,
        canBulkDeleteTasks,

        // Task-specific permissions (call with task argument)
        canEditTask,
        canDeleteTask,
        canMoveTask,
        canChangeTaskStatus,
        canAttachFile,
        canCommentOnTask,

        // Navigation
        canViewTeamDirectory,
        canViewActivityLog,
        canViewDashboard,
    };
}