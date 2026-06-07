'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
    FolderKanban,
    ListTodo,
    Users,
    Activity,
    Heart,
    Mail,
    ArrowRight,
    Zap,
} from 'lucide-react';

export default function Footer() {
    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 4000);
        }
    };

    const productLinks = [
        { name: 'Features', href: '#features', icon: <Zap className="w-4 h-4" /> },
        { name: 'Kanban Board', href: '/tasks', icon: <ListTodo className="w-4 h-4" />, route: true },
        { name: 'Projects', href: '/projects', icon: <FolderKanban className="w-4 h-4" />, route: true },
        { name: 'Team Directory', href: '/team', icon: <Users className="w-4 h-4" />, route: true },
        { name: 'Activity Logs', href: '/activities', icon: <Activity className="w-4 h-4" />, route: true },
    ];

    const companyLinks = [
        { name: 'About Us', href: '#' },
        { name: 'Our Mission', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Contact', href: '#' },
    ];

    const resourceLinks = [
        { name: 'Documentation', href: '#' },
        { name: 'API Reference', href: '#' },
        { name: 'Help Center', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Terms of Service', href: '#' },
    ];

    const socialLinks = [
        {
            name: 'GitHub',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23.975 1.635 2.55 1.185 3.18.9.09-.705.375-1.185.675-1.455-2.34-.255-4.815-1.17-4.815-5.22 0-1.155.405-2.1 1.095-2.835-.105-.255-.48-1.35.105-2.775 0 0 .9-.285 2.94 1.095.855-.24 1.77-.36 2.685-.36.915 0 1.83.12 2.685.36 2.04-1.38 2.94-1.095 2.94-1.095.585 1.425.21 2.52.105 2.775.69.735 1.095 1.68 1.095 2.835 0 4.065-2.49 4.965-4.815 5.22.375.315.72.93.72 1.875 0 1.35-.015 2.43-.015 2.775 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
            ),
            href: '#',
        },
        {
            name: 'Twitter',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            href: '#',
        },
        {
            name: 'LinkedIn',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            ),
            href: '#',
        },
    ];

    const handleLinkClick = (link: { route?: boolean; href: string }) => {
        if (link.route && isAuthenticated) {
            router.push(link.href);
        } else if (!link.route) {
            // For anchor links on the same page, just let the <a> handle it
            return;
        } else {
            router.push('/auth');
        }
    };

    return (
        <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)]">
            {/* Newsletter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-[var(--card-border)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 max-w-md">
                        <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-5 h-5 text-sky-600" />
                            <h3 className="text-lg font-bold text-[var(--foreground)]">Stay in the loop</h3>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            Get the latest updates, feature releases, and productivity tips delivered to your inbox.
                        </p>
                    </div>
                    <form onSubmit={handleSubscribe} className="flex items-center gap-3 w-full md:w-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="flex-1 md:w-64 px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-sm text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:border-sky-600/60 focus:ring-1 focus:ring-sky-600/30 transition-all"
                        />
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-sky-600/25 hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                            {subscribed ? 'Subscribed!' : 'Subscribe'}
                            {!subscribed && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2.5 mb-4">
                            <img src="/logo.png" alt="SmartCollab" className="w-9 h-9 rounded-xl shadow-lg shadow-sky-600/25" />
                            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-teal-500 to-teal-500 dark:from-sky-400 dark:via-teal-400 dark:to-teal-400">
                                SmartCollab
                            </span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 max-w-sm">
                            Empowering teams to collaborate smarter, not harder. Our platform brings project management,
                            task tracking, and team communication together in one seamless experience.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    className="p-2.5 rounded-xl bg-[var(--hover-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-sky-600 hover:border-sky-600/30 hover:shadow-md hover:shadow-sky-600/10 transition-all"
                                    aria-label={social.name}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.name}>
                                    {link.route ? (
                                        <button
                                            onClick={() => handleLinkClick(link)}
                                            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-sky-600 transition-colors cursor-pointer"
                                        >
                                            {link.icon}
                                            {link.name}
                                        </button>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-sky-600 transition-colors"
                                        >
                                            {link.icon}
                                            {link.name}
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Organization Column */}
                    <div>
                        <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">
                            Organization
                        </h4>
                        <ul className="space-y-3">
                            {companyLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-[var(--text-muted)] hover:text-sky-600 transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources Column */}
                    <div>
                        <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">
                            Resources
                        </h4>
                        <ul className="space-y-3">
                            {resourceLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-[var(--text-muted)] hover:text-sky-600 transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[var(--card-border)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                            © {new Date().getFullYear()} SmartCollab. Made with
                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                            by the SmartCollab team.
                        </div>
                        <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
                            <a href="#" className="hover:text-sky-600 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-sky-600 transition-colors">Terms</a>
                            <a href="#" className="hover:text-sky-600 transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}