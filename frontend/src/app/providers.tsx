'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import Toast from '../components/Common/Toast';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} disableTransitionOnChange>
      <Provider store={store}>
        {children}
        <Toast />
        <ConfirmDialog />
      </Provider>
    </ThemeProvider>
  );
}
