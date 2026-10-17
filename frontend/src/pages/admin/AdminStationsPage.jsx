import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  Power,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { adminApi } from '../../services/api';
import AdminNav from '../../components/admin/AdminNav';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminStationsPage() {
  const [stations, setStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchStations = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await adminApi.getStations({
        q: searchQuery,
        status: statusFilter,
        limit: 50
      });
      setStations(res.data || []);
    } catch (err) {
      setActionError(err.message || 'Failed to fetch stations.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleToggleStatus = async (station) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await adminApi.toggleStationStatus(station.id, !station.is_active);
      setActionSuccess(`Station "${station.name}" status updated.`);
      fetchStations();
    } catch (err) {
      setActionError(err.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (station) => {
    if (!window.confirm(`Are you sure you want to delete station "${station.name}"? This action cannot be undone.`)) {
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    try {
      await adminApi.deleteStation(station.id);
      setActionSuccess(`Station "${station.name}" deleted.`);
      fetchStations();
    } catch (err) {
      setActionError(err.message || 'Cannot delete station.');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
            Station Infrastructure Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Configure charging hubs, location coordinates, and operational state.
          </p>
        </div>

        <Link to="/admin/stations/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Plus size={18} /> Add New Station
        </Link>
      </div>

      <AdminNav />

      {/* Action Notifications */}
      {actionSuccess && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {actionSuccess}
        </div>
      )}

      {actionError && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEE2E2', color: 'var(--error)', borderRadius: 'var(--radius)', marginBottom: '1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {actionError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'active', 'inactive'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`btn btn-sm ${statusFilter === filter ? 'btn-secondary' : 'btn-outline'}`}
              style={{ borderRadius: '9999px', textTransform: 'capitalize' }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '0 0.5rem',
          width: '100%',
          maxWidth: 340
        }}>
          <Search size={16} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search station or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', border: 'none', outline: 'none', padding: '0.5rem 0.6rem', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {/* Stations Table */}
      <div className="card" style={{ padding: '1rem', overflowX: 'auto' }}>
        {loading ? (
          <LoadingSpinner message="Loading stations..." />
        ) : stations.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Station Name</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>City / State</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Bays</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Tariff</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{st.name}</div>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{st.address}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    {st.city}, {st.state}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span className="badge badge-neutral">
                      {st.chargers?.length || 0} chargers
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>
                    from ₹{st.min_price_per_kwh?.toFixed(1) || '0.0'}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span className={`badge ${st.is_active ? 'badge-success' : 'badge-neutral'}`}>
                      {st.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Link
                        to={`/admin/stations/${st.id}/edit`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="Edit station"
                      >
                        <Edit2 size={14} /> Edit
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(st)}
                        className={`btn btn-sm ${st.is_active ? 'btn-outline' : 'btn-primary'}`}
                        style={{ padding: '0.35rem 0.6rem' }}
                        title={st.is_active ? 'Deactivate station' : 'Activate station'}
                      >
                        <Power size={14} /> {st.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(st)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="Delete station safely"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
            No stations found matching your query.
          </p>
        )}
      </div>
    </div>
  );
}
