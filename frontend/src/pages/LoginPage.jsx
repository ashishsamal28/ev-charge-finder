import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin' && redirectUrl === '/dashboard') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillCredentials = (type) => {
    if (type === 'admin') {
      setEmail('admin@evchargefinder.com');
      setPassword('Admin@12345');
    } else {
      setEmail('user@evchargefinder.com');
      setPassword('User@12345');
    }
    setError(null);
  };

  return (
    <div className="container" style={{
      padding: '4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '75vh',
      justifyContent: 'center'
    }}>
      <div className="card" style={{
        maxWidth: 440,
        width: '100%',
        padding: '2.25rem',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)'
          }}>
            <Zap size={24} fill="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.25rem' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Log in to manage your charging slots and reservations.
          </p>
        </div>

        {/* Demo Fast-Fill Bar */}
        <div style={{
          backgroundColor: '#F8FAFC',
          border: '1px dashed var(--border)',
          borderRadius: 'var(--radius)',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            Evaluation Demo Credentials (1-Click Fill):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => fillCredentials('user')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', backgroundColor: '#FFFFFF' }}
            >
              <User size={12} /> Demo User
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin')}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', backgroundColor: '#FFFFFF' }}
            >
              <ShieldCheck size={12} style={{ color: 'var(--warning)' }} /> Demo Admin
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#FEE2E2',
            color: 'var(--error)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.75rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
