import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../../services/api';
import AdminNav from '../../components/admin/AdminNav';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.getStats()
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch admin stats');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating network analytics..." />;
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '3rem 1rem' }}>
        <AdminNav />
        <div style={{ padding: '1rem', backgroundColor: '#FEE2E2', color: 'var(--error)', borderRadius: 'var(--radius)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.25rem' }}>
          Administrator Console
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Live system metrics, hardware status, and network reservation throughput.
        </p>
      </div>

      <AdminNav />

      {/* Main KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {/* Stations Stats */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Station Network</span>
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)' }}>
            {stats?.stations?.total || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            <strong style={{ color: 'var(--primary)' }}>{stats?.stations?.active || 0} Active</strong> • {stats?.stations?.inactive || 0} Inactive
          </div>
        </div>

        {/* Chargers Stats */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #3B82F6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total Charger Bays</span>
            <Zap size={20} style={{ color: '#3B82F6' }} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)' }}>
            {stats?.chargers?.total || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            <strong style={{ color: 'var(--primary)' }}>{stats?.chargers?.operational || 0} Operational</strong> • {stats?.chargers?.maintenance || 0} Maint.
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upcoming Slots</span>
            <Calendar size={20} style={{ color: 'var(--warning)' }} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)' }}>
            {stats?.bookings?.upcoming || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Total throughput: {stats?.bookings?.total || 0} lifetime
          </div>
        </div>

        {/* Completed Charges */}
        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Completed Charges</span>
            <CheckCircle2 size={20} style={{ color: '#10B981' }} />
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--navy)' }}>
            {stats?.bookings?.completed || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {stats?.bookings?.cancelled || 0} cancelled reservations
          </div>
        </div>
      </div>

      {/* Hardware Health Status Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1.25rem' }}>
            Bay Hardware Health Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                Operational & Available
              </span>
              <strong style={{ color: 'var(--navy)' }}>{stats?.chargers?.operational}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                Scheduled Maintenance
              </span>
              <strong style={{ color: 'var(--warning)' }}>{stats?.chargers?.maintenance}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--error)' }} />
                Out of Service
              </span>
              <strong style={{ color: 'var(--error)' }}>{stats?.chargers?.out_of_service}</strong>
            </div>
          </div>
        </div>

        {/* Quick Administrator Controls */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
              Management Actions
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Quick access shortcuts for managing physical charging infrastructure and users.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Link to="/admin/stations/new" className="btn btn-primary btn-sm">
              + New Station
            </Link>
            <Link to="/admin/chargers" className="btn btn-outline btn-sm">
              Manage Chargers
            </Link>
            <Link to="/admin/stations" className="btn btn-outline btn-sm">
              View All Stations
            </Link>
            <Link to="/admin/bookings" className="btn btn-outline btn-sm">
              Audit Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)' }}>
            Recent Reservation Activity
          </h3>
          <Link to="/admin/bookings" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Full Audit Log <ArrowRight size={14} />
          </Link>
        </div>

        {stats?.recent_bookings?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Reference</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Driver</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Station</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Slot Time</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Tariff</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--navy)' }}>
                      {b.booking_reference}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {b.user_name || b.user_email}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {b.station_name}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {new Date(b.start_time).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                      ₹{b.price_per_kwh_snapshot?.toFixed(1)} / kWh
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className={`badge ${
                        b.status === 'confirmed' ? 'badge-success' :
                        b.status === 'completed' ? 'badge-info' : 'badge-error'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            No recent reservations recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
