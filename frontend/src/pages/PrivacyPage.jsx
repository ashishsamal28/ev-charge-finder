import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="container" style={{ padding: '3.5rem 1rem 5rem', maxWidth: 800 }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem'
        }}
      >
        <ArrowLeft size={16} /> Return to Home
      </Link>

      <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '10px',
            backgroundColor: 'var(--primary-subtle)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>
              Privacy Policy
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Last updated: October 2026 • Academic Demonstration
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              1. Demonstration Project Scope
            </h3>
            <p>
              EV Charge Finder is a full-stack electric vehicle charging platform built for academic evaluation, portfolio presentation, and technical demonstration. All user credentials and station information are stored securely in local persistent storage.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              2. Information We Collect
            </h3>
            <p>
              When you register or reserve a charging bay on EV Charge Finder, we collect:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li>Full name and account email address.</li>
              <li>Optional contact telephone number for booking confirmations.</li>
              <li>Cryptographically hashed passwords (using PBKDF2:SHA256). Plain-text passwords are never stored or transmitted.</li>
              <li>Reservation details, scheduled time intervals, and locked tariff snapshots.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              3. Data Protection and Security
            </h3>
            <p>
              We implement industry-standard token-based authentication (JSON Web Tokens), role-based access control, parameterized database queries, and atomic concurrency locks to prevent double-booking. Your private session tokens remain strictly confidential.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              4. Contact for Academic Evaluation
            </h3>
            <p>
              For any questions regarding system implementation, architecture, or live evaluation testing, please refer to the project documentation or contact the development team at <strong>demo-support@evchargefinder.local</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
