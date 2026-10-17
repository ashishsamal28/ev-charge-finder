import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            <FileText size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy)' }}>
              Terms & Conditions
            </h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Effective Date: October 2026 • Platform Terms of Service
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--text)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              1. Platform Usage & Reservation Rules
            </h3>
            <p>
              By reserving a charging slot on EV Charge Finder, you agree to arrive at the designated charging bay on or before your scheduled start time. Charging slots are held exclusively for your vehicle reference during the booked interval.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              2. Cancellation Cutoff Policy
            </h3>
            <p>
              To maintain system fairness and optimal bay utilization:
            </p>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
              <li>Reservations may be cancelled at no penalty up to <strong>30 minutes before</strong> the scheduled start time.</li>
              <li>Cancellations attempted less than 30 minutes before the scheduled start time are strictly disallowed to prevent idle bay wastage.</li>
              <li>Cancelled slots are immediately returned to the pool for other active EV drivers.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              3. Pricing and Tariffs
            </h3>
            <p>
              Tariffs per kilowatt-hour (kWh) are snapshot locked at the moment of booking confirmation. Future rate modifications applied by station administrators will not affect preexisting confirmed reservations.
            </p>
          </section>

          <section>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              4. Hardware Operational Status
            </h3>
            <p>
              While our system updates bay availability in real time, maintenance schedules and grid fluctuations may necessitate bay deactivation. In such events, administrators may reassign or notify reservation holders.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
