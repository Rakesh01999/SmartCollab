'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { logout } from '../../store/authSlice';
import { showToast } from '../../store/appSlice';
import {
    ArrowRight,
    LayoutDashboard,
    Users,
    CheckSquare,
    FolderKanban,
    Activity,
    Shield,
    Zap,
    Globe,
    ChevronRight,
    Star,
    Menu,
    X,
    Moon,
    Sun,
    ChevronDown,
    LogOut,
    User,
    TrendingUp,
    ClipboardList,
    Rocket,
    CheckCircle,
    BarChart3,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Footer from '../Layout/Footer';

export default function HomePage() {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
    const [animatedStats, setAnimatedStats] = useState<number[]>([0, 0, 0, 0]);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const statsAnimatedRef = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleSections((prev) => new Set(prev).add(entry.target.id));
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
        );

        const sections = document.querySelectorAll('[data-animate]');
        sections.forEach((s) => observer.observe(s));

        return () => observer.disconnect();
    }, []);

    // Animated stats counter — triggers when stats section becomes visible
    useEffect(() => {
        if (visibleSections.has('stats') && !statsAnimatedRef.current) {
            statsAnimatedRef.current = true;
            const targets = [10, 50, 99.9, 4.9];
            const duration = 2000;
            const steps = 60;
            const interval = duration / steps;

            let currentStep = 0;
            const timer = setInterval(() => {
                currentStep++;
                const progress = currentStep / steps;
                setAnimatedStats(
                    targets.map((t, i) => {
                        const val = t * progress;
                        return i < 2 ? Math.round(val) : Math.round(val * 10) / 10;
                    })
                );
                if (currentStep >= steps) {
                    clearInterval(timer);
                    setAnimatedStats(targets);
                }
            }, interval);

            return () => clearInterval(timer);
        }
    }, [visibleSections]);

    const isAnimated = (id: string) => visibleSections.has(id);

    const formatStat = (val: number, idx: number): string => {
        if (idx === 0) return `${val}K+`;
        if (idx === 1) return `${val}K+`;
        if (idx === 2) return `${val.toFixed(1)}%`;
        return val.toFixed(1);
    };

    const features = [
        {
            icon: FolderKanban,
            title: 'Project Management',
            description: 'Organize projects with intuitive boards, track milestones, and keep your team aligned on every deliverable.',
            color: 'from-sky-600 to-blue-600',
            shadowColor: 'rgba(14, 165, 233, 0.3)',
        },
        {
            icon: CheckSquare,
            title: 'Smart Task Tracking',
            description: 'Kanban-style task boards with drag-and-drop ease. Assign, prioritize, and monitor tasks in real time.',
            color: 'from-teal-500 to-teal-600',
            shadowColor: 'rgba(20, 184, 166, 0.3)',
        },
        {
            icon: Users,
            title: 'Team Collaboration',
            description: 'Build your dream team directory. View roles, track contributions, and foster seamless communication.',
            color: 'from-cyan-500 to-teal-600',
            shadowColor: 'rgba(6, 182, 212, 0.3)',
        },
        {
            icon: Activity,
            title: 'Activity Insights',
            description: 'Real-time activity logs keep everyone in the loop. Never miss an update on project progress.',
            color: 'from-amber-500 to-orange-600',
            shadowColor: 'rgba(245, 158, 11, 0.3)',
        },
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Enterprise-grade authentication with JWT tokens. Your data stays protected with role-based access control.',
            color: 'from-emerald-500 to-green-600',
            shadowColor: 'rgba(16, 185, 129, 0.3)',
        },
        {
            icon: Zap,
            title: 'Blazing Fast',
            description: 'Optimized performance with real-time updates. Experience zero-lag dashboards and instant data syncing.',
            color: 'from-rose-500 to-pink-600',
            shadowColor: 'rgba(244, 63, 94, 0.3)',
        },
    ];

    const stats = [
        { label: 'Active Teams' },
        { label: 'Tasks Completed' },
        { label: 'Uptime' },
        { label: 'User Rating', icon: Star },
    ];

    const testimonials = [
        {
            name: 'Sarah Chen',
            role: 'Product Manager at TechFlow',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah',
            text: 'SmartCollab transformed how our team coordinates. The Kanban board is intuitive and the activity logs keep everyone accountable.',
        },
        {
            name: 'Marcus Rivera',
            role: 'Engineering Lead at DevSphere',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Marcus',
            text: 'We cut our project delivery time by 30% after switching to SmartCollab. The real-time tracking is a game-changer for distributed teams.',
        },
        {
            name: 'Aisha Patel',
            role: 'CTO at InnovateLab',
            avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisha',
            text: 'The security features give me peace of mind, and the sleek interface means our team actually enjoys using it every day.',
        },
    ];

    const workflowSteps = [
        {
            icon: ClipboardList,
            title: 'Plan',
            desc: 'Create projects, define tasks, and set milestones with intuitive boards.',
            color: 'from-sky-600 to-blue-600',
            step: 1,
        },
        {
            icon: Rocket,
            title: 'Execute',
            desc: 'Assign tasks, track progress in real-time, and collaborate seamlessly.',
            color: 'from-teal-500 to-teal-600',
            step: 2,
        },
        {
            icon: CheckCircle,
            title: 'Deliver',
            desc: 'Review activity logs, measure outcomes, and ship with confidence.',
            color: 'from-emerald-500 to-green-600',
            step: 3,
        },
    ];

    const trustedBrands = ['TechFlow', 'DevSphere', 'InnovateLab', 'CloudNine', 'DataPulse', 'NexGen', 'QuantumAI', 'SwiftBuild'];

    return (
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden">
            {/* ===== NAVBAR ===== */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'glass-panel border-b border-[var(--card-border)] shadow-lg'
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 to-teal-600 flex items-center justify-center shadow-lg shadow-sky-600/25">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                Smart<span className="text-sky-600">Collab</span>
                            </span>
                        </div>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#how-it-works" className="text-sm font-medium text-[var(--text-muted)] hover:text-sky-600 transition-colors">
                                How It Works
                            </a>
                            <a href="#features" className="text-sm font-medium text-[var(--text-muted)] hover:text-sky-600 transition-colors">
                                Features
                            </a>
                            <a href="#stats" className="text-sm font-medium text-[var(--text-muted)] hover:text-sky-600 transition-colors">
                                Impact
                            </a>
                            <a href="#testimonials" className="text-sm font-medium text-[var(--text-muted)] hover:text-sky-600 transition-colors">
                                Testimonials
                            </a>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="p-2 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-sky-600 transition-all cursor-pointer"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                            )}

                            {/* Conditional User Profile Dropdown (Desktop) */}
                            {isAuthenticated && user && (
                                <div ref={profileRef} className="relative hidden sm:block">
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--hover-bg)] transition-colors cursor-pointer"
                                        aria-label="User profile menu"
                                    >
                                        <img
                                            src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full border border-sky-200 dark:border-sky-500/20"
                                        />
                                        <div className="text-left">
                                            <div className="text-sm font-semibold text-[var(--foreground)] truncate max-w-[100px]">{user.name}</div>
                                            <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400">{user.role}</div>
                                        </div>
                                        <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {profileOpen && (
                                        <div className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl border border-[var(--card-border)] shadow-xl z-50 animate-fade-in-up">
                                            <div className="p-4 border-b border-[var(--card-border)]">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full border border-sky-200 dark:border-sky-500/20"
                                                    />
                                                    <div>
                                                        <div className="font-semibold text-sm text-[var(--foreground)]">{user.name}</div>
                                                        <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
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
                                                        router.push('/dashboard');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors cursor-pointer"
                                                >
                                                    <LayoutDashboard className="w-4 h-4" />
                                                    Dashboard
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

                            {/* CTA Button - shown when NOT authenticated */}
                            {!isAuthenticated && (
                                <button
                                    onClick={() => router.push('/auth')}
                                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-600/25 hover:-translate-y-0.5 transition-all cursor-pointer"
                                >
                                    Get Started
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] transition-colors cursor-pointer"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden glass-panel border-t border-[var(--card-border)] animate-slide-down">
                        <div className="px-4 py-4 flex flex-col gap-3">
                            <a href="#how-it-works" className="text-sm font-medium text-[var(--text-muted)] hover:text-sky-600 transition-colors py-2">
                                How It Works
                            </a>
                            <a href="#features" className="text-sm font-medium text-[var(--text-muted)] hover:text-sky-600 transition-colors py-2">
                                Features
                            </a>
                            <a href="#stats" className="text-sm font-medium text-[var(--text-muted)] hover:text-sky-600 transition-colors py-2">
                                Impact
                            </a>
                            <a href="#testimonials" className="text-sm font-medium text-[var(--text-muted)] hover:text-sky-600 transition-colors py-2">
                                Testimonials
                            </a>

                            {/* Mobile: Authenticated user profile section */}
                            {isAuthenticated && user && (
                                <div className="border-t border-[var(--card-border)] pt-3 mt-1">
                                    <div className="flex items-center gap-3 px-2 py-2">
                                        <img
                                            src={user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                                            alt={user.name}
                                            className="w-9 h-9 rounded-full border border-sky-200 dark:border-sky-500/20"
                                        />
                                        <div>
                                            <div className="text-sm font-semibold text-[var(--foreground)]">{user.name}</div>
                                            <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 dark:bg-sky-950 dark:border-sky-500/30 dark:text-sky-400 mt-1">
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            router.push('/dashboard');
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors cursor-pointer"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
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
                            )}

                            {/* Mobile: CTA button for guests */}
                            {!isAuthenticated && (
                                <button
                                    onClick={() => router.push('/auth')}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-600/25 transition-all cursor-pointer"
                                >
                                    Get Started
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 overflow-hidden">
                {/* Ambient glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-700/10 dark:bg-sky-600/20 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-teal-600/8 dark:bg-teal-600/15 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Floating decorative elements */}
                <div className="absolute top-32 left-[10%] w-3 h-3 bg-sky-500/40 rounded-full animate-float-slow pointer-events-none"></div>
                <div className="absolute top-48 right-[15%] w-2 h-2 bg-teal-400/40 rounded-full animate-float-medium pointer-events-none"></div>
                <div className="absolute top-64 left-[70%] w-4 h-4 bg-cyan-400/30 rounded-full animate-float-fast pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-600/10 dark:bg-sky-500/20 border border-sky-600/20 dark:border-sky-500/30 text-sky-700 dark:text-sky-400 text-sm font-medium mb-6 animate-fade-in-up">
                            <Zap className="w-4 h-4" />
                            Next-gen team collaboration platform
                        </div>

                        {/* Main headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-5 animate-fade-in-up-delay-1">
                            Collaborate.
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-teal-500 to-teal-600">
                                Create.
                            </span>
                            <br />
                            Deliver together.
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-in-up-delay-2">
                            SmartCollab empowers teams with intuitive project boards, smart task tracking, and real-time activity insights — all in one beautifully crafted workspace.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-3">
                            <button
                                onClick={() => isAuthenticated ? router.push('/dashboard') : router.push('/auth')}
                                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-2xl text-base font-semibold hover:shadow-xl hover:shadow-sky-600/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Free Today'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-base font-semibold hover:border-sky-600/40 hover:shadow-lg hover:shadow-sky-600/10 hover:-translate-y-1 transition-all duration-300"
                            >
                                Explore Features
                                <ChevronRight className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Hero visual — Dashboard preview mockup */}
                        <div className="mt-12 sm:mt-14 relative animate-fade-in-up-delay-4">
                            <div className="relative mx-auto max-w-5xl">
                                {/* Glow behind the card */}
                                <div className="absolute inset-0 bg-gradient-to-r from-sky-600/20 via-teal-500/20 to-teal-500/20 rounded-3xl blur-2xl scale-[0.98] pointer-events-none"></div>

                                {/* Main mockup card */}
                                <div className="relative glass-panel rounded-2xl overflow-hidden border border-[var(--card-border)]">
                                    {/* Mockup top bar */}
                                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--card-border)]">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                                        </div>
                                        <div className="flex-1 max-w-sm mx-auto">
                                            <div className="h-5 bg-[var(--hover-bg)] rounded-md flex items-center justify-center text-xs text-[var(--text-muted)]">
                                                smartcollab.app/dashboard
                                            </div>
                                        </div>
                                    </div>

                                    {/* Mockup dashboard content */}
                                    <div className="p-6 grid grid-cols-3 gap-4 min-h-[200px] sm:min-h-[280px]">
                                        {/* Sidebar mock */}
                                        <div className="col-span-1 hidden sm:block">
                                            <div className="space-y-2">
                                                <div className="h-8 bg-sky-600/10 dark:bg-sky-500/20 rounded-lg flex items-center px-3 text-xs text-sky-600 font-medium">
                                                    📊 Dashboard
                                                </div>
                                                <div className="h-8 bg-[var(--hover-bg)] rounded-lg flex items-center px-3 text-xs text-[var(--text-muted)]">
                                                    📁 Projects
                                                </div>
                                                <div className="h-8 bg-[var(--hover-bg)] rounded-lg flex items-center px-3 text-xs text-[var(--text-muted)]">
                                                    ✅ Tasks
                                                </div>
                                                <div className="h-8 bg-[var(--hover-bg)] rounded-lg flex items-center px-3 text-xs text-[var(--text-muted)]">
                                                    👥 Team
                                                </div>
                                                <div className="h-8 bg-[var(--hover-bg)] rounded-lg flex items-center px-3 text-xs text-[var(--text-muted)]">
                                                    📋 Activity
                                                </div>
                                            </div>
                                        </div>

                                        {/* Main content mock */}
                                        <div className="col-span-3 sm:col-span-2 space-y-4">
                                            {/* Stats row */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[
                                                    { label: 'Projects', val: '12', color: 'sky' },
                                                    { label: 'Tasks Done', val: '84', color: 'emerald' },
                                                    { label: 'In Progress', val: '23', color: 'amber' },
                                                    { label: 'Team Size', val: '8', color: 'teal' },
                                                ].map((s) => (
                                                    <div key={s.label} className="p-3 bg-[var(--hover-bg)] rounded-xl text-center">
                                                        <div className={`text-lg font-bold text-${s.color}-500`}>{s.val}</div>
                                                        <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Progress bars */}
                                            <div className="space-y-3">
                                                {[
                                                    { name: 'Website Redesign', pct: 75, color: 'bg-sky-600' },
                                                    { name: 'Mobile App v2', pct: 45, color: 'bg-teal-500' },
                                                    { name: 'API Integration', pct: 90, color: 'bg-emerald-500' },
                                                ].map((p) => (
                                                    <div key={p.name} className="flex items-center gap-3">
                                                        <span className="text-xs text-[var(--text-secondary)] w-28 sm:w-36 truncate">{p.name}</span>
                                                        <div className="flex-1 h-2 bg-[var(--progress-bg)] rounded-full overflow-hidden">
                                                            <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.pct}%` }}></div>
                                                        </div>
                                                        <span className="text-xs text-[var(--text-muted)]">{p.pct}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== NETWORK FLOW INFOGRAPHIC ===== */}
            <section id="network-flow" data-animate className="py-16 sm:py-24 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    {/* Mesh gradient background */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-sky-700/5 via-teal-600/5 to-cyan-600/5 dark:from-sky-600/10 dark:via-teal-600/10 dark:to-cyan-600/10 rounded-full blur-[150px] animate-mesh-float"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className={`text-center max-w-2xl mx-auto mb-12 transition-all duration-700 ${isAnimated('network-flow') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-600/10 dark:bg-sky-500/20 border border-sky-600/20 dark:border-sky-500/30 text-sky-700 dark:text-sky-400 text-sm font-medium mb-4">
                            <Activity className="w-4 h-4" />
                            Seamless Data Flow
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                            Everything{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                                connected
                            </span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Your projects, tasks, team, and insights — all flowing together in real time.
                        </p>
                    </div>

                    {/* Large SVG Network Infographic */}
                    <div className={`relative transition-all duration-700 ${isAnimated('network-flow') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                        <svg viewBox="0 0 800 300" className="w-full max-w-4xl mx-auto h-auto" xmlns="http://www.w3.org/2000/svg">
                            {/* Animated connection paths */}
                            <path d="M 150 150 C 250 80, 350 80, 400 150" stroke="url(#pathGrad1)" strokeWidth="2" fill="none" strokeDasharray="8 4" className="animate-dash-draw" />
                            <path d="M 400 150 C 450 220, 550 220, 650 150" stroke="url(#pathGrad2)" strokeWidth="2" fill="none" strokeDasharray="8 4" className="animate-dash-draw" style={{ animationDelay: '0.5s' }} />
                            <path d="M 150 150 C 200 220, 300 220, 400 150" stroke="url(#pathGrad3)" strokeWidth="1.5" fill="none" strokeDasharray="6 3" className="animate-dash-draw" style={{ animationDelay: '0.3s' }} />
                            <path d="M 400 150 C 500 80, 600 80, 650 150" stroke="url(#pathGrad1)" strokeWidth="1.5" fill="none" strokeDasharray="6 3" className="animate-dash-draw" style={{ animationDelay: '0.7s' }} />
                            <path d="M 150 150 L 400 150" stroke="url(#pathGrad2)" strokeWidth="1" fill="none" opacity="0.3" />
                            <path d="M 400 150 L 650 150" stroke="url(#pathGrad3)" strokeWidth="1" fill="none" opacity="0.3" />

                            {/* Gradient definitions */}
                            <defs>
                                <linearGradient id="pathGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#0ea5e9" />
                                    <stop offset="100%" stopColor="#14b8a6" />
                                </linearGradient>
                                <linearGradient id="pathGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#14b8a6" />
                                    <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                                <linearGradient id="pathGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>

                            {/* Node: Projects */}
                            <g filter="url(#glow)">
                                <circle cx="150" cy="150" r="40" fill="none" stroke="#0ea5e9" strokeWidth="2" opacity="0.3" className="animate-ripple-expand" />
                                <circle cx="150" cy="150" r="30" fill="none" stroke="#0ea5e9" strokeWidth="1.5" opacity="0.5" className="animate-pulse-ring" />
                                <circle cx="150" cy="150" r="20" fill="#0ea5e9" opacity="0.15" />
                                <circle cx="150" cy="150" r="12" fill="#0ea5e9" className="animate-node-pulse" />
                                <text x="150" y="85" textAnchor="middle" fill="#0ea5e9" fontSize="13" fontWeight="600">Projects</text>
                                <text x="150" y="200" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.5">12 active</text>
                            </g>

                            {/* Node: Hub (center) */}
                            <g filter="url(#glow)">
                                <circle cx="400" cy="150" r="50" fill="none" stroke="#14b8a6" strokeWidth="2" opacity="0.3" className="animate-ripple-expand" style={{ animationDelay: '1s' }} />
                                <circle cx="400" cy="150" r="38" fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.5" className="animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
                                <circle cx="400" cy="150" r="26" fill="#14b8a6" opacity="0.15" />
                                <circle cx="400" cy="150" r="16" fill="#14b8a6" className="animate-node-pulse" style={{ animationDelay: '0.3s' }} />
                                <text x="400" y="80" textAnchor="middle" fill="#14b8a6" fontSize="14" fontWeight="700">SmartCollab</text>
                                <text x="400" y="210" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.5">Real-time sync</text>
                            </g>

                            {/* Node: Tasks */}
                            <g filter="url(#glow)">
                                <circle cx="650" cy="150" r="40" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.3" className="animate-ripple-expand" style={{ animationDelay: '2s' }} />
                                <circle cx="650" cy="150" r="30" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" className="animate-pulse-ring" style={{ animationDelay: '1s' }} />
                                <circle cx="650" cy="150" r="20" fill="#06b6d4" opacity="0.15" />
                                <circle cx="650" cy="150" r="12" fill="#06b6d4" className="animate-node-pulse" style={{ animationDelay: '0.6s' }} />
                                <text x="650" y="85" textAnchor="middle" fill="#06b6d4" fontSize="13" fontWeight="600">Tasks</text>
                                <text x="650" y="200" textAnchor="middle" fill="currentColor" fontSize="10" opacity="0.5">84 completed</text>
                            </g>

                            {/* Floating data particles along paths */}
                            <circle r="3" fill="#0ea5e9" opacity="0.8">
                                <animateMotion dur="3s" repeatCount="indefinite" path="M 150 150 C 250 80, 350 80, 400 150" />
                            </circle>
                            <circle r="3" fill="#14b8a6" opacity="0.8">
                                <animateMotion dur="3s" repeatCount="indefinite" path="M 400 150 C 450 220, 550 220, 650 150" begin="1s" />
                            </circle>
                            <circle r="2.5" fill="#06b6d4" opacity="0.7">
                                <animateMotion dur="4s" repeatCount="indefinite" path="M 150 150 C 200 220, 300 220, 400 150" begin="0.5s" />
                            </circle>
                            <circle r="2.5" fill="#0ea5e9" opacity="0.7">
                                <animateMotion dur="4s" repeatCount="indefinite" path="M 400 150 C 500 80, 600 80, 650 150" begin="1.5s" />
                            </circle>
                        </svg>

                        {/* Floating particle decorations around the infographic */}
                        <div className="absolute top-[10%] left-[5%] w-3 h-3 bg-sky-500/30 rounded-full animate-float-particle pointer-events-none"></div>
                        <div className="absolute top-[60%] left-[8%] w-2 h-2 bg-teal-400/30 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-[20%] right-[5%] w-3 h-3 bg-cyan-400/30 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute bottom-[15%] right-[10%] w-2 h-2 bg-emerald-400/30 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                </div>
            </section>

            {/* ===== ANIMATED WAVE SEPARATOR ===== */}
            <div className="relative h-24 sm:h-32 overflow-hidden">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full animate-wave-move text-sky-600/10 dark:text-sky-500/20">
                    <path d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 C1350,120 1550,0 1800,60 C2050,120 2250,0 2400,60 L2400,120 L0,120 Z" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full animate-wave-move text-teal-500/8 dark:text-teal-500/15" style={{ animationDelay: '2s' }}>
                    <path d="M0,80 C200,20 400,100 600,80 C800,20 1000,100 1200,80 C1400,20 1600,100 1800,80 C2000,20 2200,100 2400,80 L2400,120 L0,120 Z" fill="currentColor" />
                </svg>
            </div>

            {/* ===== HOW IT WORKS SECTION ===== */}
            <section id="how-it-works" data-animate className="py-12 sm:py-16 relative">
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Section header */}
                    <div
                        className={`text-center max-w-2xl mx-auto mb-10 transition-all duration-700 ${isAnimated('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-4">
                            <Rocket className="w-4 h-4" />
                            Simple & Powerful
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
                            How it{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-600">
                                works
                            </span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Three simple steps to transform your team's productivity.
                        </p>
                    </div>

                    {/* Workflow Steps */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
                        {workflowSteps.map((step, idx) => (
                            <div
                                key={step.title}
                                className={`flex flex-col md:flex-row items-center transition-all duration-700 ${isAnimated('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                                style={{ transitionDelay: isAnimated('how-it-works') ? `${idx * 200}ms` : '0ms' }}
                            >
                                {/* Step Card */}
                                <div className="flex flex-col items-center text-center max-w-[220px]">
                                    {/* Ripple ring effect around step icon */}
                                    <div className="relative mb-4">
                                        <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-br ${step.color} opacity-15 animate-ripple-expand`}></div>
                                        <div
                                            className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center animate-pulse-glow shadow-lg`}
                                            style={{ boxShadow: `0 8px 24px -4px rgba(14, 165, 233, 0.3)` }}
                                        >
                                            <step.icon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-sky-600 dark:text-sky-400 mb-2 tracking-wider uppercase">
                                        Step {step.step}
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                                </div>

                                {/* Connector line — horizontal on desktop, vertical on mobile */}
                                {idx < 2 && (
                                    <div className="hidden md:flex items-center mx-4 lg:mx-8">
                                        <div className="w-20 lg:w-32 h-0.5 bg-gradient-to-r from-sky-600/30 to-teal-500/30 animate-draw-line relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-teal-500 rounded-full shadow-md shadow-teal-500/30"></div>
                                        </div>
                                    </div>
                                )}
                                {idx < 2 && (
                                    <div className="md:hidden flex justify-center py-2">
                                        <div className="w-0.5 h-10 bg-gradient-to-b from-sky-600/30 to-teal-500/30 relative">
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-teal-500 rounded-full shadow-md shadow-teal-500/30"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section id="features" data-animate className="py-12 sm:py-16 relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-700/5 dark:bg-sky-600/10 rounded-full blur-[120px] pointer-events-none"></div>
                {/* Floating particles */}
                <div className="absolute top-[20%] left-[5%] w-2.5 h-2.5 bg-sky-500/20 rounded-full animate-float-particle pointer-events-none"></div>
                <div className="absolute top-[40%] right-[10%] w-3 h-3 bg-teal-400/20 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute bottom-[30%] left-[15%] w-2 h-2 bg-teal-400/20 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '3s' }}></div>
                <div className="absolute top-[60%] right-[25%] w-2 h-2 bg-cyan-400/15 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '0.5s' }}></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Section header */}
                    <div
                        className={`text-center max-w-2xl mx-auto mb-10 transition-all duration-700 ${isAnimated('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 dark:bg-teal-500/20 border border-teal-500/20 dark:border-teal-500/30 text-teal-600 dark:text-teal-400 text-sm font-medium mb-4">
                            <Globe className="w-4 h-4" />
                            Everything you need
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
                            Powerful features for{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
                                modern teams
                            </span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            From project planning to real-time collaboration, SmartCollab gives your team the tools to ship faster and smarter.
                        </p>
                    </div>

                    {/* Features grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((feature, idx) => (
                            <div
                                key={feature.title}
                                className={`group relative glass-panel rounded-2xl p-5 glass-card-hover transition-all duration-700 ${isAnimated('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: isAnimated('features') ? `${idx * 100}ms` : '0ms' }}
                            >
                                {/* Icon */}
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                    style={{ boxShadow: `0 8px 16px -4px ${feature.shadowColor}` }}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-lg font-bold mb-1.5">{feature.title}</h3>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{feature.description}</p>

                                {/* Hover glow */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-600/0 to-teal-500/0 group-hover:from-sky-600/5 group-hover:to-teal-500/5 transition-all duration-300 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== ANIMATED WAVE SEPARATOR ===== */}
            <div className="relative h-20 sm:h-28 overflow-hidden">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full animate-wave-move text-cyan-500/8 dark:text-cyan-500/15">
                    <path d="M0,40 C200,100 400,0 600,40 C800,100 1000,0 1200,40 C1400,100 1600,0 1800,40 C2000,100 2200,0 2400,40 L2400,120 L0,120 Z" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full animate-wave-move text-teal-500/6 dark:text-teal-500/12" style={{ animationDelay: '3s' }}>
                    <path d="M0,60 C200,20 400,80 600,60 C800,20 1000,80 1200,60 C1400,20 1600,80 1800,60 C2000,20 2200,80 2400,60 L2400,120 L0,120 Z" fill="currentColor" />
                </svg>
            </div>

            {/* ===== TRUSTED BY TICKER ===== */}
            <section id="trusted-by" data-animate className="py-8 sm:py-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className={`text-center mb-6 transition-all duration-700 ${isAnimated('trusted-by') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-widest">
                            Trusted by innovative teams worldwide
                        </p>
                    </div>
                </div>
                <div className="relative">
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none"></div>

                    <div className="flex animate-scroll-left">
                        {[...Array(2)].map((_, dupIdx) => (
                            <div key={dupIdx} className="flex items-center gap-10 sm:gap-14 px-6 whitespace-nowrap">
                                {trustedBrands.map((brand) => (
                                    <div key={`${brand}-${dupIdx}`} className="flex items-center gap-2 text-[var(--text-muted)] opacity-60 hover:opacity-100 transition-opacity">
                                        <BarChart3 className="w-5 h-5 text-sky-600/70" />
                                        <span className="text-base sm:text-lg font-semibold tracking-tight">{brand}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DECORATIVE MESH GRADIENT ===== */}
            <div className="relative h-16 sm:h-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/3 via-sky-700/5 to-cyan-600/3 dark:from-teal-600/8 dark:via-sky-600/10 dark:to-cyan-600/8 animate-mesh-float pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-sky-600/5 dark:bg-sky-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            </div>

            {/* ===== STATS SECTION ===== */}
            <section id="stats" data-animate className="py-12 sm:py-16 relative">
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/5 dark:bg-teal-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div
                        className={`text-center max-w-2xl mx-auto mb-10 transition-all duration-700 ${isAnimated('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
                            Trusted by teams{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-600">
                                worldwide
                            </span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Numbers that speak for themselves. SmartCollab delivers measurable impact for teams of all sizes.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => {
                            const ringPercentages = [75, 85, 99, 98];
                            const ringColors = ['#0ea5e9', '#14b8a6', '#06b6d4', '#f59e0b'];
                            const circumference = 2 * Math.PI * 45;
                            const offset = circumference - (ringPercentages[idx] / 100) * circumference;
                            return (
                                <div
                                    key={stat.label}
                                    className={`glass-panel rounded-2xl p-6 text-center glass-card-hover transition-all duration-700 ${isAnimated('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                        }`}
                                    style={{ transitionDelay: isAnimated('stats') ? `${idx * 100}ms` : '0ms' }}
                                >
                                    {/* Animated ring chart */}
                                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-3">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            {/* Background ring */}
                                            <circle cx="50" cy="50" r="45" stroke="var(--progress-bg)" strokeWidth="5" fill="none" />
                                            {/* Progress ring with animation */}
                                            <circle
                                                cx="50" cy="50" r="45"
                                                stroke={ringColors[idx]}
                                                strokeWidth="5"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={isAnimated('stats') ? offset : circumference}
                                                className="transition-all duration-[2s] ease-out"
                                                style={{ filter: `drop-shadow(0 0 6px ${ringColors[idx]}40)` }}
                                            />
                                        </svg>
                                        {/* Center value */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
                                                {formatStat(animatedStats[idx], idx)}
                                                {stat.icon && <Star className="w-4 h-4 inline-block ml-0.5 text-amber-400 fill-amber-400" />}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ===== ANIMATED WAVE SEPARATOR ===== */}
            <div className="relative h-20 sm:h-28 overflow-hidden">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full animate-wave-move text-amber-500/8 dark:text-amber-500/15">
                    <path d="M0,80 C200,20 400,100 600,80 C800,20 1000,100 1200,80 C1400,20 1600,100 1800,80 C2000,20 2200,100 2400,80 L2400,120 L0,120 Z" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute bottom-0 w-[200%] h-full animate-wave-move text-orange-500/6 dark:text-orange-500/12" style={{ animationDelay: '2.5s' }}>
                    <path d="M0,50 C200,90 400,10 600,50 C800,90 1000,10 1200,50 C1400,90 1600,10 1800,50 C2000,90 2200,10 2400,50 L2400,120 L0,120 Z" fill="currentColor" />
                </svg>
            </div>

            {/* ===== TESTIMONIALS SECTION ===== */}
            <section id="testimonials" data-animate className="py-12 sm:py-16 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-700/5 dark:bg-sky-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div
                        className={`text-center max-w-2xl mx-auto mb-10 transition-all duration-700 ${isAnimated('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
                            Loved by{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                                industry leaders
                            </span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            See what team leads and founders are saying about their SmartCollab experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {testimonials.map((t, idx) => (
                            <div
                                key={t.name}
                                className={`glass-panel rounded-2xl p-5 glass-card-hover transition-all duration-700 ${isAnimated('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: isAnimated('testimonials') ? `${idx * 150}ms` : '0ms' }}
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>

                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
                                    &ldquo;{t.text}&rdquo;
                                </p>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={t.avatar}
                                        alt={t.name}
                                        className="w-10 h-10 rounded-full border border-[var(--card-border)]"
                                    />
                                    <div>
                                        <div className="font-semibold text-sm">{t.name}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section data-animate className="py-12 sm:py-16 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div
                        className={`relative glass-panel rounded-3xl p-8 sm:p-10 lg:p-14 text-center overflow-hidden transition-all duration-700 ${isAnimated('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                            }`}
                    >
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/10 via-teal-500/5 to-teal-500/10 dark:from-sky-500/20 dark:via-teal-500/10 dark:to-teal-500/20 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-700/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-teal-600/10 rounded-full blur-[60px] pointer-events-none"></div>
                        {/* Floating particles */}
                        <div className="absolute top-[15%] left-[10%] w-3 h-3 bg-sky-500/20 rounded-full animate-float-particle pointer-events-none"></div>
                        <div className="absolute top-[25%] right-[15%] w-2 h-2 bg-teal-400/20 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute bottom-[20%] left-[20%] w-2.5 h-2.5 bg-teal-400/20 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute bottom-[30%] right-[8%] w-3 h-3 bg-cyan-400/15 rounded-full animate-float-particle pointer-events-none" style={{ animationDelay: '3s' }}></div>
                        {/* Mesh gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-600/5 via-transparent to-teal-500/5 pointer-events-none animate-mesh-float"></div>

                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
                                Ready to transform your{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-600">
                                    team workflow?
                                </span>
                            </h2>
                            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto mb-6">
                                Join thousands of teams already shipping faster with SmartCollab. Get started in seconds — no credit card required.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => isAuthenticated ? router.push('/dashboard') : router.push('/auth')}
                                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-sky-600/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                >
                                    {isAuthenticated ? 'Go to Dashboard' : 'Launch Your Workspace'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <Footer />
        </div>
    );
}