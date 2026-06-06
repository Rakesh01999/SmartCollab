'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import Toast from '../components/Common/Toast';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toast />
    </Provider>
  );
}
