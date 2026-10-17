import React, { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, MapPin, Eye, X } from 'lucide-react';
import { adminApi } from '../../services/api';
import AdminNav from '../../components/admin/AdminNav';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 15, total_pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detail Modal
  const [viewBooking, setViewBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getBookings({
        q: searchQuery,
        status: statusFilter,
        date: dateFilter,
        page,
        limit: 15
      });
      setBookings(res.data || []);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      setError(err.message || 'Failed to load bookings audit list');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, dateFilter, page]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBookings();
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
          Reservation Audit & Throughput
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real-time log of customer reservations, session status, and tariffs across all stations.
        </p>
      </div>

      <AdminNav />

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
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
              placeholder="Search reference, user name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', padding: '0.5rem 0.6rem', fontSize: '0.875rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-select"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            className="form-input"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
          />

          {(searchQuery || statusFilter !== 'all' || dateFilter) && (
            <button
              onClick={() => { setSearchQuery(''); setStatusFilter('all'); setDateFilter(''); setPage(1); }}
              className="btn btn-outline btn-sm"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEE2E2', color: 'var(--error)', borderRadius: 'var(--radius)', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
        {loading ? (
          <LoadingSpinner message="Loading reservations..." />
        ) : bookings.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Booking Ref</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Driver Account</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Station & Bay</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Reserved Slot</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Tariff Rate</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, color: 'var(--navy)' }}>
                    {b.booking_reference}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{b.user_name || 'Driver'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.user_email}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{b.station_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Bay {b.charger_code} ({b.connector_type})
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div>{new Date(b.start_time).toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      to {new Date(b.end_time).toLocaleTimeString()}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--primary)' }}>
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
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setViewBooking(b)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.35rem 0.6rem' }}
                      title="View reservation details"
                    >
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No reservation records match the current criteria.
          </p>
        )}
      </div>

      {/* Pagination */}
      {meta.total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="btn btn-outline btn-sm"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page {meta.page} of {meta.total_pages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= meta.total_pages}
            className="btn btn-outline btn-sm"
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* DETAIL MODAL */}
      {viewBooking && (
        <div className="modal-overlay" onClick={() => setViewBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)' }}>
                Booking Reference: {viewBooking.booking_reference}
              </h3>
              <button onClick={() => setViewBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Customer:</span>
                <strong>{viewBooking.user_name} ({viewBooking.user_email})</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Station:</span>
                <strong>{viewBooking.station_name}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
                <span>{viewBooking.station_address}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Charger:</span>
                <span>Bay {viewBooking.charger_code} ({viewBooking.connector_type} {viewBooking.charging_power_kw} kW)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Start Time:</span>
                <strong>{new Date(viewBooking.start_time).toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>End Time:</span>
                <strong>{new Date(viewBooking.end_time).toLocaleString()}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tariff Snapshot:</span>
                <strong style={{ color: 'var(--primary)' }}>₹{viewBooking.price_per_kwh_snapshot?.toFixed(1)} / kWh</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                <span className={`badge ${
                  viewBooking.status === 'confirmed' ? 'badge-success' :
                  viewBooking.status === 'completed' ? 'badge-info' : 'badge-error'
                }`}>
                  {viewBooking.status}
                </span>
              </div>

              {viewBooking.cancelled_at && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Cancelled At:</span>
                  <span>{new Date(viewBooking.cancelled_at).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setViewBooking(null)} className="btn btn-outline btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
