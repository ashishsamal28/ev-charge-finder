import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters long.');
      return;
    }

    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      });
      setSuccessMsg('Profile updated successfully!');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1rem 5rem', maxWidth: 600 }}>
      <div className="card" style={{ padding: '2.25rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800
          }}>
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>
              {user?.full_name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {user?.email}
            </p>
            <span className="badge badge-info" style={{ marginTop: '0.35rem', textTransform: 'capitalize' }}>
              {user?.role} Account
            </span>
          </div>
        </div>

        {successMsg && (
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: '#DCFCE7',
            color: '#166534',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
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
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Immutable)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Primary login email cannot be modified.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div style={{
            padding: '1rem',
            backgroundColor: '#F8FAFC',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Account Status:</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Active</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Member Since:</span>
              <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem' }}
          >
            {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
