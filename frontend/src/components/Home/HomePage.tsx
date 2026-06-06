'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { useTheme } from 'next-themes';

export default function HomePage() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
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

    const isAnimated = (id: string) => visibleSections.has(id);

    const features = [
        {
            icon: FolderKanban,
            title: 'Project Management',
            description: 'Organize projects with intuitive boards, track milestones, and keep your team aligned on every deliverable.',
            color: 'from-indigo-500 to-blue-600',
            shadowColor: 'rgba(99, 102, 241, 0.3)',
        },
        {
            icon: CheckSquare,
            title: 'Smart Task Tracking',
            description: 'Kanban-style task boards with drag-and-drop ease. Assign, prioritize, and monitor tasks in real time.',
            color: 'from-violet-500 to-purple-600',
            shadowColor: 'rgba(139, 92, 246, 0.3)',
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
        { value: '10K+', label: 'Active Teams' },
        { value: '50K+', label: 'Tasks Completed' },
        { value: '99.9%', label: 'Uptime' },
        { value: '4.9', label: 'User Rating', icon: Star },
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
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                Smart<span className="text-indigo-500">Collab</span>
                            </span>
                        </div>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-[var(--text-muted)] hover:text-indigo-500 transition-colors">
                                Features
                            </a>
                            <a href="#stats" className="text-sm font-medium text-[var(--text-muted)] hover:text-indigo-500 transition-colors">
                                Impact
                            </a>
                            <a href="#testimonials" className="text-sm font-medium text-[var(--text-muted)] hover:text-indigo-500 transition-colors">
                                Testimonials
                            </a>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            {mounted && (
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="p-2 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-indigo-500 transition-all cursor-pointer"
                                    aria-label="Toggle theme"
                                >
                                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                                </button>
                            )}
                            <button
                                onClick={() => router.push('/auth')}
                                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 transition-all cursor-pointer"
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </button>
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
                            <a href="#features" className="text-sm font-medium text-[var(--text-muted)] hover:text-indigo-500 transition-colors py-2">
                                Features
                            </a>
                            <a href="#stats" className="text-sm font-medium text-[var(--text-muted)] hover:text-indigo-500 transition-colors py-2">
                                Impact
                            </a>
                            <a href="#testimonials" className="text-sm font-medium text-[var(--text-muted)] hover:text-indigo-500 transition-colors py-2">
                                Testimonials
                            </a>
                            <button
                                onClick={() => router.push('/auth')}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer"
                            >
                                Get Started
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* ===== HERO SECTION ===== */}
            <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36 overflow-hidden">
                {/* Ambient glow effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none"></div>
                <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-violet-600/8 dark:bg-violet-600/15 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/5 dark:bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Floating decorative elements */}
                <div className="absolute top-32 left-[10%] w-3 h-3 bg-indigo-400/40 rounded-full animate-float-slow pointer-events-none"></div>
                <div className="absolute top-48 right-[15%] w-2 h-2 bg-violet-400/40 rounded-full animate-float-medium pointer-events-none"></div>
                <div className="absolute top-64 left-[70%] w-4 h-4 bg-cyan-400/30 rounded-full animate-float-fast pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-8 animate-fade-in-up">
                            <Zap className="w-4 h-4" />
                            Next-gen team collaboration platform
                        </div>

                        {/* Main headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up-delay-1">
                            Collaborate.
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600">
                                Create.
                            </span>
                            <br />
                            Deliver together.
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up-delay-2">
                            SmartCollab empowers teams with intuitive project boards, smart task tracking, and real-time activity insights — all in one beautifully crafted workspace.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-3">
                            <button
                                onClick={() => router.push('/auth')}
                                className="group inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl text-base font-semibold hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            >
                                Start Free Today
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl text-base font-semibold hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                            >
                                Explore Features
                                <ChevronRight className="w-5 h-5" />
                            </a>
                        </div>

                        {/* Hero visual — Dashboard preview mockup */}
                        <div className="mt-16 sm:mt-20 relative animate-fade-in-up-delay-4">
                            <div className="relative mx-auto max-w-5xl">
                                {/* Glow behind the card */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-3xl blur-2xl scale-[0.98] pointer-events-none"></div>

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
                                                <div className="h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center px-3 text-xs text-indigo-500 font-medium">
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
                                                    { label: 'Projects', val: '12', color: 'indigo' },
                                                    { label: 'Tasks Done', val: '84', color: 'emerald' },
                                                    { label: 'In Progress', val: '23', color: 'amber' },
                                                    { label: 'Team Size', val: '8', color: 'violet' },
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
                                                    { name: 'Website Redesign', pct: 75, color: 'bg-indigo-500' },
                                                    { name: 'Mobile App v2', pct: 45, color: 'bg-violet-500' },
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

            {/* ===== FEATURES SECTION ===== */}
            <section id="features" data-animate className="py-20 sm:py-28 relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    {/* Section header */}
                    <div
                        className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${isAnimated('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 text-sm font-medium mb-4">
                            <Globe className="w-4 h-4" />
                            Everything you need
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            Powerful features for
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600">
                                modern teams
                            </span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            From project planning to real-time collaboration, SmartCollab gives your team the tools to ship faster and smarter.
                        </p>
                    </div>

                    {/* Features grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <div
                                key={feature.title}
                                className={`group relative glass-panel rounded-2xl p-6 glass-card-hover transition-all duration-700 ${isAnimated('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: isAnimated('features') ? `${idx * 100}ms` : '0ms' }}
                            >
                                {/* Icon */}
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                                    style={{ boxShadow: `0 8px 16px -4px ${feature.shadowColor}` }}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{feature.description}</p>

                                {/* Hover glow */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-violet-500/0 group-hover:from-indigo-500/5 group-hover:to-violet-500/5 transition-all duration-300 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== STATS SECTION ===== */}
            <section id="stats" data-animate className="py-20 sm:py-28 relative">
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div
                        className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${isAnimated('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            Trusted by teams
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-600">
                                worldwide
                            </span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Numbers that speak for themselves. SmartCollab delivers measurable impact for teams of all sizes.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <div
                                key={stat.label}
                                className={`glass-panel rounded-2xl p-8 text-center glass-card-hover transition-all duration-700 ${isAnimated('stats') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: isAnimated('stats') ? `${idx * 100}ms` : '0ms' }}
                            >
                                <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600 mb-2">
                                    {stat.value}
                                    {stat.icon && <Star className="w-5 h-5 inline-block ml-1 text-amber-400" />}
                                </div>
                                <div className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== TESTIMONIALS SECTION ===== */}
            <section id="testimonials" data-animate className="py-20 sm:py-28 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div
                        className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${isAnimated('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            Loved by
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                                industry leaders
                            </span>
                        </h2>
                        <p className="text-[var(--text-secondary)] text-lg">
                            See what team leads and founders are saying about their SmartCollab experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, idx) => (
                            <div
                                key={t.name}
                                className={`glass-panel rounded-2xl p-6 glass-card-hover transition-all duration-700 ${isAnimated('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                                    }`}
                                style={{ transitionDelay: isAnimated('testimonials') ? `${idx * 150}ms` : '0ms' }}
                            >
                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>

                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
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
            <section data-animate className="py-20 sm:py-28 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div
                        className={`relative glass-panel rounded-3xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden transition-all duration-700 ${isAnimated('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                            }`}
                    >
                        {/* Background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-purple-500/10 dark:from-indigo-500/20 dark:via-violet-500/10 dark:to-purple-500/20 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-violet-600/10 rounded-full blur-[60px] pointer-events-none"></div>

                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                                Ready to transform your
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-600">
                                    team workflow?
                                </span>
                            </h2>
                            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto mb-8">
                                Join thousands of teams already shipping faster with SmartCollab. Get started in seconds — no credit card required.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={() => router.push('/auth')}
                                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl text-lg font-semibold hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                >
                                    Launch Your Workspace
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="border-t border-[var(--card-border)] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                <LayoutDashboard className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                Smart<span className="text-indigo-500">Collab</span>
                            </span>
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                            <a href="#features" className="hover:text-indigo-500 transition-colors">Features</a>
                            <a href="#stats" className="hover:text-indigo-500 transition-colors">Impact</a>
                            <a href="#testimonials" className="hover:text-indigo-500 transition-colors">Testimonials</a>
                        </div>

                        {/* Copyright */}
                        <div className="text-sm text-[var(--text-muted)]">
                            © {new Date().getFullYear()} SmartCollab. Built with passion.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}