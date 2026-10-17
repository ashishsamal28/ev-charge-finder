import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Search,
  MapPin,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  ExternalLink
} from 'lucide-react';
import { bookingApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, total_pages: 1 });
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingApi.getMyBookings({
        status: statusFilter,
        q: searchQuery,
        limit: 20
      });
      setBookings(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      setError(err.message || 'Failed to retrieve your bookings');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const executeCancel = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      await bookingApi.cancelBooking(cancellingBooking.id);
      setCancellingBooking(null);
      // Refresh list
      fetchBookings();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking. It may be past the 30-minute cutoff.');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-success">Confirmed Slot</span>;
      case 'completed':
        return <span className="badge badge-info">Completed Session</span>;
      case 'cancelled':
        return <span className="badge badge-error">Cancelled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const isEligibleForCancellation = (booking) => {
    if (booking.status !== 'confirmed') return false;
    const start = new Date(booking.start_time);
    const now = new Date();
    // 30-minute cutoff
    const cutoffTime = new Date(start.getTime() - 30 * 60000);
    return now < cutoffTime;
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>
          My Charging Bookings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          View active reservations, past charging sessions, and manage cancellations.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {[
            { id: 'all', label: 'All Bookings' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn btn-sm ${statusFilter === tab.id ? 'btn-secondary' : 'btn-outline'}`}
              style={{ borderRadius: '9999px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: 360 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '0 0.5rem',
            width: '100%'
          }}>
            <Search size={16} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search reference (e.g. BK-)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: '0.5rem 0.6rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm">
            Search
          </button>
        </form>
      </div>

      {/* Error alert */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FEE2E2',
          color: 'var(--error)',
          borderRadius: 'var(--radius)',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner message="Loading your bookings history..." />
      ) : bookings.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((b) => {
            const canCancel = isEligibleForCancellation(b);

            return (
              <div key={b.id} className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--navy)' }}>
                        {b.booking_reference}
                      </span>
                      {getStatusBadge(b.status)}
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--navy)' }}>
                      {b.station_name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <MapPin size={14} /> {b.station_address}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Tariff Snapshot</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{b.price_per_kwh_snapshot?.toFixed(1)} / kWh
                    </span>
                    {b.estimated_cost && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>
                        Est. Total: ₹{b.estimated_cost}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>Bay & Connector</span>
                    <span style={{ fontWeight: 600 }}>{b.charger_code} ({b.connector_type} {b.charging_power_kw}kW)</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>Scheduled Start</span>
                    <span style={{ fontWeight: 600 }}>{new Date(b.start_time).toLocaleString()}</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>Scheduled End</span>
                    <span style={{ fontWeight: 600 }}>{new Date(b.end_time).toLocaleString()}</span>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>Created On</span>
                    <span>{new Date(b.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
                  <Link to={`/booking/${b.id}`} className="btn btn-outline btn-sm">
                    View Receipt
                  </Link>

                  {canCancel && (
                    <button
                      onClick={() => setCancellingBooking(b)}
                      className="btn btn-danger btn-sm"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No bookings found"
          description={
            statusFilter !== 'all'
              ? `You do not have any ${statusFilter} bookings.`
              : 'You have not reserved any charging slots yet. Discover stations and book your first slot!'
          }
          actionText="Find Stations Now"
          actionLink="/stations"
        />
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {cancellingBooking && (
        <div className="modal-overlay" onClick={() => !cancelLoading && setCancellingBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <AlertTriangle size={20} style={{ color: 'var(--warning)' }} /> Cancel Reservation
              </h3>
              <button
                onClick={() => setCancellingBooking(null)}
                disabled={cancelLoading}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: 'var(--text)', fontSize: '0.925rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Are you sure you want to cancel booking <strong>{cancellingBooking.booking_reference}</strong> at <strong>{cancellingBooking.station_name}</strong>?
            </p>

            <div style={{
              padding: '0.85rem',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: 'var(--radius)',
              color: '#92400E',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              <strong>Cancellation Policy:</strong> Slot reservations may be cancelled up to 30 minutes before the scheduled start time. Once cancelled, your slot will be immediately released to other waiting drivers.
            </div>

            {cancelError && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#FEE2E2',
                color: 'var(--error)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {cancelError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={() => setCancellingBooking(null)}
                className="btn btn-outline btn-sm"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={executeCancel}
                className="btn btn-danger btn-sm"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
