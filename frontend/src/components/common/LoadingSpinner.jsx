import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeMap = {
    sm: 18,
    md: 28,
    lg: 40,
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1rem',
      gap: '0.75rem',
      color: 'var(--text-secondary)'
    }}>
      <Loader2
        size={sizeMap[size] || 28}
        style={{
          animation: 'spin 1s linear infinite',
          color: 'var(--primary)'
        }}
      />
      {message && <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</p>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
