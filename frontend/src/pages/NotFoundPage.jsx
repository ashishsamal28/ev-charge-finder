import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container" style={{
      padding: '6rem 1rem',
      textAlign: 'center',
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        backgroundColor: '#F1F5F9',
        color: 'var(--navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem'
      }}>
        <Compass size={32} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '0.5rem', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.75rem' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 2rem', fontSize: '0.95rem' }}>
        The charging station or resource you are looking for has been moved, deactivated, or does not exist.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link to="/" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Return Home
        </Link>
        <Link to="/stations" className="btn btn-primary btn-sm">
          Find Stations
        </Link>
      </div>
    </div>
  );
}
