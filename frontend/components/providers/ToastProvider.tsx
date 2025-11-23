'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
        },
        classNames: {
          error: 'text-red-600',
          success: 'text-green-600',
          warning: 'text-yellow-600',
          info: 'text-blue-600',
        },
      }}
    />
  );
}
