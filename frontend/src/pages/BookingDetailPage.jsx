import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Zap,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { bookingApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    setLoading(true);
    bookingApi.getBooking(id)
      .then((res) => {
        setBooking(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Booking not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking? The slot will be released.')) {
      return;
    }
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await bookingApi.cancelBooking(id);
      setBooking(res.data);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving booking receipt..." />;
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error || 'Booking record not found'}</p>
        <Link to="/my-bookings" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Return to My Bookings
        </Link>
      </div>
    );
  }

  const start = new Date(booking.start_time);
  const end = new Date(booking.end_time);
  const now = new Date();
  const cutoffTime = new Date(start.getTime() - 30 * 60000);
  const canCancel = booking.status === 'confirmed' && now < cutoffTime;

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: 680 }}>
      <Link
        to="/my-bookings"
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
        <ArrowLeft size={16} /> Back to My Bookings
      </Link>

      <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
        {/* Receipt Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Zap size={16} fill="#FFFFFF" />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--navy)' }}>
                EV Charge Finder
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Official Booking Confirmation & Receipt
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${
              booking.status === 'confirmed' ? 'badge-success' :
              booking.status === 'completed' ? 'badge-info' : 'badge-error'
            }`}>
              {booking.status.toUpperCase()}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Ref: <strong style={{ color: 'var(--navy)' }}>{booking.booking_reference}</strong>
            </div>
          </div>
        </div>

        {/* Station details */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.25rem' }}>
            {booking.station_name}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={14} /> {booking.station_address}
          </p>
        </div>

        {/* Spec breakdown table */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.9rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Charger Bay:</span>
            <span style={{ fontWeight: 600 }}>{booking.charger_code} ({booking.connector_type} {booking.charging_power_kw} kW)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Scheduled Start:</span>
            <span style={{ fontWeight: 600 }}>{start.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Scheduled End:</span>
            <span style={{ fontWeight: 600 }}>{end.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Reserved User:</span>
            <span>{booking.user_name} ({booking.user_email})</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border)',
            paddingTop: '0.75rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>Locked Tariff Snapshot:</span>
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>₹{booking.price_per_kwh_snapshot?.toFixed(1)} / kWh</span>
          </div>

          {booking.estimated_energy_kwh && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Energy:</span>
              <span>{booking.estimated_energy_kwh} kWh</span>
            </div>
          )}

          {booking.estimated_cost && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px dashed var(--border)',
              paddingTop: '0.75rem',
              fontWeight: 800,
              fontSize: '1rem',
              color: 'var(--primary)'
            }}>
              <span>Estimated Session Cost:</span>
              <span>₹{booking.estimated_cost}</span>
            </div>
          )}
        </div>

        {cancelError && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#FEE2E2',
            color: 'var(--error)',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem',
            marginBottom: '1rem'
          }}>
            {cancelError}
          </div>
        )}

        {/* Action Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Booked on {new Date(booking.created_at).toLocaleDateString()}
          </span>

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="btn btn-danger btn-sm"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Reservation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
