'use client';

import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery, showToast, toggleSidebar, triggerRefresh } from '../../store/appSlice';
import { logout } from '../../store/authSlice';
import { Menu, Search, Database, Bell, RefreshCw, LogOut, User, ChevronDown } from 'lucide-react';
import { authAPI } from '../../lib/api';
import { useState, ChangeEvent, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RootState, AppDispatch } from '../../store/store';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchQuery = useSelector((state: RootState) => state.app.searchQuery);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      const res = await authAPI.seed();
      dispatch(showToast({ message: res.data.message || 'Database seeded successfully!', type: 'success' }));
      dispatch(triggerRefresh());
    } catch (error: any) {
      dispatch(showToast({ message: error.message || 'Seeding failed', type: 'error' }));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left section: mobile sidebar trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors lg:hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-lg md:text-xl lg:text-2xl text-slate-700 dark:text-slate-200 hidden md:block">
          {title}
        </h1>
      </div>

      {/* Middle section: Search bar */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            id="global-search-input"
            className="w-full pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-sm md:text-base text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Right section: Seed DB & Notifications */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSeedDatabase}
          disabled={seeding}
          className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/20 hover:border-indigo-400 dark:hover:border-indigo-500/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs md:text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all disabled:opacity-50 cursor-pointer"
          title="Reset database to default demo data"
        >
          {seeding ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Seed Demo Data</span>
        </button>

        <div className="relative p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
        </div>

        {/* Conditional User Profile Dropdown */}
        {isAuthenticated && user && (
          <div ref={profileRef} className="relative ml-1">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              aria-label="User profile menu"
            >
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-indigo-200 dark:border-indigo-500/20"
              />
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{user.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown */}
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-fade-in-up">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-indigo-200 dark:border-indigo-500/20"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950 dark:border-indigo-500/30 dark:text-indigo-400 mt-1">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      dispatch(logout());
                      dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
