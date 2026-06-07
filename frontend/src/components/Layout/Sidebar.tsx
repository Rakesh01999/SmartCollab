'use client';

import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toggleSidebar, setSidebarOpen, showToast } from '../../store/appSlice';
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Home
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { RootState, AppDispatch } from '../../store/store';

export default function Sidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.auth.user);
  const sidebarOpen = useSelector((state: RootState) => state.app.sidebarOpen);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on mobile screens initially
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  }, [dispatch]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    dispatch(showToast({
      message: newTheme === 'light' ? 'Light mode enabled' : 'Dark mode enabled',
      type: 'success'
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
    router.push('/');
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    // Auto-close sidebar on mobile after navigation
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  };

  const navItems = [
    { path: '/', name: 'Home', icon: <Home className="w-5 h-5" /> },
    { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/projects', name: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
    { path: '/tasks', name: 'Kanban Board', icon: <ListTodo className="w-5 h-5" /> },
    { path: '/team', name: 'Team Members', icon: <Users className="w-5 h-5" /> },
    { path: '/activities', name: 'Activity Logs', icon: <Activity className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile backdrop overlay - click outside to close sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      <aside
        className={`glass-panel border-r min-h-screen flex flex-col justify-between transition-all duration-300 z-30 fixed lg:relative ${sidebarOpen ? 'w-64' : 'w-64 lg:w-20'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div>
          {/* Brand / Logo section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <img src="/logo.png" alt="SmartCollab" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(14, 165, 233,0.5)]" />
              {sidebarOpen && (
                <span className="font-bold text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-teal-500 dark:from-sky-400 dark:to-teal-400 whitespace-nowrap">
                  SmartCollab
                </span>
              )}
            </div>

            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors hidden lg:block cursor-pointer"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* User Card */}
          {user && (
            <div className={`p-4 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3 overflow-hidden ${!sidebarOpen && 'justify-center'}`}>
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-sky-600/30 bg-white dark:bg-slate-800"
              />
              {sidebarOpen && (
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate text-slate-800 dark:text-slate-100">{user.name}</h3>
                  <span className="inline-block text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 dark:bg-sky-950 dark:border-sky-500/30 dark:text-sky-400 mt-0.5">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium transition-all cursor-pointer ${isActive
                    ? 'bg-sky-700 text-white shadow-[0_0_15px_-3px_rgba(14, 165, 233,0.4)]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    } ${!sidebarOpen && 'justify-center'}`}
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer operations (Theme switch & Logout) */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 space-y-1">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 cursor-pointer ${!sidebarOpen && 'justify-center'
              }`}
            disabled={!mounted}
          >
            {!mounted ? (
              <>
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800/50 animate-pulse" />
                {sidebarOpen && <span className="animate-pulse">Loading Theme...</span>}
              </>
            ) : theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-amber-400" />
                {sidebarOpen && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-sky-500" />
                {sidebarOpen && <span>Dark Mode</span>}
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer ${!sidebarOpen && 'justify-center'
              }`}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
