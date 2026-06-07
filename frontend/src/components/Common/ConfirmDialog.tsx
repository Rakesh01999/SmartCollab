'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { hideConfirmDialog } from '../../store/appSlice';
import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Module-level resolve function holder (not serializable, can't go in Redux)
let confirmResolve: ((value: boolean) => void) | null = null;

export function setConfirmResolve(resolve: (value: boolean) => void) {
    confirmResolve = resolve;
}

export default function ConfirmDialog() {
    const dispatch = useDispatch<AppDispatch>();
    const dialog = useSelector((state: RootState) => state.app.confirmDialog);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !dialog.open) return null;

    const handleConfirm = () => {
        dispatch(hideConfirmDialog());
        if (confirmResolve) {
            confirmResolve(true);
            confirmResolve = null;
        }
    };

    const handleCancel = () => {
        dispatch(hideConfirmDialog());
        if (confirmResolve) {
            confirmResolve(false);
            confirmResolve = null;
        }
    };

    const variantStyles = {
        danger: {
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            buttonBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            buttonBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        },
        info: {
            iconBg: 'bg-sky-100 dark:bg-sky-900/30',
            iconColor: 'text-sky-600 dark:text-sky-400',
            buttonBg: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
        },
    };

    const style = variantStyles[dialog.variant];

    const dialogContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={handleCancel}
            />

            {/* Dialog panel */}
            <div className="relative w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl animate-fade-in-up">
                {/* Close button */}
                <button
                    onClick={handleCancel}
                    className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    aria-label="Close dialog"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center mb-4`}>
                    <AlertTriangle className={`w-6 h-6 ${style.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                    {dialog.title}
                </h3>

                {/* Message */}
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {dialog.message}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                    >
                        {dialog.cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${style.buttonBg} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors cursor-pointer`}
                    >
                        {dialog.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(dialogContent, document.body);
}