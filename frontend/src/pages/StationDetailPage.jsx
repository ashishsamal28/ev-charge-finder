import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Zap,
  Calendar,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BatteryCharging
} from 'lucide-react';
import { stationApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function StationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [selectedChargerId, setSelectedChargerId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [estimatedEnergy, setEstimatedEnergy] = useState('30');

  // Availability slots for selectedDate
  const [availability, setAvailability] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Booking submission state
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Load Station
  useEffect(() => {
    setLoading(true);
    stationApi.getStation(id)
      .then((res) => {
        setStation(res.data);
        // Pre-select first available charger
        const availableCharger = res.data.chargers?.find(
          (c) => c.is_active && c.operational_status === 'Available'
        );
        if (availableCharger) {
          setSelectedChargerId(availableCharger.id);
        } else if (res.data.chargers?.length > 0) {
          setSelectedChargerId(res.data.chargers[0].id);
        }
      })
      .catch((err) => {
        setError(err.message || 'Station not found');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  // Load Availability for selectedDate
  const fetchAvailability = useCallback(async () => {
    if (!id || !selectedDate) return;
    setLoadingAvailability(true);
    try {
      const res = await stationApi.getAvailability(id, selectedDate);
      setAvailability(res.data || {});
    } catch (err) {
      console.warn('Could not load slot availability:', err.message);
    } finally {
      setLoadingAvailability(false);
    }
  }, [id, selectedDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Handle slot selection
  const handleSelectSlot = (slot) => {
    if (!slot.is_available) return;
    setSelectedSlot(slot);
    setBookingError(null);
  };

  // Submit Booking
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/stations/${id}`)}`);
      return;
    }

    if (!selectedChargerId || !selectedSlot) {
      setBookingError('Please choose a charger and an available time slot.');
      return;
    }

    const startDateTime = new Date(selectedSlot.start_time);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    setSubmitting(true);
    setBookingError(null);

    try {
      const payload = {
        station_id: parseInt(id, 10),
        charger_id: selectedChargerId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        estimated_energy_kwh: parseFloat(estimatedEnergy) || null,
      };

      const res = await bookingApi.createBooking(payload);
      setBookingSuccess(res.data);
      // Refresh availability
      fetchAvailability();
    } catch (err) {
      setBookingError(err.message || 'Failed to complete booking. Please try another slot.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading station details and live chargers..." />;
  }

  if (error || !station) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '2.5rem', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <AlertCircle size={44} style={{ color: 'var(--error)', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>
            Station Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            The requested charging station ID does not exist or is currently inactive.
          </p>
          <Link to="/stations" className="btn btn-primary btn-sm">
            <ArrowLeft size={16} /> Back to Stations
          </Link>
        </div>
      </div>
    );
  }

  const selectedCharger = station.chargers?.find((c) => c.id === selectedChargerId);
  const activeChargerAvailability = selectedChargerId ? availability[selectedChargerId]?.slots || [] : [];
  const estCost = selectedCharger && estimatedEnergy
    ? (parseFloat(estimatedEnergy) * selectedCharger.price_per_kwh).toFixed(2)
    : null;

  return (
    <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
      {/* Back button */}
      <Link
        to="/stations"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '1.25rem'
        }}
      >
        <ArrowLeft size={16} /> Back to Station Explorer
      </Link>

      {/* Station Overview Banner */}
      <div className="card" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#FFFFFF',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#86EFAC', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <Zap size={14} fill="#86EFAC" /> Verified Charging Hub • {station.city}
            </div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#F8FAFC', marginBottom: '0.5rem' }}>
              {station.name}
            </h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94A3B8', fontSize: '0.95rem' }}>
              <MapPin size={16} style={{ color: 'var(--primary)' }} />
              {station.address}, {station.city}, {station.state} — {station.postal_code}
            </p>
          </div>

          {/* External Map Link */}
          {station.latitude && station.longitude && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${station.latitude}&mlon=${station.longitude}#map=16/${station.latitude}/${station.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              Open in OpenStreetMap <ExternalLink size={14} />
            </a>
          )}
        </div>

        <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.6, marginTop: '1.25rem', maxWidth: 840 }}>
          {station.description}
        </p>

        {/* Metadata pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1' }}>
            <Clock size={16} style={{ color: 'var(--primary)' }} />
            <span>Hours: <strong>{station.opening_hours}</strong></span>
          </div>

          {station.contact_phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1' }}>
              <Phone size={16} style={{ color: 'var(--primary)' }} />
              <span>Contact: <strong>{station.contact_phone}</strong></span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#CBD5E1' }}>
            <BatteryCharging size={16} style={{ color: 'var(--primary)' }} />
            <span>Total Bays: <strong>{station.chargers?.length || 0} chargers</strong></span>
          </div>
        </div>

        {/* Amenities badges */}
        {station.amenities?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
            {station.amenities.map((amenity, idx) => (
              <span
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#E2E8F0',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <ShieldCheck size={12} style={{ color: '#86EFAC' }} /> {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Chargers List + Interactive Booking Console */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '2rem',
        alignItems: 'start'
      }} className="station-booking-layout">

        {/* LEFT COLUMN: CHARGER LIST */}
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1rem' }}>
            Available Charging Bays
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {station.chargers?.map((charger) => {
              const isSelected = selectedChargerId === charger.id;
              const isOutOfService = charger.operational_status === 'Maintenance' || charger.operational_status === 'Out of Service' || !charger.is_active;

              return (
                <div
                  key={charger.id}
                  onClick={() => !isOutOfService && setSelectedChargerId(charger.id)}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    backgroundColor: isOutOfService ? '#F8FAFC' : '#FFFFFF',
                    cursor: isOutOfService ? 'not-allowed' : 'pointer',
                    boxShadow: isSelected ? '0 4px 12px rgba(22, 163, 74, 0.15)' : 'var(--shadow-sm)',
                    opacity: isOutOfService ? 0.65 : 1,
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)' }}>
                        Bay {charger.charger_code}
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {charger.connector_type}
                      </span>
                    </div>

                    <span className={`badge ${
                      charger.operational_status === 'Available' ? 'badge-success' :
                      charger.operational_status === 'Occupied' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {charger.operational_status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Rated Power</span>
                      <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{charger.charging_power_kw} kW {charger.charging_power_kw > 22 ? 'DC Fast' : 'AC'}</span>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Tariff Rate</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{charger.price_per_kwh.toFixed(1)} / kWh</span>
                    </div>

                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                      {isSelected ? (
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle2 size={16} /> Selected Bay
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isOutOfService}
                          className="btn btn-outline btn-sm"
                        >
                          Select Bay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slot Matrix for Selected Charger */}
          {selectedCharger && (
            <div className="card" style={{ padding: '1.5rem', marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)' }}>
                  Slot Schedule for Bay {selectedCharger.charger_code}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Selected Date: {selectedDate}
                </span>
              </div>

              {loadingAvailability ? (
                <LoadingSpinner message="Refreshing real-time slot grid..." size="sm" />
              ) : activeChargerAvailability.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))',
                  gap: '0.5rem'
                }}>
                  {activeChargerAvailability.map((slot, idx) => {
                    const isSelected = selectedSlot?.start_time === slot.start_time;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        disabled={!slot.is_available}
                        style={{
                          padding: '0.5rem 0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected
                            ? '2px solid var(--primary)'
                            : '1px solid var(--border)',
                          backgroundColor: isSelected
                            ? 'var(--primary)'
                            : slot.is_reserved
                            ? '#FEF2F2'
                            : slot.is_past
                            ? '#F1F5F9'
                            : '#FFFFFF',
                          color: isSelected
                            ? '#FFFFFF'
                            : slot.is_reserved
                            ? 'var(--error)'
                            : slot.is_past
                            ? 'var(--text-muted)'
                            : 'var(--navy)',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: slot.is_available ? 'pointer' : 'not-allowed',
                          transition: 'var(--transition)',
                          textAlign: 'center'
                        }}
                        title={
                          slot.is_reserved ? 'Slot already reserved' :
                          slot.is_past ? 'Time has passed' : 'Click to select slot'
                        }
                      >
                        {slot.time_label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No available time slots generated for this date.
                </p>
              )}

              {/* Slot Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, border: '1px solid var(--border)', backgroundColor: '#FFFFFF' }} /> Available
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: 'var(--primary)' }} /> Selected
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }} /> Reserved
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#F1F5F9' }} /> Past
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BOOKING SUMMARY CARD */}
        <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '1.25rem' }}>
            Reservation Summary
          </h3>

          <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Date Selection */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Booking Date</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="form-input"
              />
            </div>

            {/* Duration Selector */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Charging Duration</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                className="form-select"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes</option>
                <option value={120}>120 Minutes (2 Hours)</option>
              </select>
            </div>

            {/* Estimated Energy Required */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Estimated Energy (kWh)</label>
              <input
                type="number"
                min="1"
                max="150"
                value={estimatedEnergy}
                onChange={(e) => setEstimatedEnergy(e.target.value)}
                placeholder="e.g. 30"
                className="form-input"
              />
            </div>

            {/* Selected Slot Information */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              fontSize: '0.875rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Selected Bay</span>
                <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  {selectedCharger ? `${selectedCharger.charger_code} (${selectedCharger.connector_type})` : 'None'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Slot Start</span>
                <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  {selectedSlot ? selectedSlot.time_label : 'Select a slot'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tariff Rate</span>
                <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                  ₹{selectedCharger ? selectedCharger.price_per_kwh.toFixed(1) : '0.0'} / kWh
                </span>
              </div>

              {estCost && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '0.65rem',
                  paddingTop: '0.65rem',
                  borderTop: '1px solid var(--border)',
                  fontWeight: 700
                }}>
                  <span style={{ color: 'var(--navy)' }}>Estimated Session Cost</span>
                  <span style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>₹{estCost}</span>
                </div>
              )}
            </div>

            {/* Error banner */}
            {bookingError && (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#FEE2E2',
                color: 'var(--error)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem'
              }}>
                {bookingError}
              </div>
            )}

            {/* Success feedback */}
            {bookingSuccess && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#166534',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                  <CheckCircle2 size={18} /> Booking Confirmed!
                </div>
                <p>
                  Reference: <strong>{bookingSuccess.booking_reference}</strong>
                </p>
                <Link to="/my-bookings" className="btn btn-primary btn-sm" style={{ marginTop: '0.25rem' }}>
                  View in My Bookings
                </Link>
              </div>
            )}

            {/* Submit button */}
            {!bookingSuccess && (
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              >
                {submitting ? 'Confirming Reservation...' : (
                  isAuthenticated ? 'Confirm & Reserve Slot' : 'Log In to Confirm Slot'
                )}
              </button>
            )}
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .station-booking-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
