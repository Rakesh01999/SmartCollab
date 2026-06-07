import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { showConfirmDialog } from '../store/appSlice';
import { setConfirmResolve } from '../components/Common/ConfirmDialog';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export function useConfirm() {
    const dispatch = useDispatch<AppDispatch>();

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            setConfirmResolve(resolve);
            dispatch(showConfirmDialog({
                title: options.title || 'Confirm Action',
                message: options.message,
                confirmText: options.confirmText || 'Confirm',
                cancelText: options.cancelText || 'Cancel',
                variant: options.variant || 'danger',
            }));
        });
    };

    return { confirm };
}