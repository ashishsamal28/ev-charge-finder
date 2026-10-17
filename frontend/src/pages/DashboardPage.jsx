import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Zap,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    bookingApi.getMyBookings({ limit: 10 })
      .then((res) => {
        setBookings(res.data || []);
      })
      .catch((err) => {
        setError(err.message || 'Could not load bookings');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const upcomingBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Account Overview
          </span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginTop: '0.25rem' }}>
            Welcome back, {user?.full_name}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage your EV charging reservations and track your session receipts.
          </p>
        </div>

        <Link to="/stations" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={16} fill="#FFFFFF" /> Find Charging Stations
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upcoming Bookings</span>
            <Calendar size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
            {upcomingBookings.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Confirmed active slots</span>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Completed Charges</span>
            <CheckCircle2 size={20} style={{ color: '#3B82F6' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
            {completedBookings.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Past charging sessions</span>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cancelled Slots</span>
            <XCircle size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
            {cancelledBookings.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Released reservations</span>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Account Status</span>
            <ShieldCheck size={20} style={{ color: '#10B981' }} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy)' }}>
            Active Member
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verified EV driver</span>
        </div>
      </div>

      {/* Upcoming Bookings Section */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--navy)' }}>
            Upcoming Charging Slots
          </h2>
          <Link to="/my-bookings" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View Full History <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading your bookings..." />
        ) : upcomingBookings.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {upcomingBookings.map((b) => (
              <div key={b.id} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-success">Confirmed Slot</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>{b.booking_reference}</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.25rem' }}>
                  {b.station_name}
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
                  <MapPin size={14} /> {b.station_address}
                </p>

                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.825rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bay & Connector:</span>
                    <span style={{ fontWeight: 600 }}>{b.charger_code} ({b.connector_type} {b.charging_power_kw}kW)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Time Interval:</span>
                    <span style={{ fontWeight: 600 }}>{new Date(b.start_time).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <Link to={`/booking/${b.id}`} className="btn btn-outline btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
            <Calendar size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.35rem' }}>
              No upcoming reservations
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 420, margin: '0 auto 1.25rem' }}>
              You do not have any confirmed charging slots scheduled. Explore stations near your route and reserve ahead.
            </p>
            <Link to="/stations" className="btn btn-primary btn-sm">
              Discover Nearby Stations
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
