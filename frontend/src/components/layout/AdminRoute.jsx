import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Verifying administrator credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '6rem 1rem', textAlign: 'center' }}>
        <div style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '2.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: 'var(--error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <ShieldAlert size={30} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
            Access Restricted
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            This section is restricted to authorized platform administrators. You do not have sufficient privileges to view this portal.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Link to="/" className="btn btn-outline btn-sm">
              <ArrowLeft size={16} /> Return Home
            </Link>
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              My Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
