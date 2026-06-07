'use client';

import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { setNotifications, markNotificationRead, markAllNotificationsRead } from '../../store/appSlice';
import { activitiesAPI } from '../../lib/api';
import { Notification, Activity, User as UserType } from '../../types';
import { Bell, X, CheckCheck, Clock, FolderKanban, ListTodo, UserPlus, Trash2, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function activityToNotification(act: Activity): Notification {
    return {
        _id: act._id,
        text: act.text,
        type: act.type,
        user: act.user as UserType,
        project: act.project,
        task: act.task,
        createdAt: act.createdAt,
        read: false,
    };
}

const typeIconMap: Record<string, { icon: React.ReactNode; color: string }> = {
    project_created: { icon: <FolderKanban className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-500/20' },
    project_updated: { icon: <Edit className="w-4 h-4" />, color: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950 dark:border-sky-500/20' },
    project_deleted: { icon: <Trash2 className="w-4 h-4" />, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-500/20' },
    task_created: { icon: <ListTodo className="w-4 h-4" />, color: 'text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-500/20' },
    task_updated: { icon: <Edit className="w-4 h-4" />, color: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950 dark:border-sky-500/20' },
    task_deleted: { icon: <Trash2 className="w-4 h-4" />, color: 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950 dark:border-rose-500/20' },
    task_assigned: { icon: <UserPlus className="w-4 h-4" />, color: 'text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-500/20' },
    task_completed: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-500/20' },
    member_added: { icon: <UserPlus className="w-4 h-4" />, color: 'text-teal-600 bg-teal-50 border-teal-200 dark:text-teal-400 dark:bg-teal-950 dark:border-teal-500/20' },
    mention: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-500/20' },
    deadline_approaching: { icon: <Clock className="w-4 h-4" />, color: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950 dark:border-orange-500/20' },
    status_change: { icon: <Edit className="w-4 h-4" />, color: 'text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-400 dark:bg-sky-950 dark:border-sky-500/20' },
};

export default function NotificationDropdown() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const notifications = useSelector((state: RootState) => state.app.notifications);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (open && notifications.length === 0) {
            fetchNotifications();
        }
    }, [open]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await activitiesAPI.getRecent(20);
            const activities: Activity[] = res.data.data || [];
            const mapped: Notification[] = activities.map(activityToNotification);
            // Preserve read state from existing notifications
            const existingReadIds = new Set(notifications.filter(n => n.read).map(n => n._id));
            const finalNotifications = mapped.map(n => ({
                ...n,
                read: existingReadIds.has(n._id),
            }));
            dispatch(setNotifications(finalNotifications));
        } catch {
            // Silently fail — notifications are non-critical
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = (id: string) => {
        dispatch(markNotificationRead(id));
    };

    const handleMarkAllRead = () => {
        dispatch(markAllNotificationsRead());
    };

    const handleNotificationClick = (notification: Notification) => {
        dispatch(markNotificationRead(notification._id));
        setOpen(false);
        // Navigate based on notification type
        if (notification.type.startsWith('project')) {
            router.push('/projects');
        } else if (notification.type.startsWith('task') || notification.type === 'deadline_approaching' || notification.type === 'status_change') {
            router.push('/tasks');
        } else if (notification.type === 'member_added') {
            router.push('/team');
        } else {
            router.push('/activities');
        }
    };

    const formatTimeAgo = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-sky-600 text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] glass-panel rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-fade-in-up overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                                    {unreadCount} new
                                </span>
                            )}
                        </h3>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-sky-600 dark:text-sky-400 transition-colors cursor-pointer"
                                    title="Mark all as read"
                                    aria-label="Mark all notifications as read"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                                aria-label="Close notifications"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="w-6 h-6 border-3 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 dark:text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {notifications.map((notification) => {
                                    const iconConfig = typeIconMap[notification.type] || {
                                        icon: <AlertCircle className="w-4 h-4" />,
                                        color: 'text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:border-slate-800',
                                    };

                                    return (
                                        <div
                                            key={notification._id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${!notification.read ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''}`}
                                        >
                                            {/* Unread indicator + Icon */}
                                            <div className="flex items-center gap-2 pt-0.5">
                                                {!notification.read && (
                                                    <span className="w-2 h-2 rounded-full bg-sky-600 flex-shrink-0"></span>
                                                )}
                                                <div className={`w-7 h-7 rounded-full border flex items-center justify-center flex-shrink-0 ${iconConfig.color}`}>
                                                    {iconConfig.icon}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                    {notification.text}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </span>
                                                    {notification.user && (
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                                            • {(notification.user as UserType).name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mark as read button (only for unread) */}
                                            {!notification.read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkRead(notification._id);
                                                    }}
                                                    className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer flex-shrink-0 mt-0.5"
                                                    title="Mark as read"
                                                    aria-label="Mark notification as read"
                                                >
                                                    <CheckCheck className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Footer - View All */}
                    {notifications.length > 0 && (
                        <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-2.5">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    router.push('/activities');
                                }}
                                className="w-full text-center text-sm font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer"
                            >
                                View All Activity
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}