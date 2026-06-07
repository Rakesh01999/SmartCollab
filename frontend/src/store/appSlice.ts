import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../types';

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info';
}

export interface AppState {
  activeProjectId: string;
  searchQuery: string;
  sidebarOpen: boolean;
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning';
    id: number;
  } | null;
  refreshCounter: number;
  confirmDialog: ConfirmDialogState;
  notifications: Notification[];
}

const initialConfirmDialog: ConfirmDialogState = {
  open: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
};

const initialState: AppState = {
  activeProjectId: 'all',
  searchQuery: '',
  sidebarOpen: true,
  toast: null,
  refreshCounter: 0,
  confirmDialog: initialConfirmDialog,
  notifications: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setActiveProjectId(state, action: PayloadAction<string>) {
      state.activeProjectId = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    triggerRefresh(state) {
      state.refreshCounter += 1;
    },
    showToast(state, action: PayloadAction<{ message: string; type?: 'success' | 'error' | 'warning' }>) {
      state.toast = {
        message: action.payload.message,
        type: action.payload.type || 'success',
        id: Date.now(),
      };
    },
    hideToast(state) {
      state.toast = null;
    },
    showConfirmDialog(state, action: PayloadAction<Omit<ConfirmDialogState, 'open'>>) {
      state.confirmDialog = { ...action.payload, open: true };
    },
    hideConfirmDialog(state) {
      state.confirmDialog = { ...initialConfirmDialog };
    },
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
    },
    markNotificationRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(n => n._id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllNotificationsRead(state) {
      state.notifications.forEach(n => {
        n.read = true;
      });
    },
    clearNotifications(state) {
      state.notifications = [];
    },
  },
});

export const {
  setActiveProjectId,
  setSearchQuery,
  toggleSidebar,
  setSidebarOpen,
  showToast,
  hideToast,
  triggerRefresh,
  showConfirmDialog,
  hideConfirmDialog,
  setNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications,
} = appSlice.actions;

export default appSlice.reducer;
