'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RootState } from '../../store/store';
import { loginSuccess, logout } from '../../store/authSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { authAPI } from '../../lib/api';
import Sidebar from '../../components/Layout/Sidebar';
import Navbar from '../../components/Layout/Navbar';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const viewTitles: Record<string, string> = {
    '/dashboard': 'Dashboard Insights',
    '/projects': 'Project Board',
    '/tasks': 'Kanban Task Board',
    '/team': 'Team Directory',
    '/activities': 'System Activity Log',
};

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const pathname = usePathname();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [sessionChecking, setSessionChecking] = useState<boolean>(true);

    // Check active user session on startup
    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('collab_token');
            if (!token) {
                setSessionChecking(false);
                return;
            }

            try {
                const res = await authAPI.me();
                dispatch(loginSuccess({ user: res.data.user, token }));
            } catch (error: any) {
                console.error('Session restore failed:', error.message);
                dispatch(logout());
            } finally {
                setSessionChecking(false);
            }
        };

        checkSession();
    }, [dispatch]);

    // Redirect to auth page if not authenticated
    useEffect(() => {
        if (!sessionChecking && !isAuthenticated) {
            router.push('/auth');
        }
    }, [sessionChecking, isAuthenticated, router]);

    if (sessionChecking) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Restoring secure session...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const title = viewTitles[pathname] || 'SmartCollab';

    return (
        <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden transition-colors duration-300">
            {/* Dynamic ambient glowing light */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-sky-700/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] bg-teal-600/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Sidebar - fixed on mobile, static on desktop */}
            <Sidebar />

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden transition-all duration-300">

                {/* Top Navbar */}
                <Navbar title={title} />

                {/* Dynamic Viewport */}
                <main className="flex-1 flex flex-col min-h-0 bg-[var(--background)] pb-12 transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
}