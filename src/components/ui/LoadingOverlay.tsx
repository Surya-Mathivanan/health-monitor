import React from 'react';
import Loader from './Loader';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
        <Loader />
        {message && (
          <p className="text-slate-700 text-sm font-medium mt-4">{message}</p>
        )}
      </div>
    </div>
  );
}

export default LoadingOverlay;
