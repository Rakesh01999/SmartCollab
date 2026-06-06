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
  Moon
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { RootState, AppDispatch } from '../../store/store';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const sidebarOpen = useSelector((state: RootState) => state.app.sidebarOpen);
  const [theme, setTheme] = useState<string>('dark');

  useEffect(() => {
    // Initial theme load
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('collab_theme') || 'dark';
      setTheme(savedTheme);
      if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
      } else {
        document.body.classList.remove('light-mode');
      }
    }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('collab_theme', newTheme);
      if (newTheme === 'light') {
        document.body.classList.add('light-mode');
        dispatch(showToast({ message: 'Light mode enabled', type: 'success' }));
      } else {
        document.body.classList.remove('light-mode');
        dispatch(showToast({ message: 'Dark mode enabled', type: 'success' }));
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
  };

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    // Auto-close sidebar on mobile after navigation
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false));
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'projects', name: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
    { id: 'tasks', name: 'Kanban Board', icon: <ListTodo className="w-5 h-5" /> },
    { id: 'team', name: 'Team Members', icon: <Users className="w-5 h-5" /> },
    { id: 'activities', name: 'Activity Logs', icon: <Activity className="w-5 h-5" /> },
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
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                S
              </div>
              {sidebarOpen && (
                <span className="font-bold text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400 whitespace-nowrap">
                  SmartCollab
                </span>
              )}
            </div>

            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-1 rounded-md hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors hidden lg:block cursor-pointer"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

          {/* User Card */}
          {user && (
            <div className={`p-4 border-b border-slate-800/50 flex items-center gap-3 overflow-hidden ${!sidebarOpen && 'justify-center'}`}>
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-indigo-500/30 bg-slate-800"
              />
              {sidebarOpen && (
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">{user.name}</h3>
                  <span className="inline-block text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/30 text-indigo-400 mt-0.5">
                    {user.role}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium transition-all cursor-pointer ${isActive
                    ? 'bg-indigo-600 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
        <div className="p-3 border-t border-slate-800/50 space-y-1">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 cursor-pointer ${!sidebarOpen && 'justify-center'
              }`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-5 h-5 text-amber-400" />
                {sidebarOpen && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-indigo-400" />
                {sidebarOpen && <span>Dark Mode</span>}
              </>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm md:text-base font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 cursor-pointer ${!sidebarOpen && 'justify-center'
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
