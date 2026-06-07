'use client';

import { useSelector, useDispatch } from 'react-redux';
import { setSearchQuery, showToast, toggleSidebar } from '../../store/appSlice';
import { logout } from '../../store/authSlice';
import { Menu, Search, Bell, LogOut, User, ChevronDown, Home, ArrowRight } from 'lucide-react';
import { useState, ChangeEvent, useRef, useEffect, KeyboardEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RootState, AppDispatch } from '../../store/store';

interface NavbarProps {
  title: string;
}

export default function Navbar({ title }: NavbarProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const searchQuery = useSelector((state: RootState) => state.app.searchQuery);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
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

  const executeSearch = () => {
    if (!searchQuery.trim()) return;
    const query = encodeURIComponent(searchQuery.trim());
    // Navigate to the relevant page based on current context
    if (pathname.startsWith('/projects')) {
      router.push(`/projects?search=${query}`);
    } else if (pathname.startsWith('/activities')) {
      router.push(`/activities?search=${query}`);
    } else {
      // Default to tasks page for search
      router.push(`/tasks?search=${query}`);
    }
    dispatch(setSearchQuery(''));
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') executeSearch();
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
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            id="global-search-input"
            className="w-full pl-10 pr-10 py-2 bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-sm md:text-base text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-600/60 focus:ring-1 focus:ring-sky-600/30 transition-all"
          />
          <button
            onClick={executeSearch}
            className="absolute right-1.5 top-1.5 p-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
            aria-label="Search"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right section: Notifications & Profile */}
      <div className="flex items-center gap-2">
        <div className="relative p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-sky-600 rounded-full"></span>
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
                className="w-8 h-8 rounded-full border border-sky-200 dark:border-sky-500/20"
              />
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400">{user.role}</div>
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
                      className="w-10 h-10 rounded-full border border-sky-200 dark:border-sky-500/20"
                    />
                    <div>
                      <div className="font-semibold text-sm text-slate-800 dark:text-slate-100">{user.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 dark:bg-sky-950 dark:border-sky-500/30 dark:text-sky-400 mt-1">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors cursor-pointer"
                  >
                    <Home className="w-4 h-4" />
                    Home Page
                  </button>
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
