import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
  activeProjectId: string;
  searchQuery: string;
  sidebarOpen: boolean;
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning';
    id: number;
  } | null;
}

const initialState: AppState = {
  activeProjectId: 'all',
  searchQuery: '',
  sidebarOpen: true,
  toast: null,
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
  },
});

export const { 
  setActiveProjectId, 
  setSearchQuery, 
  toggleSidebar, 
  setSidebarOpen, 
  showToast, 
  hideToast 
} = appSlice.actions;

export default appSlice.reducer;
