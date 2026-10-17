import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminApi, stationApi } from '../../services/api';
import AdminNav from '../../components/admin/AdminNav';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminStationFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    latitude: '',
    longitude: '',
    opening_hours: '24/7',
    contact_phone: '',
    amenities: 'WiFi, Cafe, Restroom, 24/7 Security',
    is_active: true,
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      stationApi.getStation(id)
        .then((res) => {
          const st = res.data;
          setFormData({
            name: st.name || '',
            description: st.description || '',
            address: st.address || '',
            city: st.city || '',
            state: st.state || '',
            postal_code: st.postal_code || '',
            latitude: st.latitude !== null ? String(st.latitude) : '',
            longitude: st.longitude !== null ? String(st.longitude) : '',
            opening_hours: st.opening_hours || '24/7',
            contact_phone: st.contact_phone || '',
            amenities: Array.isArray(st.amenities) ? st.amenities.join(', ') : (st.amenities || ''),
            is_active: st.is_active !== undefined ? st.is_active : true,
          });
        })
        .catch((err) => {
          setError(err.message || 'Failed to load station');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.postal_code) {
      setError('Please fill in all required fields (Name, Address, City, State, Postal Code).');
      return;
    }

    // Latitude & longitude validation
    const lat = formData.latitude ? parseFloat(formData.latitude) : null;
    const lng = formData.longitude ? parseFloat(formData.longitude) : null;

    if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setError('Latitude must be a valid number between -90 and 90.');
      return;
    }
    if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
      setError('Longitude must be a valid number between -180 and 180.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      ...formData,
      latitude: lat,
      longitude: lng,
      amenities: formData.amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };

    try {
      if (isEdit) {
        await adminApi.updateStation(id, payload);
      } else {
        await adminApi.createStation(payload);
      }
      navigate('/admin/stations');
    } catch (err) {
      setError(err.message || 'Failed to save station.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading station data..." />;
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem', maxWidth: 760 }}>
      <Link
        to="/admin/stations"
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
        <ArrowLeft size={16} /> Back to Stations List
      </Link>

      <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '0.5rem' }}>
          {isEdit ? 'Edit Charging Station' : 'Create New Charging Station'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Specify location details, physical address, and driver amenities.
        </p>

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
            <label className="form-label">Station Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Indiranagar FastCharge Plaza"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the facility, landmarks, or special instructions..."
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address *</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="100 Feet Road, HAL 2nd Stage"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Bengaluru"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Karnataka"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Postal Code *</label>
              <input
                type="text"
                name="postal_code"
                required
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="560038"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Latitude (-90 to 90)</label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="12.9716"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Longitude (-180 to 180)</label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="77.5946"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Opening Hours</label>
              <input
                type="text"
                name="opening_hours"
                value={formData.opening_hours}
                onChange={handleChange}
                placeholder="24/7 or 06:00 - 23:00"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+91 80 1234 5678"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Amenities (Comma-separated)</label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="WiFi, Cafe, Restroom, 24/7 Security"
              className="form-input"
            />
          </div>

          <div style={{ margin: '1rem 0 1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
              />
              Station is Active and Available for Drivers
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Link to="/admin/stations" className="btn btn-outline btn-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? 'Saving Station...' : (isEdit ? 'Update Station' : 'Create Station')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
